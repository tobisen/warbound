# RTS-247 campaign inventory and implementation contract

Inventory 2026-10-13: `src/config/campaign.ts` has eight playable mission IDs:
first-steps, forest-watch, the-siege, the-outpost, the-crossing, ridge-convoy,
valley-rescue and coastal-banner. `campaignSeries.ts` offers five race identities
(Crown, Clans, Elves, Dwarves, Goblins), each with those same eight operations,
its own story/enemy and tactical requirements. Therefore there are eight
selectable missions per race (40 race/mission entries), but only eight shared
mission chains, not 40 independently authored maps/objectives. Legacy mixed
campaign and per-race/per-difficulty local progress coexist.

RTS-248 target: **15 playable operations per race**, up from eight. Preserve the
existing eight, append seven separately named/authored race-specific missions:
**75 race/mission entries**, **35 new mission IDs**, **43 total mission IDs**.
Each new operation has its own title, briefing, map, authored ordered goals,
start via an existing paid scenario, defeat on base loss (and courier loss when
applicable), victory only when all phases complete, progression and replay.
No synthetic free bases or rewards substitute for building/production.

| Race | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
|---|---|---|---|---|---|---|---|
| Crown | Border Granaries | Lanterns in the Wood | Three Roads | The Returning Envoy | Tidal Supply | The Allied Foothold | Oath at Dawn |
| Clans | Exiles' Camp | Ashwood Trails | Stand at Redwater | The Broken Chain | Across the Reeds | Warband Confluence | A Shore of Our Own |
| Elves | Rootward Haven | Hidden Canopies | Guard the Springs | The Lost Circle | Moonlit Channel | Roots Reunited | Heartwood Vigil |
| Dwarves | Stonebreak Depot | Prospectors' Ridges | Hold the Switchbacks | The Last Courier | Iron Tide | Twin Holds | The Road Reopened |
| Goblins | Ledger Outpost | Surveyors' Cut | Tollgate Defense | Recover the Witness | Contraband Passage | Two-Sided Bargain | The Charter Reclaimed |

Map/goal contract: each race's seven new missions distribute over at least five
maps. Inland operations use different authored forest, ridge, river and plains
regions, not rectangular empty copies. New missions share RTS-244 terrain and
harvestable forests; existing operation guard/courier/capture coordinates are
retained where those scenarios are reused and checked against the terrain.
Expansion objectives require an actual completed paid player base; exploration
uses reachable land clearings and distinct finite resource routes. Wave missions
start with preparation/exploration, followed by finite existing waves, not
unlimited filler. Transport missions require dock/transport and actual land
combatants at the far shore; fleet and air/siege/research requirements combine
existing systems in later operations. Escort/rescue use their actual supported
courier/guard/camp rules, never a position-only substitute.

Implementation must expose unique mission selection even when two missions
share an underlying scenario. Per-race lists must never leak another race's new
missions. Preserve old eight completions and unlock operation9; legacy mixed
campaign remains eight. New saves validate race/mission/map/phase identity.

Verification: for all35 new missions, check briefing/start, each unmet/met goal,
coordinate terrain/reachability (including naval landing), phase ordering,
Save/load between phases, victory/base defeat/courier defeat where applicable,
progression and fresh replay. Component phase fixtures may establish explicit
preconditions but must not be described as paid full playthroughs. Run combined
existing/new campaign regression after implementation, then full regression,
unit, strict build and diff. Browser native800/1280: unique selection, briefing,
launch/reload/replay and representative rendered inland/naval/operation views.
Report human playtime/balance/audio as unverified unless actually reviewed.
