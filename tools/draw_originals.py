#!/usr/bin/env python3
"""Original AIMON drawn in code with tools/pixelart.py.

  python3 tools/draw_originals.py            # all
  python3 tools/draw_originals.py geodillo   # just some

AIMON in IN_GAME go to assets/sprites (front, back = mirrored
front, icon) and js/data/sprite_data.js is rewritten. Designs that aren't
in the game yet go to art/originals/.
"""
import base64
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from pixelart import Sprite, ramp, rgb, fit, facets  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

EYE_Y = {'k': '#181018', 'w': '#f8f8f8'}


def banded(base_ramp, seam_fn, seam_level=1):
    """A ramp material with darker seams where seam_fn is true."""
    pal = np.array(base_ramp, dtype=np.uint8)

    def mat(cv, level):
        lv = level.copy()
        s = seam_fn(cv)
        lv[s] = np.minimum(lv[s], seam_level)
        return pal[lv]
    mat.line = base_ramp[0]
    return mat


# ---------------------------------------------------------------------------------------
def crystal(s, bx, by, h, ang, w, mat, **kw):
    """A faceted crystal spike growing from (bx, by) at angle ang (0 = up)."""
    c = s.cv
    a = np.radians(ang)
    tx, ty = bx + np.sin(a) * h, by - np.cos(a) * h
    px, py = np.cos(a) * w, np.sin(a) * w
    sdf = c.poly([(bx - px, by - py), (bx - px * 0.8 + (tx - bx) * 0.7, by - py * 0.8 + (ty - by) * 0.7),
                  (tx, ty), (bx + px * 0.8 + (tx - bx) * 0.7, by + py * 0.8 + (ty - by) * 0.7), (bx + px, by + py)])
    return s.add(sdf, mat, levels=facets(c, bx, by, tx, ty), **kw)


