import { z } from "zod";

const text = z.string().trim().min(1);

export const posSchema = z.enum(["noun", "verb", "adj", "adv", "phrase"]);
export type Pos = z.infer<typeof posSchema>;

export const sourceSchema = z.enum(["photo", "text", "manual", "import"]);

/**
 * `cloze` ha de ser text literal de la frase: si no ho és, l'exemple no es
 * pot convertir en un buit i es descarta (regla del disseny per a la sortida
 * de la IA i per a les importacions).
 */
export const exampleSchema = z
  .object({
    sentence: text,
    translation: text,
    cloze: text,
  })
  .refine((e) => e.sentence.includes(e.cloze), {
    message: "cloze ha de ser text literal de la frase",
    path: ["cloze"],
  });
export type Example = z.infer<typeof exampleSchema>;

export const cardSchema = z.object({
  id: text,
  deckId: text,
  targetLang: text,
  baseLang: text,
  term: text,
  article: text.optional(),
  plural: text.optional(),
  forms: z.array(text),
  pos: posSchema,
  translation: text,
  note: text.optional(),
  emoji: text.optional(),
  tags: z.array(text),
  examples: z.array(exampleSchema),
  source: sourceSchema,
  createdAt: z.iso.datetime(),
});
export type Card = z.infer<typeof cardSchema>;

export const deckSchema = z.object({
  id: text,
  title: text,
  targetLang: text,
  baseLang: text,
  createdAt: z.iso.datetime(),
});
export type Deck = z.infer<typeof deckSchema>;

/**
 * Instant canònic: sempre `AAAA-MM-DDTHH:MM:SS.mmmZ`. Amb aquest format
 * l'ordre alfabètic és el cronològic, i IndexedDB i Postgres ordenen igual.
 */
const instant = z.iso.datetime({ precision: 3 });

export const directionSchema = z.enum(["recognize", "produce"]);
export type Direction = z.infer<typeof directionSchema>;

export const schedulingStateSchema = z.enum(["new", "learning", "review", "relearning"]);
export type SchedulingState = z.infer<typeof schedulingStateSchema>;

export const ratingSchema = z.enum(["again", "hard", "good", "easy"]);
export type ReviewRating = z.infer<typeof ratingSchema>;

export const studyModeSchema = z.enum(["review", "free", "cloze"]);
export type StudyMode = z.infer<typeof studyModeSchema>;

const count = z.number().int().nonnegative();

/**
 * Estat de repetició espaiada d'una targeta en una direcció. Només JSON pla
 * (dates en ISO) perquè es pugui desar tal qual a IndexedDB i a Postgres.
 */
export const cardStateSchema = z.object({
  cardId: text,
  direction: directionSchema,
  due: instant,
  stability: z.number().finite().nonnegative(),
  difficulty: z.number().finite().nonnegative(),
  elapsedDays: z.number().finite(),
  scheduledDays: z.number().finite().nonnegative(),
  learningSteps: count,
  reps: count,
  lapses: count,
  state: schedulingStateSchema,
  lastReview: instant.optional(),
});
export type CardState = z.infer<typeof cardStateSchema>;

/** Un repàs concret. L'`id` el genera el client, així reenviar-lo és segur. */
export const reviewLogSchema = z.object({
  id: text,
  cardId: text,
  direction: directionSchema,
  mode: studyModeSchema,
  rating: ratingSchema,
  reviewedAt: instant,
  durationMs: count,
});
export type ReviewLog = z.infer<typeof reviewLogSchema>;
