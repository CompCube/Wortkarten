import {
  duplicateKey,
  type AddCardsResult,
  type CardFilter,
  type CardRepository,
} from "./repository";
import {
  cardSchema,
  cardStateSchema,
  deckSchema,
  reviewLogSchema,
  type Card,
  type CardState,
  type Deck,
  type Direction,
  type ReviewLog,
} from "./schemas";

function stateKey(cardId: string, direction: Direction): string {
  return `${cardId}\u0000${direction}`;
}

/** Comparació per unitat de codi, com la d'IndexedDB (no la de localeCompare). */
function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareStates(a: CardState, b: CardState): number {
  return compare(a.cardId, b.cardId) || compare(a.direction, b.direction);
}

/** Qualsevol instant vàlid, escrit en la forma canònica que desem. */
function canonical(instant: string): string {
  return new Date(instant).toISOString();
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

/** Implementació a memòria: per a tests i com a referència del contracte. */
export class InMemoryCardRepository implements CardRepository {
  private readonly decks = new Map<string, Deck>();
  private readonly cards = new Map<string, Card>();
  /** Clau de duplicats -> id de la targeta. */
  private readonly keys = new Map<string, string>();
  private readonly states = new Map<string, CardState>();
  private readonly logs = new Map<string, ReviewLog>();

  async listDecks(): Promise<Deck[]> {
    return structuredClone([...this.decks.values()].sort((a, b) => compare(a.id, b.id)));
  }

  async putDeck(deck: Deck): Promise<void> {
    const parsed = deckSchema.parse(deck);
    this.decks.set(parsed.id, parsed);
  }

  async listCards(filter?: CardFilter): Promise<Card[]> {
    const found = [...this.cards.values()]
      .filter((c) => matches(c, filter))
      .sort((a, b) => compare(a.id, b.id));
    return structuredClone(found);
  }

  async getCard(id: string): Promise<Card | undefined> {
    const card = this.cards.get(id);
    return card ? structuredClone(card) : undefined;
  }

  async addCards(cards: Card[]): Promise<AddCardsResult> {
    // Es valida tot el lot abans d'escriure: un lot invàlid no desa res.
    const parsed = cards.map((card) => cardSchema.parse(card));
    const result: AddCardsResult = { added: 0, duplicates: [] };
    for (const card of parsed) {
      const key = duplicateKey(card.targetLang, card.term);
      if (this.cards.has(card.id) || this.keys.has(key)) {
        result.duplicates.push(card.id);
        continue;
      }
      this.cards.set(card.id, card);
      this.keys.set(key, card.id);
      result.added += 1;
    }
    return result;
  }

  async updateCard(input: Card): Promise<void> {
    const card = cardSchema.parse(input);
    const previous = this.cards.get(card.id);
    if (!previous) throw new Error(`La targeta ${card.id} no existeix`);
    const key = duplicateKey(card.targetLang, card.term);
    const owner = this.keys.get(key);
    if (owner !== undefined && owner !== card.id) {
      throw new Error(`El terme "${card.term}" ja és de la targeta ${owner}`);
    }
    this.keys.delete(duplicateKey(previous.targetLang, previous.term));
    this.cards.set(card.id, card);
    this.keys.set(key, card.id);
  }

  async deleteCard(id: string): Promise<void> {
    const card = this.cards.get(id);
    if (!card) return;
    this.cards.delete(id);
    this.keys.delete(duplicateKey(card.targetLang, card.term));
    this.states.delete(stateKey(id, "recognize"));
    this.states.delete(stateKey(id, "produce"));
  }

  async findDuplicate(targetLang: string, term: string): Promise<Card | undefined> {
    const id = this.keys.get(duplicateKey(targetLang, term));
    return id ? this.getCard(id) : undefined;
  }

  async getState(cardId: string, direction: Direction): Promise<CardState | undefined> {
    const state = this.states.get(stateKey(cardId, direction));
    return state ? structuredClone(state) : undefined;
  }

  async putStates(states: CardState[]): Promise<void> {
    const parsed = states.map((state) => cardStateSchema.parse(state));
    for (const state of parsed) this.states.set(stateKey(state.cardId, state.direction), state);
  }

  async listStates(): Promise<CardState[]> {
    return structuredClone([...this.states.values()].sort(compareStates));
  }

  async listDueStates(now: string, limit?: number): Promise<CardState[]> {
    if (limit !== undefined && limit <= 0) return [];
    const nowIso = canonical(now);
    const due = [...this.states.values()]
      .filter((s) => s.due <= nowIso)
      .sort((a, b) => compare(a.due, b.due) || compareStates(a, b));
    return structuredClone(limit === undefined ? due : due.slice(0, limit));
  }

  async appendReviewLog(log: ReviewLog): Promise<void> {
    const parsed = reviewLogSchema.parse(log);
    if (!this.logs.has(parsed.id)) this.logs.set(parsed.id, parsed);
  }

  async listReviewLogs(since?: string): Promise<ReviewLog[]> {
    const sinceIso = since === undefined ? undefined : canonical(since);
    const logs = [...this.logs.values()]
      .filter((l) => sinceIso === undefined || l.reviewedAt >= sinceIso)
      .sort((a, b) => compare(a.reviewedAt, b.reviewedAt) || compare(a.id, b.id));
    return structuredClone(logs);
  }
}
