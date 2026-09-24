'use strict';
// Tiles, buildings and props for chapter 3: ROUTE 5 and PINECREST FOREST,
// CEDARWOOD VILLAGE and TEAM DISTORTION's hideout, ROUTE 4, SEABREEZE PORT
// and its lighthouse.

Object.assign(TILE_DEFS, {
  // outdoors
  'q': { name: 'pine', solid: true },
  'a': { name: 'sand' },
  '<': { name: 'pier' },
  'Z': { name: 'seaRock', solid: true },
  '$': { name: 'barrels', solid: true },
  '@': { name: 'crates', solid: true },
  '?': { name: 'stoneLantern', solid: true },
  // indoors
  '0': { name: 'bookcaseTop', solid: true },
  '1': { name: 'bookcase', solid: true },
  '2': { name: 'hedge', solid: true },
  '3': { name: 'greenFloor' },
  '5': { name: 'flowerbed', solid: true },
  '4': { name: 'metalFloor' },
  '6': { name: 'crate', solid: true },
  '7': { name: 'terminal', solid: true },
  '8': { name: 'rootWall', solid: true },
  '(': { name: 'lightFloor' },
  ']': { name: 'walkway' },
  '9': { name: 'passage' },
});

Object.assign(BUILDINGS, {
  cabin: { w: 5, h: 4, roof: '#4a6a3c', wall: '#a8784c', door: 2, windows: [0.5, 3.5], logs: true },
  cabinSmall: { w: 4, h: 4, roof: '#7a4a30', wall: '#b88858', door: 1, windows: [2.5], logs: true },
  cabinMoss: { w: 5, h: 4, roof: '#5c7a48', wall: '#9a6c44', door: 1, windows: [2.5, 3.5], logs: true },
  library: { w: 7, h: 5, roof: '#8a4a3a', wall: '#e8dcc8', door: 3, windows: [0.5, 1.5, 4.5, 5.5], sign: 'library', noChimney: true },
  greenGym: { w: 7, h: 6, door: 3, draw: 'greenGymImg' },
  cedar: { w: 5, h: 6, draw: 'cedarImg' },
  cedarWilted: { w: 5, h: 6, draw: 'cedarWiltedImg' },
  houseSea: { w: 5, h: 4, roof: '#4888c8', wall: '#f8f8f0', door: 2, windows: [0.5, 3.5] },
  houseSea2: { w: 4, h: 4, roof: '#48a8a0', wall: '#f0ece0', door: 1, windows: [2.5] },
  houseSea3: { w: 5, h: 4, roof: '#d06850', wall: '#f8f4e8', door: 3, windows: [0.5, 1.5] },
  waterGym: { w: 7, h: 6, door: 3, draw: 'waterGymImg' },
  lighthouse: { w: 3, h: 7, door: 1, draw: 'lighthouseImg' },
  stall: { w: 2, h: 2, draw: 'stallImg' },
  rootstone: { w: 3, h: 3, draw: 'rootstoneImg' },
  lens: { w: 3, h: 3, draw: 'lensImg' },
  shrine: { w: 3, h: 3, draw: 'shrineImg' },
});

// Interior wall palettes for the new places.
const WALL_THEMES = {
  hideout: { wall: '#3c3850', lo: '#34304a', dk: '#1c1a28', rim: '#9060e0', hi: '#58507a', base: '#28243a', baseDk: '#141220' },
  lighthouse: { wall: '#e8e4dc', lo: '#d0ccc4', dk: '#8c8880', rim: '#6c6860', hi: '#f8f4ec', base: '#a8a49c', baseDk: '#6c6860' },
  library: { wall: '#b88858', lo: '#a07448', dk: '#6a4428', rim: '#4a2c18', hi: '#d0a070', base: '#7a5030', baseDk: '#4a2c18' },
  greenhouse: { wall: '#c8e8d8', lo: '#a8d0c0', dk: '#608878', rim: '#406858', hi: '#e8f8f0', base: '#78a890', baseDk: '#406858' },
  seagym: { wall: '#a8d0f0', lo: '#90b8e0', dk: '#4878a8', rim: '#305880', hi: '#d0e8f8', base: '#6090c0', baseDk: '#305880' },
  root: { wall: '#6a5038', lo: '#5a4230', dk: '#3a2818', rim: '#2a1c10', hi: '#8a6a48', base: '#4a3424', baseDk: '#2a1c10' },
};
{
  const baseColors = Tiles.wallColors;
  Tiles.wallColors = function wallColors(theme) {
    return WALL_THEMES[theme] || baseColors.call(this, theme);
  };
}

Object.assign(Tiles.floors, {
  4() { return this.metalFloorImg(); },
  3() { return this.greenFloorImg(); },
  '('() { return this.lightFloorImg(); },
  ']'() { return this.walkwayImg(); },
  ';'() { return this.caveFloorImg(0); },
});

