# Warbound 2 — förslag efter0.9-auditen

Detta är ett designförslag, inte ett implementationsmandat eller nya tasks.
Det utgår från [auditen](../audits/warbound-0.9.0.md). Upplevelsemål nedan är
hypoteser som behöver mänskliga speltester.

## Kärna och spelare

Ett läsbart singleplayer-RTS där en begränsad armé och en riktig försörjningskedja
ska ta sig genom skogar, passager och skärgårdar. Striden om var man vågar
bygga nästa bas och hur en landstigning skyddas är spelets särdrag. Sjökrig
kopplar samman territorier och operationer; det är en strategisk väg genom
samma värld, med behov av eskort, spaning och fungerande logistik.

Målgruppen är spelare som gillar klassiskt basbyggande och kombinerade arméer,
men vill spela ensamma, pausa, spara lokalt och förstå varför en order lyckas
eller misslyckas. Sikta på avslutningsbara20–40-minuters skirmishmatcher och
kortare authored kampanjoperationer. Dessa tider är mål, inte uppmätta löften.

## Fyra designpelare

1. **Begripliga order.** En order visar mål, hinder och tillstånd. Trupper håller
   fast vid spelarens avsikt, skyddar sig lokalt och återgår utan dold orderförlust.
2. **Territorium formar ekonomin.** Ändliga fyndigheter, resvägar, skogar och
   försvarbara passager skapar verkliga expansionsval. Mer karta måste ge nya val.
3. **Land, luft och sjö behöver varandra.** Transporten är sårbar, eskorten har
   motspel och kusteld behöver spaning. En högteknologisk enhet ersätter inte en hel armé.
4. **Få tydliga val, flera fungerande planer.** Varje enhet/byggnad/teknik ska
   tillföra en taktisk funktion och en sårbarhet. Fraktionsidentitet syns i valen
   som görs, före antalet knappar.

## Bevara och förändra

Bevara local-first, paus/Save/Load, fysisk insamling och konstruktion,
datadrivna stats, fogbaserad AI-kunskap, författade kartor/mål, kontextuella
forskningsbyggnader och originalgrafikens sammanhängande läsbara formspråk.
Behåll den tekniska disciplinen med separata kostnader, verkliga köer,
identiteter, resursledgers och testbara regler.

Bygg om gränsen mellan simulering, presenterat tillstånd och input så att
rendering läser en liten sammanfattning i stället för att rekonstruera hela
matchvyer. Gruppinformationen ska vara linjär från början. Gör en gemensam
orderlivscykel för planering, förflyttning, avbrott, lokalt försvar och återgång.
Transport och landing behöver en förstaklassplan med delresultat och begriplig
status. Håll AI-planeringens mål skilda från den vanliga betalda exekveringen.

Förenkla första rostern till två tydligt olika fraktioner och ett litet antal
produktionsbyggnader. Behåll forskning vid rätt värd. Använd tre begripliga
tekniksteg med synliga strategiska val och kostnad i stället för många likartade
siffersteg. Spara ett uttryckligt versionsmärkt format; migrationer blir ett
eget testat lager och utvecklingscachar ingår aldrig i formatet.

## System med störst förväntad spelnytta

- **Sammanhängande kustoperationer:** en forward base ger kortare restid men
  kräver försvar; en skyddad sjöväg kan vara effektivare än markfronten.
- **Begränsade doktrinval:** exempelvis rörlig eskort eller tung kustkontroll,
  med motspel som är synligt i både träd, kostnad och stridsutfall.
- **AI med läsbara avsikter:** spaning ger verklig kunskap; expansion, reträtt,
  eskort och landning utförs av befintliga betalda enheter. Svårighet justerar
  beslutsförmåga och tempo, med dokumenterade regler för eventuella fördelar.
- **Scenarioförfattande från samma regler:** eskort, blockad, evakuering,
  utpost och genombrott kombineras med tydliga följder, inte bara nya fiendeantal.

Kampanjen lär ut samma roller som skirmish använder. Permanent progression
låser upp uppdrag och valmöjligheter, utan att ge permanenta stridsbonusar som
förstör jämförbara matcher. Skirmish börjar med hela den valda rostern under
vanliga teknik-/ekonomikrav. Kartans sjövägar, resurser och passager avgör vilken
doktrin som passar. Ett förlorat strandhuvud ska ge ett nytt begripligt beslut.

## Prioriterad väg

| Milstolpe | Leverans | Beslutskriterium |
| --- | --- | --- |
| P0 · första spelbara vertikala utsnitt | Två fraktioner, en kustkarta, worker/base/supply,6–8 tydliga stridsroller totalt, transport/eskort, begränsad teknik, en betald AI, paus/Save/Load. | En ny spelare hittar nästa handling; lastning, blockerad order, lokal reträtt och återgång fungerar i riktigt spel. Mät samma stora armé före/efter varje relevant ändring. |
| P1 · sammanhängande spel | Tre kartprofiler och fem varierade kampanjoperationer som lär ut ekonomi, motspel och sjölogistik; en komplett skirmishloop med expansion och avslut. | Mänskliga blindtester av onboarding, strategiska rematcher och tydliga förluster. Publicerade balans-/prestandaunderlag på namngiven referenshårdvara. |
| P2 · fördjupning | Fler kartmål, AI-planer och en tredje fraktion endast om de öppnar en ny strategi; röst/ljud och fulla målade animationer när rollerna är stabila. | Nytt innehåll motiveras av speltester och kan återanvända den robusta order-/Save-/presentationsgränsen. |
| Lång sikt | Författade kampanjkedjor med förgrenade operationsval och fler meningsfulla kust-/landvägar. | Återspelning och upplevd rättvisa ska förbättras, inte bara antalet system. |

Sätt prestandabudget före innehållsspridning: specificerad referensdator,
p50/p95/max och stallräknare för normal match, stor markerad armé, första
basupptäckt och landstigning. Ett möjligt mål är stabil60Hz för referensmatchen;
exakt enhetsmängd fastställs efter prototypmätning. Medel-FPS ensam räcker inte.

## Utanför första versionen

Online multiplayer/ranked, karteditor, procedurell världsgenerator, en stor
metakampanj, fem fulla fraktioner från dag ett, obegränsade arméer, modplattform,
servrar/konton och3D-omskrivning. Ingen av dessa idéer startas genom detta dokument.

## Warbound nu och Warbound2

Warbound0.9 behöver fungerande feedback, byggfilter, transporter, säker lokal
hotreaktion och uppmätta riktade prestandarättningar. Det arbetet görs i det
befintliga spelet med dess roster och Save80. En ny representationsmodell,
förenklad roster och gemensam orderlivscykel hör till Warbound2 och ska först
prövas i det lilla spelbara utsnittet. Mänsklig balans, tidsupplevelse och
ljudbedömning av nuvarande Warbound är fortfarande egna beläggsluckor.
