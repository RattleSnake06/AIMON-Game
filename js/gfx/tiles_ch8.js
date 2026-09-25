'use strict';
// Tiles, buildings and props for chapters 8 and 9: the farm road (ROUTE 12)
// and MEADOWFIELD FARM with its windmill and barn GYM, then the snowy road
// (ROUTE 11) up to STONEPEAK WOODS, its bell tower and the CHIME HALL.

const SNOW = { base: '#eef3fa', hi: '#ffffff', lo: '#d6e0ee', dk: '#aebcd2', line: '#6a7890' };

Object.assign(TILE_DEFS, {
  // the farm
  'Æ': { name: 'wheat', grass: true, over: 'wheatOver' },
  'æ': { name: 'soil' },
  'Ø': { name: 'hayBale', solid: true },
  'ø': { name: 'scarecrow', solid: true },
  'Œ': { name: 'trough', solid: true },
  // the snow
  'Â': { name: 'snow' },
  'â': { name: 'deepSnow', grass: true, over: 'snowOver' },
  'Ã': { name: 'snowPine', solid: true },
  'ã': { name: 'snowRock', solid: true },
  'Ý': { name: 'ice' },
  'ý': { name: 'tracks' },
  // indoors
  'È': { name: 'turbine', solid: true },
  'è': { name: 'hayStack', solid: true },
  'Õ': { name: 'gear', solid: true },
  'õ': { name: 'sacks', solid: true },
  'ê': { name: 'towerFloor' },
  'ë': { name: 'bellRope', solid: true },
  'ì': { name: 'chimes', solid: true },
  'î': { name: 'hallFloor' },
});

Object.assign(BUILDINGS, {
  windmill: { w: 4, h: 7, door: 1, draw: 'windmillImg' },
  barnGym: { w: 7, h: 6, door: 3, draw: 'barnImg' },
  silo: { w: 2, h: 4, draw: 'siloImg' },
  farmHouse: { w: 5, h: 4, roof: '#b84838', wall: '#f4e8cc', door: 2, windows: [0.5, 3.5] },
  bellTower: { w: 3, h: 8, door: 1, draw: 'bellTowerImg' },
  chimeHall: { w: 7, h: 6, door: 3, draw: 'chimeHallImg' },
  snowHouse1: { w: 4, h: 4, roof: '#5a6a8a', wall: '#e8e0d4', door: 1, windows: [2.5], draw: 'snowHouseImg' },
  snowHouse2: { w: 5, h: 4, roof: '#7a4a48', wall: '#ece4d8', door: 2, windows: [0.5, 3.5], draw: 'snowHouseImg' },
  greatBell: { w: 3, h: 3, draw: 'greatBellImg' },
  millstone: { w: 3, h: 3, draw: 'millstoneImg' },
  tempestArray: { w: 2, h: 2, draw: 'tempestArrayImg' },
});

Object.assign(WALL_THEMES, {
  barn: { wall: '#a8443a', lo: '#8c3830', dk: '#5a2018', rim: '#f0e8d8', hi: '#c86050', base: '#6a4a30', baseDk: '#3a2818' },
  mill: { wall: '#b8aa94', lo: '#a09280', dk: '#6a5e50', rim: '#4a4038', hi: '#d0c4b0', base: '#7a5a3a', baseDk: '#4a3420' },
  tower: { wall: '#8c96a8', lo: '#7a8496', dk: '#4a5264', rim: '#2e3440', hi: '#a8b2c4', base: '#5a6272', baseDk: '#2e3440' },
  hall: { wall: '#e0d8f0', lo: '#ccc2e0', dk: '#8a80a8', rim: '#5a4a80', hi: '#f4eefc', base: '#6a5a90', baseDk: '#3a2e58' },
});

Object.assign(Tiles.floors, {
  'ê'() { return this.towerFloorImg(0); },
  'î'() { return this.hallFloorImg(0); },
});

Object.assign(Tiles.extra, {
  wheat(g, px, py) { g.drawImage(this.wheatImg(), px, py); },
  soil(g, px, py, n, x, y, map, hash) { g.drawImage(this.soilImg(hash % 3), px, py); },
  hayBale(g, px, py, n, x, y, map) {
    g.drawImage(this.groundCh8(map, n), px, py);
    g.drawImage(this.hayBaleImg(), px, py);
  },
  scarecrow(g, px, py, n, x, y, map) {
    g.drawImage(this.groundCh8(map, n), px, py);
    g.drawImage(this.scarecrowImg(), px, py);
  },
  trough(g, px, py, n, x, y, map) {
    g.drawImage(this.groundCh8(map, n), px, py);
    g.drawImage(this.troughImg(), px, py);
  },
  snow(g, px, py, n, x, y, map, hash) { g.drawImage(this.snowImg(hash % 6 === 0 ? 1 : hash % 9 === 0 ? 2 : 0), px, py); },
  deepSnow(g, px, py) { g.drawImage(this.deepSnowImg(), px, py); },
  snowPine(g, px, py, n, x, y, map, hash) {
    g.drawImage(this.snowImg(0), px, py);
    g.drawImage(this.snowPineImg(hash % 2), px, py);
  },
  snowRock(g, px, py, n, x, y, map) {
    g.drawImage(this.snowImg(0), px, py);
    g.drawImage(this.snowRockImg(), px, py);
  },
  ice(g, px, py, n, x, y, map, hash) { g.drawImage(this.iceImg(hash % 3), px, py); },
  tracks(g, px, py, n, x, y) { g.drawImage(this.tracksImg((x + y) % 2), px, py); },
  turbine(g, px, py, n, x, y, map, hash) {
    this.drawFloor(g, px, py, map);
    g.drawImage(this.turbineImg(hash % 2), px, py);
  },
  hayStack(g, px, py, n, x, y, map) {
    this.drawFloor(g, px, py, map);
    g.drawImage(this.hayBaleImg(), px, py);
  },
  gear(g, px, py, n, x, y, map) {
    this.drawFloor(g, px, py, map);
    g.drawImage(this.gearImg(), px, py);
  },
  sacks(g, px, py, n, x, y, map) {
    this.drawFloor(g, px, py, map);
    g.drawImage(this.sacksImg(), px, py);
  },
  towerFloor(g, px, py, n, x, y, map, hash) { g.drawImage(this.towerFloorImg(hash % 4 === 0 ? 1 : 0), px, py); },
  bellRope(g, px, py, n, x, y, map) {
    this.drawFloor(g, px, py, map);
    g.drawImage(this.bellRopeImg(), px, py);
  },
  chimes(g, px, py, n, x, y, map, hash) {
    this.drawFloor(g, px, py, map);
    g.drawImage(this.chimesImg(hash % 2), px, py);
  },
  hallFloor(g, px, py, n, x, y, map, hash) { g.drawImage(this.hallFloorImg(hash % 7 === 0 ? 1 : 0), px, py); },
});

