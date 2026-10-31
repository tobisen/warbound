# Warbound — omspelbarhet, baslinje 2026-10-31

Nytt lokalt uppdrag. Ingen commit, push, publicering eller delegering.
Arbetskopians tidigare Island Fleets-ändringar och användarens CSS/units/docs
bevaras. Tidigare verifiering är historik tills aktuella flöden provats igen.

## Kort baslinje före ändringar

Källor granskade: factions/navy/roleResearch/islandMaps/maps, skirmishMenu,
aiProfiles/enemyStrategy/enemyNaval/enemyExpansion, seaBattle/campaignSeries/
campaignPhases, Save och befintliga browser-/prestandaskript.

- Fem raser. Befintligt Island Fleets: fyra byggnader (Drydock, Signal Tower,
  Naval Academy, Marine Barracks), fem exklusiva skepp (Survey Launch,
  Flame Galley, Mortar Monitor, Repair Tender, Torpedo Skiff), tre landroller
  (marine/sapper/harpooner) och sex tekniker. De finns i recept, UI, strid,
  produktion och Save78; räknas inte som nytt i detta uppdrag.
- Fyra tidigare tillagda sjökartor: Twinwake Narrows, Trident Anchorage,
  Four Crowns Sea, Farreach Expanse. Avsiktliga landmassor/ändliga resurser;
  2–4 startplatser. Kartvalets optioner anger riktiga dimensioner, men den
  separata kapacitetsbeskrivningen använder fortfarande en gammal storleksregel.
- Sex AI-profiler: Standard, Offensive, Defensive, Economic, Fleet, Siege.
  Island-AI bygger betald hamn, transport, eskort och unik båt, landsätter
  två soldater och återanvänder transporten. Alla eskorter delar samlingspunkt.
- Expansion återanvänder arbetare som måste nå nya byggplatser till fots.
  Ingen arbetarlast/kolonisering över vatten. Marin forskning ligger efter
  lång allmän techkedja. Profilskillnaderna i öspel är begränsade.
- Kampanjserier för fem raser delar åtta grunduppdrag och har rasexpeditioner.
  Stormgate Armada och Tidebreak Relief har verkliga flottor, kartor och
  flerstegsmål. Det finns redan eskort, räddning, tidsförsvar, landbaserad
  capture, sjöposition, expand, fleet och enemy-fleet; inga av dessa kan
  presenteras som en ny måltyp genom omdöpning.
- Skirmish avslutas genom förstörda fiendebaser/lagresultat. Individuell
  motståndarras, svårighet, doktrin, spelartal och lag stöds redan.
- Save78 med äldre migrationer, separat kompakt multiplayer-Save och strikt
  validering. Nya kolonist-/måltillstånd måste följa samma ägar-/ekonomiregler.
- Tidigare belägg: 2248 tester/237 filer, unit563/95, strict build och browser.
  Det är föregående uppdrags resultat. Nya land-/sjöbelastningsprov behövs;
  tidigare storarméstopp är inte bevisat lösta.

## Genomförd vidareutveckling

Användaren har efter leveransen bekräftat omfattningen: ”Vidareutveckla
Island Fleets och fyll luckorna”. Det bekräftar arbetsantagandet som användes
under implementationen. Paketets fyra kartor, fem skepp,
tre landroller, fyra byggnader och sex tekniker räknas inte en gång till
som nya i denna andra beställning. Inga kosmetiska kopior har lagts till.

- AI väljer offentligt kartlagda öar, lastar en verklig arbetare och soldat i
  sin betalda transport, eskorterar överfarten och upptäcker resurser genom
  vanlig sikt. Ordinarie bygglogik betalar utposten och arbetaren samlar där.
  Normala transporter återgår därefter till invasionsuppdraget. En första
  fjärrkoloni följs av anfall före ytterligare kolonisering.
- Economic vågar kolonisering med en eskort; övriga kräver två. Fleet och
  snabba raser prioriterar Light Hulls; Defensive väljer Reinforced Bulkheads
  och Repair Cranes; Siege prioriterar Coastal Gunnery. Marin forskning
  kommer före den långa generella tekniklistan. Allt betalas ur AI-ekonomin.
- Obemannade Four Crowns-startöar kan koloniseras. På Twinwake eller fullt
  bemannade kartor måste ett anfallsfäste etableras först. AI känner endast
  till offentliga startplatser och sina upptäckta resurser, inte dold ekonomi.
- Rättningar: guldarbetare söker nåbara gruvor på ökartor; kolonister skyddas
  från omfördelning till hembyggen/spaning; ötrupper produceras vid sin
  produktionsbyggnad så att en fjärrutpost inte strandar nästa invasionsstyrka.
  Sänkt transport förlorar de faktiska passagerarna. Arbetarreparation använder
  arbetarens maxhälsa. Sparning validerar kolonist, fas och kartlagd destination.
- Tidebreak Relief återanvänds och förbättras. Spana på evakueringsleden,
  samla flottan, håll norra och södra passagen med tre stridsskepp vardera i
  20 obrutna sekunder, bryt blockaden, lasta två markerade
  hjälparbetare och lossa dem hemma. Fiendebasen får stå kvar. Om en flykting
  eller den egna huvudbasen förloras blir det nederlag.
- Två nya målmekaniker: samtidig obruten sjöblockad av två zoner, samt
  identitetsbunden sjöevakuering med faktisk ombordstigning och lossning.
  Markörer och löpande hålltidsräknare finns i spelet; inget poänggrindssystem.
