#!/usr/bin/env python3
"""Build the 2.5D parallax layers for Scene 4 from the hand-drawn SVG mask.

  assets/masks/foreground.svg  (car + man, art-wide.png pixel space)
  → public/img/art-fg.png   RGBA cut-out, 2 px feathered edge
  → public/img/art-bg.png   background plate with the foreground inpainted
                            (so the faster-moving foreground never reveals a ghost)
"""
import re
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
svg = (ROOT / "assets/masks/foreground.svg").read_text()
art = cv2.imread(str(ROOT / "assets/art-wide.png"), cv2.IMREAD_COLOR)
h, w = art.shape[:2]

mask = np.zeros((h, w), np.uint8)
for d in re.findall(r'\sd="([^"]+)"', svg):
    pts = np.array([[float(a), float(b)] for a, b in re.findall(r"(-?[\d.]+)\s+(-?[\d.]+)", d)], np.int32)
    cv2.fillPoly(mask, [pts], 255, lineType=cv2.LINE_AA)

soft = cv2.GaussianBlur(mask, (0, 0), 1.2)
fg = np.dstack([art, soft])
cv2.imwrite(str(ROOT / "public/img/art-fg.png"), fg)

# inpaint a slightly dilated hole, then soften the patch so it reads as out-of-focus background
hole = cv2.dilate(mask, np.ones((25, 25), np.uint8))
small = cv2.resize(art, (w // 2, h // 2), interpolation=cv2.INTER_AREA)
hole_s = cv2.resize(hole, (w // 2, h // 2), interpolation=cv2.INTER_NEAREST)
inp = cv2.inpaint(small, hole_s, 12, cv2.INPAINT_TELEA)
inp = cv2.resize(inp, (w, h), interpolation=cv2.INTER_CUBIC)
inp = cv2.GaussianBlur(inp, (0, 0), 6)
a = (cv2.GaussianBlur(hole, (0, 0), 8).astype(np.float32) / 255.0)[..., None]
bg = (art * (1 - a) + inp * a).astype(np.uint8)
cv2.imwrite(str(ROOT / "public/img/art-bg.png"), bg)
print("wrote art-fg.png, art-bg.png", w, h, "fg coverage", round(float((mask > 0).mean()), 3))
