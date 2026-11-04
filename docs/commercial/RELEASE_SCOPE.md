# Kommersiell version 1.0 — godkänd produktriktning

**WBC-002: produktriktningen godkänd av användaren 2026-11-03.**
Godkännandet avser scope, inte implementation, releasekvalitet, rättigheter
eller tillstånd att påbörja följdtasks. WBC-002 ändrar endast dokumentation.
[Källinventeringen](TECHNICAL_AUDIT.md) skiljer implementation från verifiering.
[BACKLOG](../../BACKLOG.md) styr tasks; tidigare RTS-planer/status behålls.

## Godkänd omfattning och gräns mot implementation

Ett läsbart fantasy-RTS för en spelare som vill bygga bas, slåss om ändliga
resurser och genomföra skyddade land-/kustoperationer. Paus, lokala sparningar
och begriplig moteld är viktigare än mer innehåll. Behåll Phaser, strict
TypeScript och Vite samt befintlig simulation/AI/DOM-presentation.

| Del | Godkänd produktriktning | Befintligt stöd / kvarstående arbete |
| --- | --- | --- |
| Plattform | Windows PC först, Steam som huvuddistribution. | Ingen Windowsapp är levererad. Stödda Windowsversioner, arkitektur/minspec och tillgång till testmaskin fastställs i WBC-003/004; tidigare Windows11/x64-förslag är inte ett verifierat supportlöfte. |
| Raser | **Humans, Orcs, Elves, Dwarves och Goblins**: fem befintliga spelbara roster. | Källans stabila ID:n är crown/clans/elves/dwarves/goblins. Ingen Gnomes-ras skapas och inget rasbyte görs. Befintlighet är inte bevis för slutbalans, artkvalitet eller IP-clearance. |
| Strid/ekonomi | Återanvänd befintliga RTS-system och roster i Phaser, strict TypeScript och Vite. | Fysisk ekonomi, konstruktion, forskning, fog och mark/luft/sjö/magi finns. Kommersiell polish och counters måste verifieras; inga nya resurser, tiers eller roster beställs. |
| Skirmish | Offline single-player mot befintlig AI; inga nätspel. | Koden stöder upp till fyra AI på vissa kartor samt lag/profiler/fyra svårigheter. Kommersiellt maxAI och performancegräns är inte separat beslutade; fastställ via WBC-003/035/043. |
| Kartor | **Sex befintliga skirmishkartor**. Inga nya kartor. | Det finns16 skirmishval av18 kart-ID:n; straits/tidebreak är campaignOnly. Exakta sex väljs/verifieras i WBC-043. Fördelningen3 land/3 kust/ö är ett urvalsförslag, inte redan godkänt urval. |
| Kampanj | **Tio kuraterade befintliga kampanjoperationer**. | Nuvarande77 ras-/uppdragsval bygger på45 ID:n. Exakta tio, ordning, berättelse och hantering av äldre innehåll avgörs i WBC-036/037. Två per ras är ett kvarstående urvalsförslag. Inget innehåll tas bort eller döljs nu. |
| Speltid | Q3-målet får inte uppnås genom att ersätta mänsklig kvalitet med simuleringar. | Tidigare15–30min/operation och20–40min/skirmish är ännu obekräftade designmål. Inga timmar på Steam utlovas före mänskliga prov. |
| Save | **Lokal Save/Load och offlinekörning**. Inga konton, backend eller live services. | En browser-localStorage-slot och Save80-validering finns. Desktopfiler/återhämtning saknas; antal slots/autosave och import är ännu detaljförslag i WBC-007/008. |
| Settings/åtkomst | **Engelska** som första releasespråk; polera befintligt UI och settings. | Engelskt UI/röstmaterial finns. Windows/DPI/fokus, kontrollombindning och läsbarhet kräver prov. Ingen lokaliserings-/controllerexpansion beställs. |
| Grafik/ljud | Återbruk av befintligt material, med fortsatt rättighets- och kvalitetsgranskning. | Slutlig art-/animationsstandard och senare ljudacceptans är öppna. Åtta framekeys bevisar inte åtta målade perspektiv. Inga nya assets genereras i WBC-002. |
| Drift/kvalitet | Offline single-player med stabilt spel och tåliga lokala sparningar. | Windows-PoC, minspec/prestanda, mänsklig balans och releasegrindar är öppna. Godkänt scope innebär ingen kvalitetscertifiering. |
| Desktop | **Electron-PoC först**, med befintlig Phaser/TypeScript/Vite. | Beslutet väljer första bevisvägen. Ingen wrapper/dependency är installerad; permanent paketering kräver PoC-resultat i WBC-004 och separat implementationsmandat. |
| Utgifter | **Initialt sammanlagt externt utgiftstak10 000SEK**. Mer kräver separat godkännande. | Taket är ingen beställning eller ett tillstånd att göra inköp/ingå avtal. Verkliga utgifter och återstående utrymme är inte inventerade. Kostnader över taket får inte förutsättas finansierade. |
| Pris | **129SEK är indikativt**, inget slutligt pris. | Slutpris och Steamregioner bestäms senare; ingen försäljning/prognos eller prispublicering godkänns här. |
| Datum | **Q3 2027**, villkorat av kvalitet och genomförbarhet. | Inget bindande lanseringsdatum. Arbetstid, testhårdvara och möjligheten att täcka externa behov inom10 000SEK återstår att bedöma. |

