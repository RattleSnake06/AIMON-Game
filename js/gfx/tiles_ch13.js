'use strict';
// Tiles, buildings and props for chapters 13 to 15: the SUNKEN SHRINE,
// VICTORY PATH through BRAMBLEWOOD FOREST, and the AIMON LEAGUE with its
// four ELITE chambers, the CHAMPION's dais and the HALL OF FAME.

Object.assign(TILE_DEFS, {
  // the SUNKEN SHRINE
  'Ġ': { name: 'shrineFloor' },
  'ġ': { name: 'shrinePillar', solid: true },
  'ģ': { name: 'keystoneLight', solid: true, animFn: 'keystoneAnim' },
  'Ĥ': { name: 'coral', solid: true },
  // VICTORY PATH
  'ĭ': { name: 'bramble', solid: true },
  // the AIMON LEAGUE
  'ĥ': { name: 'marble' },
  'Ħ': { name: 'marblePillar', solid: true },
  'ħ': { name: 'ghostFloor' },
  'Ĩ': { name: 'dojoFloor' },
  'ĩ': { name: 'fireFloor' },
  'Ī': { name: 'waterFloor' },
  'ī': { name: 'goldFloor' },
  'Ĭ': { name: 'eliteDeco', solid: true, animFn: 'eliteDecoAnim' },
});

Object.assign(BUILDINGS, {
  shrineGate: { w: 5, h: 4, door: 2, draw: 'shrineGateImg' },
  shrineAltar: { w: 3, h: 2, draw: 'shrineAltarImg' },
  shrineBell: { w: 2, h: 3, draw: 'shrineBellImg' },
  leagueHall: { w: 9, h: 6, door: 4, draw: 'leagueHallImg' },
  eliteDoor: { w: 3, h: 2, draw: 'eliteDoorImg' },
  hofMachine: { w: 3, h: 2, draw: 'hofMachineImg' },
  gatehouse: { w: 5, h: 4, roof: '#4a6a3a', wall: '#e0d8c0', door: 2, windows: [0.5, 3.5] },
});

Object.assign(WALL_THEMES, {
  shrine: { wall: '#3a3450', lo: '#2e2a42', dk: '#1a1828', rim: '#b070f8', hi: '#4c4668', base: '#28243a', baseDk: '#121020' },
  league: { wall: '#e8e0cc', lo: '#d8d0bc', dk: '#a89c80', rim: '#d8b040', hi: '#f8f4e8', base: '#c8bca0', baseDk: '#8a7c60' },
  eliteGhost: { wall: '#2a2040', lo: '#221a34', dk: '#120e1c', rim: '#b070f8', hi: '#3a2e58', base: '#1a1428', baseDk: '#0a0810' },
  eliteDojo: { wall: '#7a5638', lo: '#6a4a30', dk: '#3a2818', rim: '#e8c070', hi: '#8a6644', base: '#5a3e28', baseDk: '#2a1c10' },
  eliteFire: { wall: '#5a2818', lo: '#4a2014', dk: '#200a06', rim: '#f88828', hi: '#6e3420', base: '#3a1810', baseDk: '#180604' },
  eliteWater: { wall: '#184878', lo: '#143c64', dk: '#081c34', rim: '#80e0ff', hi: '#205890', base: '#103050', baseDk: '#061426' },
  champion: { wall: '#f0e8d4', lo: '#e0d8c4', dk: '#a89878', rim: '#d8b040', hi: '#fffaf0', base: '#d8ccb0', baseDk: '#8a7c58' },
});

Object.assign(Tiles.floors, {
  'Ġ'() { return this.shrineFloorImg(0); },
  'ĥ'() { return this.marbleImg(); },
  'ħ'() { return this.eliteFloorImg('ghost'); },
  'Ĩ'() { return this.eliteFloorImg('dojo'); },
  'ĩ'() { return this.eliteFloorImg('fire'); },
  'Ī'() { return this.eliteFloorImg('water'); },
  'ī'() { return this.eliteFloorImg('gold'); },
});