Object.assign(Tiles.extra, {
  pine(g, px, py, n, x, y, map, hash) {
    g.drawImage(this.grassImg(0), px, py);
    g.drawImage(this.pineImg(hash % 2), px, py);
  },
  sand(g, px, py, n, x, y, map, hash) {
    g.drawImage(this.sandImg(hash % 3), px, py);
  },
  pier(g, px, py, n) {
    g.drawImage(this.pierImg(), px, py);
    const wet = (c) => TILE_DEFS[c] && TILE_DEFS[c].water;
    g.fillStyle = '#5a3c20';
    if (wet(n(-1, 0))) g.fillRect(px, py, 1, 16);
    if (wet(n(1, 0))) g.fillRect(px + 15, py, 1, 16);
    if (wet(n(0, 1))) {
      g.fillStyle = '#3a2410';
      g.fillRect(px, py + 15, 16, 1);
    }
  },
  seaRock(g, px, py) {
    g.drawImage(this.waterImg(0, 0), px, py);
    g.drawImage(this.seaRockImg(), px, py);
  },
  barrels(g, px, py, n, x, y, map) {
    g.drawImage(this.groundFor(map, n), px, py);
    g.drawImage(this.barrelsImg(), px, py);
  },
  crates(g, px, py, n, x, y, map) {
    g.drawImage(this.groundFor(map, n), px, py);
    g.drawImage(this.crateImg(), px, py);
  },
  stoneLantern(g, px, py, n, x, y, map) {
    g.drawImage(this.groundFor(map, n), px, py);
    g.drawImage(this.stoneLanternImg(), px, py);
  },
  bookcaseTop(g, px, py, n, x, y, map) {
    this.drawFloor(g, px, py, map);
    g.drawImage(this.bookcaseImg(0), px, py);
  },
  bookcase(g, px, py, n, x, y, map) {
    this.drawFloor(g, px, py, map);
    g.drawImage(this.bookcaseImg(1), px, py);
  },
  hedge(g, px, py, n, x, y, map) {
    g.drawImage(this.greenFloorImg(), px, py);
    g.drawImage(this.hedgeImg(), px, py);
  },
  greenFloor(g, px, py) { g.drawImage(this.greenFloorImg(), px, py); },
  flowerbed(g, px, py, n, x, y, map, hash) {
    g.drawImage(this.greenFloorImg(), px, py);
    g.drawImage(this.flowerbedImg(hash % 3), px, py);
  },
  metalFloor(g, px, py) { g.drawImage(this.metalFloorImg(), px, py); },
  crate(g, px, py, n, x, y, map) {
    this.drawFloor(g, px, py, map);
    g.drawImage(this.crateImg(), px, py);
  },
  terminal(g, px, py, n, x, y, map, hash) {
    this.drawFloor(g, px, py, map);
    g.drawImage(this.terminalImg(hash % 2), px, py);
  },
  rootWall(g, px, py, n, x, y, map, hash) {
    const wall = (c) => c === '8' || c === 'x';
    g.drawImage(this.rootWallImg(hash % 3), px, py);
    if (!wall(n(0, 1))) {
      g.fillStyle = '#2a1c10';
      g.fillRect(px, py + 14, 16, 2);
      g.fillStyle = '#8a6a48';
      g.fillRect(px, py + 13, 16, 1);
    }
  },
  lightFloor(g, px, py) { g.drawImage(this.lightFloorImg(), px, py); },
  // A dark stairway going down, hidden in the wall behind a bookcase.
  passage(g, px, py, n, x, y, map) {
    g.drawImage(this.wallImg(map.def.theme), px, py);
    g.fillStyle = '#1a1018';
    g.fillRect(px + 2, py, 12, 16);
    for (let i = 0; i < 4; i++) {
      g.fillStyle = ['#5a4a58', '#4a3a48', '#3a2c38', '#2a1e28'][i];
      g.fillRect(px + 3, py + 13 - i * 3, 10, 2);
    }
    g.fillStyle = 'rgba(176,112,248,0.35)';
    g.fillRect(px + 4, py + 1, 8, 2);
  },
  walkway(g, px, py) { g.drawImage(this.walkwayImg(), px, py); },
});

