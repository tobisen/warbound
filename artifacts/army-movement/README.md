# Arméframryckning och AI-territorium — 2026-10-30

Lokalt användaruppdrag. Ingen commit, push, publicering eller produkt-/Saveversion ändrad. Ursprunglig referens: `ebc75acde9d79c9aee9df06f2a11e864a520c409`.

**Det löpande portlagget är åtgärdat i det uppmätta provet. Målet helt utan synliga stopp är inte fullt uppnått:** första kalla samlingsbildrutan och tung fyr-AI-strid har kvar toppar. Inga långsamma bildrutor tas bort ur tabellerna. Expansionen når tre tydligt åtskilda betalda baser på alla tre testade svårigheter.

## Avgörande portfall

När en färdig spelarport fanns skapade `enemyNavigationMap` en ny hinderlista vid varje anrop, även långt från porten. Detta byggde om spatiala index och bröt väg-/kontaktcacher för varje enhet. Nu återanvänds samma gate-blockerade hinderlista per statisk snapshot/revision och portgeometri, även över identiska AI-projektioner. Porten blockerar fortsatt fienden och vänliga enheter kan passera enligt tidigare regler. Ny/ändrad/borttagen port, terräng och init-push invaliderar.

Samma40-enhetsanfall,32 försvarare, färdig hållbar spelarport och12 gameplaysekunder i faktisk Chrome/Phaser. Endast den ursprungliga adapterfunktionen skiljer kontrollen från efterläget (`W2T_GATE_UNCACHED=1`); alla övriga optimeringar finns på båda sidorna. `gateBlocks:1` verifierar att porten finns kvar hela provet.

| Mått (ms) | Ursprunglig adapter | Cachad adapter |
|---|---:|---:|
| Frame p50 / p95 / max | 83.4 / 183.3 / 283.3 | 16.7 / 16.7 / 233.4 |
| Update-CPU p50 / p95 / max | 87.1 / 177.7 / 280.3 | 6.5 / 9.4 / 122.7 |
| Bildrutor >50ms | 167 | 1 |

| Fas | Frame-p95 före → efter (ms) | Frame-max före → efter (ms) | CPU-p95 före → efter (ms) |
|---|---:|---:|---:|
| Samling | 100.0 → 16.8 | 266.6 → 233.4 | 94.3 → 8.1 |
| Vägval/framryckning | 216.7 → 16.7 | 233.3 → 16.8 | 206.6 → 6.8 |
| Kontakt/målval | 216.7 → 16.7 | 216.7 → 16.8 | 207.5 → 10.5 |
| Strid | 183.4 → 16.7 | 283.3 → 16.8 | 188.8 → 9.7 |

Efter den kalla samlingen har vägval, kontakt och strid inga frame-stopp över50ms i portprovet.128 angripare/fyra AI med port är också körda i12s: frame33.3 / 50.0 / 466.7ms och CPU31.1 / 45.6 / 200.4ms;13 av408 bildrutor över50ms. Det större provet har kvar toppar.

[Portkontroll](gate-control-2.json), [port efter](gate-after-2.json), [fyra AI med port efter](gate-multi-after-5.json). Motsvarande `.cpuprofile` och `.png` hör till varje JSON.

## Längre prov utan port

Plains128,40 gameplaysekunder,1280×720 Native och oförändrad simulationsfrekvens/upplösning.32 försvarare och80 angripare eller fyra allierade AI med32 angripare var. Styrkorna injiceras med10000HP över vanlig betald supply för reproducerbar belastning. Detta är ett belastningsprov, inte ekonomibelägg. Basens tidigare scoutade position är explicit känd; aktuell fog och strid beräknas normalt. Alla AI-vyer har samma konsekventa världssnapshot före första samlingsordern.

| Scenario | Före frame p50 / p95 / max (ms) | Efter frame p50 / p95 / max (ms) | Frames >50ms före → efter |
|---|---:|---:|---:|
| 80 angripare,1 AI | 16.7 / 33.3 / 2583.2 | 16.7 / 16.7 / 216.8 | 3 → 2 |
| 128 angripare,4 AI | 50.0 / 166.7 / 4333.2 | 33.4 / 83.4 / 450.0 | 278 → 202 |

