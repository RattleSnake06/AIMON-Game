'use strict';
// Title screen and the CONTINUE / NEW GAME menu.

function scale2x(m) {
  const h = m.length;
  const w = m[0].length;
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : m[y][x]);
  const out = Array.from({ length: h * 2 }, () => new Array(w * 2).fill(0));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const P = at(x, y);
      const A = at(x, y - 1);
      const B = at(x + 1, y);
      const C = at(x - 1, y);
      const D = at(x, y + 1);
      out[2 * y][2 * x] = C === A && C !== D && A !== B ? A : P;
      out[2 * y][2 * x + 1] = A === B && A !== C && B !== D ? B : P;
      out[2 * y + 1][2 * x] = D === C && D !== B && C !== A ? C : P;
      out[2 * y + 1][2 * x + 1] = B === D && B !== A && D !== C ? D : P;
    }
  }
  return out;
}

const Title = {
  logoImg: null,

  logo() {
    if (this.logoImg) return this.logoImg;
    // Rasterise "AIMON" from the font, then smooth-scale it 4x.
    const word = 'AIMON';
    const cols = [];
    for (const ch of word) {
      const rows = Font.glyphs[ch].rows;
      const w = Font.glyphs[ch].w;
      for (let x = 0; x < w; x++) cols.push(rows.slice(0, 7).map((r) => (r[x] === '#' ? 1 : 0)));
      cols.push(new Array(7).fill(0));
    }
    cols.pop();
    let mask = Array.from({ length: 7 }, (_, y) => cols.map((c) => c[y]));
    mask = scale2x(scale2x(mask));
    const h = mask.length;
    const w = mask[0].length;
    const pad = 5;
    const c = Pix.canvas(w + pad * 2, h + pad * 2);
    const g = c.getContext('2d');
    const plot = (dx, dy, color) => {
      g.fillStyle = color;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (mask[y][x]) g.fillRect(x + pad + dx, y + pad + dy, 1, 1);
    };
    // Drop shadow, thick outline, then gradient fill.
    for (let dy = -2; dy <= 4; dy++) for (let dx = -2; dx <= 4; dx++) if (dx * dx + dy * dy <= 13) plot(dx, dy, '#0c1440');
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (dx * dx + dy * dy <= 5) plot(dx, dy, '#2850b8');
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) plot(dx, dy, '#5888e8');
    const grad = ['#fffcc8', '#fff498', '#fce868', '#f8d840', '#f8c830', '#f4b020', '#f09818', '#e88010'];
    for (let y = 0; y < h; y++) {
      g.fillStyle = grad[Math.min(grad.length - 1, Math.floor((y / h) * grad.length))];
      for (let x = 0; x < w; x++) if (mask[y][x]) g.fillRect(x + pad, y + pad, 1, 1);
    }
    // Shine along the top edge of each letter.
    g.fillStyle = '#ffffff';
    for (let y = 1; y < h; y++) for (let x = 0; x < w; x++) if (mask[y][x] && !mask[y - 1][x] && y < h / 2) g.fillRect(x + pad, y + pad, 2, 1);
    this.logoImg = c;
    return c;
  },

  scenery() {
    if (this.bg) return this.bg;
    const c = Pix.canvas(240, 160);
    const g = c.getContext('2d');
    const sky = ['#2850b0', '#3060c0', '#3870c8', '#4880d0', '#5890d8', '#68a0e0', '#78b0e8', '#88c0f0', '#98d0f8', '#a8d8f8'];
    sky.forEach((col, i) => { g.fillStyle = col; g.fillRect(0, i * 10, 240, 10); });
    g.fillRect(0, 100, 240, 60);
    const r = U.seeded(7);
    // Mountains.
    for (let i = 0; i < 6; i++) {
      const cx = i * 50 + r() * 20;
      const hgt = 26 + r() * 20;
      g.fillStyle = '#6888c0';
      for (let y = 0; y < hgt; y++) {
        const half = (y / hgt) * 34;
        g.fillRect(Math.round(cx - half), Math.round(104 - hgt + y), Math.round(half * 2), 1);
      }
      g.fillStyle = '#e8f0f8';
      for (let y = 0; y < 6; y++) {
        const half = (y / hgt) * 34;
        g.fillRect(Math.round(cx - half), Math.round(104 - hgt + y), Math.round(half * 2), 1);
      }
    }
    // Rolling hill.
    Pix.ellipse(g, 120, 190, 190, 88, '#3c8a3c');
    Pix.ellipse(g, 120, 192, 186, 84, '#58a848');
    Pix.ellipse(g, 120, 196, 180, 78, '#68b850');
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(r() * 240);
      const y = 112 + Math.floor(r() * 46);
      g.fillStyle = '#88d060';
      g.fillRect(x, y, 1, 2);
      g.fillRect(x + 2, y, 1, 2);
      g.fillRect(x + 1, y + 1, 1, 1);
    }
    this.bg = c;
    return c;
  },

  cloud(g, x, y, s) {
    Pix.ellipse(g, x, y, 14 * s, 6 * s, '#e8f4fc');
    Pix.ellipse(g, x - 10 * s, y + 2, 9 * s, 5 * s, '#e8f4fc');
    Pix.ellipse(g, x + 11 * s, y + 2, 10 * s, 5 * s, '#e8f4fc');
    Pix.ellipse(g, x, y - 1, 12 * s, 4 * s, '#ffffff');
  },

  open() {
    Game.clear();
    Co.stopAll();
    Game.fadeA = 0;
    Sound.playMusic('title');
    const s = { opaque: true, t: 0, state: 'press' };
    s.update = () => {
      s.t++;
      if (s.state === 'press' && (Input.pressed('start') || Input.pressed('a'))) {
        Sound.init();
        Sound.sfx('confirm');
        s.state = 'menu';
        Co.start(this.menu(s));
      }
    };
    s.draw = (g) => this.draw(g, s);
    Game.push(s);
  },

  draw(g, s) {
    g.drawImage(this.scenery(), 0, 0);
    const t = Game.frame;
    this.cloud(g, ((t * 0.15) % 300) - 30, 64, 1);
    this.cloud(g, ((t * 0.1 + 150) % 300) - 30, 44, 0.8);
    this.cloud(g, ((t * 0.12 + 240) % 300) - 30, 80, 0.7);
    const mons = [['skylavine', 12], ['moltarock', 88], ['archepin', 164]];
    mons.forEach(([id, x], i) => {
      const bob = Math.floor((t / 20 + i * 1.3) % 2);
      g.drawImage(MonSprites.front(id), x, 78 - bob + (i === 1 ? 6 : 0));
    });
    const logo = this.logo();
    g.drawImage(logo, Math.round(120 - logo.width / 2), 6);
    // Twinkle.
    const k = Math.floor(t / 6) % 24;
    if (k < 4) {
      const sp = BattleArt.sprite('sparkle');
      g.drawImage(sp, 120 - logo.width / 2 + 10 + ((Math.floor(t / 144) * 37) % (logo.width - 20)), 10 + (Math.floor(t / 144) * 13) % 24);
    }
    if (s.state === 'press' && Math.floor(t / 30) % 2 === 0) {
      Font.drawCenter(g, 'PRESS START', 120, 148, '#f8f8f8', '#284820');
    }
  },

  *menu(titleScene) {
    const save = State.peek();
    let choice = 'new';
    if (save) {
      const m = { opaque: true, index: 0, result: null };
      m.update = () => {
        if (Input.repeat('up') || Input.repeat('down')) { m.index = 1 - m.index; Sound.sfx('select'); }
        if (Input.pressed('a') || Input.pressed('start')) { Sound.sfx('confirm'); m.result = m.index; }
        if (Input.pressed('b')) { Sound.sfx('select'); m.result = -1; }
      };
      m.draw = (g) => {
        UI.stripes(g, '#284880', '#305090');
        UI.window(g, 8, 8, 224, 74);
        const ink = ['#404048', '#d0d0c8'];
        Font.draw(g, 'CONTINUE', 26, 16, ...ink);
        Font.drawRight(g, DIFFICULTIES[save.difficulty || 'normal'].name, 200, 16, '#5068a0', '#d0d8e8');
        Font.draw(g, 'PLAYER', 34, 32, '#5068a0', '#d0d8e8');
        Font.drawRight(g, save.name, 200, 32, ...ink);
        Font.draw(g, 'TIME', 34, 46, '#5068a0', '#d0d8e8');
        Font.drawRight(g, U.formatTime(save.frames || 0), 200, 46, ...ink);
        Font.draw(g, 'AIMONDEX', 34, 60, '#5068a0', '#d0d8e8');
        const dex = save.flags && save.flags.got_dex ? Object.keys(save.dex.caught).length : 0;
        Font.drawRight(g, String(dex), 200, 60, ...ink);
        UI.window(g, 8, 88, 224, 28);
        Font.draw(g, 'NEW GAME', 26, 97, ...ink);
        UI.cursor(g, 16, m.index === 0 ? 16 : 97);
      };
      Game.push(m);
      yield () => m.result !== null;
      Game.remove(m);
      if (m.result < 0) {
        titleScene.state = 'press';
        return;
      }
      choice = m.result === 0 ? 'continue' : 'new';
    }
    yield* Game.fadeOut(20);
    Game.clear();
    if (choice === 'continue') {
      State.load();
      OW.shownPopup = null;
      OW.start();
      yield* Game.fadeIn(20);
    } else {
      const mode = yield* Difficulty.choose();
      yield* Intro.run(mode);
    }
  },
};
