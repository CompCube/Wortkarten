import { beforeEach, describe, expect, it } from "vitest";
import type { CardRepository, ReviewLog } from "../repository";
import { newCardState, reviewState } from "../scheduler";
import type { Card, Deck } from "../schemas";

const NOW = "2026-10-26T10:00:00.000Z";

export function makeDeck(overrides: Partial<Deck> = {}): Deck {
  return {
    id: "deck-1",
    title: "Primera línia",
    targetLang: "de",
    baseLang: "ca",
    createdAt: NOW,
    ...overrides,
  };
}

export function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: "richtung",
    deckId: "deck-1",
    targetLang: "de",
    baseLang: "ca",
    term: "Richtung",
    article: "die",
    plural: "die Richtungen",
    forms: [],
    pos: "noun",
    translation: "la direcció",
    tags: ["Descriure imatges"],
    examples: [
      {
        sentence: "In welche Richtung geht der Bus?",
        translation: "En quina direcció va el bus?",
        cloze: "Richtung",
      },
    ],
    source: "import",
    createdAt: NOW,
    ...overrides,
  };
}

function makeLog(overrides: Partial<ReviewLog> = {}): ReviewLog {
  return {
    id: "log-1",
    cardId: "richtung",
    direction: "recognize",
    mode: "review",
    rating: "good",
    reviewedAt: NOW,
    durationMs: 2300,
    ...overrides,
  };
}

/**
 * Tests que ha de passar qualsevol implementació de `CardRepository`
 * (memòria, IndexedDB i, més endavant, Supabase).
 */
