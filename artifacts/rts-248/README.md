# RTS-248 — campaign expansion and regression repairs

Inventory/target was committed in RTS-247 before implementation. The five racial
series grow from 8 to 15 selectable operations each (40→75 race/mission entries).
The eight preserved chains plus 35 exclusive racial IDs give 43 IDs, not 75
independently authored maps. The legacy mixed campaign remains eight operations.
See [mission inventory](missions.md) and [original plan](../rts-247/campaign-plan.md).

Each new operation has a briefing, faction start, five to seven ordered goals,
base/courier defeat where appropriate, victory, unlock progression and replay.
The new expansion goal requires a living completed additional base at its authored
clearing. Existing paid construction, production, transport, research, waves,
escort, rescue and combat systems are reused. All five naval expeditions use
Islands after coordinate auditing found isolated Coast objectives; their role
requirements and briefings differ. Every race uses at least five maps.

`campaignExpeditions.test.ts` checks all 35 chains and coordinates: 200 phase
transitions, 235 initial/transition Save roundtrips, one-step advancement,
defeat, progression, replay and foreign-series rejection. These are explicit
component fixtures; supplied unit/building preconditions are not paid human
playthroughs. Older paid campaign controllers remain separate regression checks.
Save75 preserves previous geometry and adds strict campaign identity validation.

The full regression exposed blocked older mission/discovery/boss clearings in
the denser forest. New matches use `woodlands-connected`: real finite trees,
small glades and terrain-following trails connecting objectives, discoveries,
mines and strongholds. `woodlands` and earlier saves retain their own geometry.
Trail planning is cached configuration work, not an every-frame map update.
The enemy resource ledger uses the same 1e-6 rounding tolerance at its spending
bound as at its balance equation. Legacy tests construct historical geometry
and remove fields absent from their asserted versions. Fog tests explicitly
establish hidden cells instead of assuming the old shorter radius.

The expanded paid enemy workforce alternates baseline wood/gold assignments,
while resource shortages still bias workers toward the needed stock. AI can build six farms and multiple producers/outposts, subject to its paid
economy and actual building space. The final Plains96 diagnostic reaches and damages the player base after305
gameplay seconds; the original400-second pressure regression bound is retained.
[Paid pressure evidence](ai-pressure.json) records the ordinary economic ledger.
The separate all-role casualty fixture uses a2200-tick bound for paid regional
technology and replacement (formerly1400); every required role is still asserted.
These checks do not establish satisfying pacing or balance.

[campaign-browser.json](campaign-browser.json) records actual Chrome 800×600/
1280×720 selection, 15 mission entries, all five factions, correct IDs/maps,
briefings and actual Save/load. The fresh camera includes the base and workers
after DOM/Phaser layout settles. Loaded cameras remain saved. Minimap fog edges
use shared integer pixel bounds to eliminate fractional-row alpha seams.
[maps-browser.json](maps-browser.json) and adjacent PNGs show fully revealed
injected map overviews/closeups, not naturally explored victories.

Performance results remain in [RTS-245](../rts-245/README.md): identical artificial
400-building/512-wall discovery fixture, median first discovery30.8→26.0ms,
steady9.6→9.2ms. Cold first call41.5→42.1ms remains a limitation. These sync/minimap
CPU measurements are not full-frame FPS, paid-base gameplay or human balance.
No new art, voice recording, listening assessment, version bump or hosting service
is introduced. Human mission length, difficulty and enjoyment remain unverified.

Reproduce the campaign browser check against a production preview with:

```sh
WARBOUND_PLAYWRIGHT=/path/to/playwright/index.mjs \
WARBOUND_URL=http://127.0.0.1:4186/warbound/ \
node scripts/check-campaign-expeditions.mjs
```

`WARBOUND_CHROME`, `WARBOUND_OUT` and optional `WARBOUND_UI_CASES` configure the
browser executable, output directory and operation filter. The script seeds
completed progress explicitly to inspect replay selection; it does not earn wins.
[Save74 compatibility](save74.json) confirms preserved woodland/region geometry.
Final checks and final connected-map renders are recorded in HANDOFF/DEV_LOG.
verification.json captures local checks before the2048f8b push; final CI/Pages
status is recorded separately in HANDOFF after actual deployment.

Final code2048f8b plus CI deadline fixes e268428/7fa8871 were published by
[green CI38326586747](https://github.com/tobisen/warbound/actions/runs/38326586747).
Public Build7fa8871 passed actual home/reload/skirmish800/1280/1920 and all-five-
races campaign selection/Save-load800/1280. Final status and temporary public
browser evidence paths are in [HANDOFF](../../HANDOFF.md). This final evidence
update is Markdown only; verification.json retains its original local snapshot.
