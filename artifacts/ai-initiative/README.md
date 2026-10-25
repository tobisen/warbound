# AI-initiativ — 2026-10-25

Nytt lokalt användaruppdrag. Ingen commit, push, release eller publicering.
Användarens befintliga style.css, units.mjs, docs/, CLEANUP_REPORT.md och
:memory:.ses bevaras. Den tidigare strategileveransen7abb3fc och dess kontroller
är historiska; nya bevis nedan gäller arbetskatalogens AI-ändringar.

## Vad som ändras

- Tidig markspaning med en redan betald lämplig enhet; garnisoner och anfalls-
 grupper disponerar andra enheter. Egen fog, vanliga färdvägar, reträtt vid
 synliga hot/skada och ersättning efter död. Senare flygscouts undviker synlig AA.
- Befintlig strategiplan får uttryckliga faser och svårighetsgradernas attack-
 och rädmål. Grundprofil: första tidsgrind Easy300/Normal240/Hard180s; åter-
 kommande dispatch tidigast270/210/150s. Färdig användbar styrka behövs också.
 Personlighet fortsätter justera tider/reserver oberoende av svårighet.
- Synliga oskyddade ekonomimål kan väljas framför övermäktigt basförsvar;
 taktiskt mål hålls30s. Stora förluster undviker senaste målet90s och ger nya
 angreppsvägar medan befintlig betald combined-arms-produktion ersätter armén.
- Små överlevande grupper sammanförs även utan fiendestyrketröskel. Den äldsta
 samlingstiden bevaras, och projektilenheters faktiska DPS ingår i styrkevärdet.
- Separata tidsgrindar för senare resursbaser. Research får inte hålla andra
 basen låst obegränsat. Befintligt säkert platsval, bounded admission, kostnader,
 blockeringsbackoff, dropoffs och garnisoner återanvänds.

Ingen gratis inkomst, ändrad startbank, dold motståndarinformation eller ny
produkttyp införs. Fulla arméer stannar vid sina gränser; därefter används
inkomster till teknik och ersättare. Resursbaserna är spelets befintliga
outposts med leverans/supply/garnison och gemensam arbetarproduktion. Ingen
separat ny typ av AI-townhall införs. Kampanj/äldre kartors policy bevaras.

## Reproducerbara scenarier

```sh
npm test -- src/gameplay/enemyInitiative.test.ts src/gameplay/enemyTactics.test.ts
node scripts/simulate-enemy-initiative.mjs
```

[Scenariohjälparen](../../src/gameplay/testHelpers/enemyInitiative.ts) kör varje
fall i1200 verkliga spel-sekunder genom MatchState: Arena Normal/Easy/Hard och
Plains96 Normal (2048 respektive4096px kartor). Kartorna är deterministiska;
slumpfrön finns inte i dessa kartdefinitioner.

AI:n får endast ordinarie startbank och verklig finite utvinning/leverans.
Multiplayerns befintliga `side:enemy`-träffsänka behåller passiva spelarobjekt vid
liv, med verkliga sikt-, väg-, räckvidds-, projektil- och träffregler. Den stoppar
spelarens offensiv; därför går det att kontrollera utveckling utan AI-förluster.
Detta är en tydligt kontrollerad uthållighetsfixture, inte en orörd match mot en
aktiv människa eller en seger-/balansmätning.

Vid720s tas70% av tillgängliga trupper utanför garnisonen bort uttryckligen;
Save/ledger, ny betald produktion och nya dispatch/träffar kontrolleras därefter.
Scouting mäts både med spanarens förflyttning400px och någon egen enhet640px
från ursprungsbasen. Alla producerade trupper lever före förlustinjektionen.
Army/supply, worker-/byggnadsantal och resursernas bevarande kontrolleras.
De långa integrationerna har separata wall-clockbudgetar för verklig fog/
navigation/combat:300s,600s på4096-kartan. Spelkravet1200s, anfallsdeadlines,
expansionsdeadlines och övriga assertions är oförändrade.

[Baslinjen](baseline.json) gäller7abb3fc före ändringen och är diagnostik utan
nya beteendeassertions. Den visar att den äldre AI:n redan expanderade och
anföll i dessa passiva fixtures; de nya förbättringarna gäller tidigare separat
spaning, tydligare press/återhämtning och nya långmatchbevis, inte att alla
initiativmekanismer saknades.

## Slutliga20-minutersresultat

[Maskinrapport](results.json), Vite-bundlad produktion från slutlig spelkod.
Samtliga fyra fall når1200s med oförändrade AI-kostnader och egen fog.

