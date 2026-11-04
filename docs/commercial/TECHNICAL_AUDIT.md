# Kommersiell audit — faktisk implementation

Granskat 2026-11-03 på `main`, HEAD `c32393e636a00b8f8885b64794eefb51262cee74`,
produktversion 0.9.0. Detta är käll-/dokumentgranskning, manifestinventering och
granskning av två befintliga browserbilder; ingen ny spel-, Windows- eller
prestandakörning. Lokala användarändringar i CSS och `units.mjs` ingår i
arbetskopian och har bevarats. Ingen ny CI-/Pages-status hävdas.

WBC-002-tillägg2026-11-03: produktriktningen är nu godkänd, inklusive Goblins
och Electron-PoC först. Sourcekoden är oförändrad. Ny källkontroll skiljer18
kart-ID:n från16 skirmishval; straits/tidebreak är campaignOnly (den senare
ärver flaggan). Ingen Windows-, rättighets- eller kvalitetsacceptans tillkommer.

[Release scope](RELEASE_SCOPE.md) anger godkända ramar och öppna detaljer; [BACKLOG](../../BACKLOG.md)
är enda exekveringslista. [Auditen 0.9.0](../audits/warbound-0.9.0.md) och
[techkortens publiceringsbelägg](../../artifacts/tech-card-input/README.md)
är historiska belägg, inte kommersiella godkännanden.

## Klassificering och slutsats

**1 Release-ready**, **2 Functional but needs polish**, **3 Incomplete**,
**4 Missing**, **5 Requires verification**. Klassificeringen gäller kommersiell
Windows-release. 2 betyder att implementation finns; det lovar inte felfrihet.
5 används när mänsklig bedömning eller målplattform krävs. Ingen hel del kan
ges klass 1 enbart genom denna statiska audit.

Warbound har redan ett omfattande spel, inte bara en browserprototyp. De största
luckorna är distribution/persistens på Windows, rättigheter och egen identitet,
mänsklig spelvalidering samt ett begränsat innehåll som faktiskt kan sluttestas.
En motorflytt eller en ny RTS-implementation motiveras inte av underlaget.

## Gameplayinventering

Filvägar nedan är relativa repositoryroten. Relevanta äldre RTS-ID:n anger
återanvändning; deras historiska status ändras inte av denna audit.

