# Forskning, anfall och AI-expansion — 2026-10-27

Ursprungligt lokalt uppdrag utan commit, push eller publicering. Användaren har
därefter beställt commit/push av enbart rättningen; `[skip ci]` hindrar
automatisk Pages-publicering. Ren commitkandidat verifieras separat nedan. Befintlig `src/style.css`,
`assets/sources/units.mjs`, `docs/`, `:memory:.ses` och `CLEANUP_REPORT.md` bevaras.
Ingen ny version eller roadmaptask.

## Reproducerbart anfall och mätning

`src/gameplay/testHelpers/attackPerformance.ts` skapar en explicit stressfixture:
40 AI-angripare (var fjärde archer), 24 egna försvarare (var tredje archer),
tre vanliga arbetare och de vanliga huvudbaserna på den faktiska skogskartan.
Extra trupper är injicerade över normal supply och har10000HP; spelarbasen har
100000HP. Detta isolerar belastning och är inte ett betalt match-/balansprov.
AI:n har en tidigare observerad basposition men armén börjar utanför spelarens
aktuella sikt. Vanlig AI, kollisionshantering, fog, målval, melee, projektiler,
animationer och renderingsfrekvens används. Ingen fogmask görs allsynlig.

Jämförelsen ersätter endast `map.ts`, `combat.ts` och `projectiles.ts` med koden
från **0a4056efdae6e5716d508ace859b18b5209079dd** för före-mätningen. Övriga källor,
fixture och lokala användarstilar är gemensamma. Gitcheckout ändras inte.
Chrome156.0.8078.48, headless WebGL på samma Mac, inga parallella tester under
slutmätningarna. Miljöns faktiska browserversion finns även i JSON-filerna.

```sh
W2T_BASELINE_REF=0a4056efdae6e5716d508ace859b18b5209079dd W2T_STAGE=before node scripts/profile-attack.mjs
W2T_STAGE=after node scripts/profile-attack.mjs
W2T_BASELINE_REF=0a4056efdae6e5716d508ace859b18b5209079dd W2T_STAGE=before node scripts/check-attack-browser.mjs
W2T_STAGE=after node scripts/check-attack-browser.mjs
```

CPU-provet bygger en fristående IIFE med Vite och kör1800 identiska1/60s-ticks
utan warmup-borttagning, så även den första planeringen räknas. Både före och
efter har hela sluttillståndet SHA256
`56e69b772872a3f5768ea8eeabc3bd88483ded612a4ec9bce12eee1e412dcc8f`.
Upptäckt sker vid frame193 och första skada på försvarare vid frame308 i båda.
Råa samples och profiler: `cpu-before.json/.cpuprofile`, `cpu-after.json/.cpuprofile`.
`cpu-after-initial.*` är ett tidigare explorativt prov, inte slutsiffrorna.

| Isolerad gameplay-CPU | Före | Efter |
| --- | ---: | ---: |
| Första/dyraste planeringsuppdatering | 681,4ms | 46,5ms |
| Dold framryckning, median / p95 | 2,8 /6,7ms | 2,8 /3,9ms |
| Synlig framryckning, median / p95 | 2,9 /5,2ms | 2,9 /4,7ms |
| Strid, median / p95 | 5,8 /9,3ms | 3,1 /5,2ms |
| Uppdateringar över50ms | 2 | 0 |

Browserprovet kör hela Phaser-spelet i native1280×720 med1280×488-canvas,
1802/1802 riktiga uppdateringar under30 gameplaysekunder. CPU-profileraren
startas före fixturen/mätfönstret; dess egen cirka183ms-uppstart ska inte
blandas ihop med en spelframe. En tidigare instrumenteringskörning visade just
den uppstarten vid0,05s; slutliga rådata nedan har den utanför mätningen.

| Hela spelvyn | Före | Efter |
| --- | ---: | ---: |
| Första/dyraste uppdatering | 703,5ms | 34,3ms |
| Stridsuppdatering, median / p95 | 7,6 /12,2ms | 5,9 /8,3ms |
| Själva upptäcktsuppdateringen | 7,2ms | 7,4ms |
| Första stridsuppdateringen | 9,8ms | 8,3ms |
| Längsta bildruta | 700,0ms | 33,4ms |
| Bildrutor över50ms | 1 | 0 |
| Bildruta p95 | 16,8ms | 16,7ms |
| `syncVisuals` median / p95 | 1,7 /2,3ms | 1,7 /2,1ms |
| Rendering median / p95 | 0,3 /0,5ms | 0,3 /0,5ms |

