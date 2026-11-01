# Warbound 0.9.0 — teknisk och spelmässig audit

2026-11-01. Avser ändringarna efter19bf3a2 och den isolerade releasekandidaten.
Historiska CI-/Pages-resultat i rotens dokument är inte nya belägg här.
[Spelguide](../guides/playing.md), [råbelägg](../../artifacts/quality-release/)
och [städrapport](cleanup-0.9.0.md) kompletterar rapporten.

## Metod och praktiska gränser

Källgranskning av matchloop, AI/fog, rörelse, ekonomi, order, transport,
Save80/migrering, kampanjinnehåll, konfigurationer, HUD, assets och Pages-flöde.
Faktisk Chrome i800×600/1280×720: alla fem rasers forskning, kampanjens tidiga
byggmeny/Forge-upplåsning/Skirmish, stridsreaktioner, musstyrda transporter,
endgame-produktion och Save/Load. Tidebreak-strategin når renderad seger.
Fixturer och acceleration beskrivs i JSON-rapporterna. Det är inte mänskliga
10–15-minuters onboardingprov, långmatchbalans eller faktisk ljudlyssning.

En separat betald endgamekedja börjar på basI utan injicerade byggnader,
tekniknivåer eller trupper: ForgeI→AcademyII, basIII, fyra marinbyggnader,
fyra rollforskningar och Capital/Air/Giant/Marine. Resurscheat finansierar
uttryckligen detta komponentprov. Det bevisar åtkomst, betalning och köer;
normal ekonomisk nåbarhet bedöms separat av genomspelningar, inte av cheaten.
Befintliga Drydock/Signal Tower/Naval Academy/Marine Barracks och de sex
marinteknikerna räknas först efter ny spelkontroll. Inga nya2/4/4-assetkvoter
eller ny roster hävdas; luckorna låg främst i synlighet, krav och kontroller.