| Område | Klass | Faktisk implementation och belägg | Kommersiell lucka / WBC |
| --- | --- | --- | --- |
| Rörelse/pathfinding | 2 | `src/gameplay/movement.ts`, `navigation.ts`, `terrainNavigation.ts`, `groupMovement.ts`, `traffic.ts`, `separation.ts`; kroppsclearance, BFS, förenklade kollisionssäkra rutter, formationer. RTS-171/194/200. | Trängsel och initial orderstall i normal match måste mätas, WBC-030. |
| Urval/order | 2 | `selection.ts`, `controlGroups.ts`, `commandOrders.ts`, `attackMove.ts`, `orders.ts`; klick/drag/Shift, grupper, Hold/Patrol/köer. RTS-170/171, PRIO-01. | Verkliga musklick i pågående matcher; fokus efter Alt-Tab, WBC-006/026. |
| Resurser/ekonomi | 2 | `gathering.ts`, `resourceQueue.ts`, `economy.ts`, `forestTerrain.ts`, `extraBases.ts`; ändligt trä/guld, fysisk last och leverans, avverkning, betalda baser. RTS-194/203/244. | Mänsklig expansions-/resurskurva och slutmatch, WBC-033/043/044. |
| Byggande | 2 | `placement.ts`, `construction.ts`, `fortifications.ts`, `gates.ts`, `wallDrag.ts`, `repair.ts`; syn/access/connectivity, byggarjobb, försvar och reparation. RTS-160–164/242. | Begripliga fel och försvar som fungerar i längre matcher, WBC-026/031/033. |
| Produktion | 2 | `production.ts`, `productionQueue.ts`, `extraProducers.ts`, `productionPrerequisites.ts`, `population.ts`; kostnader, supply, FIFO/rally och flera producenter. | Åtkomst ska verifieras med hela klickytan, kö/full supply/spawnblockering, WBC-026/057. |
| Combat/skada | 2 | `combat.ts`, `navalCombat.ts`, `projectiles.ts`, `domains.ts`, `selfDefense.ts`, `threatResponse.ts`; målmasker, splash, armor, lokalt försvar/flykt. | Respons, tydliga counters och formationsstall; WBC-030/031/034. |
| Förmågor/magi | 2 | `abilities.ts`, `mana.ts`, `spells.ts`, `enemySpells.ts`, `src/config/abilities.ts`, `spells.ts`; olika rasloadouts och AI-användning. RTS-165–169. | Castingbilder och läsbar feedback är delvis härledda, WBC-015–020/031. |
| Forskning/tech tree | 2 | `research.ts`, `baseUpgrade.ts`, `src/config/roleResearch.ts`, `workerTools.ts`; delad admission i `src/presentation/technologyView.ts`, `researchCards.css`, `researchPages.ts`. RTS-161/204/226. | Två novemberfixar behövdes trots tidigare PASS; behåll fysiska mitt-/kantklick, WBC-026. |
| Fog/stealth | 2 | `fog.ts`, `matchFog.ts`, `visibility.ts`, `buildingMemory.ts`, `enemyKnowledge.ts`, `submarines.ts`; current/explored, senast sedd byggnad, egen AI-kunskap och detektion. RTS-243/227. | Kontrollera att rendering/ljud aldrig läcker dold information efter Save/Load; WBC-032/057. |
| Seger/förlust | 2 | `match.ts`/`teamResults.ts`, `campaignPhases.ts`, `operations.ts`; basförlust, lag, timer, eskort, rescue, capture/blockad/evakuering. | Långa spel får inte låsas av otillgängliga sista mål; WBC-038–045. |
| Sjö/luft/endgame | 2 | `navy.ts`, `transport.ts`, `autoTransport.ts`, `enemyNaval.ts`, `enemyColonies.ts`, `fleetService.ts`, `giants.ts`, `src/config/largeUnits.ts`. RTS-168/196/220–229 samt senare sjöuppdrag. | Befintliga systems kvalitet, inte fler roller; WBC-034/035. |
| Neutrala djur/bossar | 2 | `wildlife.ts`, `bosses.ts`, `discoveries.ts`; optional guardians, hoards, vandring/jakt och sea serpents. RTS-212/228/230/251. | Valfrihet, rättvisa och licenser för inspelningar; WBC-025/043. |

## Fem raser: vad som faktiskt är spelbart

`src/config/factions.ts` har **crown (Human), clans (Orcs), elves, dwarves,
goblins**. Ingen `gnomes`-identitet, separat roster eller gnomkampanj finns.
WBC-001:s Gnomes-formulering motsvarade därför inte implementationen. WBC-002
löser produktavvikelsen genom att uttryckligen behålla Goblins och avstå Gnomes;
ingen ny ras behöver implementeras. Befintliga fem är fortsatt **2 Functional
but needs polish** och saknar kommersiell kvalitets-/IP-clearance.

Alla delar samma fysiska ekonomi, order, bygge, fog, köer och huvudsakliga
techmodell. Gemensamma spelbara roller: worker, soldier, archer, catapult,
specialist, air, cavalry, healer, giant, scout och ballista (11).
Varje ras får en kustinfanteriroll (12); Orcs får dessutom behemoth och
Goblins zeppelin (13 vardera). `UnitRole` innehåller också definitioner som
inte är tillåtna för varje ras: räkna **roster/admission**, inte objektets alla
recept. RTS-136–140/165–168/220–229 och senare Island Fleets återanvänds.

