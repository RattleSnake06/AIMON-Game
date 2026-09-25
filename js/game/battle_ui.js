'use strict';
// Battle controls in the style of the DS games' touch screen: a light panel
// with the party balls, a big FIGHT button over BAG / RUN / AIMON, and
// type-coloured move buttons with a CANCEL bar. Buttons can be picked with
// the d-pad or tapped. Also draws the dark slanted HP plates.

const PANEL_Y = 96;
const PANEL_H = 64;
const PLATE_W = 150;   // player's HP plate

const BTN = {
  fight: { base: '#d84838', hi: '#f88870', top: '#e86050', lo: '#982818', edge: '#501010', text: '#f8f8f8', outline: '#681818' },
  bag: { base: '#e0a028', hi: '#f8e070', top: '#f0c040', lo: '#a06010', edge: '#583008', text: '#f8f8f8', outline: '#704008' },
  run: { base: '#3070c8', hi: '#80b8f8', top: '#4890e0', lo: '#18488c', edge: '#0c2448', text: '#f8f8f8', outline: '#103060' },
  mon: { base: '#38a040', hi: '#90e080', top: '#58c058', lo: '#1c6c20', edge: '#0c3810', text: '#f8f8f8', outline: '#104818' },
  blank: { base: '#403848', hi: '#585060', top: '#484050', lo: '#282430', edge: '#18141c' },
};

const CMD_BUTTONS = [
  // index: 0 FIGHT, 1 BAG, 2 AIMON, 3 RUN (same order the battle expects)
  { label: 'FIGHT', col: 'fight', x: 40, y: 14, w: 160, h: 25, big: true },
  { label: 'BAG', col: 'bag', x: 4, y: 41, w: 76, h: 21 },
  { label: 'AIMON', col: 'mon', x: 160, y: 41, w: 76, h: 21 },
  { label: 'RUN', col: 'run', x: 86, y: 44, w: 68, h: 19 },
];

const MOVE_BUTTONS = [
  { x: 4, y: 3, w: 115, h: 23 },
  { x: 121, y: 3, w: 115, h: 23 },
  { x: 4, y: 27, w: 115, h: 23 },
  { x: 121, y: 27, w: 115, h: 23 },
  { x: 32, y: 51, w: 176, h: 13, cancel: true },
];

const BALL_ICON = [
  '.kkkk.',
  'krrrrk',
  'krrrrk',
  'kkwwkk',
  'kwwwwk',
  '.kkkk.',
];

