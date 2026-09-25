'use strict';
// Tiles, buildings and props for chapters 6 and 7: ROUTE 9 by the lake,
// the dune road (ROUTE 10), SUNSPIRE RUINS with its sun spire and GROUND-type
// GYM, and TEAM DISTORTION's dig site under the ruins.

const SAND = { base: '#e8c890', hi: '#f4dcaa', mid: '#d8b478', lo: '#c49c5c', dk: '#a07a40', line: '#5a4424' };
const SANDSTONE = { base: '#d8b27a', hi: '#ecd09c', lo: '#c09a62', dk: '#8a6a3c', line: '#4a3820' };

Object.assign(TILE_DEFS, {
  // outdoors
  'À': { name: 'desertSand' },
  'Ä': { name: 'dryGrass', grass: true, over: 'dryOver' },
  'Ñ': { name: 'cactus', solid: true },
  'Ê': { name: 'dune', solid: true },
  'Ì': { name: 'sandPillar', solid: true },
  'Ï': { name: 'brokenPillar', solid: true },
  'Î': { name: 'ruinWall', solid: true },
  'Ô': { name: 'sandPaving' },
  'Ë': { name: 'palm', solid: true },
  'Û': { name: 'rubble', solid: true },
  // indoors (the dig site)
  'Ò': { name: 'digFloor', wild: true },
  'Ù': { name: 'carvings', solid: true },
  'Ü': { name: 'sunVein', solid: true },
  'Å': { name: 'lantern', solid: true },
});

Object.assign(BUILDINGS, {
  sunSpire: { w: 3, h: 7, draw: 'sunSpireImg' },
  sandGym: { w: 7, h: 6, door: 3, draw: 'sandGymImg' },
  digMouth: { w: 3, h: 3, door: 1, draw: 'digMouthImg' },
  stall: { w: 3, h: 2, draw: 'stallImg' },
  houseAdobe: { w: 4, h: 4, roof: '#b8683c', wall: '#ecd2a4', door: 1, windows: [2.5] },
  houseAdobe2: { w: 5, h: 4, roof: '#a85848', wall: '#e8cc9c', door: 2, windows: [0.5, 3.5] },
  cabinLake: { w: 4, h: 4, roof: '#4a7aa8', wall: '#e8dcc4', door: 2, windows: [0.5] },
});

Object.assign(WALL_THEMES, {
  ruins: { wall: SANDSTONE.base, lo: SANDSTONE.lo, dk: SANDSTONE.dk, rim: SANDSTONE.line, hi: SANDSTONE.hi, base: '#9c7a48', baseDk: '#5a4424' },
  adobe: { wall: '#e8cc9c', lo: '#d8b884', dk: '#a8845a', rim: '#6a5030', hi: '#f4dcb4', base: '#b8683c', baseDk: '#6a3a20' },
});

Object.assign(Tiles.floors, {
  'Ò'() { return this.digFloorImg(0); },
  'Ô'() { return this.sandPavingImg(0); },
  'À'() { return this.desertSandImg(0); },
});

