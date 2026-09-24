#!/usr/bin/env python3
"""Turn the AIMON design sheets into GBA-style battle sprites.

Two kinds of source:
  - the design PDFs (starter_mons.pdf, route_1_mons.pdf): one large sheet
    per creature with a Front / Side / Back turnaround on a plain panel;
  - the pixel-art sheets in art/sheets/: several creatures per image,
    each drawn from the side, back and front on a flat mint background.

Each view is cut out, the background keyed away, then it is shrunk to
64x64, reduced to a 15-colour palette (the GBA sprite limit) and given a
dark outline. Output:

  assets/sprites/<mon>_front.png, <mon>_back.png, <mon>_icon.png
  js/data/sprite_data.js   (every PNG in assets/sprites as a data URI, so
                            the game also runs straight from file://)

Usage:
  pip install pymupdf pillow numpy
  python3 tools/make_sprites.py                       # pixel-art sheets only
  python3 tools/make_sprites.py starter_mons.pdf route_1_mons.pdf   # + PDFs
  ONLY=tidepup,tidefin python3 tools/make_sprites.py                # just these
"""
import base64
import io
import os
import sys
from collections import deque

import numpy as np
import pymupdf
from PIL import Image, ImageEnhance, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Which source image each creature comes from: (pdf index, image index on
# its page) for the PDFs, or the file name of a pixel-art sheet.
SHEETS = {
    'skylavine': (0, 2),
    'archepin': (0, 0),
    'moltarock': (0, 1),
    'goskie': (1, 0),
    'mellowcap': (1, 1),
    'voltvix': 'aimon_sheet_1.webp',
    'terrapike': 'aimon_sheet_1.webp',
    'scrapaw': 'aimon_sheet_1.webp',
    'dapplekit': 'aimon_sheet_1.webp',
    'nibblit': 'aimon_sheet_2.webp',
    'ruffang': 'aimon_sheet_2.webp',
    'leafgrub': 'aimon_sheet_2.webp',
    'bambuck': 'aimon_sheet_2.webp',
    'wraithling': 'aimon_sheet_3.webp',
    'umbrafang': 'aimon_sheet_3.webp',
    'flambramble': 'aimon_sheet_3.webp',
    'tidepup': 'aimon_sheet_4.webp',
    'tidefin': 'aimon_sheet_4.webp',
    'reefwhirl': 'aimon_sheet_4.webp',
    'reeflord': 'aimon_sheet_4.webp',
    'skydrift': 'aimon_sheet_4.webp',
    'skyseraph': 'aimon_sheet_4.webp',
    'voltimp': 'aimon_sheet_5.webp',
    'stormgale': 'aimon_sheet_5.webp',
    'tuner': 'aimon_sheet_6.webp',
    'sonarion': 'aimon_sheet_6.webp',
}

# Crop boxes (in sheet pixels) around each turnaround view, the view used
# for each sprite, and the size it should occupy in the 64x64 frame.
#   front: what the player sees when facing this creature (faces left)
#   back:  the player's own creature, seen from behind
#   icon:  32x32 party-menu icon
VIEWS = {
    'skylavine': {
        'front': dict(box=(300, 720, 512, 958), fit=(58, 56)),
        'back': dict(box=(585, 725, 710, 958), fit=(60, 62)),
        'icon': dict(box=(75, 715, 210, 958), fit=(26, 28)),
    },
    'archepin': {
        'front': dict(box=(240, 735, 582, 960), fit=(62, 50)),
        'back': dict(box=(580, 740, 800, 955), fit=(62, 58)),
        'icon': dict(box=(30, 735, 232, 955), fit=(28, 26)),
    },
    'moltarock': {
        'front': dict(box=(45, 755, 250, 1032), fit=(54, 58), tol=62),
        'back': dict(box=(555, 755, 775, 1032), fit=(58, 62), tol=62),
        'icon': dict(box=(45, 755, 250, 1032), fit=(26, 28), tol=62),
    },
    'goskie': {
        'front': dict(box=(300, 688, 518, 922), fit=(58, 56)),
        'back': dict(box=(585, 688, 720, 922), fit=(56, 62)),
        'icon': dict(box=(92, 688, 218, 922), fit=(24, 28)),
    },
    # Pixel-art sheets: already crisp, so no extra saturation.
    'voltvix': {
        'front': dict(box=(28, 72, 196, 244), fit=(58, 56), sat=1.05, tol=40),
        'back': dict(box=(232, 56, 372, 240), fit=(56, 62), sat=1.05, tol=40),
        'icon': dict(box=(432, 72, 500, 176), fit=(24, 28), sat=1.05, tol=40),
    },
    'terrapike': {
        'front': dict(box=(612, 80, 812, 236), fit=(62, 50), sat=1.05, tol=40),
        'back': dict(box=(852, 48, 980, 236), fit=(54, 60), sat=1.05, tol=40),
        'icon': dict(box=(1032, 76, 1112, 180), fit=(26, 28), sat=1.05, tol=40),
    },
    'scrapaw': {
        'front': dict(box=(28, 716, 208, 896), fit=(58, 58), sat=1.05, tol=40),
        'back': dict(box=(224, 712, 360, 900), fit=(52, 62), sat=1.05, tol=40),
        'icon': dict(box=(424, 720, 504, 844), fit=(24, 28), sat=1.05, tol=40),
    },
    'dapplekit': {
        'front': dict(box=(612, 732, 812, 900), fit=(58, 52), sat=1.05, tol=40),
        'back': dict(box=(864, 712, 980, 904), fit=(50, 60), sat=1.05, tol=40),
        'icon': dict(box=(1044, 740, 1120, 844), fit=(24, 28), sat=1.05, tol=40),
    },
    'nibblit': {
        'front': dict(box=(20, 76, 232, 236), fit=(54, 44), sat=1.05, tol=40),
        'back': dict(box=(288, 232, 384, 380), fit=(46, 54), sat=1.05, tol=40),
        'icon': dict(box=(484, 92, 556, 180), fit=(24, 26), sat=1.05, tol=40),
    },
    'ruffang': {
        'front': dict(box=(696, 76, 884, 244), fit=(62, 56), sat=1.05, tol=40),
        'back': dict(box=(944, 240, 1036, 384), fit=(48, 62), sat=1.05, tol=40),
        'icon': dict(box=(1136, 88, 1208, 188), fit=(24, 28), sat=1.05, tol=40),
    },
    'leafgrub': {
        'front': dict(box=(40, 692, 220, 836), fit=(58, 44), sat=1.05, tol=40),
        'back': dict(box=(268, 840, 388, 988), fit=(50, 56), sat=1.05, tol=40),
        'icon': dict(box=(476, 680, 544, 800), fit=(20, 28), sat=1.05, tol=40),
    },
    'bambuck': {
        'front': dict(box=(688, 672, 896, 856), fit=(60, 56), sat=1.05, tol=40),
        'back': dict(box=(940, 856, 1056, 1008), fit=(52, 60), sat=1.05, tol=40),
        'icon': dict(box=(1144, 676, 1220, 796), fit=(24, 28), sat=1.05, tol=40),
    },
    # Chapter 3 sheets. Most show one view only; the player's side then
    # uses the same art mirrored so it faces the opponent.
    'wraithling': {
        'front': dict(box=(20, 80, 310, 492), fit=(50, 62), sat=1.05, tol=40),
        'back': dict(box=(20, 80, 310, 492), fit=(50, 62), sat=1.05, tol=40, flip=True),
        'icon': dict(box=(322, 95, 432, 250), fit=(22, 28), sat=1.05, tol=40),
    },
    'umbrafang': {
        'front': dict(box=(778, 85, 1122, 482), fit=(62, 62), sat=1.05, tol=40, holes=24, erase=[(1096, 85, 1122, 262)]),
        'back': dict(box=(778, 85, 1122, 482), fit=(62, 62), sat=1.05, tol=40, holes=24, flip=True, erase=[(1096, 85, 1122, 262)]),
        'icon': dict(box=(1100, 86, 1242, 252), fit=(28, 28), sat=1.05, tol=40, holes=24, erase=[(1100, 150, 1112, 252), (1220, 186, 1242, 252)]),
    },
    'flambramble': {
        'front': dict(box=(28, 582, 332, 988), fit=(56, 62), sat=1.05, tol=34),
        'back': dict(box=(28, 582, 332, 988), fit=(56, 62), sat=1.05, tol=34, flip=True),
        'icon': dict(box=(318, 588, 468, 752), fit=(26, 28), sat=1.05, tol=34),
    },
    'tidepup': {
        'front': dict(box=(28, 78, 260, 308), fit=(52, 50), sat=1.05, tol=30),
        'back': dict(box=(28, 78, 260, 308), fit=(52, 50), sat=1.05, tol=30, flip=True),
        'icon': dict(box=(28, 78, 260, 308), fit=(26, 26), sat=1.05, tol=30),
    },
    'tidefin': {
        'front': dict(box=(148, 622, 372, 848), fit=(60, 58), sat=1.05, tol=30),
        'back': dict(box=(148, 622, 372, 848), fit=(60, 58), sat=1.05, tol=30, flip=True),
        'icon': dict(box=(148, 622, 372, 848), fit=(28, 28), sat=1.05, tol=30),
    },
    'reefwhirl': {
        'front': dict(box=(512, 58, 762, 318), fit=(56, 58), sat=1.05, tol=30),
        'back': dict(box=(512, 58, 762, 318), fit=(56, 58), sat=1.05, tol=30, flip=True),
        'icon': dict(box=(512, 58, 762, 318), fit=(26, 28), sat=1.05, tol=30),
    },
    'reeflord': {
        'front': dict(box=(628, 614, 912, 848), fit=(62, 60), sat=1.05, tol=30),
        'back': dict(box=(628, 614, 912, 848), fit=(62, 60), sat=1.05, tol=30, flip=True),
        'icon': dict(box=(628, 614, 912, 848), fit=(28, 28), sat=1.05, tol=30),
    },
    'skydrift': {
        'front': dict(box=(1012, 48, 1288, 334), fit=(58, 60), sat=1.05, tol=30, flip=True),
        'back': dict(box=(1012, 48, 1288, 334), fit=(58, 60), sat=1.05, tol=30),
        'icon': dict(box=(1012, 48, 1288, 334), fit=(28, 28), sat=1.05, tol=30, flip=True),
    },
    'skyseraph': {
        'front': dict(box=(1072, 612, 1482, 860), fit=(64, 44), sat=1.05, tol=30),
        'back': dict(box=(1072, 612, 1482, 860), fit=(64, 44), sat=1.05, tol=30, flip=True),
        'icon': dict(box=(1072, 612, 1482, 860), fit=(30, 22), sat=1.05, tol=30),
    },
    'voltimp': {
        'front': dict(box=(48, 122, 392, 528), fit=(54, 58), sat=1.05, tol=30),
        'back': dict(box=(288, 672, 448, 882), fit=(48, 58), sat=1.05, tol=30),
        'icon': dict(box=(62, 672, 218, 878), fit=(24, 28), sat=1.05, tol=30),
    },
    'stormgale': {
        'front': dict(box=(818, 658, 1018, 898), fit=(58, 62), sat=1.05, tol=30),
        'back': dict(box=(1058, 662, 1258, 898), fit=(56, 62), sat=1.05, tol=30),
        'icon': dict(box=(818, 658, 1018, 898), fit=(26, 28), sat=1.05, tol=30),
    },
    'tuner': {
        'front': dict(box=(102, 982, 266, 1122), fit=(48, 44), sat=1.05, tol=30),
        'back': dict(box=(102, 982, 266, 1122), fit=(48, 44), sat=1.05, tol=30, flip=True),
        'icon': dict(box=(102, 982, 266, 1122), fit=(26, 24), sat=1.05, tol=30),
    },
    'sonarion': {
        'front': dict(box=(376, 676, 604, 838), fit=(62, 50), sat=1.05, tol=30),
        'back': dict(box=(202, 676, 358, 838), fit=(54, 58), sat=1.05, tol=30),
        'icon': dict(box=(46, 676, 184, 838), fit=(26, 28), sat=1.05, tol=30),
    },
    'mellowcap': {
        'front': dict(box=(280, 655, 560, 878), fit=(62, 50), sat=1.5),
        'back': dict(box=(605, 663, 765, 878), fit=(56, 60), sat=1.5),
        'icon': dict(box=(60, 655, 210, 878), fit=(24, 28), sat=1.5),
    },
}

# Views that should be mirrored (the sheets' side views face left, which is
# already right for an opponent; nothing needs flipping by default).
FLIP = set()


def load_sheets(pdf_paths):
    out = []
    for path in pdf_paths:
        doc = pymupdf.open(path)
        imgs = []
        for info in doc[0].get_images():
            pix = pymupdf.Pixmap(doc, info[0])
            if pix.n - pix.alpha > 3:
                pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
            imgs.append(Image.open(io.BytesIO(pix.tobytes('png'))).convert('RGB'))
        out.append(imgs)
    return out


def key_background(img, tol_global=34.0, tol_local=10.0):
    """Flood-fill the panel background in from the crop border."""
    a = np.asarray(img).astype(np.float32)
    h, w, _ = a.shape
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    ref = np.median(border, axis=0)
    dist_ref = np.sqrt(((a - ref) ** 2).sum(axis=2))
    bg = np.zeros((h, w), dtype=bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if dist_ref[y, x] < tol_global and not bg[y, x]:
                bg[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if dist_ref[y, x] < tol_global and not bg[y, x]:
                bg[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        c = a[y, x]
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and not bg[ny, nx]:
                if dist_ref[ny, nx] < tol_global or (
                        dist_ref[ny, nx] < tol_global * 1.6 and
                        np.sqrt(((a[ny, nx] - c) ** 2).sum()) < tol_local):
                    bg[ny, nx] = True
                    q.append((ny, nx))
    return ~bg


def drop_specks(mask, min_frac=0.004):
    """Remove small disconnected bits (label fragments, stray leaves)."""
    h, w = mask.shape
    seen = np.zeros_like(mask)
    total = mask.sum()
    keep = np.zeros_like(mask)
    for sy in range(h):
        for sx in range(w):
            if mask[sy, sx] and not seen[sy, sx]:
                comp = []
                q = deque([(sy, sx)])
                seen[sy, sx] = True
                while q:
                    y, x = q.popleft()
                    comp.append((y, x))
                    for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True
                            q.append((ny, nx))
                if len(comp) >= total * min_frac:
                    for y, x in comp:
                        keep[y, x] = True
    return keep


def shrink(img, mask, fit):
    """Area-average downscale with premultiplied alpha, then threshold."""
    ys, xs = np.nonzero(mask)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    rgb = np.asarray(img).astype(np.float32)[y0:y1, x0:x1]
    alpha = mask[y0:y1, x0:x1].astype(np.float32)
    h, w = alpha.shape
    scale = min(fit[0] / w, fit[1] / h)
    tw, th = max(1, round(w * scale)), max(1, round(h * scale))
    pre = np.dstack([rgb * alpha[..., None], alpha * 255])
    pim = Image.fromarray(pre.clip(0, 255).astype(np.uint8), 'RGBA')
    small = np.asarray(pim.resize((tw, th), Image.BOX)).astype(np.float32)
    al = small[..., 3] / 255.0
    col = np.where(al[..., None] > 0.01, small[..., :3] / np.maximum(al[..., None], 0.01), 0)
    return col.clip(0, 255), al > 0.5


def enhance(rgb, sat):
    im = Image.fromarray(rgb.astype(np.uint8), 'RGB')
    im = ImageEnhance.Color(im).enhance(sat)
    im = ImageEnhance.Contrast(im).enhance(1.12)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=70, threshold=2))
    return np.asarray(im).astype(np.float32)


def outline(rgb, opaque):
    """Darken the outermost ring of pixels, GBA style."""
    h, w = opaque.shape
    pad = np.pad(opaque, 1)
    edge = opaque & ~(pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:])
    out = rgb.copy()
    dark = rgb * np.array([0.30, 0.28, 0.34])
    out[edge] = dark[edge]
    return out


def quantize(rgb, opaque, colors=15):
    pts = rgb[opaque].astype(np.uint8)
    strip = Image.fromarray(pts.reshape(1, -1, 3), 'RGB')
    q = strip.quantize(colors=colors, method=Image.Quantize.MEDIANCUT,
                       dither=Image.Dither.NONE, kmeans=4)
    pal = np.array(q.getpalette()[:colors * 3]).reshape(-1, 3)
    idx = np.asarray(q).reshape(-1)
    out = np.zeros(rgb.shape[:2] + (4,), dtype=np.uint8)
    out[opaque, :3] = pal[idx]
    out[opaque, 3] = 255
    return out


def make_sprite(sheet, view, frame):
    crop = sheet.crop(view['box'])
    if view.get('erase'):
        # Paint over bits of neighbouring art that fall inside the box.
        bx, by = view['box'][:2]
        a = np.asarray(crop).copy()
        ref = np.median(np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]), axis=0)
        for x0, y0, x1, y1 in view['erase']:
            a[max(0, y0 - by):y1 - by, max(0, x0 - bx):x1 - bx] = ref
        crop = Image.fromarray(a)
    if view.get('flip'):
        crop = crop.transpose(Image.FLIP_LEFT_RIGHT)
    mask = key_background(crop, tol_global=view.get('tol', 34.0))
    if view.get('holes'):
        # Background showing through gaps enclosed by the body (between legs).
        a = np.asarray(crop).astype(np.float32)
        ref = np.median(np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]), axis=0)
        mask &= np.sqrt(((a - ref) ** 2).sum(axis=2)) >= view['holes']
    mask = drop_specks(mask)
    rgb, opaque = shrink(crop, mask, view['fit'])
    rgb = enhance(rgb, view.get('sat', 1.25))
    rgb = outline(rgb, opaque)
    rgba = quantize(rgb, opaque)
    h, w = opaque.shape
    canvas = Image.new('RGBA', (frame, frame), (0, 0, 0, 0))
    # Centre horizontally, sit on the bottom edge (feet on the platform).
    canvas.paste(Image.fromarray(rgba, 'RGBA'), ((frame - w) // 2, frame - h))
    return canvas


def write_sprite_data(sprite_dir):
    js = ['// Generated by tools/make_sprites.py from the design sheets. Do not edit.',
          'window.SPRITE_DATA = {']
    for name in sorted(os.listdir(sprite_dir)):
        if not name.endswith('.png'):
            continue
        with open(os.path.join(sprite_dir, name), 'rb') as f:
            uri = 'data:image/png;base64,' + base64.b64encode(f.read()).decode()
        js.append(f"  {name[:-4]}: '{uri}',")
    js.append('};')
    out = os.path.join(ROOT, 'js', 'data', 'sprite_data.js')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w') as f:
        f.write('\n'.join(js) + '\n')
    print('wrote', out)


def main():
    pdfs = sys.argv[1:]
    if pdfs and len(pdfs) != 2:
        print(__doc__)
        sys.exit(1)
    pdf_sheets = load_sheets(pdfs) if pdfs else None
    sprite_dir = os.path.join(ROOT, 'assets', 'sprites')
    os.makedirs(sprite_dir, exist_ok=True)
    only = set(filter(None, os.environ.get('ONLY', '').split(',')))
    for mon, src in SHEETS.items():
        if only and mon not in only:
            continue
        if isinstance(src, tuple):
            if not pdf_sheets:
                continue
            sheet = pdf_sheets[src[0]][src[1]]
        else:
            sheet = Image.open(os.path.join(ROOT, 'art', 'sheets', src)).convert('RGB')
        for kind, view in VIEWS[mon].items():
            frame = 32 if kind == 'icon' else 64
            spr = make_sprite(sheet, view, frame)
            if (mon, kind) in FLIP:
                spr = spr.transpose(Image.FLIP_LEFT_RIGHT)
            path = os.path.join(sprite_dir, f'{mon}_{kind}.png')
            spr.save(path, optimize=True)
            print('wrote', path)
    write_sprite_data(sprite_dir)


if __name__ == '__main__':
    main()