| Ras / faktisk rosteridentitet | Namngivna roller utöver gemensamma basroller | Skillnader som finns i config | Teknik och risk |
| --- | --- | --- | --- |
| Humans / `crown` | Banner Guard, Gryphon Rider, Knight, Chaplain, Hill Titan, Sky Owl, Coastal Marine; Storm Ark på sjön | Defensive Stance; Heal/Ward/Hex; Convoy Service; Tide Runner/Repair Tender | Bas I–III, Forge I/II, Academy, Worker Tools I–III och rollforskning. Skydd/formation/hamnvård kan upplevas svagt före sent tech. |
| Orcs / `clans` | Raider, Wyvern Rider, Wolf Rider, Spirit Mender, Ogre Brute, Bat Scout, Boarding Marauder, Ironback Behemoth | Fury; War Cry/Intimidate; Assault Ramps; Fire Barge/Flame Galley | Snabb och stark närstrid, kortare bågräckvidd, svagare byggnader. Rushtempo och sex passagerare måste speltestas. |
| Elves / `elves` | Marksman, Great Eagle, Stag Rider, Grove Healer, Ancient Treant, Moonwing, Harpooner | True Shot; Renew/Wither; Tidewatch; Swift Sail/Survey Launch | Rörlighet, range, syn/detektion; lättare kroppar/byggnader. Kiting och sjö/luftskydd kräver mänsklig bedömning. |
| Dwarves / `dwarves` | Bulwark, Gyrocopter, Ram Rider, Rune Priest, Runic Golem, Survey Drone, Powder Sapper | Brace; Mend/Rune Shield; Bombard/Mortar Monitor, Coast Ballista, exklusiva shells | Långsammare, tåligare, siege; vissa maskiner är inte healable. Räckvidd/blockader och dyra giantmål i kampanj behöver valideras. |
| Goblins / `goblins` | Grenadier, Airship, Boar Rider, Field Medic, Clockwork Colossus, Spotter Balloon, Fuse Runner, Brass Leviathan | Overcharge; Overclock/Corrode; Volatile Torpedoes/Torpedo Skiff | Billigt/snabbt/skört, splash och egen skaderisk. WBC-002 behåller befintlig Goblin-teknikerroster; ingen Gnomes-konvertering ingår. |

Byggnadsrecept finns för base, barracks, farm, forge, academy, stable, aviary,
siegeWorks, drydock, signalTower, navalAcademy, marineBarracks och navalFoundry.
Harbor samt tower/wall/gate ligger i separata system: **17 byggnadsslag** i
presentationens `BuildingKind`, inte äldre presentationsuppgift om 12.
Namn för grundbyggnaderna är rasbundna (Keep/Stronghold/Grove Hall/Stone Hold/
Workshop Hall etc.); flera marina byggnader delar namn och härledd art.
`src/config/navy.ts` har 11 skeppsroller; `navalRoleAvailable` ger Humans 6,
Orcs 4, Elves 4, Dwarves 5 och Goblins 4 tillåtna roller, inklusive transport
och submarine. `src/config/factionDescriptions.ts`, `factionLore.ts`,
`abilities.ts`, `spells.ts`, `air.ts`, `fleetDoctrine.ts` och `roleResearch.ts`
anger skillnaderna. Ingen mänskligt verifierad balansmatris hittades i de
granskade releasebeläggen. Slutanimationer och rättighetskontroll saknas för
kommersiellt godkännande; se [IP-audit](IP_AUDIT.md).

## Modes, innehåll och UX

