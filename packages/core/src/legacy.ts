import { z } from "zod";
import { cardSchema, deckSchema, type Card, type Deck } from "./schemas";

/** Format de l'app personal original (`docs/data/cards-jordi.json`). */
const legacyCardSchema = z.object({
  id: z.string(),
  cat: z.string().optional(),
  img: z.string().optional(),
  de: z.string(),
  art: z.string().optional(),
  pl: z.string().optional(),
  extra: z.string().optional(),
  ca: z.string(),
  theme: z.string().optional(),
  pos: z.string(),
  ex: z.array(z.array(z.string()).min(3)).default([]),
});

export interface LegacyImportOptions {
  targetLang: string;
  baseLang: string;
  /** Data ISO que es posa com a `createdAt` de mazos i targetes. */
  now: string;
}

export interface LegacyImportResult {
  decks: Deck[];
  cards: Card[];
  skipped: { index: number; reason: string }[];
}

const DEFAULT_DECK_TITLE = "Importades";

function slug(title: string): string {
  const value = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return value === "" ? "importades" : value;
}

function nonBlank(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Converteix les targetes de l'app original al format genèric. No peta per una
 * targeta dolenta: l'omet i en diu l'índex i el motiu. L'estat de repàs antic
 * (SM-2) no es conserva: les targetes comencen com a noves a FSRS.
 */
export function mapLegacyCards(input: unknown, options: LegacyImportOptions): LegacyImportResult {
  if (!Array.isArray(input)) {
    throw new TypeError("El fitxer d'importació ha de ser una llista de targetes");
  }

  const decks = new Map<string, Deck>();
  const cards: Card[] = [];
  const skipped: LegacyImportResult["skipped"] = [];

  input.forEach((raw: unknown, index) => {
    const legacy = legacyCardSchema.safeParse(raw);
    if (!legacy.success) {
      skipped.push({ index, reason: describe(legacy.error) });
      return;
    }
    const l = legacy.data;

    const deckTitle = nonBlank(l.cat) ?? DEFAULT_DECK_TITLE;
    const deckId = slug(deckTitle);

    const examples = l.ex
      .map(([sentence = "", translation = "", cloze = ""]) => ({
        sentence: sentence.trim(),
        translation: translation.trim(),
        cloze: cloze.trim(),
      }))
      .filter((e) => e.sentence && e.translation && e.cloze && e.sentence.includes(e.cloze));

    const article = nonBlank(l.art);
    const plural = nonBlank(l.pl);
    const emoji = nonBlank(l.img);
    const extra = nonBlank(l.extra);
    const theme = nonBlank(l.theme);

    const card = cardSchema.safeParse({
      id: l.id,
      deckId,
      targetLang: options.targetLang,
      baseLang: options.baseLang,
      term: l.de,
      ...(article ? { article } : {}),
      ...(plural ? { plural } : {}),
      forms: extra ? [extra] : [],
      pos: l.pos,
      translation: l.ca,
      ...(emoji ? { emoji } : {}),
      tags: theme ? [theme] : [],
      examples,
      source: "import",
      createdAt: options.now,
    });
    if (!card.success) {
      skipped.push({ index, reason: describe(card.error) });
      return;
    }

    cards.push(card.data);
    if (!decks.has(deckId)) {
      decks.set(
        deckId,
        deckSchema.parse({
          id: deckId,
          title: deckTitle,
          targetLang: options.targetLang,
          baseLang: options.baseLang,
          createdAt: options.now,
        }),
      );
    }
  });

  return { decks: [...decks.values()], cards, skipped };
}

function describe(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "targeta invàlida";
  const path = issue.path.join(".");
  return path ? `${path}: ${issue.message}` : issue.message;
}
