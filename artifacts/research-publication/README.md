# Publicering av forskningsfixen i0.9.0 — 2026-11-01

Användaren har efter den lokala felrättningen uttryckligen beställt commit, push
och publicering. Detta ersätter det ursprungliga lokala uppdragets stopp.
Publicering sker via befintlig origin/main och GitHub Pages, utan nytt versionsnummer,
ny tagg eller ändringar av övrig gameplay. [Regressionsrapporten](../research-regression/README.md)
redovisar grundorsak, inventering och den första lokala verifieringen.

Leveransen förbereds i en separat worktree med repositoryts CSS/assetkällor.
Den skyddade arbetskopians20 filer (style.css, units.mjs, docs/ och fristående
filer) har oförändrade SHA256. De ingår inte i commiten eller bygget.

Ny kontroll av leveranskopian:

- `npm run test:unit`: **531 tester / 92 filer PASS**,18,18s.
- Riktad forskning/byggande/Save/kampanj/UI: **196 / 16 PASS**,91,72s.
- `npm run build`: **PASS**, inklusive strict `tsc --noEmit`. Befintlig varning
  om bundle >500kB kvarstår. Ingen försvagad check eller workflowändring.
- [Produktionskontrollen](../../scripts/check-research-published.mjs) körs mot
  den byggda bundlen utan källmodulsimporter: riktiga fuskdialoger finansierar
  resursbanken och visar kartan; bygg-, urvals- och forskningsklick betalar och
  startar riktiga jobb. Befintliga matchticks färdigställer byggnad/forskning.
  Menu Save/Load bevarar aktivt jobb. Alla fem raser i800×600/1280×720 provas.
  **10/10 PASS**, utan page errors eller misslyckade asset-/ljudhämtningar;
  [resultat](candidate/browser.json). Representativa800/1280-bilder granskade.
  Kandidaten byggdes före commit från8d1b51d med exakt de avsedda ändringarna.

Fixcommit `78c301347b896a31dfae93b26a8baba8a15c17b0` är pushad till origin/main.
[Actions41312336167](https://github.com/tobisen/warbound/actions/runs/41312336167)
är **success** för samma SHA: fullregression **2329 tester / 246 filer PASS**
(1488,37s), strict produktionsbuild, presentationsbuild och Pages-deploy **PASS**.
[CI-metadata](ci.json) / [testsammanfattning](ci-summary.json) skiljer detta nya
resultat från tidigare releasebelägg.

Den publika sidan refererar exakt JS/CSS från det rena bygget av78c3013:
[publicerade SHA256](published-files.json) / [lokalt referensbygge](local-build.json).
Publicerad browserkontroll mot faktisk **0.9.0/Build78c3013: 10/10 PASS**,
alla fem raser i800×600/1280×720, utan page errors eller misslyckade asset-/
ljudhämtningar. [Resultat](published/browser.json),
[800-bild](published/crown-800-ready.png) och
[1280-bild](published/crown-1280-ready.png); båda representativa bilder granskade.
Forskningsstart vid markerad ofärdig fjärrbas, betalt bygge, slutförande och
Menu Save/Load med aktivt jobb går genom vanliga produktionsbundlens kontroller.
Arbetskopians [20 skyddade filers SHA256](protected-files.json) är oförändrade
och inga av filerna ingår i fixcommiten.

Slutlig text-/länk-/diffgranskning PASS. Avslutande beläggs-/dokumentationscommit
använder `[skip ci]`; produktkoden ändras inte och publicerad Build är fortsatt78c3013.
De gröna testerna ovan återanvänds uttryckligen för denna rena statusuppdatering.
Ingen mänsklig balans-/ljudgranskning hävdas.