Object.assign(Tiles, {
  // Ground under a prop: sand at the seaside, paving in town, grass or wood.
  groundFor(map, n) {
    if (!map.def.outdoor) return map.floor === '4' ? this.metalFloorImg() : this.woodImg();
    const around = [n(0, 1), n(0, -1), n(-1, 0), n(1, 0)];
    if (around.some((c) => c === 'a' || c === '<')) return this.sandImg(0);
    if (around.some((c) => c === '+')) return this.pavingImg();
    return this.grassImg(0);
  },

  pineImg(v) {
    return this.memo(`pine${v}`, () => {
      const p = new Painter(16, 16);
      const dark = { fill: v ? '#2c6038' : '#28583a', shade: '#1c4028', hi: '#4a8850', line: '#142818' };
      p.ellipse(8, 14.5, 5, 1.5, { fill: 'rgba(0,0,0,0.25)', line: false });
      p.rect(7, 12, 2, 3, { fill: '#6a4428', line: '#2a1a10' });
      p.poly([[8, 0], [14, 9], [11, 9], [15, 13], [1, 13], [5, 9], [2, 9]], dark);
      p.line(8, 2, 5, 7, '#5a9858');
      return p.toCanvas();
    });
  },

  sandImg(v) {
    return this.memo(`sand${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#e8d8a0';
      g.fillRect(0, 0, 16, 16);
      const r = U.seeded(70 + v);
      for (let i = 0; i < 6; i++) {
        g.fillStyle = i % 2 ? '#d8c488' : '#f4e8c0';
        g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 1, 1);
      }
      if (v === 2) {
        g.fillStyle = '#f8f0e0';
        g.fillRect(9, 10, 3, 2);
        g.fillStyle = '#e0a0a0';
        g.fillRect(10, 10, 1, 1);
      }
      return c;
    });
  },

  pierImg() {
    return this.memo('pier', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#b08050';
      g.fillRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y += 4) {
        g.fillStyle = '#8a6038';
        g.fillRect(0, y + 3, 16, 1);
        g.fillStyle = '#c89868';
        g.fillRect(0, y, 16, 1);
      }
      g.fillStyle = '#5a3c20';
      g.fillRect(3, 1, 1, 1); g.fillRect(12, 5, 1, 1); g.fillRect(3, 9, 1, 1); g.fillRect(12, 13, 1, 1);
      return c;
    });
  },

  seaRockImg() {
    return this.memo('seaRock', () => {
      const p = new Painter(16, 16);
      p.ellipse(8, 11, 7, 3, { fill: '#e8f8f8', line: false });
      p.poly([[2, 11], [4, 5], [8, 2], [12, 4], [14, 11]], { fill: '#707888', shade: '#505868', hi: '#98a0b0', line: '#282c38' });
      return p.toCanvas();
    });
  },

  barrelsImg() {
    return this.memo('barrels', () => {
      const p = new Painter(16, 16);
      const wood = { fill: '#a8703c', shade: '#80522a', hi: '#c89058', line: '#3a2410' };
      p.rrect(1, 3, 7, 12, 2, wood);
      p.rrect(8, 5, 7, 10, 2, wood);
      p.line(1, 6, 7, 6, '#505058');
      p.line(1, 12, 7, 12, '#505058');
      p.line(8, 8, 14, 8, '#505058');
      p.line(8, 12, 14, 12, '#505058');
      return p.toCanvas();
    });
  },

  crateImg() {
    return this.memo('crate', () => {
      const p = new Painter(16, 16);
      p.rrect(1, 2, 14, 13, 1, { fill: '#b88c58', shade: '#94683c', hi: '#d8ac78', line: '#3a2810' });
      p.line(2, 3, 14, 14, '#8a6038');
      p.line(14, 3, 2, 14, '#8a6038');
      p.rect(1, 7, 14, 2, { fill: '#94683c', line: false });
      return p.toCanvas();
    });
  },

  stoneLanternImg() {
    return this.memo('stoneLantern', () => Pix.fromRows([
      '.....oooooo.....',
      '...oohhhhhhoo...',
      '..ohhhhhhhhhho..',
      '...oooooooooo...',
      '.....oyyyyo.....',
      '.....oylyyo.....',
      '.....oyyyyo.....',
      '....oooooooo....',
      '.....ohhhho.....',
      '......ohho......',
      '......ohho......',
      '......ohdo......',
      '....oohhhdoo....',
      '...ohhhhhhddo...',
      '...oooooooooo...',
      '....ssssssss....',
    ], { o: '#383438', h: '#a8a4a0', d: '#807c78', y: '#f8d878', l: '#fff8d8', s: 'rgba(0,0,0,0.2)' }));
  },

  bookcaseImg(part) {
    return this.memo(`bookcase${part}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.shelfImg(part), 0, 0);
      g.fillStyle = '#4a2c18';
      g.fillRect(0, 0, 1, 16);
      g.fillRect(15, 0, 1, 16);
      if (!part) g.fillRect(0, 2, 16, 1);
      else {
        g.fillStyle = 'rgba(0,0,0,0.2)';
        g.fillRect(1, 15, 14, 1);
      }
      return c;
    });
  },

  greenFloorImg() {
    return this.memo('greenFloor', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#a8c890';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#98b880';
      g.fillRect(0, 0, 8, 8);
      g.fillRect(8, 8, 8, 8);
      g.fillStyle = '#809c68';
      g.fillRect(0, 15, 16, 1);
      g.fillRect(15, 0, 1, 16);
      g.fillStyle = '#c0dca8';
      g.fillRect(0, 0, 16, 1);
      g.fillRect(0, 0, 1, 16);
      return c;
    });
  },

  hedgeImg() {
    return this.memo('hedge', () => {
      const p = new Painter(16, 16);
      p.rrect(0, 1, 16, 14, 4, { fill: '#3c8a3c', shade: '#2c6c30', hi: '#5cac50', line: '#1c3c1c' });
      for (const [x, y] of [[4, 4], [10, 5], [6, 9], [12, 10]]) p.set(x, y, '#7cc868');
      return p.toCanvas();
    });
  },

  flowerbedImg(v) {
    return this.memo(`flowerbed${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#5a3c24';
      g.fillRect(1, 3, 14, 12);
      g.fillStyle = '#7a5434';
      g.fillRect(2, 4, 12, 10);
      g.fillStyle = '#4a8a3c';
      for (let x = 3; x < 14; x += 3) g.fillRect(x, 6, 1, 7);
      const cols = [['#f070a0', '#f8f8f8'], ['#f8d048', '#e86040'], ['#9070e0', '#f070a0']][v];
      for (let i = 0; i < 6; i++) {
        g.fillStyle = cols[i % 2];
        g.fillRect(3 + (i % 3) * 4, 5 + Math.floor(i / 3) * 4, 2, 2);
      }
      g.fillStyle = '#3a2410';
      g.fillRect(1, 14, 14, 1);
      return c;
    });
  },

  metalFloorImg() {
    return this.memo('metalFloor', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#4a4660';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#3c3850';
      g.fillRect(0, 15, 16, 1);
      g.fillRect(15, 0, 1, 16);
      g.fillStyle = '#5c5878';
      g.fillRect(0, 0, 16, 1);
      g.fillRect(0, 0, 1, 16);
      g.fillStyle = '#2c2a3c';
      g.fillRect(2, 2, 1, 1); g.fillRect(13, 2, 1, 1); g.fillRect(2, 13, 1, 1); g.fillRect(13, 13, 1, 1);
      g.fillStyle = '#403c56';
      for (let x = 4; x < 12; x += 2) g.fillRect(x, 7, 1, 2);
      return c;
    });
  },

  terminalImg(v) {
    return this.memo(`terminal${v}`, () => Pix.fromRows([
      '................',
      '.oooooooooooooo.',
      '.ommmmmmmmmmmmo.',
      '.omkkkkkkkkkkmo.',
      '.omkvvkkvkvvkmo.',
      '.omkkvkvvkkkkmo.',
      '.omkvkkkkvvkkmo.',
      '.omkkkkkkkkkkmo.',
      '.ommmmmmmmmmmmo.',
      '.oddddddddddddo.',
      '.odrdgdydcccddo.',
      '.oddddddddddddo.',
      '.oooooooooooooo.',
      '..oddo....oddo..',
      '..oooo....oooo..',
      '................',
    ], { o: '#1c1c24', m: '#687080', k: '#101018', v: v ? '#60e0a0' : '#b070f8', d: '#484c58', r: '#e04848', g: '#48c870', y: '#f8d048', c: '#303038' }));
  },

  rootWallImg(v) {
    return this.memo(`rootWall${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#4a3424';
      g.fillRect(0, 0, 16, 16);
      const r = U.seeded(90 + v);
      for (let i = 0; i < 3; i++) {
        const x0 = Math.floor(r() * 16);
        g.fillStyle = i % 2 ? '#7a5a3c' : '#6a4c30';
        for (let y = 0; y < 16; y++) g.fillRect(Math.round(x0 + Math.sin((y + i * 5) / 3) * 2) % 16, y, 3, 1);
      }
      g.fillStyle = '#3a2818';
      for (let i = 0; i < 5; i++) g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 2, 1);
      return c;
    });
  },

  lightFloorImg() {
    return this.memo('lightFloor', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#b8b0a4';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#a49c90';
      g.fillRect(0, 7, 16, 1);
      g.fillRect(0, 15, 16, 1);
      g.fillRect(5, 0, 1, 7);
      g.fillRect(12, 8, 1, 7);
      g.fillStyle = '#ccc4b8';
      g.fillRect(0, 0, 16, 1);
      g.fillRect(0, 8, 16, 1);
      return c;
    });
  },

  walkwayImg() {
    return this.memo('walkway', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#d8e8f0';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#b8d0e0';
      g.fillRect(0, 0, 8, 8);
      g.fillRect(8, 8, 8, 8);
      g.fillStyle = '#88a8c0';
      g.fillRect(0, 15, 16, 1);
      g.fillRect(15, 0, 1, 16);
      return c;
    });
  },

  // --- buildings ---------------------------------------------------------------

  greenGymImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    const line = '#1c3c28';
    // Stone base.
    g.fillStyle = line;
    g.fillRect(1, H - 22, W - 2, 22);
    g.fillStyle = '#a8a098';
    g.fillRect(2, H - 21, W - 4, 19);
    g.fillStyle = '#908880';
    for (let x = 6; x < W; x += 12) g.fillRect(x, H - 21, 1, 19);
    // Glass dome.
    for (let y = 2; y < H - 20; y++) {
      const t = (y - 2) / (H - 22);
      const half = Math.round((W / 2 - 2) * Math.sqrt(Math.min(1, t * 1.8 + 0.05)));
      g.fillStyle = line;
      g.fillRect(W / 2 - half - 1, y, half * 2 + 2, 1);
      g.fillStyle = y % 12 === 0 ? '#e8f8f0' : '#a8e0d0';
      g.fillRect(W / 2 - half, y, half * 2, 1);
    }
    // Plants inside the glass.
    const r = U.seeded(7);
    for (let i = 0; i < 16; i++) {
      const x = 10 + Math.floor(r() * (W - 20));
      const y = 30 + Math.floor(r() * 30);
      g.fillStyle = i % 3 ? '#58a048' : '#3c7a34';
      g.fillRect(x, y, 4, 3);
      g.fillStyle = '#f070a0';
      if (i % 4 === 0) g.fillRect(x + 1, y - 1, 2, 1);
    }
    // Frame ribs.
    g.fillStyle = '#f0f8f4';
    for (const x of [W / 2 - 30, W / 2 - 15, W / 2, W / 2 + 15, W / 2 + 30]) g.fillRect(Math.round(x), 8, 1, H - 30);
    g.fillRect(4, 44, W - 8, 1);
    g.fillRect(12, 24, W - 24, 1);
    // Leaf emblem and plaque.
    const kx = W / 2;
    g.fillStyle = line;
    g.fillRect(kx - 6, 4, 12, 10);
    g.fillStyle = '#58b048';
    g.fillRect(kx - 5, 5, 10, 8);
    g.fillStyle = '#b8f090';
    g.fillRect(kx - 1, 6, 2, 6);
    g.fillStyle = line;
    g.fillRect(kx - 15, H - 34, 30, 11);
    g.fillStyle = '#f0d060';
    g.fillRect(kx - 14, H - 33, 28, 9);
    Font.drawRaw(g, 'GYM', kx - 9, H - 32, '#604010');
    // Door.
    const dx = spec.door * 16 - 2;
    g.fillStyle = line;
    g.fillRect(dx - 1, H - 20, 22, 18);
    g.fillStyle = '#a8e0d0';
    g.fillRect(dx, H - 19, 20, 17);
    g.fillStyle = '#e8f8f0';
    g.fillRect(dx + 2, H - 17, 3, 13);
    g.fillRect(dx + 12, H - 17, 3, 13);
    g.fillStyle = line;
    g.fillRect(dx + 10, H - 19, 1, 17);
    g.fillStyle = '#909088';
    g.fillRect(2, H - 3, W - 4, 3);
    return c;
  },

  cedarImg(spec) { return this.bigCedar(spec, false); },
  cedarWiltedImg(spec) { return this.bigCedar(spec, true); },

  // The great cedar of CEDARWOOD, healthy or withering from the roots up.
  bigCedar(spec, wilted) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const p = new Painter(W, H);
    const cx = W / 2;
    p.ellipse(cx, H - 5, 30, 5, { fill: 'rgba(0,0,0,0.25)', line: false });
    // Roots and trunk.
    const bark = wilted ? { fill: '#7a6a5a', shade: '#5a4c40', hi: '#948474', line: '#2a2018' }
      : { fill: '#7a4a28', shade: '#5a3418', hi: '#9a6a40', line: '#2a1808' };
    p.poly([[cx - 20, H - 3], [cx - 10, H - 12], [cx - 9, H - 34], [cx + 9, H - 34], [cx + 10, H - 12], [cx + 20, H - 3]], bark);
    p.line(cx - 4, H - 30, cx - 5, H - 6, bark.shade);
    p.line(cx + 3, H - 32, cx + 4, H - 8, bark.shade);
    p.line(cx - 14, H - 5, cx - 7, H - 12, bark.shade);
    p.line(cx + 14, H - 5, cx + 7, H - 12, bark.shade);
    // Layered canopy.
    const leaf = wilted ? { fill: '#c08848', shade: '#8a5a2c', hi: '#e0b070', line: '#3a2410' }
      : { fill: '#2c7a3c', shade: '#1c5a2c', hi: '#4c9c50', line: '#0c2c14' };
    const tiers = [[H - 38, 38, 14], [H - 54, 32, 13], [H - 68, 25, 12], [H - 80, 17, 10], [H - 89, 9, 8]];
    for (const [y, rx, ry] of tiers) p.ellipse(cx, y, rx, ry, leaf);
    if (wilted) {
      // Bare grey branches poking through, and needles on the ground.
      for (const [x, y, dx, dy] of [[-24, -42, -6, -4], [22, -40, 6, -5], [-18, -58, -5, -5], [16, -62, 6, -4], [-10, -76, -4, -4]]) {
        p.line(cx + x, H + y, cx + x + dx, H + y + dy, '#5a4c40');
      }
      p.ellipse(cx - 14, H - 46, 5, 3, { fill: '#8a5a2c', line: false });
      p.ellipse(cx + 12, H - 62, 4, 3, { fill: '#8a5a2c', line: false });
      for (const [x, y] of [[-22, -6], [18, -4], [-12, -2], [8, -8], [24, -2], [-28, -3], [28, -6], [-4, -1]]) {
        p.rect(cx + x, H + y, 2, 1, { fill: '#c08848', line: false });
      }
    } else {
      for (const [x, y] of [[-20, -46], [14, -58], [-8, -72], [6, -84], [22, -40]]) p.set(cx + x, H + y, '#78c068');
    }
    return p.toCanvas();
  },

  waterGymImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    const line = '#1c2c48';
    // Body.
    g.fillStyle = line;
    g.fillRect(2, 26, W - 4, H - 26);
    g.fillStyle = '#e8f0f8';
    g.fillRect(3, 27, W - 6, H - 29);
    g.fillStyle = '#c8d8e8';
    for (let y = 34; y < H - 6; y += 8) g.fillRect(3, y, W - 6, 1);
    // Wave-shaped roof.
    for (let x = 0; x < W; x++) {
      const top = 10 + Math.round(Math.sin(x / 9) * 3) + Math.round(Math.abs(x - W / 2) / 8);
      g.fillStyle = line;
      g.fillRect(x, top - 1, 1, 30 - top);
      g.fillStyle = x % 8 < 4 ? '#3878c8' : '#4888d8';
      g.fillRect(x, top, 1, 27 - top);
      g.fillStyle = '#f8f8f8';
      g.fillRect(x, top, 1, 1);
    }
    // Portholes.
    for (const x of [14, W - 22]) {
      g.fillStyle = line;
      g.fillRect(x - 1, 38, 10, 10);
      g.fillStyle = '#d8b050';
      g.fillRect(x, 39, 8, 8);
      g.fillStyle = '#78c0f0';
      g.fillRect(x + 2, 41, 4, 4);
    }
    // Anchor emblem and plaque.
    const kx = W / 2;
    g.fillStyle = line;
    g.fillRect(kx - 15, 29, 30, 11);
    g.fillStyle = '#f0d060';
    g.fillRect(kx - 14, 30, 28, 9);
    Font.drawRaw(g, 'GYM', kx - 9, 31, '#604010');
    g.fillStyle = '#f8f8f8';
    g.fillRect(kx - 1, 3, 2, 8);
    g.fillRect(kx - 4, 5, 8, 1);
    g.fillRect(kx - 4, 10, 8, 1);
    // Door.
    const dx = spec.door * 16 - 2;
    g.fillStyle = line;
    g.fillRect(dx - 1, H - 20, 22, 18);
    g.fillStyle = '#3878c8';
    g.fillRect(dx, H - 19, 20, 17);
    g.fillStyle = '#78b0e8';
    g.fillRect(dx + 1, H - 18, 8, 15);
    g.fillRect(dx + 11, H - 18, 8, 15);
    g.fillStyle = '#b0b8c0';
    g.fillRect(2, H - 3, W - 4, 3);
    return c;
  },

  lighthouseImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    const line = '#282830';
    const cx = W / 2;
    // Tapered tower with red bands.
    for (let y = 30; y < H - 4; y++) {
      const half = Math.round(10 + ((y - 30) / (H - 34)) * 12);
      g.fillStyle = line;
      g.fillRect(cx - half - 1, y, half * 2 + 2, 1);
      const band = Math.floor((y - 30) / 14) % 2 === 1;
      g.fillStyle = band ? '#d84840' : '#f4f0e8';
      g.fillRect(cx - half, y, half * 2, 1);
      g.fillStyle = band ? '#a83028' : '#d8d4cc';
      g.fillRect(cx + half - 5, y, 5, 1);
    }
    // Gallery and lamp room.
    g.fillStyle = line;
    g.fillRect(cx - 14, 26, 28, 5);
    g.fillStyle = '#505060';
    g.fillRect(cx - 13, 27, 26, 3);
    g.fillStyle = line;
    g.fillRect(cx - 9, 8, 18, 19);
    g.fillStyle = '#d0e8f0';
    g.fillRect(cx - 8, 10, 16, 16);
    g.fillStyle = '#f8f8f8';
    g.fillRect(cx - 6, 12, 4, 10);
    g.fillStyle = line;
    g.fillRect(cx - 1, 10, 1, 16);
    // Domed cap.
    for (let y = 0; y < 9; y++) {
      const half = Math.round(10 * Math.sqrt(y / 9));
      g.fillStyle = line;
      g.fillRect(cx - half - 1, y + 1, half * 2 + 2, 1);
      g.fillStyle = '#d84840';
      g.fillRect(cx - half, y + 1, half * 2, 1);
    }
    g.fillStyle = line;
    g.fillRect(cx - 1, 0, 2, 2);
    // Windows and door.
    g.fillStyle = line;
    g.fillRect(cx - 3, 44, 6, 8);
    g.fillRect(cx - 3, 70, 6, 8);
    g.fillStyle = '#88c8f0';
    g.fillRect(cx - 2, 45, 4, 6);
    g.fillRect(cx - 2, 71, 4, 6);
    const dx = spec.door * 16 + 2;
    g.fillStyle = line;
    g.fillRect(dx - 1, H - 18, 14, 16);
    g.fillStyle = '#4a5a70';
    g.fillRect(dx, H - 17, 12, 15);
    g.fillStyle = '#687890';
    g.fillRect(dx + 1, H - 16, 10, 5);
    g.fillStyle = '#b0b0b8';
    g.fillRect(4, H - 4, W - 8, 4);
    return c;
  },

  stallImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const p = new Painter(W, H);
    p.rect(2, 12, 2, 18, { fill: '#8a6038', line: '#3a2410' });
    p.rect(W - 4, 12, 2, 18, { fill: '#8a6038', line: '#3a2410' });
    p.rrect(1, 18, W - 2, 12, 1, { fill: '#b88c58', shade: '#94683c', hi: '#d8ac78', line: '#3a2410' });
    // Fish on ice.
    p.rect(4, 17, W - 8, 3, { fill: '#e8f8f8', line: false });
    for (let x = 5; x < W - 6; x += 6) p.ellipse(x + 2, 18, 2.5, 1, { fill: '#88a8c8', line: '#304860' });
    // Striped awning.
    for (let x = 0; x < W; x++) {
      p.set(x, 3, '#282830');
      for (let y = 4; y < 11; y++) p.set(x, y, Math.floor(x / 4) % 2 ? '#f8f8f8' : '#d84840');
      p.set(x, 11, '#282830');
    }
    return p.toCanvas();
  },

  rootstoneImg(spec) {
    const W = spec.w * 16;
    const p = new Painter(W, W);
    const c = W / 2;
    p.ellipse(c, c + 6, 22, 12, { fill: 'rgba(0,0,0,0.3)', line: false });
    // Gnarled roots wrapping the stone.
    const root = { fill: '#7a5a3c', shade: '#5a3c24', hi: '#9a7a54', line: '#2a1c10' };
    p.poly([[c - 22, c + 14], [c - 14, c + 2], [c - 12, c - 14], [c - 6, c - 18], [c - 8, c + 4], [c - 16, c + 16]], root);
    p.poly([[c + 22, c + 14], [c + 14, c + 2], [c + 12, c - 14], [c + 6, c - 18], [c + 8, c + 4], [c + 16, c + 16]], root);
    // The ROOTSTONE: a keystone grown through with green veins.
    p.poly([[c - 7, c - 10], [c + 7, c - 10], [c + 5, c + 6], [c - 5, c + 6]], { fill: '#9058d8', line: '#281840', shade: '#6030a8', hi: '#c8a0f8' });
    p.line(c - 4, c - 8, c - 2, c + 4, '#78e060');
    p.line(c + 3, c - 9, c + 1, c + 4, '#78e060');
    p.line(c, c - 6, c + 1, c, '#f0e0ff');
    p.poly([[c - 20, c + 10], [c + 20, c + 10], [c + 18, c + 16], [c - 18, c + 16]], root);
    return p.toCanvas();
  },

  lensImg(spec) {
    const W = spec.w * 16;
    const p = new Painter(W, W);
    const c = W / 2;
    p.rrect(c - 16, c + 8, 32, 12, 2, { fill: '#b88a38', shade: '#8a6420', hi: '#e0b858', line: '#3a2810' });
    p.rect(c - 3, c + 2, 6, 7, { fill: '#8a6420', line: '#3a2810' });
    // The TIDESTONE, cut like a great lens.
    p.poly([[c, c - 20], [c + 13, c - 8], [c + 9, c + 4], [c - 9, c + 4], [c - 13, c - 8]], { fill: '#5898e0', line: '#18284c', shade: '#3868b0', hi: '#b8e0ff' });
    p.line(c, c - 18, c, c + 2, '#d8f0ff');
    p.line(c - 11, c - 8, c + 11, c - 8, '#88c0f0');
    p.line(c - 4, c - 15, c - 7, c - 2, '#f0f8ff');
    return p.toCanvas();
  },

  shrineImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const p = new Painter(W, H);
    const cx = W / 2;
    const stone = { fill: '#9a9488', shade: '#747068', hi: '#b8b2a8', line: '#2c2a28' };
    p.ellipse(cx, H - 4, 22, 4, { fill: 'rgba(0,0,0,0.25)', line: false });
    p.rect(cx - 20, H - 12, 40, 9, stone);
    p.rect(cx - 16, 14, 5, 26, stone);
    p.rect(cx + 11, 14, 5, 26, stone);
    p.poly([[cx - 24, 16], [cx - 20, 8], [cx + 20, 8], [cx + 24, 16]], stone);
    p.rect(cx - 22, 4, 44, 5, { fill: '#6a5c50', shade: '#4a4038', hi: '#8a7c70', line: '#2c2a28' });
    // Moss.
    for (const [x, y, w] of [[-20, 8, 10], [8, 8, 12], [-16, 24, 4], [12, 30, 4], [-18, H - 12, 14]]) {
      p.rect(cx + x, y, w, 2, { fill: '#5c8a48', line: false });
    }
    // Offering stone with a faint violet light.
    p.rrect(cx - 6, H - 22, 12, 11, 3, stone);
    p.ellipse(cx, H - 18, 3, 3, { fill: '#b070f8', line: '#402060', hi: '#e8d0ff' });
    return p.toCanvas();
  },
});

