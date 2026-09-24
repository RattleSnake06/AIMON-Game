#!/usr/bin/env python3
"""Turn the VALEMORA region painting into a small GBA-style town map.

The painting (art/valemora_map.webp) is sorted into a handful of terrain
kinds (sea, shallows, grass, forest, rock, snow, sand, lava), shrunk to
240x158 by majority vote, and repainted with a flat GBA palette. Labels,
town markers and the legend are masked out first and filled in from the
land around them; the game draws its own roads, towns and labels on top.

Usage:
  pip install pillow numpy
  python3 tools/make_townmap.py      # writes assets/sprites/region_map.png
"""
import colorsys
import os

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_W, OUT_H = 240, 158

UNKNOWN, DEEP, SHALLOW, GRASS, FOREST, ROCK, SNOW, SAND, LAVA = range(9)

# Label boxes, town clusters and page furniture (painting pixels).
MASK = [
    (12, 10, 325, 78), (1143, 10, 1540, 78), (1303, 684, 1540, 975), (12, 875, 80, 962),
    (12, 975, 320, 1000),
    (197, 172, 330, 200), (680, 140, 828, 166), (1128, 174, 1284, 204), (1420, 172, 1520, 200),
    (680, 258, 822, 288), (935, 308, 1075, 334), (456, 387, 580, 413), (172, 413, 295, 440),
    (1335, 484, 1462, 512), (678, 490, 822, 518), (1043, 498, 1160, 524), (377, 522, 518, 550),
    (938, 626, 1095, 652), (516, 668, 605, 694), (704, 678, 858, 706), (70, 730, 175, 775),
    (1072, 847, 1210, 873), (330, 890, 442, 916), (695, 908, 802, 934),
    (410, 226, 485, 254), (948, 232, 1026, 260), (716, 380, 790, 407), (188, 515, 262, 542),
    (360, 730, 436, 757), (876, 691, 948, 718), (163, 666, 197, 690), (515, 877, 550, 902),
    (724, 857, 758, 882), (1060, 795, 1094, 818),
]

# Towns: painted over with plain land (the game draws its own markers).
TOWNS = [
    ((695, 285, 810, 335), GRASS), ((680, 450, 822, 560), GRASS), ((1148, 205, 1290, 300), GRASS),
    ((1340, 515, 1440, 575), GRASS), ((428, 548, 464, 582), GRASS), ((1105, 810, 1185, 880), GRASS),
    ((212, 436, 256, 472), SAND),
]

PALETTE = {
    DEEP: (56, 104, 192), SHALLOW: (88, 160, 232), GRASS: (120, 192, 96), FOREST: (60, 136, 64),
    ROCK: (160, 120, 80), SNOW: (240, 240, 248), SAND: (224, 200, 120), LAVA: (240, 112, 48),
}


def classify(rgb):
    h, w, _ = rgb.shape
    flat = rgb.reshape(-1, 3) / 255.0
    out = np.zeros(len(flat), dtype=np.uint8)
    for i, (r, g, b) in enumerate(flat):
        hh, s, v = colorsys.rgb_to_hsv(r, g, b)
        hh *= 360
        if v < 0.3 and b > g and b > r:
            k = UNKNOWN            # label boxes (dark navy)
        elif s < 0.16:
            k = SNOW if v > 0.82 else ROCK
        elif 180 <= hh <= 250:
            k = SHALLOW if (v > 0.82 and s < 0.62) or (g > 0.55 and v > 0.75) else DEEP
        elif 70 <= hh < 180:
            k = FOREST if v < 0.5 else GRASS
        elif hh < 22 or hh > 330:
            k = LAVA if s > 0.65 and v > 0.7 else ROCK
        elif 22 <= hh < 42:
            k = SAND if s > 0.45 and v > 0.78 else ROCK
        elif 42 <= hh < 70:
            k = SAND if v > 0.7 else FOREST if v < 0.45 else GRASS
        else:
            k = UNKNOWN
        out[i] = k
    return out.reshape(h, w)