Object.assign(Tiles.extra, {
  shrineFloor(g, px, py, n, x, y, map, hash) { g.drawImage(this.shrineFloorImg(hash % 5 === 0 ? 1 : 0), px, py); },
  shrinePillar(g, px, py) {
    g.drawImage(this.shrineFloorImg(0), px, py);
    g.drawImage(this.shrinePillarImg(), px, py);
  },
  keystoneLight(g, px, py) { g.drawImage(this.shrineFloorImg(0), px, py); },
  coral(g, px, py, n, x, y, map, hash) {
    if (map.def.outdoor) g.drawImage(this.waterImg(0, 0), px, py);
    else g.drawImage(this.shrineFloorImg(0), px, py);
    g.drawImage(this.coralImg(hash % 2), px, py);
  },
  bramble(g, px, py, n, x, y, map, hash) {
    g.drawImage(this.grassImg(0), px, py);
    g.drawImage(this.brambleImg(hash % 2), px, py);
  },
  marble(g, px, py) { g.drawImage(this.marbleImg(), px, py); },
  marblePillar(g, px, py) {
    g.drawImage(this.marbleImg(), px, py);
    g.drawImage(this.marblePillarImg(), px, py);
  },
  ghostFloor(g, px, py) { g.drawImage(this.eliteFloorImg('ghost'), px, py); },
  dojoFloor(g, px, py) { g.drawImage(this.eliteFloorImg('dojo'), px, py); },
  fireFloor(g, px, py) { g.drawImage(this.eliteFloorImg('fire'), px, py); },
  waterFloor(g, px, py) { g.drawImage(this.eliteFloorImg('water'), px, py); },
  goldFloor(g, px, py) { g.drawImage(this.eliteFloorImg('gold'), px, py); },
  eliteDeco(g, px, py, n, x, y, map) { this.drawFloor(g, px, py, map); },
});

// Outdoors at the shrine, lanterns and broken pillars stand on its stone floor.
{
  const onShrine = (map) => map.def.outdoor && map.def.ground === 'Ġ';
  const baseFor = Tiles.groundFor;
  Tiles.groundFor = function groundFor(map, n) {
    return onShrine(map) ? this.floors[map.def.ground].call(this) : baseFor.call(this, map, n);
  };
  const baseCh6 = Tiles.groundCh6;
  Tiles.groundCh6 = function groundCh6(map, n) {
    return onShrine(map) ? this.floors[map.def.ground].call(this) : baseCh6.call(this, map, n);
  };
}

// Animated tiles.
{
  const baseRender = Tiles.renderMap;
  Tiles.renderMap = function renderMap(map) {
    const r = baseRender.call(this, map);
    for (let y = 0; y < map.h; y++) {
      for (let x = 0; x < map.w; x++) {
        const ch = map.tileAt(x, y);
        if (ch === 'ģ' || ch === 'Ĭ') r.anims.push({ x, y, ch, theme: map.def.eliteTheme });
      }
    }
    return r;
  };
}

// The eight KEYSTONE lights around the RIFT, one colour for each stone.
const KEYSTONE_ORDER = ['RIFTSTONE', 'ROOTSTONE', 'TIDESTONE', 'CRAGSTONE', 'DUNESTONE', 'MILLSTONE', 'BELLSTONE', 'STARSTONE'];