Object.assign(Tiles.extra, {
  desertSand(g, px, py, n, x, y, map, hash) { g.drawImage(this.desertSandImg(hash % 5 === 0 ? 1 : hash % 7 === 0 ? 2 : 0), px, py); },
  dryGrass(g, px, py) { g.drawImage(this.dryGrassImg(), px, py); },
  cactus(g, px, py, n, x, y, map, hash) {
    g.drawImage(this.desertSandImg(0), px, py);
    g.drawImage(this.cactusImg(hash % 2), px, py);
  },
  dune(g, px, py, n, x, y, map, hash) {
    const d = (c) => c === 'Ê';
    g.drawImage(this.duneImg(d(n(0, -1)), d(n(0, 1)), hash % 3), px, py);
  },
  sandPillar(g, px, py, n, x, y, map) {
    g.drawImage(this.groundCh6(map, n), px, py);
    g.drawImage(this.pillarImg(n(0, -1) === 'Ì', n(0, 1) === 'Ì'), px, py);
  },
  brokenPillar(g, px, py, n, x, y, map, hash) {
    g.drawImage(this.groundCh6(map, n), px, py);
    g.drawImage(this.brokenPillarImg(hash % 2), px, py);
  },
  ruinWall(g, px, py, n, x, y, map, hash) {
    g.drawImage(this.groundCh6(map, n), px, py);
    const w = (c) => c === 'Î';
    g.drawImage(this.ruinWallImg(w(n(0, -1)), w(n(-1, 0)), w(n(1, 0)), hash % 3), px, py);
  },
  sandPaving(g, px, py, n, x, y, map, hash) { g.drawImage(this.sandPavingImg(hash % 4 === 0 ? 1 : 0), px, py); },
  palm(g, px, py, n, x, y, map) {
    g.drawImage(this.groundCh6(map, n), px, py);
    g.drawImage(this.palmImg(), px, py);
  },
  rubble(g, px, py, n, x, y, map, hash) {
    if (map.def.outdoor) g.drawImage(this.groundCh6(map, n), px, py);
    else this.drawFloor(g, px, py, map);
    g.drawImage(this.rubbleImg(hash % 2), px, py);
  },
  digFloor(g, px, py, n, x, y, map, hash) { g.drawImage(this.digFloorImg(hash % 29 === 0 ? 1 : hash % 13 === 0 ? 2 : 0), px, py); },
  carvings(g, px, py, n, x, y) { g.drawImage(this.carvingsImg(x % 4), px, py); },
  sunVein(g, px, py, n, x, y, map, hash) {
    this.drawFloor(g, px, py, map);
    g.drawImage(this.sunVeinImg(hash % 3), px, py);
  },
  lantern(g, px, py, n, x, y, map) {
    this.drawFloor(g, px, py, map);
    g.drawImage(this.lanternImg(), px, py);
  },
});

