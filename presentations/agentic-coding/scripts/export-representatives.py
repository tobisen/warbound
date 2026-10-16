"""Crop existing game atlas frames without painting or generating assets. Requires Pillow."""
import json
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[3]
out = root / 'presentations/agentic-coding/public/images'
for atlas, kind, frame in [('units', 'unit', 'soldier-player-se-idle-0'), ('buildings', 'base', 'base-player-complete')]:
    data = json.loads((root / f'public/assets/{atlas}-atlas.json').read_text())
    image = Image.open(root / f'public/assets/{atlas}-atlas.png')
    for name, prefix in [('humans', ''), ('orcs', 'clans-'), ('elves', 'elves-'), ('dwarves', 'dwarves-'), ('goblins', 'goblins-')]:
        f = data['frames'][prefix + frame]['frame']
        image.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h'])).save(out / f'representative-{kind}-{name}.png')
