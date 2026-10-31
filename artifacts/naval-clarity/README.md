# Lokalt sjö-/tydlighetsuppdrag — 2026-10-31

Senare mandat: commit, push och publicering är nu genomförda. Ny CI-fullregression
2290/243 och faktisk Pages/browser är verifierade; se
[publiceringsrapporten](../naval-clarity-publication/README.md). Följande text
beskriver det tidigare lokala implementationsskedet.

Implementerat lokalt enligt det bifogade uppdraget. Ingen commit, push,
publicering, versionshöjning eller delegering. Ursprunglig användar-CSS och
units.mjs har samma SHA256 före/efter; docs/, sparningar och övriga fristående
filer bevaras. Tidigare CI/Pages gäller den publicerade0.8.0, inte denna kod.

## Verkliga fynd och ändringar

- Profilering av två konkreta fiendekontakter. Lokal kroppseparation undviker
  full grannsortering och ger exakt samma korrigeringar. Alla före/eftervärden,
  kvarstående toppar och mätbegränsningar finns i [performance.md](performance.md).
- Forskning visades tidigare vid basen och många irrelevanta byggnader, med
  sidväxling. Nu finns en hembyggnad per forskning, utan sidor. Högst två breda
  rader visar namn, kostnad och status; fokus/hover visar full effekt och krav.
  Pågående forskning och kö visar tid. Akademin tar över attack/försvar II.
- Flera hamnar fungerade redan i modellen men stoppades både av knappen och
  klickhanteraren. Båda spärrarna är borta. Varje hamn har egen verklig kö,
  konstruktion, urval och waypoint. AI:s extra hamn använder samma betalda
  placerings-/produktionsadapter; dess strategival att stanna vid två hamnar
  är inget tekniskt tak för spelaren.
- Twinwake, Trident, Four Crowns och Farreach har tre sammanhängande skogskluster
  per ö: det befintliga södra beståndet samt två ytterligare södra lober, med
  fria mellanrum mot basen och landstigning. Befintliga15 träd får180 ved i
  stället för60; ytterligare kluster tillkommer. Alla startöar har7000–7720
  ved och mindre än11% skillnad. Två15-minuters ekonomiprov visar fortsatt
  utvinning och mer än3000 ved kvar på AI:s startö. Gamla saves behåller exakt
  den gamla skogen, skördade mängder, balans och statistik via Save80-migration.
- Skirmish visar land/blandad/sjöfokuserad karta och förklarar automatiskt sjöspel.
  Kartans befintliga enemyNaval väljer AI-överfarter; det finns ingen separat
  nödvändig naval-switch. Fleet är en AI-spendstil och behövs inte för skepp.
  De fyra frivilliga uppläggen väljer bara karta, raser, antal AI och AI-stil;
  segerregler, svårighet och egna redigerbara inställningar består.
- Kampanjens innehållsfilter blockerade nya sjöbyggnader/-enheter. Det är rättat,
  inklusive klassningen av alla nya skeppsroller som skepp. Understödsfartyg
  räknas inte som beväpnade fartyg i passage-/stridsmål.

## Forskningens plats

| Byggnad | Forskning |
|---|---|
| Huvudbyggnad | Worker Tools, basnivåer |
| Forge | Attack I, Defense I |
| Academy | Attack/Defense II, Healer Training, Submarine Design |
| Stable | Cavalry Armor |
| Aviary | Scout Optics |
| Naval Foundry | Naval Logistics och rasens doktrin/ammunitionsval |
| Naval Academy | Light Hulls / Reinforced Bulkheads, Coastal Gunnery |
| Signal Tower | Naval Optics |
| Drydock | Repair Cranes |
| Marine Barracks | Amphibious Drill |

Forge är fortsatt ett krav för flera tekniker; Siege Works är ett krav för
Dvärgarnas ammunition, men forskningen utförs i Naval Foundry.

## Hamnwaypoints