const BattleUI = {
  cache: {},

  // The panel background: light grey with fine lines and a faint ball.
  panel() {
    if (this.cache.panel) return this.cache.panel;
    const c = Pix.canvas(SCREEN_W, PANEL_H);
    const g = c.getContext('2d');
    for (let y = 0; y < PANEL_H; y++) {
      g.fillStyle = y % 2 ? '#d8d8e0' : '#e0e0e8';
      g.fillRect(0, y, SCREEN_W, 1);
    }
    const [cx, cy, R] = [120, 44, 40];
    g.fillStyle = '#c8c8d4';
    for (let y = 0; y < PANEL_H; y++) {
      for (let x = cx - R - 1; x <= cx + R + 1; x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
        const ring = d <= R && d > R - 4;
        const band = d < R && Math.abs(y + 0.5 - cy) < 2.5 && d > 12;
        const hub = d <= 12 && d > 8;
        if (ring || band || hub) g.fillRect(x, y, 1, 1);
      }
    }
    g.fillStyle = '#585860';
    g.fillRect(0, 0, SCREEN_W, 1);
    g.fillStyle = '#f8f8f8';
    g.fillRect(0, 1, SCREEN_W, 1);
    this.cache.panel = c;
    return c;
  },

  ball(kind) {
    const key = `ball_${kind}`;
    if (this.cache[key]) return this.cache[key];
    const pals = {
      ok: { k: '#303030', r: '#e83830', w: '#f8f8f8' },
      status: { k: '#303030', r: '#e8a020', w: '#f8f0c8' },
      fainted: { k: '#606068', r: '#a8a8b0', w: '#c8c8d0' },
      empty: { k: '#b0b0b8', r: '#d0d0d8', w: '#d0d0d8' },
    };
    this.cache[key] = Pix.fromRows(BALL_ICON, pals[kind]);
    return this.cache[key];
  },

  // A row of six balls: one per party member, greyed when fainted.
  partyBalls(g, party, x, y, dir) {
    for (let i = 0; i < 6; i++) {
      const m = party[i];
      const kind = !m ? 'empty' : m.fainted || m.hp <= 0 ? 'fainted' : m.status ? 'status' : 'ok';
      g.drawImage(this.ball(kind), x + dir * i * 7, y);
    }
  },

  // Text with a full one-pixel outline, as on the DS buttons.
  outlined(g, text, cx, y, color, outline) {
    const x = Math.round(cx - Font.width(text) / 2);
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      Font.drawRaw(g, text, x + dx, y + dy, outline);
    }
    Font.drawRaw(g, text, x, y, color);
  },

  // A chunky bevelled button. `down` sinks the face into its base.
  button(g, x, y, w, h, c, down) {
    const round = (x0, y0, w0, h0, col) => {
      g.fillStyle = col;
      g.fillRect(x0 + 2, y0, w0 - 4, h0);
      g.fillRect(x0 + 1, y0 + 1, w0 - 2, h0 - 2);
      g.fillRect(x0, y0 + 2, w0, h0 - 4);
    };
    const d = down ? 2 : 0;
    round(x, y, w, h, c.edge);
    round(x + 1, y + 1 + d, w - 2, h - 2 - d, c.lo);
    round(x + 1, y + 1 + d, w - 2, h - 5, c.base);
    g.fillStyle = c.top;
    g.fillRect(x + 3, y + 2 + d, w - 6, Math.floor((h - 5) / 2) - 1);
    g.fillStyle = c.hi;
    g.fillRect(x + 3, y + 2 + d, w - 6, 1);
    g.fillRect(x + 2, y + 3 + d, 1, h - 9);
    return d;
  },

  // Red corner brackets around the selected button, gently pulsing.
  selector(g, x, y, w, h) {
    const o = Math.floor(Game.frame / 16) % 2;
    const x0 = x - 3 - o;
    const y0 = y - 3 - o;
    const x1 = x + w + 2 + o;
    const y1 = y + h + 2 + o;
    const L = 6;
    for (const [col, k] of [['#681010', 1], ['#f83028', 0]]) {
      g.fillStyle = col;
      const t = 2;
      // top-left, top-right, bottom-left, bottom-right
      g.fillRect(x0 + k, y0 + k, L, t); g.fillRect(x0 + k, y0 + k, t, L);
      g.fillRect(x1 - L + 1 + k, y0 + k, L, t); g.fillRect(x1 - t + 1 + k, y0 + k, t, L);
      g.fillRect(x0 + k, y1 - t + 1 + k, L, t); g.fillRect(x0 + k, y1 - L + 1 + k, t, L);
      g.fillRect(x1 - L + 1 + k, y1 - t + 1 + k, L, t); g.fillRect(x1 - t + 1 + k, y1 - L + 1 + k, t, L);
    }
  },

  // Small rounded type label.
  typeChip(g, x, y, type) {
    const t = TYPES[type];
    const w = Font.width(t.name) + 6;
    g.fillStyle = Pix.shade(t.color, 0.5);
    g.fillRect(x + 1, y, w - 2, 9);
    g.fillRect(x, y + 1, w, 7);
    g.fillStyle = t.color;
    g.fillRect(x + 1, y + 1, w - 2, 7);
    Font.drawRaw(g, t.name, x + 3 + 1, y + 1 + 1, Pix.shade(t.color, 0.45));
    Font.drawRaw(g, t.name, x + 3, y + 1, '#f8f8f8');
    return w;
  },

  // Is a tap inside a button (in panel coordinates)?
  hit(tap, b, top) {
    return tap && tap.x >= b.x && tap.x < b.x + b.w && tap.y >= top + b.y && tap.y < top + b.y + b.h;
  },

  // ---- HP plates ---------------------------------------------------------
  // Dark plate with one slanted end ('right' = slant on the right side).
  plate(g, x, y, w, h, slant) {
    for (let r = 0; r < h; r++) {
      const cut = slant === 'right' ? Math.floor(r / 2) : Math.floor((h - 1 - r) / 2);
      const x0 = slant === 'right' ? x : x + cut;
      const x1 = slant === 'right' ? x + w - cut : x + w;
      g.fillStyle = '#202028';
      g.fillRect(x0, y + r, x1 - x0, 1);
      if (r === 0 || r === h - 1) continue;
      g.fillStyle = r <= 2 ? '#8c8c98' : r >= h - 3 ? '#404048' : '#5c5c68';
      if (slant === 'right') g.fillRect(x0, y + r, x1 - x0 - 1, 1);
      else g.fillRect(x0 + 1, y + r, x1 - x0 - 1, 1);
    }
  },

  enemyPlate(g, b, x, y) {
    const s = b.e;
    const w = 124;
    this.plate(g, x - 4, y, w + 4, 24, 'right');
    const name = s.mon.name;
    Font.draw(g, name, x + 4, y + 3, '#f8f8f8', '#282830');
    Font.drawRight(g, `Lv${s.mon.level}`, x + w - 12, y + 3, '#f8e888', '#282830');
    if (s.mon.status) UI.statusTag(g, x + 12, y + 12, s.mon.status);
    else if (b.wild && State.d.dex.caught[s.mon.species]) g.drawImage(BattleArt.ballImg(), x + 26, y + 12, 8, 8);
    UI.hpBar(g, x + 40, y + 14, s.hp / s.mon.stats.hp, 48);
  },

  playerPlate(g, b, x, y) {
    const s = b.p;
    const w = PLATE_W;
    this.plate(g, x, y, w + 4, 26, 'left');
    Font.draw(g, s.mon.name, x + 16, y + 3, '#f8f8f8', '#282830');
    Font.drawRight(g, `Lv${s.mon.level}`, x + w - 4, y + 3, '#f8e888', '#282830');
    if (s.mon.status) UI.statusTag(g, x + 11, y + 11, s.mon.status);
    UI.hpBar(g, x + 36, y + 13, s.hp / s.mon.stats.hp, 48);
    Font.drawRight(g, `${Math.ceil(s.hp)}/${s.mon.stats.hp}`, x + w - 4, y + 11, '#f8f8f8', '#282830');
    UI.expBar(g, x + 36, y + 20, s.exp, w - 42);
  },
};

