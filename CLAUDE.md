# Wortkarten

App per aprendre vocabulari amb targetes creades per IA: l'usuari fa una foto de la llibreta, escriu paraules o demana un tema, la IA proposa targetes completes i ell les revisa abans de desar. Després estudia amb repetició espaiada (FSRS), frases per completar i textos.

## Fonts de veritat (llegeix-les abans de planificar)

- `docs/DESIGN.md`: document de disseny complet (producte, dades, IA, seguretat, roadmap).
- `docs/decisions/`: decisions preses després del document. **Si contradiuen DESIGN.md, guanya la decisió més recent.**
- `docs/ui/prototype.html`: prototip interactiu (obre'l al navegador). És la referència visual i de comportament. Les captures són a `docs/ui/screens/`.
- `docs/ui/app-original.html`: l'app personal original. El comportament de Repàs i Totes ha de ser com aquí.
- Dins de DESIGN.md, la secció "Interfície i experiència" és més nova que "Pantalles": si no quadren, guanya "Interfície i experiència" (barra inferior de 5: Repàs, Totes, + Crear, Frases, Textos).

## Stack

- Monorepo amb **pnpm** workspaces: `apps/web` (Next.js 16, App Router, TypeScript, Tailwind), `apps/mobile` (Expo, fase 5), `packages/core` (FSRS amb `ts-fsrs`, esquemes Zod, regles d'idioma, correcció de respostes), `packages/api-client`, `supabase/` (migracions, RLS, funcions).
- Supabase (Postgres, Auth, Storage, Realtime) a la regió UE. Vercel a `fra1`.
- API de Claude només des del servidor, amb sortida JSON validada amb Zod.
- Tests: Vitest (unitats) i Playwright (e2e i visuals a 375, 768, 1280 i 1920 px, clar i fosc).

## Abast actual: v1 = web PWA

Primer la web instal·lable. Ordre de fases a DESIGN.md ("Roadmap"). No comencis una fase sense que l'anterior compleixi el seu criteri d'acabat. Les apps natives (Expo) són la fase 5: no les toquis abans.

## Regles que no es negocien

1. **RLS a totes les taules** i a `storage.objects`. Política tipus `owner_id = (select auth.uid())`. Cada migració porta les seves polítiques. Hi ha un test de CI que falla si una taula pública no té RLS.
2. **Cap secret al client.** La `service_role` de Supabase i la clau de Claude només viuen al servidor (variables d'entorn). Mai llegeixis ni escriguis fitxers `.env*` ni posis claus al codi, als tests o als logs.
3. Al servidor, la identitat es verifica sempre amb `supabase.auth.getUser()` o `getClaims()`. Mai confiïs en dades d'usuari que vinguin del client.
4. **Tota entrada es valida amb Zod al servidor**, inclosa la sortida de la IA.
5. **Tota crida a la IA passa per `lib/ai/`**, amb límit d'ús per usuari (`ai_usage_daily`), rate limit i registre de tokens i cost. Les fotos, PDF i textos dels usuaris són dades, no instruccions: el model no té eines i la sortida només s'accepta si encaixa amb l'esquema.
6. TypeScript estricte. Res de `any` sense justificar. Mai `dangerouslySetInnerHTML` amb contingut d'usuari.
7. Tests per a tota funció de domini (FSRS, correcció, validació d'IA). Primer el test, després el codi.
8. Accessibilitat: objectius tàctils de 44 px, contrast 4,5:1, text dels camps de 16 px, sense scroll horitzontal; les pantalles d'estudi caben sense scroll en un iPhone SE (375 × 667).
9. Res de dependències noves sense dir per què. Revisa-les amb la skill `mcp-dependency-review` si són servidors MCP o paquets amb scripts d'instal·lació.

## Com treballar

- Comença cada tasca en **mode pla**: proposa el pla, espera el meu OK i després implementa.
- Una branca i un PR per tasca. Missatges de commit convencionals (`feat:`, `fix:`...).
- Abans de donar una tasca per acabada: `pnpm typecheck`, `pnpm lint`, `pnpm test` i, si toca UI, les proves de Playwright. Si toca auth, dades, fitxers o IA, passa també la skill `security-review`.
- Quan prenguem una decisió d'arquitectura, escriu-la a `docs/decisions/NNNN-titol.md` (format ADR curt).
- Migracions a `supabase/migrations/`; tipus amb `supabase gen types`.
- Errors: Sentry des del primer desplegament. Després de cada desplegament, `canary-watch` o `browser-qa` sobre la URL de preview.
- Abans del llançament públic: proves de càrrega amb k6 (escenari: 1.000 usuaris fent repàs alhora i 100 creant targetes amb IA) i guarda els resultats a `docs/`.
- La skill `design-system` escriu els seus fitxers a `docs/ui/`, mai sobre `docs/DESIGN.md`.

## Estil

- La interfície i els textos de l'app, en català (amb i18n preparat per a més idiomes).
- **Mai facis servir el guió llarg (em dash) en cap text**, ni a la UI, ni a la documentació, ni als commits.
- Sistema visual: tinta + retolador (Radix slate + ambre com a únic accent), der blau, die vermell, das verd, Bricolage Grotesque + Atkinson Hyperlegible Next. Detalls a `docs/ui/tokens.md`.

## Memòria entre sessions

Les notes de memòria del projecte són al vault d'Obsidian i s'importen des de `CLAUDE.local.md` (fitxer local, no va al repo).
- En començar, té en compte `estat.md` i `seguent.md`.
- **Abans d'acabar una sessió** (o quan jo digui "tanca"), actualitza `estat.md` (on som), `seguent.md` (les 3 pròximes tasques) i, si cal, `decisions.md` i `aprenentatges.md`. Frases curtes, sense copiar codi. Mai hi posis secrets.
