# Kommersiell masterroadmap

2026-11-03. Planering för möjlig Windows/Steam1.0, indikativt Q3 2027.
**Inget implementationsmandat.** [BACKLOG.md](../../BACKLOG.md) innehåller
WBC-001–065 med krav och beroenden. WBC-001 och WBC-002 är genomförda som
dokument-/beslutstasks. Produktriktningen i RELEASE_SCOPE är nu godkänd;
10 000SEK är initialt sammanlagt externt utgiftstak, mer kräver separat beslut.
RTS/PRIO/historik och [Warbound2-förslaget](../roadmap/warbound-2-vision.md)
bevaras; två-rasspåret där är inte detta uppdrags femrasprodukt.

Läs i ordning: [faktisk teknik/gameplay](TECHNICAL_AUDIT.md),
[godkänt scope och tio blockerare](RELEASE_SCOPE.md), [IP](IP_AUDIT.md),
[kommersiell strategi](COMMERCIAL_STRATEGY.md), [kvalitetsgrindar](RELEASE_CHECKLIST.md).
Detaljkrav dupliceras inte här.

## Faser och exitgrindar

Alla arbetsdagar är **estimat**,7 effektiva timmar/dag, inte kalendertid eller
utfästelse. Återbruk av nuvarande innehåll förutsätts. Väntan på ägare,
rättighetsbesked, testare, Windowsmaskin och Steam räknas separat.

| Fas / prioriterad ordning | Mål och leverans | Förutsättningar/beroenden | Acceptans och tester / exit | Risk | Arbete |
| --- | --- | --- | --- | --- | --- |
| **0 Commercial Readiness Audit** · WBC-001→002→003 | Kodgrundad inventering, begränsad produkt, ansvar/budget och reproducerbar baseline. | Aktuellt repo; ägarbeslut om femte ras, edition, arbetstid/hårdvara. | Auditens dokument-/länkcheck; ägaren godkänner scope; Windows- och gameplayfixtures/hårdvara dokumenterade. 001/002 klara;003 återstår. | Dokumentstatus kan överskatta kvalitet/genomförbarhet; arbetstid/hårdvara och ekonomi inom10 000SEK återstår. |2–4d, inklusive genomförd planering. |
| **1 Desktop Foundation** · WBC-004–011 | Först unpacked offline-PoC, sedan säkert lokalt assetpaket, fönster/fokus, tåliga filer/slots, återhämtning och Windowsartifact/installprov. |002/003. Ingen Steam SDK behövs; rättighetsfrågor får utredas parallellt men inga oklara assets publiceras. | Faktisk Windowsstandardanvändare utan Node/server/nät: start→betald match→save→omstart→load. Install/upgrade/avinstall med sparningar, fel/intrångsprov och DPI/fokus enligt checklistan. | Origin/base-path och synkront browserstorage passar inte direkt fil-I/O; GPU/ljud kan skilja sig. |14–23d. |
| **2 Original IP & Art Direction** · WBC-012–015, pilot016, sedan017–025 | Titelutredning, per-filrättigheter/notices, godkänd art bible och bara konstaterade luckor i fem roster, byggnader, terräng, UI, ljud. |002/003;013 före distribution.012 måste starta tidigt, inte vänta på hela fas1. Representativ pilot före femrasspridning. | Ägarskap och villkor beslutade för alla paketfiler; native800/1280-bilder, source/export/loopkontroll och mänsklig art-/ljudacceptans. Oklara filer ersätts eller utgår enligt beslut. | Ommålning eller saknade voice-conversion-rättigheter kan dominera planen och överskrida10 000SEK; Goblins behålls, ingen gnomdesign. |24–42d; ingen full ny artproduktion inräknad. |
| **3 Gameplay Polish** · WBC-026–029,030–035 | Säkra riktiga klick/fokus, rimliga bindningar, läsbarhet/onboarding, respons/performance, AI och mänskligt fungerande femrasbalans. | Fas1-fungerande build; art bible.026/030/032 kan börja före all art. | Riktade unit/integrationer, faktiska desktop/browserflöden och dokumenterade mänskliga matcher. Mål för minspec spikas i003; kända initiala stalls måste bedömas separat. | Matchtempo/balans och pathfindingproblem upptäcks först vid längre spel; undvik generell omskrivning. |20–32d. |
| **4 Campaign & Content** · WBC-036→037→038–042,043–045 | Välj10 befintliga operationer (två per ras föreslaget), bevara gamla identiteter, skriv briefing/debriefing och välj6 av16 befintliga skirmishkartor. |002/012/015; stabila kärnregler.036 väljer verkliga ID:n före arbete med rasparen; inga automatiska nya uppdrag. | Varje släppt målsekvens: start/vinst/förlust/save-mellan-faser/retry/next/replay. Mänsklig tid/difficulty/läsbarhet och slutlig samlad kampanjregression. |77 existerande val är bredare än rimlig kommersiell QA. Äldre saves kräver uttrycklig policy. |16–27d. |
| **5 Steam & Marketing** · WBC-046/048→047/049→050→051 | Ägarstyrd onboarding, Windowsdepot/launch, separata SDK-beslut, ärlig Coming Soon, screenshots/trailer och hållbar kommunikation. | Namn-/IP-klarering och representativ desktop/gameplayslice; faktiska bilder före claims. Kontoarbete kan börja innan all kampanj är klar. | Ägaren godkänner avgifter/avtal/publicering; Valve granskar page. Depot-install/launch provat; inga påstådda Steamfeatures utan stöd. Aktuella regler kontrolleras igen. | Rättigheter, konto-/skatteväntan, missvisande marknadsföring eller låg efterfrågan. |8–14d plus extern väntan. |
| **6 Public Demo** · WBC-052→053→054→055 | Ett begränsat prov: onboardingscenario och en skirmishkarta med2 godkända raser, från samma kodbas. Extern feedback och prioriterad iteration. | Godkänd titel/assets, stabil desktop, tutorial, Steamdemo-konfiguration och representativ färdig kampanj. | Ren demo-install/offline/restart, separat save/progression, inga trasiga fullspelslänkar. Minst8 externa spelare, problem/loggar/tider dokumenterade och kritiska fel rättade. | Testare rekryteras inte av agent utan mandat; för lite faktisk feedback kan kräva ny tidsplan. |8–14d plus1–3 veckors insamling. |
| **7 Beta & Release** · WBC-056→057→058→059→060 | Feature freeze, full regression, exakt RC, Steamreview, faktisk distribution och launchsupport. | Fas1–6 exit, finansiering och ägarens lanseringsbeslut. Optional SDK-funktioner får inte ligga på kritisk linje. | [Alla releasegrindar](RELEASE_CHECKLIST.md): rättigheter, mänskliga prov, clean Windowsinstall, full test/build, signed/hashes där tillämpligt, verifierat Steam build-ID och offline. Ingen öppen blockerare. | Sen balans-/save-/installerregression; Valvegranskning är separat från projektets QA. |10–18d plus extern väntan. |
| **8 Post-launch** · WBC-061/062;063–065 endast nytt beslut | Tidsbegränsad buggsupport, evidensbaserade balanspatchar; besluta om framtida innehåll/Cloud/achievements. | Faktisk release, supportkapacitet och nytt mandat för optional arbete. | Repro/kompatibilitet/patchnotes/rollback testas; observationer skiljs från önskemål. Inga innehållslöften före budget. | Support kan äta all utvecklingstid; feature creep. |4–8d initial reserv; P2 ej i1.0-estimatet. |

