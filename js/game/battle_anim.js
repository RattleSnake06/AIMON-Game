'use strict';
// Battle backgrounds, particles and move animations.

const BattleArt = {
  cache: {},

  bg(kind) {
    if (this.cache[kind]) return this.cache[kind];
    const c = Pix.canvas(SCREEN_W, 112);
    const g = c.getContext('2d');
    if (kind === 'cave') {
      const bands = ['#302830', '#383038', '#403840', '#484048', '#50464c'];
      bands.forEach((col, i) => { g.fillStyle = col; g.fillRect(0, i * 10, 240, 10); });
      const r = U.seeded(9);
      for (let i = 0; i < 18; i++) {
        const x = Math.floor(r() * 240);
        const w = 6 + Math.floor(r() * 10);
        const h = 8 + Math.floor(r() * 22);
        g.fillStyle = '#282028';
        for (let y = 0; y < h; y++) g.fillRect(x - Math.round(w * (1 - y / h) / 2), y, Math.max(1, Math.round(w * (1 - y / h))), 1);
      }
      for (let y = 50; y < 112; y++) {
        g.fillStyle = ['#5a5058', '#625860', '#6a6068', '#72686e'][Math.min(3, Math.floor((y - 50) / 16))];
        g.fillRect(0, y, 240, 1);
      }
      g.fillStyle = '#827880';
      for (let i = 0; i < 30; i++) g.fillRect(Math.floor(r() * 240), 54 + Math.floor(r() * 56), 2 + Math.floor(r() * 4), 1);
      // Faint violet glow of distortion crystals.
      g.fillStyle = 'rgba(160,96,224,0.18)';
      Pix.ellipse(g, 30, 40, 26, 10, 'rgba(160,96,224,0.18)');
      Pix.ellipse(g, 210, 30, 20, 8, 'rgba(160,96,224,0.18)');
    } else if (kind === 'gym') {
      g.fillStyle = '#b8b0a8';
      g.fillRect(0, 0, 240, 112);
      g.fillStyle = '#8c847c';
      g.fillRect(0, 0, 240, 36);
      for (let x = 8; x < 240; x += 40) {
        g.fillStyle = '#a49c94';
        g.fillRect(x, 0, 16, 36);
        g.fillStyle = '#c8c0b8';
        g.fillRect(x + 2, 0, 3, 36);
      }
      g.fillStyle = '#6c645c';
      g.fillRect(0, 36, 240, 3);
      for (let y = 44; y < 112; y += 12) { g.fillStyle = '#a8a098'; g.fillRect(0, y, 240, 1); }
      g.fillStyle = '#b84040';
      g.fillRect(96, 39, 48, 73);
      g.fillStyle = '#d8b050';
      g.fillRect(98, 39, 2, 73);
      g.fillRect(140, 39, 2, 73);
    } else if (kind === 'forest') {
      // Deep, dim woods.
      const sky = ['#28402c', '#2c4830', '#305034', '#34583a'];
      sky.forEach((col, i) => { g.fillStyle = col; g.fillRect(0, i * 12, 240, 12); });
      const r = U.seeded(17);
      for (let x = -10; x < 250; x += 18) {
        const h = 24 + Math.floor(r() * 16);
        g.fillStyle = '#1c3020';
        for (let y = 0; y < h; y++) g.fillRect(x - Math.round(y / 2.2), 50 - h + y, Math.round(y / 1.1) + 2, 1);
        g.fillStyle = '#3a2c20';
        g.fillRect(x, 44, 3, 8);
      }
      for (let y = 50; y < 112; y++) {
        g.fillStyle = ['#4c7048', '#527650', '#587c56', '#5e825c'][Math.min(3, Math.floor((y - 50) / 16))];
        g.fillRect(0, y, 240, 1);
      }
      g.fillStyle = 'rgba(200,180,255,0.35)';
      for (let i = 0; i < 12; i++) g.fillRect(Math.floor(r() * 240), 10 + Math.floor(r() * 90), 1, 1);
    } else if (kind === 'hideout') {
      g.fillStyle = '#282434';
      g.fillRect(0, 0, 240, 112);
      g.fillStyle = '#34304a';
      for (let x = 0; x < 240; x += 24) g.fillRect(x, 0, 22, 38);
      g.fillStyle = '#9060e0';
      g.fillRect(0, 30, 240, 2);
      g.fillStyle = '#1c1826';
      g.fillRect(0, 38, 240, 4);
      // Roots breaking through the ceiling.
      g.fillStyle = '#5a4430';
      for (const [x, w] of [[20, 6], [70, 4], [150, 7], [210, 5]]) {
        for (let y = 0; y < 28; y++) g.fillRect(x + Math.round(Math.sin(y / 5) * 3), y, Math.max(1, w - Math.floor(y / 7)), 1);
      }
      for (let y = 42; y < 112; y += 10) { g.fillStyle = '#3c3850'; g.fillRect(0, y, 240, 1); }
      for (let x = 0; x < 240; x += 20) { g.fillStyle = '#3c3850'; g.fillRect(x, 42, 1, 70); }
    } else if (kind === 'beach' || kind === 'storm') {
      const storm = kind === 'storm';
      const sky = storm ? ['#303848', '#384050', '#404858', '#485060', '#505868'] : ['#80c0f0', '#90c8f0', '#a0d0f0', '#b0d8f0', '#c0e0f0'];
      sky.forEach((col, i) => { g.fillStyle = col; g.fillRect(0, i * 7, 240, 7); });
      g.fillStyle = storm ? '#384858' : '#4880c8';
      g.fillRect(0, 35, 240, 12);
      g.fillStyle = storm ? '#506070' : '#78a8e0';
      for (let x = 0; x < 240; x += 12) g.fillRect(x + ((x / 12) % 2) * 5, 38, 6, 1);
      const sand = storm ? ['#a89c80', '#b0a488', '#b8ac90', '#c0b498'] : ['#e8d8a0', '#ecdca8', '#f0e0b0', '#f4e4b8'];
      for (let y = 47; y < 112; y++) {
        g.fillStyle = sand[Math.min(3, Math.floor((y - 47) / 16))];
        g.fillRect(0, y, 240, 1);
      }
      if (storm) {
        g.fillStyle = 'rgba(200,210,230,0.5)';
        const r = U.seeded(3);
        for (let i = 0; i < 40; i++) g.fillRect(Math.floor(r() * 240), Math.floor(r() * 112), 1, 4);
      }
    } else if (kind === 'indoor') {
      g.fillStyle = '#c8c8d8';
      g.fillRect(0, 0, 240, 112);
      g.fillStyle = '#a8a8c0';
      g.fillRect(0, 0, 240, 34);
      g.fillStyle = '#9090a8';
      g.fillRect(0, 34, 240, 3);
      for (let y = 40; y < 112; y += 12) {
        g.fillStyle = '#b8b8cc';
        g.fillRect(0, y, 240, 1);
      }
      for (let x = 0; x < 240; x += 24) {
        g.fillStyle = '#b8b8cc';
        g.fillRect(x, 37, 1, 75);
      }
    } else {
      const sky = ['#88c8f0', '#98d0f0', '#a8d8f0', '#b8e0f0', '#c8e8f0'];
      sky.forEach((col, i) => { g.fillStyle = col; g.fillRect(0, i * 8, 240, 8); });
      // Distant tree line.
      const r = U.seeded(42);
      for (let x = -8; x < 248; x += 14) {
        const h = 10 + Math.floor(r() * 8);
        Pix.ellipse(g, x, 44 - h / 2, 10, h, '#4c9050');
        Pix.ellipse(g, x - 2, 42 - h / 2, 6, h - 4, '#60a860');
      }
      g.fillStyle = '#4c9050';
      g.fillRect(0, 44, 240, 6);
      // Field.
      const field = ['#b0dc90', '#b8e098', '#c0e4a0', '#c8e8a8'];
      for (let y = 50; y < 112; y++) {
        g.fillStyle = field[Math.min(3, Math.floor((y - 50) / 16))];
        g.fillRect(0, y, 240, 1);
      }
      g.fillStyle = '#d8f0b8';
      for (let i = 0; i < 26; i++) g.fillRect(Math.floor(r() * 240), 54 + Math.floor(r() * 56), 6 + Math.floor(r() * 10), 1);
    }
    this.cache[kind] = c;
    return c;
  },

  platform(kind, rx, ry) {
    const key = `plat_${kind}_${rx}`;
    if (this.cache[key]) return this.cache[key];
    const c = Pix.canvas(rx * 2 + 2, ry * 2 + 2);
    const g = c.getContext('2d');
    const [rim, fill, hi] = {
      indoor: ['#8888a0', '#b0b0c8', '#c8c8dc'],
      cave: ['#3c343a', '#585058', '#6c6470'],
      gym: ['#7c746c', '#a0988e', '#bcb4aa'],
      forest: ['#34502c', '#4c6c40', '#608050'],
      hideout: ['#403a58', '#58507a', '#6c6490'],
      beach: ['#c0a870', '#d8c490', '#e8d8a8'],
      storm: ['#80785c', '#9c9474', '#b0a888'],
    }[kind] || ['#68a050', '#88c068', '#a8d888'];
    Pix.ellipse(g, rx + 1, ry + 1, rx, ry, rim);
    Pix.ellipse(g, rx + 1, ry, rx - 2, ry - 2, fill);
    Pix.ellipse(g, rx + 1, ry - 2, rx - 10, ry - 6, hi);
    this.cache[key] = c;
    return c;
  },

  sprite(name) {
    if (this.cache[name]) return this.cache[name];
    const S = {
      leaf: [['..gg...', '.gGgg..', 'gGggGg.', '.ggGggd', '..ddd..'], { g: '#78d050', G: '#b8f080', d: '#388030' }],
      drop: [['.b..', 'bbb.', 'bwbb', 'bbbb', '.bb.'], { b: '#4890f0', w: '#d0f0ff' }],
      bubble: [['.bbb.', 'bw..b', 'b...b', 'b...b', '.bbb.'], { b: '#78b8f8', w: '#ffffff' }],
      flame: [['...r...', '..rr...', '.rryr..', '.ryyrr.', 'rryyyr.', 'ryywyrr', 'ryywyyr', '.ryyyr.', '..rrr..'], { r: '#f05020', y: '#f8b030', w: '#fff0a0' }],
      rock: [['.oooo.', 'ogggGo', 'oggggo', 'oGgggo', 'ogggGo', '.oooo.'], { o: '#403830', g: '#a09078', G: '#c8b8a0' }],
      star: [['....y....', '....y....', '..y.w.y..', '...www...', 'yywwwwwyy', '...www...', '..y.w.y..', '....y....', '....y....'], { y: '#f8e060', w: '#ffffff' }],
      smoke: [['..ggg...', '.gGGgg..', 'gGGggggg', 'gggggggg', '.gggggg.', '..gggg..'], { g: '#9898a8', G: '#c8c8d8' }],
      orb: [['.ggg.', 'gGGgg', 'gGggg', 'ggggg', '.ggg.'], { g: '#60d060', G: '#c0ffc0' }],
      wind: [['..wwww..', '.w....w.', 'w..ww..w', 'w.w..w.w', '.w..w.w.', '....w...'], { w: '#f0f8ff' }],
      fang: [['w.....w', 'ww...ww', 'www.www', '.wwwww.'], { w: '#f8f8f8' }],
      note: [['..ooo', '..o.o', '..o..', 'ooo..', 'ooo..'], { o: '#404050' }],
      sparkle: [['.w.', 'www', '.w.'], { w: '#ffffff' }],
      up: [['...w...', '..www..', '.wwwww.', 'www.www', '..www..', '..www..'], { w: '#78b8ff' }],
      bolt: [['....yy', '...yy.', '..yyy.', '.yyyyy', '...yy.', '..yy..', '.yy...', 'yy....'], { y: '#f8e040' }],
      spark: [['y.y', '.w.', 'y.y'], { y: '#f8e040', w: '#ffffff' }],
      zzz: [['zzzz', '..z.', '.z..', 'zzzz'], { z: '#d0d8f8' }],
      mud: [['.bb.', 'bBbb', 'bbbb', '.bb.'], { b: '#8a6038', B: '#b08050' }],
      fist: [['.ooo.', 'orrro', 'orrrro', 'orrrro', '.oooo'], { o: '#401818', r: '#e05048' }],
      claw: [['w...w...w', '.w...w...w', '..w...w...w'], { w: '#ffffff' }],
      starp: [['..y..', '.yyy.', 'yyyyy', '.yyy.', '.y.y.'], { y: '#f8e878' }],
      powder: [['.g.', 'ggg', '.g.'], { g: '#e8f068' }],
      silk: [['wwwwwww'], { w: '#f0f0f0' }],
      vine: [['..gg', '.gg.', 'gg..', 'g...'], { g: '#48a040' }],
      down: [['..www..', '..www..', 'www.www', '.wwwww.', '..www..', '...w...'], { w: '#f86060' }],
      ghost: [['..ppp..', '.pPPPp.', 'pPwPwPp', 'pPPPPPp', 'pPPPPPp', 'p.p.p.p'], { p: '#503878', P: '#8868c0', w: '#f0e0ff' }],
      wisp: [['..v..', '.vVv.', 'vVwVv', '.vVv.', '..v..'], { v: '#7048c8', V: '#b090f8', w: '#f0e8ff' }],
      ring: [['..bbbb..', '.b....b.', 'b......b', 'b......b', '.b....b.', '..bbbb..'], { b: '#90a8f8' }],
    };
    const [rows, pal] = S[name];
    this.cache[name] = Pix.fromRows(rows, pal);
    return this.cache[name];
  },

  ballImg() {
    if (!this.cache.ball) this.cache.ball = Pix.fromRows(BALL_ROWS, BALL_PAL);
    return this.cache.ball;
  },

  // A ball rotated by `turn` quarter-ish steps (for wobbling).
  ballRot(angle) {
    const key = `ballrot${Math.round(angle * 10)}`;
    if (this.cache[key]) return this.cache[key];
    const c = Pix.canvas(16, 16);
    const g = c.getContext('2d');
    g.translate(8, 8);
    g.rotate(angle);
    g.drawImage(this.ballImg(), -6, -6);
    this.cache[key] = c;
    return c;
  },
};

