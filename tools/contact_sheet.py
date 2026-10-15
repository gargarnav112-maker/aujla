#!/usr/bin/env python3
"""Tile frames into a labelled contact sheet.
usage: contact_sheet.py OUT.png COLS THUMB_PX FPS IMG [IMG...]
Frame number is parsed from the file name (…-0123.jpeg / element-123.png)."""
import re
import sys
from PIL import Image, ImageDraw, ImageFont

out, cols, px, fps = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), float(sys.argv[4])
files = sys.argv[5:]
ims = []
for f in files:
    im = Image.open(f).convert("RGB")
    im.thumbnail((px, px * 2))
    m = re.findall(r"(\d+)", f.rsplit("/", 1)[-1])
    ims.append((im, int(m[-1]) if m else None))
w = max(i.width for i, _ in ims)
h = max(i.height for i, _ in ims)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w, rows * (h + 22)), (24, 24, 24))
d = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 14)
except OSError:
    font = ImageFont.load_default()
for n, (im, fr) in enumerate(ims):
    x, y = (n % cols) * w, (n // cols) * (h + 22)
    sheet.paste(im, (x, y + 22))
    if fr is not None:
        d.text((x + 4, y + 3), f"f{fr}  {fr / fps:.3f}s", fill=(255, 220, 120), font=font)
sheet.save(out)
print(out, sheet.size)
