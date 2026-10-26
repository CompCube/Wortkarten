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