Slutresultat: **lokal fullregression2313/245 PASS1009,99s**, unit531/92 PASS,
riktad slutomkontroll127/9 och sista kortlayout12/2 PASS, strict build PASS.
[CI41260210015](https://github.com/tobisen/warbound/actions/runs/41260210015)
för02740d1: **2313/245 PASS1448,44s**, strict build/presentation/Pages PASS.
Faktisk publicerad browser800/1280:14/14 PASS medv0.9.0/Build02740d1.
JS/CSS och tio resursfiler SHA256-matchar commiten; presentation/PDF verifierade.
[Tagg/releasev0.9.0](https://github.com/tobisen/warbound/releases/tag/v0.9.0)
är publicerad. Tidigare full mellanregression2287 PASS/22 FAIL behålls som
historiskt råunderlag. Samtliga berörda fel är rättade; inga seger-/resurs-/
skade-/passagerarassertions har sänkts. Se verifieringsmanifestet för fixturer.

## Bekräftade fynd

Prioritet avser påverkan före rättning. Inga medelfynd motiverar en generell
motoromskrivning. Kvarstående beläggsluckor redovisas i nästa avsnitt.

| ID / prioritet | Evidens och reproduktion | Påverkan | Åtgärd och status |
| --- | --- | --- | --- |
| T01 hög | `npm audit --json`: Vite8.3.2 och Vitest4.1.11 gav1 hög +2 medelhöga beroendefynd. [Vite-advisory](https://github.com/advisories/GHSA-587h-7wmj-h5pm), [Vitest-advisory](https://github.com/advisories/GHSA-qxg6-89mg-rqv8). | Utvecklings-/testservrar berörs; ingen konstaterad exploatering av statiska Pages-klienten. | Vite8.3.5 i båda paketen, Vitest4.1.12 och låsfiler uppdaterade. Ny npm-audit:0 fynd. Genomfört. |
| T02 hög | Markera128 trupper på Plains128. `selectionInfo` gjorde en hel kopia av enhetslistan för varje markerad trupp. CPU-profilen placerade denna funktion högst efter införda hotfält. | Kvadratisk HUD-kostnad under precis det massurval som används vid basanfall. | Linjär namn-/HP-summering; test128 blandade enheter och ny profil. Genomfört. |
| T03 hög | Samma framryckning: `nearbyObstacles` största ursprungliga self-samplingpost,1564ms under20s. | Fog, pathfinding och svepta kollisioner betalar samma dyra uppslag många gånger. | Numeriska cell-/querynycklar med exakt strängfallback för stora koordinater. Swept-collision jämförs med linjär referens, inklusive undantag. Genomfört. |
| T04 hög | En upptagen byggplats med för liten bank kunde rapportera resursbrist. Tower/Harbor hade dessutom en tidig kostnadsspärr. | Spelaren försöker rätta fel problem. | Terräng/occupancy kontrolleras före kostnad; samma admission kontrollerar klick. Riktade orsaksprov. Genomfört. |
| T05 hög | Första kampanjuppdraget visade senare byggnader som blockerade alternativ; hela Skirmish-katalogens fjärde rad klipptes vid800. | Progression avslöjades för tidigt; sent bygginnehåll kunde inte nås med musen. | CampaignActionReason styr synlighet. Sex kompakta byggkolumner ger tre synliga rader; bounds för varje knapp kontrolleras i browsern. Genomfört. |
| T06 hög | Forskning visade generiskt krav-/resursfel; trånga kort och omkringliggande produktionspanel konkurrerade om bredd. | Spelaren kan inte skilja tillgängligt, betalt/köat, färdigt och saknat krav. | Gemensam researchReason för UI/betalning, status-/kostnadskort vid rätt hembyggnad, två rader, fokuserbara förklaringar. Alla fem raser i båda storlekarna. Genomfört. |
| T07 hög | Transport krävde plats för varje passagerare och avvisade hela ordern vid en blockerad punkt. | En enda upptagen cell stoppade hela landstigningen. | En gemensam plan söker96px lokalt, kontrollerar verklig båtkontakt/syn och landar delmängd. Tre passagerare→en på land/två kvar, inklusive strict Save. Genomfört. |
| T08 hög | Obestyckade eller måltypsbegränsade trupper saknade flykt; arbetare svarade endast vid giltigt närträffsmål. | Passiv förlust av spanare/arbetare och svårbegripliga matchningar över domäner. | Lokal hotrespons, säker rutt och hysteresis; faktisk order/last/patrull bevaras. Move/Attack/Hold ersätts inte; befintlig stationär vedergällning efter träff kan fortfarande pausa Move. Mark/luft/sjö och flera hot testas. Genomfört. |
| T09 hög | Första regressionen med bred hotradie störde ekonomi: passiva fiendearbetare tolkades som aktiva hot. | Tidig resursinsamling och teknisk balans kunde stanna. | Passiva ekonomiarbetare undantas tills de faktiskt angriper. Ekonomiska arbetsorder avbryts vid riktat/aktuellt hot; närstrid får64px varsel, distanshot192px. Riktad ekonomisk omkontroll och ny fullregression krävs. Genomfört; slutbelägg nedan. |
| T10 medel | Storm Ark visade en ofullständig dependencylista i Tech Tree trots att betald produktion krävde basIII, bådaII och Drydock. | Ett mål såg lättare att nå ut än det var. | Full kravlista och tierIII, med riktat test. Genomfört. |
| T11 medel | Baslinje och slutprov behåller ett initialt183–233ms frame-stopp vid gruppuppställning. | Märkbart hack trots god vanlig stridstakt. | Mät och redovisa separat från p95. Fortsatt riktad analys av initial formationsplanering rekommenderas; kvarstår. |
| T12 medel | BootScene har omkring1370 rader och Save-valideringen omkring475 mycket täta rader; gamla beslut överlappar nya rotloggar. | Svårare review, framtida migrering och reproduktion. | Spelregler hålls i rena moduler; README/historik separerade nu. Stegvis moduluppdelning hör till senare arbete, ingen bred omskrivning här. |
| T13 medel | Produktions-JS ligger omkring2,26MB (gzip605kB); Vite varnar över500kB. | Större första hämtning och parsning, särskilt mobil/långsam anslutning. | Oförändrad runtime/assetladdning. Mät kallstart och utvärdera motorns lastkostnad före chunking. Kvarstår. |
| T14 medel | Save80 har4MB budget, strikt typ-/identitets-/kartvalidering och lång migreringskedja. Hot-/orderfel är härledda och får inte serialiseras. | Varje nytt gameplayfält riskerar kompatibilitet eller större sparning. | Nya transienter utelämnas; originalorder sparas. Full regression täcker supported migrationer och multiplayer. Håll kvar bytegränsen och migreringstesterna. |
| T15 medel | Asset-/ljudlicenser finns per källa; röstderivat blandarCC0/CC-BY-SA och modellnotices. Separat generell rotlicens saknas. | Återanvändning kräver rätt ursprung och villkor, inte ett generellt antagande om alla filer. | Källor/licenser/credits bevaras och länkas. Ingen ny rättighetsgranskning eller kommersiell titelprövning hävdas. |
| T16 låg | Canvasstrid kräver visuell/tidsmässig interaktion, trots DOM-knappar, tangentkommandon och aria-hjälp. | Fullt icke-visuellt spelande är inte verifierat. | Läsbar forskning, tangentfokus och stödda native-vyer kontrollerade. Separat hjälpmedels-/kontrastprov rekommenderas; ingen WCAG-certifiering. |

## Speldesign: bedömningar och beläggsluckor

Dessa är rekommendationer, inte bekräftade balansfel. Ingen snabb simulering
används som ersättning för mänsklig speltid eller spelglädje.

| Prioritet / område | Konkret underlag | Spelarens konsekvens / rekommendation | Status |
| --- | --- | --- | --- |
| medel · första10–15min | Tutorial/missionContent börjar med urval, levererad ved, Barracks och egen producerad soldat. Skirmish Normal förbereder huvudanfall9–11min; Easy12–15min. | Tydlig grund men risk för lång tyst första akt. Mät tid till första meningsfulla val med nya spelare; justera inte AI-klockor utan sådant belägg. | Mänskligt onboardingprov återstår. |
| medel · ekonomi/expansion | Ändlig wood/gold, fysisk workerresa, betalda baser och observerade expansionslägen. Hotrespons kan ändra arbetstid utan att ändra kostnader. | Expansion ger både restidsvinst och skyddsbehov. Verifiera om förlust/retur efter flykt känns rättvis i längre matcher. | Tekniska ledger-/genomspelningar ingår; mänsklig risk/reward återstår. |
| medel · rasidentitet | Fem roster, egna förmågor/spells och marindoktriner: Human service, Orc landstigning, Elf sikt, Dwarf belägring, Goblin skrovkostnad. | Bra taktiska skillnader, men många gemensamma bygg-/forskningssteg kan dölja dem. Presentera färre centrala rasval tidigare. | Förslag till Warbound2; ingen ombalansering här. |
| medel · roller/teknik/endgame | Byggnader, sex marintekniker, exklusiva skrov/ammunitionsval, mark/luft/sjö och tydliga måldomäner. Ny betald kedja och faktisk produktions-UI. | Stöd, spaning och eskort har fortsatt funktion; stor enhet är inte ett universellt svar. Spela mänskliga jämna matchup-par före numerisk balansjustering. | Åtkomst/verkan tekniskt verifierad; långbalans återstår. |
| medel · AI/rättvisa | Strategi, ekonomi, scouting, baser, flottor och kolonier använder betalda recept och egen fogkunskap. Testsuite har dold-information-/ägarskapsfall. | Proaktivitet finns; spelarupplevelsen av rättvis spaning och frekventa landningar kan inte fastställas med enbart tester. | Ingen AI-regel sänkt av prestandafixen. Separata långa speltester rekommenderas. |
| medel · kartstrategi | Täta ändliga skogar, passager, kustlinjer och flera författade öprofiler; terräng och kroppsclearance är fysisk gameplaydata. | Land och vatten skapar olika vägar. Mät om avlägsna fynd/expansionsöar faktiskt blir stridspunkter, inte bara mer yta. | Relevanta start-/väg-/navaltester ingår. Mänsklig kartbalans kvarstår. |
| medel · kampanjkurva | Human17/övriga15 val, separata ras-/svårighetsledgers; datadrivna faser för eskort, försvar, expansion, blockad och evakuering. | Variation finns i mål, men återanvända målmallar kan kännas repetitiva. Korta efterspelsfrågor per uppdrag behövs. | Ny navalstrategi når renderad seger; inga mänskliga längdlöften. |
| medel · sjökrig | Transport/boarding, flera hamnar/waypoints, ubåtar/detektion, reparation, specialfartyg och landstigningsmål. | Sjövägar påverkar ekonomi och mål, men kontakt/last måste vara tydligt. Delvis landning löst här; eskortöverlappning är en kvarstående presentation-/trängselrisk. | Funktion verifierad; mänsklig mikro-/ljudbedömning återstår. |
| låg · återspelbarhet | Faktioner, kartor, fyra sjöupplägg, AI-profiler, lag och svårigheter. | Flera startvillkor finns; antal val är inte bevis för återspelningslust. Prioritera jämna, strategiskt olika rematcher före fler råa innehållskvoter. | Warbound2-förslag, inget nytt system i0.9. |
| medel · spelkänsla | Frame-/CPU-profiler skiljer uppställning, framryckning, kontakt och strid. | Enstaka toppar känns även när medianen är bra. Behåll stallräknare och samma fixture i framtida optimering. | Kvarstående initial topp redovisas öppet. |

## Prestanda och verifiering

[Exakta värden och varje körning](../../artifacts/quality-release/performance/README.md).
Samma Plains128-fixture:128 markerade egna,32 försvarare, dold bas, vanlig
fog/AI/strid,20 gameplaysekunder i native1280. Injicerad tålighet/armé över
normal supply är ett stressprov, inte en balanserad ekonomimatch.

CPU p50/p95/max: **11,4/21,9/98,4→10,6/19,4/84,6ms**. Frame:
**16,7/33,3/233,4→16,7/33,3/183,3ms**. Kontakt-CPU p95:
**14,7→12,6ms**, strid **12,9→11,7ms**. Ett initialt>50ms-stopp i båda,
inga senare>50ms-frame i slutprovet. Total frame-p95 är alltså inte löst.
Även sämre mellankörningar finns kvar; en samtidig browserkörning anges som
olämplig för jämförelse, och regressionen med kvadratisk HUD ledde till rättning.

Små Twinwake-strider mäts separat: CPU-p954,9/5,2/5,7ms för capital/zeppelin/behemoth, med initiala frame-max116,6/83,3/83,4ms. Se samma råunderlag; inga jämförelser mellan olika arbetslaster.

Full lokal regression och CI/Pages är nu faktiskt gröna enligt ovan.
[Verifieringsmanifestet](../../artifacts/quality-release/verification-final.json)
länkar till separata slutloggar, publicerad browser och resursjämförelser.
