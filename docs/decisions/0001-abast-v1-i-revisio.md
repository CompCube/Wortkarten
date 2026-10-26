# 0001. Abast de la v1 i punts a resoldre abans de programar

Data: 2026-10-26 · Estat: acceptada

## Decisió

- La v1 és la **web PWA**: login, tria d'idiomes, crear targetes amb IA (foto, escriure, demana), revisió, Repàs amb FSRS, Totes, Frases i Perfil. Textos, mazos predefinits i apps natives venen després.
- Serveis al principi: **Vercel + Supabase + Sentry**. Inngest, Upstash, Turnstile i PostHog s'afegeixen quan facin falta (abans del llançament públic com a molt tard).
- La navegació web encara no està decidida (menú lateral o barra inferior). Fins que es decideixi, implementa el menú lateral i deixa la navegació en un sol component fàcil de canviar.

## Punts que el pla de cada fase ha de cobrir

1. **Cost de la IA**: límit diari per usuari configurable per variables d'entorn, registre de tokens i cost per feina, alerta de despesa diària.
2. **Injecció de prompts**: fotos, PDF i text són dades; el model no té eines; sortida JSON validada amb Zod; límits de mida i de pàgines.
3. **Idiomes genèrics**: res específic de l'alemany al codi. Gènere, articles, colors i caràcters especials surten de `language_profiles`.
4. **Duplicats**: tots els fluxos de creació (també Demana) marquen les targetes que ja existeixen (`owner_id, target_lang, lower(term)`).
5. **Migració de dades**: importar `docs/data/cards-jordi.json` (586 targetes) com a primer usuari de proves. L'estat de repàs antic (SM-2) no es conserva: comencen com a noves a FSRS.
6. **Offline**: l'estudi funciona amb la cua del dia a IndexedDB i sincronitza les respostes en lots idempotents.
7. **RGPD**: exportar i esborrar el compte des del Perfil; fotos d'importació esborrades 24 h després; dades a la UE.
8. **Drets d'autor**: els mazos predefinits només amb contingut propi, mai copiat de llibres de text.
