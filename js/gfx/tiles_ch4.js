'use strict';
// Tiles, buildings and props for chapter 5: ROUTE 8, SILVERFALL CITY and
// the SONANCE TOWER (TEAM DISTORTION's headquarters), SILVERFALL BRIDGE,
// and the quarry town of CRAGMOOR with the ROCK-type GYM.

Object.assign(TILE_DEFS, {
  // outdoors
  'N': { name: 'asphalt' },
  's': { name: 'gravel' },
  '!': { name: 'falls', solid: true, water: true, noFish: true, animFn: 'fallsAnim' },
  '&': { name: 'barrier', solid: true },
  ')': { name: 'cone', solid: true },
  '/': { name: 'rails' },
  '|': { name: 'deck' },
  // indoors
  'Á': { name: 'office' },
  'É': { name: 'pad', animFn: 'padAnim' },
  'Í': { name: 'server', solid: true },
  'Ó': { name: 'deskPC', solid: true },
  'Ú': { name: 'partition', solid: true },
  'Ç': { name: 'sofa', solid: true },
  'Ö': { name: 'quarryFloor' },
});

Object.assign(BUILDINGS, {
  sonance: { w: 7, h: 8, door: 3, draw: 'sonanceImg' },
  factory: { w: 6, h: 5, draw: 'factoryImg' },
  warehouse: { w: 5, h: 4, draw: 'warehouseImg' },
  crane: { w: 3, h: 6, draw: 'craneImg' },
  rockGym: { w: 7, h: 6, door: 3, draw: 'rockGymImg' },
  houseMine: { w: 4, h: 4, roof: '#6a5a4a', wall: '#d0c0a4', door: 1, windows: [2.5] },
  houseMine2: { w: 5, h: 4, roof: '#8a4a38', wall: '#dccab0', door: 3, windows: [0.5, 1.5] },
  houseCity: { w: 5, h: 4, roof: '#50607a', wall: '#e8e4dc', door: 2, windows: [0.5, 3.5] },
  houseCity2: { w: 4, h: 4, roof: '#7a5a78', wall: '#ece6dc', door: 1, windows: [2.5] },
  elevator: { w: 2, h: 2, draw: 'elevatorImg' },
  vaultDoor: { w: 2, h: 2, draw: 'vaultDoorImg' },
  bigScreen: { w: 4, h: 2, draw: 'bigScreenImg' },
  tankRift: { w: 1, h: 2, draw: 'songTankImg', color: '#b070f8' },
  tankRoot: { w: 1, h: 2, draw: 'songTankImg', color: '#70d060' },
  tankTide: { w: 1, h: 2, draw: 'songTankImg', color: '#58b8f8' },
  tankEmpty: { w: 1, h: 2, draw: 'songTankImg' },
  cragstone: { w: 3, h: 3, draw: 'cragstoneImg' },
});

Object.assign(WALL_THEMES, {
  office: { wall: '#d8dce4', lo: '#c4c8d2', dk: '#7c8290', rim: '#4a5060', hi: '#eef0f4', base: '#5a6072', baseDk: '#343846' },
  archive: { wall: '#34304a', lo: '#2c283e', dk: '#161422', rim: '#a060e8', hi: '#4c4668', base: '#221e32', baseDk: '#100e18' },
  quarry: { wall: '#8a7458', lo: '#7a6448', dk: '#4a3a28', rim: '#34281a', hi: '#a48c6c', base: '#5c4a34', baseDk: '#34281a' },
});

Object.assign(Tiles.floors, {
  'Á'() { return this.officeFloorImg(); },
  'Ö'() { return this.quarryFloorImg(); },
});

Object.assign(Tiles.extra, {
  asphalt(g, px, py, n, x, y, map, hash) { g.drawImage(this.asphaltImg(hash % 9 === 0 ? 1 : 0), px, py); },
  gravel(g, px, py, n, x, y, map, hash) { g.drawImage(this.gravelImg(hash % 3), px, py); },
  falls() {},   // animated
  barrier(g, px, py, n, x, y, map) {
    g.drawImage(this.groundCh4(map, n), px, py);
    g.drawImage(this.barrierImg(), px, py);
  },
  cone(g, px, py, n, x, y, map) {
    g.drawImage(this.groundCh4(map, n), px, py);
    g.drawImage(this.coneImg(), px, py);
  },
  rails(g, px, py, n) {
    const horiz = n(-1, 0) === '/' || n(1, 0) === '/';
    g.drawImage(this.gravelImg(0), px, py);
    g.drawImage(this.railsImg(horiz), px, py);
  },
  deck(g, px, py, n) {
    g.drawImage(this.deckImg(), px, py);
    const wet = (c) => TILE_DEFS[c] && TILE_DEFS[c].water;
    // Railings along the edges that face the water.
    for (const [dx, x0] of [[-1, 0], [1, 13]]) {
      if (!wet(n(dx, 0))) continue;
      g.fillStyle = '#2a3040';
      g.fillRect(px + x0, py, 3, 16);
      g.fillStyle = '#8890a8';
      g.fillRect(px + x0 + 1, py, 1, 16);
      g.fillStyle = '#c8d0e0';
      g.fillRect(px + x0 + 1, py + 2, 1, 2);
      g.fillRect(px + x0 + 1, py + 10, 1, 2);
    }
  },
  office(g, px, py) { g.drawImage(this.officeFloorImg(), px, py); },
  pad(g, px, py) { g.drawImage(this.officeFloorImg(), px, py); },
  server(g, px, py, n, x, y, map, hash) {
    this.drawFloor(g, px, py, map);
    g.drawImage(this.serverImg(hash % 2), px, py);
  },
  deskPC(g, px, py, n, x, y, map, hash) {
    this.drawFloor(g, px, py, map);
    g.drawImage(this.deskPCImg(hash % 2), px, py);
  },
  partition(g, px, py, n, x, y, map) {
    this.drawFloor(g, px, py, map);
    const part = (c) => c === 'Ú';
    g.drawImage(this.partitionImg(part(n(-1, 0)), part(n(1, 0)), part(n(0, 1))), px, py);
  },
  sofa(g, px, py, n, x, y, map) {
    this.drawFloor(g, px, py, map);
    g.drawImage(this.sofaImg(n(-1, 0) === 'Ç', n(1, 0) === 'Ç'), px, py);
  },
  quarryFloor(g, px, py, n, x, y, map, hash) { g.drawImage(this.quarryFloorImg(hash % 3), px, py); },
});