Object.assign(Tiles, {
  keystoneAnim(g, a, sx, sy, frame) {
    const i = OW.map && OW.map.def.keystones ? OW.map.def.keystones.findIndex(([x, y]) => x === a.x && y === a.y) : (a.x + a.y) % 8;
    const col = STONE_COLS[Math.max(0, i) % 8];
    const lit = !OW.map || !OW.map.def.keystonesLit || OW.map.def.keystonesLit() > i;
    g.drawImage(this.keystonePedestalImg(), sx, sy);
    const pulse = 0.55 + 0.35 * Math.sin(frame / 14 + i);
    g.globalAlpha = lit ? pulse : 0.25;
    Pix.ellipse(g, sx + 8, sy + 5, 5, 5, col);
    g.globalAlpha = lit ? Math.min(1, pulse + 0.3) : 0.35;
    Pix.ellipse(g, sx + 8, sy + 5, 2.5, 2.5, Pix.mix(col, '#ffffff', 0.5));
    g.globalAlpha = 1;
  },

  eliteDecoAnim(g, a, sx, sy, frame) {
    const theme = a.theme || 'gold';
    const f = Math.floor(frame / 8) % 3;
    g.drawImage(this.eliteDecoImg(theme, f), sx, sy - 16);
  },

  shrineFloorImg(v) {
    return this.memo(`shrinefloor${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#4a4660';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#56526e';
      g.fillRect(1, 1, 14, 6);
      g.fillRect(1, 9, 6, 6);
      g.fillRect(9, 9, 6, 6);
      g.fillStyle = '#3a3650';
      g.fillRect(0, 7, 16, 2);
      g.fillRect(7, 9, 2, 7);
      if (v) {
        g.fillStyle = '#b070f8';
        g.fillRect(4, 3, 2, 1);
        g.fillRect(11, 12, 1, 1);
      }
      return c;
    });
  },

  shrinePillarImg() {
    return this.memo('shrinepillar', () => {
      const p = new Painter(16, 16);
      p.rect(3, 0, 9, 15, { fill: '#6a6488', line: '#1a1828', shade: '#524c70', hi: '#8480a8' });
      p.rect(1, 12, 13, 3, { fill: '#5a5478', line: '#1a1828' });
      const c = p.toCanvas();
      const g = c.getContext('2d');
      g.fillStyle = '#b070f8';
      g.fillRect(7, 4, 1, 6);
      g.fillStyle = '#4a8a70';
      g.fillRect(4, 9, 3, 2);
      return c;
    });
  },

  keystonePedestalImg() {
    return this.memo('kspedestal', () => {
      const p = new Painter(16, 16);
      p.rect(4, 9, 7, 6, { fill: '#6a6488', line: '#1a1828', shade: '#524c70' });
      p.rect(3, 13, 9, 2, { fill: '#5a5478', line: '#1a1828' });
      return p.toCanvas();
    });
  },

  coralImg(v) {
    return this.memo(`coral${v}`, () => {
      const p = new Painter(16, 16);
      const col = v ? '#e0708a' : '#8a70d8';
      p.rect(7, 6, 2, 9, { fill: col, line: '#301828' });
      p.rect(3, 4, 2, 7, { fill: col, line: '#301828' });
      p.rect(11, 2, 2, 8, { fill: col, line: '#301828' });
      p.rect(3, 10, 10, 2, { fill: col, line: '#301828' });
      return p.toCanvas();
    });
  },

  brambleImg(v) {
    return this.memo(`bramble${v}`, () => {
      const p = new Painter(16, 16);
      p.ellipse(8, 9, 7.5, 6.5, { fill: '#3a5a2a', line: '#142410', shade: '#2a4420', hi: '#4c7038' });
      const c = p.toCanvas();
      const g = c.getContext('2d');
      g.fillStyle = '#6a3c24';
      for (let i = 0; i < 6; i++) g.fillRect(2 + ((i * 5 + v * 3) % 12), 4 + ((i * 7) % 10), 3, 1);
      g.fillStyle = '#d8d0b0';
      [[3, 6], [12, 5], [8, 12], [5, 11], [11, 10]].forEach(([x, y]) => g.fillRect(x, y, 1, 1));
      if (v) {
        g.fillStyle = '#c05080';
        g.fillRect(9, 7, 2, 2);
      }
      return c;
    });
  },

  marbleImg() {
    return this.memo('marble', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#ece6d8';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#dcd4c2';
      g.fillRect(0, 15, 16, 1);
      g.fillRect(15, 0, 1, 16);
      g.fillStyle = '#d0c8b4';
      g.fillRect(3, 5, 5, 1);
      g.fillRect(8, 6, 3, 1);
      g.fillRect(9, 11, 4, 1);
      return c;
    });
  },

  marblePillarImg() {
    return this.memo('marblepillar', () => {
      const p = new Painter(16, 16);
      p.rect(3, 0, 9, 15, { fill: '#f4f0e4', line: '#8a7c60', shade: '#dcd4c0', hi: '#ffffff' });
      p.rect(1, 12, 13, 3, { fill: '#e8e0cc', line: '#8a7c60' });
      const c = p.toCanvas();
      const g = c.getContext('2d');
      g.fillStyle = '#d8b040';
      g.fillRect(3, 1, 10, 1);
      return c;
    });
  },

  eliteFloorImg(theme) {
    return this.memo(`elitefloor${theme}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      const t = {
        ghost: ['#2e2640', '#383050', '#1e1830', '#b070f8'],
        dojo: ['#c8b080', '#d4bc8c', '#8a7048', '#6a8a40'],
        fire: ['#4a3028', '#5a3a30', '#2a1a14', '#f88828'],
        water: ['#2a6090', '#3470a0', '#184070', '#a0e8ff'],
        gold: ['#e8dcc0', '#f0e8d0', '#c8b890', '#d8b040'],
      }[theme];
      g.fillStyle = t[0];
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = t[1];
      if (theme === 'dojo') {
        // Tatami mats with dark borders.
        g.fillRect(1, 1, 14, 14);
        g.fillStyle = t[2];
        g.fillRect(0, 0, 16, 1);
        g.fillRect(0, 0, 1, 16);
        g.fillStyle = t[3];
        g.fillRect(0, 8, 16, 1);
      } else {
        g.fillRect(1, 1, 6, 6);
        g.fillRect(9, 9, 6, 6);
        g.fillStyle = t[2];
        g.fillRect(0, 15, 16, 1);
        g.fillRect(15, 0, 1, 16);
        g.fillStyle = t[3];
        g.fillRect(7, 7, 2, 2);
      }
      return c;
    });
  },

  eliteDecoImg(theme, f) {
    return this.memo(`elitedeco${theme}${f}`, () => {
      const c = Pix.canvas(16, 32);
      const g = c.getContext('2d');
      const p = new Painter(16, 32);
      const base = { ghost: '#3a2e58', dojo: '#6a4a30', fire: '#4a2014', water: '#205890', gold: '#d8c8a0' }[theme];
      p.rect(4, 14, 7, 17, { fill: base, line: '#141018', shade: Pix.shade(base, 0.8) });
      p.rect(2, 12, 11, 3, { fill: Pix.shade(base, 1.2), line: '#141018' });
      g.drawImage(p.toCanvas(), 0, 0);
      // A flame, a candle, a wave or a lamp on top, flickering.
      const glow = { ghost: '#b070f8', dojo: '#f8e070', fire: '#f88828', water: '#80e0ff', gold: '#fff0a0' }[theme];
      g.fillStyle = glow;
      const h = [8, 10, 9][f];
      g.fillRect(6, 12 - h, 4, h);
      g.fillStyle = '#ffffff';
      g.fillRect(7, 12 - h + 2, 2, Math.max(2, h - 5));
      return c;
    });
  },

  shrineGateImg(spec) {
    const p = new Painter(spec.w * 16, spec.h * 16);
    const W = spec.w * 16;
    const H = spec.h * 16;
    p.rect(0, 10, W - 1, H - 11, { fill: '#5a5478', line: '#141020', shade: '#46405e', hi: '#6e6890' });
    p.poly([[0, 12], [W / 2, 0], [W - 1, 12]], { fill: '#46405e', line: '#141020', shade: '#3a3450' });
    p.rrect(W / 2 - 12, H - 30, 24, 29, 10, { fill: '#140c20', line: '#0a0610' });
    const c = p.toCanvas();
    const g = c.getContext('2d');
    g.fillStyle = '#b070f8';
    g.fillRect(W / 2 - 1, 5, 2, 4);
    for (let i = 0; i < 8; i++) {
      g.fillStyle = STONE_COLS[i];
      g.fillRect(6 + i * 8.5, 16, 3, 3);
    }
    g.fillStyle = 'rgba(176,112,248,0.5)';
    g.fillRect(W / 2 - 8, H - 24, 16, 22);
    return c;
  },

  shrineAltarImg(spec) {
    const p = new Painter(spec.w * 16, spec.h * 16);
    p.rect(1, 6, 45, 25, { fill: '#6a6488', line: '#141020', shade: '#524c70', hi: '#8480a8' });
    p.rect(4, 2, 39, 6, { fill: '#7a74a0', line: '#141020' });
    const c = p.toCanvas();
    const g = c.getContext('2d');
    g.fillStyle = '#b070f8';
    for (let i = 0; i < 5; i++) g.fillRect(8 + i * 7, 14, 4, 1);
    g.fillRect(10, 20, 28, 1);
    return c;
  },

  shrineBellImg(spec) {
    const p = new Painter(spec.w * 16, spec.h * 16);
    p.rect(1, 2, 3, 45, { fill: '#4a3a28', line: '#140c08' });
    p.rect(27, 2, 3, 45, { fill: '#4a3a28', line: '#140c08' });
    p.rect(0, 0, 31, 4, { fill: '#5a4830', line: '#140c08' });
    p.poly([[8, 14], [10, 8], [21, 8], [23, 14], [26, 30], [5, 30]], { fill: '#a07838', line: '#2a1a08', shade: '#80582a', hi: '#d0a860' });
    p.rect(4, 29, 23, 3, { fill: '#b08840', line: '#2a1a08' });
    const c = p.toCanvas();
    const g = c.getContext('2d');
    g.fillStyle = '#60c8d8';
    g.fillRect(14, 20, 3, 3);
    return c;
  },

  leagueHallImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const p = new Painter(W, H);
    // Steps, walls, columns and a golden roof.
    p.rect(0, 26, W - 1, H - 27, { fill: '#ece6d8', line: '#5a4c30', shade: '#d4ccb8', hi: '#fffaf0' });
    p.poly([[-1, 28], [W / 2, 2], [W, 28]], { fill: '#d8b040', line: '#5a4418', shade: '#b89028', hi: '#f8e080' });
    for (let x = 8; x < W - 8; x += 16) p.rect(x, 30, 6, H - 44, { fill: '#f8f4e8', line: '#8a7c60', shade: '#dcd4c0' });
    p.rect(W / 2 - 14, H - 30, 28, 29, { fill: '#8a2a2a', line: '#301010', shade: '#6a1c1c' });
    p.rect(0, H - 8, W - 1, 7, { fill: '#e0d8c4', line: '#5a4c30' });
    const c = p.toCanvas();
    const g = c.getContext('2d');
    // The LEAGUE crest over the door.
    Pix.ellipse(g, W / 2, 18, 7, 7, '#f8f0c0');
    g.fillStyle = '#c83030';
    g.fillRect(W / 2 - 3, 15, 6, 6);
    g.fillStyle = '#f8e070';
    g.fillRect(W / 2 - 1, 44 - 12, 2, 2);
    // Banners.
    for (const x of [18, W - 24]) {
      g.fillStyle = '#c83030';
      g.fillRect(x, 32, 6, 22);
      g.fillStyle = '#f8e070';
      g.fillRect(x + 2, 38, 2, 2);
    }
    return c;
  },

  eliteDoorImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const p = new Painter(W, H);
    p.rrect(4, 0, W - 9, H - 1, 6, { fill: '#6a5030', line: '#1a1008', shade: '#50381c', hi: '#8a6a44' });
    p.rect(W / 2 - 1, 4, 1, H - 6, { fill: '#2a1a08', line: false });
    const c = p.toCanvas();
    const g = c.getContext('2d');
    g.fillStyle = '#d8b040';
    g.fillRect(W / 2 - 5, H / 2, 2, 3);
    g.fillRect(W / 2 + 3, H / 2, 2, 3);
    g.fillRect(8, 4, W - 16, 2);
    return c;
  },

  hofMachineImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const p = new Painter(W, H);
    p.rrect(1, 2, W - 3, H - 3, 4, { fill: '#c8c0b0', line: '#3a3428', shade: '#a8a090', hi: '#e8e0d0' });
    p.rrect(6, 5, W - 13, 11, 2, { fill: '#203048', line: '#0c1420' });
    const c = p.toCanvas();
    const g = c.getContext('2d');
    for (let i = 0; i < 6; i++) {
      Pix.ellipse(g, 9 + i * 6, 23, 2.5, 2.5, '#e04040');
      g.fillStyle = '#ffffff';
      g.fillRect(9 + i * 6 - 1, 22, 1, 1);
    }
    g.fillStyle = '#80e0ff';
    g.fillRect(9, 8, W - 18, 1);
    g.fillRect(9, 11, W - 24, 1);
    return c;
  },
});

