# Kommersiell kvalitet och releasegrindar

2026-11-03. Endast produktriktningen är godkänd i WBC-002; implementerings-,
rättighets- och kvalitetsgrindarna är fortsatt **öppna för Windows1.0**.
Historiska browser-/CI-PASS i [auditen](TECHNICAL_AUDIT.md) räknas som
regressionsunderlag, inte nya Windows- eller mänskliga godkännanden.
Rotens [releasechecklista](../../RELEASE_CHECKLIST.md) behålls för browserhistorik.
[BACKLOG](../../BACKLOG.md) anger taskägare/beroenden; [scope](RELEASE_SCOPE.md)
anger vad som faktiskt ska stödjas.

## Rimlig testkostnad

| Ändring / tillfälle | Kontroller |
| --- | --- |
| Enbart dokumentation | Läs konsekvens/källhänvisningar, kontrollera lokala länkar/taskfält/beroenden och `git diff --check`. Ingen ny testkod/build/fullregression. |
| Gameplayregel | Riktade unit- och berörda MatchState/Save-integrationer. Kör relevant kort matchscenario när ekonomi/combat/AI/navigation/mål/tid påverkas. |
| UI/input/grafik | Relevanta komponent-/assetchecks och faktisk mus-/tangentkontroll i800×600/1280×720; representativ bildgranskning före spridning. Ingen bred kampanjsimulering för en ikon/CSS-ändring. |
| Ljud | Manifest/fil/decode/mixteknik och faktisk mänsklig lyssning på ändrat material. Peak/hashes/playback är inte lyssningsgodkännande. |
| Desktop/storage/install | Riktade bridge-/validerings-/felfall och packad Windowsapp. Browser-Playwright kontrollerar DOM/gameplay men bevisar inte nativeinstaller/filsystem/fokus. |
| Före kodcommit | Enligt AGENTS: hela uniturvalet, build med strict typecheck, berörda integrationer, diff och review; upprepa bara efter relevant ändring/fel/osäkerhet. |
| Milstolpe: desktopfoundation, demo, feature freeze och RC | Full `npm test`, strict build och diff på identifierad kandidat; samlad kampanjregression när kampanjändringarna är klara. Exakta SHA/OS/fixtures och fel sparas. RC kräver dessutom installation/offline/mänsklig acceptans. |

`node scripts/test-unit.mjs --list` validerar klassificeringen utan att köra
tester; nuläge92 unit/154 integrationer. `npm run test:unit` kör isolerade
filer; riktat `npm test -- <fil...>` berörda integrationer; `npm test` allt.
Byggkontrollen inkluderar typecheck, så `npm run typecheck` behöver inte
upprepas separat. Nya blandade MatchState/Save-filer hör till integration.
Befintliga browser-/profilscript i scripts återbrukas; inför ingen dyr helt
ny generell testplattform utan ett konkret otäckt behov.

## Produkt/IP — WBC-002/012–025/036/046/049

- [x] WBC-002: användaren godkänner Humans/Orcs/Elves/Dwarves/Goblins, tio kuraterade operationer/sex befintliga skirmishkartor, Windows/Steam, Phaser/TypeScript/Vite, Electron-PoC först, offline/lokal SaveLoad/engelska, optional Cloud/achievements. Inga multiplayer/backend/live services; initialt externt utgiftstak10 000SEK,129SEK indikativt, Q3 2027 villkorat. Detta är endast produktbeslut.
- [ ] Exakta tio uppdrags-/sex kart-ID:n och legacydata-policy, AI/OS/minspec, tillgänglig arbetstid och slutligt namn fastställda i respektive task. Externa kostnader ryms inom återstående10 000SEK eller separat uttryckligt godkännande finns; inga kostnadsposter eller avtal beställs av scopebeslutet.
- [ ] Namn-/varumärkesprövning och egen lore/silhuett/terminologi dokumenterade; ingen ”Warcraft tribute”-marknadsföring utan separat bedömning.
- [ ] Varje distribuerad fil har källa, rättighetsbevis, licens och beslut; CC-BY-SA-derivat/credits, modellnotiser och bibliotek följer med offline. Röst63/81-konflikten löst i slutpaketet.
- [ ] Ägaren godkänner artwork/animationsstandard och faktiskt ändrat ljud. Historisk ljudacceptans bevaras men omfattar inte automatiskt senare nya klipp.
- [ ] Engelska texter, tutorial och ärliga systemkrav godkända. AI-survey/content-/åldersuppgifter motsvarar faktiskt innehåll, även oåtkomliga medföljande assets.

