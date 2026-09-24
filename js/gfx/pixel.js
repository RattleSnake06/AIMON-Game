'use strict';
// Pixel-art helpers. Everything in the game is drawn onto small offscreen
// canvases once at start-up and then blitted, so the look stays crisp.

const Pix = {
  canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    return c;
  },

  // Build an image from rows of characters. '.' and ' ' are transparent;
  // every other character is looked up in the palette.
  fromRows(rows, pal) {
    const h = rows.length;
    const w = Math.max(...rows.map((r) => r.length));
    const c = this.canvas(w, h);
    const g = c.getContext('2d');
    for (let y = 0; y < h; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === '.' || ch === ' ') continue;
        const col = pal[ch];
        if (!col) continue;
        g.fillStyle = col;
        g.fillRect(x, y, 1, 1);
      }
    }
    return c;
  },

  flipH(src) {
    const c = this.canvas(src.width, src.height);
    const g = c.getContext('2d');
    g.translate(src.width, 0);
    g.scale(-1, 1);
    g.drawImage(src, 0, 0);
    return c;
  },

  // Solid-colour copy of an image's silhouette (hit flashes, ball glow...).
  silhouette(src, color) {
    const c = this.canvas(src.width, src.height);
    const g = c.getContext('2d');
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = color;
    g.fillRect(0, 0, c.width, c.height);
    return c;
  },

  // Tint an image by blending a colour over it (keeps alpha).
  tint(src, color, amount) {
    const c = this.canvas(src.width, src.height);
    const g = c.getContext('2d');
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    g.globalAlpha = amount;
    g.fillStyle = color;
    g.fillRect(0, 0, c.width, c.height);
    return c;
  },

  // Filled ellipse drawn with whole pixels (canvas arcs would anti-alias).
  ellipse(g, cx, cy, rx, ry, color) {
    g.fillStyle = color;
    for (let y = -ry; y <= ry; y++) {
      const t = 1 - (y * y) / (ry * ry + 0.0001);
      if (t < 0) continue;
      const half = Math.round(rx * Math.sqrt(t));
      g.fillRect(Math.round(cx - half), Math.round(cy + y), half * 2 + 1, 1);
    }
  },

  rect(g, x, y, w, h, color) {
    g.fillStyle = color;
    g.fillRect(x, y, w, h);
  },

  // Colour helpers ---------------------------------------------------------
  hex(c) {
    const n = parseInt(c.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  },
  toHex(r, g, b) {
    const f = (v) => U.clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
    return `#${f(r)}${f(g)}${f(b)}`;
  },
  shade(c, k) {
    const [r, g, b] = this.hex(c);
    return this.toHex(r * k, g * k, b * k);
  },
  mix(a, b, t) {
    const x = this.hex(a);
    const y = this.hex(b);
    return this.toHex(U.lerp(x[0], y[0], t), U.lerp(x[1], y[1], t), U.lerp(x[2], y[2], t));
  },
};

// ---------------------------------------------------------------------------
// Painter: a palette-indexed grid for building larger sprites (trainers,
// the professor) out of outlined, shaded shapes, the way GBA art is layered.

class Painter {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.px = new Array(w * h).fill(null);
  }

  set(x, y, c) {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.px[y * this.w + x] = c;
  }

  get(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.px[y * this.w + x];
  }

  // Fill a shape given by inside(x, y), with a 1px outline on its border and
  // light/shade bands. `light` comes from the top-left.
  shape(inside, box, style) {
    const [x0, y0, x1, y1] = box;
    const mask = new Set();
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (inside(x + 0.5, y + 0.5)) mask.add(y * 4096 + x);
      }
    }
    const has = (x, y) => mask.has(y * 4096 + x);
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const hw = Math.max(1, (x1 - x0) / 2);
    const hh = Math.max(1, (y1 - y0) / 2);
    for (const k of mask) {
      const x = k % 4096;
      const y = Math.floor(k / 4096);
      const edge = !has(x - 1, y) || !has(x + 1, y) || !has(x, y - 1) || !has(x, y + 1);
      let c = style.fill;
      if (edge && style.line !== false) {
        const skip = style.openTop && !has(x, y - 1) && has(x - 1, y) && has(x + 1, y);
        c = skip ? style.fill : (style.line || '#202020');
      } else {
        const lx = (x - cx) / hw;
        const ly = (y - cy) / hh;
        const d = lx * (style.lx ?? 0.6) + ly * (style.ly ?? 0.8);
        if (style.shade && d > (style.shadeAt ?? 0.35)) c = style.shade;
        if (style.hi && d < (style.hiAt ?? -0.55)) c = style.hi;
      }
      this.set(x, y, c);
    }
  }

  ellipse(cx, cy, rx, ry, style) {
    this.shape((x, y) => ((x - cx) ** 2) / (rx * rx) + ((y - cy) ** 2) / (ry * ry) <= 1,
      [Math.floor(cx - rx), Math.floor(cy - ry), Math.ceil(cx + rx), Math.ceil(cy + ry)], style);
  }

  rect(x, y, w, h, style) {
    this.shape((px, py) => px >= x && px <= x + w && py >= y && py <= y + h,
      [Math.floor(x), Math.floor(y), Math.ceil(x + w), Math.ceil(y + h)], style);
  }

  // Rounded rectangle.
  rrect(x, y, w, h, r, style) {
    const inside = (px, py) => {
      const qx = Math.max(Math.abs(px - (x + w / 2)) - (w / 2 - r), 0);
      const qy = Math.max(Math.abs(py - (y + h / 2)) - (h / 2 - r), 0);
      return qx * qx + qy * qy <= r * r;
    };
    this.shape(inside, [Math.floor(x), Math.floor(y), Math.ceil(x + w), Math.ceil(y + h)], style);
  }

  poly(pts, style) {
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const inside = (px, py) => {
      let c = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i];
        const [xj, yj] = pts[j];
        if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
    this.shape(inside, [Math.floor(Math.min(...xs)), Math.floor(Math.min(...ys)),
      Math.ceil(Math.max(...xs)), Math.ceil(Math.max(...ys))], style);
  }

  line(x0, y0, x1, y1, c) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) this.set(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, c);
  }

  // Paint rows of characters at (ox, oy) using a palette (for faces etc).
  rows(ox, oy, rows, pal) {
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch !== '.' && ch !== ' ' && pal[ch]) this.set(ox + x, oy + y, pal[ch]);
      }
    });
  }

  toCanvas() {
    const c = Pix.canvas(this.w, this.h);
    const g = c.getContext('2d');
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const col = this.px[y * this.w + x];
        if (col) {
          g.fillStyle = col;
          g.fillRect(x, y, 1, 1);
        }
      }
    }
    return c;
  }
}
