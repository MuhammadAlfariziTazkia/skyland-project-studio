# Splits a tall screenshot into viewable chunks: python3 scripts/split-shot.py file.png chunk_height
import sys
from PIL import Image
f, h = sys.argv[1], int(sys.argv[2])
im = Image.open(f)
for i, y in enumerate(range(0, im.height, h)):
    im.crop((0, y, im.width, min(y + h, im.height))).save(f.replace('.png', f'-p{i}.png'))
    print(f.replace('.png', f'-p{i}.png'))