## Gameplay och mänsklig acceptans — WBC-026–045/054/057

- [ ] Varje ras kan med vanlig betald ekonomi samla, bygga, forska, producera, försvara/anfalla och avsluta en normal skirmish; inga resurscheats används som bevis för nåbar ekonomi.
- [ ] Alla25 ordnade raspar (inklusive mirror) täcks av korta tekniska scenarier; mänskliga matcher täcker minst varje ras som spelare och motståndare samt minst en mark-, luft-/magikombination och sjölandning. Ingen slutsats om jämn balans från fixture-vinster.
- [ ] Beginner/Easy onboarding och Normal/Hard prövade av människor; inga osynliga regler eller AI-kunskapsläckor. Fördelar/startbudget/tempo dokumenterade.
- [ ] Varje släppt kampanjuppdrag har tekniskt godkänd start, alla mål/faser, seger/förlust, Save/Load mellan faser, restart/next/replay och korrekt ras/difficultyprogression. Samlad kampanjregression efter slutändringarna.
- [ ] Varje av10 operationer mänskligt genomspelad av minst en testare; minst två nya spelare provar första operationen. Tid, stopp, svårighet och exitfrågor loggas; gameplaysekunder skiljs från väggtid.
- [ ] Sex kartors starter, verkliga resurser, rutter, expansioner, fog och hamn/landstigning verifierade. AI kan betala, scouta, expandera, landa och vinna/förlora utan permanent låsning.
- [ ] Minst8 externa demotestare; minst6 av8 når första meningsfulla strid/missionmål utan handledning. Detta är föreslagen intern grind, ingen statistisk marknadsgaranti. Missad grind leder till förbättring/omprov eller daterat ägarbeslut före release.
- [ ] Faktiska mitt-/kant-/kostnads-/knappklick ger exakt en betalning; disabled blockerar även efter update/load. Tangentbindningar kan användas på vanligt tangentbord och återställas; inga F13+-krav för grundfunktioner.
- [ ] Ägarskap/HP/orderfel är begripliga utan enbart färg/ljud. Text och fokus är läsbara vid avtalad skala; inga klippta actions vid800/1280 och Windows-DPI.

## Desktop, sparningar och prestanda — WBC-003–011/030/035/058

