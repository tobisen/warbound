# Publicering av sjö-/tydlighetsuppdrag — 2026-10-31

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
Ny fullregression, strict build och Pages körs av befintligt GitHub Actions-flöde
för leveransens exakta SHA. Ingen framtida framgång hävdas.

## Kvarstående begränsningar

Den riktade optimeringen löser inte alla frame-toppar; se
[prestandarapporten](../naval-clarity/performance.md). Ingen ny mänsklig
ljudlyssning eller lång balansmatch hävdas. Målade handlings-/riktningsbilder
har exporterade mellananimationsfaser. Vites stora-bundlevarning är befintlig.
