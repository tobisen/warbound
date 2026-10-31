# Island Fleets — publiceringskontroll 2026-10-31

`local/`: faktisk Chrome mot byggd, isolerad indexkopia med repositoryts CSS.
800×600 och1280×720: fyra presets, Twinwake-start, betald Marine-kö och
Light Hulls samt native Save/Load. Byggnader/resurser är uttrycklig
komponentfixture; ingen ny full ekonomimatch hävdas. Bilder visuellt granskade.
`unit.log`:563 tester/95 filer PASS. `build.log`: strict TypeScript/build PASS.
Spelkoden är oförändrad från fullregression2264/239 i replayability/full-tests.log.
Separat kopia motiveras av användarens lokala CSS, som bevaras utanför commiten.
Vites befintliga varning om stor bundle kvarstår.

CI, faktisk Pages-Build och publicerade browserbelägg tillkommer efter push.

`factions/`: Crown/Clans/Elves/Dwarves/Goblins i800/1280; betald
fraktionsforskning, sidindelning med högst två rader, Tech Tree och
aktiv Save/Load PASS i produktionsbundlen. Ingen ändrad spelkod.
