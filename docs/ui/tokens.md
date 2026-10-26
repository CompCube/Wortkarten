# Sistema visual: tinta + retolador

Referència viva: `prototype.html` (clar, fosc, mòbil i web). Figma: "Wortkarten: UI" (https://www.figma.com/design/h1khCqr6apQOVc3Zb7kR0t). El Figma no té les últimes pantalles: si no quadra, guanya el prototip.

## Colors (Radix Colors, escales de 12 passos)

| Rol | Escala | Ús |
|---|---|---|
| Interfície | slate | Fons (1-2), superfícies (3-5), vores (6-8), text (11-12) |
| Accent únic | amber | Botó Crear, ressaltat "retolador", element actiu |
| der | blue | Article i franja de les targetes masculines |
| die | red | Article i franja femenines |
| das | green | Article i franja neutres |

Clar i fosc emparellats amb les escales `dark` de Radix. Mode Auto segueix el sistema.

Valoració del repàs: De nou vermell (contorn), Difícil taronja (contorn), **Bé verd ple**, Fàcil blau (contorn).

Valors clau del tema clar: fons `#F9F9FB`, text `#1C2024`, text secundari `#60646C`, vora `#E0E1E6`, ambre `#FFC53D`, der `#0D74CE`, die `#CE2C31`, das `#2A7E3B`.

## Tipografia

- Títols i la paraula de la targeta: **Bricolage Grotesque** (500, 600, 700).
- Text: **Atkinson Hyperlegible Next** (400, 600, 700).
- Alternatives provades amb Fontjoy (només per comparar): Chivo + Cabin, Work Sans + PT Sans Caption.

## Regles

- Icones SVG a la interfície; emojis només com a imatge de targeta.
- Targeta: gira en 3D cada cop que es toca, en les dues direccions. Revers sense espai en blanc ni scroll: la imatge s'encongeix quan el contingut és llarg.
- Les opcions viuen en fulls que pugen de baix (mòbil) o finestres al mig (web).
- Mides fluïdes (dvh, container queries), safe-area-inset, 44 px mínim per tocar.
