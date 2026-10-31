# Island Fleets — lokal verifiering 2026-10-30

Ny lokal verifiering av arbetskopian 2026-10-30–31. Ingen commit, push, CI, Pages eller
versionsrelease utförd. Äldre publiceringsloggar är inte belägg för denna kod.

## Kommandon och resultat

- `npm test`: **2248 tester/237 filer PASS, 1025,60 s**, sammanhängande
  fullregression på fryst slutkod. [Slutlogg](full-final.log).
  Första körningen: **2238 PASS/18 FAIL, 237 filer, 1129,27 s**. Den startade
  före de sista rättningarna och blandade äldre moduler med nya testfall.
  Fel: fyra nya regressioner mot äldre kod, gamla exakta kataloglistor,
  gamla hamnkoordinater, generella 128×128-/skogsmigrationsantaganden och
  discoveryantal. Samtliga berörda beteenden har riktade rättningar/prov;
  den andra fullkörningen är helt grön. Se [ursprunglig logg](full-initial.log).
- `npm run test:unit`: **563 tester/95 filer PASS, 35,72 s**. En tidigare
  körning hittade Orc-testets gamla rosterförväntan (562 PASS/1 FAIL).
  Rosterlistorna uppdaterades och samlad unit kördes om med allt grönt.
- `npm test -- src/gameplay/islandFleets.test.ts src/gameplay/navalCombat.test.ts src/gameplay/enemyNaval.test.ts src/gameplay/transport.test.ts src/gameplay/fleetDoctrine.test.ts src/gameplay/multiplePlayers.test.ts src/gameplay/projectileDomains.test.ts src/gameplay/save.test.ts src/gameplay/multipleSave.test.ts`:
  **130 tester/7 matchande filer PASS, 149,33 s**. Vitest-filfilter matchade
  sju befintliga filer; det finns ingen separat fleetDoctrine.test eller
  multipleSave.test. Den nya Island Fleets-filen ingår med 47 fall.
- `npm test -- src/gameplay/orcs.test.ts src/gameplay/humans.test.ts src/gameplay/elves.test.ts`:
  **12 tester/3 filer PASS, 2,15 s** efter uppdaterade rosterförväntningar.
- `npm test -- src/gameplay/discoveries.test.ts`: **15/1 PASS, 35,65 s**.
  Gamla kartor behåller tre gömda fynd; de nya ökartorna har bara sina
  definierade resursnoder. Den generella kontrollen verifierar nu båda fallen.
- `npm test -- src/gameplay/mapRegions.test.ts src/gameplay/islandFleets.test.ts src/presentation/unitAttacks.test.ts`:
  **86/3 PASS, 104,80 s**, slutlig kontroll av kartkontrakt,
  precisionsgranaters visade skada och nya sjösystem. Äldre kartors hårdkodade hamn- och skogsmigrationsprov
  består; nya kartors stränder hämtas från deras faktiska terrängplan.
- `npm run build`: **PASS**, inkluderar `tsc --noEmit` med strict TypeScript.
  Vite har fortsatt befintlig varning om stor bundle; inga buildfel.
- `git diff --check`: **PASS**, även efter slutlig dokumentkomplettering.
- `node scripts/check-island-fleets.mjs`: **PASS 800×600 och 1280×720**.
- `node scripts/check-island-fleet-art.mjs`: **PASS fem rasers skepp/trupper
  och fyra kartöversikter**, inga runtime-/konsol-/assetvarningar.

- `npm test -- src/gameplay/islandFleets.test.ts -t 'Four Crowns starts'`:
  **1 PASS/46 avsiktligt filtrerade, 67,78 s**. Tre självständiga AI bygger
  betald transport/stridsskepp och minst en landstigning sker. Save testas
  under resan; kompakt fyrspelar-Save77 migrerar också.
- `npm test -- src/gameplay/multiplePlayers.test.ts src/gameplay/fivePlayers.test.ts src/gameplay/teamResults.test.ts src/gameplay/save.test.ts`:
  **61/4 PASS, 69,92 s**, efter rättning av multiplayer-sökpunkter i Save.
- `npm test -- src/gameplay/expandedMaps.test.ts`: **12/1 PASS, 2,91 s**.
  Gamla expanderade kartors 128×128-prov behålls; nya kartor har eget storleksprov.
- `npm test -- src/gameplay/islandFleets.test.ts -t 'starts, resources|six paid technologies'`:
  **5 PASS/42 avsiktligt filtrerade, 4,89 s**, verklig kartstorlek/fog/resurser
  samt +96 px optik även tillsammans med befintlig Tidewatch.

Kontroller efter den första fullkörningens start täcker de sista ändringarna
för multiplayer-skrovskydd, blockerad strand, transportersättning, förlorad
lastningssoldat och kustforskning tillsammans med precisionsgranater. Den
sista UI-textändringen följs av unitAttacks-kontroll och nytt strict build.

