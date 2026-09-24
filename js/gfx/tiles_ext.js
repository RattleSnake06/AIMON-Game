'use strict';
// Tiles and buildings for the cave, the mountains, the bamboo grove,
// GRAYHAVEN CITY and its GYM.

Object.assign(TILE_DEFS, {
  '^': { name: 'cliff', solid: true },
  '%': { name: 'caveWall', solid: true },
  ';': { name: 'caveFloor', wild: true },
  'O': { name: 'boulder', solid: true },
  '*': { name: 'crystal', solid: true },
  'H': { name: 'ladderDown' },
  'A': { name: 'ladderUp' },
  'e': { name: 'caveExit' },
  'b': { name: 'bamboo', solid: true },
  'V': { name: 'stoneWall', solid: true },
  'I': { name: 'pillar', solid: true },
  'J': { name: 'statue', solid: true },
  'B': { name: 'lamp', solid: true },
  'd': { name: 'gymFloor' },
  'z': { name: 'caveGrass', grass: true },
});

Object.assign(BUILDINGS, {
  houseSlate: { w: 5, h: 4, roof: '#586878', door: 2, windows: [0.5, 3.5], wall: '#dcd8d0' },
  houseStone: { w: 4, h: 4, roof: '#7a6a5a', door: 1, windows: [2.5], wall: '#e4dcd0' },
  houseDusk: { w: 5, h: 4, roof: '#6a5a78', door: 3, windows: [0.5, 1.5], wall: '#dcd4cc' },
  gym: { w: 7, h: 6, door: 3, draw: 'gymBuilding' },
  caveMouth: { w: 3, h: 2, door: 1, draw: 'caveMouthImg' },
  seal: { w: 3, h: 3, draw: 'sealImg' },
  resonator: { w: 2, h: 2, draw: 'resonatorImg' },
});

const CAVE = {
  floor: '#a08c78', floorHi: '#b49e88', floorLo: '#8a7866',
  top: '#4a3e40', topHi: '#5a4c4e', topLo: '#3a3032',
  face: '#7a6658', faceHi: '#927c6c', faceLo: '#5c4a40', faceDk: '#382c28',
};
const ROCK = { base: '#a88c68', hi: '#c4a880', lo: '#8a7050', dk: '#5c4630', face: '#8c7050', faceLo: '#6a5238' };

