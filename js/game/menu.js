'use strict';
// Generic cursor menus. `yield* Menu.choose({...})` returns the index picked,
// or -1 when cancelled with B.

class ChoiceMenu {
  constructor(o) {
    this.items = o.items.map((it) => (typeof it === 'string' ? { label: it } : it));
    this.cols = o.cols || 1;
    this.rowH = o.rowH || 16;
    this.style = o.style || 'field';
    this.cancel = 'cancel' in o ? o.cancel : -1; // index returned by B, or null to disable B
    this.index = o.index || 0;
    this.visible = o.visible || this.items.length;
    this.scrollTop = 0;
    this.onMove = o.onMove;
    this.drawItem = o.drawItem;
    this.sounds = o.sounds !== false;
    this.startCloses = !!o.startCloses;
    const textW = Math.max(...this.items.map((it) => Font.width(it.label)), 16);
    const colW = o.colW || textW + 16;
    this.colW = colW;
    this.w = o.w || colW * this.cols + 16;
    const rows = Math.ceil(Math.min(this.items.length, this.visible) / (this.cols === 1 ? 1 : 1));
    this.h = o.h || (this.cols === 1 ? rows : Math.ceil(this.items.length / this.cols)) * this.rowH + 14;
    this.x = o.x ?? (o.anchor === 'right' ? SCREEN_W - this.w - 2 : 2);
    this.y = o.y ?? (o.anchor === 'right' ? 112 - this.h - 2 : 2);
    this.result = null;
    this.frame = o.noFrame ? false : true;
    this.ensureVisible();
    if (this.onMove) this.onMove(this.index, this);
  }

  ensureVisible() {
    if (this.cols !== 1) return;
    if (this.index < this.scrollTop) this.scrollTop = this.index;
    if (this.index >= this.scrollTop + this.visible) this.scrollTop = this.index - this.visible + 1;
  }

  move(d) {
    const n = this.items.length;
    let i = this.index;
    if (this.cols === 1) {
      i = (i + d + n) % n;
    } else {
      const dx = d === 'left' ? -1 : d === 'right' ? 1 : 0;
      const dy = d === 'up' ? -1 : d === 'down' ? 1 : 0;
      const col = i % this.cols;
      const row = Math.floor(i / this.cols);
      const nc = col + dx;
      const nr = row + dy;
      const j = nr * this.cols + nc;
      if (nc < 0 || nc >= this.cols || nr < 0 || j >= n) return;
      i = j;
    }
    if (i !== this.index) {
      this.index = i;
      if (this.sounds) Sound.sfx('select');
      this.ensureVisible();
      if (this.onMove) this.onMove(i, this);
    }
  }

  update() {
    if (this.result !== null) return;
    if (this.cols === 1) {
      if (Input.repeat('up')) this.move(-1);
      else if (Input.repeat('down')) this.move(1);
    } else {
      for (const d of ['up', 'down', 'left', 'right']) if (Input.repeat(d)) this.move(d);
    }
    if (Input.pressed('a') || (Input.pressed('start') && this.startSelects)) {
      const it = this.items[this.index];
      if (it.disabled) {
        Sound.sfx('bump');
        return;
      }
      if (this.sounds) Sound.sfx('confirm');
      this.result = this.index;
    } else if ((Input.pressed('b') || (Input.pressed('start') && this.startCloses)) && this.cancel !== null) {
      if (this.sounds) Sound.sfx('select');
      this.result = this.cancel;
    }
  }

  draw(g) {
    if (this.frame) UI.window(g, this.x, this.y, this.w, this.h, this.style);
    const s = WINDOW_STYLES[this.style];
    if (this.cols === 1) {
      const end = Math.min(this.items.length, this.scrollTop + this.visible);
      for (let i = this.scrollTop; i < end; i++) {
        const it = this.items[i];
        const y = this.y + 7 + (i - this.scrollTop) * this.rowH;
        const x = this.x + 15;
        if (this.drawItem) this.drawItem(g, it, x, y, i);
        else Font.draw(g, it.label, x, y, it.disabled ? '#a0a0a8' : s.text, s.shadow);
        if (i === this.index) UI.cursor(g, this.x + 6, y, this.style);
      }
      if (this.scrollTop > 0) Font.draw(g, '▲', this.x + this.w / 2 - 3, this.y - 1 + Math.floor(Game.frame / 16) % 2, '#e05038', null);
      if (end < this.items.length) Font.draw(g, '▼', this.x + this.w / 2 - 3, this.y + this.h - 9 + Math.floor(Game.frame / 16) % 2, '#e05038', null);
    } else {
      this.items.forEach((it, i) => {
        const col = i % this.cols;
        const row = Math.floor(i / this.cols);
        const x = this.x + 15 + col * this.colW;
        const y = this.y + 7 + row * this.rowH;
        if (this.drawItem) this.drawItem(g, it, x, y, i);
        else Font.draw(g, it.label, x, y, it.disabled ? '#a0a0a8' : s.text, s.shadow);
        if (i === this.index) UI.cursor(g, x - 9, y, this.style);
      });
    }
  }
}

const Menu = {
  *choose(opts) {
    const m = new ChoiceMenu(opts);
    Game.push(m);
    yield () => m.result !== null;
    Game.remove(m);
    return m.result;
  },

  *yesNo(opts = {}) {
    const i = yield* this.choose({ items: ['YES', 'NO'], anchor: 'right', cancel: 1, ...opts });
    return i === 0;
  },

  // Pick a quantity with up/down (x1) and left/right (x10).
  *quantity(max, price) {
    const q = { n: 1, result: null };
    q.update = () => {
      let d = 0;
      if (Input.repeat('up')) d = 1;
      if (Input.repeat('down')) d = -1;
      if (Input.repeat('right')) d = 10;
      if (Input.repeat('left')) d = -10;
      if (d) {
        let n = q.n + d;
        if (n > max) n = Math.abs(d) === 1 ? 1 : max;
        if (n < 1) n = Math.abs(d) === 1 ? max : 1;
        if (n !== q.n) Sound.sfx('select');
        q.n = n;
      }
      if (Input.pressed('a')) { Sound.sfx('confirm'); q.result = q.n; }
      if (Input.pressed('b')) { Sound.sfx('select'); q.result = 0; }
    };
    q.draw = (g) => {
      const w = price ? 104 : 48;
      const x = SCREEN_W - w - 2;
      UI.window(g, x, 80, w, 30);
      Font.draw(g, `×${U.pad(q.n, 2, '0')}`, x + 10, 88, '#404048', '#d0d0c8');
      if (price) Font.drawRight(g, UI.money(q.n * price), x + w - 10, 88, '#404048', '#d0d0c8');
      Font.draw(g, '▲', x + 14, 80 - 5 + (Game.frame >> 4) % 2, '#e05038', null);
      Font.draw(g, '▼', x + 14, 103 + (Game.frame >> 4) % 2, '#e05038', null);
    };
    Game.push(q);
    yield () => q.result !== null;
    Game.remove(q);
    return q.result;
  },
};
