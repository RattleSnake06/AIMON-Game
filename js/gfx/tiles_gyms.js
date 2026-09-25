'use strict';
// Tiles and props for the GYM puzzles: blooms and vine walls (IVY), water
// currents (NERISSA), pits and boulders (TOR), sinkholes and a sand ledge
// (SAHRA), switch plates and electric gates (WREN), bell plates and chime
// doors (CANTOR), and the starry dome floor with its hidden path (NOX).

// Bell plate colours, lowest note first: red, blue, gold, green.
const BELL_COLS = ['#e05050', '#4880e0', '#e8b830', '#50b860'];
// WREN's gates: group A glows blue, group B glows orange.
const GATE_COLS = { A: ['#58a8f8', '#c8e8ff'], B: ['#f89838', '#fff0c0'] };

Object.assign(TILE_DEFS, {
  'ā': { name: 'switchPlate', toggle: true, animFn: 'switchAnim' },
  'ă': { name: 'current', push: 'up', water: true, animFn: 'currentAnim' },
  'ą': { name: 'current', push: 'down', water: true, animFn: 'currentAnim' },
  'ć': { name: 'current', push: 'left', water: true, animFn: 'currentAnim' },
  'ĉ': { name: 'current', push: 'right', water: true, animFn: 'currentAnim' },
  'ċ': { name: 'pit', solid: true, hole: true },
  'č': { name: 'sinkhole', sink: true, animFn: 'sinkAnim' },
  'ĺ': { name: 'sandLedge', ledge: true },
  'ď': { name: 'bellPlate', bell: 0, animFn: 'bellAnim' },
  'đ': { name: 'bellPlate', bell: 1, animFn: 'bellAnim' },
  'ē': { name: 'bellPlate', bell: 2, animFn: 'bellAnim' },
  'ĕ': { name: 'bellPlate', bell: 3, animFn: 'bellAnim' },
  'ė': { name: 'starVoid', fall: true, animFn: 'skyAnim' },
  'ę': { name: 'starPath', starPath: true, animFn: 'skyAnim' },
});

Object.assign(Tiles.extra, {
  // The GYM's own floor under a puzzle tile.
  gymFloorUnder(g, px, py, n, x, y, map) {
    this.drawStatic(g, map.floor, px, py, n, x, y, map);
  },
  switchPlate(g, px, py, n, x, y, map) { this.extra.gymFloorUnder.call(this, g, px, py, n, x, y, map); },
  current() {},
  pit(g, px, py, n, x, y, map) {
    this.extra.gymFloorUnder.call(this, g, px, py, n, x, y, map);
    g.drawImage(this.pitImg(), px, py);
  },
  sinkhole(g, px, py, n, x, y, map) {
    this.extra.gymFloorUnder.call(this, g, px, py, n, x, y, map);
    g.drawImage(this.sinkholeImg(), px, py);
  },
  sandLedge(g, px, py, n, x, y, map) {
    this.extra.gymFloorUnder.call(this, g, px, py, n, x, y, map);
    g.drawImage(this.sandLedgeImg(), px, py);
  },
  bellPlate(g, px, py, n, x, y, map) { this.extra.gymFloorUnder.call(this, g, px, py, n, x, y, map); },
  starVoid(g, px, py, n, x, y, map, hash) { g.drawImage(this.skyImg(hash % 4), px, py); },
  starPath(g, px, py, n, x, y, map, hash) { g.drawImage(this.skyImg(hash % 4), px, py); },
});

// Animated puzzle tiles.
{
  const baseRender = Tiles.renderMap;
  const anim = new Set(['ā', 'č', 'ď', 'đ', 'ē', 'ĕ', 'ė', 'ę']);
  Tiles.renderMap = function renderMap(map) {
    const r = baseRender.call(this, map);
    for (let y = 0; y < map.h; y++) {
      for (let x = 0; x < map.w; x++) {
        const ch = map.tileAt(x, y);
        if (anim.has(ch)) r.anims.push({ x, y, ch });
      }
    }
    return r;
  };
}