Object.assign(Tiles, {
  // Ground under props on the farm: soil, path or grass.
  groundCh8(map, n) {
    const around = [n(0, 1), n(0, -1), n(-1, 0), n(1, 0)];
    if (map.def.ground === 'Â' || around.some((c) => c === 'Â' || c === 'â')) return this.snowImg(0);
    if (!map.def.outdoor) {
      const f = map.floor;
      return this.floors[f] ? this.floors[f].call(this) : this.woodImg();
    }
    if (around.filter((c) => c === 'æ' || c === 'Æ').length >= 2) return this.soilImg(0);
    if (around.filter((c) => c === ':').length >= 2) return this.pathPlainImg();
    return this.grassImg(0);
  },

  pathPlainImg() {
    return this.memo('pathPlain8', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = C.path;
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = C.pathLo;
      g.fillRect(3, 4, 1, 1); g.fillRect(11, 9, 1, 1); g.fillRect(6, 13, 1, 1);
      return c;
    });
  },

  // ------------------------------------------------------------ farm tiles
  soilImg(v) {
    return this.memo(`soil${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#8a6038';
      g.fillRect(0, 0, 16, 16);
      for (let y = 1; y < 16; y += 4) {
        g.fillStyle = '#a47648';
        g.fillRect(0, y, 16, 2);
        g.fillStyle = '#6a4424';
        g.fillRect(0, y + 2, 16, 1);
      }
      if (v > 0) {
        // Little green sprouts along the ridges.
        g.fillStyle = '#58a048';
        for (let x = 2 + v; x < 16; x += 5) { g.fillRect(x, 0, 1, 2); g.fillRect(x + 1, 1, 1, 1); g.fillRect(x - 2, 8, 1, 2); }
        g.fillStyle = '#88d060';
        for (let x = 2 + v; x < 16; x += 5) g.fillRect(x, 0, 1, 1);
      }
      return c;
    });
  },

  wheatImg() {
    return this.memo('wheat', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.soilImg(0), 0, 0);
      for (let i = 0; i < 6; i++) {
        const x = 1 + i * 2.6;
        const top = i % 2 ? 1 : 3;
        g.fillStyle = '#a07828';
        g.fillRect(Math.round(x), top + 3, 1, 12 - top);
        g.fillStyle = '#e8c050';
        g.fillRect(Math.round(x) - 1, top, 3, 4);
        g.fillStyle = '#f8e080';
        g.fillRect(Math.round(x), top, 1, 2);
        g.fillStyle = '#c89830';
        g.fillRect(Math.round(x) + 1, top + 2, 1, 2);
      }
      g.fillStyle = '#6a4a20';
      g.fillRect(0, 15, 16, 1);
      return c;
    });
  },

  wheatOverImg() {
    return this.memo('wheatOver', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      for (let i = 0; i < 6; i++) {
        const x = Math.round(1 + i * 2.6);
        g.fillStyle = '#a07828';
        g.fillRect(x, 11, 1, 5);
        g.fillStyle = '#e8c050';
        g.fillRect(x - 1, 8 + (i % 2), 3, 3);
        g.fillStyle = '#f8e080';
        g.fillRect(x, 8 + (i % 2), 1, 1);
      }
      return c;
    });
  },

  hayBaleImg() {
    return this.memo('haybale', () => {
      const p = new Painter(16, 16);
      p.ellipse(8, 14, 7, 2, { fill: 'rgba(0,0,0,0.22)', line: false });
      p.rrect(1, 3, 14, 11, 3, { fill: '#e8c860', shade: '#c8a040', hi: '#f8e8a0', line: '#6a5020' });
      const c = p.toCanvas();
      const g = c.getContext('2d');
      g.fillStyle = '#a07828';
      g.fillRect(5, 4, 1, 10); g.fillRect(10, 4, 1, 10);
      g.fillStyle = '#f8f0c0';
      g.fillRect(3, 6, 1, 1); g.fillRect(7, 9, 1, 1); g.fillRect(12, 7, 1, 1);
      return c;
    });
  },

  scarecrowImg() {
    return this.memo('scarecrow', () => Pix.fromRows([
      '.....hhhhhh.....',
      '....hHHHHHHh....',
      '..hhhhhhhhhhhh..',
      '.....oyyyyo.....',
      '.....oyeyeo.....',
      '.....oyyyyo.....',
      '.ssssssssssssss.',
      '.sSSssppsssSSSs.',
      '.y...sppps...y..',
      '.....spppsp.....',
      '.....sssss......',
      '.......w........',
      '.......w........',
      '.......w........',
      '.......w........',
      '......www.......',
    ], { h: '#c8a048', H: '#a07828', o: '#5a4020', y: '#e8d080', e: '#303030', s: '#c05838', S: '#8a3a28', p: '#4a78b0', w: '#7a5230' }));
  },

  troughImg() {
    return this.memo('trough', () => Pix.fromRows([
      '................',
      '................',
      '................',
      '................',
      '................',
      '.oooooooooooooo.',
      '.owwwwwwwwwwwwo.',
      '.owbbbbbbbbbbwo.',
      '.owbBbbbbBbbbwo.',
      '.owwwwwwwwwwwwo.',
      '.oddddddddddddo.',
      '.oddddddddddddo.',
      '..o.........o...',
      '..o.........o...',
      '..oo.......oo...',
      '................',
    ], { o: '#3a2410', w: '#a07040', d: '#7a5028', b: '#5898e0', B: '#a8d8f8' }));
  },

  // ------------------------------------------------------------ snow tiles
  snowImg(v) {
    return this.memo(`snow${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = SNOW.base;
      g.fillRect(0, 0, 16, 16);
      const r = U.seeded(810 + v);
      for (let i = 0; i < 6; i++) {
        g.fillStyle = i % 2 ? SNOW.lo : SNOW.hi;
        g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), i % 3 ? 1 : 2, 1);
      }
      if (v === 1) {
        g.fillStyle = SNOW.lo;
        g.fillRect(2, 9, 5, 1); g.fillRect(9, 4, 4, 1);
        g.fillStyle = SNOW.hi;
        g.fillRect(2, 8, 5, 1); g.fillRect(9, 3, 4, 1);
      }
      if (v === 2) {
        g.fillStyle = '#b8e0ff';
        g.fillRect(6, 6, 1, 1); g.fillRect(12, 12, 1, 1);
      }
      return c;
    });
  },

  deepSnowImg() {
    return this.memo('deepSnow', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.snowImg(0), 0, 0);
      for (const [x, y] of [[0, 1], [8, 1], [4, 8], [12, 8]]) {
        const p = new Painter(8, 8);
        p.ellipse(4, 4.5, 3.8, 3, { fill: SNOW.hi, shade: SNOW.lo, hi: '#ffffff', line: SNOW.dk });
        g.drawImage(p.toCanvas(), x, y);
      }
      return c;
    });
  },

  snowOverImg() {
    return this.memo('snowOver', () => {
      const c = Pix.canvas(16, 16);
      for (const x of [0, 6, 11]) {
        const p = new Painter(8, 6);
        p.ellipse(3, 3.5, 3, 2.5, { fill: SNOW.hi, shade: SNOW.lo, line: SNOW.dk });
        c.getContext('2d').drawImage(p.toCanvas(), x - 1, 10);
      }
      return c;
    });
  },

  snowPineImg(v) {
    return this.memo(`snowPine${v}`, () => {
      const p = new Painter(16, 16);
      p.ellipse(8, 14.5, 5, 1.5, { fill: 'rgba(40,60,90,0.25)', line: false });
      p.rect(7, 12, 2, 3, { fill: '#6a4a2a', line: '#2a1c10' });
      const green = { fill: '#3a6a4c', shade: '#28503a', hi: '#4c8460', line: '#142a1e' };
      p.poly([[8, 1], [13, 7], [3, 7]], green);
      p.poly([[8, 4], [14, 11], [2, 11]], green);
      p.poly([[8, 7], [15, 14], [1, 14]], green);
      const c = p.toCanvas();
      const g = c.getContext('2d');
      // Snow caps on each tier.
      g.fillStyle = '#ffffff';
      g.fillRect(7, 1, 2, 2); g.fillRect(5, 5, 6, 1); g.fillRect(4, 9, 8, 1); g.fillRect(3, 12, 4 + v, 1);
      g.fillStyle = '#dce6f2';
      g.fillRect(6, 3, 1, 1); g.fillRect(10, 6, 1, 1); g.fillRect(3, 10, 1, 1); g.fillRect(12, 13, 1, 1);
      return c;
    });
  },

  snowRockImg() {
    return this.memo('snowRock', () => {
      const p = new Painter(16, 16);
      p.ellipse(8, 14, 7, 2, { fill: 'rgba(40,60,90,0.22)', line: false });
      p.ellipse(8, 10, 7, 5, { fill: '#8c94a4', shade: '#6a7282', hi: '#aab2c0', line: '#303844' });
      p.ellipse(7.5, 7, 6, 3, { fill: SNOW.hi, shade: SNOW.lo, line: SNOW.line });
      return p.toCanvas();
    });
  },

  iceImg(v) {
    return this.memo(`ice${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#a8d4ee';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#d8f0ff';
      g.fillRect(2 + v, 3, 6, 1); g.fillRect(9, 10 - v, 5, 1); g.fillRect(4, 12, 3, 1);
      g.fillStyle = '#88bcdc';
      g.fillRect(10 - v, 5, 1, 3); g.fillRect(3, 7, 1, 2);
      return c;
    });
  },

  tracksImg(v) {
    return this.memo(`tracks${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.snowImg(0), 0, 0);
      g.fillStyle = '#9aa8c0';
      for (const [x, y] of v ? [[3, 2], [9, 7], [4, 12]] : [[9, 1], [3, 6], [10, 11]]) {
        g.fillRect(x, y + 1, 3, 2);
        g.fillRect(x - 1, y, 1, 1); g.fillRect(x + 1, y - 1, 1, 1); g.fillRect(x + 3, y, 1, 1);
      }
      return c;
    });
  },

  // ------------------------------------------------------------ interiors
  turbineImg(v) {
    return this.memo(`turbine${v}`, () => {
      const p = new Painter(16, 16);
      p.rrect(1, 3, 14, 12, 2, { fill: '#6a7282', shade: '#4a5262', hi: '#8a94a4', line: '#1c2028' });
      p.ellipse(8, 8.5, 4.5, 4.5, { fill: '#2a3040', line: '#12141c' });
      const c = p.toCanvas();
      const g = c.getContext('2d');
      g.fillStyle = '#f8d048';
      if (v) { g.fillRect(4, 8, 8, 1); g.fillRect(7, 5, 1, 7); } else { g.fillRect(5, 5, 1, 1); g.fillRect(6, 6, 1, 1); g.fillRect(8, 8, 1, 1); g.fillRect(10, 10, 1, 1); g.fillRect(9, 7, 1, 1); g.fillRect(7, 9, 1, 1); }
      g.fillStyle = '#60e0a0';
      g.fillRect(3, 13, 2, 1);
      g.fillStyle = '#f0c030';
      g.fillRect(11, 13, 2, 1);
      return c;
    });
  },

  gearImg() {
    return this.memo('gear8', () => {
      const p = new Painter(16, 16);
      const wood = { fill: '#a07040', shade: '#7a5028', hi: '#c89058', line: '#3a2410' };
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        p.rect(8 + Math.cos(a) * 6 - 1.5, 8 + Math.sin(a) * 6 - 1.5, 3, 3, wood);
      }
      p.ellipse(8, 8, 5.5, 5.5, wood);
      p.ellipse(8, 8, 1.8, 1.8, { fill: '#3a2410', line: '#1a1008' });
      return p.toCanvas();
    });
  },

  sacksImg() {
    return this.memo('sacks', () => {
      const p = new Painter(16, 16);
      const sack = { fill: '#e8dcc0', shade: '#c8b894', hi: '#f8f0e0', line: '#5a4a30' };
      p.rrect(1, 6, 8, 9, 3, sack);
      p.rrect(7, 5, 8, 10, 3, sack);
      p.rrect(4, 1, 8, 8, 3, sack);
      const c = p.toCanvas();
      const g = c.getContext('2d');
      g.fillStyle = '#b8683c';
      g.fillRect(6, 4, 4, 1); g.fillRect(9, 9, 3, 1);
      return c;
    });
  },

  towerFloorImg(v) {
    return this.memo(`towerFloor${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#9aa2b2';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#7c8494';
      g.fillRect(0, 7, 16, 1); g.fillRect(0, 15, 16, 1); g.fillRect(7, 0, 1, 7); g.fillRect(12, 8, 1, 7);
      g.fillStyle = '#b4bccb';
      g.fillRect(0, 0, 7, 1); g.fillRect(8, 8, 4, 1);
      if (v) {
        g.fillStyle = '#6c7484';
        g.fillRect(3, 3, 2, 1); g.fillRect(9, 11, 1, 2);
      }
      return c;
    });
  },

  bellRopeImg() {
    return this.memo('bellRope', () => Pix.fromRows([
      '.......rr.......',
      '.......rR.......',
      '.......rr.......',
      '.......Rr.......',
      '.......rr.......',
      '.......rR.......',
      '.......rr.......',
      '.......Rr.......',
      '.......rr.......',
      '......rrrr......',
      '.....rRrrRr.....',
      '.....rrrrrr.....',
      '......rRRr......',
      '.......rr.......',
      '................',
      '................',
    ], { r: '#c8a060', R: '#8a6a38' }));
  },

  chimesImg(v) {
    return this.memo(`chimes${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#4a3420';
      g.fillRect(1, 1, 14, 2); g.fillRect(1, 1, 2, 15); g.fillRect(13, 1, 2, 15);
      const bell = (x, len) => {
        g.fillStyle = '#6a5a40';
        g.fillRect(x + 1, 3, 1, len);
        const p = new Painter(6, 6);
        p.poly([[1, 5], [2, 0.5], [3, 0.5], [4, 5]], { fill: '#f0c048', shade: '#c09020', hi: '#fff0a0', line: '#5a3a08' });
        g.drawImage(p.toCanvas(), x - 1, 3 + len);
      };
      bell(4, v ? 3 : 5);
      bell(8, v ? 6 : 2);
      return c;
    });
  },

  hallFloorImg(v) {
    return this.memo(`hallFloor${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#b88a58';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#a07448';
      for (let y = 3; y < 16; y += 4) g.fillRect(0, y, 16, 1);
      g.fillStyle = '#c89c68';
      for (let y = 0; y < 16; y += 4) g.fillRect(0, y, 16, 1);
      if (v) {
        // A golden note set into the boards.
        g.fillStyle = '#f0c048';
        g.fillRect(6, 9, 3, 2); g.fillRect(8, 5, 1, 4); g.fillRect(9, 5, 2, 1);
      }
      return c;
    });
  },

  // ------------------------------------------------------------ buildings
  windmillImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const p = new Painter(W, H);
    const stone = { fill: '#d8ccb4', shade: '#b8aa90', hi: '#f0e6d2', line: '#4a4034' };
    p.ellipse(W / 2, H - 3, W / 2 - 1, 4, { fill: 'rgba(0,0,0,0.22)', line: false });
    // Tapering tower.
    p.poly([[6, H - 2], [W - 6, H - 2], [W - 13, 30], [13, 30]], stone);
    // Wooden cap.
    p.poly([[9, 32], [W - 9, 32], [W - 12, 20], [W / 2, 10], [12, 20]], { fill: '#a85840', shade: '#7a3c2c', hi: '#c87a5c', line: '#3a1c14' });
    const c = p.toCanvas();
    const g = c.getContext('2d');
    // Stone courses.
    g.fillStyle = '#b8aa90';
    for (let y = 40; y < H - 4; y += 8) {
      const t = (y - 30) / (H - 32);
      const half = Math.round(W / 2 - 13 + t * 7);
      g.fillRect(W / 2 - half, y, half * 2, 1);
    }
    // Hub where the sails attach (the sails are an animated prop).
    g.fillStyle = '#3a2410';
    g.fillRect(W / 2 - 3, 22, 6, 6);
    g.fillStyle = '#8a6a48';
    g.fillRect(W / 2 - 2, 23, 4, 4);
    // Windows and door.
    for (const [x, y] of [[W / 2 - 2, 44], [W / 2 - 2, 64]]) {
      g.fillStyle = '#3a3040';
      g.fillRect(x, y, 5, 7);
      g.fillStyle = '#f8e090';
      g.fillRect(x + 1, y + 1, 3, 5);
    }
    g.fillStyle = '#3a2410';
    g.fillRect(20, H - 16, 11, 14);
    g.fillStyle = '#7a5230';
    g.fillRect(21, H - 15, 9, 13);
    g.fillStyle = '#a07040';
    g.fillRect(25, H - 15, 1, 13);
    return c;
  },

  // The sails, drawn separately so they can turn.
  sailsImg(f) {
    return this.memo(`sails${f}`, () => {
      // The hub sits off-centre so the prop, standing on the windmill's
      // second column and fourth row, lines up with the hub on the cap.
      const c = Pix.canvas(72, 67);
      const g = c.getContext('2d');
      g.translate(44, 28);
      g.rotate((f / 8) * (Math.PI / 2));
      for (let i = 0; i < 4; i++) {
        g.fillStyle = '#3a2410';
        g.fillRect(-2, 2, 4, 24);
        g.fillStyle = '#7a5230';
        g.fillRect(-1, 2, 2, 24);
        // Canvas lattice.
        g.fillStyle = '#3a2410';
        g.fillRect(2, 6, 8, 19);
        g.fillStyle = '#f0e8d4';
        g.fillRect(3, 7, 6, 17);
        g.fillStyle = '#c8bca4';
        for (let y = 10; y < 24; y += 4) g.fillRect(3, y, 6, 1);
        g.rotate(Math.PI / 2);
      }
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = '#3a2410';
      g.fillRect(41, 25, 6, 6);
      g.fillStyle = '#a07040';
      g.fillRect(42, 26, 4, 4);
      return c;
    });
  },

  barnImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    const red = '#b8443a';
    // Gambrel roof.
    const roof = [[2, 40], [10, 18], [W / 2, 4], [W - 10, 18], [W - 2, 40]];
    g.fillStyle = '#3a1c14';
    g.beginPath();
    roof.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fill();
    g.fillStyle = '#6a3a30';
    g.beginPath();
    [[5, 39], [12, 19], [W / 2, 7], [W - 12, 19], [W - 5, 39]].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fill();
    g.fillStyle = '#7a4a3e';
    for (let y = 12; y < 39; y += 4) g.fillRect(8, y, W - 16, 1);
    // Walls.
    g.fillStyle = '#3a1c14';
    g.fillRect(4, 36, W - 8, H - 36);
    g.fillStyle = red;
    g.fillRect(5, 37, W - 10, H - 37);
    g.fillStyle = '#9a3830';
    for (let x = 8; x < W - 6; x += 6) g.fillRect(x, 37, 1, H - 37);
    // Hay loft door with a lightning bolt.
    g.fillStyle = '#f0e8d8';
    g.fillRect(W / 2 - 9, 22, 18, 14);
    g.fillStyle = '#5a2a20';
    g.fillRect(W / 2 - 7, 24, 14, 12);
    g.fillStyle = '#f8d048';
    const bolt = [[W / 2 + 2, 25], [W / 2 - 3, 31], [W / 2, 31], [W / 2 - 2, 35], [W / 2 + 4, 29], [W / 2 + 1, 29]];
    g.beginPath();
    bolt.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fill();
    // Big X-braced doors.
    const dx = W / 2 - 14;
    g.fillStyle = '#f0e8d8';
    g.fillRect(dx, H - 30, 28, 30);
    g.fillStyle = '#8a3028';
    g.fillRect(dx + 2, H - 28, 11, 28); g.fillRect(dx + 15, H - 28, 11, 28);
    g.strokeStyle = '#f0e8d8';
    g.lineWidth = 2;
    for (const x0 of [dx + 2, dx + 15]) {
      g.beginPath(); g.moveTo(x0, H - 28); g.lineTo(x0 + 11, H); g.moveTo(x0 + 11, H - 28); g.lineTo(x0, H); g.stroke();
    }
    // Windows.
    for (const x of [10, W - 20]) {
      g.fillStyle = '#f0e8d8';
      g.fillRect(x, 46, 10, 10);
      g.fillStyle = '#3a3040';
      g.fillRect(x + 1, 47, 8, 8);
      g.fillStyle = '#f8e090';
      g.fillRect(x + 1, 47, 3, 3);
    }
    return c;
  },

  siloImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const p = new Painter(W, H);
    const metal = { fill: '#b8c0cc', shade: '#8a94a4', hi: '#dce2ea', line: '#3a404c' };
    p.rect(2, 12, W - 5, H - 14, metal);
    p.ellipse(W / 2, 12, W / 2 - 2, 9, metal);
    const c = p.toCanvas();
    const g = c.getContext('2d');
    g.fillStyle = '#8a94a4';
    for (let y = 18; y < H - 4; y += 8) g.fillRect(3, y, W - 6, 1);
    g.fillStyle = '#3a404c';
    g.fillRect(W - 8, 20, 2, H - 24);
    for (let y = 22; y < H - 4; y += 4) g.fillRect(W - 10, y, 6, 1);
    return c;
  },

  bellTowerImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    const k = WALL_THEMES.tower;
    // Stone shaft.
    g.fillStyle = k.rim;
    g.fillRect(4, 30, W - 8, H - 30);
    g.fillStyle = k.wall;
    g.fillRect(5, 31, W - 10, H - 31);
    g.fillStyle = k.lo;
    for (let y = 36; y < H; y += 6) g.fillRect(5, y, W - 10, 1);
    for (let y = 36; y < H; y += 12) { g.fillRect(14, y, 1, 6); g.fillRect(32, y + 6, 1, 6); }
    // Belfry with its arch and the great bell glinting inside.
    g.fillStyle = k.rim;
    g.fillRect(2, 22, W - 4, 32);
    g.fillStyle = k.hi;
    g.fillRect(3, 23, W - 6, 30);
    g.fillStyle = '#1c2028';
    g.fillRect(12, 28, W - 24, 22);
    g.beginPath(); g.arc(W / 2, 30, (W - 24) / 2, Math.PI, 0); g.fill();
    const bell = new Painter(20, 18);
    bell.poly([[3, 16], [6, 3], [10, 1], [14, 3], [17, 16]], { fill: '#e8b840', shade: '#b88a20', hi: '#fff0a0', line: '#4a3008' });
    g.drawImage(bell.toCanvas(), W / 2 - 10, 30);
    g.fillStyle = '#9058d8';
    g.fillRect(W / 2 - 1, 46, 3, 3);
    // Pointed roof with snow.
    g.fillStyle = '#2a2e3a';
    g.beginPath(); g.moveTo(0, 24); g.lineTo(W / 2, 0); g.lineTo(W, 24); g.closePath(); g.fill();
    g.fillStyle = '#4a5068';
    g.beginPath(); g.moveTo(3, 22); g.lineTo(W / 2, 3); g.lineTo(W - 3, 22); g.closePath(); g.fill();
    g.fillStyle = '#ffffff';
    g.beginPath(); g.moveTo(W / 2 - 6, 8); g.lineTo(W / 2, 3); g.lineTo(W / 2 + 6, 8); g.lineTo(W / 2 + 2, 9); g.lineTo(W / 2 - 3, 10); g.closePath(); g.fill();
    g.fillRect(2, 21, W - 4, 3);
    g.fillRect(6, 24, 2, 2); g.fillRect(20, 24, 3, 1); g.fillRect(36, 24, 2, 2);
    // Door.
    g.fillStyle = k.rim;
    g.fillRect(W / 2 - 7, H - 16, 14, 16);
    g.fillStyle = '#5a3c28';
    g.fillRect(W / 2 - 6, H - 15, 12, 15);
    g.fillStyle = '#c8a060';
    g.fillRect(W / 2 + 3, H - 8, 1, 2);
    return c;
  },

  chimeHallImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    const k = WALL_THEMES.hall;
    // Snowy pitched roof.
    g.fillStyle = '#2a2448';
    g.beginPath(); g.moveTo(0, 34); g.lineTo(W / 2, 2); g.lineTo(W, 34); g.closePath(); g.fill();
    g.fillStyle = '#4a3e78';
    g.beginPath(); g.moveTo(4, 32); g.lineTo(W / 2, 6); g.lineTo(W - 4, 32); g.closePath(); g.fill();
    g.fillStyle = '#ffffff';
    g.beginPath(); g.moveTo(2, 33); g.lineTo(W / 2, 4); g.lineTo(W - 2, 33); g.lineTo(W - 10, 30); g.lineTo(W / 2, 12); g.lineTo(10, 30); g.closePath(); g.fill();
    // Walls.
    g.fillStyle = k.rim;
    g.fillRect(4, 32, W - 8, H - 32);
    g.fillStyle = k.wall;
    g.fillRect(5, 33, W - 10, H - 33);
    g.fillStyle = k.lo;
    for (let y = 40; y < H; y += 7) g.fillRect(5, y, W - 10, 1);
    // Round window with a note.
    g.fillStyle = k.rim;
    g.beginPath(); g.arc(W / 2, 24, 8, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#f8e8a0';
    g.beginPath(); g.arc(W / 2, 24, 6, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#5a4a80';
    g.fillRect(W / 2 - 2, 25, 3, 2); g.fillRect(W / 2, 20, 1, 5); g.fillRect(W / 2 + 1, 20, 2, 1);
    // Columns and hanging bells by the door.
    for (const x of [14, W - 22]) {
      g.fillStyle = k.rim;
      g.fillRect(x, 36, 8, H - 36);
      g.fillStyle = k.hi;
      g.fillRect(x + 1, 36, 6, H - 36);
      g.fillStyle = '#f0c048';
      g.fillRect(x + 2, 44, 4, 4);
      g.fillRect(x + 1, 47, 6, 1);
    }
    // Doors.
    g.fillStyle = k.rim;
    g.fillRect(W / 2 - 10, H - 24, 20, 24);
    g.fillStyle = '#6a4a8a';
    g.fillRect(W / 2 - 9, H - 23, 8, 23); g.fillRect(W / 2 + 1, H - 23, 8, 23);
    g.fillStyle = '#f0c048';
    g.fillRect(W / 2 - 3, H - 12, 1, 3); g.fillRect(W / 2 + 2, H - 12, 1, 3);
    return c;
  },

  snowHouseImg(spec) {
    const c = this.house(spec.w, spec.h, spec);
    const g = c.getContext('2d');
    const W = spec.w * 16;
    // Snow piled along the roof, with a few drips over the eaves.
    g.fillStyle = '#ffffff';
    g.fillRect(3, 2, W - 6, 5);
    g.fillRect(1, 5, W - 2, 3);
    g.fillStyle = '#dce6f2';
    g.fillRect(1, 8, W - 2, 1);
    for (let x = 5; x < W - 4; x += 7) g.fillRect(x, 9, 2, 2 + (x % 3));
    g.fillStyle = '#ffffff';
    g.fillRect(1, 28, W - 2, 2);
    return c;
  },

  greatBellImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const p = new Painter(W, H);
    p.rect(0, 1, W - 1, 4, { fill: '#6a4a2a', shade: '#4a3018', hi: '#8a6a40', line: '#2a1a0c' });
    p.poly([[5, H - 4], [12, 10], [W / 2, 6], [W - 12, 10], [W - 5, H - 4]], { fill: '#e8b840', shade: '#b88a20', hi: '#fff0a0', line: '#4a3008' });
    p.rect(3, H - 7, W - 7, 4, { fill: '#c89828', shade: '#a07818', hi: '#f0d060', line: '#4a3008' });
    p.ellipse(W / 2, H - 4, 3, 3, { fill: '#9058d8', shade: '#6030a8', hi: '#e0c8ff', line: '#281840' });
    const c = p.toCanvas();
    const g = c.getContext('2d');
    g.fillStyle = '#4a3008';
    g.fillRect(W / 2 - 1, 5, 2, 3);
    g.fillStyle = '#b88a20';
    g.fillRect(14, 22, W - 28, 1);
    return c;
  },

  millstoneImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const p = new Painter(W, H);
    p.ellipse(W / 2, H / 2 + 6, W / 2 - 1, 12, { fill: 'rgba(0,0,0,0.25)', line: false });
    p.ellipse(W / 2, H / 2 + 2, W / 2 - 2, 14, { fill: '#9a948a', shade: '#78726a', hi: '#bab4aa', line: '#3a3632' });
    p.ellipse(W / 2, H / 2 - 1, W / 2 - 6, 10, { fill: '#aaa49a', shade: '#8a847a', line: '#4a4640' });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      p.line(W / 2 + Math.cos(a) * 5, H / 2 - 1 + Math.sin(a) * 3.5, W / 2 + Math.cos(a) * 16, H / 2 - 1 + Math.sin(a) * 9, '#6a6660');
    }
    p.ellipse(W / 2, H / 2 - 1, 5, 4, { fill: '#9058d8', shade: '#6030a8', hi: '#e0c8ff', line: '#281840' });
    return p.toCanvas();
  },

  tempestArrayImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const p = new Painter(W, H);
    p.rrect(3, 16, W - 7, H - 17, 3, { fill: '#303040', shade: '#1c1c28', hi: '#4a4a60', line: '#0c0c14' });
    p.rect(W / 2 - 2, 3, 4, 14, { fill: '#8890a8', shade: '#606880', line: '#1c2028' });
    for (const y of [5, 9, 13]) p.ellipse(W / 2, y, 6, 1.6, { fill: '#a060e8', shade: '#7038c0', hi: '#e0c0ff', line: '#281840' });
    const c = p.toCanvas();
    const g = c.getContext('2d');
    g.fillStyle = '#f8d048';
    g.fillRect(8, 22, 3, 2); g.fillRect(W - 11, 24, 3, 2);
    g.fillStyle = '#a060e8';
    g.fillRect(W / 2 - 4, H - 8, 8, 2);
    return c;
  },
});

// Props: bent and fixed lightning rods, and the windmill's turning sails.
Object.assign(Props, {
  rodBent(f) {
    const c = Pix.canvas(16, 32);
    const g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,0.22)';
    g.fillRect(4, 30, 9, 2);
    g.fillStyle = '#3a2410';
    g.fillRect(6, 12, 4, 19);
    g.fillStyle = '#7a5230';
    g.fillRect(7, 12, 2, 19);
    // The copper rod, wrenched sideways toward the windmill.
    g.fillStyle = '#6a3a18';
    g.fillRect(7, 6, 2, 7); g.fillRect(9, 3, 2, 4); g.fillRect(11, 1, 2, 3);
    g.fillStyle = '#e08a48';
    g.fillRect(7, 6, 1, 7); g.fillRect(9, 3, 1, 4); g.fillRect(11, 1, 1, 3);
    // TEAM DISTORTION's clamp, crackling.
    g.fillStyle = '#281840';
    g.fillRect(5, 13, 6, 5);
    g.fillStyle = '#a060e8';
    g.fillRect(6, 14, 4, 3);
    g.fillStyle = f === 1 ? '#f8f0ff' : '#e0c0ff';
    const sparks = [[[3, 12], [12, 16], [4, 18]], [[2, 15], [13, 13], [11, 19]], [[4, 11], [12, 18], [3, 17]]][f];
    for (const [x, y] of sparks) { g.fillRect(x, y, 1, 1); g.fillRect(x + (x < 8 ? -1 : 1), y + 1, 1, 1); }
    return c;
  },
  rodFixed() {
    const c = Pix.canvas(16, 32);
    const g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,0.22)';
    g.fillRect(4, 30, 9, 2);
    g.fillStyle = '#3a2410';
    g.fillRect(6, 12, 4, 19);
    g.fillStyle = '#7a5230';
    g.fillRect(7, 12, 2, 19);
    g.fillStyle = '#6a3a18';
    g.fillRect(7, 0, 2, 13);
    g.fillStyle = '#f0a060';
    g.fillRect(7, 0, 1, 13);
    for (const y of [4, 9]) {
      g.fillStyle = '#3a6878';
      g.fillRect(5, y, 6, 2);
      g.fillStyle = '#88d0e0';
      g.fillRect(6, y, 4, 1);
    }
    return c;
  },
  sails(f) { return Tiles.sailsImg(f); },
});
{
  const baseImage = Props.image;
  const anims = { rodBent: [3, 8], sails: [8, 6] };
  Props.image = function image(name, frame) {
    const a = anims[name];
    if (!a) return baseImage.call(this, name, frame);
    const f = Math.floor(frame / a[1]) % a[0];
    const key = `${name}${f}`;
    if (!this.cache[key]) this.cache[key] = this[name](f);
    return this.cache[key];
  };
}

// Snowy ground: roads, signs, rocks, lamps and ledges sit on snow.
{
  const baseStatic = Tiles.drawStatic;
  Tiles.drawStatic = function drawStatic(g, ch, px, py, n, x, y, map) {
    if (map.def.ground !== 'Â') {
      baseStatic.call(this, g, ch, px, py, n, x, y, map);
      return;
    }
    const d = this.def(ch);
    const hash = ((x * 73856093) ^ (y * 19349663)) >>> 0;
    const onSnow = { rock: 'snowRockImg', bush: 'bushImg', boulder: 'boulderImg', lamp: 'lampImg', sign: 'signImg', crates: 'crateImg', barrels: 'barrelsImg' };
    if (onSnow[d.name]) {
      g.drawImage(this.snowImg(0), px, py);
      g.drawImage(this[onSnow[d.name]](), px, py);
      return;
    }
    if (d.name === 'building' || d.name === 'grass' || d.name === 'flowers') {
      g.drawImage(this.snowImg(hash % 6 === 0 ? 1 : 0), px, py);
      return;
    }
    if (d.name === 'tree' || d.name === 'pine') {
      g.drawImage(this.snowImg(0), px, py);
      g.drawImage(this.snowPineImg(hash % 2), px, py);
      return;
    }
    if (d.name === 'path') {
      g.drawImage(this.slushImg(hash % 2), px, py);
      const road = (c) => c === ':' || c === '#' || c === 'S' || c === 'B';
      g.fillStyle = SNOW.lo;
      if (!road(n(0, -1))) g.fillRect(px, py, 16, 1);
      if (!road(n(0, 1))) g.fillRect(px, py + 15, 16, 1);
      if (!road(n(-1, 0))) g.fillRect(px, py, 1, 16);
      if (!road(n(1, 0))) g.fillRect(px + 15, py, 1, 16);
      return;
    }
    if (d.name === 'ledge') {
      g.drawImage(this.snowImg(0), px, py);
      g.drawImage(this.snowLedgeImg(), px, py);
      return;
    }
    baseStatic.call(this, g, ch, px, py, n, x, y, map);
  };

  Object.assign(Tiles, {
    slushImg(v) {
      return this.memo(`slush${v}`, () => {
        const c = Pix.canvas(16, 16);
        const g = c.getContext('2d');
        g.fillStyle = '#c8cedb';
        g.fillRect(0, 0, 16, 16);
        const r = U.seeded(860 + v);
        for (let i = 0; i < 9; i++) {
          g.fillStyle = i % 3 ? '#b4bccb' : '#e2e8f2';
          g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 2, 1);
        }
        return c;
      });
    },
    snowLedgeImg() {
      return this.memo('snowLedge', () => {
        const c = Pix.canvas(16, 16);
        const g = c.getContext('2d');
        g.fillStyle = SNOW.lo;
        g.fillRect(0, 8, 16, 5);
        g.fillStyle = SNOW.dk;
        g.fillRect(0, 12, 16, 2);
        g.fillStyle = '#ffffff';
        g.fillRect(0, 7, 16, 1);
        g.fillStyle = SNOW.line;
        g.fillRect(0, 13, 16, 1);
        return c;
      });
    },
  });

  // Out-of-map borders.
  const baseBorder = Tiles.borderImg;
  Tiles.borderImg = function borderImg(ch) {
    if (ch === 'Ã') return this.memo('borderÃ', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.snowImg(0), 0, 0);
      g.drawImage(this.snowPineImg(0), 0, 0);
      return c;
    });
    return baseBorder.call(this, ch);
  };
}
