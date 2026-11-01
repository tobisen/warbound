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

Full regression ska köras av befintlig CI före Pages-deploy. Faktiskt CI-/deploy-
resultat, publicerad Build-ID och browserkontroll läggs till efter publicering.
Ingen mänsklig balans-/ljudgranskning hävdas.
