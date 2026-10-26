# Innehåll, balans och prestanda — lokal batch2026-10-25

## Publicerad — 2026-10-26

Batch311c835 och budgetkorrigering791d17f är pushade. Pages visar v0.8.0/Build791d17f.
[Ny faktisk CI](https://github.com/tobisen/warbound/actions/runs/40283143763):
full2093/229 PASS1183,13s, strict build, presentation och deploy PASS. Publik
Chrome800/1280/canonical, nytt innehåll, Idle Worker, Save/load, atlas520,
presentation13/HOLLOWBANE3/PDF200 PASS utan runtime-/assetfel.
[Publiceringsrapport](pages-public/README.md). CSS/units.mjs/docs/ bevarade.
Nedan följer den ursprungliga lokala implementationens belägg och begränsningar;
dess tidigare förbud mot commit/push/publicering ersattes av användarens nya uppdrag.

## Lokal implementation — 2026-10-25


Ingen commit, push, publicering eller produktversionsbump. Savekonfiguration76
migrerar75, inklusive fulla och delade multiplayerdokument. Tidigare publicerade
v0.8.0/Build1e8abaf är historiskt belägg, inte denna arbetskatalog.

## Inventering och val

Befintligt:11 land-/luftroller per fraktion, tre sjöroller (transport, warship,
submarine), åtta generella byggroller samt hamn/baser/fortifikationer, fyra
rollforskningar, militär attack/defense och Worker Tools. Humans kallar redan
sin warship **Cutter**; den har behållits. Befintliga raskampanjer hade15 uppdrag,
med mindre transport-/landstigningsoperationer. Inga befintliga roller eller
uppdrag ersätts.

- **Naval Foundry:** Humans/Dwarves,95 trä +55 guld,18s,180HP,64×64 landbyggnad;
 Forge och bas II krävs. Använder befintliga producer-ID:n, byggare, reparation,
 rivning, fog, byggstadier och förlustregler. Ingen passiv gratisinkomst.
- **Naval Logistics:**100 trä +75 guld,30s; färdig Naval Foundry krävs. Ett val
 mellan omedelbara vanliga krigsfartyg och investering i en specialiserad flotta.
- **Human Tide Runner** (intern ny roll `cutter`):55 trä +25 guld,12s,2 supply,
 65HP,165px/s,160px range,10 skada/0,85s; endast sea/air,1,25× mot air.
 Snabb eskort som avstår mark-/byggnadsanfall och tålighet.
- **Dwarf Bombard:**110 trä +75 guld,28s,4 supply,160HP,60px/s,288px range,
 38 skada/3,5s; endast sea/building,1,8× mot byggnader. Kräver eskort mot luft
 och flankering. Övriga fraktioner får inte samma nya fartyg.

Bygg-/träningsmenyer, forskningskö, Tech Tree/Commands, kostnader/supply,
projektiler/målmasker, beskrivningar, AI och strikta sparningar använder samma
recept. AI betalar och delar verklig supply; ny flottpolicy används i Skirmish
eller den nya operationen. Äldre kampanjers klockor och flottpolicy bevaras.

## Skirmish

Alla Skirmish-kartor följer samma spärr efter strategi/personlighet; den äldre
navala transportlanseringen kan inte kringgå första anfallsfönstret. Scouting,
resurser, supply, trupper, teknik och expansion fortsätter före angreppet.
Synligt lokalt hot kan fortfarande försvaras mot. Intakta små dispatches
retirerar inte bara för att teknik under förberedelsetiden höjde gruppmålet;
verkliga förluster/blocked routes kan fortfarande utlösa regroup. Ett game-second är en sekund
vid1×;0,75× förlänger motsvarande verkliga väntetid utan ändrad spelklocka.

| Nivå | Standard första planerade anfall | Personlighetsintervall | Standard paus mellan utskick |
| --- | --- | --- | --- |
| Beginner |16:00|15:00–18:00|5:00|
| Easy |13:30|12:00–15:00|4:00|
| Normal |10:00|9:00–11:00|3:00|
| Hard |8:00|7:00–9:00|2:30|

Offensive väljer nedre gränsen; Defensive/Economic övre. Återhämtning måste
fortfarande uppfylla verklig gruppstorlek/styrka, ekonomi och supply. Detta är
planerad dispatch, inte en garanti för tid till faktisk kontakt på varje karta.

## Stormgate Armada

Sista Human-expeditionen efter de tidigare15. Egen **Stormgate Straits**,96×64
tiles/3072×2048px: stor sammanhängande vattenyta, signalö som delar tre farleder,
östlig kust och en valfri sydlig resursö. Befintligt versionsmärkt kartformat,
mark-/vattennavigation, fog och terrainart används.

Spelaren börjar med12 vanliga Cutters, två Tide Runners, två transporter, fyra
Guards, tre arbetare, en befintlig obeväpnad Sky Owl för spaning, färdig hamn/kasern/forge, bas II och åtta farms. Detta är
en deklarerad initial expeditionsstyrka. Förstärkningar/forskning betalas normalt.
Fienden börjar med10/12/15/18 stridsfartyg på Beginner/Easy/Normal/Hard, inklusive
två Bombards, kustarmborstskyttar, hamn och försörjning. Fördröjda skvadroner och
samma verkliga sikt/ekonomi används; inga återkommande gratisspawnar.

Fyra bestående faser: tre egna beväpnade skepp säkrar passagen utan fiendeskepp
inom224px → alla fientliga stridsskepp sänkta → levande landcombatant på östlig
strand → förstörd fiendebas. Fartyg/passagerare/arbetare kan inte ersätta
landstigningen. Huvudbasens död ger defeat. Faser och flottor överlever Save/load;
replay återställer operationen och tidigare progression bevaras.

## Nya belägg

- Native Chrome800×600 och1280×720: verklig meny/briefing/start, synlig idleknapp,
 antal3,1→2→3→1, kamerafokus/ring, build/repair/gather/deliver/move bortfiltrerade.
 Knappens fungerande implementation är oförändrad.
- Native bygg-/research-/träningsklick: betald95/55-workshop,100/75-forskning,
 55/25-Tide Runner. Startbank500/500 är en uttrycklig finansierad UI-fixture;
 slutbank250/345 och17 skepp verifieras. Ingen ekonomibalans sluts av den fixturen.
- Riktig initial Save/load och fasvis serialize/load under taktisk genomspelning.
 Normal: fas1 vid18,25s,2 vid31,25s,3 vid58,75s, victory vid76s.13 fartyg överlevde
 flottstriden; den verkliga resurs-/förstärkningsloopen fortsatte sedan. Provet
 använder fokuserade lagliga order i snabb simulation, inte mänsklig speltid.
 Inga resurser/HP/skador/fog/dödsfall injiceras i taktikspelet. Defeat provas
 separat med explicit död huvudbas, inte som påstående om AI:s helmatchbalans.
- Ny art kommer från inbyggt imagegen: [källor/prompter/export](../../assets/sources/naval-content/README.md).
 Atlas520 ramar; inga synliga platshållare. Mellanframes härleds från riktade
 målade tillstånd. Nya mellanposer för varje renderingsframe hävdas inte.
- Browserdata/bilder ligger här; noll pageerrors/assetvarningar i passerat prov.
 Tidiga körningar hittade en delad DOM-wrapper och fryst Tech Tree-omritning;
 wrappern är rättad, testet begär omritning efter paus och väljer rätt Fleet-flik.
 Den gamla Vite-processens navigation hängde; ny process och scenberedskap
 ersätter `networkidle` i verifieringen. Timeoutförsöken räknas inte som PASS.

## Prestanda

Slutlig isolerad jämförelse i samma Chrome155.0.8059.85, produktionsbyggd
pure gameplay mot b5d2f333003dec878aa615cb2be316c8310c163b:s fem
optimeringsfiler (dåvarande HEAD).360 ticks à1/60s,60 warmup
uteslutna,300 samples; inga parallella tester. Hela MatchState har exakt
samma SHA256 i alla tre före/efter-par, inklusive fog/order/ekonomi/HP.

| Samma arbetslast | Före median / p95 | Efter median / p95 |
| --- | ---: | ---: |
| Två spelare, tidigt |1,5 /1,7ms|1,3 /1,5ms|
| Fem spelare, tidigt |12,4 /14,7ms|8,8 /10,4ms|
| Fem spelare,115→117 kroppar |39,0 /51,4ms|31,2 /35,4ms|

Medianen minskar13% för tidig tvåspelarmatch,29% för tidig femspelarmatch och
20% i den större fixturen; där minskar p95 cirka31%. Det är simulationens CPU,
inte renderad FPS. Arméfixturen kör först30s ekonomi och injicerar därefter
16 egna +80 AI-soldater över normal supply; den mäter belastning, inte balans.

Separat native1280×720/1280×488-canvas,128 kroppar +32 väggar, samma
Chrome: update median15,9→13,5ms, p9518,2→16,2ms; frame-p9533,3→16,8ms.
10s-proverna har567 respektive591 uppdateringssampel. Noll runtimefel.
Bilder och JSON: `../performance-many/content-before.*`/`content-after.*`.
Detta är ett begränsat lokalt stressprov; ingen garanti om60fps under alla
strider. Större femspelarmatch är fortfarande CPU-tung och särskilt långa
simuleringar/andra hårdvaror kan fortsatt upplevas som långsamma.

Förbättringarna tar bort återkommande hindertext/kartrekonstruktion och onödiga
sikt-/skogskopior samt behåller fler exakta LOS-/kollisionsfrågor i bounded
cachar. Simulationsfrekvens, grafik, upplösning, animationer, fogregler och tak
är oförändrade. Tidiga explorativa prov ligger kvar i `cpu-before.json` och
`cpu-after-initial.json`; slutsiffrorna kommer från `cpu-final.json` i en enda
samlad före/efter-körning. CPU-profiler ligger bredvid för reproduktion.

Även native1280-genomspelning med verkliga scenframes och lagliga
fokusorder/transport/förstärkningar varje ungefärlig spelsekund når victory:
69,26s, fas4, huvudbas240HP,15 egna skepp kvar,63 orderomgångar. De första6s
förbereds med lagliga0,25s-ticks; resterande cirka63s körs i den riktiga scenen.
Första10 reala stridssekunderna:572 uppdateringssamples, median4,3ms,
p955,4ms, frame-p9516,7ms och17 samtidiga projektiler; noll runtimefel.
Vid mätstart har ett av de15 fiendeskeppen redan sänkts i den lagliga inledningen.
Resultatet är ett automatiserat taktiskt belägg, inte ett mänskligt balans-/tidsprov.
Se `naval-performance.json`, `naval-battle-1280.png`, `native-victory-1280.png`.
Proben verifierar att order faktiskt når Phasers cachade scen-callback; en tidigare
mätning utan de fortlöpande fokusorderna räknas inte som slutligt taktiskt belägg.

## Checks

Slutlig unit546 tester/94 filer PASS17,48s. `npm run build` inklusive strict
TypeScript PASS; befintlig Vite-varning om stor JS-chunk kvarstår. Manifestet
klassificerar94 unit- och135 integrationfiler, totalt229, utan överlapp.

Helkörningen `npm test` avslutades efter1101,65s:2074 PASS och19 fel/2093 tester
över229 filer. Den räknas inte som en ren grön helkörning. Felen gällde gamla
anfallsfönster, gamla gemensamma katalog-/forskningsförväntningar, en kusttestbot
som valde mål närstridsenheter inte kan angripa samt en missionfixture som
ändrades medan den körningen redan hade laddat äldre moduler. Slutkoden är
verifierad igen i färska riktade processer; inga funktionella fel lämnas öppna.

Samlad omkörning av åtta berörda filer:55 PASS/57. De sista två var gamla
105-ID-förväntan (nu110 med byggnadsrollen) och Plains96:s120s-wall-clockbudget.
Katalog3/1 PASS efter korrigeringen; Plains961/1 PASS215,87s med300s-budget.
Betald seger, verklig AI-ekonomi/kontakt och780s-spelhorizont behålls; Plains128
passerade redan i samlade omkörningen. Passiv storkartskontakt kör1s-ticks,
medan navala kontaktprov behåller0,2/0,25s och native browser kör riktiga frames.
Alla229 filer är därmed täckta av fullkörningen + slutliga riktade korrigeringar;
ingen andra helt grön helkörning hävdas. Detaljer: [verification.json](verification.json)
och kommandologgarna bredvid. Tidigare avbrutna försök räknas inte som PASS.

Strikta sparningar/migration, typ-/assetgates, betald produktion, skada, forsknings-
förlust, faktisk sjökampanjseger, negativa mål och alla svårighetsstarter ingår.
Separat målprov avvisar transporter/fiender vid passagen och arbetare/flyg vid
landstigning. Kampanj-/initiativ-/betalda matchsimuleringar ingick i den fulla
körningen; inga ytterligare breda kampanjsimuleringar upprepas för grafik/UI.
Mänskligt helmatchspel, taktisk finbalans och subjektiv upplevelse på annan hårdvara
återstår. Ingen ny CI-/Pages-/ljudverifiering ingår.

## Reproduktion

- `npm test`: hela229-filssviten, inklusive kampanj-/ekonomisimuleringar.
- `npm run test:unit`: isolerade komponent-/asset-filer. `node scripts/test-unit.mjs --list`
  verifierar att alla229 testfiler tillhör exakt ett av de disjunkta urvalen.
- `npm run build`: inkluderar strict TypeScript före Vite-produktionsbygget.
- `W2T_UI_URL=http://127.0.0.1:5190 node scripts/check-content-balance.mjs`:
  native800/1280, meny/briefing, idle, betalda innehållsklick, Save/mål/resultat.
- `W2T_UI_URL=http://127.0.0.1:5190 node scripts/check-sea-battle-performance.mjs`:
  verkliga scenframes under aktivt31-fartygsslag med lagliga fokusorder.
- `scripts/profile-content-performance.mjs`: `W2T_PROFILE_BASELINE=HEAD`,
  `W2T_PROFILE_OUTPUT=artifacts/content-balance/cpu-final.json`,
  `W2T_PLAYWRIGHT_MODULE` pekar på presentationens installerade Playwright-modul,
  `W2T_BROWSER_EXECUTABLE` på lokal Chrome. Bygger identiska produktionsfixtures
  och jämför endast optimeringsfilerna mot HEAD utan att ändra arbetskatalogen.
 360 ticks à1/60,60 warmup uteslutna,300 mätta samples; varje helt MatchState
  SHA256 måste vara identiskt före/efter. Ingen renderad FPS härleds ur CPU-provet.
- `scripts/check-many-performance.mjs`: samma native1280 stressfixture som före,
  explicit128 kroppar och32 väggar över normal supply; mäter belastning, inte balans.
- `node scripts/export-naval-content.mjs`: endast de nya källorna/atlasen; exporterad
 PNG, JSON och manifest är bitvis reproducerbara i `asset-determinism.json`.

Kör prestandascripten utan parallella tester. Browserns ljud är inte en faktisk
lyssningsgranskning. Inga nya röst-/ljudassets eller motsvarande godkännande hävdas.