| Scenario/fas | CPU före p50 / p95 / max (ms) | CPU efter p50 / p95 / max (ms) | Frame-p95 före → efter (ms) |
|---|---:|---:|---:|
| 1 AI · samling | 7.5 / 9.2 / 2507.5 | 6.5 / 9.1 / 132.2 | 16.8 → 16.8 |
| 1 AI · vägval/framryckning | 7.5 / 8.5 / 34.5 | 6.5 / 7.6 / 28.6 | 16.7 → 16.7 |
| 1 AI · kontakt/målval | 8.5 / 14.8 / 30.3 | 7.6 / 10.8 / 12.7 | 16.8 → 16.7 |
| 1 AI · strid | 14.4 / 25.6 / 126.8 | 8.2 / 12.7 / 72.9 | 33.3 → 16.7 |
| 4 AI · samling | 29.4 / 32.7 / 4091.6 | 26.8 / 36.3 / 192.8 | 33.4 → 33.4 |
| 4 AI · vägval/framryckning | 34.2 / 45.3 / 140.7 | 30.2 / 41.7 / 93.0 | 50.1 → 50.0 |
| 4 AI · kontakt/målval | 38.0 / 47.6 / 58.1 | 38.6 / 43.8 / 46.6 | 50.1 → 50.1 |
| 4 AI · strid | 65.1 / 184.3 / 286.6 | 36.6 / 86.2 / 169.1 | 183.4 → 83.4 |

Max inkluderar första kalla samlingsordern/fixtureaktiveringen. Frameintervallet innehåller även render, GC och schemaläggning; update-CPU skiljs därför ut. Faserna markeras av samling, dispatch, första människosynliga angripare och första faktiska försvararskada. Kontaktklassen är ingen exakt acquisitiontimer; målval fångas löpande i CPU-profilerna.

## Övriga uppmätta rättningar

- Exakt tile-edge-clearance och komponentkontroll delas mellan mål/enheter. Giltiga formationskorridorer återanvänds med kontrollerade start-/slutsegment och korrekt kropp/domän. Direkt fri väg prioriteras. Ursprunglig source-BFS-ordning behålls; efter reachability väljs bara den redan bekräftat nåbara sloten, utan att generera alla alternativa kontakter igen.
- Rörliga stridsmål använder transient blockerande kropp över statiskt kollisionsindex. Självförsvar återanvänder footprint-undantag i stället för nya hinderlistor. Revision, geometri, bounds, storlek, portändringar och init-push testas.
- Fällt träd/nytt footprint uppdaterar bara berörda passage-clearanceceller. Narrow-komponenter märks om med numeriska tile-ID:n, utan att göra ny fysisk kollisionssökning i varje världscell. ID-sortering återanvänder Intl.Collator och grannavstånd räknas en gång.
- Allierades identiska synunioner återanvänds endast vid exakt observergeometri/radier/airborne/bounds/terräng. Ägarens explored-historia bevaras. Scoped separation flyttar endast ägarens kroppar och behandlar främmande kroppar som fasta i den vyn.
- AI-planering och animation/render var inte huvudorsaken till de ursprungliga stora stoppen. Kvarvarande tung fyr-AI-belastning finns i fulla match-/fog-/fysikvyer och ibland flera ordinarie simulationsslices i samma frame. Ingen godtycklig lagg-väntetid eller sänkt tick, enhetsgräns eller grafiknivå införs.

## Scouting och betald expansion

Före rättning: Normal stannade på två baser efter1500s trots elva observerade guldfyndigheter och1551wood/3642gold. Utgången felhistorik kunde stjäla arbetarens pågående resa till nästa plats. Ett giltigt aktivt scoutmål hålls nu kvar genom omrangering/utgången historik. Misslyckad access, farlig plats eller ankomst utan hel tomtsikt leder till omval. Övergiven aktiv order avbryts med last bevarad; pågående scout får åter sin transient reservation efter Load/omplanering.

Recon följer okända resursvägpunkter och fortsätter till fog-fronten.256 olika blockerade mål minns; fallback respekterar dem. Fler gridade kandidater kommer från ihågkomna gruvor, utan dolda live-resursvärden. Byggadmission kräver aktuell hel tomtsikt, verklig access, spawnutgång, tom fysisk footprint och faktisk betalning. Stora strategiska kartor kräver640px basavstånd. Mindre/äldre kartor behåller kartanpassning320px. Easy/Beginner tillåter tre baser. Garnisonen begränsas av faktiska betalda kroppar så ett minsta fältdetachement ryms även efter förluster; ingen cap eller anfallsklocka ändras.

| Svårighet | Tredje färdiga bas | Minsta basavstånd | Utforskat efter25min | Kända gruvor |
|---|---:|---:|---:|---:|
| Normal | 12:13 | 702.5px | 99.9% | 11 |
| Easy | 12:50 | 702.5px | 92.9% | 11 |
| Beginner | 14:38 | 702.5px | 84.4% | 10 |

