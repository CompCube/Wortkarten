import { describe, expect, it } from "vitest";
import { judgeAnswer } from "./answer";
import type { LanguageProfile } from "./languages";

const de: LanguageProfile = {
  code: "de",
  hasArticles: true,
  articles: { der: "blue", die: "red", das: "green" },
  specialChars: ["ä", "ö", "ü", "ß"],
  answerFolding: { ä: "ae", ö: "oe", ü: "ue", ß: "ss" },
};

const ca: LanguageProfile = {
  code: "ca",
  hasArticles: false,
  specialChars: ["à", "è", "é", "í", "ò", "ó", "ú", "ç", "l·l"],
  answerFolding: {},
};

describe("judgeAnswer", () => {
  it("accepta una resposta idèntica", () => {
    expect(judgeAnswer("Mädchen", "Mädchen", de)).toEqual({
      ok: true,
      exact: true,
      caseMismatch: false,
    });
  });

  it("accepta ae per ä", () => {
    const result = judgeAnswer("Maedchen", "Mädchen", de);
    expect(result.ok).toBe(true);
    expect(result.exact).toBe(false);
    expect(result.caseMismatch).toBe(false);
  });

  it("accepta ss per ß", () => {
    expect(judgeAnswer("Strasse", "Straße", de).ok).toBe(true);
  });

  it("accepta però avisa si falten les majúscules", () => {
    const result = judgeAnswer("mädchen", "Mädchen", de);
    expect(result.ok).toBe(true);
    expect(result.exact).toBe(false);
    expect(result.caseMismatch).toBe(true);
  });

  it("avisa de majúscules també quan s'escriu amb ae", () => {
    const result = judgeAnswer("maedchen", "Mädchen", de);
    expect(result.ok).toBe(true);
    expect(result.caseMismatch).toBe(true);
  });

  it("no confon paraules diferents: schon i schön", () => {
    expect(judgeAnswer("schon", "schön", de).ok).toBe(false);
  });

  it("ignora espais als extrems i múltiples", () => {
    expect(judgeAnswer("  sich   erinnern ", "sich erinnern", de).ok).toBe(true);
  });

  it("tracta com a iguals formes Unicode compostes i descompostes", () => {
    expect(judgeAnswer("Mädchen", "Mädchen", de).exact).toBe(true);
  });

  it("rebutja una resposta buida", () => {
    expect(judgeAnswer("   ", "Mädchen", de).ok).toBe(false);
  });

  it("no plega accents si l'idioma no ho defineix", () => {
    expect(judgeAnswer("cafe", "cafè", ca).ok).toBe(false);
    expect(judgeAnswer("cafè", "cafè", ca).ok).toBe(true);
  });
});