def geodillo():
    s = Sprite()
    c = s.cv
    rock = ramp('#6c6680', dark='#4a4660', light='#8a84a2', high='#b0aac4', line='#1a1624')
    skin = ramp('#9c7e6a', dark='#6a5246', light='#bc9e84', high='#dcc0a2', line='#2a1a18')
    belly = ramp('#dcc8a4', dark='#ac946e', light='#eee2c6', high='#faf2de', line='#3a2a1c')
    gem = ramp('#9c5ce8', dark='#6434b0', light='#c494fa', high='#f2e0ff', line='#241040')
    gem2 = ramp('#50c4f0', dark='#2c7cc0', light='#94e6fa', high='#eafcff', line='#0e2640')
    quartz = ramp('#e6e0f0', dark='#b8b0cc', light='#f4f0fa', high='#ffffff', line='#3c3450')

    # Far legs and ear.
    s.add(c.capsule(29, 50, 30, 58, 4.0, 3.6), skin, shade=-1, round=3)
    s.add(c.capsule(51, 49, 53, 57, 4.0, 3.6), skin, shade=-1, round=3)
    # Tail: armoured rings ending in a crystal club.
    s.add(c.stroke([(52, 45), (58, 47), (61, 52)], [4.6, 3.6, 2.8]), banded(rock, lambda cv: ((cv.X + cv.Y * 0.5) % 4.5) < 0.9), round=3)
    crystal(s, 61, 53, 7, 150, 2.6, gem)
    crystal(s, 60, 52, 6, 110, 2.2, gem2)
    # Shell: banded rock dome, low to the ground.
    dome = c.inter(c.ellipse(36, 41, 21, 15), c.rect(10, 20, 64, 52))
    seam = lambda cv: ((cv.X * 0.95 + (cv.Y - 40) * 0.35) % 7) < 1.0
    s.add(dome, banded(rock, seam), round=13)
    s.add(c.inter(dome, c.rect(10, 48.5, 64, 52)), rock, flat=1, line=False, cast=False)
    # Split geode on the flank: quartz rim, amethyst lining, glowing core.
    s.add(c.ellipse(37, 40, 8.5, 6.5, rot=-10), quartz, round=3)
    s.add(c.ellipse(37.5, 40.5, 6.3, 4.6, rot=-10), gem, round=5, line=False,
          levels=np.where(c.noise(1.3, 7) > 0.55, 3, np.where(c.noise(1.1, 3) > 0.62, 4, 1)))
    s.add(c.ellipse(38, 41, 2.6, 1.8, rot=-10), gem, flat=4, line=False)
    # Crystals splitting the shell along its spine.
    for i, (x, y, h, a, w) in enumerate([(20, 34, 7, -40, 2.6), (26, 29, 10, -20, 3.2), (34, 26, 12, -4, 3.6),
                                          (43, 27, 11, 12, 3.4), (50, 31, 8, 30, 2.8)]):
        crystal(s, x, y, h, a, w, gem if i % 2 == 0 else gem2)
    # Underside and near legs.
    s.add(c.inter(c.ellipse(33, 51, 15, 4.5), c.rect(0, 48.5, 64, 64)), belly, round=3, line=False)
    for x0, x1 in ((20, 19), (45, 46)):
        s.add(c.capsule(x0, 49, x1, 57.5, 4.6, 4.2), skin, round=3.5)
        s.add(c.rect(x1 - 4.5, 57, x1 + 3.5, 60, 1.2), belly, round=1.5)   # toes
    # Head with an armour cap and a crystal on the nose.
    s.add(c.ellipse(21, 33, 2.8, 5, rot=-30), skin, round=2)                # ear
    head = c.smooth(c.ellipse(17, 43, 9, 7.2, rot=-10), c.capsule(11, 46, 4.5, 48.5, 4.4, 2.8), 2.5)
    s.add(head, skin, round=6)
    s.add(c.inter(c.ellipse(18, 42, 9.6, 7.8, rot=-10), c.poly([(8, 33), (30, 30), (28, 38.5), (12, 39.5)])),
          banded(rock, lambda cv: ((cv.X * 0.9 + cv.Y * 0.3) % 5) < 0.9), round=4)
    crystal(s, 11, 38, 7, -30, 2.2, gem2)
    s.add(c.ellipse(15, 50, 6, 2.2), belly, round=2, line=False)              # jaw

    def details(px):
        pal = {'k': '#140c18', 'y': '#f8e040', 'o': '#e89820', 'w': '#fffbe0'}
        px.stamp(13, 41, ['kkkkk', 'kwyyk', 'kyook', '.kkk.'], pal)          # eye
        px.stamp(5, 48, ['k'], {'k': '#2a1a18'})                              # nostril
        px.stamp(8, 50, ['kkk'], {'k': '#4a3228'})                            # mouth
        spark = {'y': '#f8f070', 'w': '#ffffff'}
        px.stamp(29, 12, ['...y', '..y.', '.yw.', 'yyyy', '.wy.', '.y..', 'y...'], spark)
        px.stamp(46, 13, ['y..', '.y.', 'yw.', '.y.', 'y..'], spark)
        px.small(lambda p: p.dot(13, 43, '#140c18'))
    s.detail(details)
    return s