Välj hamnen och högerklicka på öppet vatten. Nyproducerade skepp planerar en
vattenväg från sin riktiga utgång och åker mot punkten. Högerklick flyttar den;
Shift + högerklick rensar den. Kartmarkören följer vald hamn. Ogiltigt land eller
vatten utan förbindelse ger feltext och behåller föregående punkt. Ändringar
gäller också redan köade skepp när de färdigställs; redan avgångna skepp behåller
sin order. Varje hamns punkt och kö sparas separat. Browserprovet placerar två
hamnar med riktiga musklick, väljer dem, anger/rensar punkter, betalar två köer,
laddar Save och når båda vattenmålen.

## Kampanj och nya stora enheter

- Stormgate Armada och Tidebreak Relief: nya sjöbyggnader, hull-/sikt-/reparations-
  forskning, Repair Tender och Marine-produktion är tillgängliga. Nytt innehåll
  har producerats/forskats med UI i båda uppdragen och strict-sparats. Båda
  uppdragens vanliga mål har genomspelats till faktisk renderad seger med
  lagliga automatiserade order och Save vid fasövergångar, utan resurs-/HP-/
  foginjektion i själva genomspelningsprovet. Tidebreak kräver två samtidiga
  blockader och verklig transport/evakuering; Stormgate kräver sjöstrid och
  landstigning. Inga nästan identiska nya uppdrag skapades.
- Signal Tower/Naval Optics introduceras från ordinarie transportuppdraget5;
  de nya sjöbyggnaderna, trupperna och hullteknikerna från uppdrag8. Avancerade
  fraktionsskepp, doktriner och de tre stora enheterna finns i senare expeditioner.
- **Storm Ark**: Human kapitalfartyg,520HP,7 supply,200 ved/160 guld,45s;
  272px broadside mot skepp/byggnader och1,75× byggnadsskada. Långsam58px/s,
  ingen anti-air. Kräver Harbor, Naval Academy, Drydock, bas III och forskning II.
  Finns i båda Human-sjöexpeditionerna. Inte ett flygplansbärande hangarfartyg.
- **Brass Leviathan**: Goblinzeppelinare,330HP,6 supply,170/140,42s;352px sikt,
  288px bombning och40px splash mot mark/sjö/byggnader.70px/s, ingen anti-air.
  Aviary + Academy, bas III och forskning II. Testad i Two-Sided Bargain.
- **Ironback Behemoth**: Orkiskt bepansrat urtidsdjur,560HP,6 supply,160/130,40s;
  44 skadepoäng/s och3× byggnadsskada i närstrid.52px/s, ingen sjö-/luftattack;
  ranged kiting och fokuseld är motspel. Academy, bas III och forskning II.
  Testad i Warband Confluence.32px spelkropp och större64px klickområde låter
  den använda spelets normala passager, med egen större96px sprite.

Alla tre använder vanliga kostnader, teknik, köer, global supply, rörelse,
strid, projektiler, AI, urval och Save. Se [originalgrafik, export och ljud](../../assets/sources/leviathans/README.md).

## Verifiering

- `npm run test:unit`: **567 tester /96 filer PASS**, [slutlig logg](unit-final.log).
- `npm run build`: **PASS**, inklusive `tsc --noEmit` med strict TypeScript;
  [bygglogg](build.log). Befintlig bundlevarning kvarstår.
- `npm test`: **2286/2288 PASS**,241/243 filer,988,06s, exit1;
  [hela loggen](regression.log). Två fel gällde en föråldrad rollkatalog och en
  modern ökartafixtur omdöpt till Save78. Testförväntningarna/fixturen rättades,
  utan att ändra spelkoden för att passa testerna.
- `npm test -- src/config/factions.test.ts src/gameplay/replayObjectives.test.ts`:
  **8/8 PASS** efter dessa rättningar, [omkörning](regression-fixtures-rerun.log).
  Övriga2280 fall upprepades inte; samtliga2288 testfall har nu verifierats över
  fullkörningen och omkörningen. Därefter tillkom ett riktat namnfältstest som
  passerar i slutlig unit567/96. En sammanhängande `npm test` med exit0 har
  inte körts efter rättningarna.