- Fyra redigerbara matchupplägg i Skirmish: Race for Trident, Narrows Raid,
  Farreach Convoy och Four Crowns Rivalry. De använder ordinarie kartor,
  raser, doktriner och spelarantal. Segermålet är fortfarande basförstörelse.
  Kartornas separata kapacitetstext visar nu de faktiska dimensionerna.
- Save79 migrerar78 inklusive kompakt multiplayer. Äldre Tidebreak-sparningar
  behåller sina tidigare sex mål och exakta arbetarpositioner; ingen gammal
  arbetare flyttas och ingen ny flykting hittas på vid laddning.

## Innehåll som redan fanns och verifieras igen

Kartor: Twinwake Narrows, Trident Anchorage, Four Crowns Sea, Farreach Expanse.
Skepp: Survey Launch, Flame Galley, Mortar Monitor, Repair Tender, Torpedo Skiff.
Landroller: Marine, Sapper, Harpooner (rasanpassade namn/recept).
Byggnader: Drydock, Signal Tower, Naval Academy, Marine Barracks.
Forskningar: Light Hulls, Reinforced Bulkheads, Naval Optics, Repair Cranes,
Marine Drill, Coastal Gunnery. Se [recept/roller](ISLAND_FLEETS.md).

## Verifiering

Riktade systemtester:119 tester/8 filer PASS (172,63 s). Efter ändringen av
kampanjens första två mål:9 tester/2 filer PASS (15,03 s). Slutlig fullregression
på fryst kod: 2264 tester/239 filer PASS (1021.40 s). Hela uniturvalet ingår; ingen separat
upprepning av unitkommandot. `npm run build` med strict TypeScript
PASS; Vite ger sin befintliga varning om huvudbundlens storlek (>500 kB).
Testmanifest och `git diff --check` PASS. Skyddade filer:12 SHA256-matchningar,
ingen ändring av användarens style.css/units.mjs/docs/.

Faktisk Chrome156, native800×600 och1280×720: byggnader, marina enheter,
knappstyrd forskning, exklusiva skrovval, två forskningsrader, Save och fyra
valbara skirmish-upplägg PASS. Samtliga fyra kartor startade från menyn och
kontrollerades för startresurser, sammanhängande sjöväg och Save.
AI:s betalda arbetarlast/landning/utpost visades i båda vyerna. Tidebreak startade
via kampanjmenyn och nådde korrekt resultatskärm i båda vyerna, med samtliga
sex målövergångar och strict Save. Inga browserfel i dessa kontroller.
Browserartefakter finns i [artifacts/replayability](artifacts/replayability/).
Ordinarie matchstarter används för AI-proven. UI-produktionsprov använder
uttryckligt finansierade komponentfixtures, inte låtsad startbalans.
Kampanjproven använder lagliga automatiska order och snabb simulerad speltid;
de är inte mänskliga tids-/balansprov. Endast observationskopior avslöjar AI-sikt
för skärmbilder; den simulerade AI:n använder normal fog och ekonomi.

## Gränser

Detta är ingen ny release och inget är pushat/publicerat. Ingen bred
prestandaomskrivning eller automatisk roadmapfortsättning. Grafik/ljud från
Island Fleets återanvänds; ingen ny ljudinspelning eller mänsklig lyssning
hävdas. Flottans befintliga överlappning och genererade riktningsanimationer
är oförändrade; bilderna visar deras verkliga utförande. Långmatchbalans och
mänskliga strategiprov återstår. Fullt ockuperade startöar kräver ett militärt
fotfäste före kolonisering; neutral kolonisering är tekniskt verifierad på
Trident, Farreach och tvåspelar-Four Crowns.

Kompletterande browser-Saveprov PASS: kompakt fyrspelar-Save78 migrerades och
sparades om. Blockad sparades vid36,5 s med starttid31,5 s; laddning behöll
exakt timer/fas och genomspelningen fortsatte till seger86,25 s.
Se [sparprovet](artifacts/replayability/save-migration-browser.json).

## Prestanda — samma fixtures före och efter

Chrome156, native1280, inga parallella tester under mätningarna. Landprovet
injekterar128 angripare och32 tåliga försvarare för20 spel-sekunders verklig
Phaser-uppdatering/rendering; det är ett belastningsprov, inte ett betalt bygge.
Sjöprovet använder16 egna och15 ursprungliga AI-skepp, vanlig strid och lagliga
automatiska order. Efter6 sekunders setup återstår14 AI-skepp;10 verkliga
sekunder mäts, därefter fortsätter matchen till seger.

| Prov | Före CPU p95 | Efter CPU p95 | Kommentar |
| --- | ---: | ---: | --- |
| Land, första körning |19,5 ms|28,5 ms|Efterprovet var långsammare; behålls i underlaget.|
| Land, direkt omkontroll |18,2 ms|18,7 ms|Oförändrad gammal källkopia följd av slutkod. Frame p95 båda16,8 ms.|
| Sjöstrid |5,3 ms|5,1 ms|Frame p95 båda16,7 ms; båda slutade med verklig seger.|

Första landefterprovet hade3 CPU-toppar över50 ms. Ommätningens slutkod hade
bara uppställningstoppen131,7 ms (gammal kod141,9 ms); därefter inga CPU-toppar
över50 ms i rutt-/kontakt-/stridsfaserna. Högsta frame-intervall216,5 ms mot
233,2 ms i kontrollbaslinjen. Resultatet stöder ingen reproducerbar större
regression i detta prov; det förklarar inte säkert den första avvikelsen.
Ingen generell prestandafix hävdas och högre enhetsantal/långmatcher omfattas
inte. Se [alla landmätningar](artifacts/replayability/land-comparison.json)
och [sjöprovet](artifacts/replayability/after-naval-performance.json).
