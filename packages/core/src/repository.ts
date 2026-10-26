import type { Card, CardState, Deck, Direction, Pos, ReviewLog } from "./schemas";
import { normalizeTerm } from "./terms";

export interface CardFilter {
  deckId?: string;
  /** N'hi ha prou que la targeta tingui un dels temes. Buit = tots. */
  tags?: string[];
  /** N'hi ha prou que la targeta sigui d'un dels tipus. Buit = tots. */
  pos?: Pos[];
}

export interface AddCardsResult {
  added: number;
  /** Ids de les targetes omeses perquè el seu id o el seu terme ja existien. */
  duplicates: string[];
}

/**
 * Clau de duplicats: idioma objectiu + terme normalitzat. És la mateixa regla
 * que l'índex únic `(owner_id, target_lang, lower(term))` de Postgres.
 */
export function duplicateKey(targetLang: string, term: string): string {
  return `${targetLang}\u0000${normalizeTerm(term)}`;
}

/**
 * Totes les escriptures validen amb Zod abans de desar i rebutgen (throw) si
 * alguna dada és invàlida; un lot invàlid no desa res. Els instants són sempre
 * canònics (`...mmmZ`) i els resultats van ordenats per id, comparant per
 * unitat de codi, perquè totes les implementacions retornin el mateix.
 *
 * Accés a les dades de l'app. Les pantalles només coneixen aquesta interfície:
 * ara hi ha una implementació a memòria i una a IndexedDB; Supabase serà la
 * tercera i haurà de passar els mateixos tests (`testing/repository-contract`).
 */
export interface CardRepository {
  listDecks(): Promise<Deck[]>;
  /** Desa el mazo; si ja existeix el mateix id, el substitueix. */
  putDeck(deck: Deck): Promise<void>;

  listCards(filter?: CardFilter): Promise<Card[]>;
  getCard(id: string): Promise<Card | undefined>;
  /** Afegeix les targetes noves i omet les duplicades (per id o per terme). */
  addCards(cards: Card[]): Promise<AddCardsResult>;
  /** Substitueix una targeta existent. Falla si l'id no existeix. */
  updateCard(card: Card): Promise<void>;
  /** Esborra la targeta i els seus estats de repàs. */
  deleteCard(id: string): Promise<void>;
  findDuplicate(targetLang: string, term: string): Promise<Card | undefined>;

  getState(cardId: string, direction: Direction): Promise<CardState | undefined>;
  putStates(states: CardState[]): Promise<void>;
  listStates(): Promise<CardState[]>;
  /** Estats pendents a `now`, del més antic al més nou. */
  listDueStates(now: string, limit?: number): Promise<CardState[]>;

  /** Idempotent per `id`. */
  appendReviewLog(log: ReviewLog): Promise<void>;
  /** Registres des de `since` (inclòs), per ordre cronològic. */
  listReviewLogs(since?: string): Promise<ReviewLog[]>;
}
