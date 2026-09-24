'use strict';
// Windows, bars and other interface pieces, drawn straight onto the screen.

const WINDOW_STYLES = {
  field: { outer: '#384058', rim: '#e8f0f8', rim2: '#88a0c8', bg: '#f8f8f8', text: '#404048', shadow: '#d0d0c8' },
  battle: { outer: '#201818', rim: '#e07850', rim2: '#983828', bg: '#28405a', text: '#f8f8f8', shadow: '#586878' },
  dark: { outer: '#101820', rim: '#708098', rim2: '#384858', bg: '#203040', text: '#f8f8f8', shadow: '#485868' },
  sign: { outer: '#403020', rim: '#d8b078', rim2: '#a07848', bg: '#f8f0d8', text: '#404048', shadow: '#d8d0b8' },
};

const UI = {
  window(g, x, y, w, h, style = 'field') {
    const s = WINDOW_STYLES[style] || WINDOW_STYLES.field;
    // Outer line with clipped corners.
    g.fillStyle = s.outer;
    g.fillRect(x + 2, y, w - 4, h);
    g.fillRect(x, y + 2, w, h - 4);
    g.fillRect(x + 1, y + 1, w - 2, h - 2);
    // Frame.
    g.fillStyle = s.rim;
    g.fillRect(x + 2, y + 1, w - 4, h - 2);
    g.fillRect(x + 1, y + 2, w - 2, h - 4);
    g.fillStyle = s.rim2;
    g.fillRect(x + 3, y + 2, w - 6, h - 4);
    g.fillRect(x + 2, y + 3, w - 4, h - 6);
    // Paper.
    g.fillStyle = s.bg;
    g.fillRect(x + 4, y + 3, w - 8, h - 6);
    g.fillRect(x + 3, y + 4, w - 6, h - 8);
  },

  text(g, str, x, y, style = 'field') {
    const s = WINDOW_STYLES[style] || WINDOW_STYLES.field;
    Font.draw(g, str, x, y, s.text, s.shadow);
  },

  cursor(g, x, y, style = 'field') {
    const s = WINDOW_STYLES[style] || WINDOW_STYLES.field;
    Font.draw(g, '▶', x, y, s.text, s.shadow);
  },

  // Blinking "more text" arrow.
  moreArrow(g, x, y, style = 'field') {
    const s = WINDOW_STYLES[style] || WINDOW_STYLES.field;
    const bob = Math.floor(Game.frame / 8) % 4;
    Font.draw(g, '▼', x, y - 3 + (bob === 1 || bob === 2 ? 1 : 0), style === 'battle' ? '#f8d030' : '#e05038', s.shadow);
  },

  hpColor(frac) {
    if (frac > 0.5) return ['#70f8a8', '#58d080'];
    if (frac > 0.2) return ['#f8e038', '#c8a808'];
    return ['#f85838', '#a84048'];
  },

  // HP bar with the little "HP" tag, 48px of bar by default.
  hpBar(g, x, y, frac, w = 48) {
    g.fillStyle = '#404040';
    g.fillRect(x, y, w + 16, 5);
    g.fillStyle = '#f8b030';
    g.fillRect(x + 1, y + 1, 13, 3);
    g.fillStyle = '#f8f8f8';
    // Tiny "HP" letters.
    const hp = ['#.#.###', '###.###', '#.#.#..'];
    hp.forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx++) if (row[rx] === '#') g.fillRect(x + 4 + rx, y + 1 + ry, 1, 1);
    });
    g.fillStyle = '#506858';
    g.fillRect(x + 15, y + 1, w, 3);
    const fill = Math.max(frac > 0 ? 1 : 0, Math.round(w * U.clamp(frac, 0, 1)));
    const [hi, lo] = this.hpColor(frac);
    g.fillStyle = lo;
    g.fillRect(x + 15, y + 1, fill, 3);
    g.fillStyle = hi;
    g.fillRect(x + 15, y + 1, fill, 1);
  },

  expBar(g, x, y, frac, w = 64) {
    g.fillStyle = '#404040';
    g.fillRect(x, y, w + 2, 4);
    g.fillStyle = '#d0d8c8';
    g.fillRect(x + 1, y + 1, w, 2);
    g.fillStyle = '#40a8f8';
    g.fillRect(x + 1, y + 1, Math.round(w * U.clamp(frac, 0, 1)), 2);
  },

  typeBadge(g, x, y, type) {
    const t = TYPES[type];
    g.fillStyle = Pix.shade(t.color, 0.55);
    g.fillRect(x, y, 48, 12);
    g.fillStyle = t.color;
    g.fillRect(x + 1, y + 1, 46, 10);
    Font.drawCenter(g, t.name, x + 24, y + 2, '#f8f8f8', Pix.shade(t.color, 0.6));
  },

  // Little PAR / SLP / BRN label.
  statusTag(g, x, y, status) {
    const st = STATUS[status];
    if (!st) return;
    g.fillStyle = Pix.shade(st.color, 0.55);
    g.fillRect(x, y, 22, 9);
    g.fillStyle = st.color;
    g.fillRect(x + 1, y + 1, 20, 7);
    Font.drawRaw(g, st.name, x + 2, y + 1, '#f8f8f8');
  },

  // Full-screen diagonal stripes used by menu screens.
  stripeCache: {},
  stripes(g, a, b, size = 8) {
    const key = `${a}${b}${size}`;
    let img = this.stripeCache[key];
    if (!img) {
      const n = size * 2;
      img = Pix.canvas(SCREEN_W + n * 2, SCREEN_H);
      const c = img.getContext('2d');
      c.fillStyle = a;
      c.fillRect(0, 0, img.width, img.height);
      c.fillStyle = b;
      for (let y = 0; y < SCREEN_H; y++) {
        for (let x = -SCREEN_H; x < img.width; x += n) c.fillRect(x + y, y, size, 1);
      }
      this.stripeCache[key] = img;
    }
    const off = Math.floor(Game.frame / 4) % (size * 2);
    g.drawImage(img, -size * 2 + off, 0);
  },

  // Money in the game's currency.
  money: (n) => `$${n}`,
};
