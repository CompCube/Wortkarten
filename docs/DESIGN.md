# Wortkarten: document de disseny

Oct 24, 2026 · @Jordi

## Resum

Wortkarten és una web app per aprendre vocabulari en qualsevol idioma on l'usuari crea les seves pròpies targetes en segons: fa una foto de la llibreta o enganxa una llista, la IA proposa targetes completes i ell les revisa abans de desar-les.

El problema que resol: a Anki, crear les targetes és la feina més pesada (traducció, article, plural, frases d'exemple). Aquí aquesta feina la fa la IA, i l'usuari només valida. Després estudia amb repetició espaiada en les dues direccions, frases per completar i textos curts.

- **Per a qui:** adults que aprenen un idioma amb curs o llibre i apunten vocabulari a mà (cas inicial: catalanoparlants aprenent alemany B1).
- **Idiomes:** l'usuari tria l'idioma base i el que aprèn. Res està lligat a l'alemany: les regles de cada idioma (articles, gènere, caràcters especials) viuen en un perfil d'idioma configurable.
- **Origen:** el prototip personal (586 paraules) ha validat el flux foto → targetes → estudi.
- **Nom:** "Wortkarten" és provisional; per a una app multiidioma convindria un nom neutre.

## Abast del MVP

El MVP es pot donar per acabat quan un usuari nou pot registrar-se, triar idiomes, convertir una foto de la llibreta en 20 targetes revisades i estudiar-les l'endemà al mòbil.

| Àrea | Dins del MVP | Més endavant |
| --- | --- | --- |
| Compte | Login amb email (enllaç màgic) i Google; idioma base i idioma objectiu | Diversos idiomes objectiu alhora |
| Crear targetes | Sempre amb IA: l'usuari només escriu les paraules, puja fotos (fins a 5 pàgines) o un PDF (fins a 20), i la IA crea les targetes completes al moment; revisió abans de desar | Importar d'Anki o CSV; extensió del navegador |
| Organitzar | Mazos propis i etiquetes (temes); biblioteca de mazos oficials per descarregar | Compartir mazos entre usuaris (necessita moderació) |
| Estudiar | Repetició espaiada (FSRS) en les dues direccions; mode només imatge; completar frases (opcions o escriure) | Textos amb buits generats; mode sense connexió complet; àudio |
| Imatges | Emoji per defecte; foto pròpia de l'usuari | Banc d'imatges amb llicència o imatges generades |
| Plataforma | Web (pàgina pública i app) instal·lable com a PWA; apps natives iOS i Android a la fase 5 | Notificacions i widgets natius |
| Negoci | Gratuït amb límit diari d'IA | Pla de pagament (Stripe) |

Fora de l'abast: gramàtica, xat amb tutor, funcions socials i classificacions.

## Funcionalitats i fluxos

El flux central és afegir paraules amb IA, i la regla clau és que la IA proposa i l'usuari decideix: res es desa sense revisió.

### Primer accés

1. L'usuari es registra amb Google (o Apple a l'iPhone, o email).
2. La primera pantalla, abans de res més, li pregunta la seva **llengua materna o idioma base** i l'**idioma que vol aprendre**. Opcionalment, el nivell i quantes paraules noves vol al dia (amb valors per defecte).
3. Aquesta tria es desa al perfil i decideix l'idioma de les traduccions, de les frases i de la interfície. Es pot canviar al Perfil.
4. Acaba a la pantalla Avui amb dues opcions: **Crea les teves targetes** (acció principal) o **Descarrega un mazo** de la biblioteca.

### Afegir paraules (flux principal)

