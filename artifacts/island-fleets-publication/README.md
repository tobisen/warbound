# Island Fleets — publiceringskontroll 2026-10-31

`local/`: faktisk Chrome mot byggd, isolerad indexkopia med repositoryts CSS.
800×600 och1280×720: fyra presets, Twinwake-start, betald Marine-kö och
Light Hulls samt native Save/Load. Byggnader/resurser är uttrycklig
komponentfixture; ingen ny full ekonomimatch hävdas. Bilder visuellt granskade.
`unit.log`:563 tester/95 filer PASS. `build.log`: strict TypeScript/build PASS.
Spelkoden är oförändrad från fullregression2264/239 i replayability/full-tests.log.
Separat kopia motiveras av användarens lokala CSS, som bevaras utanför commiten.
Vites befintliga varning om stor bundle kvarstår.

## Faktisk publicering

Leveranscommit4ddbf39 / version0.8.0 är pushad och publicerad på
[Warbound](https://tobisen.github.io/warbound/).
[Actions41191431011](https://github.com/tobisen/warbound/actions/runs/41191431011)
är success. `ci.json` innehåller faktisk SHA, jobb och steg;
`ci-summary.txt` visar fullregression2264/239 (1488,60s), strict TypeScript,
spelbuild och presentationsbuild. Pages-deploy PASS.

`published/`: faktisk Chrome mot Pages i800×600 och1280×720, rätt Build4ddbf39,
fyra presets, Twinwake-start, betald Marine-kö/Light Hulls och native Save/Load.
Bilder visuellt granskade; samma uttryckliga byggnadsfixture som lokal kontroll.
`published-assets.json`: atlas-PNG, atlas-JSON och manifest HTTP200 och exakt
SHA256-matchning mot den committade leveransen.

Slutlig dokumentations-/beläggspush använder `[skip ci]`. Spelkoden är oförändrad,
Build4ddbf39 förblir publicerad; inga nya kodchecks för uppföljningsfilerna.

`factions/`: Crown/Clans/Elves/Dwarves/Goblins i800/1280; betald
fraktionsforskning, sidindelning med högst två rader, Tech Tree och
aktiv Save/Load PASS i produktionsbundlen. Ingen ändrad spelkod.