Object.assign(Tiles, {
  // Ground under props in the desert: sand, unless it stands on paving.
  groundCh6(map, n) {
    const around = [n(0, 1), n(0, -1), n(-1, 0), n(1, 0)];
    if (around.filter((c) => c === 'Ô').length >= 2) return this.sandPavingImg(0);
    if (map.def.ground === 'À' || around.some((c) => c === 'À' || c === 'Ä')) return this.desertSandImg(0);
    if (!map.def.outdoor) return this.digFloorImg(0);
    return this.grassImg(0);
  },

  desertSandImg(v) {
    return this.memo(`dsand${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = SAND.base;
      g.fillRect(0, 0, 16, 16);
      const r = U.seeded(610 + v);
      for (let i = 0; i < 7; i++) {
        g.fillStyle = i % 2 ? SAND.mid : SAND.hi;
        g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 1, 1);
      }
      if (v === 1) {
        // Wind ripples.
        g.fillStyle = SAND.mid;
        g.fillRect(2, 5, 5, 1); g.fillRect(7, 4, 3, 1); g.fillRect(6, 11, 6, 1); g.fillRect(12, 10, 2, 1);
        g.fillStyle = SAND.hi;
        g.fillRect(2, 4, 5, 1); g.fillRect(6, 10, 6, 1);
      }
      if (v === 2) {
        g.fillStyle = SAND.lo;
        g.fillRect(10, 9, 3, 2);
        g.fillStyle = SAND.hi;
        g.fillRect(10, 9, 2, 1);
      }
      return c;
    });
  },

  dryGrassImg() {
    return this.memo('dryGrass', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.desertSandImg(0), 0, 0);
      const blade = (x, y, h, col) => {
        g.fillStyle = col;
        g.fillRect(x, y, 1, h);
      };
      for (const [bx, by] of [[1, 1], [9, 1], [5, 8], [12, 8]]) {
        g.fillStyle = '#7a5a24';
        g.fillRect(bx, by + 6, 5, 1);
        blade(bx, by + 2, 4, '#b08a38');
        blade(bx + 1, by, 6, '#d8b050');
        blade(bx + 2, by + 1, 5, '#c89c40');
        blade(bx + 3, by - 1, 7, '#e8c868');
        blade(bx + 4, by + 2, 4, '#a07c30');
      }
      return c;
    });
  },

  // Drawn over the lower half of anyone standing in dry grass.
  dryOverImg() {
    return this.memo('dryOver', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      for (const bx of [0, 5, 10]) {
        g.fillStyle = '#7a5a24';
        g.fillRect(bx, 15, 6, 1);
        g.fillStyle = '#b08a38'; g.fillRect(bx, 11, 1, 4);
        g.fillStyle = '#d8b050'; g.fillRect(bx + 1, 9, 1, 6);
        g.fillStyle = '#e8c868'; g.fillRect(bx + 3, 8, 1, 7);
        g.fillStyle = '#c89c40'; g.fillRect(bx + 2, 10, 1, 5);
        g.fillStyle = '#a07c30'; g.fillRect(bx + 4, 11, 1, 4);
      }
      return c;
    });
  },

  cactusImg(v) {
    return this.memo(`cactus${v}`, () => {
      const p = new Painter(16, 16);
      const skin = { fill: '#58a048', shade: '#3c7a34', hi: '#88c868', line: '#1c3a1c' };
      p.ellipse(8, 14.5, 6, 1.6, { fill: 'rgba(0,0,0,0.22)', line: false });
      if (v === 0) {
        p.rrect(5.5, 1, 5, 14, 2.5, skin);
        p.rrect(1.5, 5, 3.5, 6, 1.7, skin);
        p.rrect(11, 3, 3.5, 6, 1.7, skin);
        p.rect(3, 9, 3, 2, skin);
        p.rect(10, 7, 2, 2, skin);
        p.set(8, 0, '#f080a0'); p.set(7, 0, '#f8c0d0');
      } else {
        p.ellipse(8, 10, 5, 5, skin);
        p.ellipse(8, 5, 3.4, 3.4, skin);
        p.set(8, 2, '#f8e060'); p.set(7, 2, '#f8f0a0');
      }
      const c = p.toCanvas();
      const g = c.getContext('2d');
      g.fillStyle = '#e8f0c8';
      for (const [x, y] of [[7, 4], [9, 7], [7, 10], [9, 12], [3, 7], [12, 5]]) g.fillRect(x, y, 1, 1);
      return c;
    });
  },

  // Dunes: rounded mounds that join up with their neighbours.
  duneImg(up, down, v) {
    return this.memo(`dune${up ? 1 : 0}${down ? 1 : 0}${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = SAND.mid;
      g.fillRect(0, 0, 16, 16);
      // Sunlit slope on the left, shade on the right.
      g.fillStyle = SAND.hi;
      for (let y = 0; y < 16; y++) g.fillRect(0, y, 6 + Math.round(Math.sin((y + v * 3) / 3) * 2), 1);
      g.fillStyle = SAND.lo;
      for (let y = 0; y < 16; y++) g.fillRect(11 + Math.round(Math.sin((y + v * 5) / 4) * 1.5), y, 5, 1);
      // Crest line.
      g.fillStyle = '#fbe8c0';
      for (let y = 0; y < 16; y++) g.fillRect(6 + Math.round(Math.sin((y + v * 3) / 3) * 2), y, 1, 1);
      if (!up) {
        g.fillStyle = SAND.base;
        g.fillRect(0, 0, 16, 2);
        g.fillStyle = '#fbe8c0';
        g.fillRect(2, 2, 12, 1);
      }
      if (!down) {
        g.fillStyle = SAND.dk;
        g.fillRect(0, 13, 16, 1);
        g.fillStyle = SAND.lo;
        g.fillRect(0, 14, 16, 2);
      }
      return c;
    });
  },

  pillarImg(up, down) {
    return this.memo(`pillar6${up ? 1 : 0}${down ? 1 : 0}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      const s = SANDSTONE;
      // Fluted shaft.
      g.fillStyle = s.line;
      g.fillRect(3, 0, 10, 16);
      g.fillStyle = s.base;
      g.fillRect(4, 0, 8, 16);
      g.fillStyle = s.hi;
      g.fillRect(5, 0, 2, 16);
      g.fillStyle = s.lo;
      g.fillRect(9, 0, 1, 16);
      g.fillRect(11, 0, 1, 16);
      if (!up) {
        // Capital.
        g.fillStyle = s.line;
        g.fillRect(1, 0, 14, 4);
        g.fillStyle = s.hi;
        g.fillRect(2, 0, 12, 1);
        g.fillStyle = s.base;
        g.fillRect(2, 1, 12, 2);
      }
      if (!down) {
        // Base and shadow.
        g.fillStyle = 'rgba(0,0,0,0.22)';
        g.fillRect(2, 15, 13, 1);
        g.fillStyle = s.line;
        g.fillRect(2, 11, 12, 4);
        g.fillStyle = s.lo;
        g.fillRect(3, 12, 10, 2);
        g.fillStyle = s.hi;
        g.fillRect(3, 12, 10, 1);
      }
      return c;
    });
  },

  brokenPillarImg(v) {
    return this.memo(`bpillar${v}`, () => {
      const p = new Painter(16, 16);
      p.ellipse(8, 14, 7, 2, { fill: 'rgba(0,0,0,0.22)', line: false });
      const st = { fill: SANDSTONE.base, shade: SANDSTONE.lo, hi: SANDSTONE.hi, line: SANDSTONE.line };
      if (v === 0) {
        p.rect(3, 6, 10, 8, st);
        p.poly([[3, 6], [6, 3], [9, 5], [12, 2], [13, 6]], st);
      } else {
        // A toppled drum lying on its side.
        p.rrect(1, 7, 14, 7, 2, st);
        p.ellipse(13, 10.5, 2, 3.4, { fill: SANDSTONE.lo, line: SANDSTONE.line });
      }
      return p.toCanvas();
    });
  },

  ruinWallImg(up, left, right, v) {
    return this.memo(`rwall${up ? 1 : 0}${left ? 1 : 0}${right ? 1 : 0}${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      const s = SANDSTONE;
      g.fillStyle = s.base;
      g.fillRect(0, 0, 16, 16);
      // Blocks.
      g.fillStyle = s.lo;
      for (let y = 4; y < 16; y += 5) g.fillRect(0, y, 16, 1);
      g.fillRect(v * 3 + 3, 0, 1, 4); g.fillRect(10 - v, 5, 1, 4); g.fillRect(5 + v, 10, 1, 5);
      g.fillStyle = s.hi;
      g.fillRect(0, 0, 16, 1);
      if (!up) {
        // A crumbled top edge.
        g.fillStyle = s.line;
        g.fillRect(0, 0, 16, 1);
        g.clearRect(v * 4 + 2, 0, 3, 1);
        g.fillStyle = s.hi;
        g.fillRect(0, 1, 16, 1);
      }
      g.fillStyle = s.dk;
      g.fillRect(0, 15, 16, 1);
      g.fillStyle = s.line;
      if (!left) g.fillRect(0, 0, 1, 16);
      if (!right) g.fillRect(15, 0, 1, 16);
      return c;
    });
  },

  sandPavingImg(v) {
    return this.memo(`spave${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#dcc094';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#b89a68';
      g.fillRect(0, 7, 16, 1);
      g.fillRect(0, 15, 16, 1);
      g.fillRect(7, 0, 1, 7);
      g.fillRect(15, 8, 1, 7);
      g.fillStyle = '#ecd4ac';
      g.fillRect(0, 0, 7, 1); g.fillRect(8, 8, 7, 1);
      if (v === 1) {
        g.fillStyle = '#a88a58';
        g.fillRect(3, 3, 3, 1); g.fillRect(10, 11, 1, 3);
      }
      return c;
    });
  },

  palmImg() {
    return this.memo('palm', () => {
      const p = new Painter(16, 16);
      p.ellipse(8, 14.5, 5, 1.4, { fill: 'rgba(0,0,0,0.22)', line: false });
      p.poly([[7, 15], [9, 15], [10, 7], [8, 6]], { fill: '#a07038', shade: '#7a5028', hi: '#c89058', line: '#3a2410' });
      const leaf = { fill: '#58a848', shade: '#3a7a34', hi: '#88d060', line: '#1c3a1c' };
      p.poly([[8, 5], [1, 7], [3, 4], [7, 3]], leaf);
      p.poly([[8, 5], [15, 7], [13, 4], [9, 3]], leaf);
      p.poly([[8, 4], [4, 0], [8, 1], [10, 3]], leaf);
      p.poly([[9, 4], [13, 1], [12, 3], [10, 5]], leaf);
      p.ellipse(8.5, 5, 1.6, 1.3, { fill: '#8a5a30', line: '#3a2410' });
      return p.toCanvas();
    });
  },

  rubbleImg(v) {
    return this.memo(`rubble${v}`, () => {
      const p = new Painter(16, 16);
      p.ellipse(8, 14, 7.5, 2, { fill: 'rgba(0,0,0,0.25)', line: false });
      const st = { fill: '#b89468', shade: '#8a6a44', hi: '#dcc094', line: '#3a2a18' };
      const rocks = v ? [[4, 10, 4, 3.5], [11, 11, 4, 3], [8, 6, 4.5, 4], [12, 5, 2.5, 2.2]] : [[5, 11, 4.5, 3.2], [11, 10, 4, 4], [7, 5, 4, 3.6], [3, 5, 2.4, 2]];
      for (const [x, y, rx, ry] of rocks) p.ellipse(x, y, rx, ry, st);
      return p.toCanvas();
    });
  },

  digFloorImg(v) {
    return this.memo(`digfloor${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#c8a878';
      g.fillRect(0, 0, 16, 16);
      const r = U.seeded(720 + v);
      for (let i = 0; i < 10; i++) {
        g.fillStyle = ['#b89868', '#d8bc8c', '#a88a5c'][i % 3];
        g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), i % 4 === 0 ? 2 : 1, 1);
      }
      if (v === 1) {
        // Survey string between two pegs.
        g.fillStyle = '#f0e8d8';
        g.fillRect(1, 8, 14, 1);
        g.fillStyle = '#6a4a28';
        g.fillRect(1, 7, 1, 3); g.fillRect(14, 7, 1, 3);
      }
      if (v === 2) {
        g.fillStyle = '#9a7c50';
        g.fillRect(5, 9, 4, 3);
        g.fillStyle = '#dcc094';
        g.fillRect(5, 9, 3, 1);
      }
      return c;
    });
  },

  // The FIRST SCORE: staves of an ancient song carved into the wall.
  carvingsImg(v) {
    return this.memo(`carvings${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.wallImg('ruins'), 0, 0);
      g.fillStyle = '#a07e4c';
      g.fillRect(0, 1, 16, 10);
      g.fillStyle = '#6a5030';
      for (let y = 2; y < 11; y += 2) g.fillRect(0, y, 16, 1);
      // Notes carved on the staff, a few picked out in gold.
      const notes = [[[2, 6], [7, 3], [12, 8]], [[1, 4], [5, 8], [10, 5], [14, 3]], [[3, 9], [8, 5], [13, 7]], [[2, 3], [6, 7], [11, 4]]][v];
      notes.forEach(([x, y], i) => {
        g.fillStyle = '#3a2814';
        g.fillRect(x, y, 2, 2);
        g.fillRect(x + 1, y - 3, 1, 3);
        g.fillStyle = i === 1 ? '#f8d060' : '#c8a060';
        g.fillRect(x, y, 1, 1);
      });
      return c;
    });
  },

  // Golden crystal roots of the DUNESTONE, pushing up through the floor.
  sunVeinImg(v) {
    return this.memo(`sunvein${v}`, () => {
      const p = new Painter(16, 16);
      const gold = { fill: '#f0b840', shade: '#c08020', hi: '#fff0a0', line: '#5a3a10' };
      const shards = [[[3, 15], [5, 4], [8, 15]], [[7, 15], [10, 1], [13, 15]], [[1, 15], [2, 9], [4, 15]]];
      shards.forEach((s, i) => { if (i !== v) p.poly(s, gold); });
      p.poly([[9, 15], [12, 7], [15, 15]], gold);
      return p.toCanvas();
    });
  },

  lanternImg() {
    return this.memo('lantern6', () => Pix.fromRows([
      '................',
      '.......oo.......',
      '......oyyo......',
      '.....oywwyo.....',
      '.....oywwyo.....',
      '.....oyyyyo.....',
      '......oooo......',
      '.......bb.......',
      '.......bb.......',
      '.......bb.......',
      '.......bb.......',
      '.......bb.......',
      '.......bb.......',
      '.....bbbbbb.....',
      '....oooooooo....',
      '................',
    ], { o: '#3a2410', y: '#f8b830', w: '#fff4b0', b: '#6a4a28' }));
  },

  // ------------------------------------------------------------ buildings
  sunSpireImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const p = new Painter(W, H);
    const st = { fill: SANDSTONE.base, shade: SANDSTONE.lo, hi: SANDSTONE.hi, line: SANDSTONE.line };
    p.ellipse(W / 2, H - 3, 22, 4, { fill: 'rgba(0,0,0,0.25)', line: false });
    // Stepped base.
    p.rect(1, H - 16, W - 3, 14, st);
    p.rect(5, H - 26, W - 11, 11, st);
    // Tall tapering spire.
    p.poly([[10, H - 26], [W - 11, H - 26], [W - 16, 16], [W / 2, 6], [16, 16]], st);
    // Sun disc cradle near the top, holding the DUNESTONE.
    p.ellipse(W / 2, 12, 9, 8, { fill: '#c89048', shade: '#a06c30', hi: '#e8b870', line: SANDSTONE.line });
    p.poly([[W / 2 - 4, 7], [W / 2 + 4, 7], [W / 2 + 3, 17], [W / 2 - 3, 17]], { fill: '#f0b030', shade: '#c88010', hi: '#fff0a0', line: '#4a2c08' });
    const c = p.toCanvas();
    const g = c.getContext('2d');
    // Carved glyph bands.
    g.fillStyle = SANDSTONE.dk;
    for (const y of [36, 52, 68]) {
      const half = Math.round(8 + (y - 20) * 0.08);
      g.fillRect(W / 2 - half, y, half * 2, 1);
      for (let x = W / 2 - half + 2; x < W / 2 + half - 2; x += 4) g.fillRect(x, y + 2, 2, 3);
    }
    // Glints of light from the stone.
    g.fillStyle = '#fff4c0';
    g.fillRect(W / 2 - 1, 9, 1, 3);
    g.fillStyle = 'rgba(255,220,120,0.5)';
    g.fillRect(W / 2 - 12, 11, 4, 1); g.fillRect(W / 2 + 9, 11, 4, 1); g.fillRect(W / 2, 0, 1, 3);
    // A sealed door at the foot.
    g.fillStyle = SANDSTONE.line;
    g.fillRect(W / 2 - 5, H - 14, 10, 12);
    g.fillStyle = '#6a5030';
    g.fillRect(W / 2 - 4, H - 13, 8, 11);
    g.fillStyle = '#f0b030';
    g.fillRect(W / 2 - 1, H - 10, 2, 2);
    return c;
  },

  sandGymImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    const s = SANDSTONE;
    // Stepped roof.
    for (let i = 0; i < 3; i++) {
      g.fillStyle = s.line;
      g.fillRect(6 + i * 8, 4 + i * 7, W - 12 - i * 16, 8);
      g.fillStyle = i % 2 ? s.lo : s.base;
      g.fillRect(7 + i * 8, 5 + i * 7, W - 14 - i * 16, 6);
      g.fillStyle = s.hi;
      g.fillRect(7 + i * 8, 5 + i * 7, W - 14 - i * 16, 1);
    }
    // Main hall.
    g.fillStyle = s.line;
    g.fillRect(2, 24, W - 4, H - 24);
    g.fillStyle = s.base;
    g.fillRect(3, 25, W - 6, H - 26);
    g.fillStyle = s.lo;
    for (let y = 32; y < H; y += 8) g.fillRect(3, y, W - 6, 1);
    // Columns across the front.
    for (const x of [8, 26, 78, 96]) {
      g.fillStyle = s.line;
      g.fillRect(x, 28, 10, H - 29);
      g.fillStyle = s.hi;
      g.fillRect(x + 1, 28, 8, H - 30);
      g.fillStyle = s.lo;
      g.fillRect(x + 6, 28, 2, H - 30);
      g.fillStyle = s.dk;
      g.fillRect(x - 1, 27, 12, 3);
    }
    // Sun emblem above the door.
    const p = new Painter(24, 24);
    p.ellipse(12, 12, 7, 7, { fill: '#f0b030', shade: '#c88010', hi: '#fff0a0', line: '#4a2c08' });
    const em = p.toCanvas();
    g.fillStyle = '#f0b030';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.fillRect(Math.round(W / 2 + Math.cos(a) * 10) - 1, Math.round(33 + Math.sin(a) * 10) - 1, 2, 2);
    }
    g.drawImage(em, W / 2 - 12, 21);
    // Doorway.
    g.fillStyle = s.line;
    g.fillRect(W / 2 - 8, H - 26, 16, 26);
    g.fillStyle = '#3a2814';
    g.fillRect(W / 2 - 7, H - 25, 14, 25);
    g.fillStyle = '#5a4024';
    g.fillRect(W / 2 - 7, H - 25, 14, 3);
    return c;
  },

  digMouthImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    const s = SANDSTONE;
    g.fillStyle = s.base;
    g.fillRect(0, 0, W, H);
    g.fillStyle = s.lo;
    for (let y = 5; y < H; y += 7) g.fillRect(0, y, W, 1);
    g.fillStyle = s.hi;
    g.fillRect(0, 0, W, 1);
    // Dark shaft.
    g.fillStyle = '#1a1208';
    g.fillRect(12, 14, W - 24, H - 14);
    g.fillStyle = '#3a2814';
    g.fillRect(12, 14, W - 24, 2);
    // Timber frame.
    g.fillStyle = '#3a2410';
    g.fillRect(9, 10, 5, H - 10); g.fillRect(W - 14, 10, 5, H - 10); g.fillRect(7, 9, W - 14, 5);
    g.fillStyle = '#8a5a30';
    g.fillRect(10, 11, 3, H - 11); g.fillRect(W - 13, 11, 3, H - 11); g.fillRect(8, 10, W - 16, 3);
    // Hanging lanterns.
    for (const x of [4, W - 6]) {
      g.fillStyle = '#3a2410';
      g.fillRect(x, 12, 3, 5);
      g.fillStyle = '#f8c040';
      g.fillRect(x + 1, 13, 1, 3);
    }
    // Warning sign in TEAM DISTORTION violet.
    g.fillStyle = '#281840';
    g.fillRect(W / 2 - 5, 1, 10, 7);
    g.fillStyle = '#a060e8';
    g.fillRect(W / 2 - 4, 2, 8, 5);
    g.fillStyle = '#f0e0ff';
    g.fillRect(W / 2 - 3, 4, 2, 1); g.fillRect(W / 2 - 1, 3, 2, 1); g.fillRect(W / 2 + 1, 4, 2, 1);
    return c;
  },

  stallImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    // Posts.
    g.fillStyle = '#5a3a1c';
    g.fillRect(2, 8, 2, H - 8); g.fillRect(W - 4, 8, 2, H - 8);
    // Striped awning.
    g.fillStyle = '#3a2410';
    g.fillRect(0, 2, W, 9);
    for (let x = 1; x < W - 1; x += 1) {
      g.fillStyle = Math.floor(x / 6) % 2 ? '#e05838' : '#f8ecd0';
      g.fillRect(x, 3, 1, 6);
    }
    for (let x = 1; x < W - 1; x += 6) {
      g.fillStyle = Math.floor(x / 6) % 2 ? '#e05838' : '#f8ecd0';
      g.fillRect(x, 9, 5, 1);
    }
    // Counter with pots and fruit.
    g.fillStyle = '#3a2410';
    g.fillRect(1, H - 11, W - 2, 10);
    g.fillStyle = '#b07840';
    g.fillRect(2, H - 10, W - 4, 8);
    g.fillStyle = '#d09858';
    g.fillRect(2, H - 10, W - 4, 1);
    for (const [x, col] of [[6, '#c86030'], [14, '#e8b040'], [24, '#6a9a40'], [34, '#c86030'], [40, '#e8d8a0']]) {
      g.fillStyle = '#3a2410';
      g.fillRect(x - 1, H - 15, 6, 5);
      g.fillStyle = col;
      g.fillRect(x, H - 14, 4, 4);
    }
    return c;
  },
});

// Props: rubble that can be cleared from a collapsed passage.
Object.assign(Props, {
  rubble() {
    const c = Pix.canvas(16, 16);
    c.getContext('2d').drawImage(Tiles.rubbleImg(0), 0, 0);
    return c;
  },
});

// Desert ground: roads, signs, rocks and ledges sit on sand.
{
  const baseStatic = Tiles.drawStatic;
  Tiles.drawStatic = function drawStatic(g, ch, px, py, n, x, y, map) {
    if (map.def.ground !== 'À') {
      baseStatic.call(this, g, ch, px, py, n, x, y, map);
      return;
    }
    const d = this.def(ch);
    const hash = ((x * 73856093) ^ (y * 19349663)) >>> 0;
    const onSand = { rock: 'rockImg', bush: 'desertShrubImg', boulder: 'boulderImg', lamp: 'lampImg', sign: 'signImg', crates: 'crateImg', barrels: 'barrelsImg' };
    if (onSand[d.name]) {
      g.drawImage(this.groundCh6(map, n), px, py);
      g.drawImage(this[onSand[d.name]](), px, py);
      return;
    }
    if (d.name === 'building' || d.name === 'grass' || d.name === 'flowers') {
      g.drawImage(this.desertSandImg(hash % 5 === 0 ? 1 : 0), px, py);
      return;
    }
    if (d.name === 'path') {
      g.drawImage(this.packedSandImg(hash % 2), px, py);
      const road = (c) => c === ':' || c === '#' || c === 'S' || c === 'B';
      g.fillStyle = SAND.lo;
      if (!road(n(0, -1))) g.fillRect(px, py, 16, 1);
      if (!road(n(0, 1))) g.fillRect(px, py + 15, 16, 1);
      if (!road(n(-1, 0))) g.fillRect(px, py, 1, 16);
      if (!road(n(1, 0))) g.fillRect(px + 15, py, 1, 16);
      return;
    }
    if (d.name === 'ledge') {
      g.drawImage(this.desertSandImg(0), px, py);
      g.drawImage(this.sandLedgeImg(), px, py);
      return;
    }
    baseStatic.call(this, g, ch, px, py, n, x, y, map);
  };

  Object.assign(Tiles, {
    packedSandImg(v) {
      return this.memo(`psand${v}`, () => {
        const c = Pix.canvas(16, 16);
        const g = c.getContext('2d');
        g.fillStyle = '#d4b07a';
        g.fillRect(0, 0, 16, 16);
        const r = U.seeded(650 + v);
        for (let i = 0; i < 8; i++) {
          g.fillStyle = i % 2 ? '#c49c64' : '#e0c090';
          g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 2, 1);
        }
        return c;
      });
    },

    sandLedgeImg() {
      return this.memo('sandLedge', () => {
        const c = Pix.canvas(16, 16);
        const g = c.getContext('2d');
        g.fillStyle = SAND.lo;
        g.fillRect(0, 8, 16, 5);
        g.fillStyle = SAND.dk;
        g.fillRect(0, 12, 16, 2);
        g.fillStyle = SAND.hi;
        g.fillRect(0, 7, 16, 1);
        g.fillStyle = SAND.line;
        g.fillRect(0, 13, 16, 1);
        return c;
      });
    },

    desertShrubImg() {
      return this.memo('dshrub', () => {
        const p = new Painter(16, 16);
        p.ellipse(8, 14, 6, 1.6, { fill: 'rgba(0,0,0,0.2)', line: false });
        p.ellipse(8, 10, 6.5, 4.5, { fill: '#a08840', shade: '#7a6428', hi: '#c8b060', line: '#3a3014' });
        p.ellipse(5, 8, 3, 2.6, { fill: '#b09a48', shade: '#8a7430', hi: '#d0bc70', line: '#3a3014' });
        return p.toCanvas();
      });
    },
  });
}