Alla inkluderade filer måste rättighets- och funktionsgranskas även om de inte
annonseras. Att gömma äldre innehåll är inte ett sätt att undvika licenskrav.
En kommersiell innehållslista får inte radera äldre källor eller tyst kasta
befintliga progressioner. Om ägaren kräver alla77 val i1.0 måste innehålls-/QA-
estimatet göras om före implementation. Inga sådana urvalsändringar görs nu.

## Befintligt innehåll — inventering, inte slutligt releaseurval

Ny statisk källkontroll i WBC-002: [factions](../../src/config/factions.ts),
[campaign](../../src/config/campaign.ts), [expeditions](../../src/config/campaignExpeditions.ts)
och [series](../../src/config/campaignSeries.ts). Ingen spelkörning eller ny
quality-/licensgranskning ingår. Samma åtta grund-ID:n återanvänds i alla fem
rasers serier; därför är antal rasval större än antal unika operationer.

De åtta gemensamma operationerna är:

- First Steps (`first-steps`).
- Forest Watch (`forest-watch`).
- The Siege (`the-siege`).
- The Outpost (`the-outpost`).
- The Crossing (`the-crossing`).
- Ridge Convoy (`ridge-convoy`).
- Valley Rescue (`valley-rescue`).
- Coastal Banner (`coastal-banner`).

De37 rasspecifika tilläggen, samtliga befintliga:

| Ras / befintliga val i serien | Tillägg: namn och stabilt ID |
| --- | --- |
| Humans / 17 | Border Granaries (`crown-border-granaries`); Lanterns in the Wood (`crown-lanterns-in-the-wood`); Three Roads (`crown-three-roads`); The Returning Envoy (`crown-the-returning-envoy`); Tidal Supply (`crown-tidal-supply`); The Allied Foothold (`crown-the-allied-foothold`); Oath at Dawn (`crown-oath-at-dawn`); Stormgate Armada (`crown-stormgate-armada`); Tidebreak Relief (`crown-tidebreak-relief`) |
| Orcs / 15 | Exiles' Camp (`clans-exiles-camp`); Ashwood Trails (`clans-ashwood-trails`); Stand at Redwater (`clans-stand-at-redwater`); The Broken Chain (`clans-the-broken-chain`); Across the Reeds (`clans-across-the-reeds`); Warband Confluence (`clans-warband-confluence`); A Shore of Our Own (`clans-a-shore-of-our-own`) |
| Elves / 15 | Rootward Haven (`elves-rootward-haven`); Hidden Canopies (`elves-hidden-canopies`); Guard the Springs (`elves-guard-the-springs`); The Lost Circle (`elves-the-lost-circle`); Moonlit Channel (`elves-moonlit-channel`); Roots Reunited (`elves-roots-reunited`); Heartwood Vigil (`elves-heartwood-vigil`) |
| Dwarves / 15 | Stonebreak Depot (`dwarves-stonebreak-depot`); Prospectors' Ridges (`dwarves-prospectors-ridges`); Hold the Switchbacks (`dwarves-hold-the-switchbacks`); The Last Courier (`dwarves-the-last-courier`); Iron Tide (`dwarves-iron-tide`); Twin Holds (`dwarves-twin-holds`); The Road Reopened (`dwarves-the-road-reopened`) |
| Goblins / 15 | Ledger Outpost (`goblins-ledger-outpost`); Surveyors' Cut (`goblins-surveyors-cut`); Tollgate Defense (`goblins-tollgate-defense`); Recover the Witness (`goblins-recover-the-witness`); Contraband Passage (`goblins-contraband-passage`); Two-Sided Bargain (`goblins-two-sided-bargain`); The Charter Reclaimed (`goblins-the-charter-reclaimed`) |