export function describeCardRepository(label: string, create: () => Promise<CardRepository>) {
  describe(`CardRepository: ${label}`, () => {
    let repo: CardRepository;

    beforeEach(async () => {
      repo = await create();
    });

    describe("mazos", () => {
      it("comença buit", async () => {
        expect(await repo.listDecks()).toEqual([]);
      });

      it("desa i llista mazos", async () => {
        await repo.putDeck(makeDeck());
        await repo.putDeck(makeDeck({ id: "deck-2", title: "Verbs útils" }));
        const titles = (await repo.listDecks()).map((d) => d.title).sort();
        expect(titles).toEqual(["Primera línia", "Verbs útils"]);
      });

      it("desar un mazo amb el mateix id el substitueix", async () => {
        await repo.putDeck(makeDeck());
        await repo.putDeck(makeDeck({ title: "Canviat" }));
        const decks = await repo.listDecks();
        expect(decks).toHaveLength(1);
        expect(decks[0]?.title).toBe("Canviat");
      });
    });

    describe("targetes", () => {
      it("afegeix una targeta i la torna a trobar", async () => {
        const result = await repo.addCards([makeCard()]);
        expect(result).toEqual({ added: 1, duplicates: [] });
        expect(await repo.getCard("richtung")).toEqual(makeCard());
        expect(await repo.listCards()).toHaveLength(1);
      });

      it("torna undefined si la targeta no existeix", async () => {
        expect(await repo.getCard("no-hi-es")).toBeUndefined();
      });

      it("omet com a duplicada una targeta amb el mateix terme, ignorant majúscules i espais", async () => {
        await repo.addCards([makeCard()]);
        const result = await repo.addCards([makeCard({ id: "altre", term: "  richtung " })]);
        expect(result).toEqual({ added: 0, duplicates: ["altre"] });
        expect(await repo.listCards()).toHaveLength(1);
        expect(await repo.getCard("altre")).toBeUndefined();
      });

      it("permet el mateix terme en un altre idioma objectiu", async () => {
        await repo.addCards([makeCard()]);
        const result = await repo.addCards([makeCard({ id: "en-richtung", targetLang: "en" })]);
        expect(result.added).toBe(1);
      });

      it("omet una targeta amb un id que ja existeix", async () => {
        await repo.addCards([makeCard()]);
        const result = await repo.addCards([makeCard({ term: "Weg" })]);
        expect(result).toEqual({ added: 0, duplicates: ["richtung"] });
        expect((await repo.getCard("richtung"))?.term).toBe("Richtung");
      });

      it("detecta duplicats dins del mateix lot", async () => {
        const result = await repo.addCards([
          makeCard(),
          makeCard({ id: "segona", term: "RICHTUNG" }),
        ]);
        expect(result).toEqual({ added: 1, duplicates: ["segona"] });
      });

      it("findDuplicate troba la targeta existent i no troba la inexistent", async () => {
        await repo.addCards([makeCard()]);
        expect((await repo.findDuplicate("de", " RICHTUNG"))?.id).toBe("richtung");
        expect(await repo.findDuplicate("de", "Weg")).toBeUndefined();
        expect(await repo.findDuplicate("en", "Richtung")).toBeUndefined();
      });

      it("updateCard substitueix els camps de la targeta", async () => {
        await repo.addCards([makeCard()]);
        await repo.updateCard(makeCard({ translation: "el sentit" }));
        expect((await repo.getCard("richtung"))?.translation).toBe("el sentit");
      });

      it("updateCard falla si la targeta no existeix", async () => {
        await expect(repo.updateCard(makeCard())).rejects.toThrow();
      });

      it("updateCard falla si el nou terme ja és d'una altra targeta i no canvia res", async () => {
        await repo.addCards([makeCard(), makeCard({ id: "weg", term: "Weg" })]);
        await expect(repo.updateCard(makeCard({ id: "weg", term: "richtung" }))).rejects.toThrow();
        expect((await repo.getCard("weg"))?.term).toBe("Weg");
        expect((await repo.findDuplicate("de", "Weg"))?.id).toBe("weg");
      });

      it("deleteCard esborra la targeta i els seus estats de repàs", async () => {
        await repo.addCards([makeCard()]);
        await repo.putStates([newCardState("richtung", "recognize", NOW)]);
        await repo.deleteCard("richtung");
        expect(await repo.getCard("richtung")).toBeUndefined();
        expect(await repo.getState("richtung", "recognize")).toBeUndefined();
      });

      it("no comparteix referències amb l'objecte que retorna", async () => {
        await repo.addCards([makeCard()]);
        const first = await repo.getCard("richtung");
        first?.tags.push("modificat");
        expect((await repo.getCard("richtung"))?.tags).toEqual(["Descriure imatges"]);
      });
    });

    describe("filtres de listCards", () => {
      beforeEach(async () => {
        await repo.addCards([
          makeCard(),
          makeCard({
            id: "gehen",
            term: "gehen",
            pos: "verb",
            deckId: "deck-2",
            tags: ["Verbs útils", "Moviment"],
          }),
          makeCard({ id: "schnell", term: "schnell", pos: "adj", tags: [] }),
        ]);
      });

      it("per mazo", async () => {
        const ids = (await repo.listCards({ deckId: "deck-2" })).map((c) => c.id);
        expect(ids).toEqual(["gehen"]);
      });

      it("per tema: n'hi ha prou que en tingui un dels triats", async () => {
        const ids = (await repo.listCards({ tags: ["Moviment", "Descriure imatges"] }))
          .map((c) => c.id)
          .sort();
        expect(ids).toEqual(["gehen", "richtung"]);
      });

      it("per tipus de paraula", async () => {
        const ids = (await repo.listCards({ pos: ["verb", "adj"] })).map((c) => c.id).sort();
        expect(ids).toEqual(["gehen", "schnell"]);
      });

      it("sense filtres, o amb llistes buides, torna totes", async () => {
        expect(await repo.listCards()).toHaveLength(3);
        expect(await repo.listCards({ tags: [], pos: [] })).toHaveLength(3);
      });

      it("combina els filtres", async () => {
        const ids = (await repo.listCards({ deckId: "deck-1", pos: ["noun"] })).map((c) => c.id);
        expect(ids).toEqual(["richtung"]);
      });
    });

    describe("estats de repàs", () => {
      it("desa i recupera un estat per targeta i direcció", async () => {
        const recognize = newCardState("richtung", "recognize", NOW);
        const produce = newCardState("richtung", "produce", NOW);
        await repo.putStates([recognize, produce]);
        expect(await repo.getState("richtung", "recognize")).toEqual(recognize);
        expect(await repo.getState("richtung", "produce")).toEqual(produce);
        expect(await repo.getState("altra", "recognize")).toBeUndefined();
      });

      it("desar un estat existent el substitueix", async () => {
        const first = newCardState("richtung", "recognize", NOW);
        await repo.putStates([first]);
        const reviewed = reviewState(first, "good", NOW);
        await repo.putStates([reviewed]);
        expect(await repo.getState("richtung", "recognize")).toEqual(reviewed);
        expect(await repo.listStates()).toHaveLength(1);
      });

      it("listDueStates torna només els pendents, de més antic a més nou", async () => {
        await repo.putStates([
          newCardState("c", "recognize", "2026-10-28T10:00:00.000Z"),
          newCardState("a", "recognize", "2026-10-24T10:00:00.000Z"),
          newCardState("b", "recognize", "2026-10-25T10:00:00.000Z"),
        ]);
        const due = await repo.listDueStates(NOW);
        expect(due.map((s) => s.cardId)).toEqual(["a", "b"]);
      });

      it("listDueStates respecta el límit", async () => {
        await repo.putStates([
          newCardState("a", "recognize", "2026-10-24T10:00:00.000Z"),
          newCardState("b", "recognize", "2026-10-25T10:00:00.000Z"),
          newCardState("c", "recognize", "2026-10-26T09:00:00.000Z"),
        ]);
        const due = await repo.listDueStates(NOW, 2);
        expect(due.map((s) => s.cardId)).toEqual(["a", "b"]);
      });
    });

    describe("registre de repasos", () => {
      it("desa els registres i els llista", async () => {
        await repo.appendReviewLog(makeLog());
        await repo.appendReviewLog(makeLog({ id: "log-2", reviewedAt: "2026-10-27T10:00:00.000Z" }));
        expect(await repo.listReviewLogs()).toHaveLength(2);
      });

      it("és idempotent per id: reenviar el mateix registre no el duplica", async () => {
        await repo.appendReviewLog(makeLog());
        await repo.appendReviewLog(makeLog());
        expect(await repo.listReviewLogs()).toHaveLength(1);
      });

      it("filtra per data d'inici", async () => {
        await repo.appendReviewLog(makeLog({ id: "vell", reviewedAt: "2026-10-20T10:00:00.000Z" }));
        await repo.appendReviewLog(makeLog({ id: "nou", reviewedAt: "2026-10-26T10:00:00.000Z" }));
        const ids = (await repo.listReviewLogs("2026-10-25T00:00:00.000Z")).map((l) => l.id);
        expect(ids).toEqual(["nou"]);
      });
    });
  });
}