def main():
    src = Image.open(os.path.join(ROOT, 'art', 'valemora_map.webp')).convert('RGB')
    # Classify at half size (plenty of detail for a 240px map, 4x faster).
    half = src.resize((src.width // 2, src.height // 2), Image.BOX)
    cls = classify(np.asarray(half).astype(np.float32))
    for x0, y0, x1, y1 in MASK:
        cls[y0 // 2:y1 // 2 + 1, x0 // 2:x1 // 2 + 1] = UNKNOWN
    for (x0, y0, x1, y1), k in TOWNS:
        cls[y0 // 2:y1 // 2 + 1, x0 // 2:x1 // 2 + 1] = k

    H, W = cls.shape
    out = np.zeros((OUT_H, OUT_W), dtype=np.uint8)
    for oy in range(OUT_H):
        for ox in range(OUT_W):
            y0, y1 = oy * H // OUT_H, max(oy * H // OUT_H + 1, (oy + 1) * H // OUT_H)
            x0, x1 = ox * W // OUT_W, max(ox * W // OUT_W + 1, (ox + 1) * W // OUT_W)
            block = cls[y0:y1, x0:x1].ravel()
            counts = np.bincount(block, minlength=9)
            counts[UNKNOWN] = 0
            # Forest reads as grass with dark tree tops mixed in: favour it.
            counts[FOREST] = int(counts[FOREST] * 1.35)
            out[oy, ox] = counts.argmax() if counts.sum() else UNKNOWN

    # Fill masked pixels from their neighbours.
    for _ in range(40):
        unk = np.argwhere(out == UNKNOWN)
        if not len(unk):
            break
        new = out.copy()
        for y, x in unk:
            nb = out[max(0, y - 1):y + 2, max(0, x - 1):x + 2].ravel()
            nb = nb[nb != UNKNOWN]
            if len(nb):
                new[y, x] = np.bincount(nb, minlength=9).argmax()
        out = new
    out[out == UNKNOWN] = DEEP

    # One pass of 3x3 majority to clear speckles.
    sm = out.copy()
    for y in range(1, OUT_H - 1):
        for x in range(1, OUT_W - 1):
            c = np.bincount(out[y - 1:y + 2, x - 1:x + 2].ravel(), minlength=9)
            if c[out[y, x]] <= 2:
                sm[y, x] = c.argmax()
    out = sm

    # Paint.
    img = np.zeros((OUT_H, OUT_W, 3), dtype=np.uint8)
    water = (out == DEEP) | (out == SHALLOW)
    for k, col in PALETTE.items():
        img[out == k] = col
    for y in range(OUT_H):
        for x in range(OUT_W):
            k = out[y, x]
            if k == DEEP and (x + (y // 4) * 5) % 12 < 3 and y % 4 == 1:
                img[y, x] = (76, 124, 208)          # wave dashes
            elif k == FOREST and (x + y) % 2 == 0:
                img[y, x] = (44, 108, 52)           # tree tops
            elif k == ROCK and (x - y) % 4 == 0:
                img[y, x] = (128, 92, 64)           # rock ridges
            if not water[y, x] and y + 1 < OUT_H and water[y + 1, x]:
                img[y, x] = (136, 96, 64)           # cliff edge on the south side
            elif not water[y, x] and any(
                    0 <= y + dy < OUT_H and 0 <= x + dx < OUT_W and water[y + dy, x + dx]
                    for dy, dx in ((-1, 0), (0, -1), (0, 1))):
                img[y, x] = (np.array(img[y, x]) * 0.8).astype(np.uint8)
            elif k == DEEP and any(
                    0 <= y + dy < OUT_H and 0 <= x + dx < OUT_W and not water[y + dy, x + dx]
                    for dy in (-1, 0, 1) for dx in (-1, 0, 1)):
                img[y, x] = PALETTE[SHALLOW]        # surf around the coast
    path = os.path.join(ROOT, 'assets', 'sprites', 'region_map.png')
    Image.fromarray(img, 'RGB').save(path, optimize=True)
    print('wrote', path)


if __name__ == '__main__':
    main()