| Område | Klass | Befintligt / källor | Återstående |
| --- | --- | --- | --- |
| Campaign | 2 | `src/config/campaign.ts`: 8 äldre ID:n; `campaignExpeditions.ts`: 37 tillägg. `campaignMissionsFor` ger Human 17, övriga 15 = **77 val, 45 unika ID:n**. Ras-/difficultyledger, authored faser. RTS-142–146/177–179/185–186/248. | Återbrukade mallar är inte 77 unika berättelseuppdrag. Välj kompakt kommersiell kedja, WBC-036–045. |
| Skirmish/AI | 2 | `src/config/players.ts`: en människa, upp till 4 AI på kartor med slots. Lag/allierad syn/spectator är lokala botmatcher; **ingen nätmultiplayer**. `enemyStrategy.ts`, `enemyPolicy.ts`, `enemyConstruction.ts`, `enemyExpansion.ts`, `enemyNaval.ts` och `enemyColonies.ts` betalar via vanliga system. RTS-172–176/246/252. | Långa rättvisa och avslutningsbara land-/ömatcher på Windows, WBC-032–035. |
| Svårigheter | 2 | `src/config/difficulty.ts`, `skirmishPacing.ts`, `enemyStrategy.ts`: Beginner/Easy/Normal/Hard, flera AI-profiler, separat tryck/tempo/budget. | Ingen generell garanti om identiska startresurser. Förklara fördelar och pröva Easy med nya spelare, WBC-032/044. |
| Kartor | 2 | `src/config/maps.ts`: **18 ID:n**; `skirmishMapIds` utesluter campaignOnly. Nio äldre, tre nya skirmish, fyra Island Fleets, Straits och Tidebreak. | Råantal ersätter inte spawn-/resurs-/sjöbalans. Välj 6 releasekartor ur befintliga, WBC-043. |
| Save/Load | 2 browser / 4 desktopfiler | `src/config/save.ts`: schema2/config80, gräns4 000 000; `src/gameplay/save.ts`, `multipleSave.ts`: strikt format/migrering/ägarskap. En localStorage-slot, pausa före återupptagning. RTS-059 och senare migreringar. | Ingen filbackup, slotslista eller browser→desktopimport. LocalStorage är originbundet; WBC-007/008. |
| Restart/progression | 2 | `src/gameplay/session.ts`, `campaign.ts`, `src/presentation/resultScreen.ts`, `campaign.ts`, `campaignFlow.ts`; retry/replay/next mission, framsteg separat från matchsave. | Curated kedja får inte förstöra gamla ID:n/ledgers, WBC-037. |
| Huvudmeny | 2 | `index.html`, `homeMenu.ts`, `skirmishMenu.ts`, `factionPortrait.ts`; kampanj, fria matcher, load, lokala resultat, changelog och settings. | Kommersiell titel, desktop Quit och rena demo-/fullval; WBC-006/012/023. |
| HUD/minimap | 2 | `hud.ts`, `actionPanel.ts`, `minimap.ts`, `minimapView.ts`, `selectionInfo.ts`; syn/senast sedd information, actiongrupper och egen forskningspanel. RTS-148/205–207/243. | 800×600 är tekniskt testat historiskt men tät text/kort syns i sparade bilder. Läsbarhet, DPI och färgoberoende ägarskap, WBC-023/028. |
| Commands/Tech Tree | 2 | `commandsView.ts`, `technologyView.ts`, separata pausvyer; byggnadsspecifik forskning och tangentfokus. RTS-161/198/207. | Förklaringar är stora; prioritera första spelarens frågor, WBC-026/029. |
| Kortkommandon | 3 | `hotkeys.ts`, `keyboard.ts`, `cameraInput.ts`, `controlGroups.ts`; omfattande fasta bindningar, flera använder F13–F21 som vanliga tangentbord saknar. | Ingen ombindnings-UI. Desktop F5/F11/F12 och OS-tangenter kräver prövning, WBC-027. |
| Settings | 2 | `preferences.ts`, `audioPolicy.ts`, `cameraPreferences.ts`, `displayPolicy.ts`; lokalt master/music/effects/voices/mute, kamera, upplösning/fit och spelval. | Persistens i desktop, UI/textskala och kontrollåterställning, WBC-006/007/027/028. |
| Tillgänglighet | 3 | DOM-knappar, fokus, aria/status, paus/hastighet, textbaserade instruktioner; canvasstrid kräver syn/timing. | Färgblindhet, textskala, motion och läsbarhet ej helverifierade. Praktiskt minimipaket, ingen full icke-visuell spelbarhetsutfästelse; WBC-028. |
| Tutorial/onboarding | 2 | `src/gameplay/tutorial.ts`, `src/config/tutorial.ts`, `campaignContent.ts`, `src/presentation/tutorial.ts`; urval, flytt, levererat trä, bygge, producerad soldat, attack. | Faktiskt 10–15 min nybörjarprov saknas; förklara supply, hot och sjö i steg, WBC-029/054. |
| Felmeddelanden | 2 | `commandFeedback.ts`, `researchReason` i `research.ts`, `placement.ts`, save-/audio-/preferencesstatus. Novemberfixen testar hela kortets yta. | Phaser-loadfel och fatal exception saknar sammanhängande återhämtning/loggning, WBC-009. |
| Upplösning/fullscreen | 2 browser / 5 Windows | `src/main.ts`: ResizeObserver/scale.resize; `displayPolicy.ts`: 800×600–4K/ultrawide; `fullscreen.ts`: browser-API med felstatus. RTS-153/184/199. | Native fönsterläge, skärmbyte, 125/150/200% DPI, fokus/sleep; WBC-006. |

## Teknisk distributionsaudit