Totalt **45 unika ID:n /77 ras-/uppdragsval**: Humans17, övriga15 vardera.
Detta styrker ett befintligt urvalsunderlag för tio operationer; det styrker
inte att tio är utvalda, sammanhängande eller kvalitetssäkrade för release.
WBC-036/037 hanterar även hur äldre progression/Save fortsätter utan dataförlust.

[Mapconfig](../../src/config/maps.ts) bygger18 ID:n från grundkartor,
[skirmishkartor](../../src/config/skirmishMaps.ts), [ökartor](../../src/config/islandMaps.ts)
och [sjökampanjkartor](../../src/config/seaBattle.ts). `skirmishMapIds` filtrerar
bort `campaignOnly`; Tidebreak ärver flaggan från Straits. Följande **16** är
befintliga skirmishval, inte sex redan fastställda releasekartor:

| ID | Befintligt namn |
| --- | --- |
| `twinwake` | Twinwake Narrows |
| `trident` | Trident Anchorage |
| `crownsea` | Four Crowns Sea |
| `farreach` | Farreach Expanse |
| `lakehold` | Lakehold Circuit |
| `fivepasses` | Five Passes |
| `rivercrown` | River Crown |
| `arena` | Arena |
| `forest` | Forest Pass |
| `river` | River Bend |
| `islands` | Islands |
| `frontier` | Frontier Valley |
| `plains96` | Western Plains 128 × 128 |
| `plains128` | Eastern Plains 128 × 128 |
| `highlands` | Highland Crossroads |
| `coast` | Shattered Coast |

`straits` (Stormgate Straits) och `tidebreak` (Tidebreak Reaches) finns som
kampanjkartor, inte skirmishval. Kartnamn är nuvarande config-/UI-namn, inte
kommersiellt namn-/IP-godkännande. Varken nya kartor eller konvertering av
campaignOnly-kartor krävs för att välja sex i WBC-043.

## Avvikelser från godkänt scope

| Godkänd riktning | Verklig skillnad / ansvar |
| --- | --- |
| Windows/Steam/Electron-PoC | Bara browserdistribution finns. Desktop/offlineinstallation/Steam måste fortfarande genomföras och verifieras i senare tasks. |
| Fem befintliga roster med Goblins | Matchar koden; den tidigare Gnomes-frågan är löst genom att behålla Goblins. Ingen käll-/assetändring behövs för beslutet. |
| Tio operationer / sex skirmishkartor | Koden visar bredare innehåll77 val/45 ID:n och16 skirmishval. Kommersiellt urval/edition och savekompatibilitet är ännu inte implementerade eller godkända per ID. |
| Lokal Save/Load / offline | Browserlagring finns, men beständiga desktopfiler/backup/import och kall offlineinstallation saknar bevis. |
|10 000SEK / Q3 2027 | Befintligt kostnads-/tidsestimat garanterar inte genomförbarhet inom taket eller perioden; inga tillgängliga arbetstimmar eller offerter är bekräftade. |
|129SEK / engelska / optional Steamfeatures | Engelska finns. Pris är fortsatt indikativt; Cloud/achievements saknas och är fortsatt optional. Inget godkännande av nytt ljud eller licenser följer av språkvalet. |

## Tio viktigaste releaseblockerare

