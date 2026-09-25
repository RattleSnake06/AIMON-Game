"""A small engine for drawing GBA-style creature sprites from shapes.

A creature is a list of parts, each a signed distance field (negative
inside) with a colour ramp. Parts are drawn back to front with cel shading
(light from the upper left), then the image is reduced to the sprite size,
given dark outlines around the silhouette and between overlapping parts,
and finished with hand-placed pixel details such as eyes.

Coordinates are in sprite pixels (0-64) whatever the output size.
"""
import colorsys

import numpy as np
from PIL import Image

BASE = 64          # design space
SS = 4             # samples per pixel at 64x64
LIGHT = np.array([-0.55, -0.75, 0.5])
LIGHT = LIGHT / np.linalg.norm(LIGHT)


# ---- colours --------------------------------------------------------------------
def rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def _shift(c, dh=0.0, ds=0.0, dv=1.0):
    r, g, b = (v / 255 for v in c)
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    h = (h + dh) % 1.0
    s = min(1.0, max(0.0, s + ds))
    v = min(1.0, max(0.0, v * dv))
    return tuple(int(round(x * 255)) for x in colorsys.hsv_to_rgb(h, s, v))


def _toward(h, target, amt):
    """Move hue h a little toward target hue (both 0-1)."""
    d = ((target - h + 0.5) % 1.0) - 0.5
    return d * amt


def ramp(base, dark=None, light=None, high=None, line=None):
    """Five tones: outline, shadow, base, light, highlight. Shadows lean
    toward blue/purple and lights toward yellow, as in hand-made ramps."""
    b = rgb(base) if isinstance(base, str) else base
    h = colorsys.rgb_to_hsv(*(v / 255 for v in b))[0]
    d = rgb(dark) if dark else _shift(b, _toward(h, 0.7, 0.12), 0.08, 0.68)
    l = rgb(light) if light else _shift(b, _toward(h, 0.15, 0.08), -0.08, 1.2)
    hi = rgb(high) if high else _shift(l, _toward(h, 0.15, 0.08), -0.22, 1.12)
    o = rgb(line) if line else _shift(d, _toward(h, 0.72, 0.2), 0.12, 0.42)
    return [o, d, b, l, hi]


# ---- signed distance fields ---------------------------------------------------------
class Canvas:
    def __init__(self, n=64):
        self.n = n
        m = BASE * SS
        c = (np.arange(m) + 0.5) / SS
        self.X, self.Y = np.meshgrid(c, c)

    # primitives -----------------------------------------------------------------
    def circle(self, cx, cy, r):
        return np.hypot(self.X - cx, self.Y - cy) - r

    def ellipse(self, cx, cy, rx, ry, rot=0.0):
        x, y = self.X - cx, self.Y - cy
        if rot:
            a = np.radians(rot)
            x, y = x * np.cos(a) + y * np.sin(a), -x * np.sin(a) + y * np.cos(a)
        k = np.hypot(x / rx, y / ry)
        return (k - 1) * min(rx, ry)

    def capsule(self, ax, ay, bx, by, ra, rb=None):
        rb = ra if rb is None else rb
        px, py = self.X - ax, self.Y - ay
        dx, dy = bx - ax, by - ay
        L2 = dx * dx + dy * dy or 1e-6
        t = np.clip((px * dx + py * dy) / L2, 0, 1)
        d = np.hypot(px - dx * t, py - dy * t)
        return d - (ra + (rb - ra) * t)

    def stroke(self, pts, radii):
        """Tapered tube through a list of points."""
        if not isinstance(radii, (list, tuple)):
            radii = [radii] * len(pts)
        d = None
        for i in range(len(pts) - 1):
            s = self.capsule(*pts[i], *pts[i + 1], radii[i], radii[i + 1])
            d = s if d is None else np.minimum(d, s)
        return d

    def poly(self, pts, r=0.0):
        """Polygon (optionally rounded by r)."""
        P = np.array(pts, dtype=float)
        x, y = self.X, self.Y
        d = np.full(x.shape, np.inf)
        s = np.ones(x.shape)
        n = len(P)
        for i in range(n):
            ax, ay = P[i - 1]
            bx, by = P[i]
            ex, ey = bx - ax, by - ay
            wx, wy = x - ax, y - ay
            t = np.clip((wx * ex + wy * ey) / (ex * ex + ey * ey), 0, 1)
            d = np.minimum(d, np.hypot(wx - ex * t, wy - ey * t))
            c1 = y >= ay
            c2 = y < by
            c3 = ex * wy > ey * wx
            flip = (c1 & c2 & c3) | (~c1 & ~c2 & ~c3)
            s = np.where(flip, -s, s)
        return s * d - r

    def rect(self, x0, y0, x1, y1, r=0.0):
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        hx, hy = (x1 - x0) / 2 - r, (y1 - y0) / 2 - r
        qx = np.abs(self.X - cx) - hx
        qy = np.abs(self.Y - cy) - hy
        out = np.hypot(np.maximum(qx, 0), np.maximum(qy, 0))
        return out + np.minimum(np.maximum(qx, qy), 0) - r

    # combinators ----------------------------------------------------------------------
    @staticmethod
    def union(*ds):
        out = ds[0]
        for d in ds[1:]:
            out = np.minimum(out, d)
        return out

    @staticmethod
    def smooth(a, b, k=3.0):
        h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
        return b * (1 - h) + a * h - k * h * (1 - h)

    @staticmethod
    def cut(a, b):
        return np.maximum(a, -b)

    @staticmethod
    def inter(a, b):
        return np.maximum(a, b)

    # noise / cells -------------------------------------------------------------------------
    def noise(self, scale, seed=0):
        rng = np.random.default_rng(seed)
        g = rng.random((int(BASE / scale) + 3, int(BASE / scale) + 3))
        x, y = self.X / scale, self.Y / scale
        x0, y0 = np.floor(x).astype(int), np.floor(y).astype(int)
        fx, fy = x - x0, y - y0
        fx, fy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
        a = g[y0, x0] * (1 - fx) + g[y0, x0 + 1] * fx
        b = g[y0 + 1, x0] * (1 - fx) + g[y0 + 1, x0 + 1] * fx
        return a * (1 - fy) + b * fy

    def cells(self, pts):
        """Voronoi: (index of nearest point, edge distance)."""
        P = np.array(pts, dtype=float)
        d = np.stack([np.hypot(self.X - px, self.Y - py) for px, py in P])
        o = np.sort(d, axis=0)
        return np.argmin(d, axis=0), (o[1] - o[0]) / 2