def hourghast():
    s = Sprite()
    c = s.cv
    ghost = ramp('#6a50a8', dark='#44306e', light='#9478d0', high='#c8b0f4', line='#1a1030')
    wood = ramp('#8a5634', dark='#5c3620', light='#b07848', high='#d09a64', line='#24120a')
    gold = ramp('#d8a840', dark='#a07020', light='#f0d070', high='#fff0b0', line='#3a2408')
    glass = ramp('#a4c4d8', dark='#7890ac', light='#cce4f0', high='#ffffff', line='#26364c')
    sand = ramp('#e2b456', dark='#b8843a', light='#f4d27c', high='#fff0b8', line='#4a3010')
    soul = ramp('#b898f8', dark='#8060d0', light='#dccaff', high='#ffffff', line='#2c1850')

    # Tattered shroud behind the hourglass, with wispy arms.
    hem = [(10, 50), (13, 60), (18, 54), (23, 62), (28, 55), (32, 63), (36, 55), (41, 62), (46, 54), (51, 60), (54, 50)]
    shroud = c.poly([(20, 6), (44, 6), (54, 30)] + hem[::-1] + [(10, 30)], r=1)
    s.add(shroud, ghost, round=10)
    for side in (-1, 1):
        arm = c.stroke([(32 + side * 18, 30), (32 + side * 25, 25), (32 + side * 28, 17), (32 + side * 26, 11)],
                       [4.2, 3.4, 2.6, 1.6])
        s.add(arm, ghost, round=3, shade=0 if side < 0 else -1)
        for k, (dx, dy) in enumerate(((-3, -4), (0, -6), (3, -4))):
            fx, fy = 32 + side * 26, 12
            s.add(c.capsule(fx, fy, fx + dx * side * -1 + side * 1, fy + dy, 1.3, 0.6), ghost, round=1)
    # Frame: pillars behind the glass, caps in front.
    for x in (18, 46):
        s.add(c.capsule(x, 10, x, 54, 2.1), banded(wood, lambda cv: ((cv.Y + cv.X * 0.3) % 4) < 1.0), round=2)
    bulbs = c.union(c.ellipse(32, 21.5, 12, 10.5), c.ellipse(32, 42.5, 12, 10.5), c.capsule(32, 28, 32, 36, 2.4))
    s.add(bulbs, glass, round=4)
    # Sand pile and the thin falling stream.
    s.add(c.inter(c.ellipse(32, 42.5, 10.5, 9), c.ellipse(32, 55, 12, 9)), sand, round=4, line=False)
    s.add(c.capsule(32, 30, 32, 46, 0.7), sand, flat=3, line=False, cast=False)
    s.add(c.inter(c.ellipse(32, 21.5, 10.5, 9), c.ellipse(32, 12, 9, 5)), sand, round=3, line=False)
    # The spirit living in the upper bulb.
    wisp = c.smooth(c.ellipse(32, 23, 7.5, 6.2), c.poly([(27, 20), (30, 11), (33, 16), (36, 10), (38, 20)]), 2)
    s.add(wisp, soul, round=5, line=False)
    # Glass shine.
    for y0 in (15, 36):
        s.add(c.capsule(24.5, y0, 23.5, y0 + 8, 1.0), glass, flat=4, line=False, cast=False)
    # Caps with gold trim.
    for y0 in (4, 53):
        s.add(c.rect(13, y0, 51, y0 + 6.5, 2), wood, round=3)
        s.add(c.rect(15, y0 + 2.4, 49, y0 + 4, 0.6), gold, flat=3, line=False, cast=False)
    s.add(c.circle(32, 7.2, 2.4), gold, round=2)

    def details(px):
        pal = {'k': '#1a0c30', 'y': '#f8f070', 'o': '#f0a040', 'w': '#ffffff'}
        px.stamp(28, 21, ['kkk', 'kyk', 'kok'], pal)
        px.stamp(34, 21, ['kkk', 'kyk', 'kok'], pal)
        px.stamp(28, 26, ['k.k.k.k.k', '.k.k.k.k.'], {'k': '#2c1850'})
        for x, y in ((8, 40), (57, 36), (6, 22), (59, 48), (12, 8)):
            px.stamp(x, y, ['.y.', 'yoy', '.y.'], {'y': '#f4d27c', 'o': '#fff0b8'})
        px.small(lambda p: (p.dot(29, 22, '#1a0c30'), p.dot(35, 22, '#1a0c30')))
    s.detail(details)
    return s


