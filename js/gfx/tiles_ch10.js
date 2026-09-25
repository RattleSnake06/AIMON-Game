'use strict';
// Tiles, buildings and props for chapters 10 to 12: ROUTE 7 and EMBERPEAK
// VOLCANO with TEAM DISTORTION's FORGE, the GRAND RESONATOR on the SONANCE
// TOWER's 4F, ROUTE 6 and the MARSHLAND, the MYSTIC GROVE, and STARFALL ISLE
// with its observatory.

const ASH = { base: '#5c524c', hi: '#72665e', lo: '#4a423e', dk: '#34302e', ember: '#e8702c' };
const LAVA = ['#c83818', '#e85820', '#f88828', '#f8c040', '#fff0a0'];
// The eight KEYSTONE colours, in order (as in the CONDUCTOR's scenes).
const STONE_COLS = ['#b070f8', '#78e060', '#58a0f0', '#f0b040', '#f8d870', '#e8e070', '#60c8d8', '#8858d8'];

Object.assign(TILE_DEFS, {
  // the volcano
  'à': { name: 'ash' },
  'á': { name: 'ashGrass', grass: true, over: 'ashOver' },
  'ä': { name: 'lava', solid: true, animFn: 'lavaAnim' },
  'å': { name: 'basalt', solid: true },
  'ç': { name: 'vent', solid: true, animFn: 'ventAnim' },
  'ï': { name: 'pipe', solid: true },
  // the FORGE
  'ð': { name: 'grating' },
  'ñ': { name: 'catwalk' },
  'ò': { name: 'heatPump', solid: true, animFn: 'pumpAnim' },
  // the GRAND RESONATOR
  'ô': { name: 'organPipes', solid: true },
  'ö': { name: 'songTank', solid: true, animFn: 'tankAnim' },
  'ù': { name: 'cables' },
  // the marsh
  'ú': { name: 'mud' },
  'û': { name: 'reeds', grass: true, over: 'reedOver' },
  'ü': { name: 'deadTree', solid: true },
  // the grove
  '£': { name: 'standingStone', solid: true, animFn: 'stoneAnim' },
  '¥': { name: 'glowFlowers', animFn: 'glowAnim' },
  // STARFALL ISLE
  '§': { name: 'starShard', solid: true, animFn: 'shardAnim' },
  '©': { name: 'starFloor' },
  '®': { name: 'starChart', solid: true },
});

Object.assign(BUILDINGS, {
  forgeGate: { w: 4, h: 3, door: 2, draw: 'forgeGateImg' },
  grandForge: { w: 5, h: 3, draw: 'grandForgeImg' },
  grandResonator: { w: 7, h: 4, draw: 'grandResonatorImg' },
  vaultOpen: { w: 2, h: 2, draw: 'vaultOpenImg' },
  marshHut: { w: 4, h: 4, roof: '#8a7440', wall: '#d8c8a0', door: 1, windows: [2.5] },
  groveAltar: { w: 3, h: 2, draw: 'groveAltarImg' },
  observatory: { w: 7, h: 7, door: 3, draw: 'observatoryImg' },
  telescope: { w: 3, h: 3, draw: 'telescopeImg' },
  starstone: { w: 2, h: 2, draw: 'starstoneImg' },
  houseStar1: { w: 4, h: 4, roof: '#2c3c70', wall: '#e8e4f0', door: 1, windows: [2.5] },
  houseStar2: { w: 5, h: 4, roof: '#3a6070', wall: '#e4ecf0', door: 2, windows: [0.5, 3.5] },
  hotSpring: { w: 5, h: 4, roof: '#8a3c30', wall: '#e8dcc8', door: 2, windows: [0.5, 3.5] },
});

Object.assign(WALL_THEMES, {
  forge: { wall: '#4a3a34', lo: '#3c2e2a', dk: '#221816', rim: '#e8702c', hi: '#62504a', base: '#2e2220', baseDk: '#140c0a' },
  resonator: { wall: '#2e2440', lo: '#261e36', dk: '#140f20', rim: '#d0b060', hi: '#443660', base: '#1e182c', baseDk: '#0c0a14' },
  observatory: { wall: '#28305a', lo: '#20284c', dk: '#10142a', rim: '#c8d0f0', hi: '#3a4478', base: '#1a2040', baseDk: '#0a0c1c' },
});

Object.assign(Tiles.floors, {
  'ð'() { return this.gratingImg(); },
  '©'() { return this.starFloorImg(0); },
});