- [ ] Faktisk stödd Windows x64 på namngiven minspec och en starkare referensdator; retailstandardanvändare, ingen Node/devserver. CI-runner ersätter inte dessa prov.
- [ ] Ren unpacked/installer/Steamdepot startar, paketerade PNG/JSON/audio/credits laddas, inga runtime-/assetfel. Fristående första start fungerar med nät avstängt. Steam Offline Mode prövas **efter** normal onlineinstallation/inloggning; ingen airgapped Steaminstallation utlovas.
- [ ] Fönster/fullscreen, resize,800/1280/1920,125/150/200% DPI, Alt-Tab, minimize, sleep/resume, förlorat fokus och skärmbyte: inga hängande drag/order, ljuddubblingar eller okontrollerad gameplaycatch-up.
- [ ] Beslutade manuella slots och fastställd autosave-/backup-policy återfinns efter processdöd, uppgradering och OS-omstart. Återställning/import bevarar original; ingen skrivning i installationskatalogen.
- [ ] Trunkerad/felaktig/framtida/överstor save, disk full, saknad åtkomst och avbruten atomisk skrivning ger begripligt fel utan att förstöra senaste giltiga save. Match, campaignledger, preferences och highscore får inte blandas mellan demo/full eller profiler.
- [ ] Stödda äldre Save-versioner har riktiga fixturer och roundtrip; gammal kampanjprogression/ID-policy är beslutad. Browserimport är frivillig och validerad. Tysta schemaresets är blockerare.
- [ ] Reproducerbar normal budget fastställd i WBC-003: föreslaget60FPS-mål/p95≤33,3ms och inga återkommande interaktiva stopp>100ms, på vald minspec och namngiven laglig workload. Mät cold/start/group-order/contact/fight separat; historiskt183,3ms initialstall är inte godkänt bortförklarat av medianen.
- [ ] Minst två2h-soaks, en landmatch och en kustmatch med maximalt avtalat AI-stöd, riktiga Save/Load/omstarter och minnes-/assetmätning. Inga hängningar, blockerade slutlägen eller växande listener-/ljudläckor. Extrema arméfixtures utanför normal supply redovisas separat.
- [ ] Paketstorlek/kallstart/RAM/VRAM/ljuddecode mätta; gränser spikas efter baseline, inga uppfunna minspec-löften. En konkret regression utreds före chunking/cacher/fler abstraktioner.
- [ ] Renderer är isolerad, IPC/path/input validerade, remote navigation/nya fönster begränsade, CSP/notices och låsta beroenden granskade. Lokal logg är begränsad och exporteras frivilligt utan automatisk sändning.
- [ ] Install→update→launch→load→uninstall/reinstall provat; userData behålls/kan tas bort med uttryckligt val. Eventuell signering/SmartScreen bedömd på verklig distributable; inte beskriven som generellt Steamkrav.

## Steam, RC och launch — WBC-046–060

- [ ] Ägaren har slutfört partneridentitet/bank/skatt, avgift och avtal. Aktuella väntetider/reviewdatum verifierade i partnerkontot; checklistans webblänkar är inte ett konto-godkännande.
- [ ] Store page innehåller bara levererade features, korrekt singleplayer/Windows/languages/AI/ratings, riktig gameplaymedia och klarerat capsule/library-material. Coming Soon/reviewkrav uppfyllda.
- [ ] Demo/full har rätt app-/depot-/launchkonfiguration, isolerade saves och tydlig övergång. Ingen beta-/Steam SDK-nyckel eller privat testfil i artefakten.
- [ ] Optional achievements/Cloud är avstängda/inte annonserade om de inte separat implementerats och verifierats. Offline får inte bero på Steam API eller overlay.
- [ ] Feature freeze; inga öppna P0 eller blockerande dataförlust-/progressions-/krasch-/rättighetsfel. Övriga kända fel har uttrycklig ägaracceptans med påverkan.
- [ ] Full regression, build/strict typecheck, desktop/install-/offline-/saveprov och diff/review passerar för identifierat RC. Manifest visar git-SHA, version, wrapper/runtime, paketSHA256, Steam build/depot-ID och fixturevillkor. Nya relevanta ändringar kräver relevanta omprov.
- [ ] Valve page/buildreview klart; ägaren godkänner pris, datum, lansering och supportberedskap. Faktisk Steaminstallation av publicerad build kontrollerad med hash/build-ID, launch, reload/load och offline. Publicering hävdas först efter faktisk verifiering.
- [ ] Patch/rollbackplan provad; supportadress, kända problem och sparningsbackupinstruktion finns. Första2 veckornas hotfixkapacitet reserverad.

En nära förestående deadline ersätter ingen grind. Ändras scope krävs en
synlig uppdatering av scope/backlog/acceptans; lämna inte en öppen ruta som
underförstått godkänd. Ingen ny kodverifiering körs för denna dokumentleverans.