| Område | Klass | Verifierat i källan / följd |
| --- | --- | --- |
| Stack/build | 2 | Phaser **4.2.1**, TypeScript **7.0.2**, Vite **8.3.5**, Vitest **4.1.12** enligt package/lock. `npm run build` kör strict typecheck före statisk Vite-output. `private:true` är inte en kommersiell licens. |
| Basväg | 3 | `vite.config.ts` låser build/preview till `/warbound/`; build-ID från git, fallback unknown. Desktop kräver separat bas/protokollstrategi, befintlig Pages-bas ska bestå. |
| Init/laddning | 2 | `src/main.ts` skapar Phaser.AUTO, pixelArt och en BootScene; HTML/CSS/HUD är DOM. `BootScene.preload` hämtar lokala PNG/JSON via BASE_URL. `audio.ts` fetch/decode av lokala WAV/OGG/manifest. |
| Browserberoenden | 3 desktop | DOM/window, URL-parametrar, ResizeObserver, localStorage, fetch, WebAudio och Fullscreen API. Inga granskade gameplaymoduler behöver Node eller extern server. Browser är fortfarande den enda levererade runtime. |
| Offline | 2 lokala tillgångar / 5 kallstart | Lokala sprites/ljud/systemfonts; inga identifierade obligatoriska fjärranrop i spelets laddvägar. Inget service-worker-/installpaket hittat. GitHub Pages är inte ett löfte om offline första körning. Alla assets måste paketeras. |
| Disk/persistens | 4 desktop | Matchsave, campaign v1/v2, preferences och highscores har separata localStorage-nycklar. Ingen användarfilhantering i runtime. Origin/appnamn får inte ändra dataplats utan migration. |
| Prestanda | 5 Windows | Historisk 128+32-stress på 0.9: frame p95 33,3ms/max183,3ms, initial stall kvar; ingen Windows/minspec-garanti. Stor BootScene och tät Save-kod ger ändringsrisk, inte mandat till omskrivning. |
| Assetstorlek | 2 / 5 GPU | Ny diskinventering: public **81,19MiB**, därav assets43,00/audio38,19; 506 filer. Assetmanifestet listar19 atlasser, separat reference-terrain laddas också. PNG-filstorlek är inte dekodad GPU/RAM-kostnad. Mät kallstart/minne, WBC-035. |
| Automation | 3 | `.github/workflows/pages.yml`: Linux npm ci/full test/build/presentation/Pages; SHA-pinnade actions. Inga Windows-artifacts/installprov, ingen desktopversionering/signering. WBC-010/011. |
| Crash/loggning | 4 | Lokala storage/audiofel hanteras, men ingen samlad fatal-errorvy, roterande lokal logg, native renderer-crash recovery eller GPU-recovery hittad. WBC-009; ingen obligatorisk telemetri. |
| Säkerhet | 3 desktop | Befintligt JSON valideras strikt. Ingen explicit CSP i index; credits använder target blank, länkar måste hanteras inom lokal origin/allowlist. En wrapper får inte ge spelrenderern generell Node-/filsystemåtkomst. |
| Steam | 4 | Ingen Steam SDK/binding/app-ID/depot/installkonfiguration hittad. Distribution kan planeras utan achievements/Cloud; håll SDK-arbetet separat efter fristående desktopbevis. |

## Packagingval: jämförelse och godkänd första PoC-väg