Object.assign(Tiles.extra, {
  ash(g, px, py, n, x, y, map, hash) { g.drawImage(this.ashImg(hash % 5 === 0 ? 1 : hash % 7 === 0 ? 2 : 0), px, py); },
  ashGrass(g, px, py) { g.drawImage(this.ashGrassImg(), px, py); },
  lava(g, px, py) { g.drawImage(this.lavaImg(0, 0), px, py); },
  basalt(g, px, py, n, x, y, map, hash) {
    g.drawImage(this.groundCh10(map, n), px, py);
    g.drawImage(this.basaltImg(hash % 2), px, py);
  },
  vent(g, px, py, n, x, y, map) { g.drawImage(this.groundCh10(map, n), px, py); },
  pipe(g, px, py, n, x, y, map) {
    g.drawImage(this.groundCh10(map, n), px, py);
    const p = (dx, dy) => n(dx, dy) === 'ï';
    g.drawImage(this.pipeImg((p(0, -1) ? 1 : 0) | (p(1, 0) ? 2 : 0) | (p(0, 1) ? 4 : 0) | (p(-1, 0) ? 8 : 0)), px, py);
  },
  grating(g, px, py) { g.drawImage(this.gratingImg(), px, py); },
  catwalk(g, px, py, n) {
    const w = (dx, dy) => { const c = n(dx, dy); return c === 'ñ' || c === 'ð' || c === 'M' || c === 'U' || c === 'e'; };
    g.drawImage(this.catwalkImg((w(0, -1) ? 1 : 0) | (w(1, 0) ? 2 : 0) | (w(0, 1) ? 4 : 0) | (w(-1, 0) ? 8 : 0)), px, py);
  },
  heatPump(g, px, py, n, x, y, map) { this.drawFloor(g, px, py, map); },
  organPipes(g, px, py, n, x, y) { g.drawImage(this.organPipesImg(x % 3), px, py); },
  songTank(g, px, py, n, x, y, map) { this.drawFloor(g, px, py, map); },
  cables(g, px, py, n, x, y, map, hash) {
    this.drawFloor(g, px, py, map);
    g.drawImage(this.cablesImg(hash % 3), px, py);
  },
  mud(g, px, py, n, x, y, map, hash) { g.drawImage(this.mudImg(hash % 4 === 0 ? 1 : 0), px, py); },
  reeds(g, px, py) { g.drawImage(this.reedsImg(), px, py); },
  deadTree(g, px, py, n, x, y, map) {
    g.drawImage(this.groundCh10(map, n), px, py);
    g.drawImage(this.deadTreeImg(map.def.ground === 'à'), px, py);
  },
  standingStone(g, px, py, n, x, y, map) { g.drawImage(this.groundCh10(map, n), px, py); },
  glowFlowers(g, px, py) { g.drawImage(this.grassImg(0), px, py); },
  starShard(g, px, py, n, x, y, map) { g.drawImage(this.groundCh10(map, n), px, py); },
  starFloor(g, px, py, n, x, y, map, hash) { g.drawImage(this.starFloorImg(hash % 5), px, py); },
  starChart(g, px, py, n, x, y) { g.drawImage(this.starChartImg(x % 2), px, py); },
});

