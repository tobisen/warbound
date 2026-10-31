# Prestandamätning — lokal Chrome, native1280×720

Varje före/efterpar kördes separat, utan samtidiga tester. Reproducerbara
stressarméer med injicerade, tåliga enheter över betald supply; inte ett normalt
ekonomi- eller mänskligt balansprov. Spelmotorns vanliga AI, fog, navigation och
strid körs. Inga tickfrekvenser, sikt-/attackregler eller AI-tidsmål sänktes.

## Före/efter

| Scenario / mått | Före p50 / p95 / max (ms) | Efter p50 / p95 / max (ms) | >50 ms före → efter |
|---|---:|---:|---:|
| 128 fiender → 32 försvarare · frame interval | 16.7 / 16.8 / 216.6 | 16.7 / 16.8 / 216.7 | 1 → 1 |
| 128 fiender → 32 försvarare · CPU update | 10.9 / 18.2 / 133.6 | 10.0 / 16.0 / 130.5 | 1 → 1 |
| 128 markerade egna → dold bas +32 försvarare · frame interval | 16.7 / 33.4 / 216.7 | 16.7 / 33.3 / 216.6 | 2 → 2 |
| 128 markerade egna → dold bas +32 försvarare · CPU update | 12.4 / 24.5 / 98.4 | 12.0 / 24.2 / 97.7 | 1 → 3 |

CPU-sampling pekade på separation mellan kroppar, fog/LOS och statiska
kollisionssökningar; UI/rendering mättes också. I första provet var separation
störst (1444 ms self sampling); fog1005, nearbyObstacles800, visuals p95 4,0 ms,
render p95 0,9 ms. I det egna framryckningsprovet var nearbyObstacles störst
(1561 ms self sampling), följt av fog957, separation859 och visionLine681.

Ändringen behåller exakt samma närmaste12 grannar och ordning, men håller en
begränsad sorterad lista i stället för att sortera alla grannar i varje tät cell.
Ett deterministiskt jämförelsetest ger exakt samma korrigeringar för16/64/160
blandade kroppar över flera steg. Den gamla lösaren finns bara som testreferens.

Första provets CPU p95 sjunker18,2→16,0 ms. Spelarens framryckning visar en
mindre total skillnad24,5→24,2 ms; kontaktfasens CPU p95 sjunker16,1→14,1 ms.
Det går inte att hävda att allt lagg är löst: frame p95 för hela framryckningen
ligger kvar kring33 ms. Initiala gruppvägar och senare omplanering samt LOS/
kollision/rendering kostar fortfarande tid. Första arméuppställningen ger
97,7–130,5 ms CPU och omkring216,6–216,7 ms frame interval efter ändringen.
Ingen bred motoromskrivning genomfördes. Se råa JSON-filer, fasvärden och
CDP-profiler i denna katalog för alla toppar och tidpunkter.

## Flera stora enheter

| Scenario | CPU p50 / p95 / max (ms) | Frame p50 / p95 / max (ms) | Frame >50 ms / prover |
|---|---:|---:|---:|
| capital | 4.3 / 5.0 / 65.5 | 16.7 / 16.7 / 133.3 | 1 / 596 |
| zeppelin | 3.9 / 4.9 / 68.3 | 16.7 / 16.8 / 100.0 | 1 / 596 |
| behemoth | 4.6 / 5.4 / 66.4 | 16.7 / 16.7 / 100.0 | 1 / 597 |

Tre separata10-sekundersprov med verkliga stridsuppdateringar:12+12 kapitalfartyg;
8 zeppelinare +16 bågskyttar per sida;16+16 krigsdjur. Injekterade styrkor över
supply; stora enheternas HP följer recepten. Eskortbågskyttarna har uttryckligt45 HP
i fixturen (normalt Goblin30 HP), så stridslasten varar längre. Vanliga attacker. Ingen krasch eller upprepad serie av >50 ms
frame-stopp under dessa korta prov, men ett enstaka100–133 ms-stopp i varje.
Det är inte ett löfte om obegränsade arméer eller mänskligt godkänd balans.

Browser: 156.0.8078.76. Chrome headless på den lokala datorn; värden är
jämförbara inom paret, inte en FPS-garanti för annan hårdvara.
