# Strategisk AI — 2026-10-25

Separat användaruppdrag, ursprungligen utan commit/push. Användaren godkände
därefter uttryckligen commit/push till origin/main; befintlig CI/Pages startar
automatiskt vid kodpush, och dess nya resultat är ännu inte verifierat. Befintliga ändringar i
style.css/units.mjs och otrackade docs/:memory:.ses/CLEANUP_REPORT.md bevaras.
Ingen ny roadmaptask eller version. Kampanjers scriptade tidsdesign och äldre
kartgeometrier behåller sin tidigare policy.

## Automatiska belägg

`npm test -- src/gameplay/enemyStrategy.test.ts` kör riktiga MatchState-system:

- 240s ostörd Normal/Arena från ordinarie bank, egna workers, verklig resursleverans,
 konstruktion och produktion: fler workers/enheter, forge och färdig extra bas.
 Därefter arméförlust och60s betald återuppbyggnad; strikt Save/ledger kontrolleras.
- Komponentförutsättningar för spacing/ihågkomna resurser, synliga hot, blockerade
 byggplatser, dold info, försörjning, reserverad budget och svårighetsintervall.
 Komponentfixturer med manuellt tilldelad bank/armé är inte betalda genomspelningar.
- Oåtkomliga byggare: kostnadsfri admission, två begränsade sökningar,15s backoff
 och frigjord armébudget. En första obegränsad implementation tog63,8s på detta
 test; den ersattes av en65ms-körning med begränsad admission före full regression.
- Små anfallsgrupper hålls tillbaka efter timeout, får förstärkning och sammanförs
 vid observerat styrkeunderläge; reserver bevakar huvudbas/extra resursbas.
- Fyra AI i Plains128/12s, oberoende planer/banker/betalningar/ID:n och strikt Save.

Riktade befintliga regressioner efter korrigering:77/4 PASS (strategi, LargeMaps,
MapRegions och alla fem fraktioner). Därefter118/11 PASS för strategi/AI/defense/
construction/production/policy/recovery/expansion/ArmyPlan/multiplayer/profiler;
ytterligare2 riktade cache-/navalkontroller PASS. Slutlig build med strict
TypeScript PASS. Slutlig unit538/92 PASS17,41s; full regression2044/221 PASS856,33s.
Script-syntax, nya lokala länkar, egen diffreview och git diff --check PASS.
Buildens befintliga bundlevarning kvarstår. Slutlig Markdown återanvänder
dessa nya kodchecks; ingen ytterligare kodändring eller ny CI/Pages-verifiering.
Historiska CI-/Pagesbelägg används inte som ny verifiering.

Första fullförsöket avbröts efter8 hittade regressionsfall: fem gamla
rosterfixturer utan enemyRecovery behövde behålla sin äldre policy, två tester
antog tidigare fixerad expansionsdeadline/arbetarmängd och Plains128:s armé
väntade för länge på en växande grupptröskel. Koden rättades för kompatibilitet
och första användbara anfallsstyrka; endast de två föråldrade expansions-
antagandena uppdaterades. Betalning, Save och basförlustassertions behölls.

Ett600s endurance-test använder multiplayerns tomma combatmål för att hålla
spelaren vid liv efter att en passiv spelare annars skulle ha förlorat. AI:n
utvinner/betalar normalt, växer till högre basnivå/stable och producerar vidare.
Detta är simulerad gameplaytid, inte tio minuters mänskligt speltest.
Ytterligare tester täcker saknat recovery-system, cachade byggmåls antal och
flottans befintliga två markplatser utan att blockera teknik.

## Browser och CPU

Reproducerbart med installerad Playwright och lokal Chrome:

```sh
npm run dev -- --host 127.0.0.1 --port 5184
W2T_PLAYWRIGHT_MODULE="$PWD/presentations/agentic-coding/node_modules/playwright-core/index.mjs" node scripts/check-strategic-ai.mjs
```