Object.assign(Tiles, {
  // What lies under a prop: ash, mud, sand or grass (or the room's floor).
  groundCh10(map, n) {
    if (!map.def.outdoor) {
      const f = map.floor;
      return this.floors[f] ? this.floors[f].call(this) : this.woodImg();
    }
    if (map.def.ground === 'à') return this.ashImg(0);
    const around = [n(0, 1), n(0, -1), n(-1, 0), n(1, 0)];
    if (around.filter((c) => c === 'ú').length >= 2) return this.mudImg(0);
    if (around.filter((c) => c === 'a').length >= 2) return this.sandImg ? this.sandImg(0) : this.grassImg(0);
    return this.grassImg(0);
  },

  // ------------------------------------------------------------ the volcano
  ashImg(v) {
    return this.memo(`ash${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = ASH.base;
      g.fillRect(0, 0, 16, 16);
      const r = U.seeded(1000 + v);
      for (let i = 0; i < 14; i++) {
        g.fillStyle = i % 3 ? ASH.lo : ASH.hi;
        g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 1 + (i % 2), 1);
      }
      if (v === 1) {
        // A glowing ember in the cinders.
        g.fillStyle = '#301c14';
        g.fillRect(6, 8, 4, 2);
        g.fillStyle = ASH.ember;
        g.fillRect(7, 8, 2, 1);
      } else if (v === 2) {
        g.fillStyle = ASH.dk;
        g.fillRect(3, 11, 6, 1); g.fillRect(8, 10, 3, 1);
      }
      return c;
    });
  },

  ashGrassImg() {
    return this.memo('ashGrass', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.ashImg(0), 0, 0);
      g.drawImage(this.ashOverImg(), 0, 0);
      return c;
    });
  },

  // Scorched, wiry brush: drawn over whoever stands in it.
  ashOverImg() {
    return this.memo('ashOver', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      for (const [x, h, col] of [[1, 7, '#8a5a30'], [4, 9, '#b0702c'], [7, 6, '#7a4a28'], [10, 9, '#c88034'], [13, 7, '#8a5a30']]) {
        g.fillStyle = '#2a1a12';
        g.fillRect(x, 16 - h, 2, h);
        g.fillStyle = col;
        g.fillRect(x, 16 - h, 1, h - 1);
        g.fillRect(x + (x % 2 ? 1 : -1), 16 - h + 2, 1, 2);
      }
      g.fillStyle = '#e8a040';
      g.fillRect(4, 7, 1, 1); g.fillRect(10, 7, 1, 1);
      return c;
    });
  },

  lavaImg(f, mask) {
    return this.memo(`lava${f}_${mask}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = LAVA[1];
      g.fillRect(0, 0, 16, 16);
      // Bright veins drifting slowly.
      const veins = [[2, 3], [9, 1], [5, 8], [12, 10], [1, 13], [8, 14]];
      veins.forEach(([x, y], i) => {
        const xx = (x + f + i) % 16;
        g.fillStyle = LAVA[2];
        g.fillRect(xx, y, 4, 2);
        g.fillStyle = LAVA[3];
        g.fillRect(xx + 1, y, 2, 1);
        if (i % 2 === f % 2) { g.fillStyle = LAVA[4]; g.fillRect(xx + 1, y, 1, 1); }
      });
      g.fillStyle = LAVA[0];
      g.fillRect((f * 3) % 14, 6, 3, 1); g.fillRect((f * 5 + 7) % 14, 12, 2, 1);
      // A dark cooled crust along any edge that meets rock.
      g.fillStyle = '#3a2018';
      if (mask & 1) g.fillRect(0, 0, 16, 2);
      if (mask & 2) g.fillRect(14, 0, 2, 16);
      if (mask & 4) g.fillRect(0, 14, 16, 2);
      if (mask & 8) g.fillRect(0, 0, 2, 16);
      g.fillStyle = '#7a3018';
      if (mask & 1) g.fillRect(0, 2, 16, 1);
      if (mask & 2) g.fillRect(13, 0, 1, 16);
      if (mask & 4) g.fillRect(0, 13, 16, 1);
      if (mask & 8) g.fillRect(2, 0, 1, 16);
      return c;
    });
  },

  lavaAnim(g, a, sx, sy, frame) {
    g.drawImage(this.lavaImg(Math.floor(frame / 14) % 4, a.mask || 0), sx, sy);
  },

  basaltImg(v) {
    return this.memo(`basalt${v}`, () => {
      const p = new Painter(16, 16);
      p.ellipse(8, 14, 7, 2, { fill: 'rgba(0,0,0,0.25)', line: false });
      p.poly(v ? [[2, 14], [3, 6], [7, 2], [12, 3], [14, 9], [13, 14]] : [[1, 14], [2, 8], [5, 4], [11, 4], [15, 9], [14, 14]],
        { fill: '#3a3434', shade: '#262222', hi: '#5a5250', line: '#141010' });
      const c = p.toCanvas();
      const g = c.getContext('2d');
      g.fillStyle = '#c85020';
      g.fillRect(6, 9, 1, 3); g.fillRect(7, 11, 2, 1);
      g.fillStyle = '#f09040';
      g.fillRect(6, 10, 1, 1);
      return c;
    });
  },

  ventAnim(g, a, sx, sy, frame) {
    g.drawImage(this.ventImg(Math.floor(frame / 10) % 4), sx, sy);
  },

  ventImg(f) {
    return this.memo(`vent${f}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.ashImg(0), 0, 0);
      g.fillStyle = '#1c1210';
      g.fillRect(4, 11, 8, 3);
      g.fillStyle = LAVA[2];
      g.fillRect(6, 12, 4, 1);
      // Puffs of steam rising.
      g.fillStyle = 'rgba(236,232,228,0.75)';
      for (let i = 0; i < 3; i++) {
        const y = 10 - ((f * 3 + i * 4) % 11);
        const w = 3 + ((f + i) % 3);
        g.fillRect(8 - Math.floor(w / 2) + ((i + f) % 3) - 1, y, w, 2);
      }
      return c;
    });
  },

  // TEAM DISTORTION's heat pipes: grey metal with violet bands.
  pipeImg(mask) {
    return this.memo(`pipe${mask}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      const horiz = (mask & 10) || !(mask & 5);
      const seg = (x, y, w, h) => {
        g.fillStyle = '#202028'; g.fillRect(x, y, w, h);
        g.fillStyle = '#6a6e7c'; g.fillRect(x + 1, y + 1, w - 2, h - 2);
        g.fillStyle = '#9ea2b0';
        if (w > h) g.fillRect(x + 1, y + 1, w - 2, 1); else g.fillRect(x + 1, y + 1, 1, h - 2);
      };
      if (horiz || (mask & 10)) seg(mask & 8 ? 0 : 3, 4, (mask & 2 ? 16 : 13) - (mask & 8 ? 0 : 3), 8);
      if (mask & 5) seg(4, mask & 1 ? 0 : 3, 8, (mask & 4 ? 16 : 13) - (mask & 1 ? 0 : 3));
      g.fillStyle = '#8050d8';
      if (horiz) g.fillRect(7, 4, 2, 8); else g.fillRect(4, 7, 8, 2);
      return c;
    });
  },

  // A charred or long-dead tree.
  deadTreeImg(charred) {
    return this.memo(`deadTree${charred ? 1 : 0}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      const dark = charred ? '#1c1614' : '#3a342c';
      const mid = charred ? '#3a302c' : '#6a6050';
      g.fillStyle = 'rgba(0,0,0,0.2)';
      g.fillRect(4, 14, 9, 2);
      g.fillStyle = dark;
      g.fillRect(7, 5, 3, 10);
      g.fillRect(3, 4, 2, 5); g.fillRect(4, 8, 4, 2);
      g.fillRect(11, 2, 2, 5); g.fillRect(9, 6, 3, 2);
      g.fillRect(6, 1, 2, 5);
      g.fillStyle = mid;
      g.fillRect(8, 6, 1, 8); g.fillRect(3, 5, 1, 3); g.fillRect(11, 3, 1, 3); g.fillRect(6, 2, 1, 3);
      if (charred) {
        g.fillStyle = ASH.ember;
        g.fillRect(8, 11, 1, 1);
      }
      return c;
    });
  },

  // ------------------------------------------------------------ the FORGE
  gratingImg() {
    return this.memo('grating', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#2a2220';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#6a3018';
      for (let y = 2; y < 16; y += 4) for (let x = 2; x < 16; x += 4) g.fillRect(x, y, 2, 2);
      g.fillStyle = '#e06828';
      g.fillRect(6, 6, 1, 1); g.fillRect(14, 10, 1, 1);
      g.fillStyle = '#4a3e3a';
      g.fillRect(0, 0, 16, 1); g.fillRect(0, 0, 1, 16);
      return c;
    });
  },

  catwalkImg(mask) {
    return this.memo(`catwalk${mask}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.lavaImg(0, 0), 0, 0);
      const x0 = mask & 8 ? 0 : 2;
      const x1 = mask & 2 ? 16 : 14;
      const y0 = mask & 1 ? 0 : 2;
      const y1 = mask & 4 ? 16 : 14;
      g.fillStyle = '#1c1818';
      g.fillRect(x0, y0, x1 - x0, y1 - y0);
      g.fillStyle = '#6a6470';
      g.fillRect(x0 + 1, y0 + 1, x1 - x0 - 2, y1 - y0 - 2);
      g.fillStyle = '#8a8490';
      const vert = (mask & 5) === 5 || ((mask & 5) && !(mask & 10));
      if (vert) for (let y = y0 + 2; y < y1; y += 3) g.fillRect(x0 + 1, y, x1 - x0 - 2, 1);
      else for (let x = x0 + 2; x < x1; x += 3) g.fillRect(x, y0 + 1, 1, y1 - y0 - 2);
      // Railings on the open sides.
      g.fillStyle = '#e8c040';
      if (!(mask & 1)) g.fillRect(x0, y0, x1 - x0, 1);
      if (!(mask & 4)) g.fillRect(x0, y1 - 1, x1 - x0, 1);
      if (!(mask & 8)) g.fillRect(x0, y0, 1, y1 - y0);
      if (!(mask & 2)) g.fillRect(x1 - 1, y0, 1, y1 - y0);
      return c;
    });
  },

  pumpAnim(g, a, sx, sy, frame) {
    const off = OW.map && State.flag(`pumps_off`);
    g.drawImage(this.heatPumpImg(off ? -1 : Math.floor(frame / 4) % 3), sx, sy);
  },

  heatPumpImg(f) {
    return this.memo(`pump${f}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.gratingImg(), 0, 0);
      const p = new Painter(16, 16);
      p.rrect(1, 1, 14, 14, 2, { fill: '#5a4a44', shade: '#3a2e2a', hi: '#7a6660', line: '#141010' });
      p.ellipse(8, 7, 5, 5, { fill: '#241a18', line: '#141010' });
      g.drawImage(p.toCanvas(), 0, 0);
      if (f >= 0) {
        g.fillStyle = '#c8c0c0';
        const blades = [[[8, 3], [8, 11]], [[4, 7], [12, 7]], [[5, 4], [11, 10]]][f];
        g.fillRect(blades[0][0], blades[0][1], 1, 1);
        for (let t = 0; t <= 8; t++) {
          g.fillRect(Math.round(blades[0][0] + (blades[1][0] - blades[0][0]) * t / 8), Math.round(blades[0][1] + (blades[1][1] - blades[0][1]) * t / 8), 1, 1);
        }
        g.fillStyle = LAVA[2];
        g.fillRect(3, 13, 10, 1);
      } else {
        g.fillStyle = '#4a4a50';
        g.fillRect(5, 7, 7, 1);
        g.fillStyle = '#3070c0';
        g.fillRect(3, 13, 10, 1);
      }
      return c;
    });
  },

  // ------------------------------------------------------------ the GRAND RESONATOR
  organPipesImg(v) {
    return this.memo(`organ${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#140f20';
      g.fillRect(0, 0, 16, 16);
      const heights = [[2, 0], [6, 3], [10, 1], [14, 4]];
      for (const [x, top] of heights) {
        const t = (top + v * 2) % 5;
        g.fillStyle = '#6a5020';
        g.fillRect(x - 2, t, 4, 16 - t);
        g.fillStyle = '#d0b060';
        g.fillRect(x - 1, t, 2, 16 - t);
        g.fillStyle = '#f8e8a0';
        g.fillRect(x - 1, t, 1, 16 - t);
        g.fillStyle = '#1c1428';
        g.fillRect(x - 1, t + 4, 2, 2);
      }
      return c;
    });
  },

  tankAnim(g, a, sx, sy, frame) {
    g.drawImage(this.songTankImg(a.x % 8, Math.floor(frame / 9) % 4), sx, sy);
  },

  songTankImg(i, f) {
    return this.memo(`stank${i}_${f}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#2a2436';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#101018';
      g.fillRect(2, 0, 12, 16);
      g.fillStyle = '#9098a8';
      g.fillRect(2, 0, 12, 2); g.fillRect(2, 14, 12, 2);
      const col = STONE_COLS[i];
      g.fillStyle = col;
      g.globalAlpha = 0.85;
      g.fillRect(4, 4, 8, 10);
      g.globalAlpha = 1;
      g.fillStyle = '#ffffff';
      g.globalAlpha = 0.7;
      for (let k = 0; k < 3; k++) g.fillRect(5 + k * 2, 12 - ((f * 3 + k * 4) % 8), 1, 1);
      g.globalAlpha = 0.35;
      g.fillRect(4, 4, 1, 10);
      g.globalAlpha = 1;
      return c;
    });
  },

  cablesImg(v) {
    return this.memo(`cables${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.strokeStyle = '#141018';
      g.lineWidth = 2;
      g.beginPath();
      if (v === 0) { g.moveTo(0, 5); g.quadraticCurveTo(8, 12, 16, 7); } else if (v === 1) { g.moveTo(4, 0); g.quadraticCurveTo(11, 8, 6, 16); } else { g.moveTo(0, 11); g.quadraticCurveTo(7, 3, 16, 12); }
      g.stroke();
      g.strokeStyle = '#8050d8';
      g.lineWidth = 1;
      g.beginPath();
      if (v === 0) { g.moveTo(0, 4); g.quadraticCurveTo(8, 11, 16, 6); } else if (v === 1) { g.moveTo(3, 0); g.quadraticCurveTo(10, 8, 5, 16); } else { g.moveTo(0, 10); g.quadraticCurveTo(7, 2, 16, 11); }
      g.stroke();
      return c;
    });
  },

  // ------------------------------------------------------------ the marsh
  mudImg(v) {
    return this.memo(`mud${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#6a5a3a';
      g.fillRect(0, 0, 16, 16);
      const r = U.seeded(1100 + v);
      for (let i = 0; i < 10; i++) {
        g.fillStyle = i % 2 ? '#5a4c30' : '#7c6c48';
        g.fillRect(Math.floor(r() * 14), Math.floor(r() * 15), 2, 1);
      }
      if (v) {
        g.fillStyle = '#4a5a58';
        g.fillRect(4, 6, 7, 3); g.fillRect(5, 5, 5, 5);
        g.fillStyle = '#8aa0a0';
        g.fillRect(5, 6, 2, 1);
      }
      return c;
    });
  },

  reedsImg() {
    return this.memo('reeds', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.mudImg(0), 0, 0);
      g.drawImage(this.reedOverImg(), 0, 0);
      return c;
    });
  },

  reedOverImg() {
    return this.memo('reedOver', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      for (const [x, h] of [[1, 10], [4, 13], [7, 9], [10, 14], [13, 11]]) {
        g.fillStyle = '#2c4a24';
        g.fillRect(x, 16 - h, 2, h);
        g.fillStyle = '#6a9a48';
        g.fillRect(x, 16 - h, 1, h);
        g.fillStyle = '#6a4a28';
        g.fillRect(x, 16 - h - 3, 2, 3);
        g.fillStyle = '#9a7040';
        g.fillRect(x, 16 - h - 3, 1, 2);
      }
      return c;
    });
  },

  // ------------------------------------------------------------ the grove
  stoneAnim(g, a, sx, sy, frame) {
    g.drawImage(this.standingStoneImg(Math.floor(frame / 12) % 6), sx, sy);
  },

  standingStoneImg(f) {
    return this.memo(`sstone${f}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.grassImg(0), 0, 0);
      const p = new Painter(16, 16);
      p.ellipse(8, 14, 6, 2, { fill: 'rgba(0,0,0,0.3)', line: false });
      p.poly([[3, 15], [4, 3], [8, 0], [12, 3], [13, 15]], { fill: '#7a8078', shade: '#5a605a', hi: '#9aa098', line: '#282c28' });
      g.drawImage(p.toCanvas(), 0, 0);
      // Runes that pulse with a soft teal light.
      const glow = [0.35, 0.6, 0.9, 1, 0.9, 0.6][f];
      g.globalAlpha = glow;
      g.fillStyle = '#80f0e0';
      g.fillRect(7, 4, 2, 1); g.fillRect(6, 6, 1, 3); g.fillRect(9, 6, 1, 3); g.fillRect(7, 10, 2, 1); g.fillRect(8, 12, 1, 2);
      g.globalAlpha = glow * 0.35;
      g.fillRect(5, 3, 6, 11);
      g.globalAlpha = 1;
      return c;
    });
  },

  glowAnim(g, a, sx, sy, frame) {
    g.drawImage(this.glowFlowersImg((Math.floor(frame / 16) + a.x + a.y) % 3), sx, sy);
  },

  glowFlowersImg(f) {
    return this.memo(`glowf${f}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.grassImg(0), 0, 0);
      const spots = [[3, 4], [11, 3], [7, 9], [2, 12], [12, 12]];
      spots.forEach(([x, y], i) => {
        const on = (i + f) % 3 !== 0;
        g.fillStyle = '#2a6a58';
        g.fillRect(x, y + 1, 1, 2);
        g.fillStyle = on ? '#b0fff0' : '#60c8c0';
        g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3);
        if (on) { g.fillStyle = '#ffffff'; g.fillRect(x, y, 1, 1); }
      });
      return c;
    });
  },

  // ------------------------------------------------------------ STARFALL ISLE
  shardAnim(g, a, sx, sy, frame) {
    g.drawImage(this.starShardImg(a.ground || 0, (Math.floor(frame / 10) + a.x) % 4), sx, sy);
  },

  starShardImg(ground, f) {
    return this.memo(`shard${ground}${f}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(ground === 1 && this.sandImg ? this.sandImg(0) : this.grassImg(0), 0, 0);
      const p = new Painter(16, 16);
      p.ellipse(8, 14, 5, 2, { fill: 'rgba(0,0,0,0.25)', line: false });
      p.poly([[5, 14], [4, 7], [8, 1], [11, 6], [12, 14]], { fill: '#8868d0', shade: '#5a40a0', hi: '#d8c8ff', line: '#20183c' });
      p.poly([[9, 14], [10, 9], [13, 7], [14, 14]], { fill: '#6a50b8', shade: '#48348a', hi: '#b8a0f0', line: '#20183c' });
      g.drawImage(p.toCanvas(), 0, 0);
      g.fillStyle = '#ffffff';
      const tw = [[7, 4], [9, 8], [6, 10], [12, 10]][f];
      g.fillRect(tw[0], tw[1], 1, 1);
      g.globalAlpha = 0.6;
      g.fillRect(tw[0] - 1, tw[1], 3, 1); g.fillRect(tw[0], tw[1] - 1, 1, 3);
      g.globalAlpha = 1;
      return c;
    });
  },

  starFloorImg(v) {
    return this.memo(`starFloor${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#1c2244';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#242c54';
      g.fillRect(0, 0, 16, 1); g.fillRect(0, 0, 1, 16);
      if (v === 1) { g.fillStyle = '#e8e0a0'; g.fillRect(7, 7, 1, 1); g.fillStyle = '#8a86a0'; g.fillRect(6, 7, 3, 1); g.fillRect(7, 6, 1, 3); }
      if (v === 2) { g.fillStyle = '#c8c8e8'; g.fillRect(4, 11, 1, 1); g.fillRect(12, 4, 1, 1); }
      return c;
    });
  },

  starChartImg(v) {
    return this.memo(`chart${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.wallImg('observatory'), 0, 0);
      g.fillStyle = '#c8d0f0';
      g.fillRect(1, 2, 14, 11);
      g.fillStyle = '#0e1430';
      g.fillRect(2, 3, 12, 9);
      g.fillStyle = '#f8f0c0';
      const stars = v ? [[4, 5], [7, 4], [10, 6], [12, 9], [6, 9]] : [[3, 9], [5, 6], [8, 7], [11, 4], [12, 8]];
      for (const [x, y] of stars) g.fillRect(x, y, 1, 1);
      g.fillStyle = '#6a78b8';
      for (let i = 1; i < stars.length; i++) {
        const [ax, ay] = stars[i - 1];
        const [bx, by] = stars[i];
        for (let t = 1; t < 4; t++) g.fillRect(Math.round(ax + (bx - ax) * t / 4), Math.round(ay + (by - ay) * t / 4), 1, 1);
      }
      return c;
    });
  },

  // ------------------------------------------------------------ buildings
  forgeGateImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    // Rough basalt around a steel blast door.
    const p = new Painter(W, H);
    p.poly([[0, H], [2, 12], [10, 3], [24, 0], [42, 2], [56, 6], [W - 1, 16], [W, H]], { fill: '#3a3434', shade: '#262222', hi: '#544c4a', line: '#141010' });
    g.drawImage(p.toCanvas(), 0, 0);
    g.fillStyle = '#141010';
    g.fillRect(W / 2 - 13, 12, 26, H - 12);
    g.fillStyle = '#5a5a66';
    g.fillRect(W / 2 - 12, 13, 24, H - 13);
    g.fillStyle = '#44444e';
    g.fillRect(W / 2 - 1, 13, 2, H - 13);
    for (let y = 18; y < H - 2; y += 6) {
      g.fillStyle = '#e8c040';
      g.fillRect(W / 2 - 11, y, 9, 2);
      g.fillStyle = '#202020';
      g.fillRect(W / 2 - 8, y, 3, 2);
      g.fillStyle = '#e8c040';
      g.fillRect(W / 2 + 2, y, 9, 2);
      g.fillStyle = '#202020';
      g.fillRect(W / 2 + 5, y, 3, 2);
    }
    // TEAM DISTORTION's broken wave.
    g.fillStyle = '#a060e8';
    const wave = [[-9, 7], [-6, 5], [-3, 7], [0, 9], [3, 7], [6, 5], [9, 7]];
    for (const [dx, y] of wave) g.fillRect(W / 2 + dx, y, 3, 2);
    // Glow leaking under the door.
    g.fillStyle = LAVA[2];
    g.fillRect(W / 2 - 12, H - 2, 24, 1);
    return c;
  },

  grandForgeImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    const p = new Painter(W, H);
    p.rrect(2, 10, W - 4, H - 12, 3, { fill: '#4a4448', shade: '#302c30', hi: '#6a6468', line: '#141010' });
    p.rrect(W / 2 - 14, 0, 28, 20, 4, { fill: '#5a5458', shade: '#3a3438', hi: '#7a7478', line: '#141010' });
    g.drawImage(p.toCanvas(), 0, 0);
    // A crucible of magma at its heart.
    g.fillStyle = '#141010';
    g.fillRect(W / 2 - 10, 4, 20, 12);
    g.fillStyle = LAVA[2];
    g.fillRect(W / 2 - 9, 5, 18, 10);
    g.fillStyle = LAVA[3];
    g.fillRect(W / 2 - 6, 7, 12, 4);
    g.fillStyle = LAVA[4];
    g.fillRect(W / 2 - 2, 8, 4, 2);
    // Gauges and the violet band.
    for (const x of [10, W - 18]) {
      g.fillStyle = '#e8e0d0';
      g.fillRect(x, 22, 8, 8);
      g.fillStyle = '#c83818';
      g.fillRect(x + 4, 25, 3, 1);
    }
    g.fillStyle = '#8050d8';
    g.fillRect(4, H - 10, W - 8, 2);
    return c;
  },

  grandResonatorImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    // Rows of great pipes rising behind a curved console.
    const pipes = [[6, 30], [16, 18], [26, 8], [36, 2], [46, 0], [56, 2], [66, 8], [76, 18], [86, 30], [96, 36], [104, 40]];
    for (const [x, top] of pipes) {
      if (x > W - 8) continue;
      g.fillStyle = '#3a2c18';
      g.fillRect(x - 4, top, 8, H - top - 18);
      g.fillStyle = '#d0b060';
      g.fillRect(x - 3, top, 6, H - top - 18);
      g.fillStyle = '#f8e8a0';
      g.fillRect(x - 2, top, 2, H - top - 18);
      g.fillStyle = '#1c1428';
      g.fillRect(x - 3, top + 6, 6, 2);
    }
    // The violet heart.
    g.fillStyle = 'rgba(176,112,248,0.35)';
    g.beginPath(); g.arc(W / 2, H - 30, 22, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#b070f8';
    g.beginPath(); g.arc(W / 2, H - 30, 9, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#f0e0ff';
    g.beginPath(); g.arc(W / 2, H - 30, 4, 0, Math.PI * 2); g.fill();
    // Console.
    const p = new Painter(W, 20);
    p.rrect(4, 2, W - 8, 17, 4, { fill: '#2e2440', shade: '#1c1628', hi: '#4a3c68', line: '#0c0a14' });
    const cv = p.toCanvas();
    g.drawImage(cv, 0, H - 20);
    for (let i = 0; i < 8; i++) {
      g.fillStyle = STONE_COLS[i];
      g.fillRect(12 + i * ((W - 24) / 8), H - 13, 6, 4);
    }
    return c;
  },

  vaultOpenImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    g.fillStyle = '#101018';
    g.fillRect(1, 1, W - 2, H - 1);
    g.fillStyle = '#4a4458';
    g.fillRect(1, 1, 3, H - 1); g.fillRect(W - 4, 1, 3, H - 1);
    // Stairs up, lit violet from above.
    for (let i = 0; i < 5; i++) {
      g.fillStyle = i % 2 ? '#2c2440' : '#3c3058';
      g.fillRect(5, 4 + i * 5, W - 10, 5);
    }
    g.fillStyle = 'rgba(176,112,248,0.5)';
    g.fillRect(5, 3, W - 10, 3);
    g.fillStyle = '#40d060';
    g.fillRect(W - 8, 13, 4, 2);
    return c;
  },

  groveAltarImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const p = new Painter(W, H);
    p.ellipse(W / 2, H - 4, W / 2 - 2, 4, { fill: 'rgba(0,0,0,0.3)', line: false });
    p.rrect(3, 6, W - 6, H - 9, 3, { fill: '#8a9088', shade: '#6a706a', hi: '#aab0a8', line: '#282c28' });
    p.rrect(6, 2, W - 12, 8, 2, { fill: '#9aa098', shade: '#7a807a', hi: '#bac0b8', line: '#282c28' });
    const c = p.toCanvas();
    const g = c.getContext('2d');
    // The carved final verse: eight marks and a ninth, larger, last.
    g.fillStyle = '#80f0e0';
    for (let i = 0; i < 8; i++) g.fillRect(9 + i * 3, 15, 2, 3);
    g.fillRect(W - 12, 13, 3, 6);
    g.globalAlpha = 0.35;
    g.fillRect(7, 12, W - 14, 9);
    g.globalAlpha = 1;
    return c;
  },

  observatoryImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    const k = WALL_THEMES.observatory;
    // Stone drum.
    g.fillStyle = '#383c50';
    g.fillRect(6, 50, W - 12, H - 50);
    g.fillStyle = '#e4e2ec';
    g.fillRect(7, 51, W - 14, H - 51);
    g.fillStyle = '#c8c6d4';
    for (let y = 58; y < H; y += 8) g.fillRect(7, y, W - 14, 1);
    // The silver dome with its open slit.
    const p = new Painter(W, 60);
    p.ellipse(W / 2, 52, W / 2 - 4, 46, { fill: '#b8c0d8', shade: '#8890b0', hi: '#e8ecf8', line: '#282c40' });
    g.drawImage(p.toCanvas(), 0, 0);
    g.fillStyle = '#383c50';
    g.fillRect(4, 50, W - 8, 4);
    g.fillStyle = '#0e1430';
    g.fillRect(W / 2 - 5, 8, 10, 42);
    g.fillStyle = '#f8f0c0';
    g.fillRect(W / 2 - 2, 14, 1, 1); g.fillRect(W / 2 + 2, 24, 1, 1); g.fillRect(W / 2 - 1, 36, 1, 1);
    // Telescope poking out.
    g.fillStyle = '#282c40';
    g.save(); g.translate(W / 2, 30); g.rotate(-0.6); g.fillRect(-3, -26, 6, 26); g.restore();
    g.fillStyle = '#9aa0c0';
    g.save(); g.translate(W / 2, 30); g.rotate(-0.6); g.fillRect(-2, -25, 4, 24); g.restore();
    // Windows and door.
    for (const x of [18, W - 26]) {
      g.fillStyle = '#383c50';
      g.fillRect(x, 64, 8, 12);
      g.fillStyle = '#f8e8a0';
      g.fillRect(x + 1, 65, 6, 10);
    }
    g.fillStyle = k.rim;
    g.fillRect(W / 2 - 9, H - 22, 18, 22);
    g.fillStyle = '#2c3460';
    g.fillRect(W / 2 - 8, H - 21, 16, 21);
    g.fillStyle = '#f8f0c0';
    g.fillRect(W / 2 - 1, H - 18, 2, 2);
    return c;
  },

  telescopeImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    const p = new Painter(W, H);
    p.ellipse(W / 2, H - 5, 14, 4, { fill: '#3a3e58', shade: '#262a40', hi: '#5a6080', line: '#10121e' });
    p.rect(W / 2 - 2, H - 22, 4, 17, { fill: '#6a7090', line: '#10121e' });
    g.drawImage(p.toCanvas(), 0, 0);
    g.save();
    g.translate(W / 2, H - 22);
    g.rotate(-0.75);
    g.fillStyle = '#10121e';
    g.fillRect(-6, -30, 12, 34);
    g.fillStyle = '#c8cce0';
    g.fillRect(-5, -29, 10, 32);
    g.fillStyle = '#e8c860';
    g.fillRect(-5, -22, 10, 2); g.fillRect(-5, -6, 10, 2);
    g.fillStyle = '#10121e';
    g.fillRect(-4, -30, 8, 3);
    g.restore();
    return c;
  },

  starstoneImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const c = Pix.canvas(W, H);
    const g = c.getContext('2d');
    const p = new Painter(W, H);
    p.rrect(4, H - 10, W - 8, 9, 2, { fill: '#8a90b0', shade: '#6a7090', hi: '#b0b8d8', line: '#1c2038' });
    p.poly([[W / 2, 1], [W / 2 + 9, 10], [W / 2 + 6, 22], [W / 2 - 6, 22], [W / 2 - 9, 10]], { fill: '#9070e0', shade: '#6a48c0', hi: '#e0d0ff', line: '#20183c' });
    g.drawImage(p.toCanvas(), 0, 0);
    g.fillStyle = 'rgba(224,208,255,0.35)';
    g.beginPath(); g.arc(W / 2, 12, 14, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffffff';
    g.fillRect(W / 2 - 1, 6, 2, 8); g.fillRect(W / 2 - 4, 9, 8, 2);
    return c;
  },
});

