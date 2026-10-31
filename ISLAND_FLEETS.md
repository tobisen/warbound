# Island Fleets — lokalt uppdrag 2026-10-30

Nytt spelinnehåll implementerat och verifierat i arbetskopian. Fullregression
2248/237, unit563/95, strict build och browserkontroller PASS (2026-10-30–31).
Ingen commit, push, publicering eller versionsrelease är beställd.
Användarens style.css, units.mjs, docs och övriga tidigare lokala filer bevaras.

## Inventering från kod

Utgångsläge publicerad bd6d0f3 med efterföljande verifieringsdokumentation.
Kontrollerat factions.ts, navy.ts, roleResearch.ts, maps.ts, skirmishMaps.ts,
enemyNaval.ts, placement/production/research/save, actionPanel och BootScene.

- Fem raser; elva land-/flygroller. Fem fartygsroller totalt: warship,
  transport, submarine, Human cutter och Dwarf bombard. De tre första delas.
- Nio vanliga byggnadsroller samt harbor/tower/wall/gate. Naval Foundry finns
  redan och räknas inte som ny byggnad här.
- Elva rollforskningar utöver attack/defense/workerTools. De föregående
  fraktionsdoktrinerna räknas inte som nytt innehåll här.
- Fjorton kart-ID:n; straits/tidebreak är kampanjkartor. Befintliga islands/coast
  har landmassor och hårdkodade koordinater för AI:s tvåsoldaterslandstigning.
- Menyer och produktion använder flera explicita rollistor. Katalogposter
  måste också nå kontroller, fysik, projektiler, Save och grafik.

Det saknades alltså de efterfrågade extra byggnaderna, åtta nya enhetsroller,
sex ytterligare tekniker och fyra särskilt formade ökartor. Befintlig transport,
ubåt, Foundry och ombalanserade enheter räknas inte in i den nya mängden.

## Fyra nya byggnader

Alla fem raser bygger dem genom vanliga kostnader, byggtid och arbetare.
Kostnader anges som trä/guld. Byggnader får egna bilder, namn, HP, selection,
kravtexter och relevanta forsknings-/produktionsknappar.

| Byggnad | Kostnad | Krav | Funktion |
| --- | --- | --- | --- |
| Drydock | 80/30 | Forge | Betald reparation av stilla skepp inom 224 px: 6 HP/s, 0,25 trä + 0,1 guld/HP. |
| Signal Tower | 55/25 | Base | 512 px sikt, 256 px ubåtsdetektion i aktuell sikt; låser upp optik/harpunister. |
| Naval Academy | 100/60 | Forge | Låser upp rasens nya skepp samt skrov- och kustforskning. |
| Marine Barracks | 65/25 | Barracks | Separat kö för rasens nya landstigningstrupp. |

## Åtta nya enhetsroller

Alla nya skepp kräver färdig Naval Academy och produceras i Harbor. Gamla
skepp och befintlig transportkedja finns kvar. Alla raser kan därför transportera
trupper och använda vanliga stridsskepp även före sin exklusiva komplettering.

| Ny båt | Ras | Kostnad | Roll och motspel |
| --- | --- | --- | --- |
| Survey Launch | Elves | 30/20 | Mycket snabb, obeväpnad; 512 px sikt/160 px detektion. Svag mot eskorteld. |
| Flame Galley | Orcs | 45/20 | Snabb, kort räckvidd; 1,5× skada mot byggnader. Motas med räckvidd/flyg. |
| Mortar Monitor | Dwarves | 135/90 | 352 px räckvidd, 2,25× byggnadsskada, fem supply; långsam och behöver eskort. |
| Repair Tender | Humans | 70/45 | Obeväpnat stödskepp; stilla allierade skepp får 4 HP/s inom 128 px mot betalning. Ingen självreparation. |
| Torpedo Skiff | Goblins | 40/35 | Snabb, synlig och skör; 36 skada/2,2 s inom 112 px mot enbart skepp. |

Tre nya landroller produceras i Marine Barracks; inga nya flygroller räknas in.

| Ny roll | Raser | Kostnad | Uppgift |
| --- | --- | --- | --- |
| Coastal Marine / Boarding Marauder | Humans / Orcs | 25/12 | Billig närstridstrupp; Human har 95 HP, Orc 80 HP men högre fart/skada. |
| Powder Sapper / Fuse Runner | Dwarves / Goblins | 40/30 | Skör närstridsspecialist med 6× byggnadsskada; kräver Forge. Goblin är snabbare. |
| Harpooner | Elves | 30/20 | 208 px räckvidd; 2× mot skepp, 1,5× mot luft, 0,5× mot mark, inga byggnadsmål. Kräver Signal Tower. |

Rollbeskrivningar, attacker, priser, supply, krav och Shift-kortkommandon finns
i ordinarie UI/Commands/Tech Tree. Förflyttning och strid återanvänder befintliga
kommandon. Transportkapacitet och flyg-/projektilregler ändras inte.

## Sex nya forskningar

Varje forskning tar 24 sekunder. Huvudbyggnadens forskning förblir paginerad
med högst åtta knappar/två rader; specialbyggnader visar sina relevanta val.

