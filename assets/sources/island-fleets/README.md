# Island Fleets — nya spelresurser

14 egna bilder skapade med OpenAI image generation för detta lokala uppdrag.
Exakta prompter och källfiler finns i [prompts.json](prompts.json). Ingen
extern spelgrafik är importerad. Bilderna är kompletta spelkällor, inte mockups.

- Fem skepp: survey, raider, mortarShip, tender, torpedoBoat.
- Tre landroller: marine, sapper, harpooner, plus clans-marine/goblins-sapper.
- Fyra byggnader: drydock, signalTower, navalAcademy, marineBarracks.

Enhetskällorna har åtta riktningar och fyra tillstånd: idle, move, attack,
death. Byggnadskällorna har färdig, skadad, grund och under konstruktion.
`node scripts/export-island-fleets.mjs` exporterar källorna med befintliga
pixel-/palettehjälpare till `public/assets/island-fleets-atlas.png/.json`
och registrerar atlasen i manifestet. Totalen är 2720 ramar, 64 px för enheter
respektive 96 px för byggnader. Ägarfärger/byggnadsraser härleds vid export.
Fyra animationsteg per pose härleds med förskjutning/squash/rotation;
mellanbilderna är inte fyra separat målade poser. BootScene och animation.ts
laddar och använder atlasen i verkliga matcher.

Endast denna exporter kördes. Befintlig `assets/sources/units.mjs` och dess
användarändringar är bevarade. Huvudexportören har fått en import för framtida
samlad export. Unit-testet islandFleetAssets kontrollerar samtliga ramnycklar,
ras-/ägarvarianter, riktningar och byggstadier. Browserbilder i
[verifieringsmappen](../../../artifacts/island-fleets/README.md) visar faktiska
Phaser-sprites, efter betald produktion i dokumenterade testfixturer.
