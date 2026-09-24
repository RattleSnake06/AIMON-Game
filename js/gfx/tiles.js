'use strict';
// Map tiles and buildings. Static tiles are painted into one big canvas per
// map when it loads (with auto-tiling for paths, water, fences...), and only
// animated tiles (water, flowers) are redrawn every frame.

const C = {
  grass: '#90d068', grassHi: '#b8e890', grassLo: '#70b050', grassDk: '#508a40',
  tall: '#48a040', tallHi: '#80d058', tallLo: '#2e7a30', tallDk: '#1e5424',
  path: '#e8d098', pathHi: '#f8e8b8', pathLo: '#d0b078', pathDk: '#b09060',
  water: '#58a8f0', waterHi: '#a0d8f8', waterLo: '#3888d8', foam: '#e8f8f8',
  crown: '#48a048', crownHi: '#78c860', crownLo: '#2e7a36', crownDk: '#1a4a26',
  trunk: '#986030', trunkDk: '#603818',
  wood: '#d8a060', woodHi: '#f0c888', woodLo: '#a87038', woodDk: '#684020',
  stone: '#d8d0c0', stoneHi: '#f0e8e0', stoneLo: '#a8a090', stoneDk: '#787068',
  rock: '#b0b0b8', rockHi: '#e0e0e8', rockLo: '#808090', rockDk: '#484858',
  wall: '#f0e0c0', wallLo: '#e0cca8', wallDk: '#b09070',
  line: '#383840',
};

// Behaviour of each map character.
const TILE_DEFS = {
  // outdoors
  '.': { name: 'grass' },
  ',': { name: 'grass' },
  'g': { name: 'tall', grass: true },
  ':': { name: 'path' },
  '+': { name: 'paving' },
  'T': { name: 'tree', solid: true },
  't': { name: 'bush', solid: true },
  '~': { name: 'water', solid: true, water: true },
  '=': { name: 'bridge' },
  'Q': { name: 'stoneBridge' },
  'f': { name: 'flowers', anim: true },
  'F': { name: 'fence', solid: true },
  'S': { name: 'sign', solid: true },
  'L': { name: 'ledge', ledge: true },
  'r': { name: 'rock', solid: true },
  'o': { name: 'mailbox', solid: true },
  'u': { name: 'fountain', solid: true },
  '#': { name: 'building', solid: true },
  // indoors
  'x': { name: 'void', solid: true },
  'w': { name: 'wallTop', solid: true },
  'W': { name: 'wall', solid: true },
  'n': { name: 'window', solid: true },
  'i': { name: 'picture', solid: true },
  'l': { name: 'clock', solid: true },
  'K': { name: 'shelfTop', solid: true },
  'k': { name: 'shelf', solid: true },
  '_': { name: 'wood' },
  '-': { name: 'tiles' },
  'R': { name: 'rug' },
  'M': { name: 'mat' },
  'U': { name: 'stairs' },
  'Y': { name: 'bedTop', solid: true },
  'y': { name: 'bed', solid: true },
  'v': { name: 'tv', solid: true },
  'P': { name: 'pc', solid: true },
  'D': { name: 'table', solid: true },
  'c': { name: 'stool' },
  'p': { name: 'plant', solid: true },
  'C': { name: 'counter', solid: true, counter: true },
  'E': { name: 'counterBlue', solid: true, counter: true },
  'h': { name: 'healer', solid: true, counter: true },
  'm': { name: 'goods', solid: true },
  'X': { name: 'machine', solid: true },
  'G': { name: 'kitchen', solid: true },
  'j': { name: 'vase', solid: true },
};

// Building footprints in tiles; `door` is the door's column.
const BUILDINGS = {
  houseRed: { w: 5, h: 4, roof: '#e06048', door: 2, windows: [0.5, 3.5] },
  houseBlue: { w: 5, h: 4, roof: '#5878d0', door: 2, windows: [0.5, 3.5] },
  houseGreen: { w: 4, h: 4, roof: '#58a860', door: 1, windows: [2.5] },
  houseBrown: { w: 4, h: 4, roof: '#b07848', door: 2, windows: [0.5] },
  housePurple: { w: 5, h: 4, roof: '#9068c0', door: 1, windows: [2.5, 3.5] },
  lab: { w: 7, h: 5, roof: '#909aa8', door: 3, windows: [0.5, 1.5, 4.5, 5.5], wall: '#f8f8f8', lab: true },
  centre: { w: 5, h: 5, roof: '#e05050', door: 2, doubleDoor: true, windows: [0.5, 3.5], sign: 'centre' },
  mart: { w: 5, h: 4, roof: '#4870d0', door: 1, windows: [3], sign: 'mart' },
};

