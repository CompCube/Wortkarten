import {
  duplicateKey,
  type AddCardsResult,
  type Card,
  type CardFilter,
  type CardRepository,
  type CardState,
  type Deck,
  type Direction,
  type ReviewLog,
} from "@wortkarten/core";
import { openDB, type DBSchema, type IDBPDatabase } from "idb";

/** Targeta tal com es desa: amb la clau de duplicats calculada per poder indexar-la. */
type StoredCard = Card & { dupKey: string };

interface WortkartenDB extends DBSchema {
  decks: { key: string; value: Deck };
  cards: {
    key: string;
    value: StoredCard;
    indexes: { byDeck: string; byDupKey: string };
  };
  states: {
    key: [string, Direction];
    value: CardState;
    indexes: { byDue: string };
  };
  logs: {
    key: string;
    value: ReviewLog;
    indexes: { byDate: string };
  };
}

const DB_VERSION = 1;

function toCard(stored: StoredCard): Card {
  const { dupKey, ...card } = stored;
  void dupKey; // només serveix per indexar: no surt cap a fora
  return card;
}

function matches(card: Card, filter: CardFilter | undefined): boolean {
  if (!filter) return true;
  if (filter.deckId !== undefined && card.deckId !== filter.deckId) return false;
  if (filter.tags && filter.tags.length > 0 && !filter.tags.some((t) => card.tags.includes(t))) {
    return false;
  }
  if (filter.pos && filter.pos.length > 0 && !filter.pos.includes(card.pos)) return false;
  return true;
}

/**
 * Implementació local (al dispositiu) del repositori. Les dades no surten del
 * navegador. Quan hi hagi Supabase, aquesta classe es canvia per una altra que
 * passi els mateixos tests de contracte.
 */
class IdbCardRepository implements CardRepository {
  constructor(private readonly db: IDBPDatabase<WortkartenDB>) {}

  listDecks(): Promise<Deck[]> {
    return this.db.getAll("decks");
  }

  async putDeck(deck: Deck): Promise<void> {
    await this.db.put("decks", deck);
  }

  async listCards(filter?: CardFilter): Promise<Card[]> {
    const stored =
      filter?.deckId !== undefined
        ? await this.db.getAllFromIndex("cards", "byDeck", filter.deckId)
        : await this.db.getAll("cards");
    return stored.map(toCard).filter((card) => matches(card, filter));
  }

  async getCard(id: string): Promise<Card | undefined> {
    const stored = await this.db.get("cards", id);
    return stored ? toCard(stored) : undefined;
  }

  async addCards(cards: Card[]): Promise<AddCardsResult> {
    const result: AddCardsResult = { added: 0, duplicates: [] };
    const tx = this.db.transaction("cards", "readwrite");
    const byDupKey = tx.store.index("byDupKey");
    for (const card of cards) {
      const dupKey = duplicateKey(card.targetLang, card.term);
      const sameId = await tx.store.get(card.id);
      const sameTerm = await byDupKey.get(dupKey);
      if (sameId || sameTerm) {
        result.duplicates.push(card.id);
        continue;
      }
      await tx.store.add({ ...card, dupKey });
      result.added += 1;
    }
    await tx.done;
    return result;
  }

  async updateCard(card: Card): Promise<void> {
    const tx = this.db.transaction("cards", "readwrite");
    const previous = await tx.store.get(card.id);
    if (!previous) {
      await tx.done;
      throw new Error(`La targeta ${card.id} no existeix`);
    }
    const dupKey = duplicateKey(card.targetLang, card.term);
    const owner = await tx.store.index("byDupKey").get(dupKey);
    if (owner && owner.id !== card.id) {
      await tx.done;
      throw new Error(`El terme "${card.term}" ja és de la targeta ${owner.id}`);
    }
    await tx.store.put({ ...card, dupKey });
    await tx.done;
  }

  async deleteCard(id: string): Promise<void> {
    const tx = this.db.transaction(["cards", "states"], "readwrite");
    await tx.objectStore("cards").delete(id);
    await tx.objectStore("states").delete([id, "recognize"]);
    await tx.objectStore("states").delete([id, "produce"]);
    await tx.done;
  }

  async findDuplicate(targetLang: string, term: string): Promise<Card | undefined> {
    const stored = await this.db.getFromIndex(
      "cards",
      "byDupKey",
      duplicateKey(targetLang, term),
    );
    return stored ? toCard(stored) : undefined;
  }

  getState(cardId: string, direction: Direction): Promise<CardState | undefined> {
    return this.db.get("states", [cardId, direction]);
  }

  async putStates(states: CardState[]): Promise<void> {
    const tx = this.db.transaction("states", "readwrite");
    for (const state of states) await tx.store.put(state);
    await tx.done;
  }

  listStates(): Promise<CardState[]> {
    return this.db.getAll("states");
  }

  listDueStates(now: string, limit?: number): Promise<CardState[]> {
    // Les dates són ISO amb el mateix format: l'ordre alfabètic és el cronològic.
    return this.db.getAllFromIndex("states", "byDue", IDBKeyRange.upperBound(now), limit);
  }

  async appendReviewLog(log: ReviewLog): Promise<void> {
    const tx = this.db.transaction("logs", "readwrite");
    if (!(await tx.store.get(log.id))) await tx.store.add(log);
    await tx.done;
  }

  listReviewLogs(since?: string): Promise<ReviewLog[]> {
    return this.db.getAllFromIndex(
      "logs",
      "byDate",
      since === undefined ? undefined : IDBKeyRange.lowerBound(since),
    );
  }
}

export async function createIdbCardRepository(name = "wortkarten"): Promise<CardRepository> {
  const db = await openDB<WortkartenDB>(name, DB_VERSION, {
    upgrade(database) {
      database.createObjectStore("decks", { keyPath: "id" });

      const cards = database.createObjectStore("cards", { keyPath: "id" });
      cards.createIndex("byDeck", "deckId");
      cards.createIndex("byDupKey", "dupKey");

      const states = database.createObjectStore("states", { keyPath: ["cardId", "direction"] });
      states.createIndex("byDue", "due");

      const logs = database.createObjectStore("logs", { keyPath: "id" });
      logs.createIndex("byDate", "reviewedAt");
    },
  });
  return new IdbCardRepository(db);
}
