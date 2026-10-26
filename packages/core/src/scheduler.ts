import { Rating, State, createEmptyCard, fsrs, type Card as FsrsCard, type Grade } from "ts-fsrs";

export type Direction = "recognize" | "produce";
export type ReviewRating = "again" | "hard" | "good" | "easy";
export type SchedulingState = "new" | "learning" | "review" | "relearning";

/**
 * Estat de repetició espaiada d'una targeta en una direcció. Només JSON pla
 * (dates en ISO) perquè es pugui desar tal qual a IndexedDB i a Postgres.
 */
export interface CardState {
  cardId: string;
  direction: Direction;
  due: string;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  learningSteps: number;
  reps: number;
  lapses: number;
  state: SchedulingState;
  lastReview?: string;
}

/** Interval mínim, en dies, perquè s'activi la direcció "produir". */
const PRODUCE_ACTIVATION_DAYS = 3;

const scheduler = fsrs();

const GRADES: Record<ReviewRating, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

const STATE_TO_FSRS: Record<SchedulingState, State> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
};

const STATE_FROM_FSRS: Record<State, SchedulingState> = {
  [State.New]: "new",
  [State.Learning]: "learning",
  [State.Review]: "review",
  [State.Relearning]: "relearning",
};

function toFsrs(s: CardState): FsrsCard {
  return {
    due: new Date(s.due),
    stability: s.stability,
    difficulty: s.difficulty,
    elapsed_days: s.elapsedDays,
    scheduled_days: s.scheduledDays,
    learning_steps: s.learningSteps,
    reps: s.reps,
    lapses: s.lapses,
    state: STATE_TO_FSRS[s.state],
    ...(s.lastReview ? { last_review: new Date(s.lastReview) } : {}),
  };
}

function fromFsrs(cardId: string, direction: Direction, card: FsrsCard): CardState {
  return {
    cardId,
    direction,
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: STATE_FROM_FSRS[card.state],
    ...(card.last_review ? { lastReview: card.last_review.toISOString() } : {}),
  };
}

export function newCardState(cardId: string, direction: Direction, now: string): CardState {
  return fromFsrs(cardId, direction, createEmptyCard(new Date(now)));
}

export function isDue(state: CardState, now: string): boolean {
  return new Date(state.due).getTime() <= new Date(now).getTime();
}

export function reviewState(state: CardState, rating: ReviewRating, now: string): CardState {
  const { card } = scheduler.next(toFsrs(state), new Date(now), GRADES[rating]);
  return fromFsrs(state.cardId, state.direction, card);
}

/** Etiqueta curta del temps que falta, p. ex. "10 min" o "3 d". */
function formatInterval(milliseconds: number): string {
  const minutes = Math.max(1, Math.round(milliseconds / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} mes`;
  return `${Math.round(days / 365)} any`;
}

/** Quan tornarà la targeta amb cadascun dels quatre botons. */
export function previewIntervals(state: CardState, now: string): Record<ReviewRating, string> {
  const at = new Date(now);
  const preview = scheduler.repeat(toFsrs(state), at);
  const label = (grade: Grade) =>
    formatInterval(preview[grade].card.due.getTime() - at.getTime());
  return {
    again: label(Rating.Again),
    hard: label(Rating.Hard),
    good: label(Rating.Good),
    easy: label(Rating.Easy),
  };
}

/**
 * "Produir" (base -> objectiu) s'activa quan "reconèixer" ja és a l'estat de
 * repàs amb un interval de 3 dies o més.
 */
export function shouldActivateProduce(recognize: CardState): boolean {
  return (
    recognize.direction === "recognize" &&
    recognize.state === "review" &&
    recognize.scheduledDays >= PRODUCE_ACTIVATION_DAYS
  );
}