const Tiles = {
  cache: {},
  buildings: {},

  def(ch) { return TILE_DEFS[ch] || TILE_DEFS['.']; },

  init() {
    this.tallOver = this.makeTallGrassOverlay();
    this.buildBuildings();
  },

  // ---------------------------------------------------------------------
  // Map rendering

  renderMap(map) {
    const W = map.w;
    const H = map.h;
    const cv = Pix.canvas(W * TILE, H * TILE);
    const g = cv.getContext('2d');
    const anims = [];
    const at = (x, y) => map.tileAt(x, y);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const ch = at(x, y);
        const n = (dx, dy) => at(x + dx, y + dy);
        this.drawStatic(g, ch, x * TILE, y * TILE, n, x, y, map);
        const d = this.def(ch);
        if (d.water || ch === 'f') anims.push({ x, y, ch, mask: this.waterMask(n) });
      }
    }
    for (const b of map.buildings || []) {
      g.drawImage(this.buildings[b.type], b.x * TILE, b.y * TILE);
    }
    return { canvas: cv, anims };
  },

  // 8-bit mask of which neighbours are land (for water edges).
  waterMask(n) {
    const land = (dx, dy) => {
      const c = n(dx, dy);
      return !(this.def(c).water || c === '=' || c === 'Q');
    };
    let m = 0;
    [[0, -1], [1, 0], [0, 1], [-1, 0], [1, -1], [1, 1], [-1, 1], [-1, -1]].forEach(([dx, dy], i) => {
      if (land(dx, dy)) m |= 1 << i;
    });
    return m;
  },

  drawAnim(g, a, sx, sy, frame) {
    if (a.ch === 'f') {
      g.drawImage(this.flowerImg((a.x * 7 + a.y * 3) % 3, Math.floor(frame / 20) % 2), sx, sy);
      return;
    }
    g.drawImage(this.waterImg(a.mask, Math.floor(frame / 12) % 4), sx, sy);
  },

  drawStatic(g, ch, px, py, n, x, y, map) {
    const d = this.def(ch);
    const hash = ((x * 73856093) ^ (y * 19349663)) >>> 0;
    switch (d.name) {
      case 'grass': g.drawImage(this.grassImg(hash % 7 === 0 ? 1 : hash % 11 === 0 ? 2 : 0), px, py); break;
      case 'tall': g.drawImage(this.tallGrassImg(), px, py); break;
      case 'path': this.drawPath(g, px, py, n, hash); break;
      case 'paving': g.drawImage(this.pavingImg(), px, py); break;
      case 'tree':
        g.drawImage(this.grassImg(0), px, py);
        g.drawImage(this.treeImg(), px, py);
        break;
      case 'bush':
        g.drawImage(this.grassImg(0), px, py);
        g.drawImage(this.bushImg(), px, py);
        break;
      case 'water': break; // animated
      case 'bridge': this.drawBridge(g, px, py, n); break;
      case 'stoneBridge': this.drawStoneBridge(g, px, py, n); break;
      case 'flowers': g.drawImage(this.grassImg(0), px, py); break;
      case 'fence': this.drawFence(g, px, py, n); break;
      case 'sign':
        this.drawGround(g, px, py, n, x, y);
        g.drawImage(this.signImg(), px, py);
        break;
      case 'ledge': g.drawImage(this.ledgeImg(), px, py); break;
      case 'rock':
        g.drawImage(this.grassImg(0), px, py);
        g.drawImage(this.rockImg(), px, py);
        break;
      case 'mailbox':
        g.drawImage(this.grassImg(0), px, py);
        g.drawImage(this.mailboxImg(), px, py);
        break;
      case 'fountain':
        this.drawFountain(g, px, py, n);
        break;
      case 'building': g.drawImage(this.grassImg(0), px, py); break;
      // interior
      case 'void': g.fillStyle = '#000'; g.fillRect(px, py, TILE, TILE); break;
      case 'wallTop': g.drawImage(this.wallTopImg(), px, py); break;
      case 'wall': g.drawImage(this.wallImg(), px, py); break;
      case 'window': g.drawImage(this.wallImg(), px, py); g.drawImage(this.windowImg(), px, py); break;
      case 'picture': g.drawImage(this.wallImg(), px, py); g.drawImage(this.pictureImg(), px, py); break;
      case 'clock': g.drawImage(this.wallImg(), px, py); g.drawImage(this.clockImg(), px, py); break;
      case 'shelfTop': g.drawImage(this.wallTopImg(), px, py); g.drawImage(this.shelfImg(0), px, py); break;
      case 'shelf': g.drawImage(this.wallImg(), px, py); g.drawImage(this.shelfImg(1), px, py); break;
      case 'wood': g.drawImage(this.woodImg(), px, py); break;
      case 'tiles': g.drawImage(this.floorTileImg(), px, py); break;
      case 'rug': this.drawRug(g, px, py, n); break;
      case 'mat': this.drawFloor(g, px, py, map); g.drawImage(this.matImg(), px, py); break;
      case 'stairs': g.drawImage(this.stairsImg(), px, py); break;
      case 'bedTop': this.drawFloor(g, px, py, map); g.drawImage(this.bedImg(0), px, py); break;
      case 'bed': this.drawFloor(g, px, py, map); g.drawImage(this.bedImg(1), px, py); break;
      case 'tv': this.drawFloor(g, px, py, map); g.drawImage(this.tvImg(), px, py); break;
      case 'pc': this.drawFloor(g, px, py, map); g.drawImage(this.pcImg(), px, py); break;
      case 'table': this.drawFloor(g, px, py, map); this.drawTable(g, px, py, n); break;
      case 'stool': this.drawFloor(g, px, py, map); g.drawImage(this.stoolImg(), px, py); break;
      case 'plant': this.drawFloor(g, px, py, map); g.drawImage(this.plantImg(), px, py); break;
      case 'counter': this.drawFloor(g, px, py, map); this.drawCounter(g, px, py, n, '#e06070'); break;
      case 'counterBlue': this.drawFloor(g, px, py, map); this.drawCounter(g, px, py, n, '#5878d0'); break;
      case 'healer':
        this.drawFloor(g, px, py, map);
        this.drawCounter(g, px, py, n, '#e06070');
        g.drawImage(this.healerImg(), px, py);
        break;
      case 'goods': this.drawFloor(g, px, py, map); g.drawImage(this.goodsImg(hash % 3), px, py); break;
      case 'machine': this.drawFloor(g, px, py, map); g.drawImage(this.machineImg(hash % 2), px, py); break;
      case 'kitchen': this.drawFloor(g, px, py, map); g.drawImage(this.kitchenImg(x % 2), px, py); break;
      case 'vase': this.drawFloor(g, px, py, map); g.drawImage(this.vaseImg(), px, py); break;
      default: g.drawImage(this.grassImg(0), px, py);
    }
  },

  // Ground under props: path if the prop sits on a path, else grass.
  drawGround(g, px, py, n, x, y) {
    const around = [n(0, 1), n(0, -1), n(-1, 0), n(1, 0)];
    if (around.filter((c) => c === ':').length >= 2) this.drawPath(g, px, py, () => ':', 0);
    else g.drawImage(this.grassImg(0), px, py);
  },

  drawFloor(g, px, py, map) {
    g.drawImage(map.floor === '-' ? this.floorTileImg() : this.woodImg(), px, py);
  },

  memo(key, fn) {
    if (!this.cache[key]) this.cache[key] = fn();
    return this.cache[key];
  },

  // ---------------------------------------------------------------------
  // Outdoor tiles

  grassImg(v) {
    return this.memo(`grass${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = C.grass;
      g.fillRect(0, 0, 16, 16);
      const tuft = (x, y) => {
        g.fillStyle = C.grassLo;
        g.fillRect(x, y, 1, 2);
        g.fillRect(x + 2, y, 1, 2);
        g.fillRect(x + 1, y + 1, 1, 1);
        g.fillStyle = C.grassHi;
        g.fillRect(x + 1, y - 1, 1, 1);
      };
      if (v === 0) { tuft(2, 3); tuft(10, 10); }
      if (v === 1) { tuft(4, 5); tuft(11, 2); tuft(6, 12); tuft(12, 12); }
      if (v === 2) {
        tuft(3, 10);
        g.fillStyle = C.grassHi;
        g.fillRect(10, 4, 2, 1); g.fillRect(11, 3, 1, 1);
        g.fillStyle = '#f8f8f8';
        g.fillRect(11, 4, 1, 1);
      }
      return c;
    });
  },

  tallGrassImg() {
    return this.memo('tall', () => Pix.fromRows([
      '..h.....h.....h.',
      '.hlh...hlh...hlh',
      '.lml.h.lml.h.lml',
      'hmmlhlhmmlhlhmml',
      'lmdmlmlmdmlmlmdm',
      'mdmmmdmdmmmdmdmm',
      'dmmdmmdmmdmmdmmd',
      'mmdmmdmmdmmdmmdm',
      '..h.dmd.h.dmd.h.',
      '.hlhmdmhlhmdmhlh',
      '.lmldmdlmldmdlml',
      'hmmlhdhmmlhdhmml',
      'lmdmlmlmdmlmlmdm',
      'mdmmmdmdmmmdmdmm',
      'dmmdmmdmmdmmdmmd',
      'dddddddddddddddd',
    ], { h: C.tallHi, l: C.tallHi, m: C.tall, d: C.tallLo }));
  },

  makeTallGrassOverlay() {
    // Lower part of tall grass drawn over a character standing in it.
    const full = this.tallGrassImg();
    const c = Pix.canvas(16, 16);
    c.getContext('2d').drawImage(full, 0, 9, 16, 7, 0, 9, 16, 7);
    return c;
  },

  drawPath(g, px, py, n, hash) {
    g.fillStyle = C.path;
    g.fillRect(px, py, 16, 16);
    const r = U.seeded(hash || 7);
    for (let i = 0; i < 4; i++) {
      const x = Math.floor(r() * 14) + 1;
      const y = Math.floor(r() * 14) + 1;
      g.fillStyle = C.pathLo;
      g.fillRect(px + x, py + y, 2, 1);
      g.fillStyle = C.pathHi;
      g.fillRect(px + x, py + y - 1, 1, 1);
    }
    const isPath = (c) => c === ':' || c === '=' || c === 'Q' || c === '+' || c === 'S' || c === '#';
    // Grass creeps over edges that border grass.
    g.fillStyle = C.grass;
    const edge = (horizontal, fixed, sign) => {
      for (let i = 0; i < 16; i++) {
        const depth = 1 + ((i * 5 + (hash >> 3)) % 3 === 0 ? 1 : 0);
        for (let d = 0; d < depth; d++) {
          const pos = sign > 0 ? 15 - d : d;
          if (horizontal) g.fillRect(px + i, py + pos, 1, 1);
          else g.fillRect(px + pos, py + i, 1, 1);
        }
      }
    };
    if (!isPath(n(0, -1))) edge(true, 0, -1);
    if (!isPath(n(0, 1))) edge(true, 0, 1);
    if (!isPath(n(-1, 0))) edge(false, 0, -1);
    if (!isPath(n(1, 0))) edge(false, 0, 1);
  },

  pavingImg() {
    return this.memo('paving', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = C.stone;
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = C.stoneLo;
      g.fillRect(0, 7, 16, 1);
      g.fillRect(0, 15, 16, 1);
      g.fillRect(7, 0, 1, 7);
      g.fillRect(15, 8, 1, 7);
      g.fillStyle = C.stoneHi;
      g.fillRect(0, 0, 7, 1);
      g.fillRect(8, 8, 7, 1);
      g.fillRect(0, 8, 1, 7);
      return c;
    });
  },

  treeImg() {
    return this.memo('tree', () => {
      const p = new Painter(16, 16);
      p.ellipse(8, 14.5, 6, 2, { fill: C.grassDk, line: false });
      p.rect(6, 10, 3, 5, { fill: C.trunk, line: C.trunkDk, shade: C.trunkDk });
      p.ellipse(8, 6.5, 7.6, 6.6, { fill: C.crown, line: C.crownDk, shade: C.crownLo, hi: C.crownHi, shadeAt: 0.3, hiAt: -0.5 });
      // Leaf clumps.
      p.set(5, 4, C.crownHi); p.set(6, 3, C.crownHi); p.set(4, 5, C.crownHi);
      p.set(9, 7, C.crownLo); p.set(10, 8, C.crownLo); p.set(11, 6, C.crownLo);
      p.set(7, 9, C.crownLo); p.set(4, 8, C.crownLo);
      p.set(9, 3, C.crownHi); p.set(10, 4, C.crownHi);
      return p.toCanvas();
    });
  },

  bushImg() {
    return this.memo('bush', () => {
      const p = new Painter(16, 16);
      p.ellipse(8, 13.5, 7, 2, { fill: C.grassDk, line: false });
      p.ellipse(8, 8.5, 7, 6, { fill: C.crown, line: C.crownDk, shade: C.crownLo, hi: C.crownHi });
      p.set(5, 6, C.crownHi); p.set(10, 10, C.crownLo); p.set(6, 11, C.crownLo);
      return p.toCanvas();
    });
  },

  waterImg(mask, frame) {
    return this.memo(`water${mask}_${frame}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = C.water;
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = C.waterHi;
      const waves = [[2, 3], [10, 6], [5, 11], [13, 13]];
      for (const [wx, wy] of waves) {
        const x = (wx + frame * 2) % 16;
        g.fillRect(x, wy, 3, 1);
        g.fillRect((x + 3) % 16, wy - 1, 2, 1);
      }
      g.fillStyle = C.waterLo;
      for (const [wx, wy] of waves) g.fillRect((wx + frame * 2 + 8) % 16, (wy + 4) % 16, 2, 1);
      // Shoreline.
      const land = (i) => (mask >> i) & 1;
      const foam = (x, y, w, h) => {
        g.fillStyle = C.foam;
        g.fillRect(x, y, w, h);
      };
      const lip = (x, y, w, h) => {
        g.fillStyle = C.waterLo;
        g.fillRect(x, y, w, h);
      };
      if (land(0)) { foam(0, 0, 16, 1); lip(0, 1, 16, 1); }
      if (land(2)) { lip(0, 14, 16, 1); foam(0, 15, 16, 1); }
      if (land(3)) { foam(0, 0, 1, 16); lip(1, 0, 1, 16); }
      if (land(1)) { lip(14, 0, 1, 16); foam(15, 0, 1, 16); }
      if (land(4) && !land(0) && !land(1)) foam(14, 0, 2, 2);
      if (land(5) && !land(2) && !land(1)) foam(14, 14, 2, 2);
      if (land(6) && !land(2) && !land(3)) foam(0, 14, 2, 2);
      if (land(7) && !land(0) && !land(3)) foam(0, 0, 2, 2);
      return c;
    });
  },

  flowerImg(color, frame) {
    return this.memo(`flower${color}_${frame}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.grassImg(0), 0, 0);
      const petals = ['#f86060', '#f8d840', '#f8f8f8'][color];
      const dark = ['#b83838', '#c09820', '#b8b8c8'][color];
      const flower = (x, y) => {
        const s = frame;
        g.fillStyle = C.grassDk;
        g.fillRect(x + 1, y + 3, 1, 2);
        g.fillStyle = dark;
        g.fillRect(x - s + 0, y + 1, 3, 2);
        g.fillStyle = petals;
        g.fillRect(x + 1 - s, y, 1, 3);
        g.fillRect(x - s, y + 1, 3, 1);
        g.fillStyle = '#f8a830';
        g.fillRect(x + 1 - s, y + 1, 1, 1);
      };
      flower(3, 3);
      flower(10, 9);
      flower(11, 2);
      flower(4, 11);
      return c;
    });
  },

  drawBridge(g, px, py, n) {
    const waterSide = (c) => this.def(c).water;
    // Planks run across the direction of travel.
    const vertical = waterSide(n(-1, 0)) || waterSide(n(1, 0));
    g.fillStyle = C.wood;
    g.fillRect(px, py, 16, 16);
    g.fillStyle = C.woodLo;
    if (vertical) {
      for (let y = 3; y < 16; y += 4) g.fillRect(px, py + y, 16, 1);
      g.fillStyle = C.woodHi;
      for (let y = 0; y < 16; y += 4) g.fillRect(px + 2, py + y, 12, 1);
      if (waterSide(n(-1, 0))) { g.fillStyle = C.woodDk; g.fillRect(px, py, 2, 16); g.fillStyle = C.woodHi; g.fillRect(px, py, 1, 16); }
      if (waterSide(n(1, 0))) { g.fillStyle = C.woodDk; g.fillRect(px + 14, py, 2, 16); g.fillStyle = C.woodHi; g.fillRect(px + 14, py, 1, 16); }
    } else {
      for (let x = 3; x < 16; x += 4) g.fillRect(px + x, py, 1, 16);
      g.fillStyle = C.woodHi;
      for (let x = 0; x < 16; x += 4) g.fillRect(px + x, py + 2, 1, 12);
      if (waterSide(n(0, -1))) { g.fillStyle = C.woodDk; g.fillRect(px, py, 16, 2); }
      if (waterSide(n(0, 1))) { g.fillStyle = C.woodDk; g.fillRect(px, py + 14, 16, 2); }
    }
  },

  drawStoneBridge(g, px, py, n) {
    const water = (c) => this.def(c).water;
    g.drawImage(this.pavingImg(), px, py);
    const rail = (x) => {
      g.fillStyle = C.stoneDk;
      g.fillRect(px + x, py, 3, 16);
      g.fillStyle = C.stoneHi;
      g.fillRect(px + x, py, 2, 16);
      g.fillStyle = C.stoneLo;
      g.fillRect(px + x, py + 7, 3, 1);
      g.fillRect(px + x, py + 15, 3, 1);
    };
    if (water(n(-1, 0))) rail(0);
    if (water(n(1, 0))) rail(13);
    // Arch shadow where the bridge meets the water below.
    if (water(n(0, 1)) || water(n(-1, 1))) {
      g.fillStyle = 'rgba(40,60,90,0.25)';
      g.fillRect(px, py + 14, 16, 2);
    }
  },

  drawFence(g, px, py, n) {
    const f = (c) => c === 'F';
    this.drawGround(g, px, py, n);
    const post = () => {
      g.fillStyle = C.woodDk;
      g.fillRect(px + 6, py + 3, 4, 11);
      g.fillStyle = C.wood;
      g.fillRect(px + 7, py + 4, 2, 9);
      g.fillStyle = C.woodHi;
      g.fillRect(px + 7, py + 4, 1, 8);
    };
    const railH = (x0, x1) => {
      for (const ry of [5, 9]) {
        g.fillStyle = C.woodDk;
        g.fillRect(px + x0, py + ry, x1 - x0, 3);
        g.fillStyle = C.woodHi;
        g.fillRect(px + x0, py + ry + 1, x1 - x0, 1);
      }
    };
    if (f(n(-1, 0))) railH(0, 8);
    if (f(n(1, 0))) railH(8, 16);
    if (f(n(0, -1))) {
      g.fillStyle = C.woodDk; g.fillRect(px + 7, py, 2, 4);
    }
    if (f(n(0, 1))) {
      g.fillStyle = C.woodDk; g.fillRect(px + 7, py + 13, 2, 3);
    }
    post();
    g.fillStyle = 'rgba(0,0,0,0.15)';
    g.fillRect(px + 5, py + 14, 6, 1);
  },

  signImg() {
    return this.memo('sign', () => Pix.fromRows([
      '................',
      '................',
      '.oooooooooooooo.',
      '.ohhhhhhhhhhhho.',
      '.ohwwwwwwwwwwdo.',
      '.ohwddwddwddwdo.',
      '.ohwwwwwwwwwwdo.',
      '.ohwddwdwddwwdo.',
      '.ohwwwwwwwwwwdo.',
      '.oddddddddddddo.',
      '.oooooohdoooooo.',
      '......ohdo......',
      '......ohdo......',
      '......ohdo......',
      '.....sohdos.....',
      '......ssss......',
    ], { o: C.woodDk, h: C.woodHi, w: C.wood, d: C.woodLo, s: C.grassDk }));
  },

  ledgeImg() {
    return this.memo('ledge', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.grassImg(0), 0, 0);
      g.fillStyle = C.grassHi;
      g.fillRect(0, 7, 16, 2);
      g.fillStyle = '#5a9a40';
      g.fillRect(0, 9, 16, 4);
      g.fillStyle = '#3c7430';
      for (let x = 0; x < 16; x += 4) g.fillRect(x + 1, 10, 2, 3);
      g.fillStyle = '#2c5c28';
      g.fillRect(0, 13, 16, 1);
      g.fillStyle = C.grassLo;
      g.fillRect(0, 14, 16, 2);
      return c;
    });
  },

  rockImg() {
    return this.memo('rock', () => {
      const p = new Painter(16, 16);
      p.ellipse(8, 13, 7, 2.5, { fill: C.grassDk, line: false });
      p.ellipse(8, 9, 6.6, 5.6, { fill: C.rock, line: C.rockDk, shade: C.rockLo, hi: C.rockHi });
      p.line(6, 8, 9, 10, C.rockLo);
      return p.toCanvas();
    });
  },

  mailboxImg() {
    return this.memo('mailbox', () => Pix.fromRows([
      '................',
      '................',
      '................',
      '....oooooooo....',
      '...orrrrrrrro...',
      '...orhhhhhhro...',
      '...orrrrrrrro...',
      '...odddddddro...',
      '...oooooooooo...',
      '......owdo......',
      '......owdo......',
      '......owdo......',
      '......owdo......',
      '.....sowdos.....',
      '......ssss......',
      '................',
    ], { o: '#303040', r: '#e05050', h: '#f89090', d: '#a03030', w: C.wood, s: C.grassDk }));
  },

  drawFountain(g, px, py, n) {
    g.drawImage(this.pavingImg(), px, py);
    const isF = (c) => c === 'u';
    g.fillStyle = C.stoneDk;
    g.fillRect(px, py, 16, 16);
    g.fillStyle = C.stoneHi;
    g.fillRect(px + (isF(n(-1, 0)) ? 0 : 1), py + (isF(n(0, -1)) ? 0 : 1),
      16 - (isF(n(-1, 0)) ? 0 : 1) - (isF(n(1, 0)) ? 0 : 1), 16 - (isF(n(0, -1)) ? 0 : 1) - (isF(n(0, 1)) ? 0 : 1));
    g.fillStyle = C.water;
    g.fillRect(px + (isF(n(-1, 0)) ? 0 : 3), py + (isF(n(0, -1)) ? 0 : 3),
      16 - (isF(n(-1, 0)) ? 0 : 3) - (isF(n(1, 0)) ? 0 : 3), 16 - (isF(n(0, -1)) ? 0 : 3) - (isF(n(0, 1)) ? 0 : 3));
    g.fillStyle = C.waterHi;
    g.fillRect(px + 5, py + 6, 3, 1);
    g.fillRect(px + 9, py + 10, 2, 1);
  },

  // ---------------------------------------------------------------------
  // Interior tiles

  wallTopImg() {
    return this.memo('wallTop', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = C.wall;
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = C.wallLo;
      for (let x = 2; x < 16; x += 8) g.fillRect(x, 0, 2, 16);
      g.fillStyle = C.wallDk;
      g.fillRect(0, 0, 16, 3);
      g.fillStyle = '#806048';
      g.fillRect(0, 3, 16, 1);
      return c;
    });
  },

  wallImg() {
    return this.memo('wall', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = C.wall;
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = C.wallLo;
      for (let x = 2; x < 16; x += 8) g.fillRect(x, 0, 2, 11);
      g.fillStyle = C.woodHi;
      g.fillRect(0, 11, 16, 1);
      g.fillStyle = C.woodLo;
      g.fillRect(0, 12, 16, 3);
      g.fillStyle = C.woodDk;
      g.fillRect(0, 15, 16, 1);
      return c;
    });
  },

  windowImg() {
    return this.memo('window', () => Pix.fromRows([
      '................',
      '..oooooooooooo..',
      '..obbbbbobbbbo..',
      '..obwbbbobwbbo..',
      '..obbwbbobbwbo..',
      '..obbbbbobbbbo..',
      '..ooooooooooooo.',
      '..obbbbbobbbbo..',
      '..oggggbobgggo..',
      '..oggggbobgggo..',
      '..oooooooooooo..',
      '................',
    ], { o: C.woodDk, b: '#a8d8f8', w: '#f8f8f8', g: '#88c070' }));
  },

  pictureImg() {
    return this.memo('picture', () => Pix.fromRows([
      '................',
      '................',
      '...oooooooooo...',
      '...ossssssssso..',
      '...osssssyssso..',
      '...ossgsssssso..',
      '...osggggsgsso..',
      '...oggggggggso..',
      '...oooooooooo...',
      '................',
    ], { o: '#b08838', s: '#a8d8f8', y: '#f8e060', g: '#58a048' }));
  },

  clockImg() {
    return this.memo('clock', () => Pix.fromRows([
      '................',
      '.....oooooo.....',
      '....owwwwwwo....',
      '...owwwkwwwwo...',
      '...owwwkwwwwo...',
      '...owwwkkkwwo...',
      '...owwwwwwwwo...',
      '....owwwwwwo....',
      '.....oooooo.....',
    ], { o: '#805030', w: '#f8f8f0', k: '#303040' }));
  },

  shelfImg(part) {
    return this.memo(`shelf${part}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      const books = ['#d05050', '#5070c8', '#50a060', '#e0b040', '#9060b0'];
      g.fillStyle = C.woodDk;
      g.fillRect(0, part ? 0 : 2, 16, part ? 16 : 14);
      g.fillStyle = C.woodLo;
      g.fillRect(1, part ? 0 : 3, 14, part ? 15 : 13);
      const rowsY = part ? [1, 8] : [4, 10];
      for (const ry of rowsY) {
        let x = 2;
        let i = ry + part * 3;
        while (x < 14) {
          const w = 1 + ((i * 7) % 3 === 0 ? 1 : 0) + 1;
          g.fillStyle = books[i % books.length];
          g.fillRect(x, ry, Math.min(w, 14 - x), 5);
          g.fillStyle = 'rgba(255,255,255,0.35)';
          g.fillRect(x, ry, 1, 5);
          x += w;
          i += 3;
        }
        g.fillStyle = C.woodDk;
        g.fillRect(1, ry + 5, 14, 1);
      }
      if (part) {
        g.fillStyle = C.woodDk;
        g.fillRect(0, 15, 16, 1);
      }
      return c;
    });
  },

  woodImg() {
    return this.memo('woodfloor', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#e0b078';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#c89058';
      for (let y = 3; y < 16; y += 4) g.fillRect(0, y, 16, 1);
      g.fillRect(5, 0, 1, 3); g.fillRect(12, 4, 1, 3); g.fillRect(2, 8, 1, 3); g.fillRect(9, 12, 1, 3);
      g.fillStyle = '#f0c890';
      for (let y = 0; y < 16; y += 4) g.fillRect(0, y, 16, 1);
      return c;
    });
  },

  floorTileImg() {
    return this.memo('floortile', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#e8e8e0';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#d0d8e0';
      g.fillRect(0, 0, 8, 8);
      g.fillRect(8, 8, 8, 8);
      g.fillStyle = '#c0c0c8';
      g.fillRect(0, 15, 16, 1);
      g.fillRect(15, 0, 1, 16);
      g.fillRect(0, 7, 16, 1);
      g.fillRect(7, 0, 1, 16);
      return c;
    });
  },

  drawRug(g, px, py, n) {
    const r = (c) => c === 'R';
    g.fillStyle = '#c85050';
    g.fillRect(px, py, 16, 16);
    g.fillStyle = '#e8a070';
    if (!r(n(0, -1))) g.fillRect(px, py + 1, 16, 1);
    if (!r(n(0, 1))) g.fillRect(px, py + 14, 16, 1);
    if (!r(n(-1, 0))) g.fillRect(px + 1, py, 1, 16);
    if (!r(n(1, 0))) g.fillRect(px + 14, py, 1, 16);
    g.fillStyle = '#a03838';
    g.fillRect(px + 6, py + 6, 4, 4);
  },

  matImg() {
    return this.memo('mat', () => Pix.fromRows([
      '................',
      '................',
      '................',
      '.oooooooooooooo.',
      '.orrrrrrrrrrrro.',
      '.orhrhrhrhrhrro.',
      '.orrrrrrrrrrrro.',
      '.orhrhrhrhrhrro.',
      '.orrrrrrrrrrrro.',
      '.orhrhrhrhrhrro.',
      '.orrrrrrrrrrrro.',
      '.oooooooooooooo.',
    ], { o: '#803030', r: '#c85050', h: '#e88070' }));
  },

  stairsImg() {
    return this.memo('stairs', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = C.woodDk;
      g.fillRect(0, 0, 16, 16);
      for (let i = 0; i < 4; i++) {
        g.fillStyle = C.wood;
        g.fillRect(1, i * 4, 14, 3);
        g.fillStyle = C.woodHi;
        g.fillRect(1, i * 4, 14, 1);
      }
      return c;
    });
  },

  bedImg(part) {
    return this.memo(`bed${part}`, () => Pix.fromRows(part === 0 ? [
      '.oooooooooooooo.',
      '.owwwwwwwwwwwwo.',
      '.owoooooooooowo.',
      '.owo........owo.',
      '.oo..pppppp..oo.',
      '.o..pwwwwwwp..o.',
      '.o..pwwwwwwp..o.',
      '.o...pppppp...o.',
      '.o............o.',
      '.obbbbbbbbbbbbo.',
      '.obhhhhhhhhhhbo.',
      '.obbbbbbbbbbbbo.',
      '.obbbbbbbbbbbbo.',
      '.obhbbbhbbbbhbo.',
      '.obbbbbbbbbbbbo.',
      '.obbbbbbbbbbbbo.',
    ] : [
      '.obbbbbbbbbbbbo.',
      '.obbbhbbbbhbbbo.',
      '.obbbbbbbbbbbbo.',
      '.obbbbbbbbbbbbo.',
      '.obhbbbbhbbbbbo.',
      '.obbbbbbbbbbbbo.',
      '.odddddddddddddo',
      '.owwwwwwwwwwwwo.',
      '.oooooooooooooo.',
      '.oo..........oo.',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ], { o: C.woodDk, w: C.wood, p: '#a8a8c0', b: '#5888d8', h: '#88b0f0', d: '#3860a8' }));
  },

  tvImg() {
    return this.memo('tv', () => Pix.fromRows([
      '................',
      '...o......o.....',
      '....o....o......',
      '..oooooooooooo..',
      '..oggggggggggo..',
      '..ogssssssssgo..',
      '..ogsbbbbbbsgo..',
      '..ogsbwbbbbsgo..',
      '..ogsbbbbbbsgo..',
      '..ogssssssssgo..',
      '..oggggggggrgo..',
      '..oooooooooooo..',
      '..owwwwwwwwwwo..',
      '..odddddddddd o.',
      '..oo........oo..',
      '................',
    ], { o: '#303040', g: '#909098', s: '#606068', b: '#80b8e8', w: '#e0f0f8', r: '#e04040', d: C.woodLo }));
  },

  pcImg() {
    return this.memo('pc', () => Pix.fromRows([
      '................',
      '...oooooooooo...',
      '...owwwwwwwwo...',
      '...owssssssso...',
      '...owsbbbbbso...',
      '...owsbgbbbso...',
      '...owssssssso...',
      '...oooooooooo...',
      '.oooooowoooooo..',
      '.owwwwwwwwwwwwo.',
      '.oddddddddddddo.',
      '.oddkkkkkkkkddo.',
      '.odddddddddddd o',
      '.oo..........oo.',
      '.oo..........oo.',
      '................',
    ], { o: '#303040', w: '#e8e8f0', s: '#9098a8', b: '#50a0e0', g: '#b0f0b0', d: C.woodLo, k: C.woodDk }));
  },

  drawTable(g, px, py, n) {
    const t = (c) => c === 'D';
    const L = !t(n(-1, 0));
    const R = !t(n(1, 0));
    const T = !t(n(0, -1));
    const B = !t(n(0, 1));
    g.fillStyle = C.woodDk;
    g.fillRect(px + (L ? 1 : 0), py + (T ? 2 : 0), 16 - (L ? 1 : 0) - (R ? 1 : 0), 16 - (T ? 2 : 0) - (B ? 1 : 0));
    g.fillStyle = C.wood;
    g.fillRect(px + (L ? 2 : 0), py + (T ? 3 : 0), 16 - (L ? 2 : 0) - (R ? 2 : 0), 16 - (T ? 3 : 0) - (B ? 5 : 0));
    g.fillStyle = C.woodHi;
    if (T) g.fillRect(px + (L ? 2 : 0), py + 3, 16 - (L ? 2 : 0) - (R ? 2 : 0), 1);
    if (B) {
      g.fillStyle = C.woodLo;
      g.fillRect(px + (L ? 2 : 0), py + 11, 16 - (L ? 2 : 0) - (R ? 2 : 0), 3);
      g.fillStyle = C.woodDk;
      if (L) g.fillRect(px + 2, py + 14, 2, 2);
      if (R) g.fillRect(px + 12, py + 14, 2, 2);
    }
  },

  stoolImg() {
    return this.memo('stool', () => Pix.fromRows([
      '................',
      '................',
      '................',
      '................',
      '....oooooooo....',
      '...owwwwwwwwo...',
      '...ohhhhhhhho...',
      '...owwwwwwwwo...',
      '....oddddddo....',
      '....od....do....',
      '....od....do....',
      '....oo....oo....',
    ], { o: C.woodDk, w: C.wood, h: C.woodHi, d: C.woodLo }));
  },

  plantImg() {
    return this.memo('plant', () => Pix.fromRows([
      '................',
      '......o..o......',
      '....oolo.lo.o...',
      '...olllo.olllo..',
      '..olmllooollmo..',
      '..omllmollmlmo..',
      '...ommlmmlmmo...',
      '..olmmomommlmo..',
      '...oomlmlmmoo...',
      '.....ommmmo.....',
      '....oppppppo....',
      '....opwppppo....',
      '....oppppppo....',
      '.....oppppo.....',
      '.....oooooo.....',
      '................',
    ], { o: '#204828', l: '#78c860', m: '#48a048', p: '#c07040', w: '#e0a070' }));
  },

  drawCounter(g, px, py, n, front) {
    const isC = (c) => this.def(c).counter;
    const L = !isC(n(-1, 0));
    const R = !isC(n(1, 0));
    g.fillStyle = '#383840';
    g.fillRect(px + (L ? 0 : 0), py + 2, 16, 14);
    g.fillStyle = '#f0e8e0';
    g.fillRect(px + (L ? 1 : 0), py + 3, 16 - (L ? 1 : 0) - (R ? 1 : 0), 5);
    g.fillStyle = '#ffffff';
    g.fillRect(px + (L ? 1 : 0), py + 3, 16 - (L ? 1 : 0) - (R ? 1 : 0), 1);
    g.fillStyle = front;
    g.fillRect(px + (L ? 1 : 0), py + 9, 16 - (L ? 1 : 0) - (R ? 1 : 0), 6);
    g.fillStyle = Pix.shade(front, 0.75);
    g.fillRect(px + (L ? 1 : 0), py + 13, 16 - (L ? 1 : 0) - (R ? 1 : 0), 2);
  },

  healerImg() {
    return this.memo('healer', () => Pix.fromRows([
      '..oooooooooooo..',
      '.ossssssssssss o',
      '.osoo.oo.oo.oso.',
      '.oso.o..o..o.so.',
      '.osoo.oo.oo.oso.',
      '.ossssssssssss o',
      '..oooooooooooo..',
    ], { o: '#303040', s: '#a0a8c0' }));
  },

  goodsImg(v) {
    return this.memo(`goods${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#505868';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#c8d0e0';
      g.fillRect(1, 1, 14, 14);
      const cols = [['#e05050', '#f8f8f8'], ['#50a0e0', '#f8e060'], ['#60c060', '#e070c0']][v];
      for (const sy of [2, 9]) {
        g.fillStyle = '#707888';
        g.fillRect(1, sy + 5, 14, 1);
        for (let x = 2; x < 14; x += 4) {
          g.fillStyle = cols[(x + sy) % 2];
          g.fillRect(x, sy + 1, 3, 4);
          g.fillStyle = 'rgba(255,255,255,0.5)';
          g.fillRect(x, sy + 1, 1, 1);
        }
      }
      return c;
    });
  },

  machineImg(v) {
    return this.memo(`machine${v}`, () => Pix.fromRows([
      '.oooooooooooooo.',
      '.ossssssssssss o',
      '.osbbbbbbbbbbso.',
      '.osbgbbbbgbbbso.',
      '.osbbbbgbbbbbso.',
      '.osbbbbbbbbbbso.',
      '.ossssssssssss o',
      '.oddddddddddddo.',
      v ? '.odrdgdydrdgddo.' : '.odgdydrdgdydro.',
      '.oddddddddddddo.',
      '.odkkkkkkkkkkdo.',
      '.odddddddddddd o',
      '.oddddddddddddo.',
      '.oooooooooooooo.',
      '..oo........oo..',
      '................',
    ], { o: '#303040', s: '#a0a8b8', b: '#306090', g: '#80f0a0', d: '#c8ccd8', r: '#f04848', y: '#f8d040', k: '#8890a0' }));
  },

  kitchenImg(v) {
    return this.memo(`kitchen${v}`, () => Pix.fromRows([
      '................',
      'oooooooooooooooo',
      'wwwwwwwwwwwwwwww',
      v ? 'wwssssssssswwwww' : 'wwwwwwwwwwwwwwww',
      v ? 'wwsbbbbbbbswwwww' : 'wwkkwwkkwwwwwwww',
      v ? 'wwssssssssswwwww' : 'wwkkwwkkwwwwwwww',
      'oooooooooooooooo',
      'dddddddddddddddd',
      'dhhhhhhdhhhhhhhd',
      'dhhhhhhdhhhhhhhd',
      'dhhhhhhdhhhhhhhd',
      'dhhhhqhdhqhhhhhd',
      'dhhhhhhdhhhhhhhd',
      'dddddddddddddddd',
      'oooooooooooooooo',
      '................',
    ], { o: '#484850', w: '#e8e8f0', s: '#a8b0c0', b: '#90c0e8', k: '#505058', d: C.woodDk, h: C.wood, q: C.woodHi }));
  },

  vaseImg() {
    return this.memo('vase', () => Pix.fromRows([
      '................',
      '.......r.y......',
      '......rrgyy.....',
      '.......gg.......',
      '......oggo......',
      '.....obbbbo.....',
      '....obwbbbbo....',
      '....obwbbbbo....',
      '....obbbbbbo....',
      '.....obbbbo.....',
      '......oooo......',
    ], { o: '#303050', b: '#5878d0', w: '#a8c0f0', g: '#48a048', r: '#f06060', y: '#f8d840' }));
  },

  // ---------------------------------------------------------------------
  // Buildings (drawn once, placed on the map as objects)

  buildBuildings() {
    for (const [name, spec] of Object.entries(BUILDINGS)) {
      this.buildings[name] = this.house(spec.w, spec.h, spec);
    }
  },

  // A GBA-style house: sloped shingle roof, plaster walls, windows, door.
  house(tw, th, o) {
    const W = tw * 16;
    const H = th * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    const roofH = (o.roofRows || 2) * 16 + (th >= 5 ? 8 : 0);
    const roof = o.roof;
    const roofHi = Pix.mix(roof, '#ffffff', 0.35);
    const roofLo = Pix.shade(roof, 0.72);
    const roofDk = Pix.shade(roof, 0.45);
    const wall = o.wall || '#f0e8d0';
    const wallLo = Pix.shade(wall, 0.85);
    const line = '#383040';

    // Walls.
    g.fillStyle = line;
    g.fillRect(1, roofH - 4, W - 2, H - roofH + 4);
    g.fillStyle = wall;
    g.fillRect(2, roofH - 4, W - 4, H - roofH + 3);
    g.fillStyle = wallLo;
    for (let x = 6; x < W - 4; x += 8) g.fillRect(x, roofH, 1, H - roofH - 4);
    // Foundation.
    g.fillStyle = '#a09888';
    g.fillRect(2, H - 5, W - 4, 4);
    g.fillStyle = '#c8c0b0';
    g.fillRect(2, H - 5, W - 4, 1);

    // Roof: eaves overhang by 1px each side.
    g.fillStyle = line;
    g.fillRect(0, 2, W, roofH - 1);
    g.fillRect(2, 0, W - 4, 2);
    g.fillStyle = roof;
    g.fillRect(1, 2, W - 2, roofH - 3);
    g.fillRect(3, 1, W - 6, 1);
    // Shingle rows.
    for (let y = 5; y < roofH - 3; y += 4) {
      g.fillStyle = roofLo;
      g.fillRect(1, y, W - 2, 1);
      g.fillStyle = roofHi;
      g.fillRect(1, y + 1, W - 2, 1);
      const off = (y / 4) % 2 ? 0 : 4;
      g.fillStyle = roofLo;
      for (let x = off + 1; x < W - 1; x += 8) g.fillRect(x, y + 1, 1, 3);
    }
    g.fillStyle = roofHi;
    g.fillRect(3, 2, W - 6, 2);
    g.fillStyle = roofDk;
    g.fillRect(1, roofH - 4, W - 2, 2);
    g.fillStyle = 'rgba(40,24,40,0.25)';
    g.fillRect(2, roofH - 2, W - 4, 3);
    if (!o.lab && !o.sign) {
      // Chimney.
      g.fillStyle = line;
      g.fillRect(W - 20, 0, 8, 9);
      g.fillStyle = '#b8a8a0';
      g.fillRect(W - 19, 1, 6, 7);
      g.fillStyle = '#d8d0c8';
      g.fillRect(W - 19, 1, 6, 1);
    }

    // Windows.
    const wy = roofH + 2;
    for (const wx of o.windows || []) {
      const x = Math.round(wx * 16) + 2;
      g.fillStyle = line;
      g.fillRect(x, wy, 12, 11);
      g.fillStyle = '#88c8f0';
      g.fillRect(x + 1, wy + 1, 10, 9);
      g.fillStyle = '#c8ecf8';
      g.fillRect(x + 2, wy + 2, 3, 2);
      g.fillRect(x + 2, wy + 2, 1, 4);
      g.fillStyle = line;
      g.fillRect(x + 6, wy + 1, 1, 9);
      g.fillStyle = '#a07040';
      g.fillRect(x - 1, wy + 11, 14, 2);
    }

    // Door.
    const dw = o.doubleDoor ? 20 : 12;
    const dx = Math.round(o.door * 16 + 8 - dw / 2);
    const dh = 15;
    const dy = H - dh - 1;
    g.fillStyle = line;
    g.fillRect(dx - 1, dy - 1, dw + 2, dh + 1);
    if (o.doubleDoor) {
      g.fillStyle = '#90d0f0';
      g.fillRect(dx, dy, dw, dh);
      g.fillStyle = '#d0f0f8';
      g.fillRect(dx + 1, dy + 1, 3, dh - 2);
      g.fillRect(dx + 11, dy + 1, 3, dh - 2);
      g.fillStyle = line;
      g.fillRect(dx + dw / 2, dy, 1, dh);
    } else {
      g.fillStyle = '#a06838';
      g.fillRect(dx, dy, dw, dh);
      g.fillStyle = '#c08850';
      g.fillRect(dx + 1, dy + 1, dw - 2, 5);
      g.fillRect(dx + 1, dy + 8, dw - 2, 5);
      g.fillStyle = '#f8d048';
      g.fillRect(dx + dw - 3, dy + 7, 1, 2);
    }

    if (o.sign === 'centre') {
      // Plaque with a heart-cross emblem.
      const sx = W / 2 - 22;
      g.fillStyle = line;
      g.fillRect(sx, roofH - 14, 44, 12);
      g.fillStyle = '#f8f8f8';
      g.fillRect(sx + 1, roofH - 13, 42, 10);
      Font.drawRaw(g, 'CENTRE', sx + 5, roofH - 12, '#e03838');
      // Emblem on the roof.
      g.fillStyle = '#f8f8f8';
      g.fillRect(W / 2 - 7, 5, 14, 14);
      g.fillStyle = '#e03838';
      g.fillRect(W / 2 - 2, 7, 4, 10);
      g.fillRect(W / 2 - 5, 10, 10, 4);
    }
    if (o.sign === 'mart') {
      const sx = W / 2 - 16;
      g.fillStyle = line;
      g.fillRect(sx, roofH - 14, 32, 12);
      g.fillStyle = '#f8f8f8';
      g.fillRect(sx + 1, roofH - 13, 30, 10);
      Font.drawRaw(g, 'MART', sx + 5, roofH - 12, '#3858c8');
    }
    if (o.lab) {
      // Roof vents and a satellite dish.
      g.fillStyle = line;
      g.fillRect(12, 6, 20, 8);
      g.fillStyle = '#c8d0d8';
      g.fillRect(13, 7, 18, 6);
      g.fillStyle = '#8890a0';
      for (let x = 15; x < 31; x += 3) g.fillRect(x, 8, 1, 4);
      g.fillStyle = line;
      g.fillRect(W - 28, 4, 14, 12);
      g.fillStyle = '#f8f8f8';
      g.fillRect(W - 27, 5, 12, 10);
      g.fillStyle = '#d0d8e0';
      g.fillRect(W - 24, 8, 6, 4);
    }
    return c;
  },

  // Dark doorway used for the door-opening animation.
  doorOpen() {
    return this.memo('doorOpen', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#383040';
      g.fillRect(1, 0, 14, 16);
      g.fillStyle = '#181018';
      g.fillRect(2, 1, 12, 15);
      return c;
    });
  },
};