// Animated tiles for the new areas.
{
  const baseRender = Tiles.renderMap;
  Tiles.renderMap = function renderMap(map) {
    const r = baseRender.call(this, map);
    const at = (x, y) => map.worldTileAt(x, y);
    const anim = new Set(['ä', 'ç', 'ò', 'ö', '£', '¥', '§']);
    for (let y = 0; y < map.h; y++) {
      for (let x = 0; x < map.w; x++) {
        const ch = at(x, y);
        if (!anim.has(ch)) continue;
        const a = { x, y, ch };
        if (ch === 'ä') {
          const rock = (dx, dy) => { const c = at(x + dx, y + dy); return c !== 'ä' && c !== 'ñ'; };
          a.mask = (rock(0, -1) ? 1 : 0) | (rock(1, 0) ? 2 : 0) | (rock(0, 1) ? 4 : 0) | (rock(-1, 0) ? 8 : 0);
        }
        if (ch === '§') a.ground = [at(x, y + 1), at(x - 1, y), at(x + 1, y)].filter((c) => c === 'a').length >= 2 ? 1 : 0;
        r.anims.push(a);
      }
    }
    return r;
  };
}

// Ash-covered ground: paths, trees, rocks and signs on the volcano's slopes.
{
  const baseStatic = Tiles.drawStatic;
  Tiles.drawStatic = function drawStatic(g, ch, px, py, n, x, y, map) {
    if (map.def.ground !== 'à') {
      baseStatic.call(this, g, ch, px, py, n, x, y, map);
      return;
    }
    const d = this.def(ch);
    const hash = ((x * 73856093) ^ (y * 19349663)) >>> 0;
    if (d.name === 'grass' || d.name === 'flowers' || d.name === 'building') {
      g.drawImage(this.ashImg(hash % 5 === 0 ? 1 : hash % 7 === 0 ? 2 : 0), px, py);
      return;
    }
    if (d.name === 'tree' || d.name === 'bush') {
      g.drawImage(this.ashImg(0), px, py);
      g.drawImage(this.deadTreeImg(true), px, py);
      return;
    }
    if (d.name === 'rock') {
      g.drawImage(this.ashImg(0), px, py);
      g.drawImage(this.basaltImg(hash % 2), px, py);
      return;
    }
    if (d.name === 'sign' || d.name === 'lamp' || d.name === 'barrier') {
      g.drawImage(this.ashImg(0), px, py);
      g.drawImage(d.name === 'sign' ? this.signImg() : d.name === 'lamp' ? this.lampImg() : this.barrierImg(), px, py);
      return;
    }
    if (d.name === 'path') {
      g.drawImage(this.cinderPathImg(hash % 2), px, py);
      return;
    }
    baseStatic.call(this, g, ch, px, py, n, x, y, map);
  };

  Object.assign(Tiles, {
    cinderPathImg(v) {
      return this.memo(`cinder${v}`, () => {
        const c = Pix.canvas(16, 16);
        const g = c.getContext('2d');
        g.fillStyle = '#8a7a6a';
        g.fillRect(0, 0, 16, 16);
        const r = U.seeded(1200 + v);
        for (let i = 0; i < 10; i++) {
          g.fillStyle = i % 3 ? '#766858' : '#a09080';
          g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 2, 1);
        }
        return c;
      });
    },
  });

  const baseBorder = Tiles.borderImg;
  Tiles.borderImg = function borderImg(ch) {
    if (ch === 'å') return this.memo('borderå', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.ashImg(0), 0, 0);
      g.drawImage(this.basaltImg(0), 0, 0);
      return c;
    });
    if (ch === 'ü') return this.memo('borderü', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.drawImage(this.grassImg(0), 0, 0);
      g.drawImage(this.deadTreeImg(false), 0, 0);
      return c;
    });
    return baseBorder.call(this, ch);
  };
}

