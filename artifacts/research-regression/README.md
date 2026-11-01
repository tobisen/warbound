# Forskningsregression i Warbound 0.9.0 — 2026-11-01

Lokalt uppdrag, utan commit, push, versionsändring eller publicering. Baseline:
`8d1b51d` / produktkod `02740d1`. Befintliga användarändringar bevaras.
Användaren har därefter beställt commit/push/publicering; följ den separata
[publiceringsrapporten](../research-publication/README.md) för dessa nya belägg.

## Reproducerad grundorsak

1. Starta Skirmish och låt den ursprungliga huvudbyggnaden leva.
2. Påbörja en extra huvudbyggnad och markera dess ofärdiga byggplats.
3. Försök starta Worker Tools.

Före rättningen visade kortet **Completed main building**, men spärrade knappen
med **Construction unfinished**. `researchReason` returnerade samtidigt `null`:
den färdiga ursprungsbasen uppfyllde kravet. Browserregressionen föll med:

```text
Completed original base ignored:
disabled=true, reason="Construction unfinished", order=null
```

UI:t lade till ett separat krav på den markerade basen, medan forskning är ett
gemensamt spelarjobb. Felet berörde **Worker Tools I, II och III för alla fem
raser**. Kravet var redan uppfyllt vid en annan egen byggnad. Inget motsvarande
fel kunde reproduceras för övriga aktuella forskningar i den kontrollerade matrisen.

Alla forskningskort använder nu samma `researchReason` som knappens grundkontroll
och den betalda ordern. Forskningsknapparnas slutliga `disabled` beräknas från
det aktuella kortet, utan kvarvarande spärr från en tidigare rendering.
`completedPlacementBuildings` ger samma färdiga, levande byggnadsroller till
matchens teknikbild, forskningskraven och pågående forskningsjobb.
`researchPrerequisites` delar deklarationerna med Tech Tree. Kampanjens befintliga
akademispärr ger nu ett uttryckligt kampanjbesked för attack/försvar II.

## Inventering av aktuella krav

Alla byggnader i tabellen måste vara egna, levande och färdigbyggda. En giltig
instans räcker oavsett position eller vilket annat exemplar som är markerat.
Alla forskningar behåller kostnad, tid, pågående jobb/kö och maxnivå.

| Forskning | Byggnadskrav | Tidigare teknik / rasvillkor |
| --- | --- | --- |
| Worker Tools I–III | Valfri färdig huvudbyggnad | Föregående verktygsnivå; alla raser |
| Attack I / Defense I | Forge | Alla raser, rasens eget namn/recept |
| Attack II / Defense II | Forge + Academy | Respektive nivå I; kampanjens Academy-upplåsning |
| Cavalry Armor | Forge + Stable | Alla raser |
| Healer Training | Forge + Academy | Alla raser |
| Scout Optics | Forge + Aviary | Alla raser |
| Submarine Design | Forge + Academy | Alla raser |
| Naval Logistics | Naval Foundry | Humans / Dwarves |
| Convoy Service | Naval Foundry | Humans |
| Assault Ramps | Naval Foundry | Orcs |
| Tidewatch | Naval Foundry | Elves |
| Siege Shells / Precise Shells | Naval Foundry + Siege Works | Dwarves; ömsesidigt exklusiva |
| Volatile Torpedoes | Naval Foundry | Goblins |
| Light Hulls / Reinforced Bulkheads | Naval Academy | Alla raser; ömsesidigt exklusiva |
| Coastal Gunnery | Naval Academy | Alla raser |
| Naval Optics | Signal Tower | Alla raser |
| Repair Cranes | Drydock | Alla raser |
| Amphibious Drill | Marine Barracks | Alla raser |

