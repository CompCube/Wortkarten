/**
 * Perfil d'idioma: tot el que canvia segons la llengua (articles, caràcters
 * especials, plegat de respostes) viu aquí com a dades. Al codi no hi ha res
 * específic de cap idioma. Més endavant aquests perfils sortiran de la taula
 * `language_profiles` de la base de dades.
 */
export interface LanguageProfile {
  code: string;
  hasArticles: boolean;
  /** Article -> rol de color (der blau, die vermell, das verd). */
  articles?: Record<string, string>;
  /** Caràcters que el teclat d'accents ha d'oferir. */
  specialChars: string[];
  /** Caràcter especial -> escriptura alternativa acceptada (ä -> ae). */
  answerFolding: Record<string, string>;
}

export const LANGUAGE_PROFILES: Record<string, LanguageProfile> = {
  de: {
    code: "de",
    hasArticles: true,
    articles: { der: "blue", die: "red", das: "green" },
    specialChars: ["ä", "ö", "ü", "ß"],
    answerFolding: { ä: "ae", ö: "oe", ü: "ue", ß: "ss" },
  },
  ca: {
    code: "ca",
    hasArticles: false,
    specialChars: ["à", "è", "é", "í", "ò", "ó", "ú", "ç", "l·l"],
    answerFolding: {},
  },
  es: {
    code: "es",
    hasArticles: false,
    specialChars: ["á", "é", "í", "ó", "ú", "ñ", "ü", "¿", "¡"],
    answerFolding: {},
  },
  en: {
    code: "en",
    hasArticles: false,
    specialChars: [],
    answerFolding: {},
  },
};

export function getLanguageProfile(code: string): LanguageProfile {
  const base = code.split("-")[0] ?? code;
  return (
    LANGUAGE_PROFILES[code] ??
    LANGUAGE_PROFILES[base] ?? {
      code,
      hasArticles: false,
      specialChars: [],
      answerFolding: {},
    }
  );
}
