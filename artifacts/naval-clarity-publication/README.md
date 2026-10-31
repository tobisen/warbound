# Publicering av sjö-/tydlighetsuppdrag — 2026-11-01

Nytt uttryckligt mandat: commit, push och publicering till befintlig origin/main
och GitHub Pages. Föregående lokala rapport är historik. Ingen versionshöjning.

Repositoryts CSS används i en isolerad leveranskopia. Användarens lokala CSS,
units.mjs, docs/ och fristående filer följer inte med i commiten och bevaras.
`protected-before.json` innehåller deras checksummor före publiceringsarbetet.

## Kontroll före commit

Isolerad kopia av stage:ade filer med repositoryts CSS och units.mjs:

- `npm run test:unit`:568 tester/96 filer PASS, [logg](unit.log).
- `npm run build`: strict `tsc --noEmit` och Vite PASS, [logg](build.log).
- Riktad forskning:13/3 PASS, [logg](research-targeted.log).
- Produktionsbundle i native Chrome800×600/1280×720: alla fem raser PASS,
  [browserdata](local/browser.json) och [logg](local-browser.log).
  Byggnader, sen teknik och bank är uttryckliga komponentfixturer. Faktiska
  UI-klick betalar forskning/enheter; verkliga matchticks färdigställer de tre
  stora rollerna. Native Save/Load bevarar forskning, två hamnar, separata
  waypoints och köer. Inga källmoduler importeras i produktionsprovet.
- Ny isolerad CSS-kontroll hittade en för lång forskningsspärrtext. Korten visar
  nu kort status; full spärrorsak och krav finns kvar i fokus-/hovringstext.
  Ett beteendetest tillkom. Unit/build/browser upprepades efter denna UI-fix.
- Källor/diff granskade; native bilder visuellt granskade. Inga kända blockerande
  fynd. `git diff --check` och skyddade filers SHA256 PASS.

Produktionskopian byggdes före leveranscommit, därför visar lokala bilder
Buildd32406d; faktisk Pages-build ska kontrolleras mot den nya SHA:n.
Tidigare lokala belägg finns i [implementationsrapporten](../naval-clarity/README.md).
Ny fullregression, strict build och Pages kördes av befintligt GitHub Actions-flöde
för leveransens exakta SHA; faktiskt resultat redovisas nedan.

## Kvarstående begränsningar

Den riktade optimeringen löser inte alla frame-toppar; se
[prestandarapporten](../naval-clarity/performance.md). Ingen ny mänsklig
ljudlyssning eller lång balansmatch hävdas. Målade handlings-/riktningsbilder
har exporterade mellananimationsfaser. Vites stora-bundlevarning är befintlig.

## Faktisk publicering

Leveranscommit [`bc38db0`](https://github.com/tobisen/warbound/commit/bc38db02d3f090fd133494f4204dc70d026db574)
är pushad till origin/main och publicerad som **0.8.0 / Buildbc38db0** på
[Warbound](https://tobisen.github.io/warbound/).
[Actions41249521899](https://github.com/tobisen/warbound/actions/runs/41249521899)
är faktiskt **success** för samma SHA: **2290 tester/243 filer PASS** (1000,73s),
strict TypeScript/produktionsbuild, presentationsbuild och Pages-deploy.
Se [CI-status](ci.json), [sammanfattning](ci-summary.txt) och [logg](ci.log).
Den nya fullkörningen med exit0 ersätter föregående lokala delvis röda testbelägg
för den levererade koden; historiska loggar ändrar inte sina resultat.

[Publicerad browserkontroll](published/browser.json): Chrome native800×600 och
1280×720 för Crown, Goblins, Clans, Elves och Dwarves, rätt Buildbc38db0,
byggnadsspecifik forskning utan sidor/högst två rader, betald Light Hulls,
produktion av alla tre stora roller och native Save/Load. Två hamnar med
separata punkter, högerklick/Shift-rensning och sparade köer PASS. Uttryckliga
komponentfixturer enligt rapporten; ingen ny mänsklig ekonomimatch hävdas.
[Browserlogg](published-browser.log); publicerade nativebilder visuellt granskade.

[Sex publicerade filer](published-assets.json): atlas-PNG/JSON, manifest och
alla tre PCM-ljud svarar HTTP200 och matchar leveranscommitens SHA256 exakt.
[Skyddade filers efterhashar](protected-after.json) matchar samtliga14 förehasher.
Användarens CSS, units.mjs, docs/ och fristående filer bevaras utanför leveransen.

Refererade loggar inkluderades uttryckligen trots repositoryts loggignore.
Avslutande blanksteg i loggkopior normaliserades i dokumentationsuppföljningen;
resultaten ändrades inte. Den avslutande beläggs-/dokumentationspushen använder
`[skip ci]`: inga kod-/test-/assetändringar eller ny deployment behövs.
Inga nya kodtester/builds för dessa uppföljningsfiler. Buildbc38db0 består.