// Move / event animations. Each works on a Battle `b` and its sides.
const BattleFX = {
  // Where a side's sprite is centred on screen.
  center(b, side) {
    return side === b.e ? [176, 44] : [68, 84];
  },

  add(b, part) {
    b.parts.push(part);
    return part;
  },

  *tween(frames, fn) {
    for (let f = 1; f <= frames; f++) {
      fn(f / frames, f);
      yield;
    }
  },

  // Fly a particle image from a to b over `frames` with an optional arc.
  *fly(b, img, from, to, frames, arc = 0, scale = 1) {
    const p = this.add(b, { img, x: from[0], y: from[1], scale });
    yield* this.tween(frames, (t) => {
      p.x = U.lerp(from[0], to[0], t);
      p.y = U.lerp(from[1], to[1], t) - Math.sin(t * Math.PI) * arc;
    });
    b.parts.splice(b.parts.indexOf(p), 1);
  },

  *burst(b, img, at, n, spread, frames) {
    const ps = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
      ps.push(this.add(b, { img, x: at[0], y: at[1], a }));
    }
    yield* this.tween(frames, (t) => {
      for (const p of ps) {
        p.x = at[0] + Math.cos(p.a) * spread * t;
        p.y = at[1] + Math.sin(p.a) * spread * t;
        p.alpha = 1 - t * t;
      }
    });
    for (const p of ps) b.parts.splice(b.parts.indexOf(p), 1);
  },

  *impact(b, at, big) {
    const p = this.add(b, { img: BattleArt.sprite('star'), x: at[0], y: at[1], scale: big ? 2 : 1.5 });
    for (let i = 0; i < 3; i++) {
      p.hidden = false;
      yield 3;
      p.hidden = true;
      yield 2;
    }
    b.parts.splice(b.parts.indexOf(p), 1);
  },

  *lunge(b, side) {
    const dir = side === b.p ? [1, -1] : [-1, 1];
    yield* this.tween(5, (t) => { side.dx = dir[0] * 8 * t; side.dy = dir[1] * 3 * t; });
    yield* this.tween(5, (t) => { side.dx = dir[0] * 8 * (1 - t); side.dy = dir[1] * 3 * (1 - t); });
    side.dx = 0;
    side.dy = 0;
  },

  *blink(b, side, times = 4) {
    for (let i = 0; i < times; i++) {
      side.hide = true;
      yield 4;
      side.hide = false;
      yield 4;
    }
  },

  *shake(b, side, amount = 3, frames = 16) {
    yield* this.tween(frames, (t, f) => { side.dx = (f % 4 < 2 ? amount : -amount) * (1 - t); });
    side.dx = 0;
  },

  // Blue rising lines for stat boosts, red falling for drops.
  *statChange(b, side, up) {
    Sound.sfx(up ? 'statUp' : 'statDown');
    side.tint = up ? '#6098f8' : '#f86060';
    const [cx, cy] = this.center(b, side);
    const arrows = [];
    for (let i = 0; i < 5; i++) {
      arrows.push(this.add(b, { img: BattleArt.sprite(up ? 'up' : 'down'), x: cx - 20 + i * 10, y: cy, o: i * 7 }));
    }
    yield* this.tween(40, (t, f) => {
      side.tintA = 0.35 + 0.25 * Math.sin(f / 3);
      for (const a of arrows) {
        const k = ((f + a.o) % 20) / 20;
        a.y = up ? cy + 16 - k * 36 : cy - 20 + k * 36;
        a.alpha = Math.sin(k * Math.PI);
      }
    });
    for (const a of arrows) b.parts.splice(b.parts.indexOf(a), 1);
    side.tint = null;
  },

  // Short effect when a status triggers or is given.
  *statusAnim(b, side, status) {
    const [cx, cy] = this.center(b, side);
    if (status === 'par') {
      Sound.sfx('zap');
      side.tint = '#f8e040';
      yield* all(this.burst(b, BattleArt.sprite('spark'), [cx, cy], 8, 26, 20),
        this.tween(20, (t, f) => { side.tintA = f % 4 < 2 ? 0.6 : 0; side.dx = f % 4 < 2 ? 2 : -2; }));
      side.dx = 0;
      side.tint = null;
    } else if (status === 'slp') {
      const zs = [0, 1, 2].map((i) => this.add(b, { img: BattleArt.sprite('zzz'), x: cx + 10, y: cy - 10, o: i * 10 }));
      yield* this.tween(36, (t, f) => {
        for (const z of zs) {
          const k = U.clamp((f - z.o) / 24, 0, 1);
          z.x = cx + 8 + k * 14;
          z.y = cy - 8 - k * 20;
          z.alpha = k > 0 ? Math.sin(k * Math.PI) : 0;
        }
      });
      for (const z of zs) b.parts.splice(b.parts.indexOf(z), 1);
    } else if (status === 'brn') {
      Sound.sfx('fire');
      side.tint = '#f86030';
      yield* all(this.burst(b, BattleArt.sprite('flame'), [cx, cy + 10], 4, 14, 22),
        this.tween(22, (t) => { side.tintA = 0.5 * Math.sin(t * Math.PI); }));
      side.tint = null;
    }
  },

  // The animation for a move, from user side to target side.
  *move(b, fx, user, target) {
    const from = this.center(b, user);
    const to = this.center(b, target);
    switch (fx) {
      case 'leaf':
        Sound.sfx('leaf');
        for (let i = 0; i < 4; i++) {
          Co.start(this.fly(b, BattleArt.sprite('leaf'), [from[0], from[1] + (i - 2) * 6], [to[0] + (i - 2) * 5, to[1]], 18, 14 + i * 4));
          yield 4;
        }
        yield 16;
        yield* this.impact(b, to);
        break;
      case 'water':
        Sound.sfx('water');
        for (let i = 0; i < 7; i++) {
          Co.start(this.fly(b, BattleArt.sprite(i % 2 ? 'drop' : 'bubble'), from, [to[0] + U.randInt(-8, 8), to[1] + U.randInt(-6, 6)], 16, 8));
          yield 3;
        }
        yield 14;
        yield* this.burst(b, BattleArt.sprite('drop'), to, 6, 18, 14);
        break;
      case 'fire':
        Sound.sfx('fire');
        yield* this.fly(b, BattleArt.sprite('flame'), from, to, 16, 10);
        yield* all(this.burst(b, BattleArt.sprite('flame'), to, 5, 16, 18), this.impact(b, to));
        break;
      case 'peck':
        for (let i = 0; i < 2; i++) {
          yield* this.impact(b, [to[0] + (i ? 8 : -6), to[1] + (i ? 4 : -4)]);
        }
        break;
      case 'wind': {
        Sound.sfx('wind');
        const ps = [];
        for (let i = 0; i < 4; i++) ps.push(this.add(b, { img: BattleArt.sprite('wind'), x: to[0], y: to[1], a: i * 1.57 }));
        yield* this.tween(30, (t) => {
          for (const p of ps) {
            p.x = to[0] + Math.cos(p.a + t * 10) * 18 * (1 - t * 0.5);
            p.y = to[1] + Math.sin(p.a + t * 10) * 10 - t * 10;
          }
        });
        for (const p of ps) b.parts.splice(b.parts.indexOf(p), 1);
        yield* this.impact(b, to);
        break;
      }
      case 'rock':
        Sound.sfx('rock');
        for (let i = 0; i < 3; i++) {
          Co.start(this.fly(b, BattleArt.sprite('rock'), [to[0] + (i - 1) * 12, to[1] - 50], [to[0] + (i - 1) * 10, to[1] + 4], 14, 0));
          yield 5;
        }
        yield 14;
        yield* this.impact(b, to, true);
        break;
      case 'bite': {
        const top = this.add(b, { img: BattleArt.sprite('fang'), x: to[0], y: to[1] - 16 });
        const bot = this.add(b, { img: Pix.flipH(BattleArt.sprite('fang')), x: to[0], y: to[1] + 16, flipV: true });
        yield* this.tween(10, (t) => { top.y = to[1] - 16 + t * 12; bot.y = to[1] + 16 - t * 12; });
        b.parts.splice(b.parts.indexOf(top), 1);
        b.parts.splice(b.parts.indexOf(bot), 1);
        yield* this.impact(b, to);
        break;
      }
      case 'drain':
        yield* this.impact(b, to);
        Sound.sfx('potion');
        for (let i = 0; i < 6; i++) {
          Co.start(this.fly(b, BattleArt.sprite('orb'), [to[0] + U.randInt(-10, 10), to[1] + U.randInt(-8, 8)], from, 20, 12));
          yield 4;
        }
        yield 20;
        break;
      case 'sound':
        for (let i = 0; i < 3; i++) {
          Sound.sfx('select');
          Co.start(this.fly(b, BattleArt.sprite('note'), from, [U.lerp(from[0], to[0], 0.6), U.lerp(from[1], to[1], 0.6) - 10 + i * 10], 18, 6));
          yield 8;
        }
        yield 18;
        break;
      case 'wiggle':
        yield* this.shake(b, user, 4, 24);
        break;
      case 'glare':
        b.dim = 0.5;
        yield* this.shake(b, user, 2, 12);
        yield 10;
        b.dim = 0;
        break;
      case 'glow':
        user.tint = '#ffffff';
        yield* this.tween(24, (t, f) => { user.tintA = 0.5 * Math.sin(t * Math.PI); });
        user.tint = null;
        break;
      case 'smoke':
        Sound.sfx('wind');
        yield* this.burst(b, BattleArt.sprite('smoke'), to, 6, 20, 30);
        break;
      case 'bolt': {
        Sound.sfx('zap');
        b.flash = 0.6;
        for (let i = 0; i < 3; i++) {
          const p = this.add(b, { img: BattleArt.sprite('bolt'), x: to[0] + (i - 1) * 10, y: to[1] - 30 });
          yield* this.tween(4, (t) => { p.y = to[1] - 30 + t * 28; });
          b.parts.splice(b.parts.indexOf(p), 1);
        }
        b.flash = 0;
        yield* this.burst(b, BattleArt.sprite('spark'), to, 8, 22, 14);
        break;
      }
      case 'mud':
        Sound.sfx('rock');
        for (let i = 0; i < 5; i++) {
          Co.start(this.fly(b, BattleArt.sprite('mud'), from, [to[0] + U.randInt(-10, 10), to[1] + U.randInt(-6, 6)], 14, 16, 2));
          yield 3;
        }
        yield 16;
        break;
      case 'quake':
        Sound.sfx('rumble');
        yield* this.tween(30, (t, f) => { b.shake = f % 4 < 2 ? 3 : -3; });
        b.shake = 0;
        yield* this.impact(b, to, true);
        break;
      case 'punch':
        for (let i = 0; i < 2; i++) {
          const p = this.add(b, { img: BattleArt.sprite('fist'), x: to[0] + (i ? 10 : -10), y: to[1] + (i ? 4 : -6), scale: 2 });
          Sound.sfx('hit');
          yield 5;
          b.parts.splice(b.parts.indexOf(p), 1);
          yield* this.impact(b, [to[0] + (i ? 10 : -10), to[1]]);
        }
        break;
      case 'claw': {
        const p = this.add(b, { img: BattleArt.sprite('claw'), x: to[0], y: to[1] - 12, scale: 2 });
        yield* this.tween(10, (t) => { p.y = to[1] - 12 + t * 20; });
        b.parts.splice(b.parts.indexOf(p), 1);
        yield* this.impact(b, to);
        break;
      }
      case 'stars':
        Sound.sfx('select');
        for (let i = 0; i < 5; i++) {
          Co.start(this.fly(b, BattleArt.sprite('starp'), from, [to[0] + (i - 2) * 6, to[1] + (i % 2) * 6], 16, 18));
          yield 3;
        }
        yield 16;
        yield* this.impact(b, to);
        break;
      case 'vine':
        Sound.sfx('leaf');
        for (let i = 0; i < 2; i++) {
          const p = this.add(b, { img: BattleArt.sprite('vine'), x: to[0] + (i ? 8 : -8), y: to[1], scale: 3 });
          yield 6;
          b.parts.splice(b.parts.indexOf(p), 1);
        }
        yield* this.impact(b, to);
        break;
      case 'powder':
        Sound.sfx('leaf');
        yield* this.burst(b, BattleArt.sprite('powder'), [to[0], to[1] - 24], 10, 26, 34);
        break;
      case 'string': {
        const lines = [0, 1, 2].map((i) => this.add(b, { img: BattleArt.sprite('silk'), x: from[0], y: from[1] + i * 4 - 4, scale: 2 }));
        yield* this.tween(18, (t) => {
          lines.forEach((l, i) => { l.x = U.lerp(from[0], to[0], t); l.y = U.lerp(from[1], to[1], t) + i * 4 - 4; });
        });
        for (const l of lines) b.parts.splice(b.parts.indexOf(l), 1);
        break;
      }
      case 'ghost': {
        // A shade drifts over to the foe and the screen dims.
        Sound.sfx('hum');
        b.dim = 0.35;
        yield* this.fly(b, BattleArt.sprite('ghost'), from, to, 20, 16, 2);
        yield* all(this.shake(b, target, 3, 14), this.burst(b, BattleArt.sprite('wisp'), to, 6, 18, 16));
        b.dim = 0;
        break;
      }
      case 'wisp':
        Sound.sfx('fire');
        for (let i = 0; i < 3; i++) {
          Co.start(this.fly(b, BattleArt.sprite('wisp'), from, [to[0] + (i - 1) * 10, to[1] - 4 + i * 4], 22, 20, 2));
          yield 6;
        }
        yield 22;
        break;
      case 'wave': {
        // Expanding sound rings.
        const rings = [];
        for (let i = 0; i < 4; i++) {
          Sound.sfx('select');
          const r = this.add(b, { img: BattleArt.sprite('ring'), x: from[0], y: from[1], scale: 1 });
          rings.push(r);
          Co.start(this.tween(18, (t) => { r.x = U.lerp(from[0], to[0], t); r.y = U.lerp(from[1], to[1], t); r.scale = 1 + t * 2; r.alpha = 1 - t * 0.6; }));
          yield 5;
        }
        yield 16;
        for (const r of rings) b.parts.splice(b.parts.indexOf(r), 1);
        yield* all(this.shake(b, target, 3, 12), this.impact(b, to));
        break;
      }
      default:
        yield* this.impact(b, to);
    }
  },
};
