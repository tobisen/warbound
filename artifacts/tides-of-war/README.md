# Tides of War — verifieringsunderlag 2026-10-30

Lokalt innehållsuppdrag; ingen commit, push, CI, release eller Pages-publicering.
Källbas: main vid ebc75acde9d79c9aee9df06f2a11e864a520c409 plus användarens
redan befintliga arbetskatalog, inklusive AI/navigation-rättningen. Före-kopian
skapades före innehållsändringarna i `/tmp/w2t-tides-baseline` genom git archive
plus `/tmp/warbound-before-tides.patch`; node_modules delades. Inga resultat från
föregående uppdrag räknas som ny verifiering här.

## Funktion och browser

- `npm run test:unit`:552 tester/94 filer PASS17,96s på slutlig kod.
- `npm run build`:strict TypeScript och produktion PASS; Vite546ms.
  Befintlig varning om bundle över500kB kvarstår.
- `npm test -- src/gameplay/tidesOfWar.test.ts src/presentation/technologyView.test.ts`:
  26/2 PASS4,13s efter rättad migration av äldre Orc-kanonsalvor.
- `npm test -- src/gameplay/tidesOfWar.test.ts src/gameplay/tidebreak.test.ts src/gameplay/combinedArmsBalance.test.ts`:
  95/3 PASS10,01s före det tillagda migrationstestet och sista presentationstexten.
- Fullkörningen på slutlig spelkod:2149 PASS/1 FAIL över235 filer,902,70s.
  Enda felet var en äldre förväntan att Dwarf-ballistan angriper luft. Testet
  rättades till Coast Ballistas avsiktliga begränsning och verifierar nu både
  oförändrad mål-HP och utebliven projektil mot luft. Hela projectileDomains-filen
  kördes om:13/13 PASS594ms. Ingen spelkod ändrades efter fullkörningen; dess
  234 godkända filer återanvänds. Därmed finns godkända belägg för samtliga2150
  aktuella testfall, men ingen andra fullkörning med allt grönt i samma körning.
  Slutlig build med strict TypeScript PASS546ms efter teständringen. Unit552/94
  återanvänds från samma spelkod; den ändrade filen är integration. Diff och
  lokala dokumentlänkar PASS. Se loggarna i artefaktrapporten.
- `node scripts/test-unit.mjs --list`:94 unit/141 integration, disjunkta235 filer.
  Två nya sammansatta filer klassificerade som integration; elves.test innehåller
  Save-flöde och flyttades till integration.

`W2T_UI_URL=http://127.0.0.1:5194 node scripts/check-tides-of-war.mjs`:
10/10 faktiska Chrome-flöden PASS, fem fraktioner ×800×600/1280×720. Native
meny, Fleet-val, riktig betald researchklickning, aktiv researchspara/ladda,
slutförd forskning, paginering (högst8 knappar/två rader), Tech Tree och native
Save/Load. Förutsättningarna (resurser och färdiga byggnader) seedas uttryckligen
för denna UI-fixture; detta är inte belägg för en full ekonomimatch.
Se [browser.json](browser.json) och fraktionsbilderna.

`W2T_UI_URL=http://127.0.0.1:5194 node scripts/check-tidebreak-campaign.mjs`:
2/2 PASS. Faktisk kampanjmeny/briefing/start vid båda upplösningar. Tidigare
kampanjprogress seedas för att låsa upp mission17. Lagliga automatiserade order
körs därefter med accelererade gameplay-steg, betald Foundry/Convoy Service,
faktisk strid och transportlandstigning till victory; strikt Save/Load vid varje
fasövergång. Båda vinner vid108,25 simulerade sekunder, med10 skepp kvar. Detta
är varken mänsklig speltid eller native-frameprofilering. Screen och Logistics
vinner även i dedikerade gameplay-tester. Se [campaign-browser.json](campaign-browser.json).

Bilder granskade: [research800](dwarves-800-research.png),
[Tech Tree800](dwarves-800-technology.png), [Tech Tree1280](goblins-1280-technology.png),
[briefing800](tidebreak-briefing-800.png), [vinstvy800](tidebreak-victory-800.png) och
[native sjöslag1280](after-naval-battle-1280.png).

## Före/efter-prestanda

Chrome156.0.8078.76, headless/native1280×720, samma lokala dator. Före-server5195,
efter-server5194. Inga tester/browserflöden kördes samtidigt med de avslutade
profilparen. Absoluta siffror är maskin-/körningsberoende; ingen statistiskt
säker förbättring eller total frånvaro av regression hävdas.

