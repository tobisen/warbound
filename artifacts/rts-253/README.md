# RTS-253 — Three five-player skirmish maps

| Map | Size | Slots | Choices |
| --- | --- | --- | --- |
| Lakehold Circuit | Small,64×64 (2048²px) | 5 | Central hold; north/south circuits around twin lakes; outer mines |
| Five Passes | Medium,96×96 (3072²px) | 5 | Inner ridge openings; outer flanks; contested wooded glades |
| River Crown | Large,128×128 (4096²px) | 5 | Dry crossings between broken river arms; long bank flanks; central groves |

Own hand-authored shape/start/resource configs in src/config/skirmishMaps.ts,
using the existing organic terrain, finite trees, resource, fog and AI systems.
Every start is separated by>650px, has wood and gold within600px and a valid
base/worker exit. Land routes were checked with actual forest obstacles; water
accepts naval bodies and rejects land bodies, land rejects naval bodies. Inland
waterways are local lakes/river arms, not a continuous transport ocean.

Automated: skirmishMaps6/1 PASS37.27s;12 combinations of maps/1–4 AI, paid
construction, bounded unique starts, resources, terrain/route/domain rules,
Save/load and restart. Additional region/reference compatibility6/2 PASS
(55 other cases skipped by explicit selection). Legacy expanded128×128 tests
retain their original nine maps; new size-specific coverage replaces that
historical assumption for these three. No campaign definitions changed.

Browser: scripts/check-five-players.mjs with W2T_MAPS=lakehold,fivepasses,rivercrown
and W2T_ARTIFACTS=artifacts/rts-253.24 cases (3 maps ×4 counts ×800/1280):
separate opponent choices, map capacities, physical starts, fog/minimap/legend,
real local Save with status check and HP changed before load, restart, no runtime
errors. browser.json records actual results. overview-*.png use explicitly
revealed fog and overview zoom solely for visual inspection, not normal gameplay.
All three overviews visually inspected; actual fog retained in normal captures.

No human match/balance/timing/playability assessment is claimed. Sound playback
in RTS-251 is technically verified; actual auditory recognition/mix assessment
remains unverified. Full batch regression and final unit/build results are in
DEV_LOG/HANDOFF, separate from previous release/CI/Pages evidence.

Final discovery check: Lakehold's three initially inaccessible discovery sites
were moved to body-safe glades. Explicit discovery/terrain identity + all new
map acceptance8/3 PASS28.36s (26 other cases explicitly skipped). Lakehold's eight
browser combinations repeated after that change; browser.json combines those
final eight with the16 unchanged Five Passes/River Crown cases. Latest Lakehold
raw report remains in ../rts-253-lakehold-final/browser.json. Final overview here
is the updated capture and was visually inspected again. Older attempts at the
full regression were interrupted on concrete review/test findings; only the
completed final run in DEV_LOG/HANDOFF is a full PASS claim.