// Props: the master switch, the steam barrier and the archive door.
Object.assign(Props, {
  switchOn() { return Tiles.masterSwitchImg(true); },
  switchOff() { return Tiles.masterSwitchImg(false); },
  steam(f) {
    const c = Pix.canvas(16, 32);
    const g = c.getContext('2d');
    g.fillStyle = '#3a3030';
    g.fillRect(2, 26, 12, 6);
    g.fillStyle = LAVA[2];
    g.fillRect(4, 27, 8, 1);
    for (let i = 0; i < 6; i++) {
      const y = 24 - ((f * 5 + i * 5) % 26);
      g.fillStyle = `rgba(240,236,232,${0.9 - (24 - y) / 40})`;
      g.fillRect(2 + ((i * 3 + f) % 5), y, 8 + (i % 3), 4);
    }
    return c;
  },
  archiveDoor() {
    const c = Pix.canvas(16, 32);
    const g = c.getContext('2d');
    g.fillStyle = '#10121e';
    g.fillRect(0, 2, 16, 30);
    g.fillStyle = '#4a4e6a';
    g.fillRect(1, 3, 14, 29);
    g.fillStyle = '#383c56';
    for (let y = 6; y < 30; y += 6) g.fillRect(2, y, 12, 1);
    g.fillStyle = '#e8c860';
    g.fillRect(11, 17, 2, 3);
    g.fillStyle = '#a060e8';
    g.fillRect(4, 15, 5, 5);
    g.fillStyle = '#f0e0ff';
    g.fillRect(5, 16, 3, 1);
    return c;
  },
});
{
  const baseImage = Props.image;
  const anims = { steam: [4, 6] };
  Props.image = function image(name, frame) {
    const a = anims[name];
    if (!a) return baseImage.call(this, name, frame);
    const f = Math.floor(frame / a[1]) % a[0];
    const key = `${name}${f}`;
    if (!this.cache[key]) this.cache[key] = this[name](f);
    return this.cache[key];
  };
}

