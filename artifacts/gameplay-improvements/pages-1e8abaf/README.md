# Pages verifierad — Build1e8abaf

[Spela Warbound](https://tobisen.github.io/warbound/) ·
[CI40228163017](https://github.com/tobisen/warbound/actions/runs/40228163017).
Exakt SHA1e8abaf7acf83d1190ee0e42303766211e0f63a0, v0.8.0 (ingen ny version).
Deployment klar2026-10-25 21:23:40 Europe/Stockholm.

[Officiell run/jobstatus](ci.json):npm ci, full2071/225 PASS1757,88s,
spelbuild inklusive strict TypeScript, separat presentationsbuild, artifact och
Pages-deploy PASS. Första40225519236 var röd på3 wall-clockdeadlines; de tre
budgetarna korrigerades i1e8abaf, utan ändrad gameplay/assertions/speltid.
Första körningen räknas inte som PASS eller publicering.

[Publik Chrome800/1280](public.json):HTTP200 och exakt Build1e8abaf;
idle-workerknapp cyklar1→2→3→1 med kamerafokus och synlig ring; betald tornplacering
debiterar50wood/20gold en gång; verklig localStorage Save/load återställer tornet.
Inga runtime-/assetfel. Native800/1280 och presentationens sista slide är
visuellt granskade.13 slides, HOLLOWBANE med3 laddade teaserbilder och PDF HTTP200
med giltig PDF-header. Verifieringsprogrammet exponerar endast Phaser-bootstrap
för assertions; resurser/fog och fryst simulation är uttryckliga testfixturer.
Ingen mänsklig helmatchbalans/ljudlyssning hävdas. Rå CI-logg finns i GitHub och
lokalt /tmp/w2t-pages-1e8abaf/ci.log; browserharness /tmp/w2t-check-public-gameplay.mjs.

Användarens style.css, units.mjs, docs/ och övriga orelaterade filer är bevarade
utanför commits/publicering. Efterföljande rapportpush använder skip-ci och
ändrar inte den verifierade/publicerade spelbuilden.
