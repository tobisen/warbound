# Pages verifierad — 2026-10-26 — Done

[Spela Warbound](https://tobisen.github.io/warbound/) visar **v0.8.0 / Build791d17f**.
[CI40283143763](https://github.com/tobisen/warbound/actions/runs/40283143763) är grön
för exakt791d17fb36931013f2a06aac77d69ee29bf8f65c: full2093/229 PASS1183,13s,
strict spelbuild, presentation, artifact och Pages-deploy. Deployment klar
2026-10-26 08:21:00 Europe/Stockholm. Innehåll311c835 och budgetfix791d17f pushade.

Första CI40279167980/311c835:2090 PASS,3 timeoutfel, ingen deploy. Endast
individuella runnerbudgetar ändrades, inklusive ett konkret593s/600s-initiativprov.
Fixtures, assertions, gameplaytid och workerantal bevaras; ingen produktversionsbump.
[CI-korrigering](../ci-recovery/README.md).

Publik Chrome800×600/1280×720 Native: HTTP200, exakt Build och canonical URL,
Human-seriens16:e uppdrag,16 egna/15 fientliga skepp, två Tide Runners/två Bombards
samt Sky Owl. Idle Worker3/cykling/fokus/ring och aktiva-order-filter fungerar.
Betalda Foundry95/55, Naval Logistics100/75 och Tide Runner55/25 via riktiga
produktionscallbacks:250 trä/345 guld kvar av500/500 och17 skepp. Riktig initial
Save/load, Tech Tree, atlas520 frames och reload PASS. Presentation13 slides,
HOLLOWBANE3 laddade bilder och PDF HTTP200/%PDF PASS. Noll runtime-/assetfel;
representativa bilder granskade.

Endast verifieringsbrowserns bootstrap exponeras.15 föregående Human-uppdrag
seedas i isolerad teststorage för att öppna det nya sista uppdraget. Input-
kontroller fryses och komponentprovet finansieras uttryckligen. Detta är inte
naturlig kampanjprogression, mänsklig finbalans/speltid eller ljudlyssning.
Tidigare lokal taktisk native-genomspelning och prestandaprov ligger i förälderrapporten;
stora femspelarmatcher är fortsatt CPU-tunga. Användarens CSS/units.mjs/docs/
och orelaterade filer bevaras utanför commit/publicering.

[Publik browserdata](public.json), [CI-jobbdata](ci-run.json), ci.log/public.log och
PNG-bilder ligger här. `node artifacts/content-balance/pages-public/check-public.mjs`
reproducerar proben med lokal Playwright/Chrome; URL/Build/output kan styras via
W2T_RELEASE_URL/W2T_EXPECT_BUILD/W2T_PAGES_OUTPUT. Avslutande rapportpush använder
[skip ci] och ändrar inte publicerad spelbuild; inga nya kodtester hävdas där.