Object.assign(Tiles.extra, {
  cliff(g, px, py, n, x, y, map, hash) {
    const rock = (c) => c === '^' || c === '#';
    g.fillStyle = ROCK.base;
    g.fillRect(px, py, 16, 16);
    const r = U.seeded(hash + 3);
    for (let i = 0; i < 5; i++) {
      const sx = Math.floor(r() * 13);
      const sy = Math.floor(r() * 13);
      g.fillStyle = ROCK.hi;
      g.fillRect(px + sx, py + sy, 3, 1);
      g.fillStyle = ROCK.lo;
      g.fillRect(px + sx + 1, py + sy + 1, 3, 1);
    }
    if (!rock(n(0, 1))) {
      // Vertical cliff face at the bottom edge.
      g.fillStyle = ROCK.face;
      g.fillRect(px, py + 6, 16, 10);
      g.fillStyle = ROCK.faceLo;
      for (let i = 1; i < 16; i += 4) g.fillRect(px + i + ((hash >> i) & 1), py + 8, 1, 7);
      g.fillStyle = ROCK.hi;
      g.fillRect(px, py + 6, 16, 1);
      g.fillStyle = ROCK.dk;
      g.fillRect(px, py + 15, 16, 1);
    }
    if (!rock(n(0, -1))) {
      g.fillStyle = ROCK.hi;
      g.fillRect(px, py, 16, 2);
      g.fillStyle = C.grassDk;
      g.fillRect(px, py, 16, 1);
    }
    g.fillStyle = ROCK.dk;
    if (!rock(n(-1, 0))) g.fillRect(px, py, 1, 16);
    if (!rock(n(1, 0))) g.fillRect(px + 15, py, 1, 16);
  },

  caveWall(g, px, py, n, x, y, map, hash) {
    const wall = (c) => c === '%' || c === 'x';
    g.fillStyle = CAVE.top;
    g.fillRect(px, py, 16, 16);
    const r = U.seeded(hash + 11);
    for (let i = 0; i < 4; i++) {
      g.fillStyle = CAVE.topHi;
      g.fillRect(px + Math.floor(r() * 12), py + Math.floor(r() * 12), 4, 2);
      g.fillStyle = CAVE.topLo;
      g.fillRect(px + Math.floor(r() * 13), py + Math.floor(r() * 13), 3, 1);
    }
    if (!wall(n(0, 1))) {
      g.fillStyle = CAVE.face;
      g.fillRect(px, py + 4, 16, 12);
      g.fillStyle = CAVE.faceHi;
      g.fillRect(px, py + 4, 16, 1);
      g.fillStyle = CAVE.faceLo;
      for (let i = 2; i < 16; i += 5) g.fillRect(px + i + ((hash >> i) & 1), py + 6, 1, 8);
      g.fillRect(px, py + 10, 16, 1);
      g.fillStyle = CAVE.faceDk;
      g.fillRect(px, py + 15, 16, 1);
    }
    g.fillStyle = CAVE.faceDk;
    if (!wall(n(0, -1))) g.fillRect(px, py, 16, 1);
    if (!wall(n(-1, 0))) g.fillRect(px, py, 1, 16);
    if (!wall(n(1, 0))) g.fillRect(px + 15, py, 1, 16);
  },

  caveFloor(g, px, py, n, x, y, map, hash) {
    g.drawImage(this.caveFloorImg(hash % 4), px, py);
  },

  caveGrass(g, px, py) {
    g.drawImage(this.caveFloorImg(0), px, py);
    g.drawImage(this.tallGrassImg(), px, py);
  },

  boulder(g, px, py, n, x, y, map, hash) {
    g.drawImage(this.caveFloorImg(hash % 4), px, py);
    g.drawImage(this.boulderImg(), px, py);
  },

  crystal(g, px, py, n, x, y, map, hash) {
    g.drawImage(this.caveFloorImg(hash % 4), px, py);
    g.drawImage(this.crystalImg(), px, py);
  },

  ladderDown(g, px, py) {
    g.drawImage(this.caveFloorImg(0), px, py);
    g.drawImage(this.memo('ladderDown', () => Pix.fromRows([
      '................',
      '..oooooooooooo..',
      '.okkkkkkkkkkkko.',
      '.okwkkkkkkkkwko.',
      '.okwwwwwwwwwwko.',
      '.okwkkkkkkkkwko.',
      '.okwkkkkkkkkwko.',
      '.okwwwwwwwwwwko.',
      '.okwkkkkkkkkwko.',
      '.okwkkkkkkkkwko.',
      '.okwwwwwwwwwwko.',
      '.okwkkkkkkkkwko.',
      '.okkkkkkkkkkkko.',
      '..oooooooooooo..',
      '................',
      '................',
    ], { o: CAVE.faceDk, k: '#100c10', w: '#a07848' })), px, py);
  },

  ladderUp(g, px, py) {
    g.drawImage(this.caveFloorImg(0), px, py);
    g.drawImage(this.memo('ladderUp', () => Pix.fromRows([
      '...ow......wo...',
      '...ow......wo...',
      '...owwwwwwwwo...',
      '...ow......wo...',
      '...ow......wo...',
      '...owwwwwwwwo...',
      '...ow......wo...',
      '...ow......wo...',
      '...owwwwwwwwo...',
      '...ow......wo...',
      '...ow......wo...',
      '...owwwwwwwwo...',
      '...ow......wo...',
      '...oo......oo...',
      '................',
      '................',
    ], { o: '#5a3c20', w: '#b08050' })), px, py);
  },

  caveExit(g, px, py) {
    g.drawImage(this.caveFloorImg(0), px, py);
    g.fillStyle = 'rgba(255,248,210,0.35)';
    g.fillRect(px + 2, py, 12, 16);
    g.fillStyle = 'rgba(255,248,210,0.35)';
    g.fillRect(px + 4, py + 6, 8, 10);
  },

  bamboo(g, px, py, n, x, y, map, hash) {
    g.drawImage(this.grassImg(0), px, py);
    g.drawImage(this.bambooImg(hash % 2), px, py);
  },

  stoneWall(g, px, py, n) {
    const wall = (c) => c === 'V';
    g.fillStyle = '#a8a29c';
    g.fillRect(px, py, 16, 16);
    g.fillStyle = '#88827c';
    for (let yy = 3; yy < 16; yy += 4) g.fillRect(px, py + yy, 16, 1);
    for (let row = 0; row < 4; row++) {
      const off = row % 2 ? 4 : 0;
      for (let xx = off; xx < 16; xx += 8) g.fillRect(px + xx, py + row * 4, 1, 3);
    }
    g.fillStyle = '#c4beb8';
    for (let yy = 0; yy < 16; yy += 4) g.fillRect(px, py + yy, 16, 1);
    if (!wall(n(0, -1))) {
      g.fillStyle = '#d8d4d0';
      g.fillRect(px, py, 16, 2);
      g.fillStyle = '#686260';
      g.fillRect(px, py + 2, 16, 1);
    }
    if (!wall(n(0, 1))) {
      g.fillStyle = '#585250';
      g.fillRect(px, py + 15, 16, 1);
    }
  },

  pillar(g, px, py, n, x, y, map) {
    if (map.def.outdoor) g.drawImage(this.pavingImg(), px, py);
    else this.drawFloor(g, px, py, map);
    g.drawImage(this.pillarImg(), px, py);
  },

  statue(g, px, py, n, x, y, map) {
    if (map.def.outdoor) g.drawImage(this.pavingImg(), px, py);
    else this.drawFloor(g, px, py, map);
    g.drawImage(this.statueImg(), px, py);
  },

  lamp(g, px, py, n, x, y, map) {
    g.drawImage(map.def.outdoor ? this.pavingImg() : this.woodImg(), px, py);
    g.drawImage(this.lampImg(), px, py);
  },

  gymFloor(g, px, py) {
    g.drawImage(this.gymFloorImg(), px, py);
  },
});

