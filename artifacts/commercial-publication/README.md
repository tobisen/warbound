# WBC-001/002 — commit/push och väntande Pages-publicering

2026-11-04. **Dokumentationen är committad/pushad; ny Pages-publicering är
Pending på grund av GitHubs driftstörning.** Ingen ny CI-/deploy-PASS hävdas.

## Levererat

Commit `e180585b4ad7ca621835ed951718946b7d5ea0d3` är pushad utan force till
befintlig origin/main. Den innehåller13 Markdown-filer: kommersiell audit,
WBC-002:s produktbeslut, rotindex/loggar och stående commit/push/Pages-mandat i
[AGENTS.md](../../AGENTS.md). Inga source-, dependency-, asset- eller workflowfiler
ändras. Användarens14 lokala skyddade filer är SHA256-oförändrade och exkluderade.
[Scope på GitHub](https://github.com/tobisen/warbound/blob/e180585b4ad7ca621835ed951718946b7d5ea0d3/docs/commercial/RELEASE_SCOPE.md)
har blob69f7db602001891d09afef70ff7270862c972302, exakt samma som lokal commit.

## Faktisk publiceringsstatus

[Befintlig CI/Pages41865103570](https://github.com/tobisen/warbound/actions/runs/41865103570)
startad via workflow_dispatch för exakt e180585,2026-11-04 kl17:13:26 svensk tid.
Senaste API-kontroll: queued, ingen tilldelad runner, inga test-/byggsteg körda.
Inga väntande manuella deployments/approvalspärrar identifierade.

[GitHubs officiella status-API](https://www.githubstatus.com/api/v2/summary.json)
rapporterar Actions och Pages degraded_performance, incident xr3myzj7ms51
”Incident with Actions and Pages”, investigating sedan17:05:31 svensk tid.
Körningen lämnas köad, utan omstart, testkringgång eller workflowändring.
Statusen är ett daterat belägg; kontrollera den faktiska körningen igen efter
återhämtning innan ny publicering påstås.

Faktisk publik Chrome-kontroll2026-11-04 kl17:21:09 svensk tid:
[Warbound](https://tobisen.github.io/warbound/) HTTP200, v0.9.0/**Build00a05da**,
0pageerrors. Det är den tidigare releasen, inte leveranscommiten e180585.
Dokumentationen är publicerad på GitHub; Vite/Pages kopierar inte automatiskt
docs/commercial till spelets webbrot.

## Ny lokal verifiering

- Dokument-/länk-/taskgranskning:65 tasks,333 giltiga filreferenser,52 lokala länkar och acykliska beroenden före leveranscommit; diff/review PASS.
- Ren detached worktree på e180585 exkluderar användarens CSS/assets. Befintliga låsta dependencies återanvänds utan installation. `npm run build` inklusive strict TypeScript PASS, Vite539ms med befintlig bundlevarning.
- Produktionsbrowser800×600/1280×720: riktig meny, native storlek, inga automatiska fullscreenbyten, faktisk Skirmishstart, Menu Save/Load/resume och reload PASS;0runtime-/assetfel. Human respektive Goblin, temporär egen browserlagring, ingen cheat/injektion/manuell tick.
- Första lokala harness antog exakt fliktitel ”Warbound”; verklig oförändrad titel är ”Warbound — A Tribute to Warcraft II”. Kontrollscriptet rättades, ingen produktkod ändrades. Slutomgången2/2 PASS och representativa home800/game1280-bilder granskade.
- Ingen lokal full testsuite, mänsklig balans eller ny faktisk ljudlyssning. CI:s fullregression har ännu inte startat; äldre PASS är historik.

Lokala råbelägg: `/tmp/w2t-commercial-local-final/browser.json`, intilliggande
PNG; `/tmp/w2t-commercial-local-build.json`, `/tmp/w2t-commercial-ci-status.json`,
`/tmp/w2t-commercial-current-public.json` och PNG. Kontrollscript:
`/tmp/w2t-commercial-browser.mjs`. Dessa är lokala/tillfälliga, inte garanterat
beständiga repository-artifacts.

Förberedd referens från rent e180585-bygge inför senare publik jämförelse:

| Fil | SHA256 |
| --- | --- |
| assets/index-ymhG0aOK.js |941e07a080969a7ab8bfef0406d06a241e91ca3f14b17395e63b0aefbc04800c |
| assets/index-B0Z11rfQ.css |a27f17568d9488af8f7326e3a06e7c4c76eca09b0b3acebdda8a5261e0d8cd3f |

Efter GitHubs återhämtning: verifiera full npm test/strict build/presentation/
Pages för41865103570 och faktiskt nytt build-ID/bundlehashar samt publicerat
smokeprov800/1280. Om körningen fallerar rapporteras konkret fel; ingen
publicering markeras klar enbart för att ett workflow är köat. WBC-003 har
inte påbörjats. Stående framtidsmandat och bevarade taskstopp gäller.