`native-before.json/.cpuprofile/.png` och `native-after.json/.cpuprofile/.png`
är slutliga underlag. Ingen runtime exception. Browser-scriptet har assertions
för stridens p95, noll bildrutor över50ms samt upptäckt/första skada.

## Orsak och optimering

Den stora engångsspiken uppstår när alla angripare samtidigt planerar sin
första långa färdväg. `combatApproach` sökte den bästa kontaktrutten runt alla
sidor av ett ännu avlägset utforskningsmål. Utforskning använder nu befintlig
`approachRoute(..., reachableOnly=true)` och accepterar den första nåbara
kontakten. Rörelsen behåller verklig kroppsstorlek, hinder, passagekontroll,
revisionsinvalidering och samma återplaneringsintervall. Stridsmål behåller
ordinarie kontaktsökning. Ett riktat test verifierar40 initiala sökningar och
noll nya utforskningssökningar under30 följande oförändrade frames.

Den återkommande flaskhalsen låg i skottens LOS-/kollisionskontroller. Både
ranged combat och projektiler filtrerade hela hinderlistan för sina ändpunkter
varje gång. En rörlig enhets kropp finns normalt inte ens i hinderlistan;
ändå gav filtreringen en ny array och ett nytt spatialt index. `withoutFootprints`
använder nu spatialt uppslag och returnerar originalsnapshoten när inget ska
tas bort. Verkliga byggnadsundantag återanvänder en bounded64-posterscache per
hinderarray, invaliderad av revision/längd och med exakta rektangelvärden i nyckeln.
Skottens hinderundantag, masks, skada, räckvidd, hastighet och fog är oförändrade.

`cpu-categories.json` klassificerar samplad CPU efter stackar, utan dubbelräkning:

| Kontrollerat system | Före samplad CPU | Efter samplad CPU |
| --- | ---: | ---: |
| Navigation/kontaktvägar | 1558,6ms | 787,8ms |
| Målval/självförsvar | 177,1ms | 155,7ms |
| Strategi/taktisk AI | 46,3ms | 36,0ms |
| Fog/observation | 1370,4ms | 1395,9ms |
| Projektiler | 1135,0ms | 13,7ms |
| Övrig combat, inklusive skott-LOS | 2911,3ms | 485,1ms |
| Byggnads-/enhetsarbete | 422,2ms | 426,9ms |
| Separation/passagetrafik | 1955,9ms | 1847,0ms |
| Garbage collection | 734,4ms | 191,0ms |

Sampling omfattar även kort fixturesetup och är inte en exakt addition av
frame-tider. Formationer kontrollerades i profiler och kod: den här redan
utsända gruppen gör inga nya dyra formationsanrop under framryckning/strid.
AI-beslut och målval är små jämfört med de identifierade flaskhalsarna.
Animationer och återkommande omritning ingår i browserns `syncVisuals`/render-
mätning. Fog/separation är efteråt de större återstående CPU-posterna, men
klarar det här provets bildrutebudget. Ingen simuleringstakt eller grafik sänks.

## Två forskningsrader

Forskningsgruppen har högst åtta alternativ per sida: fyra kolumner och två
rader. Föregående/nästa samt `1 / 2` finns i rubriken. Ordinarie kontroller,
callbacks, kostnader, status, ikoner, tooltip och tillgänglighetsnamn behålls.
Sidval består under frames/forskningsstatus och återställs när alternativlistan
ändras. Alla fem rasers alternativ omfattas av testet.

`node scripts/check-research-pages.mjs` mot Vite på port5193 verifierar native
800×600,1024×768,1280×720,1920×1080 samt640px-fönster med spelets befintliga
skalning av minsta800×600. Faktiska DOM-koordinater: högst två rader, ingen
överlapp med kö/andra kontroller, alla nio Human-val nåbara, tooltipkostnad,
betald Worker Tools-klick, bibehållen sida och återställning. `research-browser.json`
och `research-<bredd>-page-<n>.png` innehåller beläggen; bilderna är granskade.
`research-before-800.png` illustrerar den ursprungliga tredje raden men använde
då standardinställningens skalade1920-vy, så den är inte en native800-jämförelse.

## Separata AI-baser

Strategisk och äldre expansionspolicy delar nu `validExpansionSites`:
32px-grid, världens gränser, inga överlapp med egna byggnader, samt avstånd till
huvudbas och samtliga färdiga/pågående extrabaser. Normalt krävs320px mellan
centrum (på mycket små världar minst288px, med dimensionsanpassning).
I de äldre kartornas tidigare kandidatlista låg alla tre platser bara224–295px
från huvudbasen; den ersätts med verkligt separata kandidater. Ingen befintlig
eller sparad byggnad flyttas.