Object.assign(Tiles, {
  caveFloorImg(v) {
    return this.memo(`caveFloor${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = CAVE.floor;
      g.fillRect(0, 0, 16, 16);
      const r = U.seeded(40 + v);
      for (let i = 0; i < 4; i++) {
        const x = Math.floor(r() * 14);
        const y = Math.floor(r() * 14);
        g.fillStyle = CAVE.floorLo;
        g.fillRect(x, y + 1, 2, 1);
        g.fillStyle = CAVE.floorHi;
        g.fillRect(x, y, 1, 1);
      }
      return c;
    });
  },

  boulderImg() {
    return this.memo('boulder', () => {
      const p = new Painter(16, 16);
      p.ellipse(8, 13.5, 7, 2, { fill: CAVE.floorLo, line: false });
      p.ellipse(8, 8.5, 7, 6.2, { fill: '#8a7c74', line: '#3a3030', shade: '#6c5e58', hi: '#a89890' });
      p.line(5, 7, 8, 10, '#6c5e58');
      p.line(8, 10, 11, 9, '#6c5e58');
      return p.toCanvas();
    });
  },

  crystalImg() {
    return this.memo('crystal', () => Pix.fromRows([
      '................',
      '.......o........',
      '......oLo.......',
      '...o..oLVo..o...',
      '..oLo.oLVo.oLo..',
      '..oLVooLVVooLVo.',
      '..oLVVoLVVoLVVo.',
      '.ooLVVoLVVoLVVo.',
      '.oLLVVoLVVoLVDo.',
      '.oLVVDoLVDoLVDo.',
      '.oLVDDoLDDoLDDo.',
      '.ooooooooooooooo',
      '..sssssssssssss.',
      '................',
    ], { o: '#301848', L: '#e8c8ff', V: '#b070f8', D: '#6c34b8', s: 'rgba(40,20,60,0.35)' }));
  },

  bambooImg(v) {
    return this.memo(`bamboo${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      const stalk = (x, h, shade) => {
        g.fillStyle = '#2c5c24';
        g.fillRect(x - 1, 16 - h, 5, h);
        g.fillStyle = shade ? '#6ca838' : '#88c048';
        g.fillRect(x, 16 - h, 3, h);
        g.fillStyle = '#b8e070';
        g.fillRect(x, 16 - h, 1, h);
        g.fillStyle = '#386828';
        for (let y = 16 - h + 3; y < 16; y += 5) g.fillRect(x - 1, y, 5, 1);
      };
      const leaf = (x, y, dir) => {
        g.fillStyle = '#4a9838';
        g.fillRect(x, y, 4 * dir, 1);
        g.fillRect(x + dir, y - 1, 3 * dir, 1);
        g.fillStyle = '#78c050';
        g.fillRect(x + dir, y, 2 * dir, 1);
      };
      if (v) {
        stalk(2, 16, true); stalk(9, 16, false);
        leaf(6, 4, 1); leaf(8, 9, -1); leaf(13, 6, 1);
      } else {
        stalk(5, 16, false); stalk(11, 16, true);
        leaf(4, 7, -1); leaf(9, 3, 1); leaf(15, 11, -1);
      }
      return c;
    });
  },

  pillarImg() {
    return this.memo('pillar', () => Pix.fromRows([
      '.oooooooooooooo.',
      '.ohhhhhhhhhhhho.',
      '.oddddddddddddo.',
      '..ooooooooooo...',
      '...owhwwhwwsoo..',
      '...owhwwhwwso...',
      '...owhwwhwwso...',
      '...owhwwhwwso...',
      '...owhwwhwwso...',
      '...owhwwhwwso...',
      '...owhwwhwwso...',
      '...owhwwhwwso...',
      '..oooooooooooo..',
      '.ohhhhhhhhhhhho.',
      '.oddddddddddddo.',
      '..ssssssssssss..',
    ], { o: '#484440', h: '#f0ece4', w: '#dcd6ce', d: '#a8a29a', s: 'rgba(0,0,0,0.2)' }));
  },

  statueImg() {
    return this.memo('statue', () => Pix.fromRows([
      '.....oo...oo....',
      '....ohho.ohho...',
      '....ohhooohho...',
      '....ohhhhhhho...',
      '...ohhehhhehho..',
      '...ohhhhhhhhho..',
      '....ohhnnnhho...',
      '....oohhhhhoo...',
      '...ohhhhhhhhho..',
      '..ohhhhwwwhhhho.',
      '..ohhhhwwwhhhdo.',
      '..oooooooooooo..',
      '..obbbbbbbbbbo..',
      '..oBBBBBBBBBBo..',
      '..oooooooooooo..',
      '...ssssssssss...',
    ], { o: '#403c38', h: '#b8b2aa', w: '#d8d2ca', d: '#8c8680', e: '#403c38', n: '#58524c', b: '#8c8680', B: '#6c6660', s: 'rgba(0,0,0,0.2)' }));
  },

  lampImg() {
    return this.memo('lamp', () => Pix.fromRows([
      '.....oooooo.....',
      '....oyyyyyyo....',
      '....oylllyyo....',
      '....oyyyyyyo....',
      '.....oooooo.....',
      '.......oo.......',
      '.......ok.......',
      '.......ok.......',
      '.......ok.......',
      '.......ok.......',
      '.......ok.......',
      '.......ok.......',
      '......oook......',
      '.....ooooko.....',
      '.....ssssss.....',
    ], { o: '#282830', k: '#484858', y: '#f8e090', l: '#fff8d8', s: 'rgba(0,0,0,0.2)' }));
  },

  gymFloorImg() {
    return this.memo('gymFloor', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#d4d0c8';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#c4c0b8';
      g.fillRect(0, 0, 8, 8);
      g.fillRect(8, 8, 8, 8);
      g.fillStyle = '#a8a49c';
      g.fillRect(0, 15, 16, 1);
      g.fillRect(15, 0, 1, 16);
      g.fillStyle = '#e8e4dc';
      g.fillRect(0, 0, 16, 1);
      g.fillRect(0, 0, 1, 16);
      g.fillStyle = '#b8a888';
      g.fillRect(7, 7, 2, 2);
      return c;
    });
  },

  // What fills the screen beyond a map's edges.
  borderImg(ch) {
    if (ch === 'x') return null;
    return this.memo(`border${ch}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      const n = () => ch;
      if (ch === 'T') {
        g.drawImage(this.grassImg(0), 0, 0);
        g.drawImage(this.treeImg(), 0, 0);
      } else if (ch === '%') {
        this.extra.caveWall.call(this, g, 0, 0, n, 0, 0, null, 5);
      } else if (ch === '^') {
        this.extra.cliff.call(this, g, 0, 0, n, 0, 0, null, 5);
      } else if (ch === 'V') {
        this.extra.stoneWall.call(this, g, 0, 0, n);
      } else if (ch === 'b') {
        g.drawImage(this.grassImg(0), 0, 0);
        g.drawImage(this.bambooImg(0), 0, 0);
      }
      return c;
    });
  },

  // Dark cave vignette centred on the player, in stepped bands.
  darkness(level) {
    return this.memo(`dark${level}`, () => {
      // Twice the screen size, lit at the centre, so it can follow the
      // player when the camera pans.
      const W = SCREEN_W * 2;
      const H = SCREEN_H * 2;
      const c = Pix.canvas(W, H);
      const g = c.getContext('2d');
      const img = g.createImageData(W, H);
      const cx = 240;
      const cy = 160;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const d = Math.hypot(x - cx, (y - cy) * 1.15);
          const k = d < 44 ? 0 : d < 60 ? 0.35 : d < 78 ? 0.65 : d < 100 ? 0.85 : 1;
          const i = (y * W + x) * 4;
          img.data[i] = 8;
          img.data[i + 1] = 4;
          img.data[i + 2] = 16;
          img.data[i + 3] = Math.round(255 * level * k);
        }
      }
      g.putImageData(img, 0, 0);
      return c;
    });
  },

  // --- buildings ---------------------------------------------------------------

  gymBuilding(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    const line = '#302c30';
    // Stone body.
    g.fillStyle = line;
    g.fillRect(2, 34, W - 4, H - 34);
    g.fillStyle = '#d8d2c8';
    g.fillRect(3, 34, W - 6, H - 37);
    g.fillStyle = '#c0bab0';
    for (let y = 40; y < H - 8; y += 7) g.fillRect(3, y, W - 6, 1);
    for (let y = 40, row = 0; y < H - 8; y += 7, row++) {
      for (let x = 3 + (row % 2) * 8; x < W - 3; x += 16) g.fillRect(x, y, 1, 7);
    }
    // Columns.
    for (const x of [6, 26, W - 34, W - 14]) {
      g.fillStyle = line;
      g.fillRect(x - 1, 36, 10, H - 42);
      g.fillStyle = '#f4f0e8';
      g.fillRect(x, 38, 8, H - 46);
      g.fillStyle = '#d4cec4';
      g.fillRect(x + 5, 38, 2, H - 46);
      g.fillStyle = '#b4aea4';
      g.fillRect(x - 1, 36, 10, 3);
      g.fillRect(x - 1, H - 10, 10, 3);
    }
    // Roof with a pediment.
    g.fillStyle = line;
    g.fillRect(0, 12, W, 24);
    for (let y = 0; y < 14; y++) {
      const half = Math.round((y / 14) * (W / 2));
      g.fillRect(W / 2 - half, y, half * 2, 1);
    }
    g.fillStyle = '#5a6272';
    for (let y = 1; y < 14; y++) {
      const half = Math.round((y / 14) * (W / 2 - 2));
      g.fillRect(W / 2 - half, y, half * 2, 1);
    }
    g.fillRect(1, 13, W - 2, 21);
    g.fillStyle = '#7a8292';
    for (let y = 16; y < 33; y += 4) g.fillRect(1, y, W - 2, 1);
    g.fillStyle = '#3c4250';
    g.fillRect(1, 31, W - 2, 3);
    // Pediment inset with the keystone emblem.
    g.fillStyle = '#d8d2c8';
    for (let y = 5; y < 13; y++) {
      const half = Math.round(((y - 3) / 10) * 22);
      g.fillRect(W / 2 - half, y, half * 2, 1);
    }
    const kx = W / 2;
    g.fillStyle = line;
    g.fillRect(kx - 5, 6, 10, 7);
    g.fillStyle = '#f8d048';
    g.fillRect(kx - 4, 7, 8, 5);
    g.fillStyle = '#c89828';
    g.fillRect(kx - 3, 11, 6, 1);
    g.fillStyle = '#fff4b0';
    g.fillRect(kx - 3, 8, 2, 1);
    // Plaque.
    g.fillStyle = line;
    g.fillRect(kx - 15, 38, 30, 11);
    g.fillStyle = '#f0d060';
    g.fillRect(kx - 14, 39, 28, 9);
    Font.drawRaw(g, 'GYM', kx - 9, 40, '#604010');
    // Big double door.
    const dx = spec.door * 16 - 2;
    g.fillStyle = line;
    g.fillRect(dx - 1, H - 25, 22, 22);
    g.fillStyle = '#6a4830';
    g.fillRect(dx, H - 24, 20, 21);
    g.fillStyle = '#8a6040';
    g.fillRect(dx + 1, H - 23, 8, 19);
    g.fillRect(dx + 11, H - 23, 8, 19);
    g.fillStyle = '#f8d048';
    g.fillRect(dx + 8, H - 14, 1, 3);
    g.fillRect(dx + 11, H - 14, 1, 3);
    // Steps.
    g.fillStyle = '#b8b2a8';
    g.fillRect(2, H - 4, W - 4, 4);
    g.fillStyle = '#d0cac0';
    g.fillRect(2, H - 4, W - 4, 1);
    return c;
  },

  caveMouthImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    g.fillStyle = ROCK.face;
    g.fillRect(0, 0, W, H);
    g.fillStyle = ROCK.faceLo;
    for (let x = 1; x < W; x += 4) g.fillRect(x, 2, 1, H - 4);
    g.fillStyle = ROCK.hi;
    g.fillRect(0, 0, W, 1);
    // The opening.
    const hole = (inset, color) => {
      g.fillStyle = color;
      for (let y = 4 + inset; y < H; y++) {
        const t = (y - 4 - inset) / (H - 4 - inset);
        const half = Math.round((12 - inset) * Math.sqrt(Math.min(1, t * 2.2)));
        g.fillRect(W / 2 - half, y, half * 2, 1);
      }
    };
    hole(0, ROCK.dk);
    hole(2, '#1a1418');
    hole(5, '#080608');
    g.fillStyle = ROCK.dk;
    g.fillRect(0, H - 1, W, 1);
    return c;
  },

  sealImg(spec) {
    const W = spec.w * 16;
    const p = new Painter(W, W);
    const c = W / 2;
    p.ellipse(c, c + 4, 22, 14, { fill: 'rgba(0,0,0,0.25)', line: false });
    p.ellipse(c, c, 22, 16, { fill: '#8c847c', line: '#302828', shade: '#6c645c', hi: '#aca49c' });
    p.ellipse(c, c - 1, 17, 12, { fill: '#a49c94', line: '#4c4440', shade: '#8c847c' });
    // Carved rune ring.
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      p.set(c + Math.cos(a) * 13, c - 1 + Math.sin(a) * 9, '#4c4440');
      p.set(c + Math.cos(a) * 13 + 1, c - 1 + Math.sin(a) * 9, '#4c4440');
    }
    // The keystone, with a fresh crack.
    p.poly([[c - 6, c - 8], [c + 6, c - 8], [c + 4, c + 5], [c - 4, c + 5]], { fill: '#9058d8', line: '#281840', shade: '#6030a8', hi: '#c8a0f8' });
    p.line(c - 1, c - 7, c + 1, c - 2, '#f0e0ff');
    p.line(c + 1, c - 2, c - 1, c + 3, '#f0e0ff');
    return p.toCanvas();
  },

  resonatorImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    return Pix.fromRows([
      '................................',
      '...........oo.......oo..........',
      '..........ovvo.....ovvo.........',
      '...........oo.......oo..........',
      '...........om.......mo..........',
      '...........om.......mo..........',
      '......ooooooooooooooooooooo.....',
      '.....ommmmmmmmmmmmmmmmmmmmmo....',
      '.....omlllllllllllllllllllmo....',
      '.....omlkkkkkkkkkkkkkkkkklmo....',
      '.....omlkvkkkvkkkkkvkkkvklmo....',
      '.....omlkkvkvkvkkkvkvkvkklmo....',
      '.....omlkkkvkkkvkvkkkvkkklmo....',
      '.....omlkkkkkkkkvkkkkkkkklmo....',
      '.....omlllllllllllllllllllmo....',
      '.....ommmmmmmmmmmmmmmmmmmmmo....',
      '.....oddddddddddddddddddddddo...',
      '....oddcccdddcccdddcccdddcccdo..',
      '....odcvvcdddcvvcdddcvvcdddcvcdo',
      '....odcvvcdddcvvcdddcvvcdddcvcdo',
      '....oddcccdddcccdddcccdddcccddo.',
      '....oddddddddddddddddddddddddo..',
      '....oooooooooooooooooooooooooo..',
      '.....mm..................mm.....',
      '.....mm..................mm.....',
      '....oooo................oooo....',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
    ].map((r) => r.slice(0, W).padEnd(W, '.')).slice(0, H), {
      o: '#1c1c24', m: '#687080', l: '#8890a0', k: '#101018', v: '#b070f8', d: '#484c58', c: '#303038',
    });
  },
});
