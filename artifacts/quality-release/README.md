# Warbound0.9.0 — nytt verifieringsunderlag

Detta underlag skapades i uppdraget2026-11-01. Tidigare rapporter i
`naval-clarity*`, `island-fleets*` och rotloggar är historik.

## Faktisk browser

- `research-locations-browser.json`: fem raser × native800/1280. Varje tillåten
  forskning klickas vid rätt värd, genomförs och strict-sparas. Två rader;
  namn/kostnad/status mäts mot viewport. Bygg-/bankfixturen är uttrycklig.
- `campaign-build-menu.json`: verkliga meny-/briefingstarter för första
  uppdraget, Forge-upplåsning och Skirmish. Alla synliga byggknappar ryms;
  inget missionlåst bygge är synligt. Progression seedas endast för replayval.
- `threat-browser.json`: sex vanliga .1s matchsteg med verklig fog/combat/rörelse
  för worker, scout, marktrupp mot luft och försvarande archer. Staged styrkor.
- `transport/browser.json`: fysisk musklicksboarding, Stop, ny boarding,
  automatisk urlastning och faktisk Menu/Save/Load i båda storlekarna.
- `endgame/large-units-browser.json`: betald Capital/Zeppelin/Behemoth från
  riktiga produktionsklick, urval via sprite, rörelse, tangentparitet och Save.
  Två extra journeyfall börjar från basI och betalar hela teknikkedjan.
- `endgame/browser.json`: verkliga workerbyggen av fyra marinbyggnader,
  produktion av Marine/Tender/Transport och exklusivt skrovval i UI.
- `campaign-browser.json`: Tidebreaks logistikstrategi till renderad seger,
  med Save/Load vid fasövergångar. Accelererade quarter-secondsteg.
- `candidate-final/`: slutlig isolerad produktionsbuild,14 fall PASS: fem raser
  och två faktiska kampanjupplåsningar × native800/1280. Researchkort kontrolleras
  även med beräknad CSS (radbrytning, ingen ellips), högst två rader.
- `candidate/`: isolerad produktionsbuild med repositoryts CSS och oförändrade
  källassets; tio ras/upplösningsfall för forskning, enheter, hamnwaypoints,
  betalda köer och native Save/Load. Inga källmodulimporter i produktionsprovet.

PNG-bilderna visar samma verkliga spelvy. Ingen av komponentfixturerna eller
accelererade strategierna hävdas vara ett mänskligt spel-/balans-/ljudtest.
Kandidatprovets Build-ID är utgångscommiten; den publicerade releasehashen
redovisas separat efter commit/deploy.

## Prestanda

[Profiler, samtliga mätsteg och begränsningar](performance/README.md).
Både förbättringar, en hittad mellanregression och kvarstående initiala
frame-toppar finns kvar. Småkarternas efterprov är skilda från före/efterparet.

## Tester och release

Före commit: unit531/92 PASS, samtliga nio ändrade integrationsfiler127/9
PASS och strict typecheck/produktionsbuild PASS. Sista tillägget för bas-/
tornuppgradering:12/2 PASS och ny strict build. Presentationen byggd medVite8.3.5.

En första bred hotpolicy störde ekonomin; körningen avbröts. Nästa hela
mellanregression gav2287 PASS/22 FAIL (245 filer). Felen analyserades och
rättades: fulla resursnoder i ledgern, verklig transportmötesorder i äldre
kampanj-/östrategier, stabil identitetskontroll efter landning, explicit Hold
för dödsfixtur, avvisad allierad order och onödig transient träffmetadata vid
explicit attack. Kustklick kontrollerar nu verklig torr närliggande landning.
Alla nio berörda filer passerar tillsammans127/9. Inga seger-/resurs-/skade-
eller passagerarassertions sänks. Slutlig full lokal körning pågår; exakt
releasecommits CI, publicerade browser och tagg redovisas efter verifiering.
