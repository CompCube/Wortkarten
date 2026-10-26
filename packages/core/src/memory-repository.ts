import {
  duplicateKey,
  type AddCardsResult,
  type CardFilter,
  type CardRepository,
  type ReviewLog,
} from "./repository";
import type { CardState, Direction } from "./scheduler";
import type { Card, Deck } from "./schemas";

function stateKey(cardId: string, direction: Direction): string {
  return `${cardId}\u0000${direction}`;
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
    return structuredClone([...this.decks.values()]);
  }

  async putDeck(deck: Deck): Promise<void> {
    this.decks.set(deck.id, structuredClone(deck));
  }

  async listCards(filter?: CardFilter): Promise<Card[]> {
    return structuredClone([...this.cards.values()].filter((c) => matches(c, filter)));
  }

  async getCard(id: string): Promise<Card | undefined> {
    const card = this.cards.get(id);
    return card ? structuredClone(card) : undefined;
  }

  async addCards(cards: Card[]): Promise<AddCardsResult> {
    const result: AddCardsResult = { added: 0, duplicates: [] };
    for (const card of cards) {
      const key = duplicateKey(card.targetLang, card.term);
      if (this.cards.has(card.id) || this.keys.has(key)) {
        result.duplicates.push(card.id);
        continue;
      }
      this.cards.set(card.id, structuredClone(card));
      this.keys.set(key, card.id);
      result.added += 1;
    }
    return result;
  }

  async updateCard(card: Card): Promise<void> {
    const previous = this.cards.get(card.id);
    if (!previous) throw new Error(`La targeta ${card.id} no existeix`);
    const key = duplicateKey(card.targetLang, card.term);
    const owner = this.keys.get(key);
    if (owner !== undefined && owner !== card.id) {
      throw new Error(`El terme "${card.term}" ja és de la targeta ${owner}`);
    }
    this.keys.delete(duplicateKey(previous.targetLang, previous.term));
    this.cards.set(card.id, structuredClone(card));
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
    for (const state of states) {
      this.states.set(stateKey(state.cardId, state.direction), structuredClone(state));
    }
  }

  async listStates(): Promise<CardState[]> {
    return structuredClone([...this.states.values()]);
  }

  async listDueStates(now: string, limit?: number): Promise<CardState[]> {
    const limitMs = new Date(now).getTime();
    const due = [...this.states.values()]
      .filter((s) => new Date(s.due).getTime() <= limitMs)
      .sort((a, b) => a.due.localeCompare(b.due) || a.cardId.localeCompare(b.cardId));
    return structuredClone(limit === undefined ? due : due.slice(0, limit));
  }

  async appendReviewLog(log: ReviewLog): Promise<void> {
    if (!this.logs.has(log.id)) this.logs.set(log.id, structuredClone(log));
  }

  async listReviewLogs(since?: string): Promise<ReviewLog[]> {
    const sinceMs = since === undefined ? -Infinity : new Date(since).getTime();
    const logs = [...this.logs.values()]
      .filter((l) => new Date(l.reviewedAt).getTime() >= sinceMs)
      .sort((a, b) => a.reviewedAt.localeCompare(b.reviewedAt));
    return structuredClone(logs);
  }
}
