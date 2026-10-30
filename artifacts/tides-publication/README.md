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
Efterföljande CI på exakt kodcommit är nu helt grön, se slutresultat nedan.

Mänsklig balans/speltid/ljud och storarmélagg är fortsatt begränsningar.

## Slutresultat på GitHub och Pages

Kodcommit [bd6d0f3](https://github.com/tobisen/warbound/commit/bd6d0f38b4bcd8952b9e437a913cb77ac0286481)
är pushad till origin/main. [CI41110668899](https://github.com/tobisen/warbound/actions/runs/41110668899)
PASS:2150/235 på1406,32s; strict TypeScript och Vite894ms PASS, presentation257ms
PASS, Pages-deploy PASS. [CI-metadata](ci.json) och [komplett CI-logg](ci.log).
ANSI-färgkoder/avslutande whitespace normaliserade i kopian; resultat oförändrade.

[Publik sida](https://tobisen.github.io/warbound/) verifierad med förväntat
Build bd6d0f3 och produktversion0.8.0. Fem fraktioner ×800/1280 ger10/10 PASS
för ny forskning, exakta kostnader, paginering/två rader, Tech Tree, exklusivitet
och aktiv native Save/Load. [JSON](published/browser.json),
[logg](published-browser.log). Separat releasekontroll4/4 PASS800/1280 samt1600
Native/Fit: kampanj, skirmish, team/spectator, Save/Load, paus/replay/menyer,
fullscreen, upplösningar, reload och resurser. Alla fyra rapporter har
`Build bd6d0f3`, noll pageerrors och noll assetfel.
[JSON](published-release/browser.json), [logg](published-release.log).

Visuellt granskade [research800](published/dwarves-800-research.png) och
[Tech Tree1280](published/elves-1280-technology.png). Den riktade forsknings-
kontrollen seedar resurser/färdiga byggnader, som före publiceringen.

Två tidiga försök av nya publika browserkontrollen avbröts när fixturen startade
innan initial scen/vald match var laddad. Kontrollskriptet väntar nu på färdiga
resurser, initial scen och vald Fleet-match. Inga assertions togs bort. Därefter
PASS10/10; den befintliga releasekontrollen PASS4/4. Ingen spelkod ändrades.
Slutlig script-syntax, diff, dokumentlänkar och bevarade användarfiler kontrollerade.

Uppföljningscommit med scriptväntan, loggar, bilder och slutlig dokumentation
använder `[skip ci]`: den ändrar inte den publicerade spelbuilden eller dess
verifierade källkod. Ingen ny produktversion, tagg eller separat GitHub-release.