- Sista synliga waypointinstruktionen, urvalsstatistiken och nya kortkommandon:
  **25/3 PASS**, [riktad logg](selection-waypoints-hotkeys.log). Tangentbordsflödet
  för stora enheter och synliga waypointinstruktioner kördes också om i browser.
- Riktade integrationsgrupper under arbetet: Island Fleets47 fall inklusive20
  betalda AI-överfarter, stora enheter9, hamnar2 och skogar10 inklusive två
  femtonminuters ekonomimatcher. Samtliga ingår också i den slutförda regressionen.
- `node scripts/test-unit.mjs --list`:96 unit- och147 integrationsfiler,
  disjunkta urval; alla243 filer klassificerade. Nya blandade systemprov ligger
  i integrationsmanifestet, nytt PCM-/atlastest i unit-urvalet.
- `git diff --check`, nya dokumentlänkar och skyddade filers SHA256: **PASS**.

En tidigare fullkörning avbröts eftersom den startats före de sista rättningarna;
den används inte som PASS-belägg. Den senare fullkörningen ovan är slutförd.
Sista ändringarna efter den körningens start var presentation (kortkommandon,
synlig hamninfo och kompakta forskningsnamn) samt de två testfixturerna; berörda
tester, slutlig unit/build
och browser kördes efter dessa ändringar.

En sista visuell kontroll hittade överfulla forskningsnamn: full kostnads-/
effekttext hamnade även i knappens namnfält. Namnfältet är rättat och skyddas av
ett beteendetest. Riktad omkörning **12/3 PASS**,
[logg](research-label-targeted.log); alla fem rasers forskningar kontrollerades
åter vid båda upplösningarna efter rättningen. Därför upprepades slutlig unit
och build; inga gameplayregler ändrades.

Egen diffgranskning omfattade teknik-/produktionskrav, AI, attackmasker, flera
hamnars köer/rutter, Save80/äldre skogar och forskningsvärdar. Inga kända
blockerande kodfel återstår. Mätningarnas och assetgranskningens begränsningar
redovisas nedan; ingen separat agentgranskning har gjorts.

Browserbelägg:

- [Alla fem rasers forskningar, båda upplösningar](research-locations-browser.json).
- [Två hamnar och separata waypoints](harbor-waypoints-browser.json).
- [Tre stora enheter, verkliga produktions-/urvalsklick och Save](large-units-browser.json).
- [Nytt innehåll i fyra verkliga kampanjidentiteter](campaign-content-browser.json).
- [Tidebreaks mål/seger/Save](campaign-browser.json) och [Stormgates mål/seger/Save](stormgate-objectives-browser.json).
- [Belastning med flera stora enheter](large-unit-performance.json).
- [Exakta träbudgetar och ljuddekodning i den körande spelinstansen](wood-audio-browser.json).

800×600 och1280×720 kördes native i nya isolerade browserkontexter. De lokala
bygg-/forskningskomponentproven använder uttryckliga färdiga teknikkrav och
resursfixture/ordinarie cheat; de räknas inte som mänsklig ekonomisk progression.
Källbilder, native grafik och relevanta gränssnitt har granskats visuellt.

## Begränsningar

Frame time-spikar finns kvar enligt mätningen. Nya enheter är tekniskt testade
med konkreta målmasker, kostnader och motspel; ingen lång mänsklig balansmatch
eller ny mänsklig ljudlyssning hävdas. Nya PCM-ljud är icke-tysta, oklippta,
distinkta remixar av redan krediterade inspelningar. Animationernas fyra
mellanfaser är exporterade rörelse-/ljus-/fadevarianter av målade riktnings- och
handlingsbilder. Befintlig Vite-varning om stor bundle kvarstår. Ingen ny CI,
Pages eller publicerad release är beställd eller verifierad.