| Karta/svårighet | Scout640px | Första dispatch/träff | Andra/tredje bas | Betalda ersättare efter12min |
| --- | --- | --- | --- | --- |
| Arena/Normal |0:47 |4:00 /4:11 |3:59 /10:40 |6 |
| Plains96/Normal |0:47 |4:00 /4:30 |3:42 /10:25 |5 |
| Arena/Easy |1:30 |5:00 /5:12 |4:20 /max2 baser |3 |
| Arena/Hard |0:31 |3:48 /4:00 |3:06 /7:54 |11 |

Normal gör nya dispatch vid4:00,7:30,12:01 och15:31 på båda kartorna. Redan
stridande grupper fortsätter skapa tryck däremellan och efter sista dispatch.
Hard dispatch3:48/6:18/10:49/13:19; Easy5:00/12:27. Skillnaden påverkar tempo,
expansion och maxarmé, utan ändrade stridsstats/kostnader.

Före förlustinjektionen lever alla14/14 Normal-trupper,9/9 Easy och17/17 Hard
(antal accepterade/slutförda jobb i dessa tillstånd). AI:n bygger teknik,
produktionshus och armé utan spelarattacker. Efter förlustinjektionen ersätts
8/7/5/10 förlorade trupper med6/5/3/11 nya betalda jobb; olika roller har olika
supply. Alla fall når basnivåIII och attack/försvarII inom20min. Inga negativa
banker; bevarandefel för wood/gold understiger1.4e-10.

Maxarmysupply12/24/32 på Easy/Normal/Hard. Maxbyggnader11/15/16 på Arena,
14 på Plains96; inga överskridna workergränser. Normal når10 workers,
Easy8 och Hard12. Utvecklingen begränsas av befintlig supply/kapacitet och
stannar vid de avsedda gränserna i stället för obegränsad enhetsproduktion.

Dessa simuleringar kör med1s gameplaydelta för uthållighetsprov och kan vara
CPU-tunga. Efter resursindexet:141.9s wall-clock för4096-kartans1200s och166.9s
för Hard. Tidigare217.7/177.6s är före indexet, delvis under annan diagnostik.
Detta är ingen FPS-mätning; browserdelen mäter små delta separat. Tiderna i
beteendetabellen är gameplaytid, inte mänskligt speltest. Alla fyra rapporterna
före/efter indexet jämfördes med deep equality efter att endast wallMs tagits
bort: varje beteende-/ekonomi-/förlust-/snapshotsfält är identiskt.

## Rättningar från test och granskning

Första20min-testförsöket:2/4 passerade. Easy producerade ersättare och träffade
fortsatt men fick ingen ny dispatch; smågruppssammanföring utan powertröskel
rättades. Plains96 överskred180s wall-clock (212.2s); ett verkligt20min-scenario
behölls, enskild tidsbudget separerades från gameplaykraven och spanarens
onödiga formationsplanering ersattes av en vanlig färdväg. En regression
verifierar nu återanvändning av aktiv scoutroute mellan strategibeslut.

En expansionskomponentfixture saknade nödvändig supply och blev därför korrekt
prioriterad till farm i stället för expansion. Fixturen fick uttryckliga färdiga
farms; budget-, alternativplats- och betalningsassertions behölls. Den första
route-cachefixturen testade en blockerad väg; den fick ett uttryckligen öppet
komponentunderlag så att en aktiv väg faktiskt kan återanvändas. Blockerade
mål ska fortfarande hoppas över.

## Browser och prestanda

```sh
npm run dev -- --host 127.0.0.1 --port 5184
W2T_PLAYWRIGHT_MODULE="$PWD/presentations/agentic-coding/node_modules/playwright-core/index.mjs" node scripts/check-ai-initiative.mjs
```

[Browserrapport före resursindexet](browser.json), Chrome155, faktisk lokal utvecklingsbuild. Bilder/renderkontroller återanvänds uttryckligen för den oförändrade presentationen efter indexoptimeringen; ingen ny app-/renderingskörning påstås.
Natural300s Normal/Arena800:8 arbetare,10 truppjobb, färdig andra resursbas,
337 verkliga träffar mot passiva spelarobjekt och giltig Save. Bilder före/
efter uttrycklig rendering-reveal: [vanlig fog](natural-2-800.png),
[AI-bas](revealed-2-800.png).

Plains128/1280 med fyra allierade AI: samtliga etablerar andra resursbasen
inom300s, producerar5–9 jobb och har6–8 workers.62 enheter totalt. Den mänskliga
basen får uttryckligen100000HP enbart för att behålla arbetslasten; AI-bank,
trupper, research, egna observationer och byggjobb injiceras inte. AI delar
sikt enligt vanliga lagregler. Detta är en kontrollerad allierad motståndar-
last, inte en FFA-balansmatch. Bilder: [vanlig fog](natural-5-1280.png),
[utbyggd bas och fyra AI](revealed-5-1280.png).

