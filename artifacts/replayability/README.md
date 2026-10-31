# Omspelbarhet — verifieringsunderlag 2026-10-31

Lokal vidareutveckling av Island Fleets. Ingen commit/push/publicering.
Se [rapporten](../../REPLAYABILITY.md) för baslinje, exakta ändringar och gränser.

## Browser

- `browser.json`: faktiska bygg-/produktions-/forskningsklick, exklusiva skrov,
  två forskningsrader och Save vid800×600/1280×720. Finansierad komponentfixture.
- `map-starts.json`: alla fyra kartor faktiskt startade via menyn, resurser,
  sjöväg, strict Save och rendering. `map-*.png` visar starter.
- `strategy-browser.json`: fyra fungerande Skirmish-upplägg, normalt finansierad
  AI-arbetarlast, landning och utpost vid800/1280. `colony-*.png` visar förloppet.
  Endast observationskopian avslöjar fog; AI:n arbetar med ordinarie sikt.
- `campaign-browser.json`: kampanjmeny, samtliga nya Tidebreak-faser, Save och
  resultatskärm. `tidebreak-phase-*`, `tidebreak-briefing-*` och
  `tidebreak-victory-*` visar dem. Tidigare kampanjprogress seedas enbart för att
  öppna uppdraget; själva genomspelningen använder lagliga automatiska order.
  Ingen mänsklig balans-/tidsverifiering hävdas.

- `save-migration-browser.json`: kompakt fyrspelar-Save78 migrerad/omsparad,
  exakt återställd blockadtimer mitt i hålltiden och fortsatt verklig seger.

## Prestanda

- `before-2.json` / `after-2.json`: ursprunglig före/efter-mätning,128 angripare
  och32 tåliga försvarare. Injekterad belastning med ordinarie Phaser-uppdatering.
- `baseline-recheck-2.json` / `after-recheck-2.json`: direkt omkontroll efter
  långsammare första efterprov. Före-koden kommer från orörd lokal källkopia.
- `land-comparison.json`: alla körningar sammanställda, inklusive avvikelsen.
- `before-naval-performance.json` / `after-naval-performance.json`: faktisk
  sjöstrid med16 egna/15 ursprungliga fientliga skepp, native1280 och lagliga
  automatiska order.14 fiendeskepp återstår när mätningen börjar. Båda når seger.
- `.cpuprofile` och bilder sparas för landproven. Ingen parallell testsuite
  kördes under mätningarna. Dokumenterade CPU-/framevärden är lokala mätningar.

## Kod och checks

`source-change.diff.gz` skiljer just denna beställning från föregående lokala
Island Fleets-arbete. `verified-source.json` identifierar slutkoden;
`preserved.json` visar kontrollsummor för användarens skyddade filer.
Slutlig fullregression: 2264 tester/239 filer PASS (1021.40 s). `full-tests.log`, `build.log`,
`targeted-tests.log`, `campaign-tests.log` och `test-manifest.log` innehåller
faktiska utfall. Build inklusive strict TypeScript PASS. Hela uniturvalet
kördes inom fullregressionen; inget separat unitomtag.

Reproduktion: kör lokal Vite på5195 och respektive
`scripts/check-replay-{fleet-ui,map-starts,strategy,campaign}.mjs`.
Land: `W2T_STAGE=after node scripts/check-replay-land-performance.mjs`.
Sjö: `W2T_UI_URL=http://127.0.0.1:5195 W2T_PERF_PREFIX=artifacts/replayability/after node scripts/check-tides-naval-performance.mjs`.
Kör belastningsproven separat från tester och andra browserprov.
