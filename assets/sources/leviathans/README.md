# Original large-unit assets — 2026-10-31

Built-in `image_gen` was used, with the local `imagegen` skill; no API CLI,
external character art or raster placeholders. Project-bound final sources:

- [capital.png](capital.png): Storm Ark, Human capital broadside warship.
- [zeppelin.png](zeppelin.png): Brass Leviathan, Goblin bombardment airship.
- [behemoth.png](behemoth.png): Ironback Behemoth, Orc armored dinosaur.

Each source is an eight-direction × four-action transparent sheet. Directions:
east, southeast, south, southwest, west, northwest, north, northeast. Actions:
idle, moving, attacking, dying. Source action/direction paintings are distinct;
the existing frame exporter adds four deterministic motion/lighting/fade phases
per action. They are not four independently painted temporal frames.

The final prompt set specified chunky, high-contrast, stepped pixel art for an
original medieval fantasy RTS; a consistent elevated three-quarter camera;
all 32 cells populated at the same scale/anchor; transparent padding and no
text, labels, grid lines or scenery. Unit-specific prompt details:

- Storm Ark: massive dark iron-and-oak hull, twin cannon batteries, two squat
  armored towers, brass trim, navy pennants and a glowing storm-crystal mast.
  Moving wake/pennants; cannon muzzle flashes/recoil; broken sinking wreck.
- Brass Leviathan: huge ochre/brass cigar balloon, dark green fabric, red
  pennants, iron gondola, two propellers, bomb chute and exposed engine.
  Engine exhaust/turning propellers; a falling bomb; torn collapsing envelope.
- Ironback Behemoth: huge green four-legged ceratopsian with broad frill,
  three ivory horns, slate iron plates, saddle howdah and red clan pennant.
  Changed leg/tail pose; horn thrust/stomp dust; collapsed beast, without gore.

Export with `node scripts/export-leviathans.mjs`. The game consumes
[leviathans-atlas.png](../../../public/assets/leviathans-atlas.png) and
[leviathans-atlas.json](../../../public/assets/leviathans-atlas.json): 768 frames
at 96×96. Existing `units.mjs`, other atlases and user CSS were not regenerated.

`python3 scripts/export-leviathan-audio.py` creates three distinct layered PCM
cues from existing credited recorded materials, using only Python's standard
library. [audio.json](audio.json) records source files, original credits,
licenses, pitch/delay/gain layers and SHA256 hashes. The existing project
material credits apply; these mixes introduce no additional licensed source.
Runtime files are `public/audio/large-capital.wav`, `large-zeppelin.wav` and
`large-behemoth.wav`. The loader deliberately uses PCM for these three cues.

Native game screenshots at 800×600 and 1280×720 were inspected. Automated
PCM checks verify non-silence, distinct hashes, format and unclipped peaks;
no new human listening or long-match balance approval is claimed.