Object.assign(Tiles, {
  switchAnim(g, a, sx, sy) {
    const on = OW.map && State.flag(OW.map.def.switchFlag);
    g.drawImage(this.switchPlateImg(on ? 'B' : 'A'), sx, sy);
  },

  currentAnim(g, a, sx, sy, frame) {
    g.drawImage(this.waterImg(a.mask || 0, Math.floor(frame / 12) % 4), sx, sy);
    // Currents run a little paler than still water, with arrows riding them.
    g.fillStyle = 'rgba(190,240,255,0.28)';
    g.fillRect(sx, sy, 16, 16);
    const d = TILE_DEFS[a.ch].push;
    const [dx, dy] = U.dirVec[d];
    const t = (frame * 0.5) % 16;
    g.fillStyle = 'rgba(248,255,255,0.95)';
    for (let k = 0; k < 2; k++) {
      const s = (t + k * 8) % 16;
      // A small chevron pointing along the flow.
      for (let i = -2; i <= 2; i++) {
        const back = Math.abs(i);
        const cx = dx ? (dx > 0 ? s - back : 15 - s + back) : 7.5 + i * 1.5;
        const cy = dy ? (dy > 0 ? s - back : 15 - s + back) : 7.5 + i * 1.5;
        if (cx < 0 || cx > 15 || cy < 0 || cy > 15) continue;
        g.fillRect(sx + Math.round(cx), sy + Math.round(cy), 2, 1);
      }
    }
  },

  sinkAnim(g, a, sx, sy, frame) {
    const t = frame / 20;
    g.fillStyle = '#e8cc88';
    for (let i = 0; i < 3; i++) {
      const ang = t + (i * Math.PI * 2) / 3;
      g.fillRect(sx + 7 + Math.round(Math.cos(ang) * 4), sy + 8 + Math.round(Math.sin(ang) * 3), 2, 1);
    }
  },

  bellAnim(g, a, sx, sy, frame) {
    const b = TILE_DEFS[a.ch].bell;
    const lit = OW.bellGlow && OW.bellGlow[`${a.x},${a.y}`] > frame;
    g.drawImage(this.bellPlateImg(b, lit ? 1 : 0), sx, sy);
  },

  skyAnim(g, a, sx, sy, frame) {
    const path = TILE_DEFS[a.ch].starPath;
    const seed = (a.x * 37 + a.y * 91) % 97;
    if (path && OW.lit && OW.lit.has(`${a.x},${a.y}`)) {
      g.drawImage(this.starStepImg(Math.floor(frame / 16) % 2), sx, sy);
      return;
    }
    // Every star twinkles now and then; the hidden path's stars a little
    // more often, and a little brighter.
    const period = path ? 150 : 260;
    const ph = (frame + seed * 13) % period;
    if (ph < (path ? 14 : 8)) {
      const bright = path ? '#fff8d0' : '#a8b0e0';
      g.fillStyle = bright;
      const px = sx + 4 + (seed % 8);
      const py = sy + 4 + ((seed >> 2) % 8);
      g.fillRect(px, py, 1, 1);
      if (path) {
        g.fillRect(px - 1, py, 3, 1);
        g.fillRect(px, py - 1, 1, 3);
      }
    }
  },

  pitImg() {
    return this.memo('gympit', () => {
      const p = new Painter(16, 16);
      p.rrect(1, 2, 14, 13, 4, { fill: '#2a1e18', line: '#140c08', shade: '#1a120e' });
      p.rrect(3, 5, 10, 8, 3, { fill: '#0c0806', line: false });
      const c = p.toCanvas();
      const g = c.getContext('2d');
      g.fillStyle = '#6a5040';
      g.fillRect(3, 3, 9, 1);
      return c;
    });
  },

  sinkholeImg() {
    return this.memo('gymsink', () => {
      const p = new Painter(16, 16);
      p.ellipse(8, 8.5, 7, 6, { fill: '#c09858', line: '#8a6a38', shade: '#a8844a' });
      p.ellipse(8, 8.5, 4.5, 3.5, { fill: '#8a6a38', line: false, shade: '#6a5028' });
      p.ellipse(8, 8.5, 2, 1.5, { fill: '#3a2a14', line: false });
      return p.toCanvas();
    });
  },

  sandLedgeImg() {
    return this.memo('sandledge', () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#b08850';
      g.fillRect(0, 10, 16, 4);
      g.fillStyle = '#8a6630';
      g.fillRect(0, 14, 16, 2);
      g.fillStyle = '#d8b878';
      g.fillRect(0, 9, 16, 1);
      g.fillStyle = '#9a7440';
      for (let x = 1; x < 16; x += 4) g.fillRect(x, 11, 2, 1);
      return c;
    });
  },

  switchPlateImg(group) {
    return this.memo(`switch${group}`, () => {
      const p = new Painter(16, 16);
      p.rrect(1, 2, 14, 12, 2, { fill: '#6a6470', line: '#26222c', shade: '#524c58', hi: '#8a8490' });
      p.rrect(4, 5, 8, 6, 1, { fill: '#302c38', line: '#1a161e' });
      const c = p.toCanvas();
      const g = c.getContext('2d');
      const [col, hi] = GATE_COLS[group];
      // A lightning bolt in the colour of the gates that are switched on.
      g.fillStyle = col;
      g.fillRect(8, 6, 2, 2);
      g.fillRect(7, 8, 2, 1);
      g.fillRect(6, 9, 2, 2);
      g.fillStyle = hi;
      g.fillRect(8, 6, 1, 1);
      return c;
    });
  },

  bellPlateImg(b, lit) {
    return this.memo(`bellplate${b}${lit}`, () => {
      const col = BELL_COLS[b];
      const p = new Painter(16, 16);
      p.ellipse(8, 9, 7, 5.5, { fill: '#a89878', line: '#4a4030', shade: '#8a7c60', hi: '#c8b890' });
      p.ellipse(8, 9, 5, 3.8, { fill: lit ? Pix.mix(col, '#ffffff', 0.45) : col, line: Pix.shade(col, 0.55), shade: Pix.shade(col, 0.8) });
      // A tiny bell engraved in the middle.
      p.poly([[6, 10], [7, 7], [9, 7], [10, 10]], { fill: '#f8f0d8', line: false });
      const c = p.toCanvas();
      if (lit) {
        const g = c.getContext('2d');
        g.fillStyle = 'rgba(255,255,240,0.6)';
        g.fillRect(3, 1, 1, 2); g.fillRect(12, 1, 1, 2); g.fillRect(8, 0, 1, 2);
      }
      return c;
    });
  },

  skyImg(v) {
    return this.memo(`gymsky${v}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = '#080a1c';
      g.fillRect(0, 0, 16, 16);
      const r = U.seeded(4200 + v);
      for (let i = 0; i < 3; i++) {
        g.fillStyle = i ? '#3a3e6a' : '#6a6ea0';
        g.fillRect(Math.floor(r() * 16), Math.floor(r() * 16), 1, 1);
      }
      if (v === 1) {
        g.fillStyle = 'rgba(80,60,140,0.25)';
        g.fillRect(2, 5, 9, 4);
      }
      return c;
    });
  },

  starStepImg(f) {
    return this.memo(`starstep${f}`, () => {
      const c = Pix.canvas(16, 16);
      const g = c.getContext('2d');
      g.fillStyle = 'rgba(120,110,200,0.35)';
      g.fillRect(2, 2, 12, 12);
      g.fillStyle = f ? '#fff4c0' : '#e8d890';
      g.fillRect(7, 3, 2, 10);
      g.fillRect(3, 7, 10, 2);
      g.fillStyle = '#ffffff';
      g.fillRect(7, 7, 2, 2);
      g.fillStyle = 'rgba(255,240,180,0.5)';
      g.fillRect(5, 5, 6, 6);
      return c;
    });
  },
});

// Props: vine walls and blooms, electric gates, boulders and chime doors.
Object.assign(Props, {
  vineWall() {
    const p = new Painter(16, 32);
    p.rrect(0, 10, 15, 21, 4, { fill: '#2e6a30', line: '#12301a', shade: '#224e24', hi: '#4a8a40' });
    const c = p.toCanvas();
    const g = c.getContext('2d');
    // Twisting vines and purple thorns.
    g.fillStyle = '#5a3a22';
    for (let y = 12; y < 30; y += 3) g.fillRect(2 + ((y * 5) % 11), y, 3, 1);
    g.fillStyle = '#b060c8';
    [[3, 13], [11, 16], [6, 20], [12, 24], [4, 27], [9, 29]].forEach(([x, y]) => g.fillRect(x, y, 1, 2));
    g.fillStyle = '#78b048';
    [[5, 11], [10, 12], [1, 18], [14, 21]].forEach(([x, y]) => g.fillRect(x, y, 2, 1));
    return c;
  },
  bloomBud() { return Tiles.bloomImg(false); },
  bloomOpen() { return Tiles.bloomImg(true); },
  gateA(f) { return Tiles.zapGateImg('A', f); },
  gateB(f) { return Tiles.zapGateImg('B', f); },
  pushRock() {
    const p = new Painter(16, 16);
    p.ellipse(8, 9, 7, 6.5, { fill: '#9a8c7c', line: '#2c2620', shade: '#76695c', hi: '#b8ac9c' });
    const c = p.toCanvas();
    const g = c.getContext('2d');
    g.fillStyle = '#4c4238';
    g.fillRect(5, 7, 3, 1); g.fillRect(8, 8, 1, 3); g.fillRect(10, 11, 2, 1);
    g.fillStyle = '#d0c4b4';
    g.fillRect(5, 4, 3, 1);
    return c;
  },
  chimeDoor() {
    const p = new Painter(16, 32);
    p.rect(0, 6, 15, 25, { fill: '#6a5a38', line: '#241c10', shade: '#54482c' });
    const c = p.toCanvas();
    const g = c.getContext('2d');
    g.fillStyle = '#d8b850';
    for (let x = 2; x < 15; x += 4) g.fillRect(x, 8, 2, 22);
    g.fillStyle = '#f8e8a0';
    for (let x = 2; x < 15; x += 4) g.fillRect(x, 8, 1, 22);
    // A row of little bells across the top bar.
    for (let i = 0; i < 4; i++) {
      g.fillStyle = BELL_COLS[i];
      g.fillRect(1 + i * 4, 4, 3, 3);
      g.fillStyle = '#241c10';
      g.fillRect(2 + i * 4, 7, 1, 1);
    }
    return c;
  },
});
{
  const baseImage = Props.image;
  const anims = { gateA: [4, 5], gateB: [4, 5] };
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
  bloomImg(open) {
    return this.memo(`bloom${open ? 1 : 0}`, () => {
      const p = new Painter(16, 16);
      p.rect(7, 8, 1, 7, { fill: '#3a7a30', line: '#1a3a18' });
      p.ellipse(4, 12, 3, 1.6, { fill: '#58a040', line: '#1a3a18' });
      p.ellipse(12, 11, 3, 1.6, { fill: '#58a040', line: '#1a3a18' });
      if (open) {
        for (let i = 0; i < 5; i++) {
          const ang = (i * Math.PI * 2) / 5 - Math.PI / 2;
          p.ellipse(8 + Math.cos(ang) * 3.5, 6 + Math.sin(ang) * 3, 2.4, 2.4, { fill: '#f8d040', line: '#8a6410', shade: '#e0a820' });
        }
        p.ellipse(8, 6, 1.8, 1.8, { fill: '#e86830', line: '#6a2810' });
      } else {
        p.ellipse(8, 6, 3, 4, { fill: '#e878a8', line: '#6a2040', shade: '#c85888', hi: '#f8a8c8' });
        p.line(8, 3, 8, 8, '#a84070');
      }
      return p.toCanvas();
    });
  },

  zapGateImg(group, f) {
    const [col, hi] = GATE_COLS[group];
    const c = Pix.canvas(16, 32);
    const g = c.getContext('2d');
    const p = new Painter(16, 32);
    p.rect(0, 12, 3, 19, { fill: '#5a5660', line: '#1a181e', shade: '#403c46' });
    p.rect(12, 12, 3, 19, { fill: '#5a5660', line: '#1a181e', shade: '#403c46' });
    g.drawImage(p.toCanvas(), 0, 0);
    g.fillStyle = col;
    g.fillRect(1, 12, 2, 2);
    g.fillRect(13, 12, 2, 2);
    // Crackling arcs between the posts.
    const r = U.seeded(900 + f * 17 + (group === 'B' ? 5 : 0));
    for (let k = 0; k < 3; k++) {
      let y = 15 + k * 5 + Math.floor(r() * 2);
      g.fillStyle = k === 1 ? hi : col;
      for (let x = 3; x < 13; x++) {
        y += Math.floor(r() * 3) - 1;
        g.fillRect(x, Math.max(13, Math.min(29, y)), 1, 1);
      }
    }
    return c;
  },
});
