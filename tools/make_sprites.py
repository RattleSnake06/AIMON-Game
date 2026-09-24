#!/usr/bin/env python3
"""Turn the AIMON design sheets into GBA-style battle sprites.

The design PDFs contain one large sheet per creature, each with a
Front / Side / Back turnaround on a plain panel. This script cuts those
views out, keys away the panel background, shrinks them to 64x64,
reduces them to a 15-colour palette (the GBA sprite limit) and adds a
dark outline, then writes:

  assets/sprites/<mon>_front.png, <mon>_back.png, <mon>_icon.png
  js/data/sprite_data.js   (the same PNGs as data URIs, so the game
                            also runs straight from file://)

Usage:
  pip install pymupdf pillow numpy
  python3 tools/make_sprites.py starter_mons.pdf route_1_mons.pdf
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

# (pdf index, image index on the page) -> which creature sheet it is.
SHEETS = {
    'skylavine': (0, 2),
    'archepin': (0, 0),
    'moltarock': (0, 1),
    'goskie': (1, 0),
    'mellowcap': (1, 1),
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
    mask = drop_specks(key_background(crop, tol_global=view.get('tol', 34.0)))
    rgb, opaque = shrink(crop, mask, view['fit'])
    rgb = enhance(rgb, view.get('sat', 1.25))
    rgb = outline(rgb, opaque)
    rgba = quantize(rgb, opaque)
    h, w = opaque.shape
    canvas = Image.new('RGBA', (frame, frame), (0, 0, 0, 0))
    # Centre horizontally, sit on the bottom edge (feet on the platform).
    canvas.paste(Image.fromarray(rgba, 'RGBA'), ((frame - w) // 2, frame - h))
    return canvas


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    sheets = load_sheets(sys.argv[1:3])
    sprite_dir = os.path.join(ROOT, 'assets', 'sprites')
    os.makedirs(sprite_dir, exist_ok=True)
    uris = {}
    for mon, (pdf_i, img_i) in SHEETS.items():
        sheet = sheets[pdf_i][img_i]
        for kind, view in VIEWS[mon].items():
            frame = 32 if kind == 'icon' else 64
            spr = make_sprite(sheet, view, frame)
            if (mon, kind) in FLIP:
                spr = spr.transpose(Image.FLIP_LEFT_RIGHT)
            path = os.path.join(sprite_dir, f'{mon}_{kind}.png')
            spr.save(path, optimize=True)
            buf = io.BytesIO()
            spr.save(buf, 'PNG', optimize=True)
            uris[f'{mon}_{kind}'] = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()
            print('wrote', path)
    js = ['// Generated by tools/make_sprites.py from the design sheets. Do not edit.',
          'window.SPRITE_DATA = {']
    for k, v in uris.items():
        js.append(f"  {k}: '{v}',")
    js.append('};')
    out = os.path.join(ROOT, 'js', 'data', 'sprite_data.js')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w') as f:
        f.write('\n'.join(js) + '\n')
    print('wrote', out)


if __name__ == '__main__':
    main()