// FIGHT / BAG / AIMON / RUN.
class CommandPanel {
  constructor(battle, index, slide) {
    this.b = battle;
    this.index = index;
    this.result = null;
    this.slide = slide ? 0 : 1;
    this.press = 0;
  }

  update() {
    if (this.result !== null) return;
    if (this.slide < 1) {
      this.slide = Math.min(1, this.slide + 1 / 6);
      return;
    }
    if (this.press) {
      if (--this.press === 0) this.result = this.index;
      return;
    }
    const tapped = Input.tap ? CMD_BUTTONS.findIndex((bt) => BattleUI.hit(Input.tap, bt, PANEL_Y)) : -1;
    if (Input.tap && tapped < 0) return;
    // Up/down between FIGHT and the row below; left/right along the row.
    const nav = {
      0: { left: 1, right: 2, down: 3 },
      1: { up: 0, right: 3 },
      3: { up: 0, left: 1, right: 2 },
      2: { up: 0, left: 3 },
    }[this.index];
    for (const d of ['up', 'down', 'left', 'right']) {
      if (Input.repeat(d) && nav[d] !== undefined) {
        this.index = nav[d];
        Sound.sfx('select');
        break;
      }
    }
    if (tapped >= 0 || Input.pressed('a')) {
      if (tapped >= 0) this.index = tapped;
      Sound.sfx('confirm');
      this.press = 7;
    }
  }

  draw(g) {
    const top = PANEL_Y + Math.round((1 - U.clamp(this.slide, 0, 1)) ** 2 * PANEL_H);
    g.drawImage(BattleUI.panel(), 0, top);
    const b = this.b;
    BattleUI.partyBalls(g, State.party, 3, top + 5, 1);
    if (!b.wild) BattleUI.partyBalls(g, b.enemyParty, SCREEN_W - 9, top + 5, -1);
    // The prompt, in a small white box between the ball rows.
    const text = `What will ${b.p.mon.name} do?`;
    const tw = Font.width(text);
    const bx = Math.round(120 - tw / 2 - 6);
    g.fillStyle = '#585860';
    g.fillRect(bx + 1, top + 2, tw + 10, 11);
    g.fillRect(bx, top + 3, tw + 12, 9);
    g.fillStyle = '#f8f8f8';
    g.fillRect(bx + 1, top + 3, tw + 10, 9);
    Font.draw(g, text, bx + 6, top + 4, '#404048', '#d0d0d8');

    CMD_BUTTONS.forEach((bt, i) => {
      const c = BTN[bt.col];
      const down = this.press > 0 && i === this.index;
      const d = BattleUI.button(g, bt.x, top + bt.y, bt.w, bt.h, c, down);
      const ty = top + bt.y + Math.floor((bt.h - 5) / 2) - 3 + d;
      if (bt.big) {
        const icon = MonSprites.icon(b.p.mon.species);
        const gap = 4;
        const total = (icon ? 24 + gap : 0) + Font.width(bt.label);
        let tx = 120 - total / 2;
        if (icon) {
          const bob = Math.floor(Game.frame / 16) % 2;
          g.save();
          g.beginPath();
          g.rect(0, top + bt.y - 1, SCREEN_W, bt.h + 2);
          g.clip();
          g.drawImage(icon, Math.round(tx - 4), top + bt.y - 5 + d - bob);
          g.restore();
          tx += 24 + gap;
        }
        BattleUI.outlined(g, bt.label, tx + Font.width(bt.label) / 2, ty, c.text, c.outline);
      } else {
        BattleUI.outlined(g, bt.label, bt.x + bt.w / 2, ty, c.text, c.outline);
      }
    });
    if (this.slide >= 1) {
      const bt = CMD_BUTTONS[this.index];
      BattleUI.selector(g, bt.x, top + bt.y, bt.w, bt.h);
    }
  }
}

