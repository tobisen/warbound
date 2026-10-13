# Wildlife recordings — RTS-251, 2026-10-13

Inventory: deer, rabbit, fox (`src/config/wildlife.ts`). Former single synthetic
calls replaced by three different recorded excerpts each. These are field/pet
recordings, not synthesized animal placeholders. Rabbit recording is domestic;
no claim that it documents a wild rabbit's usual reaction to a person.

| Runtime files (also masters under assets/audio/) | Recordist / copyright | Source | License |
| --- | --- | --- | --- |
| animal-deer.wav, animal-deer-2.wav, animal-deer-3.wav | Lawrence Shove, 1963 / The British Library Board | [Red Deer, W1CDR0001424 BD3](https://commons.wikimedia.org/wiki/File:Red_Deer_(Cervus_elaphus)_(W1CDR0001424_BD3).ogg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| animal-fox.wav, animal-fox-2.wav, animal-fox-3.wav | Aubrey John Williams, 1977 / The British Library Board | [Red Fox, W1CDR0001529 BD12](https://commons.wikimedia.org/wiki/File:Red_Fox_(Vulpes_vulpes)_(W1CDR0001529_BD12).ogg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| animal-rabbit.wav, animal-rabbit-2.wav, animal-rabbit-3.wav | kessir, 2016 | [Rabbit oinks and squeaks, 372075](https://freesound.org/people/kessir/sounds/372075/) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |

Source/licensing pages inspected on2026-10-13. British Library recordings carry
VRT ticket2015111010010706; source credits name recordist and copyright holder.
Rabbit downloaded from the source's HQ MP3 preview (same CC0 sound).
Original OGG/MP3 and decoded mono24kHz PCM masters in assets/audio/wildlife-sources/.
All deer/fox derivatives above are distributed under CC BY-SA4.0. No endorsement
is implied. Export script documents exact offsets, DC removal, normalization and
20ms fades; no pitch shifting. public/audio/wildlife-manifest.json records every
file, author/license, hash, cut and format. Browser decoding used Chrome's
OfflineAudioContext; PCM masters allow export with Python standard library alone.

Actual auditory quality/species recognition has NOT been assessed by the agent.
Browser playback/click/cooldown evidence is technical, not listening approval.