## Vad spelproven faktiskt verifierar

`islandFleets.test.ts` har 20 matcher (fyra kartor × fem AI-raser) med ordinarie
startresurser och 0,5 s simuleringssteg i högst tolv spelminuter. Varje prov
kräver betald eskort, rasens nya skepp, fasen landed och faktisk basskada.
Save/Load provas var sextionde simulerade sekund.
Detta är accelererad automatiserad simulering, inte mänsklig genomspelning.
Fullregressionen inkluderar även den slutliga utökade fyrspelarkontrollen.

Övriga prov täcker fyra nya byggnaders verkliga betalda placering/byggtid,
alla fem rasers produktionskedjor/supply, sex teknikval och krav, stillastående
betald reparation, måldomäner, transport mellan de fyra kartornas riktiga
stränder, Save77-migration och nekad fabricerad legacydata. Fyrspelarläget
kontrollerar tre betalda flottor fram till landstigning, oberoende ekonomi,
Save under förloppet och att skrovskydd appliceras en gång.
Blockerad strand, sänkt transport och förlorad lastningssoldat har separata
riktade regressioner. Fullständiga fyrspelar-slutspel är inte särskilt provade.

## Browser och bilder

Chrome/Phaser via lokal Vite på port 5195, native visning. Skripten exponerar
scenreferensen endast genom Playwrights responsomskrivning; produkten får
ingen global testhook. Browserns byggfixture ger 1000 trä/guld, väljer en
arbetare och använder riktig placering/byggtid. Produktion av marine, tender,
transport och Light Hulls startas med faktiska knappar. Färdig forskning,
exklusivt motsatt skrovval, producerade kroppar och Save kontrolleras.

- [800 px byggnader](buildings-800.png), [1280 px byggnader](buildings-1280.png)
- [800 px skrovval](hull-choice-800.png), [800 px två forskningsrader](research-800.png)
- [Human stöd](ship-crown.png), [Orc anfall](ship-clans.png),
  [Elven spaning](ship-elves.png), [Dwarf artilleri](ship-dwarves.png),
  [Goblin torped](ship-goblins.png)
- [Human marine](infantry-crown.png), [Orc marauder](infantry-clans.png),
  [Dwarf sapper](infantry-dwarves.png), [Goblin fuse runner](infantry-goblins.png),
  [Elven harpooner](infantry-elves.png)
- [Twinwake](map-twinwake.png), [Trident](map-trident.png),
  [Four Crowns](map-crownsea.png), [Farreach](map-farreach.png)

Artkontrollen använder explicit färdiga förkrav och vanliga betalda
produktionsköer. Den bevisar rendering och producentkoppling, inte en
komplett normal resursöppning. Kartöversikterna startas från kartvalet och
visas med avslöjad fog/fryst kamera för visuell granskning av hela layouten.
[Browserresultat](browser.json) och [artresultat](art-browser.json) redovisar
state/roller och tomma fellistor. PNG-bilderna är faktiskt visuellt granskade.

## Browsersekvens med normal AI-ekonomi

`node scripts/check-island-fleet-crossing.mjs` PASS. En normal Twinwake-match
utan extra resurser simuleras i browsern, med oförändrad fog i spelstaten.
Endast visningskopians fog avslöjas när en bild tas. Orc-AI seglar vid 603 s,
landsätter två soldater vid 605,5 s och skadar spelarbasen från 240 till
218,98 HP vid 608 s. Den producerar transport, tre eskorter och Flame Galley.
Samtliga köp bokförs i den ordinarie ekonomin; transporten går hem igen.

[Överfart](crossing-sailing.png), [landstigning](crossing-landed.png),
[basskada](crossing-damage.png) och [mätdata](crossing-browser.json).
Noll runtimefel. Bilderna är granskade; AI-eskorter kan överlappa vid sin
gemensamma samlingspunkt vid stranden, vilket även kan tränga ihop etiketter. Ingen ny
flottseparation införs här. Fartygen fullföljer överfarten trots detta.

## Bevarat och ej kontrollerat

[SHA256](preserved.sha256) bekräftar att användarens style.css och units.mjs
inte ändrats av detta uppdrag; docs/ och övriga tidigare otrackade filer har
inte redigerats. Full export av äldre grafik har inte körts.

Ingen mänsklig balans-/tidsgranskning, ny ljudlyssning, storflottest eller
publicerad nätbuild. Befintliga ljud återanvänds. AI har tvåsoldatersvågor och
ingen ny autonom kolonisering av neutrala öar. Genererade riktnings-/tillstånds-
poser animeras med härledda mellanrutor; inte varje mellanruta är separat målad.
