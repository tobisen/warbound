# Spela Warbound0.9

[Spela i browsern](https://tobisen.github.io/warbound/) eller starta Vite enligt
[README](../../README.md). Engelska knappnamn används i spelet.

## Börja och ge order

Campaign går via ras, svårighet och uppdragsbriefing. Upplåsningar är separata
per ras/svårighet; Humans har17 operationer och övriga raser15. Skirmish låter
dig välja karta, ras, lag, AI och sjöupplägg. Förberedelse, spaning och ekonomi
fortsätter innan AI:s planerade huvudanfall.

Vänsterklick/drag väljer enheter, högerklick flyttar, samlar eller angriper.
Shift köar order. Bygg med vald arbetare och träna från vald produktionsbyggnad.
Farms ger supply när de är färdiga. Fel vid placering eller order visas nära
kontrollerna. Musens mittenknapp panorerar; hjulet zoomar. Minimap kan flytta vyn.
Commands har aktuella tangenter. Menu [P] pausar och erbjuder Save/Load.
Lokal lagring hör till browsern; rensa inte webbplatsdata om du vill behålla den.

## Teknik och endgame

Forskning finns enbart vid sin hembyggnad. Korten visar kostnad, hinder,
aktiv tid/kö eller färdig status, i högst två rader. Tech Tree är en läsvy.
Kampanjens byggmeny döljer uppdragslåsta byggnader. Skirmish visar hela rasens
byggutbud, med faktiska teknik-/resurskrav på ännu otillgängliga val.

Forge låser upp militär teknik I. Båda nivåerna I behövs för Academy, som ger
teknik II och avancerade markroller. Uppgradera huvudbasen tillIII och bygg
Aviary för stridsflyg. Tidiga trupper behåller rollen som eskorter och motspel.

| Befintligt sent innehåll | Strategiskt syfte / begränsning |
| --- | --- |
| Drydock | Betald reparation av stilla skepp; ingen gratis hållbarhet |
| Signal Tower | Kustsikt och ubåtsdetektion inom aktuell syn |
| Naval Academy | Unikt fraktionsskepp, skrovval och kustforskning |
| Marine Barracks | Rasens landstigningstrupp: Marine, Sapper eller Harpooner |
| Light / Armored Hulls | Ömsesidigt val mellan fart och skydd |
| Naval Optics / Repair Crane | Bättre marin sikt respektive snabbare betald reparation |
| Marine Drill / Coastal Gunnery | Specialiserad amfibisk respektive kustoffensiv |
| Storm Ark (Human) | Tung kust-/sjöeld; flyg och ubåtar kan utnyttja dess svagheter |
| Brass Leviathan (Goblin) | Stor bombzeppelinare; behöver skydd mot anti-air |
| Ironback Behemoth (Orc) | Tung markbelägring; sårbar mot fokuserad distanseld |
| Healer, Giant och rasens flottroller | Stöd, belägring, spaning, eskort och räder har egna motspel |

Storm Ark kräver huvudbasIII, attack/försvarII, Naval Academy, Drydock och
färdig hamn. Rasval och kampanjbegränsningar gäller fortfarande. Se
[Island Fleets](../../ISLAND_FLEETS.md) och [Tides of War](../../TIDES_OF_WAR.md)
för kostnader/roller; källkonfigurationen är auktoritativ för aktuella stats.
Innehållet fanns före0.9 och räknas här efter ny spelverifiering, inte som
nyproducerade assets. Ingen andra kvot med likadana enheter har lagts ovanpå.

## Hotreaktioner

Synliga närstridshot upptäcks inom64px, distans-/sjöhot inom192px. Trupper försvarar sig med ett giltigt
vapen eller ordinarie lokal målanskaffning. Arbetare, obeväpnade spanare och
trupper som inte kan bekämpa hotet söker en säkrare, kroppsgiltig väg. Retur-
tröskeln har96px hysteresis (högst288px), omplanering högst en gång/s; vägen undviker närpassage genom
kända hot. Finns ingen säker väg visas ett fel. Beteendet lovar inte en utväg
ur full inringning.

Uttryckliga Move, Attack och Hold ersätts inte av en ny hotorder. Befintligt
självförsvar efter en faktisk träff kan pausa en Move för att skjuta från
aktuell plats; ursprunglig förflyttningsorder finns kvar och återupptas utan jakt. Soldaters Stop stänger även
av automatisk reaktion. Ekonomiskt arbete pausas vid ett riktat anfall eller aktuell träff, inte av en
passiv vakt i närheten. Patrol kan pausas av ett lokalt hot; mål, last och
orderkö behålls. När hotet försvinner återupptas ordern med omplanerad väg. Aktuell träff kringgår den vanliga halva sekundens
kontrollintervall; träffminnet är kortvarigt och läcker inte dold fiendeposition.
Arbetare efter Stop kan fortfarande försöka undkomma ett närliggande hot.
Sparning behåller den riktiga ordern/positionen, men räknar om transient
hotreaktion och väg efter Load. Det är ingen ny Saveversion.

## Transporter

Markera marktrupper och högerklicka transporten. Båt och trupper går till en
nåbar, synlig kustkontakt. Full last eller saknad boardingplats ger fel;
Stop/nya order avbryter ett väntande transportjobb. Lastens antal visas i
transportens enhetsinformation, liksom pågående överföring.

Välj transporten och Unload. Automatisk kustsökning används först; manuell
landningspunkt används när den behövs. En blockerad punkt söker alternativ
inom96px, men varje passagerare måste fortfarande ligga inom båtens normala
kontaktavstånd (64px, större med Orc Assault Ramps), med fri kontakt och syn.
Endast passagerare med en egen fri plats går av. Resten ligger kvar ombord
och kan sparas/laddas. Flytta båten eller försök igen för återstående last.

Varje hamn har egen skeppswaypoint: högerklick sätter/flyttar den, Shift +
högerklick rensar. Dessa kontroller är bevarade i0.9.
