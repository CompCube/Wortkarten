import { describe, expect, it } from "vitest";
import { mapLegacyCards } from "./legacy";

const options = { targetLang: "de", baseLang: "ca", now: "2026-10-26T10:00:00.000Z" };

const richtung = {
  id: "richtung",
  cat: "Primera línia",
  img: "🧭",
  de: "Richtung",
  art: "die",
  pl: "die Richtungen",
  ca: "la direcció",
  en: "direction",
  ex: [["In welche Richtung geht der Bus?", "En quina direcció va el bus?", "Richtung"]],
  theme: "Descriure imatges",
  pos: "noun",
};

const benoetigen = {
  id: "benoetigen",
  cat: "Verbs útils",
  img: "🧰",
  de: "benötigen",
  extra: "benötigt",
  ca: "necessitar",
  ex: [["Ich benötige mehr Zeit.", "Necessito més temps.", "benötige"]],
  theme: "Tràmits i diners",
  pos: "verb",
};

describe("mapLegacyCards", () => {
  it("mapeja els camps de l'app original a l'esquema genèric", () => {
    const { cards } = mapLegacyCards([richtung], options);
    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      id: "richtung",
      term: "Richtung",
      article: "die",
      plural: "die Richtungen",
      translation: "la direcció",
      emoji: "🧭",
      pos: "noun",
      tags: ["Descriure imatges"],
      targetLang: "de",
      baseLang: "ca",
      source: "import",
      createdAt: options.now,
    });
    expect(cards[0]?.examples).toEqual([
      {
        sentence: "In welche Richtung geht der Bus?",
        translation: "En quina direcció va el bus?",
        cloze: "Richtung",
      },
    ]);
  });

  it("guarda la forma extra (p. ex. 3a persona) a forms", () => {
    const { cards } = mapLegacyCards([benoetigen], options);
    expect(cards[0]?.forms).toEqual(["benötigt"]);
    expect(cards[0]?.article).toBeUndefined();
  });

  it("agrupa les targetes en mazos segons la llista d'origen", () => {
    const { decks, cards } = mapLegacyCards([richtung, benoetigen], options);
    expect(decks.map((d) => d.title)).toEqual(["Primera línia", "Verbs útils"]);
    expect(decks[0]?.id).toBe("primera-linia");
    expect(cards[0]?.deckId).toBe("primera-linia");
    expect(cards[1]?.deckId).toBe("verbs-utils");
  });

  it("no repeteix un mazo si dues targetes comparteixen llista", () => {
    const second = { ...richtung, id: "weg", de: "Weg" };
    const { decks } = mapLegacyCards([richtung, second], options);
    expect(decks).toHaveLength(1);
  });

  it("no fusiona mazos diferents els títols dels quals donen el mateix id", () => {
    const cards = [
      { ...richtung, id: "a", de: "Aa", cat: "Café" },
      { ...richtung, id: "b", de: "Bb", cat: "Cafe" },
      { ...richtung, id: "c", de: "Cc", cat: undefined },
      { ...richtung, id: "d", de: "Dd", cat: "!!!" },
    ];
    const { decks, cards: mapped, skipped } = mapLegacyCards(cards, options);
    expect(skipped).toEqual([]);
    expect(mapped).toHaveLength(4);
    expect(decks).toHaveLength(4);
    expect(new Set(decks.map((d) => d.id)).size).toBe(4);
    const titleOf = (cardId: string) =>
      decks.find((d) => d.id === mapped.find((c) => c.id === cardId)?.deckId)?.title;
    expect(titleOf("a")).toBe("Café");
    expect(titleOf("b")).toBe("Cafe");
    expect(titleOf("c")).toBe("Importades");
    expect(titleOf("d")).toBe("!!!");
  });

  it("posa les targetes sense llista a un mazo per defecte", () => {
    const noCat = { ...richtung, cat: undefined };
    const { decks, cards } = mapLegacyCards([noCat], options);
    expect(decks[0]?.title).toBe("Importades");
    expect(cards[0]?.deckId).toBe(decks[0]?.id);
  });

  it("descarta els exemples amb un buit que no surt a la frase i manté la targeta", () => {
    const broken = {
      ...richtung,
      ex: [
        ["Ich gehe nach Hause.", "Vaig a casa.", "Wohnung"],
        ["In welche Richtung geht der Bus?", "En quina direcció va el bus?", "Richtung"],
      ],
    };
    const { cards, skipped } = mapLegacyCards([broken], options);
    expect(cards).toHaveLength(1);
    expect(cards[0]?.examples).toHaveLength(1);
    expect(skipped).toEqual([]);
  });

  it("omet les targetes invàlides i en diu l'índex i el motiu", () => {
    const noTerm = { ...richtung, de: undefined };
    const { cards, skipped } = mapLegacyCards([richtung, noTerm], options);
    expect(cards).toHaveLength(1);
    expect(skipped).toHaveLength(1);
    expect(skipped[0]?.index).toBe(1);
    expect(skipped[0]?.reason.length).toBeGreaterThan(0);
  });

  it("no peta amb una entrada que no és una llista", () => {
    expect(() => mapLegacyCards("no és una llista", options)).toThrow();
  });
});
