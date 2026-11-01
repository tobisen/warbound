# Kvarstående tech-klickregression — 2026-11-01

Användaren rapporterade efter publicerad78c3013 att bättre workers,
huvudbyggnadsuppgradering och Forge-forskning fortfarande inte gick att starta.
Valen såg grå ut i Research vid markerad byggnad, i både Skirmish och kampanj.
Detta återöppnar felsökningen; de tidigare gröna testerna täckte inte detta fel.

## Faktisk reproduktion på publicerad78c3013

Ett Research-kort var124×73px, men HTML-knappen täckte bara116×31px överst.
Kortets mitt låg på `.research-detail`, strax under knappen. Kostnad, Ready-text,
kortets nedre del och padding hade ingen click-handler. Ready-kort behöll samma
grå bakgrund som spärrade kort, med enbart annan kantfärg.

[Live-baseline](baseline.json) och bilder visar tre separata prov i riktig
publicerad bundle, med automatisk matchuppdatering och140ms fysiska klick:

| Val | Mitten av synligt kort | Klick på namnraden |
| --- | --- | --- |
| Worker Tools I | Inget jobb, ingen debitering, Ready och disabled=false | Jobb startar,60wood/30gold betalas |
| Upgrade base II | Ingen uppgradering eller debitering | Uppgradering startar,80wood/60gold betalas |
| Forge attack I | Inget jobb eller debitering | Jobb startar,40wood/10gold betalas |

Det nya regressionstestet kördes först mot samma publicerade baseline och
fallerade: `research-workerTools/center: exactly one paid order`, **0≠60** wood.
[Baseline failure](baseline-red/failure.json) dokumenterar detta RED-prov.
Ingen injicerad byggnad/tech eller stoppad match användes i reproduktionen.

Den förra rättningen av extrabasens kravkontroll består. De tidigare browser-
testerna klickade däremot på den inre HTML-knappen och stoppade automatisk
scene-update i delar av sina förlopp. Deras PASS belägger inte ett fungerande
klick på hela den synliga ytan. Den tidigare slutsatsen var för snäv.

## Rättning

`bindActionPanel` vidarebefordrar klick på Research-kortets icke-knappyta till
den befintliga knappen. Klick på namnet/ikonen vidarebefordras inte igen.
Native `:disabled` (även via fieldset) och hidden-guard hindrar otillåtna klick;
den befintliga ordern validerar fortfarande resurser, färdiga byggnader, tidigare
teknik, kö/exklusivitet, maxnivåer och kampanjupplåsning. Alla Research-kort,
inklusive huvudbyggnadens uppgradering, delar denna klickhantering.

Ready-kort får grön bakgrund och pekarcursor över hela ytan. Spärrade kort
behåller grå bakgrund och sin faktiska krav-/kostnadsförklaring. Inga priser,
tider, gameplayeffekter, kampanjregler eller Saveformat ändras.

## Ny verifiering

[check-tech-card-input.mjs](../../scripts/check-tech-card-input.mjs) kör naturligt
pågående matcher med160ms fysiska klick över flera spelrutor. Den stoppar aldrig
scene-update, injicerar inga byggnader/tekniknivåer och använder inga manuella
matchticks. Bara resurs-/siktfusken används via vanlig dialog. Campaign-ledger
låser upp den authored operationen `the-siege` som explicit testfixture.

Testet kontrollerar kortets mitt, kant, kostnads-/statusrad samt inre knapp:
riktigt jobb/kö och **exakt en** debitering/knappaktivering. Spärrade kort
debiterar/startar inget. Forge byggs och färdigställs av riktig worker; Menu
Save/Load bevarar jobb/basuppgradering; därefter fungerar nästa verktygsnivå.
Automatisk speltid måste öka under varje tryck. Ett enbart kravtexttest räknas inte.

Representativ matris (varje fall provar alla tre techflöden):

| Ras | Skirmish | Kampanj |
| --- | --- | --- |
| Humans | 800×600,1280×720 | 800×600,1280×720 |
| Orcs | 800×600 | — |
| Elves | — | 1280×720 |
| Dwarves | — | 800×600 |
| Goblins | 1280×720 | — |

Riktade befintliga krav/UI-/basuppgraderingstester: **39/5 PASS**,5,87s.
Arbetskopians unit **531/92 PASS**,38,87s och strict produktionsbuild PASS.
Ren leveransworktree med repositoryts CSS/assetkällor: unit **531/92 PASS**,25,96s
och strict build PASS. Befintlig Vite-varning om bundle >500kB kvarstår.
[Arbetskopians live-matris](live-source.json): **8/8 PASS**.
[Ren produktionsbundles live-matris](candidate/browser.json): **8/8 PASS**, utan
page errors. Ready-kort är visuellt granskade i
[800×600](candidate/skirmish-crown-800-ready.png) och
[1280×720](candidate/skirmish-crown-1280-ready.png). Kostnadsrad, padding/kant och
mitt aktiverar riktig order; direkt knappklick aktiverar fortfarande exakt en.
Kandidaten byggdes från4e4cb59 med exakt de avsedda ändringarna. Slutlig kod-/
text-/länkgranskning och git diff --check PASS. Inga nya CI-/Pages-resultat
hävdas före ny körning.

Användarens style.css, units.mjs, docs/ och fristående filer hålls utanför
leveransen. Samma redan godkända commit/push/publiceringsmandat används för den
färdiga rättningen. Ingen bred kampanjsimulering, kartändring eller delegering.