Alla tre slutmatcher har strict Save/load PASS, återupptagna native-frames och noll pageerrors. Ledgerfel är mindre än0,000001. Save-storlek1,33–1,49MB. Normalbaser:(3504,3344),(3152,2736),(1584,2544); Easys tredje bas:(1392,2608). Vanlig AI-ekonomi/fog gäller med1s-updateMatch-steg och spelets ordinarie delningar. Endast skada mot passiva mänskliga mål omdirigeras med befintligt damage-scope. Inga AI-resurser/enheter/sikt/byggtider injiceras. Human-only reveal används efter progressionen för basbilder.

[Normal](territory-final-normal.json), [Easy](territory-final-easy.json), [Beginner](territory-final-beginner.json), [native browserlogg](territory-browser.log). Faktiska basbilder heter `territory-final-<difficulty>-base-0/1/2.png`. Representativa bilder har granskats. Belastnings- och ekonomifixturer skiljs uttryckligen åt. Ingen mänsklig helmatch-/laggfrihetsbedömning eller garanti för annan hårdvara hävdas.

## Verifiering och granskningsfynd

Full regression2124/233 PASS915.28s. Unit555/95 PASS18.31s. Build inklusive strict TypeScript PASS723ms med befintlig bundlevarning. Riktad sjö-/nav-/formation29/4 PASS; tidigare port/AI/nav/fortifikation/lag45/5 PASS. Manifest, scriptsyntax, källfingeravtryck, nya länkar och diff kontrolleras före slutrapport.

Egen review och regression hittade och rättade övergiven scoutorder samt Beginner-passivitet efter förluster. En felställd komponentfixtur korrigerades från Normals tre till Beginners två i minimigrupp. Lokal barriärkontroll behövde204 av4096 celler; ett för snävt testtak<200 ändrades till<256 utan ändrad spelregel.

Två fullförsök avbröts (Beginner-fynd, därefter portprofilering) och räknas inte som PASS. En komplett mellanversion gav2123 PASS/1 FAIL: sjökampanjens genomspelning nådde fas3. Isolerade källkontroller visade ändrad formations-BFS-vägordning som orsak. Ursprunglig vägordning återställdes med cachad exakt clearance och slopad redundant kandidatgenerering. Samma oförändrade720s-test når åter seger vid76s och samtliga fas-/Save-assertions behålls. Alla slutprofiler och ekonomiproven har uppdaterats efter rättningen. Mellanliggande debug-/after-/final-/verified-data är inte slutkontroller.

## Reproduktion

```sh
W2T_BASELINE_REF=ebc75acde9d79c9aee9df06f2a11e864a520c409 W2T_STAGE=before-final node scripts/profile-army-movement.mjs
W2T_STAGE=delivered node scripts/profile-army-movement.mjs
W2T_BASELINE_REF=ebc75acde9d79c9aee9df06f2a11e864a520c409 W2T_STAGE=before-final W2T_PLAYERS=5 W2T_ARMY=32 node scripts/profile-army-movement.mjs
W2T_STAGE=delivered W2T_PLAYERS=5 W2T_ARMY=32 node scripts/profile-army-movement.mjs
W2T_STAGE=gate-control W2T_GATE_UNCACHED=1 W2T_GATE=1 W2T_ARMY=40 W2T_SECONDS=12 node scripts/profile-army-movement.mjs
W2T_STAGE=gate-after W2T_GATE=1 W2T_ARMY=40 W2T_SECONDS=12 node scripts/profile-army-movement.mjs
W2T_STAGE=gate-multi-after W2T_GATE=1 W2T_PLAYERS=5 W2T_ARMY=32 W2T_SECONDS=12 node scripts/profile-army-movement.mjs
node scripts/check-ai-territory-browser.mjs
npm run test:unit
npm test
npm run build
git diff --check
```

Före-läget läser ändrade gameplay/config-moduler från vald Git-referens read-only; nya fixtures/testfiler behålls. Portkontrollen byter enbart enemyNavigationMap till ursprunglig adapter. Lokala CSS/assets och matchfrekvens är identiska. Scripts kräver befintlig lokal Chrome och Playwright under presentationen. Ingen debug-API levereras i produkten.

[Samlad jämförelse](comparison.json), [80 före](before-final-2.json), [80 efter](delivered-2.json), [fyra AI före](before-final-5.json), [fyra AI efter](delivered-5.json), [källfingeravtryck](source-checksums.txt). CPU-JSON:s inklusiva summeringar överlappar och ska inte adderas; per-updatevärden tar hänsyn till olika antal frames. Ursprunglig femspelarfixture korrigerades till konsekvent kartprojektion före båda slutjämförelserna.
