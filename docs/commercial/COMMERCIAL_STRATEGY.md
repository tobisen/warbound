# Första kommersiella plan

Researchdatum **2026-11-03**. Marknadsuppgifter nedan kommer från öppnade
primärkällor; regionala priser, försäljning, efterfrågan och Valvevillkor kan
ändras. Detta är inget försäljningslöfte eller investerings-/skatteråd.
[Scope](RELEASE_SCOPE.md) är godkänd produktriktning genom WBC-002;
[roadmap](ROADMAP.md) beskriver fortsatt planerade tasks, inte implementationsmandat.
WBC-002 fastställer initialt externt utgiftstak10 000SEK; marknadsuppgifterna
nedan är WBC-001:s daterade research, inte en ny extern kontroll i WBC-002.

## Spelare och position

Primär hypotes: PC-spelare som gillar klassiska basbyggande RTS men vill spela
ensamma, pausa/spara och möta läsbar AI. Eget särdrag att pröva: ändlig ekonomi,
skogspass och skyddade kustlandstigningar med fem fantasyroster. Det är en
produkthypotes, inte en undersökt marknadsstorlek. Sälj begripligt spel och
strategiska val; lova inte77 unika storyuppdrag eller en Warcraft-ersättare.

| Jämförelse, officiell Steam-listning | Observerat underlag | Slutsats för Warbound (bedömning) |
| --- | --- | --- |
| [Five Nations](https://store.steampowered.com/app/1565670/Five_Nations/) | SilverForge; singleplayer-RTS, campaign/skirmish och demo. Listningen anger56 storyuppdrag; hämtat USD-baspris19,99. | Relevant exempel på singleplayer med fem fraktioner. Dess innehållsmängd är inte en rimlig kvot att efterlikna. |
| [8-Bit Armies](https://store.steampowered.com/app/427250/8Bit_Armies/) | Petroglyph; retro-RTS med campaign/skirmish och även multiplayer/co-op. Hämtat USD-baspris14,99; kampanj-/bundlepriser varierar. | Referens för tillgänglighet/kontrollpolish, större teams produkt. Warbound ska inte konkurrera med dess multiplayerbredd. |
| [Warlords Under Siege](https://store.steampowered.com/app/2091500/_/) | RedKar Devs; fantasybasbygge/siege med RTS-/roguelikeblandning, singleplayer. Hämtat USD-pris9,99. | Närliggande budgetalternativ, annan matchloop. Tydlig beskrivning behövs så att kunder förstår skirmish/campaign snarare än vågroguelike. |

Priserna är de hämtade USD-listningarnas observationer, inte svenska
prisrekommendationer eller valutakonvertering. Cache/region/kampanj kan ge
andra belopp; kontrollera vald Steamregion igen före prissättning. Varken
reviewantal eller taggar används för att härleda försäljningsvolymer.

## Pris, utgifter och enkla scenarier

**129SEK är endast initial prishypotes**, inte godkänt slutpris. Pröva upplevt
värde hos demotestare och jämför regionala baspriser/rea innan WBC-049/060.
Förslag: full1.0 med gratis demo. Early Access rekommenderas bara om den redan
spelbara versionen är värd priset och ägaren har råd med löpande support; det
är inte en lösning på oklara rättigheter, saknade grundfunktioner eller
finansieringsbrist. [Valves Early Access-vägledning](https://partner.steamgames.com/doc/store/earlyaccess)
ska läsas på nytt före ett sådant beslut.

**Godkänd ekonomisk ram i WBC-002: initialt sammanlagt externt utgiftstak
10 000SEK.** Separat godkännande krävs för mer. Taket ger inga beställningar,
avtal eller betalningar; faktiskt nyttjat/återstående utrymme inventeras i
WBC-003. Steamavgift, skatter och övriga externa kostnader måste rymmas i den
återstående ramen eller hanteras med separat beslut. Inga offerter finns här.

Följande är **WBC-001:s äldre kostnadshypoteser, inte godkänd budget**. De
överstiger taket. Återbruk, avgränsade offerter eller ny finansiering behövs;
planen visar inte ännu att release är genomförbar för10 000SEK. Rättigheter
och kvalitet får inte antas bort. Egen arbetstid är inte inventerad.

| Post | Äldre kostnadshypotes / åtgärd |
| --- | --- |
| Steam Direct | USD100 per produkt, eventuell skatt tillkommer; inget SEK-belopp utan aktuell betalningskurs. |
| Namn-/IP-/avtalsgranskning |10–30tSEK som arbetshypotes; inhämta avgränsad offert. Registrering och större tvist ingår inte. |
| Begränsad art-/musik-/röstkomplettering |10–35tSEK; endast identifierade luckor. En omritad femrasroster kan kosta mycket mer och kräver ny budget. |
| Windowsmaskin/testhjälp/signering |0–12tSEK beroende på befintlig dator och distributionsval; CI-/certifikatkostnad kontrolleras innan val. |
| Capsule/trailer/domän/övrigt |3–10tSEK; återbruk/egen produktion, ingen betald annonseringskampanj antas. |
| Reserv | Cirka20% av valda externa poster. Summerat ungefär28–105tSEK plus Direct/ev skatt, **exklusive egen tid och redan köpta resurser**. |

Följande är **aritmetiska känslighetsscenarier, inte prognoser**:

| Betalda exemplar, hypotetiskt | Konsumentomsättning vid129SEK, utan rabatt | Bidrag vid antagen65SEK/exemplar |
| --- | --- | --- |
|250 |32 250SEK |16 250SEK |
|1 000 |129 000SEK |65 000SEK |
|5 000 |645 000SEK |325 000SEK |

65SEK är en vald modellparameter, **inte Valves verifierade utbetalning**.
Skatt/moms, regionalt pris, avgifter, rabatter, återköp och växelkurser kan
ändra bidraget; egen lön/inkomstskatt räknas inte här. Exempel:50 000SEK externa
kostnader kräver cirka770 exemplar vid65SEK bidrag, eller589–1112 vid85–45SEK.
Det visar risk, inte sannolikhet. Bekräfta faktiska partneravtal och svensk
redovisning med ägarens rådgivare innan budgeten används som affärsbeslut.

## Steamkrav och ordning

Valve anger USD100 appavgift, ej återbetalningsbar men återvinningsbar efter
USD1 000 Adjusted Gross Revenue. [Steam Direct Fee](https://partner.steamgames.com/doc/gettingstarted/appfee).
Ägaren behöver identitet, matchande bank-/skatteuppgifter och avtal.
Den **öppnade aktuella onboardingsidan anger21 dagars väntetid** efter avgift
för de första titlarna, och minst två veckor publik Coming Soon. Sökindexet
återgav äldre30-dagarstext; använd därför aktuell partnerkontobekräftelse före
datumlåsning och budgetera marginal. Sidan anger även att skatteverifiering
kan ta upp till30 dagar. [Onboarding](https://partner.steamgames.com/doc/gettingstarted/onboarding).

Store page och build granskas separat. Planera minst7 arbetsdagars marginal
för vardera granskning samt tid för rättelser; screenshots ska visa faktiskt
gameplay och utlovade features måste finnas i bygget.
[Valve Review Process](https://partner.steamgames.com/doc/store/review_process).
Steamdistribution behöver inte alla Steamworks API-funktioner; SDK/bindning
och overlaykompatibilitet prövas separat, utan att blockera offlinekärnan.
[Steamworks SDK](https://partner.steamgames.com/doc/sdk).

WBC-046–051 förbereder partnerkonto, app/depot/launch, supported platforms,
prisregioner, språk, content-/ålders-/AI-survey, capsule/header/libraryart,
beskrivning, screenshots och trailer. Aktuella mallmått hämtas vid produktion,
inte hårdkodas i denna plan. [Store Graphical Assets](https://partner.steamgames.com/doc/store/assets/standard).
Förgenererad grafik/röst/narrativ granskas för AI-disclosure utifrån det som
faktiskt distribueras; deklarationen befriar inte från rättigheter.
[Content Survey](https://partner.steamgames.com/doc/gettingstarted/contentsurvey).
Ingen kontakt, kontoregistrering, betalning eller publicering sker nu.

## Demo, önskelistor och stöd efter köp

Coming Soon bör visas först när ett klarerat namn och en representativ,
fungerande slice finns. Bygg intresse med korta **verkliga** klipp som visar
ett beslut: skydda skogsvägen, eskortera transport, bryta blockad. Föreslagen
hållbar takt: en uppdatering varannan vecka med konkret framsteg, en tydlig
wishlist-/demo-länk och ärliga systemkrav. Ägaren publicerar; inga automatiska
communitymeddelanden beställs av planen.

Demo: en onboardingoperation, en skirmishkarta, två klara raser, befintliga
regelsystem, separat progression/saves och tydliga gränser mot fullversionen.
Det begränsar gratisprovets QA utan att ändra fullversionens femraslöfte.
[Valve Demos](https://partner.steamgames.com/doc/store/application/demos)
anger separat demoapp och distributionsflöde; pröva installerad demo på Steam.
Event/Next Fest är möjligt endast efter kontroll av då aktuella behörigheter
och deadlines; inga festivaldatum eller behörighetslöften antas.

Följ trafik/önskelistor, demo-start→första mål, lämnad feedback och vanligaste
stopp med frivillig mänsklig rapportering/Steamverktyg, utan egen backend.
Det finns inget verifierat universellt wishlistkrav eller säker konverterings-
procent här. Ägaren sätter ett ekonomiskt fortsättningskriterium efter demo.
Låg efterfrågan talar för tydligare position/marknadsprov och ny ekonomisk
bedömning, inte fler features som standardreaktion.

Största affärsriskerna är titel-/IP-konflikt, för stort innehåll för en person,
okänd faktisk polish/balans, sena Windowsproblem, svag synlighet och alltför
stor produktlikhet med inspirationskällan. Skydda budget med små verifierade
slices och datumgrindar. Reservera2 veckors hotfixkapacitet och begränsa patchar
till reprobara fel före nya balans-/innehållslöften. Cloud/achievements och
framtida innehåll kräver separat beslut efter kärnans releasekvalitet.
