# Tides of War — lokalt innehållsuppdrag 2026-10-30

Status: publicerat som v0.8.0 / Build bd6d0f3 efter uttryckligt nytt mandat.
Ny CI2150/235, strict build, Pages och faktisk publicerad browser PASS.
Se [publiceringsrapport](artifacts/tides-publication/README.md).
Befintlig arbetskatalog, särskilt AI/navigation, CSS, units.mjs och docs, bevaras.

## Inventering före ändringar

- Fem spelbara fraktioner: Humans/crown, Orcs/clans, Elves, Dwarves, Goblins.
  Olika ekonomi/statistik, specialist, aktiva förmågor och magi finns redan.
- Elva land-/luftroller per fraktion: worker, soldier, archer, specialist,
  cavalry, healer, giant, catapult, ballista, scout och air. Alla har spelgrafik.
- Transport, warship och submarine finns för alla. Humans har dessutom Tide
  Runner (sea/air), Dwarves Bombard (sea/building). Detektion kräver egen sikt.
- Base i tre nivåer, barracks, farm, forge, academy, stable, aviary, siegeWorks,
  harbor, tower, wall/gate och Human/Dwarf navalFoundry. Flera producenter finns.
- Attack/defense I–II, Worker Tools I–III, cavalryArmor, healerTraining,
  scoutOptics, submarineDesign, navalLogistics. Huvudbyggnadens forskning är
  redan paginerad: fyra kolumner, två rader. Behåll detta.
- 44 unika kampanjuppdrag: åtta gemensamma och36 expeditioner. Humans16,
  övriga15. Stormgate Armada har redan tre sjövägar, öar, transporter och
  fasbaserad seger. Tolv Skirmishkartor, inklusive tre olika regionala kartor.
- Standard/Offensive/Defensive/Economic styr befintlig betald AI, scouting,
  expansion, sammansättning och anfallstempo. Ny lokal geografisk AI-rättning
  är befintligt användararbete. Inga fria resurser/sikt ska tillföras.
- Finita skatter, rekryter, bossbelöningar, expansionsgruvor och sjömonster
  finns. Sjömonster får endast angripa mänsklig spelare.
- Supply, köer, prerequisites, extra producenter, strict Save76, målledger och
  kampanjprogression måste följa innehållet. Animationer och ljud återanvänds
  från riktiga befintliga fraktionsresurser; inga nya ljudrättigheter behövs.

## Design och balans

| Fraktion | Nytt strategiskt val | Hot och svar |
| --- | --- | --- |
| Humans | Convoy Service: betald hamnreparation och vård av transporterade soldater | Kräver återtåg till hamn; splittrade räder kan kringgå logistiken |
| Orcs | Assault Ramps: sex passagerare; kortdistans Fire Barge mot sjö/byggnader;96px strandöverföring | Kan kitas av snabba skepp; använd eskort och landstigning |
| Elves | Tidewatch: flottspaning/ubåtsdetektion, längre spaning med Moonwing | Lätta skepp; känn terrängen och undvik frontstrid |
| Dwarves | Siege Shells: Bombard får liten ytskadesalva; konkurrerar med Precise Shells mot byggnader | Långsamma, saknar luftvärn; eskort och kustposition krävs |
| Goblins | Volatile Torpedoes: ubåtens salvor skadar en liten grupp sjömål men sliter på eget skrov | Kan inte bekämpa luft/land; spridda eskorter och detektion motverkar dem |

Tre omarbetade byggnader: Harbor (servicestation), Naval Foundry (fraktionernas
sjöteknik), Siege Works (Dwarf-ammunitionsval). Minst sex omarbetade enheter:
Human transport, Orc transport/warship, Elf warship/scout, Dwarf Bombard,
Goblin submarine och Dwarf Coast Ballista. Befintliga egna sprites/ikoner får fortsätta representera
rollerna; endast forskningsikoner komponeras av riktiga tillhörande resurser.

