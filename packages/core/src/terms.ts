/**
 * Forma canònica d'un terme per detectar duplicats. Ha de coincidir amb
 * l'índex únic `(owner_id, target_lang, lower(term))` de la base de dades.
 * No plega accents: "schon" i "schön" són paraules diferents.
 */
export function normalizeTerm(term: string): string {
  return term.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();
}