def noctumoth():
    s = Sprite()
    c = s.cv
    wing = ramp('#2c2c68', dark='#1c1a48', light='#40449a', high='#5c64c0', line='#0a0818')
    wing2 = ramp('#3a2a64', dark='#241842', light='#54408c', high='#7058b0', line='#0c0818')
    fringe = ramp('#b4a0dc', dark='#8470b4', light='#d4c8f0', high='#f4f0ff', line='#241840')
    gold = ramp('#f0b838', dark='#c07c18', light='#f8dc70', high='#fff4c0', line='#3c2206')
    fur = ramp('#4a3c6c', dark='#302648', light='#6a5a90', high='#8a7cb0', line='#0e0a1a')
    ruff = ramp('#e8e0f0', dark='#b0a4c8', light='#f6f2fc', high='#ffffff', line='#302840')

    cx = 32
    for side in (-1, 1):
        sx = lambda x: cx + side * x
        # Hind wing (lower) and fore wing (upper), scalloped pale fringe.
        hind = c.poly([(sx(3), 34), (sx(20), 36), (sx(27), 46), (sx(22), 56), (sx(12), 58), (sx(4), 46)], r=1.5)
        s.add(c.union(hind, c.circle(sx(22), 55, 3)), fringe, round=3, shade=-side * 0.3)
        s.add(c.poly([(sx(3), 34), (sx(18), 37), (sx(24), 46), (sx(20), 53), (sx(12), 55), (sx(5), 45)], r=1),
              wing2, round=6, line=False)
        fore = c.poly([(sx(4), 30), (sx(14), 12), (sx(26), 4), (sx(31), 8), (sx(30), 22), (sx(24), 33), (sx(12), 38)], r=1.5)
        s.add(fore, fringe, round=3, shade=-side * 0.3)
        inner = c.poly([(sx(5), 30), (sx(14), 14), (sx(25), 7), (sx(28.5), 10), (sx(27.5), 21), (sx(22.5), 31), (sx(12), 35.5)], r=1)
        s.add(inner, wing, round=8, line=False)
        # Veins.
        for ex, ey in ((25, 9), (27, 20), (20, 31)):
            s.add(c.capsule(sx(6), 29, sx(ex), ey, 0.45), wing, flat=1, line=False, cast=False)
        # Eclipse eye-spot: a gold corona around a black disc.
        s.add(c.circle(sx(18), 20, 6), gold, round=4, line=False)
        s.add(c.circle(sx(18), 20, 3.8), wing, flat=0, line=False, cast=False)
        s.add(c.circle(sx(19.2 - side * 0.0), 18.8, 1.1), ruff, flat=4, line=False, cast=False)
        s.add(c.circle(sx(14), 47, 2.6), gold, round=2, line=False)
    # Body: fuzzy abdomen, thorax with a white ruff, head with feathery antennae.
    s.add(c.ellipse(cx, 45, 4.6, 11), banded(fur, lambda cv: ((cv.Y) % 4) < 1.1), round=4)
    s.add(c.ellipse(cx, 31, 7, 6), fur, round=5)
    s.add(c.union(c.ellipse(cx - 4, 27, 4.5, 3.4, rot=20), c.ellipse(cx + 4, 27, 4.5, 3.4, rot=-20), c.ellipse(cx, 29, 5, 3)),
          ruff, round=3)
    for side in (-1, 1):
        s.add(c.stroke([(cx + side * 2, 20), (cx + side * 6, 12), (cx + side * 11, 7)], [1.0, 0.9, 0.7]), gold, round=1)
        for k in range(4):
            bx, by = cx + side * (4 + k * 2), 15 - k * 2
            s.add(c.capsule(bx, by, bx + side * 2.6, by + 1.6, 0.55), gold, flat=3, line=False)
    s.add(c.ellipse(cx, 22.5, 5, 4.2), fur, round=4)

    def details(px):
        pal = {'r': '#f04060', 'o': '#ff9098', 'w': '#ffffff', 'k': '#0a0818'}
        px.stamp(27, 21, ['.kk', 'krr', 'kow'], pal)
        px.stamp(34, 21, ['kk.', 'rrk', 'wok'], pal)
        for x, y in ((6, 8), (58, 12), (10, 60), (55, 61), (31, 4)):
            px.stamp(x, y, ['.w.', 'w.w', '.w.'], {'w': '#d8d0f8'})
        px.small(lambda p: (p.dot(28, 22, '#f04060'), p.dot(35, 22, '#f04060')))
    s.detail(details)
    return s


def stained(cv, points, ramps, lead, seed=0, width=0.5):
    """Stained-glass material: each Voronoi cell a colour, dark lead between."""
    idx, edge = cv.cells(points)
    rng = np.random.default_rng(seed)
    pick = rng.integers(0, len(ramps), len(points))
    pals = np.array(ramps, dtype=np.uint8)            # (k, 5, 3)

    def mat(cv2, level):
        out = pals[pick[idx], level]
        out[edge < width] = rgb(lead)
        return out
    mat.line = rgb(lead)
    return mat