| Lokal utvecklingsbuild | Update median/p95 | Första human-reveal | Varm render median/p95 |
| --- | --- | --- | --- |
| Arena,1 AI/21 enheter |2.4 /3.6ms |6.6ms |1.6 /3.1ms |
| Plains128,4 AI/62 enheter |121.6 /140.0ms |11.3ms |5.4 /8.9ms |

**Initialt fynd:** fyra utvecklade AI var CPU-tunga. Mätningen är
inte godkänd60FPS, ingen förbättring mot en likadan äldre fixture hävdas och
production/FPS har inte mätts i detta browserprov. Detta fynd ledde till den avgränsade resursindexoptimeringen nedan. Alla strategiska planer, rekognoseringsbeslut och målval är intervallstyrda; armé-/worker-/byggnadstal är begränsade. Tidigare snabbare
30s-/injicerade-armé-fixtures har annan arbetslast och jämförs inte direkt.

Båda gränssnitten utan pageerrors.800- och1280-bilderna ovan är visuellt
granskade. Revealen påverkar endast människans rendering efter simuleringen;
AI:s sikt ändras inte. Första Chrome-starten blockerades av process-sandboxen;
samma lokala kontroll kördes därefter med tillåten browserbehörighet.

## Resursindex och isolerad produktionsjämförelse

När många resurser upptäckts blev upprepade linjära `nodes.find` inuti `knownEnemyNode(...)`
kvadratiska i antalet resursnoder. Ett WeakMap-index per observationsarray ger
O(1)-uppslag efter en O(n)-indexering. Observationer ersätter arrayen; ändrad
längd invaliderar även komponentfixtures. Egen/andras fog, observerade värden,
stock, resursval och Save-format ändras inte. Indexet är härlett, har svag
livscykel och sparas inte. Regressioner täcker ny observation, dold depletion,
andra ägares separata värden samt append/tömning av fixtures.

```sh
W2T_PLAYWRIGHT_MODULE="$PWD/presentations/agentic-coding/node_modules/playwright-core/index.mjs" node scripts/profile-ai-initiative.mjs
```

[Isolerad CPU-jämförelse](cpu-comparison.json): två Vite-produktionsbundlar,
samma spelkod förutom linjärt respektive indexerat observed-node-uppslag.
Samma klonade300s-tillstånd: fyra allierade, normalt betalda AI,60 enheter och
fyra färdiga andra resursbaser; endast humanbasens100000HP är lastfixture.
180×1/60s,30 warmup; inga samtidiga tester under mätningen.

| Produktionsbundlad update | Median | p95 |
| --- | --- | --- |
| Linjär uppslagning |119.8ms |213.9ms |
| Indexerad uppslagning |35.6ms |40.8ms |

Median−70.3%, p95−80.9%. **Hela sluttillståndets SHA256 är identisk** efter
båda körningar: `300d436952a84a933b693b481cd8ba1302ef2578a4f1d499023ed383bbd62e8e`.
Fyra strategibeslut på3s totalt, ett per AI, i båda körningarna. Detta separata
60-enhetsproduktionsprov jämförs inte direkt med det tidigare62-enhetsdevprovet.

**Kvarstående begränsning:**35.6/40.8ms är över en60FPS-budget och avser update,
inte komplett renderad FPS. Större matcher är fortsatt CPU-tunga. Optimeringen
minskar ett belagt uppslagningsproblem; den är ingen allmän FPS-/hårdvaru-/
fullmatchgaranti. Ingen bred navigation-/combatrefaktor eller enhetssänkning.

## Checks

Nya riktade systemtester:103/10 PASS före sista scout-routekorrigeringen;
efter den22/2 PASS, därefter separat aktiv-route-cache8/1 PASS. Den senare
körningen har ett uttryckligen öppet komponentunderlag; inte en ny genomspelning.
Efter indexet: riktade35/3 PASS15.50s; slutlig unit538/92 PASS26.79s. Build inklusive strict TypeScript PASS671ms,
befintlig bundlevarning. Senaste integrationstestfilerna typkontrollerade efter
sista teständring. Script-syntax och testmanifest (92 unit/131 integration)
validerade. Första fullförsöket avbröts utan slutresultat för den belagda indexrättningen. **Ny slutlig full `npm test`:2057 tester/223 filer PASS1205.65s**, faktiskt omkörd på korrigerad kod. Egen diffreview utan blockerande fynd. Slutlig dokumentation granskas med text-/länk-/diffcheck; inga kodchecks upprepas efter enbart Markdown.

Detta ersätter inte mänskligt strategiskt/balansspeltest. Kampanjens scriptade
tempo och äldre policy ändras inte. Ingen ny CI/Pages-verifiering eller release.