| Fall | CPU p50/p95/max ms före → efter | Frame p50/p95/max ms före → efter | Frames över50ms före → efter |
| --- | --- | --- | --- |
|80 anfallare,40s |7,6/12,1/118,0 →8,8/13,4/123,4 |16,7/16,7/200,1 →16,7/16,8/200,0 |2→2 |
|80 anfallare,40s, omvänd körordning |8,3/13,2/118,8 →8,6/13,7/119,5 |16,7/16,7/199,9 →16,7/16,7/200,0 |2→2 |
|512 anfallare från fyra AI,25s |68,6/379,2/628,2 →69,2/357,7/602,1 |66,7/383,2/633,4 →66,7/366,6/600,0 |219→214 |

80-provet upprepades i omvänd ordning eftersom första parets CPU-skillnad
behövde kontrolleras. Båda par redovisas. Frame-median/p95 är i princip samma;
CPU är något högre i80-provet,0,3–1,2ms median. Ingen sänkning av tick, grafik,
enhetstak eller bortfiltrering av kalla toppar. Arméerna är hållbara fixtures
över normal supply och mäter rörelse/sikt/strid, inte betald ekonomi. Samtliga
har dispatch, reveal och combat, noll runtimefel. Det stora stresstestet är
fortfarande klart ospelbart periodvis; uppdraget löser inte det tidigare problemet.

`profile-tides-performance.mjs` skriver råa tidsserier, CDP-profiler och bilder.
Exempel (byt URL/stage för före, PLAYERS=5/ARMY=128/SECONDS=25 för fyra AI):

```sh
W2T_UI_URL=http://127.0.0.1:5194 W2T_STAGE=army-after W2T_ARMY=80 W2T_PLAYERS=2 W2T_SECONDS=40 node scripts/profile-tides-performance.mjs
```

Verkligt native Stormgate Armada-flöde (samma befintliga uppdrag före/efter)
via `scripts/check-tides-naval-performance.mjs`: CPU-median/p953,9/5,0→3,8/4,8ms,
frame-median/p9516,7/16,7→16,7/16,8ms. Mätningen tar första tio riktiga sekunderna
efter sex gameplay-sekunders lagliga order; första30 frameprov utesluts av
samma befintliga mätrutin i båda fallen. Därefter fortsatt native spel till
victory68,66→67,71s;14 skepp kvar i båda. Se
[före](before-naval-performance.json) och [efter](after-naval-performance.json).
Detta mäter sjöstrid, inte den nya kampanjens mänskliga balans.

Profilerna togs efter slutlig gameplaykod. Efteråt ändrades enbart
rollbeskrivningar och migration av gamla sparfilers projektiler; den aktiva
matchens beräkningsväg ändrades inte.

## Gränser och mellanresultat

Ingen mänsklig balans-/tidsbedömning eller faktisk ljudlyssning utförd.
Befintliga riktiga assets/ljud återanvänds; inga nya sprites/inspelningar.
Foundry delar grafik och AI:s äldre transportanfall använder fortfarande två
soldater trots Orc-spelarens sexplatsersteknik.

Det första fullförsöket avbröts med exit130 eftersom kod ändrades under dess
löpning; det räknas inte som PASS. Mellanversioner hade felaktiga testförväntningar
för de avsiktliga Orc/Elf-rolländringarna, för låg mängd guld på nya ön och
felplacerade sjötest-fixtures. Dessa rättades och riktade kontroller kördes om.
UI-granskningen hittade en överskriven Dwarf-ballistabeskrivning; den är rättad.
Sista spargranskningen hittade gamla Orc-salvors skada; den migreras och testas.
Den senare fullkörningens enda fel var den äldre ballistans luftmålskrav;
testförväntningen rättades och hela dess13-testfil passerade utan spelkodändring.
Ett kort omprofilförsök avbröts före mätresultat när UI-kontrollen ännu pågick;
endast de senare isolerade avslutade profilerna rapporteras ovan.

## Slutloggar

[Full körning med ett förväntansfel](full-regression.log),
[riktad slutlig omkörning](projectile-domains-final.log),
[unit](unit-final.log), [strict build](build-final.log),
[migration/Tech Tree](migration-and-technology.log),
[balans/kampanj](balance-and-campaign.log), [UI](browser.log) och
[kampanjbrowser](campaign-browser.log).
