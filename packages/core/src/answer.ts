import type { LanguageProfile } from "./languages";

export interface AnswerVerdict {
  /** La resposta es dona per bona (amb plegat de caràcters i majúscules tolerades). */
  ok: boolean;
  /** Idèntica a l'esperada, un cop normalitzats els espais i l'Unicode. */
  exact: boolean;
  /** Es dona per bona però difereix en majúscules (p. ex. substantius alemanys). */
  caseMismatch: boolean;
}

function clean(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/g, " ");
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Substitueix els caràcters especials pel seu equivalent escrit (ä -> ae). */
function fold(value: string, profile: LanguageProfile): string {
  let out = value;
  for (const [char, alternative] of Object.entries(profile.answerFolding)) {
    out = out.replaceAll(char, alternative);
    const upper = char.toUpperCase();
    if (upper.length === 1 && upper !== char) {
      out = out.replaceAll(upper, capitalize(alternative));
    }
  }
  return out;
}

export function judgeAnswer(
  input: string,
  expected: string,
  profile: LanguageProfile,
): AnswerVerdict {
  const given = clean(input);
  const wanted = clean(expected);

  if (given === "") return { ok: false, exact: false, caseMismatch: false };
  if (given === wanted) return { ok: true, exact: true, caseMismatch: false };

  const foldedGiven = fold(given, profile);
  const foldedWanted = fold(wanted, profile);
  if (foldedGiven === foldedWanted) return { ok: true, exact: false, caseMismatch: false };
  if (foldedGiven.toLowerCase() === foldedWanted.toLowerCase()) {
    return { ok: true, exact: false, caseMismatch: true };
  }
  return { ok: false, exact: false, caseMismatch: false };
}