// Props: the RIFT's tear and an hourglass left behind.
Object.assign(Props, {
  riftTear(f) {
    const c = Pix.canvas(32, 48);
    const g = c.getContext('2d');
    const pulse = [0.55, 0.75, 0.95, 0.75][f];
    g.globalAlpha = pulse * 0.45;
    Pix.ellipse(g, 16, 22, 14, 22, '#8040d0');
    g.globalAlpha = pulse;
    Pix.ellipse(g, 16, 22, 6, 18, '#c080ff');
    g.globalAlpha = 1;
    g.fillStyle = '#ffffff';
    g.fillRect(15, 6 + f, 2, 32 - f * 2);
    g.fillStyle = '#f0d8ff';
    g.fillRect(14, 14, 1, 16);
    return c;
  },
  hourglass() {
    const p = new Painter(16, 16);
    p.rect(4, 2, 7, 1, { fill: '#8a6a40', line: '#2a1a08' });
    p.rect(4, 13, 7, 1, { fill: '#8a6a40', line: '#2a1a08' });
    p.poly([[5, 4], [10, 4], [8, 8], [10, 12], [5, 12], [7, 8]], { fill: '#d8e8f0', line: '#304050' });
    const c = p.toCanvas();
    const g = c.getContext('2d');
    g.fillStyle = '#e8c870';
    g.fillRect(6, 10, 4, 2);
    g.fillRect(7, 8, 1, 2);
    return c;
  },
});
{
  const baseImage = Props.image;
  Props.image = function image(name, frame) {
    if (name !== 'riftTear') return baseImage.call(this, name, frame);
    const f = Math.floor(frame / 10) % 4;
    const key = `riftTear${f}`;
    if (!this.cache[key]) this.cache[key] = this.riftTear(f);
    return this.cache[key];
  };
}
