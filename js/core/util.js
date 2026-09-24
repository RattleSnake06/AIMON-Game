'use strict';
// Small helpers shared by every module, plus the coroutine scheduler that
// drives cutscenes, dialog and battles.

const SCREEN_W = 240;
const SCREEN_H = 160;
const TILE = 16;

const U = {
  clamp: (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v),
  lerp: (a, b, t) => a + (b - a) * t,
  rand: (n) => Math.floor(Math.random() * n),
  randInt: (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1)),
  chance: (p) => Math.random() < p,
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],

  // Pick from [{weight, ...}] proportionally to weight.
  weighted(list) {
    const total = list.reduce((s, e) => s + e.weight, 0);
    let r = Math.random() * total;
    for (const e of list) {
      r -= e.weight;
      if (r < 0) return e;
    }
    return list[list.length - 1];
  },

  // Deterministic generator, used so procedural art looks the same every run.
  seeded(seed) {
    let s = seed >>> 0;
    return () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  },

  pad: (v, n, ch = ' ') => String(v).padStart(n, ch),

  dirVec: {
    up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
  },
  opposite: { up: 'down', down: 'up', left: 'right', right: 'left' },

  formatTime(frames) {
    const mins = Math.floor(frames / 3600);
    return `${Math.floor(mins / 60)}:${U.pad(mins % 60, 2, '0')}`;
  },
};

// ---------------------------------------------------------------------------
// Coroutines
//
// Game logic is written as generator functions. Inside one:
//   yield            -> resume next frame
//   yield 12         -> resume after 12 frames
//   yield () => ok   -> resume on the first frame where ok() is true
//   yield* other()   -> run a sub-routine and get its return value
// Everything runs inside the fixed 60 Hz update, so it's deterministic and
// the screen never draws a half-finished state.

const Co = {
  list: [],

  start(gen, onDone) {
    const c = { gen, wait: 0, until: null, done: false, onDone, result: undefined };
    this.list.push(c);
    return c;
  },

  tick() {
    const running = this.list.slice();
    for (const c of running) this.step(c);
    this.list = this.list.filter((c) => !c.done);
  },

  step(c) {
    if (c.done) return;
    if (c.wait > 0 && --c.wait > 0) return;
    if (c.until) {
      if (!c.until()) return;
      c.until = null;
    }
    let r;
    try {
      r = c.gen.next();
    } catch (err) {
      c.done = true;
      Game.fatal(err);
      return;
    }
    if (r.done) {
      c.done = true;
      c.result = r.value;
      if (c.onDone) c.onDone(r.value);
      return;
    }
    const y = r.value;
    if (typeof y === 'number') c.wait = y;
    else if (typeof y === 'function') c.until = y;
  },

  stopAll() {
    for (const c of this.list) c.done = true;
    this.list = [];
  },
};

// Run several routines side by side and wait for all of them.
function* all(...gens) {
  const cs = gens.map((g) => Co.start(g));
  yield () => cs.every((c) => c.done);
}

function* wait(frames) {
  if (frames > 0) yield frames;
}

function* waitUntil(fn) {
  yield fn;
}