# ---- parts and rendering -----------------------------------------------------------------
class Part:
    def __init__(self, sdf, mat, round=5.0, line=True, group=None, emit=False,
                 levels=None, shade=0, cast=True, flat=None):
        self.sdf = sdf
        self.mat = mat              # ramp (5 colours) or callable
        self.round = round          # how domed the shading is
        self.line = line            # draw a contour where it overlaps other parts
        self.group = group          # parts in the same group don't get lines between them
        self.emit = emit            # glowing: not shaded
        self.levels = levels        # optional array of ramp levels (overrides lighting)
        self.shade = shade          # shift the lighting (+ brighter, - darker)
        self.cast = cast            # casts a shadow on parts behind
        self.flat = flat            # a fixed ramp level


class Sprite:
    def __init__(self):
        self.cv = Canvas()
        self.parts = []
        self.details = []           # (fn) called with a PixelLayer after outlining

    def add(self, sdf, mat, **kw):
        p = Part(sdf, mat, **kw)
        self.parts.append(p)
        return p

    def detail(self, fn):
        self.details.append(fn)

    # --------------------------------------------------------------------------------------
    def _shade(self, p):
        d = p.sdf
        gy, gx = np.gradient(d, 1.0 / SS)
        gl = np.hypot(gx, gy) + 1e-6
        gx, gy = gx / gl, gy / gl
        t = np.clip(-d / p.round, 0, 1)
        nz = np.sqrt(1 - (1 - t) ** 2)
        k = np.sqrt(np.clip(1 - nz * nz, 0, 1))
        I = gx * k * LIGHT[0] + gy * k * LIGHT[1] + nz * LIGHT[2]
        I = I + p.shade * 0.25
        lv = np.full(d.shape, 2)
        lv[I < 0.36] = 1
        lv[I >= 0.66] = 3
        lv[I >= 0.9] = 4
        return lv

    def render_hi(self):
        m = BASE * SS
        label = np.full((m, m), -1, dtype=int)
        level = np.zeros((m, m), dtype=int)
        for i, p in enumerate(self.parts):
            inside = p.sdf < 0
            if p.levels is not None:
                lv = p.levels
            elif p.flat is not None:
                lv = np.full((m, m), p.flat)
            elif p.emit:
                lv = np.full((m, m), 3)
            else:
                lv = self._shade(p)
            label[inside] = i
            level[inside] = lv[inside]
        # Cast shadows: a part in front darkens what lies just behind it,
        # down and to the right (away from the light).
        off = int(1.6 * SS)
        src = np.full_like(label, -1)
        src[off:, off:] = label[:-off, :-off]
        z = np.arange(len(self.parts))
        casts = np.array([p.cast and not p.emit for p in self.parts] + [False])
        lit = np.array([p.levels is None and p.flat is None and not p.emit for p in self.parts] + [False])
        front = (src > label) & (label >= 0) & casts[src] & lit[label]
        level[front] = np.maximum(1, level[front] - 1)
        _ = z
        return label, level

    def colour_of(self, label, level):
        m = label.shape[0]
        out = np.zeros((m, m, 3), dtype=np.uint8)
        for i, p in enumerate(self.parts):
            sel = label == i
            if not sel.any():
                continue
            if callable(p.mat):
                col = p.mat(self.cv, level)
                out[sel] = col[sel]
            else:
                pal = np.array(p.mat, dtype=np.uint8)
                out[sel] = pal[level[sel]]
        return out

    def render(self, n=64):
        label, level = self.render_hi()
        colour = self.colour_of(label, level)
        s = BASE * SS // n
        L = label.reshape(n, s, n, s).transpose(0, 2, 1, 3).reshape(n, n, s * s)
        C = colour.reshape(n, s, n, s, 3).transpose(0, 2, 1, 3, 4).reshape(n, n, s * s, 3)
        lab = np.full((n, n), -1, dtype=int)
        col = np.zeros((n, n, 3), dtype=np.uint8)
        for y in range(n):
            for x in range(n):
                ls = L[y, x]
                if (ls >= 0).sum() * 2 < s * s:
                    continue
                vals, counts = np.unique(ls[ls >= 0], return_counts=True)
                best = vals[np.argmax(counts + vals * 1e-3)]
                cs = C[y, x][ls == best]
                u, k = np.unique(cs, axis=0, return_counts=True)
                lab[y, x] = best
                col[y, x] = u[np.argmax(k)]
        return self._outline(lab, col, n)

    def _outline(self, lab, col, n):
        parts = self.parts
        out = np.zeros((n, n, 4), dtype=np.uint8)
        op = lab >= 0
        out[op, :3] = col[op]
        out[op, 3] = 255

        def line_col(i):
            p = parts[i]
            if callable(p.mat):
                return getattr(p.mat, 'line', (40, 32, 40))
            return p.mat[0]

        # Contours between overlapping parts (drawn on the part behind).
        res = out.copy()
        for y in range(n):
            for x in range(n):
                a = lab[y, x]
                if a < 0:
                    continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    xx, yy = x + dx, y + dy
                    if not (0 <= xx < n and 0 <= yy < n):
                        continue
                    b = lab[yy, xx]
                    if b > a and parts[b].line and not parts[a].emit:
                        if parts[b].group is not None and parts[b].group == parts[a].group:
                            continue
                        res[y, x, :3] = line_col(b)
                        break
        out = res
        # Outer outline, one pixel outside the silhouette.
        res = out.copy()
        for y in range(n):
            for x in range(n):
                if lab[y, x] >= 0:
                    continue
                best = -1
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    xx, yy = x + dx, y + dy
                    if 0 <= xx < n and 0 <= yy < n and lab[yy, xx] >= 0:
                        best = max(best, lab[yy, xx])
                if best >= 0:
                    res[y, x, :3] = line_col(best)
                    res[y, x, 3] = 255
        img = Image.fromarray(res, 'RGBA').copy()
        layer = PixelLayer(img, n)
        for fn in self.details:
            fn(layer)
        return layer.img