Nytt uppdrag Tidebreak Relief har den separata96×64-kartan Tidebreak Reaches,
byggd med befintlig kartpipeline och tillagd Reef Island som delar farlederna.
Ön har600 trä,1500 guld och en engångsskatt på20 trä/10 guld. Uppdraget har
egen progression och målsekvens med spaning, flottberedskap, sjöslag och
landstigning. Befintliga Stormgate Armada och saves ska fortsätta fungera.
AI får valbara Fleet/Siege-doktriner med synlig skillnad i produktion/prioritet.
Skirmishkartornas befintliga geografi/resursvägar används; den nya kampanjkartan beskriver sina farleder och förutsägbara finita resurser.
De tolv befintliga Skirmishkartorna bevaras; doktrinvalen ger nya matchvarianter.

## Verifiering

Ny unit552/94 PASS17,96s; strict TypeScript och produktionsbygge PASS546ms
(Vite, befintlig bundlevarning). Sista riktade spar-/teknikträdsprov26/2 PASS.
Fullkörningen på slutlig spelkod:2149 PASS/1 FAIL över235 filer,902,70s.
Enda felet var en äldre förväntan att Dwarf-ballistan angriper luft. Testet
rättades till Coast Ballistas avsiktliga begränsning och verifierar nu både
oförändrad mål-HP och utebliven projektil mot luft. Hela projectileDomains-filen
kördes om:13/13 PASS594ms. Ingen spelkod ändrades efter fullkörningen; dess
234 godkända filer återanvänds. Därmed finns godkända belägg för samtliga2150
aktuella testfall, men ingen andra lokal fullkörning. Efterföljande CI2150/235 är helt grön.
Slutlig build med strict TypeScript PASS546ms efter teständringen. Unit552/94
återanvänds från samma spelkod; den ändrade filen är integration. Diff och
lokala dokumentlänkar PASS. Se loggarna i artefaktrapporten.
Browser fem fraktioner ×800/1280 PASS10/10 för betald forskning, paginering,
Tech Tree och Save/Load. Tidebreak briefing/start/victory PASS2/2. Screen och
Logistics vinner i lagliga automatiserade tester med verklig strid, kostnader,
landstigning och Save vid varje målövergång;108,25 simulerade sekunder i
browserns Logistics-prov är inte mänsklig speltid.

Native före/efter sjöstrid: CPU-median/p953,9/5,0→3,8/4,8ms och frame-p95
16,7→16,8ms.80-fixture har i princip samma16,7ms frame-median/p95 men något
högre CPU-median efteråt (0,3–1,2ms).512 anfallare från fyra AI har fortfarande
stora stopp: frame-p95383,2→366,6ms, max633,4→600,0ms. Inga kalla toppar är
borttagna ur arméproven. Ingen total frånvaro av prestandaregression hävdas.
Se [reproduktion, råprofiler, bilder och loggar](artifacts/tides-of-war/README.md).

## Levererat beteende och begränsningar

- **Harbor:** Human Convoy Service reparerar stillastående levande skepp4 HP/s
  och levande passagerare2 HP/s inom160px från färdig hamn. Varje HP kostar
  0,25 trä/0,1 guld. Betalningen begränsar återställning; inga uppväckningar.
  Samma pris/radie gäller AI Humans och deras utgiftsledger.
- **Naval Foundry:** byggbar av alla fem; kostnad95 trä/55 guld,18s, kräver
  Forge och huvudbyggnad nivå2. Delar befintlig originalgrafik mellan fraktioner.
- **Siege Works:** Dwarves väljer Bombard-ammunition efter färdig Foundry.
  Siege Shells och Precise Shells blockerar varandra även när ett val är köat.
- **Åtta berörda enheter:** Human transport vårdar passagerare; Orc transport
  får6 platser/96px överföring; Fire Barge skjuter30 skada/1,5s på96px mot
  sjö/byggnader, byggnadsmultiplikator1,4 och inget luftvärn; Swift Sail blir
  en150px/s sjö-/lufteskort med Tidewatch288px sikt/192px detektion; Moonwing
  får352px sikt; Bombard väljer48px sjö-/byggnadssplash eller3× byggnadsskada;
  Coast Ballista får1,75× sjöskada men lägre1,25× byggnadsskada och tappar luftmål;
  Sea Sneak får48px sjösplash för4 egna HP per torped och slutar skjuta vid≤4HP.
