# Jag ville bara spela Warcraft II igen…

Svensk lightning talk om Agentic Coding och Warbound. **10 huvudslides, 8 minuter, plus en extraslide**.

## Webbversion

Presentationens huvudsakliga leverans är den körbara Vue-hemsidan, enligt mallrepots upplägg. Ingen PowerPoint levereras.

- [Talarstöd och tider](exports/talarstod.md).
- [Renderade slides](exports/review/) och [kontrollrapport](exports/review/verification.json).

## Kör och redigera

Detta är ett separat npm-paket. Spelprojektets beroenden och kod påverkas inte.

```sh
cd presentations/agentic-coding
npm ci
npm run dev -- --host 127.0.0.1 --port 5205
```

Öppna http://127.0.0.1:5205/. Pilar/Space byter slide, N visar talarstöd, F växlar fullscreen. Talarstödet visas aldrig på publika slides. `?print` visar alla slides för utskrift. Kör på Node 20.19+ eller 22.12+.

Allt innehåll och placeringar finns i [talk.json](src/data/talk.json), på en 1600×900-yta. Ändra här och bygg webbversionen igen:

```sh
npm run build
# Med dev-servern igång på 5205:
npm run verify
```

Verifieringen kräver Google Chrome på standardplats för macOS; på annan dator sätt `CHROME_PATH` till installerad Chrome. Den renderar alla slides, granskar bildladdning/textgränser/navigation/anteckningar och avkodar QR-koden. Den sparar granskningsbilder. `npm run build` skapar en fristående statisk webbplats i `dist/`; `npm run preview` visar den byggda versionen.

## Mall, bilder och fakta