class PixelLayer:
    """Hand-placed pixels, given in 64-space and scaled to the output."""
    def __init__(self, img, n):
        self.img = img
        self.n = n
        self.k = n / BASE
        self.px = img.load()

    def dot(self, x, y, c, small=True):
        """A single pixel (or a scaled block at larger sizes)."""
        c = rgb(c) if isinstance(c, str) else c
        X, Y = int(x * self.k), int(y * self.k)
        if 0 <= X < self.n and 0 <= Y < self.n:
            self.px[X, Y] = c + (255,)

    def stamp(self, x, y, rows, pal):
        """Pixel art rows at 64-space (x, y); only drawn at full size."""
        if self.n != BASE:
            return
        for j, row in enumerate(rows):
            for i, ch in enumerate(row):
                if ch in pal:
                    c = pal[ch]
                    c = rgb(c) if isinstance(c, str) else c
                    if 0 <= x + i < self.n and 0 <= y + j < self.n:
                        self.px[x + i, y + j] = c + (255,)

    def small(self, fn):
        """Details for the reduced (icon) size only."""
        if self.n != BASE:
            fn(self)


def facets(cv, bx, by, tx, ty):
    """Ramp levels for a crystal: lit face on the left, shaded on the right."""
    side = (tx - bx) * (cv.Y - by) - (ty - by) * (cv.X - bx)
    L = np.hypot(tx - bx, ty - by)
    lv = np.where(side > 0, 1, 3)
    lv[(side <= 0) & (side / L > -0.8)] = 4
    return lv


def fit(img, size, pad=1):
    """Crop to the content and place on a size x size canvas, feet at the bottom."""
    bb = img.getbbox()
    if not bb:
        return img
    c = img.crop(bb)
    out = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    out.paste(c, ((size - c.width) // 2, size - c.height - pad))
    return out
