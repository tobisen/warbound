# Commitkandidat — 2026-10-26

Exporterad från det granskade Git-indexet utan användarens befintliga style.css,
assets/sources/units.mjs och docs/. Unit546/94 PASS17,54s; riktade sjö-/innehålls-/
pacing-/multiplayerintegrationer34/4 PASS22,19s. Produktionsbygge med strict
TypeScript PASS; befintlig bundlevarning kvarstår. Exporten saknar .git och
visar därför den avsedda Build-fallbacken unknown; faktisk publicerad SHA
kontrolleras separat efter GitHub-deploy.

Chrome800/1280: meny/briefing,16 egna/15 fientliga skepp, Idle Worker antal/
cykling/fokus/ring/aktiva order, betald byggnad/forskning/Tide Runner, Tech Tree,
riktig initial Save/load, fasvis strict Save/load samt victory/defeat PASS.
Finansierad UI-fixture och snabb laglig taktiksimulering används; mänsklig
finbalans eller naturlig speltid hävdas inte. Noll runtime-/assetvarningar.

Data: [browser.json](browser.json). Kommandologgar och PNG-bilder ligger bredvid.
Full regression körs av GitHub före Pages; tidigare lokala fullkörning med
riktade korrigeringar är dokumenterad separat i förälderrapporten.

Loggarnas avslutande whitespace normaliseras för diffkontroll; kommandoresultat och siffror bevaras.

Även den minifierade produktionskandidaten på /warbound/ har kontrollerats
800/1280 med riktiga produktionscallbacks: exakt Build-fallback unknown,
16/15 fartyg, två nya escorts/två Bombards, Sky Owl, Idle Worker, betald
Foundry/Logistics/Tide Runner, riktig initial Save/load, Tech Tree, atlas520
frames och omladdning PASS. [Produktionsdata](production/public.json).
Denna lokala produktionskontroll ersätter inte kontrollen av faktisk publik SHA.

Bilderna native-victory-1280.png och naval-battle-1280.png i denna katalog
återanvändes från den tidigare lokala native-kontrollen. De utgör inte nya
native-genomspelningar av indexexporten; de nya kandidatkontrollerna redovisas
endast i browser.json och production/public.json.

Den kompletta lokala produktionsproben verifierar även canonical startsida,
13 presentation slides/HOLLOWBANE med3 laddade bilder samt PDF200/%PDF.