## Beroenden och rekommenderad kalender

Kritisk kedja: **scope→Windows-PoC→save/packaging→representativ original
ras-/missionsslice→mänsklig demo→fixar/freeze→RC→Valve/ägare→launch**.
Namn/licenser löper bredvid desktopspåret och måste vara klara före
kommersiell store page/demo. Ordningen i tabellen är inte ett krav att vänta
med IP tills wrappern är färdig. En task åt gången enligt reporeglerna;
parallella kalenderaktiviteter betyder inte agentdelegering.

| Fönster, endast planeringshypotes | Milstolpe och beslut |
| --- | --- |
| Nov–dec2026 | Scope, namnutredning, Windows-PoC och minspec-baseline. Fortsätt bara med fungerande lokal desktop och finansierbar IP-väg. |
| Jan–mars2027 | Beständiga saves, godkänd art-/kontroll-/kampanjslice, ursprung och centrala prestandafynd. Räkna om återstående dagar efter faktisk takt. |
| April–maj2027 | Femraspolish, urval av10 operationer/6 kartor, store page efter klarering. Ingen ny featureexpansion. |
| Juni–juli2027 | Demo/externa spel, slutför kampanj-/AI- och Windowskvalitet; beslut om datum eller senareläggning. |
| Aug–sept2027 | Beta/RC/Steamreview/launch endast om alla grindar går igenom. Annars flyttas release. |

Fas0–7 summerar **102–174 effektiva dagar**. Med25% reserv: **128–218d /
896–1526h**, plus externa väntetider. Fas8 och frivilliga Steamfeatures ligger
utanför. Det är ett osäkert återstående projektbudgetintervall, inte summerade
löften per ticket; S=0,5–1d, M=1–3d, L=3–6d är relativ storlek före närläsning.
En L som vid start bedöms över6d delas i verifierbara delsteg under samma ID.
Om allt nuvarande innehåll eller nya riktiga åttaperspektivark krävs görs en
ny kalkyl; dagens övre gräns täcker inte obegränsad assetproduktion.
Tidsestimatet är inte ett finansieringsbesked. Den äldre externa kostnadshypotesen
överstiger10 000SEK; återbruk/avgränsning eller separat budgetbeslut behövs innan
sådana externa åtgärder kan förutsättas. Ingen rättighets-/kvalitetsgrind tas bort.

## Återbruk och exekveringsgräns

Grundläggande RTS, fem befintliga roster, campaigns, lag/fog, navigation,
tech tree, audio, sparvalidering och Pages är redan implementerade. Mappning
till äldre RTS finns i TECHNICAL_AUDIT. WBC verifierar/polerar uttryckliga
kommersiella luckor; färdiga RTS-tasks skapas inte igen med nytt namn.
RTS-208–211:s äldre Todo-text och andra motstridiga historikrader bevaras;
framtida arbete måste läsa senare tillägg och koden innan någon åtgärd väljs.

**Exakt nästa rekommendation: WBC-003 — Frys auditbaseline och Windows-mätplan.**
WBC-001/002 är Done, så taskberoendet är uppfyllt. Tillgång till maskin,
arbetstid/OS/minspec/maxAI och genomförbar mätbudget behöver inventeras där.
WBC-012 har också uppfyllt scopeberoende men ingen task startas här.
Aktuell körning stannar efter002; Electron/gameplay/assets/Steam inväntar nytt mandat.