def mosstodon():
    s = Sprite()
    c = s.cv
    fur = ramp('#7c5a3c', dark='#553a28', light='#9c7652', high='#b8926c', line='#1e120a')
    moss = ramp('#5c9c3c', dark='#3c6e2c', light='#84c050', high='#b4e07c', line='#14280c')
    ivory = ramp('#ece0c4', dark='#bcac8c', light='#f8f2e0', high='#ffffff', line='#3a3020')
    vine = ramp('#48a040', dark='#2c6c2c', light='#70c858', high='#a8e888', line='#0e2a0e')
    toe = ramp('#d8c8a8', dark='#a89478', light='#ece2cc', high='#fbf6ea', line='#2e2418')
    shag = lambda cv: (((cv.X * 1.3 + cv.Y * 0.25) % 5) < 0.8) & (cv.noise(2.5, 9) > 0.45)
    shaggy = banded(fur, shag, seam_level=2)

    # Far legs and tail.
    s.add(c.capsule(34, 46, 35, 57, 5, 4.6), fur, shade=-1, round=4)
    s.add(c.capsule(53, 45, 54, 57, 4.6, 4.3), fur, shade=-1, round=4)
    s.add(c.stroke([(57, 38), (61, 43), (61, 48)], [1.8, 1.4, 1.2]), fur, round=1.5)
    s.add(c.ellipse(61, 49, 2.4, 3), moss, round=2)
    # Body with a high shoulder hump sloping down to the rump.
    body = c.smooth(c.ellipse(42, 39, 18, 12.5), c.ellipse(31, 32, 13, 14), 5)
    s.add(body, shaggy, round=13)
    # Moss blanket over the hump, with drooping strands.
    cover = c.poly([(10, 0), (64, 0), (64, 36), (54, 40), (44, 37), (34, 40), (24, 36), (18, 30)])
    drips = c.union(*[c.capsule(x, 36, x + 0.4, 36 + h, 1.5, 1.0) for x, h in ((27, 5), (33, 7), (40, 4), (47, 6), (54, 4))])
    blanket = c.inter(c.union(c.inter(body, cover), drips), body + 0.5)
    s.add(blanket, moss, round=9)
    s.add(blanket, moss, line=False, cast=False,
          levels=np.where(c.noise(1.0, 11) > 0.63, 3, np.where(c.noise(0.9, 4) > 0.67, 1, 2)))
    # A sapling growing out of the moss.
    s.add(c.stroke([(35, 20), (34, 13), (36, 8)], [1.2, 1.0, 0.7]), fur, round=1)
    for (x, y, rx, ry, rot) in ((30.5, 11, 3.8, 1.8, 30), (39.5, 9, 4, 1.8, -25), (36, 5, 1.8, 3.2, 0)):
        s.add(c.ellipse(x, y, rx, ry, rot=rot), vine, round=2)
    # Near legs.
    for x0 in (26, 48):
        s.add(c.capsule(x0, 45, x0 - 0.5, 57.5, 5.8, 5.4), shaggy, round=4)
        s.add(c.rect(x0 - 6, 56, x0 + 5, 60.5, 2), toe, round=2)
    # Head: big domed skull, fan ear, trunk hanging down.
    s.add(c.ellipse(26, 33, 6, 8, rot=10), fur, shade=-1, round=4)                   # ear
    skull = c.ellipse(16, 29, 10, 11)
    trunk = c.stroke([(11, 36), (8, 44), (8, 51), (11, 57), (14, 57)], [5, 3.8, 3, 2.4, 2])
    s.add(c.smooth(skull, trunk, 3), shaggy, round=8)
    s.add(c.inter(c.ellipse(16, 29, 10.5, 11.5), c.poly([(0, 0), (30, 0), (27, 24), (15, 22), (5, 26)])), moss, round=5)
    # Vine-wrapped tusk sweeping forward and up, in front of the trunk.
    tusk = c.stroke([(15, 41), (10, 49), (4, 51), (1, 46), (2, 39)], [2.6, 2.5, 2.2, 1.8, 1.3])
    s.add(tusk, ivory, round=2.5)
    wrap = c.union(*[c.capsule(x - 1.8, y + 1.8, x + 1.8, y - 1.8, 0.7) for x, y in ((12, 46), (7, 50), (2.5, 46))])
    s.add(c.inter(tusk, wrap), vine, flat=2, line=False, cast=False)

    def details(px):
        pal = {'k': '#140c08', 'w': '#ffffff', 'b': '#3a2618'}
        px.stamp(13, 29, ['kkk', 'kwk', '.k.'], pal)                                # eye
        px.stamp(12, 27, ['bbbb'], pal)                                             # brow
        flower = {'p': '#f090b8', 'l': '#ffd0e4', 'y': '#f8d840'}
        white = {'p': '#e8e8f8', 'l': '#ffffff', 'y': '#f8c040'}
        for (x, y, pal2) in ((25, 24, flower), (44, 30, white), (53, 33, flower), (38, 25, white), (18, 20, flower)):
            px.stamp(x, y, ['.p.', 'pyp', '.l.'], pal2)
        px.stamp(1, 36, ['.p.', 'pyp', '.p.'], flower)
        px.small(lambda p: p.dot(14, 30, '#140c08'))
    s.detail(details)
    return s