// Animated tiles beyond water and flowers: waterfalls and warp pads.
{
  const baseRender = Tiles.renderMap;
  Tiles.renderMap = function renderMap(map) {
    const r = baseRender.call(this, map);
    const at = (x, y) => map.worldTileAt(x, y);
    for (const a of r.anims) {
      if (a.ch === '!') {
        a.top = at(a.x, a.y - 1) !== '!';
        a.bottom = at(a.x, a.y + 1) !== '!';
      }
    }
    for (let y = 0; y < map.h; y++) {
      for (let x = 0; x < map.w; x++) {
        const ch = at(x, y);
        if (ch === 'É') r.anims.push({ x, y, ch });
      }
    }
    return r;
  };
  const baseAnim = Tiles.drawAnim;
  Tiles.drawAnim = function drawAnim(g, a, sx, sy, frame) {
    const d = TILE_DEFS[a.ch];
    if (d && d.animFn) {
      this[d.animFn](g, a, sx, sy, frame);
      return;
    }
    baseAnim.call(this, g, a, sx, sy, frame);
  };
}

Object.assign(Tiles, {
  // Ground under props in the new areas.
  groundCh4(map, n) {
    const around = [n(0, 1), n(0, -1), n(-1, 0), n(1, 0)];
    if (around.some((c) => c === 'N')) return this.asphaltImg(0);
    if (around.some((c) => c === 's' || c === '/')) return this.gravelImg(0);
    if (around.some((c) => c === '+')) return this.pavingImg();
    if (around.some((c) => c === '|')) return this.deckImg();
    return this.grassImg(0);
  },

  asphaltImg(v) {
    return this.memo(`asphalt${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#5c5c68';
      g.fillRect(0, 0, 16, 16);
      const r = U.seeded(410 + v);
      for (let i = 0; i < 10; i++) {
        g.fillStyle = i % 2 ? '#52525e' : '#686874';
        g.fillRect(Math.floor(r() * 16), Math.floor(r() * 16), 1, 1);
      }
      if (v === 1) {
        g.fillStyle = '#48485a';
        g.fillRect(3, 6, 4, 1); g.fillRect(7, 7, 3, 1); g.fillRect(10, 8, 2, 1);
      }
      return c;
    });
  },

  gravelImg(v) {
    return this.memo(`gravel${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#c4b08e';
      g.fillRect(0, 0, 16, 16);
      const r = U.seeded(520 + v);
      for (let i = 0; i < 14; i++) {
        g.fillStyle = ['#a8946e', '#dccaa8', '#8e7a58', '#b8a47e'][i % 4];
        const x = Math.floor(r() * 15);
        const y = Math.floor(r() * 15);
        g.fillRect(x, y, i % 3 === 0 ? 2 : 1, 1);
      }
      if (v === 2) {
        g.fillStyle = '#7c6a4c';
        g.fillRect(9, 10, 3, 2);
        g.fillStyle = '#e4d4b4';
        g.fillRect(9, 10, 2, 1);
      }
      return c;
    });
  },

  fallsAnim(g, a, sx, sy, frame) {
    const f = Math.floor(frame / 5) % 4;
    g.drawImage(this.fallsImg(f, a.top, a.bottom), sx, sy);
  },

  fallsImg(f, top, bottom) {
    return this.memo(`falls${f}${top ? 1 : 0}${bottom ? 1 : 0}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#4c90d8';
      g.fillRect(0, 0, 16, 16);
      // Streaks sliding down.
      const cols = [[1, '#8cc8f8'], [4, '#dcf4ff'], [6, '#3c78c0'], [9, '#8cc8f8'], [12, '#dcf4ff'], [14, '#3c78c0']];
      for (const [x, col] of cols) {
        g.fillStyle = col;
        for (let y = -8; y < 16; y += 8) {
          const yy = y + ((f * 4 + x * 3) % 8);
          g.fillRect(x, yy, 1, 5);
        }
      }
      if (top) {
        g.fillStyle = '#e8f8ff';
        g.fillRect(0, 0, 16, 2);
        g.fillStyle = '#a8dcf8';
        g.fillRect(0, 2, 16, 1);
      }
      if (bottom) {
        const foam = ['#ffffff', '#e0f4ff', '#b8e0f8'];
        for (let i = 0; i < 9; i++) {
          g.fillStyle = foam[(i + f) % 3];
          const x = (i * 5 + f * 3) % 15;
          g.fillRect(x, 10 + ((i * 3 + f) % 5), 3, 2);
        }
        g.fillStyle = '#ffffff';
        g.fillRect(0, 14, 16, 2);
      }
      return c;
    });
  },

  barrierImg() {
    return this.memo('barrier', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#303038';
      g.fillRect(2, 8, 2, 7);
      g.fillRect(12, 8, 2, 7);
      g.fillRect(0, 4, 16, 6);
      for (let x = 0; x < 16; x++) {
        g.fillStyle = Math.floor((x + 1) / 3) % 2 ? '#f07818' : '#f8f4ec';
        g.fillRect(x, 5, 1, 4);
      }
      g.fillStyle = '#f8c030';
      g.fillRect(7, 1, 2, 3);
      g.fillStyle = '#fff4a0';
      g.fillRect(7, 1, 1, 1);
      g.fillStyle = 'rgba(0,0,0,0.25)';
      g.fillRect(1, 15, 14, 1);
      return c;
    });
  },

  coneImg() {
    return this.memo('cone', () => Pix.fromRows([
      '................',
      '.......oo.......',
      '......oaao......',
      '......oaao......',
      '.....oaaaao.....',
      '.....owwwwo.....',
      '.....owwwwo.....',
      '....oaaaaaao....',
      '....oaaaaaao....',
      '...owwwwwwwwo...',
      '...oaaaaaaaao...',
      '..oaaaaaaaaaao..',
      '.oooooooooooooo.',
      '.odddddddddddo..',
      '.oooooooooooooo.',
      '................',
    ], { o: '#301808', a: '#f07818', w: '#f8f4ec', d: '#a84c10' }));
  },

  railsImg(horiz) {
    return this.memo(`rails${horiz ? 1 : 0}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      for (let i = 1; i < 16; i += 5) {
        g.fillStyle = '#6a4a2c';
        if (horiz) g.fillRect(i, 2, 3, 12);
        else g.fillRect(2, i, 12, 3);
      }
      g.fillStyle = '#484c58';
      if (horiz) { g.fillRect(0, 4, 16, 2); g.fillRect(0, 10, 16, 2); } else { g.fillRect(4, 0, 2, 16); g.fillRect(10, 0, 2, 16); }
      g.fillStyle = '#a8b0c0';
      if (horiz) { g.fillRect(0, 4, 16, 1); g.fillRect(0, 10, 16, 1); } else { g.fillRect(4, 0, 1, 16); g.fillRect(10, 0, 1, 16); }
      return c;
    });
  },

  deckImg() {
    return this.memo('deck', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#a8a8b4';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#94949e';
      g.fillRect(0, 7, 16, 1);
      g.fillRect(0, 15, 16, 1);
      g.fillStyle = '#bcbcc6';
      g.fillRect(0, 0, 16, 1);
      g.fillRect(0, 8, 16, 1);
      g.fillStyle = '#8a8a94';
      g.fillRect(5, 3, 1, 1); g.fillRect(11, 11, 1, 1);
      return c;
    });
  },

  officeFloorImg() {
    return this.memo('officeFloor', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#5c6a86';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#56637e';
      for (let i = 0; i < 16; i += 4) {
        g.fillRect(i, 0, 1, 16);
        g.fillRect(0, i, 16, 1);
      }
      g.fillStyle = '#66759a';
      g.fillRect(2, 2, 1, 1); g.fillRect(10, 6, 1, 1); g.fillRect(6, 13, 1, 1);
      return c;
    });
  },

  padAnim(g, a, sx, sy, frame) {
    g.drawImage(this.padImg(Math.floor(frame / 8) % 4), sx, sy);
  },

  padImg(f) {
    return this.memo(`pad${f}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.officeFloorImg(), 0, 0);
      const p = new Painter(16, 16);
      p.ellipse(8, 9, 7, 5.5, { fill: '#303444', shade: '#20222e', hi: '#5a6078', line: '#101218' });
      p.ellipse(8, 8.5, 5, 3.6, { fill: ['#8050d8', '#a068f0', '#c090ff', '#a068f0'][f], shade: '#6034b8', hi: '#f0e0ff', line: '#281848' });
      g.drawImage(p.toCanvas(), 0, 0);
      g.fillStyle = 'rgba(240,224,255,0.8)';
      g.fillRect(8 - f, 8, 1 + f * 2, 1);
      g.fillStyle = '#e8d8ff';
      for (let i = 0; i < 3; i++) g.fillRect(3 + i * 5, 7 - ((f + i) % 4), 1, 1);
      return c;
    });
  },

  serverImg(v) {
    return this.memo(`server${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#101218';
      g.fillRect(1, 0, 14, 16);
      g.fillStyle = '#2a2e3a';
      g.fillRect(2, 1, 12, 14);
      for (let y = 2; y < 14; y += 3) {
        g.fillStyle = '#1a1c26';
        g.fillRect(3, y, 10, 2);
        g.fillStyle = (y + v) % 2 ? '#60e0a0' : '#b070f8';
        g.fillRect(4, y, 1, 1);
        g.fillStyle = (y + v) % 3 ? '#f8d048' : '#60e0a0';
        g.fillRect(6, y, 1, 1);
        g.fillStyle = '#3c4050';
        g.fillRect(8, y + 1, 4, 1);
      }
      g.fillStyle = 'rgba(0,0,0,0.3)';
      g.fillRect(1, 15, 14, 1);
      return c;
    });
  },

  deskPCImg(v) {
    return this.memo(`deskPC${v}`, () => Pix.fromRows([
      '................',
      '...oooooooooo...',
      '...ommmmmmmmo...',
      '...omssssssmo...',
      '...omsbsbbsmo...',
      '...omssssssmo...',
      '...ommmmmmmmo...',
      '...oooommoooo...',
      'oooooooooooooooo',
      'owwwwwwwwwwwwwwo',
      'oWWWWWWWWWWWWWWo',
      'oddddddddddddddo',
      'odo..........odo',
      'odo..........odo',
      'ooo..........ooo',
      '................',
    ], { o: '#1c1c24', m: '#505868', s: v ? '#58a8e8' : '#78d0a8', b: '#e8f4ff', w: '#c8b8a0', W: '#a8987e', d: '#7a6a54' }));
  },

  partitionImg(left, right, below) {
    return this.memo(`part${left ? 1 : 0}${right ? 1 : 0}${below ? 1 : 0}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#9ec8e0';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#c8e4f4';
      g.fillRect(3, 2, 2, 8); g.fillRect(6, 2, 1, 5);
      g.fillStyle = '#5a6272';
      g.fillRect(0, 0, 16, 2);
      if (!left) g.fillRect(0, 0, 2, 16);
      if (!right) g.fillRect(14, 0, 2, 16);
      if (!below) {
        g.fillStyle = '#5a6272';
        g.fillRect(0, 12, 16, 4);
        g.fillStyle = '#3a404e';
        g.fillRect(0, 15, 16, 1);
      }
      g.fillStyle = '#8890a4';
      g.fillRect(0, 1, 16, 1);
      return c;
    });
  },

  sofaImg(l, r) {
    return this.memo(`sofa${l ? 1 : 0}${r ? 1 : 0}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#281830';
      g.fillRect(l ? 0 : 1, 3, 16 - (l ? 0 : 1) - (r ? 0 : 1), 12);
      g.fillStyle = '#7a4a90';
      g.fillRect(l ? 0 : 2, 4, 16 - (l ? 0 : 2) - (r ? 0 : 2), 5);
      g.fillStyle = '#9a68b0';
      g.fillRect(l ? 0 : 2, 9, 16 - (l ? 0 : 2) - (r ? 0 : 2), 4);
      g.fillStyle = '#b890d0';
      g.fillRect(l ? 0 : 2, 9, 16 - (l ? 0 : 2) - (r ? 0 : 2), 1);
      if (!l) { g.fillStyle = '#6a3a80'; g.fillRect(1, 6, 3, 8); }
      if (!r) { g.fillStyle = '#6a3a80'; g.fillRect(12, 6, 3, 8); }
      return c;
    });
  },

  quarryFloorImg(v = 0) {
    return this.memo(`quarryFloor${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#b09878';
      g.fillRect(0, 0, 16, 16);
      const r = U.seeded(610 + v);
      for (let i = 0; i < 12; i++) {
        g.fillStyle = ['#9c8464', '#c4ac8c', '#8a7254'][i % 3];
        g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 2, 1);
      }
      if (v === 1) {
        g.fillStyle = '#806a4c';
        g.fillRect(4, 9, 5, 1); g.fillRect(8, 10, 3, 1);
      }
      return c;
    });
  },

  // -- buildings ------------------------------------------------------------------
  // SONANCE ENERGY's glass tower: TEAM DISTORTION's headquarters in disguise.
  sonanceImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    const line = '#18202c';
    // Tower body, narrower at the top.
    g.fillStyle = line;
    g.fillRect(8, 2, W - 16, H - 2);
    g.fillRect(2, 30, W - 4, H - 30);
    // Glass curtain wall.
    for (let y = 3; y < H - 26; y += 6) {
      const inset = y < 30 ? 9 : 3;
      for (let x = inset; x < W - inset; x += 8) {
        g.fillStyle = (x + y) % 3 ? '#3c78ac' : '#4c8cc0';
        g.fillRect(x, y, 7, 5);
        g.fillStyle = '#78b4e0';
        g.fillRect(x, y, 7, 1);
        if ((x * 3 + y) % 5 === 0) {
          g.fillStyle = '#c8e8f8';
          g.fillRect(x + 1, y + 1, 2, 3);
        }
      }
    }
    // Diagonal sky reflection.
    g.fillStyle = 'rgba(220,240,255,0.25)';
    for (let i = 0; i < 40; i++) g.fillRect(20 + i, 8 + i * 2, 6, 2);
    // Pillars.
    g.fillStyle = '#5a6272';
    g.fillRect(2, 30, 3, H - 30);
    g.fillRect(W - 5, 30, 3, H - 30);
    g.fillStyle = '#8890a0';
    g.fillRect(3, 30, 1, H - 30);
    // Company band with the tuning-fork logo.
    g.fillStyle = line;
    g.fillRect(4, H - 44, W - 8, 13);
    g.fillStyle = '#f0f0f4';
    g.fillRect(5, H - 43, W - 10, 11);
    Font.drawRaw(g, 'SONANCE', W / 2 - 18, H - 41, '#403050');
    const lx = 14;
    g.fillStyle = '#a060e8';
    g.fillRect(lx - 3, H - 42, 2, 6); g.fillRect(lx + 1, H - 42, 2, 6); g.fillRect(lx - 3, H - 37, 6, 2); g.fillRect(lx - 1, H - 35, 2, 3);
    // Lobby: lit glass and double doors under an awning.
    g.fillStyle = line;
    g.fillRect(3, H - 30, W - 6, 29);
    g.fillStyle = '#9cc8e0';
    g.fillRect(4, H - 29, W - 8, 26);
    g.fillStyle = '#f8f0c8';
    for (let x = 6; x < W - 6; x += 10) g.fillRect(x, H - 26, 6, 10);
    g.fillStyle = '#5a6272';
    for (let x = 4; x < W - 4; x += 10) g.fillRect(x, H - 29, 1, 26);
    const dx = spec.door * 16 - 2;
    g.fillStyle = '#2a3040';
    g.fillRect(dx - 4, H - 33, 28, 4);
    g.fillStyle = '#a060e8';
    g.fillRect(dx - 4, H - 30, 28, 1);
    g.fillStyle = line;
    g.fillRect(dx - 1, H - 22, 22, 21);
    g.fillStyle = '#c8e8f4';
    g.fillRect(dx, H - 21, 9, 20);
    g.fillRect(dx + 11, H - 21, 9, 20);
    g.fillStyle = '#e8f8ff';
    g.fillRect(dx + 1, H - 20, 2, 12);
    g.fillRect(dx + 12, H - 20, 2, 12);
    g.fillStyle = '#707888';
    g.fillRect(0, H - 2, W, 2);
    // Antenna on the roof.
    g.fillStyle = line;
    g.fillRect(W / 2 - 1, 0, 2, 4);
    g.fillStyle = '#f04040';
    g.fillRect(W / 2 - 1, 0, 2, 1);
    return c;
  },

  factoryImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    const line = '#2a1a14';
    // Chimney with a puff of smoke.
    g.fillStyle = line;
    g.fillRect(W - 20, 0, 12, 40);
    g.fillStyle = '#9a4a38';
    g.fillRect(W - 19, 4, 10, 36);
    g.fillStyle = '#b86a50';
    g.fillRect(W - 19, 4, 3, 36);
    g.fillStyle = '#e8e0d8';
    g.fillRect(W - 19, 8, 10, 2);
    g.fillStyle = 'rgba(200,200,210,0.8)';
    g.fillRect(W - 24, 0, 8, 4);
    g.fillRect(W - 30, 1, 6, 3);
    // Sawtooth roof.
    for (let x = 2; x < W - 22; x++) {
      const t = (x - 2) % 16;
      const top = 18 + (t < 12 ? 12 - t : (t - 12) * 3) - 4;
      g.fillStyle = line;
      g.fillRect(x, top - 1, 1, 30 - top);
      g.fillStyle = t < 12 ? '#7a8290' : '#a8d0e8';
      g.fillRect(x, top, 1, 29 - top);
    }
    g.fillStyle = line;
    g.fillRect(2, 28, W - 4, H - 28);
    // Brick walls.
    g.fillStyle = '#a45440';
    g.fillRect(3, 29, W - 6, H - 31);
    g.fillStyle = '#8a4434';
    for (let y = 31; y < H - 2; y += 4) {
      g.fillRect(3, y, W - 6, 1);
      for (let x = 3 + ((y >> 2) % 2) * 4; x < W - 3; x += 8) g.fillRect(x, y - 3, 1, 3);
    }
    // Windows and a big rolling door.
    for (const x of [8, 24, 40]) {
      if (x > W - 30) break;
      g.fillStyle = line;
      g.fillRect(x - 1, 34, 10, 10);
      g.fillStyle = '#f8d888';
      g.fillRect(x, 35, 8, 8);
      g.fillStyle = line;
      g.fillRect(x + 4, 35, 1, 8);
    }
    g.fillStyle = line;
    g.fillRect(W - 30, H - 26, 24, 25);
    g.fillStyle = '#8890a0';
    g.fillRect(W - 29, H - 25, 22, 24);
    g.fillStyle = '#6a7282';
    for (let y = H - 23; y < H; y += 3) g.fillRect(W - 29, y, 22, 1);
    g.fillStyle = '#6a6e78';
    g.fillRect(0, H - 2, W, 2);
    return c;
  },

  warehouseImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    const line = '#1c2430';
    g.fillStyle = line;
    g.fillRect(1, 8, W - 2, H - 8);
    // Curved metal roof.
    for (let x = 1; x < W - 1; x++) {
      const k = (x - W / 2) / (W / 2);
      const top = 4 + Math.round(k * k * 8);
      g.fillStyle = line;
      g.fillRect(x, top, 1, 22 - top);
      g.fillStyle = x % 4 === 0 ? '#6a7a8e' : '#8494a8';
      g.fillRect(x, top + 1, 1, 20 - top);
    }
    // Corrugated walls.
    for (let x = 2; x < W - 2; x++) {
      g.fillStyle = x % 3 === 0 ? '#5a6a7e' : '#7a8a9e';
      g.fillRect(x, 22, 1, H - 24);
    }
    g.fillStyle = line;
    g.fillRect(W / 2 - 13, H - 30, 26, 29);
    g.fillStyle = '#a8a098';
    g.fillRect(W / 2 - 12, H - 29, 24, 28);
    g.fillStyle = '#8a8278';
    for (let y = H - 27; y < H - 1; y += 3) g.fillRect(W / 2 - 12, y, 24, 1);
    g.fillStyle = '#f0c030';
    g.fillRect(6, 26, 10, 6);
    Font.drawRaw(g, '3', 9, 26, '#302010');
    g.fillStyle = '#6a6e78';
    g.fillRect(0, H - 2, W, 2);
    return c;
  },

  // A yellow tower crane standing over the unfinished bridge.
  craneImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    const line = '#2a2010';
    const y0 = 10;
    // Mast.
    g.fillStyle = line;
    g.fillRect(W / 2 - 5, y0, 10, H - y0 - 4);
    g.fillStyle = '#f0c030';
    g.fillRect(W / 2 - 4, y0, 8, H - y0 - 4);
    g.fillStyle = line;
    for (let y = y0 + 4; y < H - 6; y += 8) {
      for (let i = 0; i < 8; i++) {
        g.fillRect(W / 2 - 4 + i, y + i, 1, 1);
        g.fillRect(W / 2 + 3 - i, y + i, 1, 1);
      }
    }
    // Jib reaching out over the water, with a hook.
    g.fillStyle = line;
    g.fillRect(0, y0 - 6, W, 6);
    g.fillStyle = '#f0c030';
    g.fillRect(1, y0 - 5, W - 2, 4);
    g.fillStyle = line;
    for (let x = 2; x < W - 2; x += 4) g.fillRect(x, y0 - 5, 1, 4);
    g.fillStyle = '#48505c';
    g.fillRect(W - 10, y0 - 10, 8, 5);
    g.fillStyle = line;
    g.fillRect(6, y0, 1, 22);
    g.fillRect(4, y0 + 22, 5, 2);
    g.fillRect(4, y0 + 24, 1, 3);
    // Cab and base.
    g.fillStyle = line;
    g.fillRect(W / 2 + 4, y0 + 2, 9, 8);
    g.fillStyle = '#88c0e8';
    g.fillRect(W / 2 + 5, y0 + 3, 7, 6);
    g.fillStyle = line;
    g.fillRect(W / 2 - 12, H - 6, 24, 6);
    g.fillStyle = '#7a8290';
    g.fillRect(W / 2 - 11, H - 5, 22, 4);
    return c;
  },

  // CRAGMOOR GYM: rough stone walls with a great boulder on the roof.
  rockGymImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    const line = '#241a10';
    const p = new Painter(W, H);
    p.ellipse(W / 2, 14, 18, 13, { fill: '#9a8a74', shade: '#6e604e', hi: '#bcae98', line });
    p.poly([[4, 34], [W / 2, 18], [W - 4, 34]], { fill: '#5c5a64', shade: '#44424c', hi: '#7a7884', line });
    g.drawImage(p.toCanvas(), 0, 0);
    g.fillStyle = '#8c7a62';
    g.fillRect(W / 2 - 6, 8, 5, 3);
    g.fillRect(W / 2 + 4, 16, 6, 2);
    // Stone block walls.
    g.fillStyle = line;
    g.fillRect(2, 32, W - 4, H - 32);
    const r = U.seeded(77);
    for (let y = 33; y < H - 2; y += 7) {
      let x = 3 - Math.floor(r() * 6);
      while (x < W - 3) {
        const w = 8 + Math.floor(r() * 9);
        const x0 = Math.max(3, x);
        const x1 = Math.min(W - 3, x + w);
        g.fillStyle = ['#a89478', '#98846a', '#b8a488', '#8c7a60'][Math.floor(r() * 4)];
        g.fillRect(x0, y, x1 - x0 - 1, 6);
        g.fillStyle = '#c8b498';
        g.fillRect(x0, y, x1 - x0 - 1, 1);
        x += w;
      }
    }
    // Pickaxe emblem and GYM plaque.
    const kx = W / 2;
    g.fillStyle = line;
    g.fillRect(kx - 15, 36, 30, 11);
    g.fillStyle = '#e0b048';
    g.fillRect(kx - 14, 37, 28, 9);
    Font.drawRaw(g, 'GYM', kx - 9, 38, '#503010');
    g.fillStyle = '#6a4a2a';
    g.fillRect(kx - 24, 38, 2, 10);
    g.fillStyle = '#b8c0c8';
    g.fillRect(kx - 28, 37, 10, 2);
    // Iron-banded wooden door.
    const dx = spec.door * 16 - 2;
    g.fillStyle = line;
    g.fillRect(dx - 1, H - 22, 22, 21);
    g.fillStyle = '#7a5230';
    g.fillRect(dx, H - 21, 20, 20);
    g.fillStyle = '#5a3a1c';
    g.fillRect(dx + 9, H - 21, 2, 20);
    g.fillStyle = '#484c58';
    g.fillRect(dx, H - 17, 20, 2);
    g.fillRect(dx, H - 8, 20, 2);
    g.fillStyle = '#8a7a64';
    g.fillRect(0, H - 2, W, 2);
    return c;
  },

  elevatorImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    g.fillStyle = '#343846';
    g.fillRect(2, 2, W - 4, H - 2);
    g.fillStyle = '#a8b0c0';
    g.fillRect(4, 8, W - 8, H - 8);
    g.fillStyle = '#c8d0dc';
    g.fillRect(5, 9, 2, H - 10);
    g.fillRect(W / 2 + 1, 9, 2, H - 10);
    g.fillStyle = '#5a6272';
    g.fillRect(W / 2 - 1, 8, 2, H - 8);
    g.fillStyle = '#101218';
    g.fillRect(W / 2 - 6, 3, 12, 4);
    Font.drawRaw(g, '--', W / 2 - 5, 3, '#f04040');
    // "OUT OF ORDER" tape.
    g.fillStyle = '#f8d030';
    g.fillRect(3, 18, W - 6, 4);
    g.fillStyle = '#302010';
    for (let x = 4; x < W - 4; x += 4) g.fillRect(x, 19, 2, 2);
    return c;
  },

  // The door to the executive floor, sealed by a key card lock.
  vaultDoorImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    g.fillStyle = '#101018';
    g.fillRect(1, 1, W - 2, H - 1);
    g.fillStyle = '#4a4458';
    g.fillRect(3, 3, W - 6, H - 3);
    g.fillStyle = '#5c566c';
    g.fillRect(3, 3, W - 6, 2);
    g.fillStyle = '#2c283a';
    g.fillRect(W / 2 - 1, 3, 2, H - 3);
    for (let y = 8; y < H - 2; y += 6) {
      g.fillStyle = '#a060e8';
      g.fillRect(4, y, W / 2 - 6, 1);
      g.fillRect(W / 2 + 2, y, W / 2 - 6, 1);
    }
    g.fillStyle = '#101018';
    g.fillRect(W - 9, 12, 6, 9);
    g.fillStyle = '#f04040';
    g.fillRect(W - 8, 13, 4, 2);
    g.fillStyle = '#e0e0e8';
    g.fillRect(W - 8, 16, 4, 1);
    Font.drawRaw(g, '4F', 6, 4, '#d8c8ff');
    return c;
  },

  // A wall screen showing eight KEYSTONES; three are lit.
  bigScreenImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    g.fillStyle = '#101018';
    g.fillRect(1, 2, W - 2, H - 4);
    g.fillStyle = '#16203a';
    g.fillRect(3, 4, W - 6, H - 8);
    const cx = W / 2;
    const cy = H / 2;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const x = Math.round(cx + Math.cos(a) * 20);
      const y = Math.round(cy + Math.sin(a) * 9);
      g.fillStyle = '#3a4668';
      const steps = 8;
      for (let k = 1; k < steps; k++) g.fillRect(Math.round(cx + (x - cx) * k / steps), Math.round(cy + (y - cy) * k / steps), 1, 1);
      g.fillStyle = i < 3 ? '#c890ff' : i === 3 ? '#f0b040' : '#48506a';
      g.fillRect(x - 2, y - 2, 4, 4);
    }
    g.fillStyle = '#f04060';
    g.fillRect(cx - 2, cy - 2, 4, 4);
    Font.drawRaw(g, 'RIFT', 6, 5, '#7888b8');
    return c;
  },

  // A glass tank holding a KEYSTONE's recorded song as glowing light.
  songTankImg(spec) {
    const c = Pix.canvas(16, 32);
    const g = c.getContext('2d');
    const col = spec.color;
    g.fillStyle = '#101018';
    g.fillRect(2, 1, 12, 30);
    g.fillStyle = '#48506a';
    g.fillRect(2, 1, 12, 4);
    g.fillRect(2, 26, 12, 5);
    g.fillStyle = col ? Pix.shade(col, 0.55) : '#1c2030';
    g.fillRect(3, 5, 10, 21);
    if (col) {
      g.fillStyle = col;
      g.fillRect(5, 8, 6, 15);
      g.fillStyle = Pix.mix(col, '#ffffff', 0.6);
      g.fillRect(7, 10, 2, 11);
      g.fillStyle = 'rgba(255,255,255,0.8)';
      g.fillRect(6, 12, 1, 1); g.fillRect(9, 17, 1, 1); g.fillRect(6, 21, 1, 1);
    }
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.fillRect(4, 6, 1, 18);
    g.fillStyle = col || '#404860';
    g.fillRect(6, 28, 4, 1);
    return c;
  },

  // CRAGMOOR's KEYSTONE: a violet stone set in a rough boulder.
  cragstoneImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const p = new Painter(W, H);
    p.rrect(4, H - 10, W - 8, 9, 2, { fill: '#8a7a64', shade: '#6a5c48', hi: '#a89880', line: '#241a10' });
    p.poly([[8, H - 9], [6, 20], [14, 6], [28, 4], [40, 14], [42, H - 9]], { fill: '#9c8a70', shade: '#766650', hi: '#bcaa90', line: '#241a10' });
    p.poly([[20, 16], [24, 10], [29, 16], [24, 26]], { fill: '#a060e8', shade: '#7038c0', hi: '#e0c8ff', line: '#281048' });
    return p.toCanvas();
  },
});

Object.assign(Props, {
  barrier() { return Tiles.barrierImg(); },
  minecart() {
    const p = new Painter(16, 16);
    p.rrect(1, 5, 14, 8, 1, { fill: '#6a7282', shade: '#4a5262', hi: '#8a92a2', line: '#141820' });
    p.ellipse(5, 7, 3, 2, { fill: '#7a6a58', shade: '#5a4a38', line: false });
    p.ellipse(10, 6.5, 3, 2, { fill: '#8a7a64', shade: '#6a5a44', line: false });
    p.ellipse(4, 14, 2, 2, { fill: '#303038', line: '#101014' });
    p.ellipse(12, 14, 2, 2, { fill: '#303038', line: '#101014' });
    return p.toCanvas();
  },
});

// Borders for the new outdoor areas.
{
  const baseBorder = Tiles.borderImg;
  Tiles.borderImg = function borderImg(ch) {
    if (ch === 's') return this.memo('borders', () => this.gravelImg(0));
    if (ch === 'N') return this.memo('borderN', () => this.asphaltImg(0));
    return baseBorder.call(this, ch);
  };
}

// Quarry ground: objects in CRAGMOOR sit on gravel, and the gym's ledges are rock.
{
  const baseStatic = Tiles.drawStatic;
  const onGravel = { rock: 'rockImg', bush: 'bushImg', boulder: 'boulderImg', lamp: 'lampImg', crates: 'crateImg', barrels: 'barrelsImg' };
  Tiles.drawStatic = function drawStatic(g, ch, px, py, n, x, y, map) {
    const d = this.def(ch);
    const hash = ((x * 73856093) ^ (y * 19349663)) >>> 0;
    if (map.def.ground === 's') {
      if (onGravel[d.name]) {
        g.drawImage(this.gravelImg(hash % 3), px, py);
        g.drawImage(this[onGravel[d.name]](), px, py);
        return;
      }
      if (d.name === 'building') {
        g.drawImage(this.gravelImg(0), px, py);
        return;
      }
      if (d.name === 'path') {
        g.drawImage(this.dirtRoadImg(hash % 2), px, py);
        const road = (c) => c === ':' || c === '#' || c === 'S' || c === 'B';
        g.fillStyle = '#b8a478';
        if (!road(n(0, -1))) g.fillRect(px, py, 16, 1);
        if (!road(n(0, 1))) g.fillRect(px, py + 15, 16, 1);
        if (!road(n(-1, 0))) g.fillRect(px, py, 1, 16);
        if (!road(n(1, 0))) g.fillRect(px + 15, py, 1, 16);
        return;
      }
    }
    if (d.name === 'sign' && [n(0, 1), n(0, -1), n(-1, 0), n(1, 0)].some((c) => '+Ns|/'.includes(c))) {
      g.drawImage(map.def.ground === 's' ? this.gravelImg(0) : this.groundCh4(map, n), px, py);
      g.drawImage(this.signImg(), px, py);
      return;
    }
    if (d.name === 'ledge' && map.floor === 'Ö') {
      g.drawImage(this.quarryFloorImg(0), px, py);
      g.drawImage(this.rockLedgeImg(), px, py);
      return;
    }
    baseStatic.call(this, g, ch, px, py, n, x, y, map);
    if (d.name === 'cliff' && map.def.ground === 's' && n(0, -1) !== '^' && n(0, -1) !== '#') {
      g.fillStyle = '#8e7a58';
      g.fillRect(px, py, 16, 1);
    }
  };
}

Object.assign(Tiles, {
  dirtRoadImg(v) {
    return this.memo(`dirtRoad${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#dcc89c';
      g.fillRect(0, 0, 16, 16);
      const r = U.seeded(700 + v);
      for (let i = 0; i < 6; i++) {
        g.fillStyle = i % 2 ? '#ccb88a' : '#e8d8b0';
        g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 2, 1);
      }
      return c;
    });
  },

  rockLedgeImg() {
    return this.memo('rockLedge', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#6a5a44';
      g.fillRect(0, 9, 16, 5);
      g.fillStyle = '#8c7a60';
      g.fillRect(0, 9, 16, 1);
      g.fillStyle = '#4a3c2c';
      g.fillRect(0, 13, 16, 2);
      g.fillStyle = '#9c8a6c';
      g.fillRect(3, 10, 3, 1); g.fillRect(10, 11, 4, 1);
      return c;
    });
  },
});
