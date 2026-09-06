import json
from pathlib import Path
from PIL import Image, ImageStat

source_path = Path('app/data/arena-photos-source.json')
records = json.loads(source_path.read_text())

for record in records:
    path = Path('public') / record['url'].lstrip('/')
    with Image.open(path) as image:
        image.thumbnail((160, 160))
        image = image.convert('RGBA')
        background = Image.new('RGBA', image.size, (255, 255, 255, 255))
        background.alpha_composite(image)
        record['rgb'] = [round(value) for value in ImageStat.Stat(background.convert('RGB')).mean]

Path('app/data/arena-photos.json').write_text(json.dumps(records, indent=2) + '\n')
print(f'Calculated colors for {len(records)} images.')