def prismanta():
    s = Sprite()
    c = s.cv
    lead = '#18203a'
    glass = [ramp('#3cc0c8'), ramp('#3a6cd8'), ramp('#78e0ea'), ramp('#f0c850'), ramp('#d05cb4'), ramp('#7a62e0')]
    rng = np.random.default_rng(3)
    pts = [(x + rng.uniform(-2, 2), y + rng.uniform(-2, 2)) for y in range(10, 50, 6) for x in range(0, 66, 6)]
    wingmat = stained(c, pts, glass, lead, seed=8)
    body = ramp('#2c4c8c', dark='#1c3264', light='#4870b8', high='#78a0e0', line='#0a1428')
    prism = ramp('#c8f0ff', dark='#80b8e8', light='#e8faff', high='#ffffff', line='#1c3050')

    # Tail trailing behind, ending in a prism.
    s.add(c.stroke([(32, 42), (32, 52), (35, 58)], [1.8, 1.1, 0.8]), body, round=1.5)
    s.add(c.poly([(35, 56), (40, 60), (34, 63), (31, 59)]), prism, levels=facets(c, 33, 61, 39, 57))
    # Wings: wide stained-glass diamond, tips lifted.
    wings = c.poly([(32, 13), (21, 16), (11, 21), (4, 26), (1, 23), (0, 28), (6, 33), (17, 37), (26, 41), (32, 47),
                    (38, 41), (47, 37), (58, 33), (64, 28), (63, 23), (60, 26), (53, 21), (43, 16)], r=1)
    s.add(wings, wingmat, round=10)
    # Body ridge and head.
    s.add(c.smooth(c.ellipse(32, 30, 7, 15), c.ellipse(32, 18, 8.5, 6), 3), body, round=6)
    s.add(c.ellipse(32, 31, 2.5, 9), body, flat=3, line=False, cast=False)
    # Curled cephalic fins.
    for side in (-1, 1):
        s.add(c.stroke([(32 + side * 5, 15), (32 + side * 8, 10), (32 + side * 7, 5), (32 + side * 4, 4)],
                       [2.4, 2.1, 1.6, 1.0]), body, round=2, shade=-0.5 if side > 0 else 0)

    def details(px):
        pal = {'k': '#0a1020', 'w': '#ffffff', 'c': '#80f0ff'}
        px.stamp(25, 17, ['kk', 'cw'], pal)
        px.stamp(37, 17, ['kk', 'wc'], pal)
        for x, y, col in ((6, 12, '#f8f070'), (58, 12, '#80f0ff'), (10, 48, '#f090d0'), (54, 48, '#ffffff'), (47, 6, '#80f0ff')):
            px.stamp(x - 1, y - 1, ['.w.', 'wcw', '.w.'], {'w': col, 'c': '#ffffff'})
        px.small(lambda p: (p.dot(26, 18, '#0a1020'), p.dot(38, 18, '#0a1020')))
    s.detail(details)
    return s


def facet_rock(c, spacing, seed, rock, seam=0.5, glow=None, glow_cells=0.0):
    """Stone made of chunky facets with dark cracks; some cracks can glow."""
    rng = np.random.default_rng(seed)
    pts = [(x + rng.uniform(-spacing * 0.35, spacing * 0.35), y + rng.uniform(-spacing * 0.35, spacing * 0.35))
           for y in np.arange(0, 66, spacing) for x in np.arange(0, 66, spacing)]
    idx, edge = c.cells(pts)
    bump = rng.choice([-1, 0, 0, 1], len(pts))
    hot = c.noise(7, seed + 1) > (1 - glow_cells) if glow else None
    pal = np.array(rock, dtype=np.uint8)

    def mat(cv, level):
        lv = np.clip(level + bump[idx], 1, 4)
        out = pal[lv]
        crack = edge < seam
        out[crack] = pal[np.maximum(lv[crack] - 2, 0)]
        if glow is not None:
            k = crack & hot
            out[k] = rgb(glow)
        return out
    mat.line = rock[0]
    return mat


