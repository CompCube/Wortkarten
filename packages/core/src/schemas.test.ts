import { describe, expect, it } from "vitest";
import { cardSchema, deckSchema } from "./schemas";

const validCard = {
  id: "richtung",
  deckId: "primera-linia",
  targetLang: "de",
  baseLang: "ca",
  term: "Richtung",
  article: "die",
  plural: "die Richtungen",
  forms: [],
  pos: "noun",
  translation: "la direcció",
  emoji: "🧭",
  tags: ["Descriure imatges"],
  examples: [
    {
      sentence: "In welche Richtung geht der Bus?",
      translation: "En quina direcció va el bus?",
      cloze: "Richtung",
    },
  ],
  source: "import",
  createdAt: "2026-10-26T10:00:00.000Z",
};

describe("cardSchema", () => {
  it("accepta una targeta completa", () => {
    expect(cardSchema.safeParse(validCard).success).toBe(true);
  });

  it("accepta una targeta mínima sense article, plural ni exemples", () => {
    const minimal = { ...validCard, article: undefined, plural: undefined, emoji: undefined };
    const result = cardSchema.safeParse({ ...minimal, examples: [], tags: [] });
    expect(result.success).toBe(true);
  });

  it("rebutja un terme buit o només d'espais", () => {
    expect(cardSchema.safeParse({ ...validCard, term: "   " }).success).toBe(false);
  });

  it("rebutja un tipus de paraula desconegut", () => {
    expect(cardSchema.safeParse({ ...validCard, pos: "pronoun" }).success).toBe(false);
  });

  it("rebutja un exemple on el buit no és text literal de la frase", () => {
    const bad = {
      ...validCard,
      examples: [{ sentence: "Ich gehe nach Hause.", translation: "Vaig a casa.", cloze: "Wohnung" }],
    };
    expect(cardSchema.safeParse(bad).success).toBe(false);
  });

  it("rebutja una data de creació que no és ISO", () => {
    expect(cardSchema.safeParse({ ...validCard, createdAt: "ahir" }).success).toBe(false);
  });
});

describe("deckSchema", () => {
  it("accepta un mazo vàlid", () => {
    const deck = {
      id: "primera-linia",
      title: "Primera línia",
      targetLang: "de",
      baseLang: "ca",
      createdAt: "2026-10-26T10:00:00.000Z",
    };
    expect(deckSchema.safeParse(deck).success).toBe(true);
  });

  it("rebutja un títol buit", () => {
    const deck = {
      id: "x",
      title: "",
      targetLang: "de",
      baseLang: "ca",
      createdAt: "2026-10-26T10:00:00.000Z",
    };
    expect(deckSchema.safeParse(deck).success).toBe(false);
  });
});