// The four moves plus CANCEL. Returns the move slot, or -1.
class MovePanel {
  constructor(battle, index) {
    this.b = battle;
    this.mon = battle.p.mon;
    this.index = index;
    this.result = null;
    this.press = 0;
  }

  valid(i) { return i === 4 || !!this.mon.moves[i]; }

  update() {
    if (this.result !== null) return;
    if (this.press) {
      if (--this.press === 0) this.result = this.index === 4 ? -1 : this.index;
      return;
    }
    const tapped = Input.tap ? MOVE_BUTTONS.findIndex((bt, i) => this.valid(i) && BattleUI.hit(Input.tap, bt, PANEL_Y)) : -1;
    if (Input.tap && tapped < 0) return;
    let i = this.index;
    if (Input.repeat('left') && i < 4 && i % 2 === 1) i -= 1;
    else if (Input.repeat('right') && i < 4 && i % 2 === 0) i += 1;
    else if (Input.repeat('up')) i = i === 4 ? (this.valid(2) ? 2 : 0) : i >= 2 ? i - 2 : i;
    else if (Input.repeat('down')) i = i < 2 && this.valid(i + 2) ? i + 2 : 4;
    if (i !== this.index && this.valid(i)) {
      this.index = i;
      Sound.sfx('select');
    }
    if (Input.pressed('b')) {
      Sound.sfx('select');
      this.result = -1;
      return;
    }
    if (tapped >= 0 || Input.pressed('a')) {
      if (tapped >= 0) this.index = tapped;
      const m = this.mon.moves[this.index];
      if (m && m.pp <= 0) {
        Co.start(this.b.msg('There\'s no PP left for this move!'));
        return;
      }
      Sound.sfx('confirm');
      this.press = 6;
    }
  }

  draw(g) {
    const top = PANEL_Y;
    g.drawImage(BattleUI.panel(), 0, top);
    MOVE_BUTTONS.forEach((bt, i) => {
      const down = this.press > 0 && i === this.index;
      const y = top + bt.y;
      if (bt.cancel) {
        const c = BTN.run;
        const d = BattleUI.button(g, bt.x, y, bt.w, bt.h, c, down);
        BattleUI.outlined(g, 'CANCEL', bt.x + bt.w / 2, y + 2 + d, c.text, c.outline);
        return;
      }
      const m = this.mon.moves[i];
      if (!m) {
        BattleUI.button(g, bt.x, y, bt.w, bt.h, BTN.blank, false);
        return;
      }
      const mv = MOVES[m.id];
      const tc = TYPES[mv.type].color;
      const c = {
        edge: Pix.shade(tc, 0.4),
        lo: Pix.shade(tc, 0.75),
        base: Pix.mix(tc, '#f8f8e8', 0.72),
        top: Pix.mix(tc, '#f8f8f0', 0.82),
        hi: '#ffffff',
      };
      const d = BattleUI.button(g, bt.x, y, bt.w, bt.h, c, down);
      Font.drawCenter(g, mv.name, bt.x + bt.w / 2, y + 3 + d, '#303038', Pix.mix(tc, '#ffffff', 0.55));
      BattleUI.typeChip(g, bt.x + 5, y + 11 + d, mv.type);
      const col = m.pp === 0 ? '#d02828' : m.pp <= mv.pp / 4 ? '#d06810' : '#404048';
      Font.drawRight(g, `PP ${m.pp}/${mv.pp}`, bt.x + bt.w - 6, y + 12 + d, col, Pix.mix(tc, '#ffffff', 0.55));
    });
    const bt = MOVE_BUTTONS[this.index];
    BattleUI.selector(g, bt.x, top + bt.y, bt.w, bt.h);
  }
}
