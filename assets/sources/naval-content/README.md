# Naval content — 2026-10-25

Originalbilder framställda med det inbyggda imagegen-verktyget för denna batch,
utan importerad spelgrafik. Ingen API-/CLI-fallback användes. Källorna sparas här;
`cutter.png` är arbetsnamnet för den nya Human **Tide Runner**. Den befintliga
Human Warship heter redan **Cutter** och har behållits.

- `cutter.png`: åtta riktningar × idle/sailing/firing/sinking för Tide Runner.
- `bombard.png`: åtta riktningar × samma fyra tillstånd för Dwarf Bombard.
- `naval-foundry.png`: complete/damaged/foundation/building, gemensam verkstad.
- Export: `node scripts/export-naval-content.mjs` (även sist i `npm run assets:export`).
- Runtime: `public/assets/naval-content-atlas.png` och motsvarande JSON;520 ramar,
 1024×2144, 64px skepp/96px verkstad. Nearest/native pixelkluster via projektets
 befintliga cell/reducer/draw-flöde, transparenta marginaler och teamfärg.
- Fyra renderingsframes per aktivt tillstånd härleds från respektive riktade
 originalpose med bob/recoil/sjunkning/alpha. Separata målade mellanframes hävdas inte.
- Äldre atlaser och användarens `assets/sources/units.mjs` har inte exporterats om.
- Browserbilder och verifiering finns i `artifacts/content-balance/`.

## Promptuppsättning — inbyggt imagegen

Tide Runner (ursprungligt arbetsnamn Human Cutter):

> Use case: stylized-concept. Create a production pixel art game sprite sheet for Warbound, original classic dark fantasy RTS art, strict crisp pixel clusters, muted wood tan, ivory canvas, royal blue team trim, dark outlines, light upper left. Subject: HUMAN CUTTER, a small narrow two-sail fast wooden escort sailing vessel with a single swivel gun, no people. Elevated three quarter RTS camera. Transparent background. Exactly 8 equal columns x 4 equal rows, no labels, no grid lines, ample empty padding around every ship, 1024x512 canvas. Eight columns show eight directions in order east, southeast, south, southwest, west, northwest, north, northeast (actual changed bow orientation and sails, not simply copied images). Rows show same ship: calm idle pose, moving with visibly wind-filled sails and small wake, firing small golden muzzle flash, sinking destroyed hull. Consistent proportions, clean silhouette readable when shrunk to 64 pixel game frames, same size and anchor per cell, only one vessel per cell, no background sea, no decorative objects, no text, no watermark.

Dwarf Bombard:

> Use case: stylized-concept. Production sprite sheet for an original fantasy pixel-art RTS Warbound. DWARF BOMBARD: broad low armored iron-and-dark-wood siege warship, large bronze mortar barrel, squat furnace chimney, small red-brown triangular sail. Chunky muted colors, crisp hand-crafted pixel clusters, no antialiasing, dark outlines, light from upper left. Elevated three quarter RTS camera. Exactly 8 equal columns x 4 equal rows, 1024x512, genuine transparent background. Each cell contains exactly one full ship, centered with ample padding and identical scale/anchor. Eight directions in columns east, southeast, south, southwest, west, northwest, north, northeast, actual changed bow and hull orientation. Four rows: intact idle, sailing with small wake and smoke, firing mortar with golden flash, sinking shattered hull. Distinct heavy wide hull silhouette reads at 64px. No ocean, no grid, no text, no watermark, no other objects.

Naval Foundry:

> Use case: stylized-concept. A single production building sprite sheet, original fantasy pixel-art RTS Warbound style, crisp hand-painted pixel clusters with dark outlines, light upper left, elevated three-quarter overhead game perspective. Subject NAVAL FOUNDRY, coastal technology building but placed on land: squat fieldstone base, timber workshop with deep slate blue gable roof, copper furnace chimney, a large bronze anchor and coiled ropes beside a half-built ship rib framework. Clear distinct silhouette, warm bronze against cool roof, reads when reduced to 96x96px. Exactly FOUR equal cells in one horizontal row on 1024x256 genuine transparent canvas with generous separate padding. Left to right show same identical structure and camera/scale/ground anchor: complete pristine, damaged cracked roof, early timber foundation, half-built scaffolding. No ground tile, no surrounding terrain, no water, no text or grid, no watermark. Not a castle, not a dock with water, it is a land workshop for naval logistics.
