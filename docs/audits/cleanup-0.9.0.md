# Varsam filstädning —0.9.0,2026-11-01

Inventeringen omfattade gitstatus, spårade filer, scripts, Pages-workflow,
bygg-/testmanifester, filstorlekar och referenssökning. Användarens befintliga
CSS, units.mjs, docs/art och fristående filer skyddas med SHA256 utanför repot.

## Exakt borttagning

| Fil | Byte | Skäl |
| --- | ---: | --- |
| `artifacts/army-movement/test-full-interrupted.log` |269| Avbruten gammal körning med endast starthuvud och ett delresultat; ingen slutsummering. Inga konsumenter eller dokumentreferenser hittades. Den avslutade körningens logg och verifieringsmanifest finns kvar. |

Ingen källkod, resurskälla, licens, sparning eller testfil raderas. README:s
947 rader bevaras i [historisk referens](../history/readme-before-0.9.md),
med lokala länkar anpassade till den nya platsen.

## Bevarade kandidater

| Kandidat | Varför den behålls |
| --- | --- |
| Övriga `artifacts/**/*.log`, JSON, profiler och PNG | Historiskt verifieringsunderlag. `verification-final.json` refererar äldre mellankörningar; ålder gör dem inte säkert oanvända. |
| BACKLOG, DEV_LOG, HANDOFF, QUALITY_REVIEW och rollfiler | Aktiva instruktioner och framtida Codex-kontext; historik skiljs från aktuell verifiering genom nya daterade avsnitt. |
| `assets/sources/`, originalinspelningar och licenser | Källa, provenance och reproducerbar export. |
| Presentationens PDF och exporter | PDF kopieras uttryckligen av Pages-workflow; inte oanvända utdata. |
| `docs/art/`, CLEANUP_REPORT.md och `:memory:.ses` | Befintligt otrackat användararbete; avsikt och fortsatt användning kan inte avgöras. Ingår inte i releasen. |
| `src/style.css`, `assets/sources/units.mjs` | Användarändringar bevaras byteexakt men exkluderas från releasecommiten. |
| `dist/`, node_modules och Vitecache | Ignorerade lokala bygg-/verktygsfiler; behövs under verifieringen och följer inte med i källcommiten. |

Inga generella rensningskommandon mot arbetskopian eller användarens docs har
körts. Flyttade dokumentlänkar och releaseurval kontrolleras före commit.
