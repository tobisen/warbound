# CI-deadlines inför Pages — 2026-10-25

[Första körningen](https://github.com/tobisen/warbound/actions/runs/40225519236)
för3b2596a avslutades med3 timeoutfel,2068/2071 PASS. Bygge/deploy hoppades över.
[Observerade tider och budgetar](observed.json), [officiell run/jobstatus](failed-run.json).
Inga assertionsfel rapporterades. Endast Hard20min-testets deadline höjs300→600s,
och de två betalda storkartmatchernas60→120s. Speltid, fixtures, assertions,
svårighetsmål, workerantal och global testtimeout är oförändrade.

På exporterad kandidat utan användarens lokala CSS-/units.mjs-/docs-ändringar:
[riktade3/2 PASS](targeted.log)160,77s (övriga11 tester i filerna filtrerade),
[unit543/93 PASS](unit.log)21,73s, [build inklusive strict TypeScript PASS](build.log)
759ms. Befintlig bundlevarning och exportens Buildunknown-fallback kvarstår;
metadatafelet är ingen misslyckad build. Normaliserad loggwhitespace, inga ändrade
kommandoresultat. Ingen ny lokal fullregression för enbart dessa tidsbudgetar.
Ny full CI/publicering följs separat; den röda körningen räknas inte som PASS.

Efterföljande [CI40228163017](https://github.com/tobisen/warbound/actions/runs/40228163017)
för1e8abaf PASS:full2071/225, strict build, presentation och Pages-deploy.
[Verifierad publicering](../pages-1e8abaf/README.md) redovisas separat från det
första röda försöket. Alla spelkrav och testassertions är bevarade.
