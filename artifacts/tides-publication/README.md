# Tides of War — commit och Pages-publicering 2026-10-30

Nytt uttryckligt användarmandat: commit, push och publicering. Main/origin
kontrollerade; ingen divergens vid kontroll före commit. Produktversion0.8.0
består. Git/build-ID identifierar den nya publiceringen.

## Exakt commitkandidat

Index exporterades till `/tmp/w2t-publish-cco7bm59` med git checkout-index.
Användarens style.css, assets/sources/units.mjs, docs/, CLEANUP_REPORT.md och
:memory:.ses ingår inte. Tidigare verifierad AI/navigation-rättning följer med
innehållspaketet. Inga assetexporter eller nya ljud har skapats vid publicering.

- Unit552/94 PASS17,49s: [logg](candidate-unit.log).
- Build med strict TypeScript PASS, Vite523ms: [logg](candidate-build.log).
- Produktionsbrowser fem fraktioner ×800/1280 PASS10/10: verkliga nya
  forskningsklick, exakt kostnad, högst två rader, Tech Tree, exklusivitet,
  aktiv Save/Load samt Fleet/Siege-val: [JSON](candidate/browser.json),
  [logg](candidate-browser.log). Resurser och färdiga producenter seedas som
  explicit komponentfixture; ingen ny ekonomimatch hävdas.
- Befintlig releasebrowser PASS vid800/1280 samt1600 Native/Fit: kampanj,
  skirmish, team/spectator, Save/Load, pause/replay/menu, fullscreen,
  upplösningar, reload och assetladdning: [JSON](candidate-release/browser.json),
  [logg](candidate-release.log).
- Representativ researchbild800 är visuellt granskad. Kandidaten har build-ID
  `unknown` eftersom exporten saknar .git; faktisk publicering ska matcha commit-ID.
- Staged diff och användarfilers exkludering kontrollerade. Loggarnas avslutande
  whitespace normaliserad för git diff --check; testresultaten är oförändrade.

Föregående fullregression redovisas i [innehållsrapporten](../../TIDES_OF_WAR.md):
2149 PASS + ett rättat förväntansfel, därefter13/13 PASS utan ändrad spelkod.
CI kör nu hela sviten på exakt commit före Pages-deploy. CI/publicerad
browserstatus kompletteras efter faktiskt avslut; inget sådant PASS hävdas här.

Mänsklig balans/speltid/ljud och storarmélagg är fortsatt begränsningar.