// Props: scenery that is an entity (it can move, vanish or be talked to).
const Props = {
  cache: {},

  image(name, frame) {
    if (name.startsWith('mon:')) return MonSprites.icon(name.slice(4)) || Chars.ball;
    const anim = { gate: 4, coil: 3 }[name];
    const f = anim ? Math.floor(frame / 8) % anim : 0;
    const key = `${name}${f}`;
    if (!this.cache[key]) this.cache[key] = this[name](f);
    return this.cache[key];
  },

  // A bookcase that hides a staircase.
  shelfSecret() {
    const c = Pix.canvas(16, 32);
    const g = c.getContext('2d');
    g.drawImage(Tiles.bookcaseImg(0), 0, 0);
    g.drawImage(Tiles.bookcaseImg(1), 0, 16);
    return c;
  },

  // TEAM DISTORTION energy gate.
  gate(f) {
    const c = Pix.canvas(16, 26);
    const g = c.getContext('2d');
    g.fillStyle = '#282434';
    g.fillRect(0, 0, 3, 26);
    g.fillRect(13, 0, 3, 26);
    g.fillStyle = '#6c6490';
    g.fillRect(1, 1, 1, 24);
    g.fillRect(14, 1, 1, 24);
    for (let x = 3; x < 13; x += 3) {
      g.fillStyle = (x + f) % 2 ? '#c890ff' : '#8050d8';
      g.fillRect(x, 2, 2, 22);
    }
    g.fillStyle = 'rgba(240,220,255,0.6)';
    g.fillRect(3, 2 + ((f * 5) % 20), 10, 2);
    return c;
  },

  // A storm coil powered by a caged VOLTIMP (sparking), or shut down.
  coil(f) { return this.coilImg(f, true); },
  coilOff() { return this.coilImg(0, false); },
  coilImg(f, on) {
    const c = Pix.canvas(24, 32);
    const g = c.getContext('2d');
    const p = new Painter(24, 32);
    p.rrect(2, 20, 20, 11, 2, { fill: '#484c58', shade: '#303038', hi: '#687080', line: '#141418' });
    p.rect(9, 2, 6, 19, { fill: '#687080', shade: '#484c58', hi: '#9098a8', line: '#141418' });
    for (let y = 4; y < 20; y += 3) p.rect(7, y, 10, 1, { fill: on ? '#b070f8' : '#585868', line: false });
    g.drawImage(p.toCanvas(), 0, 0);
    // Cage bars.
    g.fillStyle = '#202028';
    for (let x = 4; x < 21; x += 4) g.fillRect(x, 21, 1, 9);
    if (on) {
      const sp = ['#f8e040', '#ffffff', '#c890ff'];
      for (let i = 0; i < 4; i++) {
        g.fillStyle = sp[(i + f) % 3];
        g.fillRect(4 + ((i * 7 + f * 5) % 16), 1 + ((i * 5 + f * 3) % 18), 2, 1);
      }
      g.fillStyle = '#f8e040';
      g.fillRect(8, 25, 8, 3);
    }
    return c;
  },

  boat() {
    const p = new Painter(48, 32);
    p.poly([[2, 18], [46, 18], [40, 29], [8, 29]], { fill: '#f4f0e8', shade: '#c8c4bc', hi: '#ffffff', line: '#282830' });
    p.rect(4, 18, 40, 3, { fill: '#d84840', line: false });
    p.rect(22, 2, 2, 17, { fill: '#8a6038', line: '#3a2410' });
    p.poly([[24, 3], [40, 15], [24, 15]], { fill: '#f8f8f0', shade: '#d8d8d0', line: '#282830' });
    p.ellipse(24, 30, 20, 2, { fill: 'rgba(255,255,255,0.5)', line: false });
    return p.toCanvas();
  },
};

// Borders for the new outdoor areas.
{
  const baseBorder = Tiles.borderImg;
  Tiles.borderImg = function borderImg(ch) {
    if (ch === 'q') {
      return this.memo('borderq', () => {
        const c = Pix.canvas(16, 16);
        const g = c.getContext('2d');
        g.drawImage(this.grassImg(0), 0, 0);
        g.drawImage(this.pineImg(0), 0, 0);
        return c;
      });
    }
    if (ch === '~') return this.memo('border~', () => this.waterImg(0, 0));
    if (ch === '8') return this.memo('border8', () => this.rootWallImg(0));
    return baseBorder.call(this, ch);
  };
}
