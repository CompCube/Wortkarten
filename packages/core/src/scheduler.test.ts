import { describe, expect, it } from "vitest";
import {
  isDue,
  newCardState,
  previewIntervals,
  reviewState,
  shouldActivateProduce,
} from "./scheduler";
import type { CardState } from "./schemas";

const t0 = "2026-10-26T10:00:00.000Z";

function graduate(state: CardState, start: string): { state: CardState; now: string } {
  let current = state;
  let now = start;
  for (let i = 0; i < 12 && current.state !== "review"; i++) {
    current = reviewState(current, "good", now);
    now = current.due;
  }
  return { state: current, now };
}

describe("newCardState", () => {
  it("crea un estat nou, pendent des d'ara, sense repasos", () => {
    const s = newCardState("richtung", "recognize", t0);
    expect(s).toMatchObject({
      cardId: "richtung",
      direction: "recognize",
      state: "new",
      reps: 0,
      lapses: 0,
      due: t0,
    });
  });
});

describe("isDue", () => {
  it("és pendent quan la data ja ha passat o és ara", () => {
    const s = newCardState("a", "recognize", t0);
    expect(isDue(s, t0)).toBe(true);
    expect(isDue(s, "2026-10-27T10:00:00.000Z")).toBe(true);
  });

  it("no és pendent si la data és futura", () => {
    const s = newCardState("a", "recognize", "2026-11-01T10:00:00.000Z");
    expect(isDue(s, t0)).toBe(false);
  });
});

describe("reviewState", () => {
  it("Bé a una targeta nova la posa en el futur i compta un repàs", () => {
    const s = reviewState(newCardState("a", "recognize", t0), "good", t0);
    expect(new Date(s.due).getTime()).toBeGreaterThan(new Date(t0).getTime());
    expect(s.reps).toBe(1);
    expect(s.lastReview).toBe(t0);
  });

  it("Fàcil no programa abans que Bé, ni Bé abans que Difícil", () => {
    const base = newCardState("a", "recognize", t0);
    const hard = new Date(reviewState(base, "hard", t0).due).getTime();
    const good = new Date(reviewState(base, "good", t0).due).getTime();
    const easy = new Date(reviewState(base, "easy", t0).due).getTime();
    expect(good).toBeGreaterThanOrEqual(hard);
    expect(easy).toBeGreaterThanOrEqual(good);
  });

  it("repetint Bé la targeta arriba a l'estat de repàs", () => {
    const { state } = graduate(newCardState("a", "recognize", t0), t0);
    expect(state.state).toBe("review");
  });

  it("De nou en una targeta de repàs suma una errada i la torna a aprendre", () => {
    const { state, now } = graduate(newCardState("a", "recognize", t0), t0);
    const lapsed = reviewState(state, "again", now);
    expect(lapsed.lapses).toBe(state.lapses + 1);
    expect(lapsed.state).toBe("relearning");
    expect(new Date(lapsed.due).getTime()).toBeGreaterThan(new Date(now).getTime());
  });

  it("no modifica l'estat d'entrada", () => {
    const before = newCardState("a", "recognize", t0);
    const copy = structuredClone(before);
    reviewState(before, "good", t0);
    expect(before).toEqual(copy);
  });

  it("l'estat és JSON pla: sobreviu a un viatge de ida i volta", () => {
    const s = reviewState(newCardState("a", "produce", t0), "good", t0);
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
  });
});

describe("previewIntervals", () => {
  it("dona una etiqueta no buida per als quatre botons", () => {
    const labels = previewIntervals(newCardState("a", "recognize", t0), t0);
    for (const rating of ["again", "hard", "good", "easy"] as const) {
      expect(labels[rating].length).toBeGreaterThan(0);
    }
  });
});

describe("shouldActivateProduce", () => {
  const base = newCardState("a", "recognize", t0);

  it("s'activa quan reconèixer és en repàs amb interval de 3 dies o més", () => {
    expect(shouldActivateProduce({ ...base, state: "review", scheduledDays: 3 })).toBe(true);
    expect(shouldActivateProduce({ ...base, state: "review", scheduledDays: 10 })).toBe(true);
  });

  it("no s'activa amb menys de 3 dies", () => {
    expect(shouldActivateProduce({ ...base, state: "review", scheduledDays: 2 })).toBe(false);
  });

  it("no s'activa mentre la targeta encara s'està aprenent", () => {
    expect(shouldActivateProduce({ ...base, state: "learning", scheduledDays: 5 })).toBe(false);
    expect(shouldActivateProduce({ ...base, state: "relearning", scheduledDays: 5 })).toBe(false);
  });

  it("només té sentit per a la direcció reconèixer", () => {
    const produce = { ...base, direction: "produce" as const, state: "review" as const, scheduledDays: 9 };
    expect(shouldActivateProduce(produce)).toBe(false);
  });
});