Bygger på [tobisen/vue-presentation-template](https://github.com/tobisen/vue-presentation-template), revision `4a77d76d92d84e1094e579d6048c4229a94884cf`. Mallens Vue-navigation, anteckningspanel, mörka burgundy/coral-färger och 16:9-format återanvänds. En egen Warbound-komponent ger bildbaserade layouter. Presentationens produktionsbygge läggs i spelets Pages-artifact under `presentation/`. Spelet behåller sin befintliga adress.

Warbound-bilder kommer från [bildpaketets README](../../artifacts/presentation-2026-10-16/README.md). Historisk MVP6740128 har återkörts 2026-10-16; bilderna är inte tagna under den första utvecklingsveckan. Aktuellt gameplay är faktisk lokal v0.8.0-match. Assetbilderna är uppställda runtime-gallerier; slide 6 visar förstorade soldater och baser för alla fem raser, beskurna direkt ur spelets befintliga atlasframes. Inga nya spelbilder eller AI-bilder har skapats. Bildpaketets original är bevarade.

Warcraft II-bilden på slide 1 är tydligt markerad inspiration, © Blizzard Entertainment, från [Wikipedia-bildsidan](https://en.wikipedia.org/wiki/File:WC2_Tides_UI_01.png), hämtad från [originalfilen](https://upload.wikimedia.org/wikipedia/en/3/3a/WC2_Tides_UI_01.png). Den ingår inte i Warbounds spelassets och är inte CC-licensierad.

Fem kalenderdagar/fritid är presentatörens egen berättelse i uppdraget. Senare innehåll blandas inte ihop med femdagars-MVP:n. Konkreta tekniska exempel stöds av [RTS-024 i BACKLOG](../../BACKLOG.md#rts-024--byggnader-som-hinder-och-säkra-placeringsregler) och [QUALITY_REVIEW](../../QUALITY_REVIEW.md), stycket om highscore-regression efter RTS-178. Tekniska tester och mänskligt gameplayomdöme skiljs åt enligt projektets [HANDOFF](../../HANDOFF.md).

QR använder spelets aktuella adress: https://tobisen.github.io/warbound/. QR har maskinellt avkodats; det är inte en ny verifiering av den publicerade spelversionen.

## Verifiering

Build med vue-tsc, browserrendering av alla elva slides, textgränser, laddade bilder, navigation, anteckningar och QR-avkodning har verifierats. Visuell granskning gjordes av samtliga browserrenderade slides. Publiceringskontroller och CI-status dokumenteras i projektets DEV_LOG. Tidigare browserkontroller av presentationen är separata från senare verifiering av den publicerade adressen.

## Startsidan på avslutningssliden

`warbound-startsida.png` är en ny lokal browsercapture av samma startsida som användarens referensbild, vid1710×966. Den visar spelets befintliga illustration och meny, inte gameplay. [Capture-script](scripts/capture-home.mjs) använder spelet på5198 (`GAME_URL` kan ändras).

## Kartslide

Extraslide11 visar River Crown: full kartöversikt och närbild vid zoom1. Båda är rena utsnitt från bildpaketets `karta-rivercrown-utan-fog.png` (553,65–1367,879) och `detalj-rivercrown-utan-fog.png` (0,48–1710,897). Full sikt är uttryckligen en testfixtur och anges på sliden.

## GitHub Pages

Publik adress: **https://tobisen.github.io/warbound/presentation/**.

[Pages-workflow](../../.github/workflows/pages.yml) kör spelets befintliga fullregression/build, installerar presentationens låsta npm-beroenden och bygger den med basväg `/warbound/presentation/`. Därefter kopieras presentationens `dist/` till spelets `dist/presentation/` innan det gemensamma Pages-artifactet laddas upp. Ingen separat hosting eller ny spelversion behövs.

Verifiera lokalt produktionsbygge med `npm run preview -- --host 127.0.0.1 --port 5206` och:

```sh
TALK_URL=http://127.0.0.1:5206/warbound/presentation/ REPORT_DIR=/tmp/warbound-talk-review npm run verify
```

`TALK_URL` kan också vara den publika adressen. Kontrollprogrammet avkodar både den lokala och faktiskt serverade QR-bilden. `REPORT_DIR` håller nya granskningsfiler utanför Git-arbetskopian.

## Faktiskt publicerad

Verifierad på https://tobisen.github.io/warbound/presentation/ efter [grön CI och deploy](https://github.com/tobisen/warbound/actions/runs/38912432397) för commit `3b9923a`, avslutad 2026-10-16 16:43:09 Europe/Stockholm. Alla11 dåvarande slides, bildladdning, textgränser, navigation/anteckningar, title/favicon och serverad QR passerar publik Chrome-kontroll. Spelets befintliga adress och meny fungerar också. Se [DEV_LOG](../../DEV_LOG.md) för belägg och kontroller.

## PDF

[Uppdaterad PDF: 10 huvudslides + karta](exports/warbound-agentic-coding.pdf), exporterad från den publicerade webbversionen. Alla11 sidor har verifierats i16:9-format och renderats med PDFKit. Talarstöd finns separat i [talarstod.md](exports/talarstod.md).

Återskapa med `npm run export:pdf`; `TALK_URL` kan ange en lokal eller annan publicerad webbversion. Kräver Chrome enligt samma `CHROME_PATH`-inställning som verifieringen.

## Förbättring 2026-10-16

Befintlig mall och färger behållna. Fem kalenderdagar gäller första fungerande
versionen på fritiden, inte dagens spel. RTS-024-exemplet sammanfattar krav och
historisk verifiering i BACKLOG/DEV_LOG; det är inget påstått ordagrant direktiv.
Slide5 visar roller, hela arbetsflödet och problem/avgränsning/implementation/
verifiering. Slide4 prioriterar den aktuella matchbilden; inga videofiler hittades
i presentations-/bildpaketet, därför används den riktiga stillbilden.
Slide6 visar en förstorad soldat och bas för var och en av de fem raserna.
Kartslide11 ligger efter avslutningen och ingår inte i talbudgeten.

Talaranteckningarna omfattar1026 ord för huvudflödet, cirka128 ord/minut över
480 sekunder. Per slide117–141 ord/minut. Det är en beräknad talbudget, ingen
mänskligt repeterad eller uppmätt framförandetid. Extrasliden har ingen tidsbudget.
QR är360×360 på1600×900; avkodning verifieras både lokalt och från serverad bild.
Faktisk skanning från publikplats är inte genomförd.

PDF exporteras från samma slutliga lokala innehåll som publiceras, med11 sidor
inklusive extrasliden. Pages-artifactet inkluderar PDF på
[PDF på Pages](https://tobisen.github.io/warbound/presentation/warbound-agentic-coding.pdf).
Tidigare publiceringsbelägg ovan gäller den tidigare presentationen;
ny verifiering dokumenteras i DEV_LOG.

Representativa sprites exporteras med `python3 scripts/export-representatives.py`
(Pillow), från `public/assets/units-atlas` och `buildings-atlas`, player/SE-idle
och complete. Humans saknar prefix, Orcs använder clans; övriga har rasnamn.
