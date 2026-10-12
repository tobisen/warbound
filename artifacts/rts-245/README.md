# RTS-245 discovery rendering

Same synthetic frontier woodland fixture before and after: 400 enemy farms,
512 player walls, first hidden then fully visible, five repeats with 30 syncs
and 30 minimap-data calls each. Chrome headless WebGL, viewport1280×720,
internal camera1920×848. This measures synchronous scene visual work, not FPS,
paid AI building, human play or a complete match. Full reveal is test-only.

Median across repeats: first discovery30.8→26.0ms; steady-sync median9.6→9.2ms;
steady-sync p95 across repeats11.6→11.5ms. First cold sample41.5→42.1ms.
The improvement is limited; cold texture/text creation still exceeds a16.7ms
frame. No claim of eliminating every discovery hitch. Raw observations in
before.json/after.json; discovery.png is the actual browser view.

Changes: reuse unchanged fog graphics, coalesce minimap fog cells into runs,
camera-cull tree crowns/enemy visuals with128px overhang margin, and use a set
for existing enemy visual membership. Fog filtering and minimap markers keep
all known objects; camera culling only affects world rendering.

Reproduce after `npm run build` and start preview on4186:
`WARBOUND_PLAYWRIGHT=/absolute/path/to/playwright/index.mjs node scripts/profile-discovery.mjs`
Optional WARBOUND_URL/WARBOUND_CHROME and STAGE. Restart preview after rebuilding.