1. Ingen verifierad Windows-runtime, paketering eller kall offlineinstallation.
2. Ingen beständig desktopfilpersistens/backup/import; browser-slot är originbunden.
3. Produktnamnet **Warbound** har en konstaterad annan Steam-listning och saknar titelprövning.
4. Asset-/röst-/biblioteksrättigheter saknar slutligt distributionsgodkännande; dvärgcredits63/81 är inkonsekventa.
5. Finansiering/genomförbarhet inom utgiftstaket10 000SEK är inte verifierad; tidigare kostnadshypoteser överstiger taket.
6. Antalet tio operationer är godkänt, men exakta ID:n, berättelse och mänsklig spelkurva är inte fastställda.
7. Mänsklig femras-/AI-/sjö-/endgamebalans saknas som releasebelägg.
8. Initiala frame-stopp kvarstår historiskt; Windows-minspec/minne/kallstart är okända.
9. Slutlig bild-/animationsstandard, nytt ljud och praktisk kontroll-/tillgänglighetspolish är ej accepterade.
10. Steam-onboarding, ärlig store page/AI-survey, demo, extern beta och RC-installprov är inte genomförda.

## Scope som skjuts upp

Multiplayer, onlinekonton, backend, matchmaking, live service,
mikrotransaktioner, karteditor, Workshop, stora procedurkampanjer och motorbyte
ingår inte. Inte heller nytt innehåll för Warbound2, förgrenad metakampanj,
ytterligare raser eller en full omskrivning av BootScene/Save.

Steam achievements och Cloud är P2 efter stabil kärna, inte releasevillkor.
Linux/macOS/Deck, extra språk, cinematics, fler kampanjer/kartor och unika
röstpaket för varje sent enhetsslag kan vänta. Befintlig browser/Pages-support
bevaras där möjligt; den utökas inte till en andra kommersiell lansering.

## Beslutade ramar och kvarstående beslut

WBC-002 godkänner produktriktningen i tabellen, inklusive Goblins,10 operationer,
6 befintliga skirmishkartor, Electron-PoC först, engelska, budgettak, indikativt
pris och villkorad releaseperiod. Det ändrar inte innehållsval eller spelet.
Originaldata/ID:n/saves bevaras medan WBC-036/037/043 beslutar urval/edition.

Namn/varumärke, assets/röster/bibliotek och distributionsvillkor behöver fortsatt
utredas i WBC-012–014/025. Varken titeln Warbound, licenserna eller den visuella
identiteten är kommersiellt klarerade genom detta beslut. Inga quality-/IP-
grindar är avklarade. Windowsversioner/minspec/maxAI, testmaskin och tillgänglig
arbetstid är tekniska/kapacitetsfrågor för kommande tasks, inte hinder för att
registrera användarens nu uttryckliga produktbeslut.

**Nästa beroendemässigt oblockerade task är WBC-003 — Frys auditbaseline och
Windows-mätplan.** WBC-012 har också en uppfylld produktbeslutsdependency men
påbörjas inte här. Arbeta en task åt gången; aktuell körning stannar efter002.

## Realism och stoppunkter

Fem raser är rimligt som **polish av de fem befintliga**, inte som fem nya
asymmetriska fraktionsbyggen. Många delade byggnader/recept är en medveten
scopefördel. Goblins behålls; en ny gnomdesign ingår inte. En helt ny animeringspipeline
eller stor omritning skulle kräva separat scope-/budgetbeslut.

[Roadmap](ROADMAP.md) uppskattar102–174 effektiva arbetsdagar före lansering,
128–218 med25% reserv (7h/dag). Q3 2027 är villkorat, inte en prognos: från
november2026 finns cirka34–47 kalenderveckor fram till Q3:s början/slut.
20h/vecka ger680–940h före ledighet, mindre än hela osäkerhetsintervallet
896–1526h;35h/vecka ger1190–1645h. Kodassistans tar inte bort väntan på
mänskliga tester, Windowsmaskin, rättigheter eller grafik-/ljudgodkännande.

Efter PoC och en godkänd representativ ras-/kampanjslice ska estimatet ersättas
med uppmätt takt. Saknas klarerat namn/assets eller godkänd Windows-PoC vid
första kontrollpunkten flyttas datum; kvalitet eller femraslöftet sänks inte
utan ägarbeslut. Publicera inte ett exakt datum före demo-/beta-evidens.
WBC-001:s externa kostnadshypotes28–105tSEK plus Direct/skatt är **inte**
en godkänd budget och kan inte förenas med10 000SEK-taket utan återbruk,
avgränsning/offerter eller nytt uttryckligt finansieringsbeslut. Juridisk
clearance och kvalitet får inte hoppas över för att passa taket.