| Forskning | Kostnad | Byggnad | Effekt |
| --- | --- | --- | --- |
| Light Hulls | 60/40 | Naval Academy | Alla skepp +20 % fart; utesluter Reinforced Bulkheads. |
| Reinforced Bulkheads | 80/60 | Naval Academy | Skepp tar 20 % mindre skada; utesluter Light Hulls, även under kö/forskning. |
| Naval Optics | 45/40 | Signal Tower | +96 px skeppssikt; Survey Launch detekterar inom 224 px. |
| Repair Cranes | 60/35 | Drydock | Dubbla reparationshastigheten; oförändrad kostnad per HP. |
| Amphibious Drill | 55/35 | Marine Barracks | De tre nya landrollerna gör 25 % mer skada. |
| Coastal Gunnery | 75/60 | Naval Academy | Beväpnade skepp gör 25 % mer byggnadsskada; inga nya måldomäner. |

Kustforskningen samverkar med befintlig Dwarf-ammunition. Skrovskydd gäller
även fyrspelarlägets gemensamma skadeberäkning. Betald reparation gäller båda
sidor; flyttande skepp och anfallande skepp repareras inte.

## Fyra nya kartor

Avsiktligt formade, stora landmassor med varierade kustlober, rastrerade mot
spelets 32 px-grid. Inga slumpmässiga småöar eller landförbindelser mellan
startöarna. Landresurser är ändliga. Varje startö har 1600 trä/3600 guld på
kartan; neutrala expansionsöar har 900 trä/4500 guld vardera.

| Karta | Storlek | Spelare / öar | Taktiskt problem |
| --- | --- | --- | --- |
| Twinwake Narrows | 64×48 | 2 / 2 | Kort central passage kontra längre flankerande sjöväg i söder. |
| Trident Anchorage | 96×72 | 2 / 3 | En rik sydlig ö kräver arbetare och sjötransport. |
| Four Crowns Sea | 96×96 | 2–4 / 4 | Separata startöar; all expansion passerar öppet centralt hav. |
| Farreach Expanse | 128×96 | 2 / 4 | Avlägsna södra kolonier, långa försörjningsvägar och alternativa stränder. |

Kartvalet visar namn, faktiska dimensioner och sjöfokus. Fyra spelarplatser
finns endast på Four Crowns Sea. Äldre kartlayouter är oförändrade.

## AI, navigation och sparningar

`islandNavalPlan` härleder byggbar hamn, lastningsplats, sjöväg och flera
landstigningsstränder från terrängen och aktuell startposition. AI betalar
hamn, transport, eskort och rasens nya skepp med sina egna insamlade resurser.
Den reserverar tillräckligt med resurser och supply även för den tunga monitorn.
Ett landningsparti består fortsatt av två soldater; transporten återvänder för
fler vågor. Landade trupper fortsätter anfalla och återkallas inte till hemön.

Eskorter följer överfarten, spaningsskepp går framåt och tender håller sig nära
transporten. Blockerad strand ger ett annat strandval; sänkt transport kan
ersättas genom betald produktion. Förlorad soldat under lastning släpper
överlevande tillbaka till en ny grupp. Spelaren får ett konkret fel vid för
långt avstånd, vatten, dold/blockerad strand eller platsbrist.

Save-format 78 migrerar tidigare 77 och behåller äldre migrationskedjor.
Nya roller, köer, forskningsval, kartor, projektiler och AI-tillstånd valideras.
Fyrspelarlägets privata flottor följer med sina egna spelartillstånd; gamla
sparningar får inga nya tekniker eller enheter gratis. Produktversion 0.8.0
är oförändrad och det nya innehållet är inte publicerat.

## Grafik och verifieringsgränser

Fjorton nya AI-genererade källbilder exporteras till en egen atlas med 2720
bildrutor: fem skepp, tre landroller med två rasvarianter samt fyra byggnader.
Enheter har åtta riktningar och idle/move/attack/death; byggnader har färdig,
skadad och två byggstadier. Exportören härleder fyra rörelsefaser per pose
med samma pixelrendering som befintliga assets. Varje mellanbild är alltså
inte separat målad. Inga tillfälliga debugbilder eller saknade ramar används.
Källor, prompter och exportbeskrivning finns i [assetmappen](assets/sources/island-fleets/README.md).

[Verifieringsrapporten](artifacts/island-fleets/README.md) skiljer verkliga
UI-klick från finansierade komponent-/grafikfixturer och AI-prov med vanliga
startresurser. Browser visar alla nya skepp/rastrupper, fyra byggnader och
kartor; verkliga produktions-/forskningsklick kontrolleras vid 800×600/1280×720.

AI-eskorter kan överlappa visuellt vid gemensamma samlingspunkter; ingen ny
flottseparation införs. Browsersekvensen visar genomförd överfart trots detta.

Ingen mänsklig långtidsbalans, mänsklig matchgenomspelning, ny ljudlyssning
eller separat stresstest av stora flottor hävdas. Befintliga ljud återanvänds.
AI har ingen ny autonom kolonisering av neutrala resursöar; den verifierade
sjöoffensiven riktas mot motståndarens ö. Alla kombinationer av lag, svårigheter
eller fullständiga fyrspelar-slutspel är inte särskilt genomspelade. Detta är
lokala speländringar; tidigare CI-/Pages-belägg gäller den äldre builden.