def cairnling():
    s = Sprite()
    c = s.cv
    sand = ramp('#c4a878', dark='#94784e', light='#dcc496', high='#f0dcb4', line='#2e2012')
    slate = ramp('#8a8898', dark='#5e5c70', light='#a8a6b6', high='#c8c6d4', line='#1c1a26')
    warm = ramp('#a89684', dark='#78685a', light='#c4b4a2', high='#dcd0c2', line='#241a14')
    pale = ramp('#d0ccc0', dark='#a09c90', light='#e6e2d8', high='#f8f6f0', line='#2c2a24')
    moss = ramp('#6aa840', dark='#447a2c', light='#90c858', high='#bce07c', line='#14280c')
    # Feet pebbles.
    s.add(c.ellipse(25, 60, 4, 2.6), slate, round=2)
    s.add(c.ellipse(39, 60, 4, 2.6), slate, round=2)
    # The stack: base, middle, head, top pebble.
    s.add(c.ellipse(32, 53, 14, 6.5, rot=-4), facet_rock(c, 7, 3, sand), round=6)
    s.add(c.ellipse(31, 43.5, 11.5, 5.5, rot=5), facet_rock(c, 7, 5, slate), round=5)
    s.add(c.ellipse(32.5, 32, 11, 7.5, rot=-3), facet_rock(c, 8, 7, warm), round=6)
    s.add(c.ellipse(34, 22.5, 5.5, 3.4, rot=8), pale, round=3)
    # Floating pebble hands.
    s.add(c.ellipse(15, 44, 4, 3.2, rot=-20), slate, round=2.5)
    s.add(c.ellipse(49, 42, 4, 3.2, rot=20), slate, round=2.5, shade=-0.5)
    # Moss tuft and a sprout on top.
    s.add(c.inter(c.ellipse(34, 21.5, 5.8, 2.6), c.rect(0, 0, 64, 22)), moss, round=2, line=False)
    s.add(c.stroke([(34, 20), (35, 15)], 0.6), moss, flat=1, line=False)
    for (x, y, rx, ry, rot) in ((32.5, 14.5, 2.4, 1.2, 30), (37.5, 13.5, 2.4, 1.2, -30)):
        s.add(c.ellipse(x, y, rx, ry, rot=rot), moss, round=1.5)

    def details(px):
        pal = {'k': '#1a1008', 'y': '#f8c040', 'w': '#fff4c0'}
        px.stamp(26, 30, ['kkk', 'kyk', 'kwk'], pal)
        px.stamp(36, 30, ['kkk', 'kyk', 'kwk'], pal)
        px.stamp(30, 36, ['k.k', '.k.'], {'k': '#3a2a1c'})
        px.small(lambda p: (p.dot(27, 31, '#f8c040'), p.dot(37, 31, '#f8c040')))
    s.detail(details)
    return s