Ingen aktuell forskning har ett separat numeriskt basnivåkrav utöver dessa
beroenden. Byggande av Stable/Aviary kräver bas II; Siege Works/Naval Foundry
kräver bas II + Forge. Academy kräver Forge + båda militära nivåerna I.
Dessa byggkrav består. Bas III uppfyller bas II via befintlig `>=`-bedömning;
uppgradering byter inte byggnadens interna roll. Forge och Academy har inga
egna byggnadsuppgraderingsnivåer. Naval Academy är en separat byggnad.

Kampanjens `missionContent` filtrerar fortsatt teknik. Militär forskning
introduceras i operation 3 och Academy från operation 6; senare teknik följer
de authored missionreglerna. Save80-formatet ändras inte; policy härleds fortsatt
vid Load från kampanjidentiteten. Rasnamn och atlasvarianter används inte som
interna kravnycklar. Inget fel i rasernas rollmappning hittades.

## Ny verifiering

- [Regressionstester](../../src/gameplay/researchRequirements.test.ts): 16 tester
  omfattar alla raser och alla tillgängliga forskningar/nivåer. Avslag före
  färdig kravbyggnad, betald start efteråt, fortskridande/slutförande, dublettavslag,
  flera baser/akademier, Save/Load, resurser, exklusivitet och kampanjspärrar.
- Kravbyggnaden i det separata basfallet ligger minst **480 px från ursprungsbasen**.
  En färdig extra Academy räcker trots en ofärdig primär Academy och ytterligare
  en ofärdig kopia. Sista giltiga byggnadens förlust ger rätt byggnadsnamn som krav.
- [Browsertest](../../scripts/check-research-requirements.mjs),
  [resultat](lifecycle.json): lokal Chrome i native **800×600 och 1280×720**, alla
  fem raser. Forskningsstart görs genom Playwright-klick på vanliga spelknappar.
  Riktiga betalande placement-/workerconstruction-funktioner bygger byggnaderna;
  tiden stegas uttryckligen. Endast resursfusket finansierar bankerna. Inga
  forskningsnivåer injiceras i browserförloppet. Varje alternativ i exklusiva
  teknikpar provas från en separat snapshot.
- Save/Load görs med spelets Menu → Save → Load → Resume, både med ofärdig
  kravbyggnad och aktiva forskningsjobb. Skirmish och en authored kampanjoperation
  provas för varje ras. Kampanjens completed-ledger är en uttrycklig fixture;
  upplåsningar/byggnader/forskning följer därefter vanliga regler.
- [800 px](crown-other-base-800.png) / [1280 px](crown-other-base-1280.png):
  representativ visuell granskning. Worker Tools är **Ready** medan den markerade
  extra basen har byggtid kvar. Basnivåerna I→II→III, verktygsnivåerna I→II→III,
  Forge före/efter färdigställande och forskning II vid fjärrakademin verifieras.
- Riktat befintligt/nytt urval: **196 tester / 16 filer PASS**. Kompletterande
  fjärrbas-/AI-policy-/basuppgraderings-/faktionssave-urval: **35 / 4 PASS**
  (de 16 nya testerna ingår i båda urvalen).
- `npm run test:unit`: **531 / 92 PASS**. Det nya testet klassificeras som
  integration; `node scripts/test-unit.mjs --list` validerar det disjunkta manifestet.
- `npm run build`: **PASS**, inklusive `tsc --noEmit` strict. Befintlig Vite-varning
  om bundle >500 kB kvarstår. `git diff --check`, kod-/textgranskning och lokala
  filreferenser **PASS**. Slutlig browseromgång: **10/10 PASS**, utan page errors.

Det första nya Save-testet använde en bank utan motsvarande resursledger och
avvisades korrekt av Save-valideringen. Fixturen rättades till det befintliga
resursfusket; Save-reglerna försvagades inte. De slutliga urvalen ovan passerar.
Ingen ny full kampanj-/matchsimulering, full `npm test`, CI, Pages eller mänsklig
balans-/ljudgranskning ingår i denna riktade regressionskontroll. Historiska
releasebelägg i andra dokument ersätter inte kontrollerna ovan.