`W2T_PROFILE_ONLY=1` kör endast CPU-delen; W2T_BROWSER_ONLY=1 endast browser; W2T_ARTIFACTS/W2T_UI_URL och
W2T_BROWSER_EXECUTABLE kan ersätta standardvärden. Browserdelen verifierar240s
betald utveckling och faktisk rendering800/1280. revealed-bilderna ger uttryckligen
människan full sikt för rendering; AI:s egen information ändras inte.

CPU-delen bygger en isolerad HEAD-baslinje och aktuell gameplay till produktion,
med samma femspelarscenarier som tidigare profile-five-players: tidig match samt
16 injicerade mänskliga och80 AI-soldater efter30s. Det större scenariot kringgår
kostnad/supply enbart som belastningsfixture.360×1/60s, första60 samples utesluts.
AI-beteendet ändras avsiktligt, så identiska slutstatehashar krävs inte. CPU är
inte renderad FPS, och korta lokala prover är ingen allmän fullmatchgaranti.

## Manuellt speltest som återstår

1. Starta Normal skirmish på en större landkarta. Spela10–15min; spana mot basen
 före/efter3–5min. Bedöm produktionstakt, teknikordning, expansionsförsvar och
 om anfallen upplevs genomtänkta. Jämför Easy/Hard och Economic/Defensive.
2. Raida arbetare eller ett produktionshus, dra dig tillbaka och följ återhämtning.
 Blockera en tilltänkt expansion och kontrollera att annan utveckling fortsätter.
3. Spela mot fyra AI på Plains128/Lakehold, upptäck flera utvecklade baser och
 bedöm respons vid panorering/strid. Automatiska kortprover ersätter inte detta.

Automatisering verifierar mekanik och begränsningar, inte mänskligt bedömd
matchbalans, strategisk kvalitet över alla kartor eller10–15min faktisk speltid.

## Slutlig isolerad browser-/CPU-körning

[Maskinrapport](browser.json), Chrome155.0.8059.85, HEAD-baslinje946a53c mot
arbetskatalogen. Inga samtidiga tester under den slutliga mätningen. Tidigare
provmätning under full regression används inte som slutbelägg.

| Femspelarscenario | Baslinje median/p95 | Ny AI median/p95 |
| --- | --- | --- |
| Tidig match,11 enheter |14,0/16,0ms |14,0/16,0ms |
| Belastningsfixture115→117 |38,8/52,3ms |38,8/53,2ms |

Fyra AI utför sammanlagt8 strategiska omplaneringar på6s Normal, motsvarande
3s beslutstakt per AI. Samma enhetsantal i respektive före/efter-prover; ingen
tydlig CPU-regression i dessa korta arbetslaster. Större strider är fortsatt
CPU-tunga; inga60fps- eller alla-kartor/fullmatch-garantier.

Natural Arena240s vid800/1280:5 arbetare,8 accepterade truppjobb, färdig forge,
två farms och en outpost; ordinarie startbank och faktisk utvinning/leverans.
Bank12wood/24gold i båda proverna. Renderingsfixturen synliggör hela kartan för
människan först efter denna utveckling. Första synliggörandet6,6/7,5ms; varm
syncVisuals-median1,5/1,6ms och p952,7/3,1ms. Femspelarsfixture med96 injicerade
soldater: första synliggörandet10,5ms, varm median2,7ms/p954,9ms. Detta mäter
synkron rendering, inte kompletta frames eller användarinputlatens.
Noll pageerrors;800-bilden och femspelarsbilden vid1280 visuellt granskade.

[Bild: naturlig bas800](revealed-2-800.png),
[bild: naturlig bas1280](revealed-2-1280.png),
[bild: fyra AI/belastning1280](revealed-5-1280.png).
Motsvarande unrevealed-bilder visar spelarens vanliga dolda fog före renderfixturen.
