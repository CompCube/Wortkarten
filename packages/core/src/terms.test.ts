import { describe, expect, it } from "vitest";
import { normalizeTerm } from "./terms";

describe("normalizeTerm", () => {
  it("passa a minúscules", () => {
    expect(normalizeTerm("Richtung")).toBe("richtung");
  });

  it("treu espais als extrems i col·lapsa els interns", () => {
    expect(normalizeTerm("  sich   erinnern  ")).toBe("sich erinnern");
  });

  it("unifica la forma Unicode (NFC) perquè ä compost i descompost coincideixin", () => {
    const decomposed = "Mädchen";
    const composed = "Mädchen";
    expect(normalizeTerm(decomposed)).toBe(normalizeTerm(composed));
  });

  it("no tradueix ni plega accents: ä i a són termes diferents", () => {
    expect(normalizeTerm("schon")).not.toBe(normalizeTerm("schön"));
  });

  it("retorna cadena buida si només hi ha espais", () => {
    expect(normalizeTerm("   ")).toBe("");
  });
});
