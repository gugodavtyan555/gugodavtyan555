"""Square 1200x1200 thumbnails for the Gumroad store grid, made from the 1600x1200 covers.

The full cover is kept (title included) and centred on its own background colour.
Usage: python3 square_thumbs.py   (reads ../products.json and ../site/img, writes ../site/img/sq/)
"""
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
out = ROOT / "site" / "img" / "sq"
out.mkdir(parents=True, exist_ok=True)
for p in json.loads((ROOT / "products.json").read_text())["products"]:
    im = Image.open(ROOT / "site" / "img" / f"{p['id']}.png").convert("RGB")
    im = im.resize((1200, round(1200 * im.height / im.width)), Image.LANCZOS)
    top = (1200 - im.height) // 2
    sq = Image.new("RGB", (1200, 1200), im.getpixel((8, 8)))
    sq.paste(Image.new("RGB", (1200, 1200 - top - im.height), im.getpixel((8, im.height - 8))), (0, top + im.height))
    sq.paste(im, (0, top))
    sq.save(out / f"{p['id']}.jpg", quality=88, optimize=True)
    print("wrote", p["id"])
