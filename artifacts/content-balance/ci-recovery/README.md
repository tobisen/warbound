# CI-tidsgränser — 2026-10-26

[CI40279167980](https://github.com/tobisen/warbound/actions/runs/40279167980)
för311c835:2090 PASS och3 timeoutfel av2093/229,1922,17s; bygge/deploy kördes inte.
Plains96495,286s/300s; Plains128230,624s/120s; strikt Save75-migration5,280s/5s.
Plains96:s initiativprov passerade593,287s/600s och behöver även det marginal.

Endast individuella runnerbudgetar:900/600/30s respektive900s för initiativet.
Gameplay, fixtures,780/1200s simulerad tid, assertions och två CI-workers är
oförändrade. Granskad diff innehåller ingen app-/workflowändring.

Ny lokal kontroll inför korrigeringscommit: unit546/94 PASS18,43s,
Save75-migration1/1 PASS3,14s (hela kommandot4,27s), strict build PASS.
Tidigare godkända simuleringar och kandidatens browserkontroller återanvänds
för oförändrad logik/UI; nya GitHub-körningen kör åter hela testsuiten före deploy.
Loggarnas avslutande whitespace är normaliserad utan ändrade resultat.
