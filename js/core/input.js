'use strict';
// Keyboard + touch input, reduced to GBA buttons.
//
// Input.down.x    -> button held this frame
// Input.pressed(x)-> button went down this frame
// Input.repeat(x) -> pressed, or held long enough to auto-repeat (menus)

const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  KeyZ: 'a', Space: 'a', KeyJ: 'a',
  KeyX: 'b', Escape: 'b', Backspace: 'b', KeyK: 'b',
  Enter: 'start', NumpadEnter: 'start',
  ShiftLeft: 'run', ShiftRight: 'run',
  Tab: 'select',
};
// While typing a name only these keys act as buttons; everything else types.
const TEXT_MODE_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Enter', 'NumpadEnter', 'Escape', 'Backspace', 'Space',
]);
const BUTTONS = ['up', 'down', 'left', 'right', 'a', 'b', 'start', 'select', 'run'];

const Input = {
  down: {},
  hit: {},      // latched presses since the last update
  now: {},      // presses visible during the current update
  held: {},     // frames each button has been held
  typed: [],    // characters typed (text mode only)
  textMode: false,
  onFirstGesture: [],

  init() {
    for (const b of BUTTONS) {
      this.down[b] = false;
      this.hit[b] = false;
      this.now[b] = false;
      this.held[b] = 0;
    }
    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));
    window.addEventListener('blur', () => {
      for (const b of BUTTONS) this.down[b] = false;
    });
    this.initTouch();
    // Clicking or tapping the screen focuses the game and counts as A.
    const screen = document.getElementById('screen');
    if (screen) {
      screen.tabIndex = 0;
      screen.addEventListener('pointerdown', () => {
        screen.focus();
        this.gesture();
        if (!this.textMode) this.hit.a = true;
      });
    }
  },

  gesture() {
    const fns = this.onFirstGesture;
    this.onFirstGesture = [];
    for (const f of fns) f();
  },

  onKey(e, isDown) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (isDown) this.gesture();
    if (isDown && e.code === 'KeyM' && !this.textMode) {
      Sound.toggleMute();
      e.preventDefault();
      return;
    }
    if (this.textMode && isDown && !TEXT_MODE_KEYS.has(e.code)) {
      if (e.key.length === 1) this.typed.push(e.key);
      e.preventDefault();
      return;
    }
    const btn = KEYMAP[e.code];
    if (!btn) return;
    e.preventDefault();
    this.set(btn, isDown, e.repeat);
  },

  set(btn, isDown, isRepeat) {
    if (isDown && !this.down[btn] && !isRepeat) this.hit[btn] = true;
    this.down[btn] = isDown;
  },

  update() {
    for (const b of BUTTONS) {
      this.now[b] = this.hit[b];
      this.hit[b] = false;
      this.held[b] = this.down[b] ? this.held[b] + 1 : 0;
    }
  },

  pressed(b) { return this.now[b]; },

  // Menu-style auto-repeat: first press, then every 5 frames after 18.
  repeat(b) {
    if (this.now[b]) return true;
    const h = this.held[b];
    return h > 18 && (h - 18) % 5 === 0;
  },

  // Swallow presses so the next screen doesn't react to the same one.
  clear() {
    for (const b of BUTTONS) {
      this.now[b] = false;
      this.hit[b] = false;
    }
    this.typed.length = 0;
  },

  dirHeld() {
    // Most recently pressed direction wins when several are held.
    let best = null;
    let bestHeld = Infinity;
    for (const d of ['up', 'down', 'left', 'right']) {
      if (this.down[d] && this.held[d] < bestHeld) {
        best = d;
        bestHeld = this.held[d];
      }
    }
    return best;
  },

  initTouch() {
    const mark = () => document.body.classList.add('touch');
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) mark();
    window.addEventListener('touchstart', mark, { once: true, passive: true });

    const pad = document.getElementById('pad');
    if (!pad) return;
    const active = new Map(); // pointerId -> button element
    const release = (id) => {
      const el = active.get(id);
      if (!el) return;
      active.delete(id);
      el.classList.remove('held');
      const btn = el.dataset.btn;
      if (![...active.values()].some((o) => o.dataset.btn === btn)) this.set(btn, false);
    };
    const press = (id, el) => {
      if (active.get(id) === el) return;
      release(id);
      if (!el) return;
      active.set(id, el);
      el.classList.add('held');
      this.set(el.dataset.btn, true);
    };
    const target = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      return el && el.dataset && el.dataset.btn ? el : null;
    };
    pad.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.gesture();
      press(e.pointerId, target(e));
    });
    pad.addEventListener('pointermove', (e) => {
      // Slide a finger across the d-pad to change direction.
      if (active.has(e.pointerId)) press(e.pointerId, target(e));
    });
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) {
      pad.addEventListener(ev, (e) => release(e.pointerId));
    }
    pad.addEventListener('contextmenu', (e) => e.preventDefault());
  },
};