Kandidater kommer från kartans scout-/expansionspunkt och ihågkomna guldfyndigheter.
De ska ha positiva kända resurser inom448px som inte redan ligger inom en egen
bas närzon. Kända spelarbaser, synliga stridstrupper och färdiga synliga torn
hålls på säkerhetsavstånd. Dolda dynamiska hinder/hot styr inte kandidatvalet.
Äldre lägen utan kunskapssnapshot får bara läsa resurser i aktuell egen sikt.

Innan betalning krävs aktuell egen sikt över hela tomten, fri mark/kroppar,
verklig byggarrutt samt fri spawnutgång efter att footprint lagts till. En dold
tomt måste först scoutas. Kartans publika expansionspunkt får väljas för enbart
spaning innan resurserna där är observerade. Expansionsbudgeten reserveras även
under denna spaning; ingen betalning sker förrän vanlig strikt resurs-/sikt-/
platskontroll passerar. Detta förhindrar att armé/teknik förbrukar budgeten medan
AI väntar på en kortvarigt synlig tomt. Högst två dyra sökningar görs per nytt byggförsök.
Misslyckade access-/scout-/occupancy-/exitkandidater minns i15 gameplaysekunder,
högst24 platser, och alternativ prövas i stället. Befintlig strategisk backoff
frigör den reserverade budgeten. Saknas giltiga resurser/platser blir det inget
överlappande fallbackbygge eller någon betalning. Plan/minne är transient och
utelämnas ur Save; efter Load omvärderas terräng/kunskap innan nästa betalning.

## Verifiering

- Forskningsbrowser vid640/800/1024/1280/1920 PASS, noll runtimefel.
- Isolerad och faktisk Phaser före/efter PASS enligt tabellerna ovan.
- Riktade119 tester/12 filer PASS före sista foggranskningen; dess ändrade
  AI/expansions-/anfallssystem därefter32/3 PASS.
- Unit548/94 PASS; de sista ändringarna gäller AI-integration, vars slutliga
  helregression dokumenteras separat nedan.
- `npm run build` inklusive strict TypeScript PASS efter slutlig fogrättning;
  befintlig stor chunk-varning kvarstår.
- Första fullregression2105/231:2102 PASS,3 Frontier-fel. Rättningen låter
  AI scouta den publika expansionspunkten och reservera budget under spaningen,
  utan att betala för en tomt utan observerade resurser. Riktad omkörning60/3
  PASS, inklusive naturlig betald expansion, Save och huvudbasförlust. Komponent-
  fixturen anger nu uttrycklig sikt över sina redan scoutade platser.
- Slutlig ny `npm test`: **2106 tester/231 filer PASS**,1021,79s på slutlig
  kod. Alla tre tidigare Frontier-fel är borta. En tidigare helkörning avbröts
  för legacy-fog-fyndet och hävdas inte som PASS.
- Final CPU-/Phaser-jämförelse omkörd efter sista AI-rättningen, utan samtidiga
  tester eller build. Samma statehash, inga långa bildrutor efteråt.
- Slutlig text-/länk-/diffkontroll och SHA256-bevarande PASS. Inga kvarstående
  testfel. Befintlig bundlevarning kvarstår.
- Testmanifest, diff och SHA256-bevarande av användarens CSS/units.mjs kontrollerade.

Mätningen gäller en lokal stor tvåsidig markstrid under30s, inte all hårdvara,
femspelarlångmatcher eller mänsklig finbalans. Ingen ny CI/Pages kontrollerad.

## Verifiering av commitkandidat efter nytt mandat

Ren exporterad commitkandidat utan användarens CSS/units.mjs/docs: unit548/94
PASS18,01s, build med strict TypeScript PASS577ms och browser640/800/1024/1280/
1920 PASS (rader, alla alternativ, kostnad/status, verkligt betalt klick).
Native1280-anfall: maxframe33,2ms, stridsp957,9ms, noll frames över50ms,
noll runtimefel. Bilder800/1280 granskade. Indexets ändrade src/scripts och
oförändrad original-CSS/units.mjs är byte-identiska med den testade exporten.
Full2106/231 på samma gameplaykod återanvänds; ingen andra fullsimulation
behövs för att exkludera CSS/asset-authoring som ligger utanför commiten.
Exporten saknar .git, så build-ID blirunknown där; build/typecheck lyckas.
Befintlig bundlevarning kvarstår. Ny CI/Pages körs inte med `[skip ci]`.

JSON, screenshots, CPU-profil och loggar finns i `commit-candidate/`.

Spelkodscommit: `b6284ba`. Sparade textloggar är whitespace-normaliserade
(utan ändrade resultat); uppföljningen ändrar bara loggar/leveransnoteringar.