| Alternativ | Nytta för detta repo | Kostnad/risk | Bedömning |
| --- | --- | --- | --- |
| Electron + Electron Forge | JS/TS-main/preload, medföljande Chromium, nära befintliga Chrome-belägg; Phaser/DOM/WebAudio kan behållas. | Större paket/minnesfotavtryck, regelbundna runtimeuppdateringar och säker IPC krävs. Ingen uppmätt storlek/FPS ännu. | **Rekommenderas** som enklast för denna kodbas, villkorat WBC-004. [Packaging](https://www.electronjs.org/docs/latest/tutorial/tutorial-packaging). |
| Tauri 2 | Behåller Vite/Phaser; kan ge mindre skal när systemwebview återanvänds. | Rust/C++-byggverktyg och WebView2; normalt installflöde kan behöva nät. Offline/fixed runtime behöver distribueras och underhållas. | Reserv om faktisk storleks-/minnesvinst motiverar mer arbete. [Prerequisites](https://v2.tauri.app/start/prerequisites/), [Windows installer](https://tauri.app/distribute/windows-installer/). |
| NW.js | HTML/CSS/JS/WebGL och paketerad runtime. | Ytterligare shellval utan påvisad fördel här; DOM/Node-modellen kräver avgränsning. | Rimligt men ej förstaval. [Projektets dokumentation](https://nwjs.io/). |
| PWA / egen WebView2-värd | PWA kan förenkla browserinstallation; native WebView2 kan vara tunt. | PWA ger inte i sig Steam-depot/native support. Egen Windowsvärd flyttar wrapper-/bridgearbete till projektet. | Ingen fördel för första Steam-leveransen. |

Electron-PoC först är nu ett produktbeslut i WBC-002; ingen wrapper är byggd
eller permanent paketering verifierad. Jämförelsen är en projektspecifik
bedömning, inte ett löfte att Electron är snabbare än Tauri. Steam Overlay och native SDK-kompatibilitet är ännu obevisade.

## Minimal Windows-PoC — framtida WBC-004

Tidsbox 1–3 effektiva dagar efter WBC-002/003. En separat liten main-process
och vid behov preload öppnar **oförändrat gameplay** i ett fönster. Prova en
lokal standard/secure origin, exempelvis `app://warbound/`, registrerad före
ready och mappad enbart till paketerad dist. Origin är ett tekniskt ID som ska
vara stabilt även vid namnbyte. Konkreta filer/layout väljs i tasken.

- Isolerad renderer: nodeIntegration av, contextIsolation och sandbox på,
  webSecurity på. Ingen remote navigation, inget godtyckligt shell/IPC eller
  åtkomst utanför paketet. Blockera traversal efter canonicalisering; tillåt
  endast avsedda resurser och metoder. Välj CSP för faktiskt Phaser/WebAudio.
- Desktop-base och protokoll ska stödja ES-moduler, fetch och audio. Behåll
  `/warbound/` för Pages. PoC får vara unpacked; installer och beständig
  filpersistens är egna slices, WBC-005/007/010/011.
- Starta på faktisk Windows x64 utan Node/Vite-server och med nät avstängt.
  Meny→skirmish→betalt bygge/produktion→Save→processstängning→Load→resume.
  Prova även kampanjstart, audio/credits, resize/fullscreen och Alt-Tab.
- Rapportera OS/hårdvara/GPU/runtime, cold-start, processminne, frame-/inputtid,
  paketstorlek, saknade assets och konsolfel. Jämför samma browserfixture;
  en snabb smoke ger ingen full matchbalans.
- Godkänd PoC: inga externa requests krävs; lokala tillgångar/fokus/input
  fungerar; sparningen återfinns vid omstart i samma origin. Windowsfel eller
  oförklarad regression stoppar spridning. Välj Tauri-jämförelse bara om ett
  dokumenterat problem motiverar det. Ingen Steamworks i PoC.

Säkerhets-/protokollkrav baseras på aktuella primärkällor:
[Electron security](https://www.electronjs.org/docs/latest/tutorial/security),
[protocol](https://www.electronjs.org/docs/latest/api/protocol) och
[app/userData](https://www.electronjs.org/docs/latest/api/app), lästa 2026-11-03.

Slutlig persistens rekommenderas som validerade JSON-dokument i stabil
userData-plats med atomiskt filbyte/backup, inte skrivning i Steam-depot eller
installationskatalog. Återanvänd encode/decode och campaign-/preferencesformat;
lägg bara en smal, validerad save/load-brygga vid presentationsgränsen.
Async disk-I/O kräver en uttrycklig anpassning av nuvarande synkrona SaveStorage;
detta är ingen färdig utbytbar adapter. Browser sparningar flyttas inte
automatiskt: planera frivillig export/import och bevara originalet.

## Verifieringsunderlag och dokumentkonflikter

Ny statisk kontroll: `node scripts/test-unit.mjs --list` ger **92 unitfiler +
154 integrationsfiler = 246**, disjunkta och manifestvaliderade. Det kör inga
tester. Nya JSON-/filinventeringar bekräftar 405 röster, 81/ras; 81 dvärgklipp
har CC-BY-SA-3.0, trots äldre uppgift63. Se IP-auditen.

Historiskt: tech-card-leveransen `00a05da` rapporterar CI2329 tester/246 filer,
strict build/Pages och publik 8/8-matris. Tidigare0.9-audit avser `02740d1` och
2313/245. Dessa resultat lästes i befintliga artifact-/statusdokument; de har
inte körts om eller kontrollerats live mot GitHub här. Sparad0.9/800-researchbild
och0.8/1280-fleetbild öppnades visuellt; det är inte en ny browserkörning.

Äldre GAME_DESIGN nämner Iron & Timber/åtta uppdrag/nio kartor;
presentationssiffror anger14 enheter/12 byggnader; AGENTS har gamla etappstopp;
BACKLOG har äldre208–211 Todo parallellt med senare implementerade tillägg.
Nuvarande källor och senaste konkreta belägg väger tyngre. Historiken lämnas
kvar och gamla tasks ändras inte. Den kommersiella planen beställer inte en
ny implementation av Next Mission, murar, farm/guld, femrasroster eller Save.
