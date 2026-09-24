'use strict';
// Battle backgrounds, particles and move animations.

const BattleArt = {
  cache: {},

  bg(kind) {
    if (this.cache[kind]) return this.cache[kind];
    const c = Pix.canvas(SCREEN_W, 112);
    const g = c.getContext('2d');
    if (kind === 'indoor') {
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
    const [rim, fill, hi] = kind === 'indoor' ? ['#8888a0', '#b0b0c8', '#c8c8dc'] : ['#68a050', '#88c068', '#a8d888'];
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
      down: [['..www..', '..www..', 'www.www', '.wwwww.', '..www..', '...w...'], { w: '#f86060' }],
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
  *fly(b, img, from, to, frames, arc = 0) {
    const p = this.add(b, { img, x: from[0], y: from[1] });
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
      default:
        yield* this.impact(b, to);
    }
  },
};