def obelith():
    s = Sprite()
    c = s.cv
    stone = ramp('#b09a7a', dark='#7c6a52', light='#cab496', high='#e2d0b4', line='#241a10')
    dark = ramp('#7c6c58', dark='#54483a', light='#9a8870', high='#b8a68c', line='#1a120a')
    moss = ramp('#6aa840', dark='#447a2c', light='#90c858', high='#bce07c', line='#14280c')
    glow = ramp('#f0b040', dark='#c07820', light='#f8d870', high='#fff4c0', line='#3a2008')
    # Rubble legs.
    for (x, y, rx, ry) in ((23, 57, 7, 5), (41, 57, 7, 5)):
        s.add(c.poly([(x - rx, y + ry), (x - rx + 1.5, y - ry + 1), (x + 1, y - ry), (x + rx, y - 1), (x + rx - 1, y + ry)], r=1),
              facet_rock(c, 6, 11, dark), round=4)
    # The obelisk: tall tapering body with a pyramid cap.
    body = c.poly([(21, 56), (24, 12), (32, 3), (40, 12), (43, 56)], r=1.2)
    s.add(body, facet_rock(c, 9, 13, stone, glow='#f0b040', glow_cells=0.12), round=9)
    s.add(c.inter(body, c.poly([(0, 11), (64, 11), (64, 13.5), (0, 13.5)])), dark, flat=1, line=False, cast=False)
    # Glowing rune channels running down the face.
    runes = c.union(c.capsule(28, 20, 28, 34, 0.55), c.capsule(28, 34, 31, 37, 0.55), c.capsule(31, 37, 31, 50, 0.55),
                    c.capsule(36, 22, 36, 30, 0.55), c.capsule(36, 30, 34, 33, 0.55), c.capsule(34, 40, 37, 43, 0.55),
                    c.capsule(37, 43, 37, 52, 0.55), c.capsule(25, 42, 28, 45, 0.55))
    s.add(c.inter(runes, body), glow, flat=3, line=False, cast=False)
    # The eye near the top.
    s.add(c.ellipse(32, 17.5, 4.2, 2.4), dark, flat=0, line=False, cast=False)
    s.add(c.ellipse(32, 17.5, 3, 1.4), glow, flat=4, line=False, cast=False)
    # Lichen patches.
    s.add(c.inter(body, c.union(c.ellipse(23, 50, 4, 3), c.ellipse(41, 38, 3, 4))), moss, round=2, line=False)
    # Floating stone hands and fragments.
    for side in (-1, 1):
        hx = 32 + side * 20
        s.add(c.poly([(hx - 6, 30), (hx - 3, 23), (hx + 4, 24), (hx + 6, 31), (hx + 1, 37), (hx - 4, 36)], r=1),
              facet_rock(c, 5, 17 + side, stone), round=4, shade=0 if side < 0 else -0.5)
        s.add(c.poly([(hx - 2, 43), (hx + side * 3, 41), (hx + 2, 46)], r=0.5), dark, round=2)

    def details(px):
        px.stamp(31, 17, ['kk'], {'k': '#3a1c08'})
        for x, y in ((8, 20), (56, 18), (13, 48), (51, 50)):
            px.stamp(x, y, ['.y.', 'yoy', '.y.'], {'y': '#f0b040', 'o': '#fff4c0'})
        px.small(lambda p: p.dot(32, 18, '#f8d870'))
    s.detail(details)
    return s


DESIGNS = {
    'geodillo': geodillo,
    'hourghast': hourghast,
    'noctumoth': noctumoth,
    'mosstodon': mosstodon,
    'prismanta': prismanta,
    'cairnling': cairnling,
    'obelith': obelith,
}

# Designs that are in the game: written to assets/sprites.
IN_GAME = ['geodillo', 'hourghast', 'noctumoth', 'mosstodon', 'prismanta', 'cairnling', 'obelith']


def write_sprite_data(sprite_dir):
    js = ['// Generated by tools/make_sprites.py and tools/draw_originals.py. Do not edit.',
          'window.SPRITE_DATA = {']
    for name in sorted(os.listdir(sprite_dir)):
        if not name.endswith('.png'):
            continue
        with open(os.path.join(sprite_dir, name), 'rb') as f:
            uri = 'data:image/png;base64,' + base64.b64encode(f.read()).decode()
        js.append(f"  {name[:-4]}: '{uri}',")
    js.append('};')
    with open(os.path.join(ROOT, 'js', 'data', 'sprite_data.js'), 'w') as f:
        f.write('\n'.join(js) + '\n')


def main():
    names = sys.argv[1:] or list(DESIGNS)
    out_dir = os.path.join(ROOT, 'art', 'originals')
    sprite_dir = os.path.join(ROOT, 'assets', 'sprites')
    os.makedirs(out_dir, exist_ok=True)
    wrote = False
    for name in names:
        spr = DESIGNS[name]()
        front = fit(spr.render(64), 64, pad=0)
        icon = fit(spr.render(32), 32, pad=1)
        front.save(os.path.join(out_dir, f'{name}_front.png'))
        icon.save(os.path.join(out_dir, f'{name}_icon.png'))
        if name in IN_GAME:
            # The player's side shows the same art turned to face the foe.
            front.save(os.path.join(sprite_dir, f'{name}_front.png'), optimize=True)
            front.transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(sprite_dir, f'{name}_back.png'), optimize=True)
            icon.save(os.path.join(sprite_dir, f'{name}_icon.png'), optimize=True)
            wrote = True
        print('drew', name)
    if wrote:
        write_sprite_data(sprite_dir)
        print('wrote js/data/sprite_data.js')


if __name__ == '__main__':
    main()
