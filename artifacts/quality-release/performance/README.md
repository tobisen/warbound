# Prestanda0.9.0

Reproduktion: `W2T_STAGE=before W2T_APPROACH=1 W2T_SECONDS=20 node scripts/profile-quality-release.mjs`.
Extern Playwright/Chrome krävs. Starta Vite på angiven W2T_UI_URL; default5196.
W2T_STAGE namnger utdata och byter inte kodversion. Kör baseline i ett separat
checkout av19bf3a2 med samma fixture/script och lika lokala vyinställningar;
slutprovet kör releasekoden. Den första mätningen här hade redan de nya, i
armévyn dolda forskningskorten men föregick collision/hot/HUD-ändringarna.
Skriptet mäter faktiska Phaser-update, syncVisuals, rendering, frameintervall,
första synkontakt/basupptäckt och första skada, samt CDP CPU-sampling.

Plains128,128 markerade egna soldater mot32 försvarare och dold bas.
Tåliga injicerade trupper över vanlig supply håller provet igång; inga nya
AI-/fog-/attackregler, sänkta tickfrekvenser eller gratis normalproduktion.
Native1280×720, Chrome156 på samma dator. Inte mänsklig balans eller normal ekonomi.

| Mått, ms | Före p50 / p95 / max | Slutlig p50 / p95 / max |
| --- | --- | --- |
| CPU update |11,4 /21,9 /98,4|10,6 /19,4 /84,6|
| Frame interval |16,7 /33,3 /233,4|16,7 /33,3 /183,3|
| Framryckning CPU |14,3 /26,5 /49,2|12,7 /20,6 /40,2|
| Kontakt CPU |11,8 /14,7 /16,0|10,7 /12,6 /16,1|
| Strid CPU |11,0 /12,9 /31,1|10,2 /11,7 /28,7|
| Visual sync |4,4 /5,2 /7,6|3,9 /4,6 /5,9|

Ett frameintervall över50ms i båda huvudproven, vid initial arméuppställning.
Inga senare>50ms-frame i slutprovet. Total frame-p95 kvarstår kring33ms.
Det är en begränsad förbättring, inte ett löfte om hackfri upptäckt eller60fps
vid obegränsade arméer. Enstaka toppar ska fortsätta mätas.

## Samtliga mätsteg och orsak

- `before-2`: ny ursprunglig baslinje i denna körning, före collisionändring.
- `after-2`: endast numeriska collisionuppslag. CPU p9519,7ms och max88,2ms.
- `final-2`: överlappade ett annat Chromeprov och är olämpligt för jämförelse.
  Rådata bevaras; inget förbättringspåstående bygger på detta prov.
- `final-isolated-2`: efter nya hotfält, före linjär gruppinformation.
  CPU p9528ms och visual p9511,6ms. Profilen visade att gruppinformationen
  kopierade hela listan för varje markerad trupp. En verklig regression rättades.
- `final-linear-2`: första linjära gruppsummeringen, CPU p9519,4/max86,7ms,
  frame max200ms.
- `release-final-2`: tabellens slutsiffror, även sista neutral-/transport-/Save-
  rättningarna, utan samtidiga tester/browserprov. CPU p9519,4/max84,6ms,
  frame max183,3ms.

Ursprunglig self-sampling: nearbyObstacles1564ms, updateFog974ms,
separation660ms, visionLine547ms; visuals och rendering mättes separat.
Efter hotfältens regression låg anonym gruppsummering i selectionInfo högst,
2850ms self i `final-isolated-2`. Samma namn/HP kan beräknas linjärt utan
någon spelregeländring. Kollision jämförs mot linjär referens i riktade tester.

Varje JSON innehåller råsamples, faser och stalltidpunkter; `.cpuprofile`
kan öppnas i Chrome DevTools. Senare justering av passiv arbetar-/närstrids-
admission och Stop-felreset ändrar inte den markerade anfallsfixturens order.
Småkarternas separata efterprov lagras under `small/`; de är inte före/efterpar.

## Ny småkartsgranskning

Twinwake64×48 i native1280,10s per roll, inga samtidiga tester. Varje prov
har en initial topp, inga återkommande>50ms-stopp under resterande korta fönster.

| Styrkor | CPU p50 / p95 / max, ms | Frame p50 / p95 / max, ms |
| --- | --- | --- |
|12+12 kapitalfartyg|4,2 /4,9 /54,7|16,7 /16,8 /116,6|
|8 zeppelinare +16 bågskyttar per sida|3,9 /5,2 /63,0|16,7 /16,8 /83,3|
|16+16 behemoths|4,7 /5,7 /59,4|16,7 /16,8 /83,4|

Reproducerbart med `node scripts/check-quality-small-performance.mjs` mot
server5261. Fixturen använder riktiga recept-HP; Goblin-bågskyttarnas45HP
är en uttrycklig stressjustering. Detta är nya efterprov, inte jämförelser med
äldre releasevärden eller en garanti för andra datorer.
