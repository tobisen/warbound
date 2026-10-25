# Lokal gameplayförbättring — 2026-10-25

Ursprunglig leverans var lokal. Användaren har därefter godkänt commit/push;
publicering är fortsatt undantagen och `[skip ci]` hindrar Pages-workflow.
Befintlig CSS, units.mjs, docs/ och orelaterat arbete lämnas utanför commit.
Detta är ett separat uppdrag, utan ny roadmapbatch.

- Tornplacering: [före](placement-before.json) och [efter](placement-after.json).
  Samma explicita stressfixture:4096²,96 enheter,48 farms,3668 hinder inklusive
  verklig kartterräng/resurser. Start/preview/cancel är billiga; slutkontrollen
  gjorde upprepade fulla findRoute-sökningar. Före:4585ms admission och4514ms
  placeTower efter uppvärmning med admission. Slutligt efter:140,4/93,9ms. Preview0–0,1ms.
  CDP-sampling omfattar också modul-/assetstart; operationstiderna är separat
  avgränsade. Slutmätningen kördes efter fullsuite utan parallella testprocesser;
  föregående delmätning finns i placement-after-initial.json. Detta är CPU-tid
  i lokal Chrome/dev, inte ett allhårdvarulöfte.
- [Browserdata](browser.json):800/1280 Native, idle-cykling/fokus/markeringsring,
  tom-knapp, rätt grön/röd preview, Escape och faktisk musplacering som betalar
  en gång.256 enheter,64 giltigt placerade farmfixturer,3684 hinder på4096².
  Save/load bevarar256/64;12 verkliga updateMatch-steg mäts efteråt, samt levande
  scenframes med pointermove. Interaktiva assertions fryser simulationen för
  determinism; belastningsmätningen återupptar den. Rörligt luftmål tar faktisk
  skada i scenen. Inga pageerrors. Se bilderna idle/tower-preview/tower-invalid/air.
- check-farm-limit.mjs:verklig meny-Save/load och fortsatt tillgänglig farmknapp
  efter3/5/10/64 farms, Arena/Plains128 vid800/1280. Det äldre skriptets pausgenväg
  öppnade inte Save-menyn; slutprovet använder den synliga menyknappen.
- largeArmy.test.ts:256→257 via vanlig betald kö/träning,64 farms,5 extra baser,
  140 producenter, global supply och unika IDs genom encode/decode. Explicit
  belastningsfixture; inga sådana arméer injiceras i vanlig gameplay.
- Placement har jämförts mot befintlig routing över140 deterministiska småkart-
  fall med olika kroppsstorlekar och ändrad hinderrevision. Befintliga grind-/
  instängnings-/utgångstester kontrollerar fortsatt avslag när en väg stängs.
- AI:befintlig lokal implementation återanvänds. enemyInitiative.test.ts kräver
  nu scout/bas/faktiskt anfall inom Easy120/720/600s, Normal120/540/420s och
  Hard120/420/300s. Beginner har180/840/720s.20min-fall kontrollerar dessutom
  betald tillväxt, återanfall efter förluster och resursledger. Blockerad/farlig/
  alternativ expansion och fog provas separat i enemyTactics/enemyStrategy.
  Tidigare exakta mätningar i ../ai-initiative är historik, inte en ny körning.
  Nytt Beginner-fynd i utökad regression: en tung önskeroll blockerade billigare
  förstärkning när bara lite supply återstod. compositionRole väljer nu bland
  roller som ryms inklusive alla reservationer. [Före](ai-beginner/results.json):
  inga träffar efter förlust. [Efter](ai-beginner-fixed/results.json):3 betalda
  ersättningsjobb och551 träffhändelser; scout117s, andra bas336s, första träff372s.
  Riktad20min-testning PASS efter rättningen. Första fullkörningen avbröts och
  räknas inte som PASS; ny full2071/225 PASS1165,56s verifierar den slutliga koden.

Reproduktion från reporoten med installerad lokal Chrome och presentationspaketets
Playwright:

```sh
npm run dev -- --host 127.0.0.1 --port 5186
W2T_PROFILE_LABEL=current node scripts/profile-building-placement.mjs
node scripts/check-gameplay-improvements.mjs
W2T_PLAYWRIGHT_MODULE="$PWD/presentations/agentic-coding/node_modules/playwright-core/index.mjs" W2T_UI_URL=http://127.0.0.1:5186 node scripts/check-farm-limit.mjs
```

Kör inte profilskriptets defaultlabel på ändrad kod om historiskt föreunderlag ska
bevaras. Föreunderlaget mättes före optimeringen i denna körning. Browserstress
kördes samtidigt med regression och är därför inte en isolerad CPU-jämförelse.

Slutliga checks och begränsningar redovisas i HANDOFF.md/DEV_LOG.md. Stora matcher
kan fortfarande vara CPU-tunga; kort placeringstopp kvarstår i256-fixturen.
Save har kvar4_000_000 bytes storleksgräns, och lokal storage kan rapportera kvotfel.
Ingen ny mänsklig helmatchbalans eller CI/Pages-körning hävdas.

Ny slutlig `npm test`:2071/225 PASS1165,56s ([logg](full-regression.log)).
`npm run build` inklusive strict TypeScript PASS ([logg](build.log)); befintlig
bundlevarning kvarstår. Unit543/93 PASS ([logg](unit-before-final-contact-cache.log))
kördes före den sista kontaktcacheändringen, vilken därefter verifierats med
[48 riktade placementtester](placement-targeted.log) och hela slutliga fullsuiten.
AI-supply23/2 och riktad Beginner20min PASS. Testmanifest, scriptsyntax, diff
samt nya lokala länkar PASS. [Implementationens SHA256](source-hashes.json)
är oförändrad efter sista fullkörningen. Browserbilder har granskats visuellt.

Efterföljande commituppdrag: exporterad Git-indexkandidat utan användarens separata
CSS-/units.mjs-/docs-ändringar verifierad med [unit543/93](commit-candidate-unit.log),
[build med strict TypeScript](commit-candidate-build.log) och
[browser800/1280](commit-candidate/browser.json); bilder granskade. Befintliga
låsta beroenden återanvänds. Ingen ny npm ci eller full matchsimulation körd;
full2071/225 ovan återanvänds för oförändrad gameplaykod. `[skip ci]` undviker
automatisk Pages-publicering vid den beställda pushen.