1. L'usuari tria un mazo i toca **Afegir paraules**. Tria entre Foto, PDF o Escriure. Escriure vol dir només la paraula o una llista de paraules: la IA en fa la resta, igual que amb la foto.
2. **Foto:** puja fins a 5 imatges. El client les redueix (màx. 1600 px) i en treu les metadades (EXIF, ubicació) abans de pujar-les.
3. El servidor crea una feina en segon pla. La IA llegeix la imatge i retorna les paraules candidates, marcant les il·legibles amb una lectura alternativa (p. ex. *Durchchtig → durchsichtig?*).
4. Per a cada paraula, la IA genera la targeta: forma correcta, article i plural (si l'idioma en té), traducció a l'idioma base, nota d'ús o fals amic, 3 frases simples amb la traducció i la paraula del buit marcada, i un emoji.
5. **Pantalla de revisió:** llista de targetes proposades. L'usuari pot editar-les, desmarcar-les o corregir les dubtoses. Les que ja existeixen al seu vocabulari surten marcades com a duplicades.
6. **Desar:** les targetes entren al mazo com a noves i el repartidor diari les va introduint.

### Estudiar

- **Repàs diari:** targetes pendents més N noves al dia (configurable). Quatre botons (De nou, Difícil, Bé, Fàcil) que mostren quan tornarà la targeta. Algoritme FSRS.
- **Dues direccions:** cada targeta té dos estats independents, *reconeixer* (idioma objectiu → base) i *produir* (base → objectiu). Produir s'activa quan reconeixer arriba a 3 dies d'interval. Durant la sessió, l'usuari també pot forçar una direcció o barrejar-les.
- **Davant de la targeta:** interruptor imatge i paraula / només imatge.
- **Completar frases:** frase amb buit; resposta triant entre 4 opcions del mateix tema o escrivint (amb tecles d'accents de l'idioma i correcció tolerant: *ae* = *ä*, avisa de majúscules).
- **Pràctica lliure:** repassar un mazo o etiqueta sense afectar la programació.
- **Filtrar per tipus de paraula:** en tots els modes l'usuari pot practicar només un o diversos tipus (p. ex. només verbs, o adjectius i adverbis), combinat amb el mazo o l'etiqueta. Cada opció mostra quantes paraules hi ha.

### Organitzar

- Mazos propis (p. ex. "Miteinander B1", "Llibreta") i etiquetes per tema (El cos, Feina...). Les etiquetes les proposa la IA i l'usuari les pot canviar. Cada targeta té també un tipus de paraula (substantiu, verb, adjectiu, adverbi o connector, expressió), que la IA assigna i l'usuari pot corregir.
- Cercar, editar i esborrar targetes; moure-les entre mazos.

## Pantalles

L'app té 10 pantalles, dissenyades per al mòbil primer, amb una barra inferior de 3 pestanyes (Avui, Mazos, Perfil). El [prototip navegable](https://claude.ai/artifact/Rp7px8LufDgr5Vj7G9vqXp) mostra les marcades amb ✓; a la llista de mazos, el primer es mostra obert amb el seu detall.

| # | Pantalla | Què hi fa l'usuari | Prototip |
| --- | --- | --- | --- |
| 1 | Benvinguda i login | Entra amb email o Google | ✓ |
| 2 | Tria d'idiomes | Idioma base, idioma que aprèn, nivell i paraules noves al dia | ✓ |
| 3 | Avui | Veu quantes targetes té pendents i comença el repàs; accés ràpid a Afegir paraules | ✓ |
| 4 | Mazos | Llista de mazos amb pendents i progrés | ✓ |
| 5 | Detall del mazo | Cerca i filtra per etiqueta; tria mode d'estudi | ✓ |
| 6 | Afegir paraules | Tria Foto, PDF o Escriure (només les paraules; la IA crea les targetes) | ✓ |
| 7 | Revisió de la IA | Edita, desmarca o corregeix les targetes proposades i les desa | ✓ |
| 8 | Estudi | Targeta (repàs), completar frases; opcions de direcció i imatge | ✓ |
| 9 | Resum de sessió | Encerts, temps i quan toca el següent repàs | ✓ |
| 10 | Perfil i opcions | Idiomes, límit diari, exportar dades, esborrar compte |  |

Principis de disseny (de l'audit del prototip personal):

- La tasca ocupa la pantalla; les opcions viuen en fulls que s'obren des de baix.
- Tots els elements tocables fan com a mínim 44 px; contrast 4,5:1; mode clar i fosc.
- Els colors der/die/das (o el gènere de l'idioma) només apareixen si l'idioma en té, i mai donen la resposta a la cara de la pregunta.
- Icones SVG a la interfície; els emojis només com a imatge de targeta.

## Interfície i experiència

La referència visual és el [prototip interactiu](https://claude.ai/artifact/NJk3eEqy1tJifL7VfLyTy7), amb el tema clar i fosc i les vistes de mòbil i de web. Aquestes són les decisions que Claude Code ha de respectar.

### Sistema visual

- Paleta "tinta + retolador" sobre escales Radix (slate per a la interfície, ambre com a únic accent), amb clar i fosc emparellats i un mode Auto que segueix el sistema.
- der en blau, die en vermell, das en verd: els únics colors forts, sempre lligats a l'article.
- Valoració del repàs: De nou vermell, Difícil taronja, Bé verd i ple, Fàcil blau.
- Tipografia: Bricolage Grotesque per a títols i la paraula, Atkinson Hyperlegible Next per al text. Les alternatives de Fontjoy (Chivo + Cabin, Work Sans + PT Sans Caption) queden al prototip per comparar.

### Navegació

- Barra inferior de 5: Repàs, Totes (pràctica lliure), + Crear al centre en ambre, Frases, Textos. El perfil s'obre des de l'avatar.
- Repàs és directament la sessió, sense pantalla prèvia: a dalt, el botó Tema, els comptadors (repàs i noves), el botó d'opcions i la barra de progrés.
- Al web hi ha dues opcions al prototip, pendent de decidir: menú lateral amb Crear a dalt, o la mateixa barra inferior centrada.

### Repàs i pràctica lliure

- Filtre amb diversos temes i diversos tipus de paraula alhora (substantius, verbs, adjectius, adverbis i connectors, expressions). Cap triat vol dir tots. A Repàs només entren les targetes que ja toquen.
- Opcions per a cada mode: direcció (DE → CA, CA → DE o barrejat), davant de la targeta amb imatge i paraula o només imatge, paraules noves al dia (Repàs) o paraules per sessió (Lliure).
- La targeta gira en 3D cada cop que la toques, en les dues direccions. Al web, Espai gira i 1 a 4 valoren; a Lliure, les fletxes ← i → responen.
- Lliure: llisques a la dreta si la saps i a l'esquerra si no. La que no saps torna a sortir al cap de 3 targetes.
- Revers de la targeta: la imatge ocupa l'espai que sobra a dalt (amb la franja de color del gènere) i es fa petita quan el contingut és llarg. Mai hi ha buit en blanc ni scroll dins la targeta.

### Crear amb IA

Hi ha quatre maneres de crear: Foto, PDF, Escriure i Demana. Les quatre acaben a la mateixa pantalla de revisió, on res es desa sense confirmar.

Demana és la nova opció: l'usuari escriu un tema ("vull flashcards relacionades amb l'aeroport") i la IA l'afina amb ell abans de crear res.

1. La IA reformula la petició en una frase ("Vocabulari per viatjar en avió, de la facturació a l'arribada, nivell B1").
2. Proposa subtemes que l'usuari activa o treu, la quantitat (10, 20 o 30) i el nivell (A2, B1 o B2).
3. Pregunta on desar-les: un mazo nou amb nom editable o un mazo existent.
4. Genera les targetes i les marca si ja existeixen a la biblioteca de l'usuari, per no duplicar-les.

Tècnicament són dues crides: una de refinament barata (Haiku, sortida JSON amb resum, subtemes, nivell i nom de mazo proposat) i la generació habitual. Compta dins la mateixa quota diària de generació.

### Tutorial inicial

Després de triar les llengües, un tutorial curt de 4 passos sobre l'app real, que es pot saltar i tornar a veure des del Perfil:

1. Crea les primeres targetes: Demana amb un tema suggerit o Escriure amb 3 paraules d'exemple.
2. Gira la primera targeta i valora-la: explica Bé i De nou.
3. El botó Tema: com triar temes i tipus de paraula.
4. Frases i Textos: on practicar en context.

No és un carrusel de pantalles de presentació: cada pas s'aprèn fent l'acció. Es mesura quants usuaris arriben a la primera revisió.

### Perfil

Dues pestanyes. Progrés: repàs d'avui amb anell i botó per començar, ratxa diària amb rècord, consolidades, encerts, minuts de la setmana, i l'estat de totes les paraules. Ajustos: llengües, opcions d'estudi, recordatori, tema, lletra i compte.

### Totes les resolucions

Una sola interfície responsiva, de 320 px d'amplada fins a pantalles de 2560 px.

| Amplada | Disposició |
| --- | --- |
| 320–767 px (mòbil) | Una columna, barra inferior, fulls que pugen de baix |
| 768–1023 px (tauleta) | Una columna centrada de 640 px, barra inferior |
| 1024 px o més (ordinador) | Navegació web triada, contingut centrat fins a 820 px, fulls com a finestres al mig, dreceres de teclat |

- Cap pantalla té scroll horitzontal. Les pantalles d'estudi (Repàs, Lliure, Frases, un text amb buits) caben sense scroll vertical en un iPhone SE (375 × 667) i més grans; la resta pot fer scroll.
- Mides fluïdes: la targeta i la imatge del revers s'adapten a l'alçada disponible (dvh i container queries), no a mides fixes.
- Respecta les zones segures (safe-area-inset) i l'orientació horitzontal al mòbil.
- Objectius tàctils de 44 px mínim, text a partir de 16 px als camps perquè iOS no faci zoom.
- Proves visuals amb Playwright a 375, 768, 1280 i 1920 px, en clar i en fosc, a cada pull request.

## Arquitectura i stack

El mateix stack que CareerPilot, amb dues regles: tota crida a la IA passa pel servidor, i tota lectura o escriptura de dades passa pel filtre RLS de Postgres.

&#91;embedded content: arquitectura · client, servidor i serveis\]

El client llegeix les seves dades directament de Supabase (RLS ho filtra); les accions sensibles (IA, límits, esborrar compte) passen per les rutes del servidor, que són les úniques amb claus secretes.

| Peça | Tria | Per què |
| --- | --- | --- |
| Front i servidor | Next.js 16 (App Router), TypeScript, Tailwind | Un sol repo; Server Actions i Route Handlers per a la lògica sensible |
| Allotjament | Vercel, regió `fra1` | Desplegament des de GitHub; dades a la UE |
| Base de dades i login | Supabase: Postgres, Auth, Storage, Realtime | RLS a nivell de fila; login amb email i Google |
| IA | API de Claude amb sortida JSON estructurada | Sonnet 5.5 per llegir fotos, Haiku 5.5 per generar targetes |
| Feines en segon pla | Inngest (o Supabase Queues) | Les fotos tarden; reintents i límit de concurrència |
| Repetició espaiada | `ts-fsrs` (v5) | FSRS supera SM-2 i és el que fa servir Anki ara |
| Límits d'ús | Upstash Redis | Rate limiting per usuari i IP |
| Errors | Sentry | Errors de client i servidor |
| App al mòbil | PWA (manifest + service worker) | Instal·lable sense botigues; app nativa més endavant |

Versions consultades: [Next.js 16.2](https://versionlog.com/nextjs/), [ts-fsrs 5.4](https://www.jsdelivr.com/package/npm/ts-fsrs).

## Web i apps mòbils

Una sola base de dades i un sol backend serveixen la web i les apps; el que canvia és només la capa de pantalles. Per això el repo és un monorepo i la lògica (FSRS, validació, correcció de respostes) viu en un paquet compartit.

| Carpeta | Què és | Tecnologia |
| --- | --- | --- |
| `apps/web` | Pàgina pública (SEO, preus, legal) i l'app web | Next.js 16 a Vercel |
| `apps/mobile` | Apps iOS i Android | Expo (React Native), publicada amb EAS |
| `packages/core` | FSRS, esquemes Zod, tipus de la base de dades, correcció de respostes, regles d'idioma | TypeScript pur, amb tests |
| `packages/api-client` | Crides a les rutes del servidor (IA, límits, esborrar compte) | TypeScript |
| `supabase/` | Migracions, polítiques RLS, funcions | SQL |

- **Base de dades:** sí, cal, i ja la tens: Postgres de Supabase. Per a molts usuaris: pla Pro (còpies de seguretat diàries i recuperació a un punt concret), connexions a través del pooler (Supavisor), índexs de la secció *Model de dades*, i rèpliques de lectura només si cal.
- **Login amb Google:** Supabase Auth. A la web, OAuth amb redirecció. Al mòbil, el botó natiu de Google i `signInWithIdToken`, perquè no s'obri cap navegador. Els dos acaben al mateix usuari.
- **Apple:** si l'app d'iOS ofereix Google, l'App Store demana una opció equivalent que respecti la privacitat; *Sign in with Apple* la compleix. Cal afegir-lo a iOS (i convinent a la web).
- **Requisits de les botigues:** esborrar el compte des de dins de l'app; formulari de privacitat d'Apple i *Data safety* de Google Play; comptes de desenvolupador (Apple 99 $/any, Google 25 $ un cop).
- **Pagaments més endavant:** a la web, Stripe. Dins de les apps, la venda de funcions digitals ha de passar per la compra integrada d'Apple i Google.
- **Ordre:** primer la web (PWA, ja instal·lable al mòbil) per validar amb usuaris reals; les apps natives, a la fase 5.

## Model de dades

Totes les taules d'usuari porten `owner_id` (referència a `auth.users`), tenen RLS activat i un índex per `owner_id`. Postgres a Supabase, regió UE (Frankfurt).

| Taula | Camps principals | Notes |
| --- | --- | --- |
| `profiles` | `id`, `display_name`, `base_lang`, `target_lang`, `level`, `new_per_day`, `created_at` | 1 per usuari; es crea amb un trigger en registrar-se |
| `decks` | `id`, `owner_id`, `title`, `target_lang`, `base_lang`, `created_at`, `updated_at` | Codis d'idioma BCP-47 (`de`, `ca`, `es-ES`) |
| `cards` | `id`, `deck_id`, `owner_id`, `term`, `article`, `plural`, `forms` (jsonb), `pos` (noun / verb / adj / adv / phrase), `translation`, `note`, `image_kind` (emoji / upload / none), `image_ref`, `tags` (text\[\]), `source` (photo / text / manual / import), `created_at`, `updated_at` | Índex únic `(owner_id, target_lang, lower(term))` per detectar duplicats |
| `examples` | `id`, `card_id`, `owner_id`, `sentence`, `translation`, `cloze`, `position` | `cloze` = la forma exacta que surt a la frase (p. ex. *gestorben*) |
| `card_states` | `card_id`, `owner_id`, `direction` (recognize / produce), `due`, `stability`, `difficulty`, `reps`, `lapses`, `state`, `last_review` | Clau `(card_id, direction)`; índex `(owner_id, due)` per a la cua del dia |
| `review_logs` | `id` (UUID del client), `card_id`, `owner_id`, `direction`, `mode`, `rating`, `reviewed_at`, `duration_ms` | Idempotent per l'`id`; serveix per a estadístiques i per optimitzar FSRS. Particionar per mes quan creixi |
| `import_jobs` | `id`, `owner_id`, `deck_id`, `kind` (photo / pdf / text), `status`, `input_paths`, `result` (jsonb), `error`, `input_tokens`, `output_tokens`, `created_at` | La pantalla de revisió llegeix `result` |
| `ai_usage_daily` | `owner_id`, `day`, `jobs`, `cards_generated`, `input_tokens`, `output_tokens` | Per als límits i el control de costos |
| `language_profiles` | `code`, `has_articles`, `articles` (jsonb amb colors), `special_chars`, `answer_folding` (jsonb) | Taula pública de només lectura; afegir un idioma = afegir una fila |
| library\_decks, library\_cards | Igual que decks i cards, més level, target\_lang, base\_lang, published | Biblioteca oficial: tothom la llegeix, només l'administrador hi escriu. "Descarregar" copia el mazo al compte de l'usuari, així després el pot editar i les regles RLS no canvien. |

Emmagatzematge (Supabase Storage, buckets privats):

- `imports/{owner_id}/{job_id}/` per a les fotos a processar. S'esborren automàticament 24 h després que la feina acabi.
- `card-images/{owner_id}/{card_id}.jpg` per a les fotos que l'usuari posa a les targetes. Es serveixen amb URL signades de curta durada.

Esborrar el compte esborra en cascada totes les files i fitxers de l'usuari.

## IA: generació de targetes

Una pàgina de llibreta (unes 20 paraules) costa aproximadament 1,5 cèntims de dòlar amb l'API de Claude, així que el cost d'IA no és el risc; el risc és l'abus, i es controla amb límits per usuari.

Dues crides, sempre des del servidor, amb sortida JSON estructurada i validada amb Zod:

1. **Lectura (`extract`)**: imatge → llista de paraules candidates `{raw, guess, confidence, line}`. Model: Claude Sonnet 5.5 per llegir lletra manuscrita; provar Claude Haiku 5.5 i canviar si la qualitat aguanta.
2. **Targetes (`enrich`)**: llista de paraules + idioma base + idioma objectiu + nivell → targetes completes. Model: Claude Haiku 5.5, en lots de 20 paraules. El prompt de sistema i les regles de l'idioma van en cache (prompt caching).
3. **PDF**: si el PDF té text seleccionable, el servidor n'extreu el text i va directe a `enrich` (més barat). Si és escanejat, cada pàgina passa per `extract` com una foto. Màxim 20 pàgines i 20 MB per fitxer.

| Pas | Model | Tokens aprox. per pàgina | Cost aprox. |
| --- | --- | --- | --- |
| Llegir la foto | Sonnet 5.5 ($2 / $10 per milió) | 3.000 entrada, 600 sortida | $0,012 |
| Generar 20 targetes | Haiku 5.5 ($0,10 / $0,50 per milió) | 2.000 entrada, 5.000 sortida | $0,003 |

Preus del [llistat oficial de Claude](https://platform.claude.com/docs/en/about-claude/pricing); els tokens són estimacions que cal mesurar amb proves reals.

Regles del prompt de targetes:

- Corregir l'ortografia i retornar la forma de diccionari; dir-ho a l'usuari si ha canviat. Assignar el tipus de paraula (pos) segons l'ús principal.
- Frases curtes, del nivell de l'usuari, una idea per frase, vocabulari quotidià.
- `cloze` ha de ser text literal de la frase (validat al servidor: si no hi és, es descarta l'exemple).
- Marcar falsos amics i variants regionals (p. ex. austríac vs alemany d'Alemanya).
- Si una paraula és ambigua o il·legible, no inventar: retornar `needs_review: true` amb les alternatives.

Límits del pla gratuït (configurables per variable d'entorn): 5 fotos i 150 targetes generades al dia per usuari, i un màxim de 5 pàgines per feina.

## Seguretat, privacitat i RGPD

La base de la seguretat és que cap usuari pot llegir ni escriure dades d'un altre, encara que manipuli el client: ho garanteix la base de dades (RLS), no el codi del front.

### Dades i accés

- RLS activat a **totes** les taules i a `storage.objects`. Política tipus: `owner_id = (select auth.uid())` (amb `select` perquè Postgres l'avaluï un sol cop). Cada migració nova inclou les seves polítiques; un test de CI falla si alguna taula pública no té RLS.
- La clau secreta de Supabase (`service_role`) i la clau de l'API de Claude només existeixen al servidor (variables d'entorn de Vercel). Al client només hi va la clau pública.
- Al servidor, la identitat es verifica amb `supabase.auth.getUser()` (o `getClaims()`), mai confiant en la sessió que envia el client.
- Les vistes es creen amb `security_invoker = true`; les funcions `security definer` només si cal i fora de l'esquema públic, amb la comprovació de propietari a dins.
- Totes les entrades (formularis, JSON de la IA) es validen amb Zod al servidor.

### IA

- Les fotos i textos dels usuaris són dades, no instruccions: el prompt ho diu explícitament, la IA no té eines amb efectes i la sortida només s'accepta si encaixa amb l'esquema JSON.
- Límits per usuari i per IP (Upstash Redis) a totes les rutes d'IA, a més del límit diari a `ai_usage_daily`. Alerta si la despesa diària supera un llindar. Captcha (Cloudflare Turnstile, integrat a Supabase Auth) al registre, perquè ningú no pugui crear comptes en massa per gastar IA.

### Fitxers

- Buckets privats; URL signades de 10 minuts. Tipus permesos: JPEG, PNG, WebP, HEIC; màx. 10 MB.
- Les imatges es reescalen i es reencoden abans de desar-les, cosa que elimina l'EXIF (ubicació GPS).
- Les fotos d'importació s'esborren 24 h després de processar-les.

### Web

- Capçaleres: Content-Security-Policy estricta, HSTS, `X-Content-Type-Options`, `Referrer-Policy`. Mai `dangerouslySetInnerHTML` amb contingut d'usuari.
- Dependències: Dependabot i `npm audit` a CI; revisar els avisos de seguretat de Supabase (Advisors) abans de cada llançament.

### RGPD

- Dades a la UE: Supabase a Frankfurt, funcions de Vercel a `fra1`.
- Política de privacitat i condicions d'ús abans del llançament públic; edat mínima 16 anys.
- L'usuari pot exportar totes les seves dades (JSON/CSV) i esborrar el compte des del Perfil.
- Analítica sense cookies o amb consentiment; proveïdors amb acord de tractament de dades (Supabase, Vercel, Anthropic).
- Mazos predefinits: només contingut propi. No publicar llistes copiades de llibres de text (p. ex. el Lernwortschatz de Miteinander).

Referència: [Supabase RLS best practices (MakerKit)](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices).

## Escalabilitat, rendiment i observabilitat

L'arquitectura aguanta desenes de milers d'usuaris sense canvis: les parts cares (IA) van en cua, l'estudi funciona des del dispositiu i el servidor només rep lots de respostes.

- **Estudi des del client:** en obrir la sessió es descarrega la cua del dia (màx. 200 targetes) i es desa a IndexedDB. L'FSRS es calcula al client amb `ts-fsrs`; les respostes s'envien en lots cada 10 targetes o en tancar la sessió, amb `id` generat al client perquè reenviar sigui segur. Així el repàs va ràpid i aguanta talls de connexió.
- **Consulta de la cua:** `card_states WHERE owner_id = ? AND due <= now() ORDER BY due LIMIT 200`, coberta per l'índex `(owner_id, due)`.
- **Feines d'IA en segon pla:** Inngest (o Supabase Queues) amb concurrència limitada i reintents amb espera creixent. El client segueix l'estat de la feina amb Supabase Realtime en lloc de fer consultes repetides.
- **Creixement de dades:** `review_logs` és la taula que més creix (unes 100 files per usuari actiu i dia); particionar-la per mes a partir de \~10 milions de files.
- **Imatges:** mida màxima 1.200 px, WebP, servides amb cache.
- **Observabilitat:** Sentry (errors al client i al servidor), logs estructurats amb `job_id` i `owner_id`, i un panell intern de cost d'IA per dia i per usuari.
- **Qualitat:** TypeScript estricte; tests amb Vitest (FSRS, correcció de respostes, validació d'IA) i Playwright (flux foto → revisió → estudi); CI a GitHub Actions; entorns separats de desenvolupament i producció a Supabase.

## Llista de llançament

Gairebé tota la llista s'ha de fer; només el banner de cookies es pot evitar triant bé l'analítica, i les dues skills s'han de revisar abans d'instal·lar-les. La fase 4 no es tanca fins que tots els punts estan fets.

| Punt | Fer-ho? | Com |
| --- | --- | --- |
| Impeccable (skill) | Sí, amb revisió | Skill de disseny de front per a Claude Code ([pbakaus/impeccable](https://claudemarketplaces.com/skills/pbakaus/impeccable/frontend-design)). Llegeix el SKILL.md abans d'instal·lar-la: una skill pot executar ordres |
| Taste (skill) | Opcional | N'hi ha diverses amb aquest nom; la de [hmbown/taste](https://github.com/hmbown/taste) ajuda a criticar i polir. Instal·la-la al projecte (`.claude/skills/`), no globalment |
| Política de privacitat | Sí, obligatori | Pàgina `/privacitat`: quines dades, per a què, proveïdors (Supabase, Vercel, Anthropic), terminis, drets RGPD, contacte |
| Termes i condicions | Sí | `/termes`: edat mínima 16, contingut que puja l'usuari, límits d'IA, baixa del compte |
| Impressum | Sí (faltava) | Obligatori per a webs gestionades des d'Àustria o Alemanya: nom, adreça i contacte del responsable |
| Secrets fora del front | Sí | Ja previst: claus només al servidor; afegir un escaneig de secrets al CI (gitleaks) |
| Forçar HTTPS | Sí | Vercel ho fa per defecte; afegir HSTS a les capçaleres |
| Banner de cookies | Evitable | Si només hi ha cookies de sessió i analítica sense cookies, no cal banner. Si mai s'afegeix una eina amb cookies de seguiment, llavors sí |
| Meta títols i descripcions | Sí | Metadata API de Next.js a cada pàgina pública |
| Vista prèvia social | Sí | Imatge Open Graph generada amb `next/og` |
| Favicon | Sí | Favicon, icones d'app i `manifest.webmanifest` (la PWA les necessita) |
| sitemap i robots.txt | Sí | `app/sitemap.ts` i `app/robots.ts`; robots bloqueja `/app` (zona privada) |
| Text alternatiu a les imatges | Sí | A la web pública sempre; a les targetes, l'emoji és decoratiu i la paraula ja és el text |
| Comprimir imatges | Sí | `next/image` (WebP/AVIF) a la web; les fotos d'usuari ja es redueixen abans de pujar |
| Velocitat de càrrega | Sí | Lighthouse al CI; objectiu: LCP < 2,5 s i INP < 200 ms al mòbil |
| Contrast de colors | Sí | 4,5:1 mínim; test automàtic amb axe a Playwright |
| Adaptada al mòbil | Sí | Ja és mòbil primer; provar a 360, 390 i 768 px |
| Pàgina 404 pròpia | Sí | `app/not-found.tsx` amb enllaç a l'inici |
| Enllaços trencats | Sí | Comprovació d'enllaços al CI abans de cada desplegament |
| Validació de formularis | Sí | Zod al client (missatges al costat del camp) i al servidor (la que compta) |
| Protecció contra spam | Sí | Turnstile al registre i al formulari de contacte, més límits per IP |
| Analítica | Sí | PostHog al servidor de la UE en mode sense cookies, o Plausible; mesurar el funnel registre → primera targeta → segon dia |
| Una crida a l'acció clara | Sí | A la portada, un sol botó: "Crea les teves targetes" |
| Email de login fiable | Sí (faltava) | L'SMTP per defecte de Supabase només envia uns pocs correus per hora i només a l'equip: cal un SMTP propi (Resend o Postmark) amb SPF, DKIM i DMARC al teu domini |
| Còpies de seguretat | Sí (faltava) | Pla Pro de Supabase; provar una restauració abans del llançament |
| Entorn de proves | Sí (faltava) | Projecte de Supabase separat per a desenvolupament; previsualitzacions de Vercel per a cada PR |
| Esborrar compte i exportar dades | Sí (faltava) | Ja al disseny; obligatori pel RGPD i per a l'App Store |
| Monitoratge | Sí (faltava) | Sentry, avisos de disponibilitat i avisos de despesa d'IA |
| Domini propi | Sí (faltava) | Necessari per a l'email, la confiança i el SEO |

Cap programari surt sense errors: el que el fa apte per publicar és que tots aquests punts estiguin fets, que els tests passin al CI i que un grup petit de provadors l'hagi fet servir una setmana abans d'obrir-lo.

## Portfolio: la part d'IA

Tal com està, l'app demostra que saps cridar una API d'IA; el que impressiona un reclutador d'AI Product Engineer és demostrar que en **mesures la qualitat i el cost** i que el producte millora amb dades reals. Això s'aconsegueix amb cinc peces.

| Peça | Què és | Què demostra |
| --- | --- | --- |
| Joc d'avaluació (evals) | 50 fotos de llibretes reals (la teva i d'amics) amb la llista correcta de paraules escrita a mà. Un script calcula l'encert de lectura, l'encert de l'article i el percentatge de frases vàlides. S'executa al CI a cada canvi de prompt | Que no canvies prompts a cegues: cada canvi té un número abans i després |
| Comparativa de models | La mateixa avaluació amb Haiku i Sonnet: qualitat, temps i cost per pàgina en una taula | Que tries el model per dades, no per intuïció (p. ex. Haiku i, només si la confiança és baixa, Sonnet) |
| Observabilitat d'IA | Cada crida queda traçada (Langfuse o similar): prompt, versió, tokens, cost, temps, error | Que saps operar IA en producció |
| Bucle de feedback | Cada edició que l'usuari fa a la pantalla de revisió és una dada etiquetada. Mètrica principal: percentatge de targetes desades sense editar | Que el producte aprèn dels usuaris; una mètrica que pots ensenyar pujant amb el temps |
| Funció personalitzada | Textos generats a partir de les paraules que *aquell usuari* falla més segons FSRS, amb buits només en aquestes paraules | IA connectada a les dades de l'usuari, no un xat genèric |

Per presentar-ho:

- Repo públic amb un README que comenci per una demo en vídeo de 60 segons i el diagrama d'arquitectura.
- Un cas d'estudi al teu portfolio: problema, decisions (amb els registres de decisió del repo), resultats de les avaluacions i mètriques d'usuaris reals (usuaris actius, retenció al dia 7).
- Xifres concretes en lloc d'adjectius, per exemple "encert de lectura del X % a Y cèntims per pàgina", amb els teus números reals.

## Roadmap i treball amb Claude Code

Cal construir-ho en 5 fases, cadascuna amb un criteri d'acabat que es pot provar; no es passa a la següent fins que l'anterior el compleix.

1. **Fonaments.** Repo, Next.js amb TypeScript, Supabase (dev i prod), login, `profiles` i tria d'idiomes, RLS, CI. *Acabat quan:* dos usuaris de prova no poden veure res l'un de l'altre (test automàtic).
2. **Targetes i estudi.** Mazos, editar i corregir targetes, biblioteca de mazos oficials per descarregar, estudi amb FSRS en dues direccions, completar frases, PWA instal·lable. *Acabat quan:* puc estudiar 50 targetes al mòbil i l'endemà em surten les que toquen.
3. **IA.** Importar text, foto i PDF, pantalla de revisió, duplicats, límits, registre de costos i joc d'avaluació. *Acabat quan:* una foto de la llibreta dona 20 targetes correctes en menys d'1 minut i el cost queda registrat.
4. **Llançament.** Tots els punts de la Llista de llançament, pàgina de presentació, 10 provadors. *Acabat quan:* els provadors fan servir l'app una setmana sense errors greus.

La fase 5 és **Apps natives**: Expo amb els paquets compartits, Sign in with Apple i publicació a l'App Store i Google Play. *Acabada quan:* el mateix compte estudia a la web i al mòbil amb el progrés sincronitzat.

Despés: textos amb buits personalitzats, importar d'Anki, compartir mazos entre usuaris, pagaments.

### Com passar-ho a Claude Code

- Desa aquest document al repo com a `docs/DESIGN.md` (exporta'l en Markdown) i el prototip com a referència visual a `docs/prototype/`.
- Crea un `CLAUDE.md` amb les regles fixes: TypeScript estricte; cap taula sense RLS; cap secret al client; validar amb Zod; tota crida a la IA passa per `lib/ai/` amb límit d'ús; tests per a cada funció de domini.
- Treballa fase per fase en modus de planificació: demana el pla, revisa'l i després deixa que l'implementi. Una branca i un PR per fase.
- Les migracions van a `supabase/migrations/` i els tipus es generen amb `supabase gen types`.
- Abans de publicar, demana a Claude Code una revisió de seguretat contra la secció *Seguretat, privacitat i RGPD* d'aquest document.