Object.assign(Tiles, {
  masterSwitchImg(on) {
    return this.memo(`mswitch${on ? 1 : 0}`, () => {
      const c = Pix.canvas(16, 32);
      const g = c.getContext('2d');
      const p = new Painter(16, 32);
      p.rrect(1, 8, 14, 23, 2, { fill: '#4a4458', shade: '#2e2a3a', hi: '#6a6480', line: '#0c0a14' });
      g.drawImage(p.toCanvas(), 0, 0);
      g.fillStyle = '#e8c040';
      g.fillRect(3, 10, 10, 2);
      g.fillStyle = '#202020';
      g.fillRect(5, 10, 2, 2); g.fillRect(9, 10, 2, 2);
      // The lever: up is on, down is off.
      g.fillStyle = '#10101a';
      g.fillRect(6, 18, 4, 6);
      g.fillStyle = '#9098a8';
      if (on) { g.fillRect(7, 4, 2, 16); g.fillStyle = '#d83838'; g.fillRect(5, 1, 6, 4); } else { g.fillRect(7, 20, 2, 10); g.fillStyle = '#d83838'; g.fillRect(5, 28, 6, 4); }
      g.fillStyle = on ? '#b070f8' : '#303038';
      g.fillRect(3, 14, 3, 2);
      g.fillStyle = on ? '#303038' : '#40d060';
      g.fillRect(10, 14, 3, 2);
      return c;
    });
  },
});