- **Sex nya forskningar:** Convoy Service70 trä/45 guld/24s; Assault Ramps
  60/40/20s; Tidewatch55/45/20s; Siege Shells respektive Precise Shells80/65/28s;
  Volatile Torpedoes55/60/22s. Endast rätt fraktion ser/köper dessa.
- **AI:** Fleet prioriterar Foundry/flygproduktion och scout-/bågskyttsblandning
  samt betald flotta upp till befintliga sex stridsskepp. Siege bygger Siege Works
  först och producerar fler ballistor/katapulter. Befintliga offensiv-, defensiv-
  och ekonomidoktriner, fog, tempo, scouting, expansion och cap består. AI:s
  äldre skriptade transportanfall behåller två soldater; den utnyttjar inte
  sexplatserstaktiken autonomt. Inga nya fria pengar eller informationskanaler.
- **Kampanj:** Human uppdrag17: öspaning → fem levande skärmskepp → kontroll
  över central farled → besegra flottan → verklig landstigning → kustbas.
  Behåller svårigheter, basförlust, progression och permanent fasledger.
  Några faser kan avslutas samtidigt när spelaren redan uppfyller nästa mål.
- **Grafik/ljud:** riktiga befintliga fraktionssprites, rörelser, projektiler,
  dödsanimationer och befintligt distribuerbart ljud återanvänds. Forskningsikoner
  kombinerar relevanta atlasbilder och egna befintliga glyphs. Inga nya raster-
  assets eller ljudinspelningar producerades; Naval Foundry delar byggnadsgrafik.
- Save77 migrerar äkta76 utan gratis teknik och sparar nya val, sex passagerare,
  pågående sjöprojektiler, doktrin och kampanj. Ingen produktversionsändring.

Ingen mänsklig matchlängd/balansbedömning eller ny faktisk ljudlyssning hävdas.
Den kända prestandabegränsningen vid stora AI-arméer kvarstår. Inga breda
prestandaomskrivningar, höjda enhetstak eller nya karteditorfunktioner ingår.

## Enheternas befintliga kostnader och nya roller

| Enhet | Trä/guld · tid · supply | Krav | Roll och begränsning |
| --- | --- | --- | --- |
| Human Transport |40/10 ·8s ·2 |Harbor; Convoy Service för vård |Obeväpnad logistik;90HP,110px/s; måste stanna vid hamn |
| Orc Raft |40/10 ·8s ·2 |War Dock; Assault Ramps för sex platser |Obeväpnad landstigning;100HP,105px/s; sänkt transport förlorar lasten |
| Orc Fire Barge |40/15 ·8s ·2 |War Dock |100HP,105px/s;96px salvor mot sjö/byggnader, inget luftvärn |
| Elf Swift Sail |45/15 ·8s ·2 |River Dock; Tidewatch för spaningsrollen |80HP,150px/s;192px sjö-/lufteld, kan inte bombardera land |
| Elf Moonwing |25/15 ·6s ·1 |Huvudbyggnad2 + Aviary; Tidewatch |35HP,240px/s; obeväpnad luftspanare,352px sikt efter forskning |
| Dwarf Bombard |110/75 ·28s ·4 |Harbor + Naval Logistics; Siege Works/Foundry för ammunition |160HP,60px/s;288px,38/3,5s; endast sjö/byggnader, behöver eskort |
| Dwarf Coast Ballista |65/40 ·16s ·3 |Huvudbyggnad2 + Forge + Siege Works |90HP,75px/s;224px,22/2s;1,75× mot sjö,1,25× byggnader; inget luftvärn |
| Goblin Sea Sneak |75/50 ·20s ·3 |Harbor + Submarine Design; Volatile Torpedoes för splash |100HP,125px/s;160px,24/1,8s; endast sjö, upptäcks av eskorter |

Attacktyp, aktuella måltyper och kostnader visas även i träningsval/Tech Tree
respektive enhetsinspektion. Enhetens ursprungliga sprite/ikon följer samma
stabila roll-ID, så befintlig produktion, kontrollgrupper, död, ljud och Save
fortsätter använda den färdiga asset-pipelinen.
