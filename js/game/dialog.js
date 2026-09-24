'use strict';
// The message box: typewriter text, two visible lines that scroll, a
// blinking arrow when waiting for A. '\n' breaks a line, '\f' starts a new
// box of text.

const TEXT_X = 11;
const TEXT_W = 216;

class DialogBox {
  constructor(style) {
    this.style = style;
    this.finished = true;
    this.paras = [];
  }

  show(text, opts = {}) {
    this.opts = opts;
    this.paras = State.text(text).split('\f').map((p) => Font.wrap(p, TEXT_W));
    this.para = 0;
    this.startPara();
    this.finished = false;
    this.idle = 0;
    if (opts.instant) {
      // Show the whole (first) box of text at once.
      this.cur = Math.min(1, this.lines.length - 1);
      this.state = 'shown';
      this.finished = true;
    }
  }

  startPara() {
    this.lines = this.paras[this.para];
    this.top = 0;
    this.cur = 0;
    this.chars = 0;
    this.state = 'typing';
    this.scroll = 0;
    this.autoTimer = 0;
  }

  get speed() { return Input.down.a || Input.down.b ? 3 : 1; }

  update() {
    if (this.finished) {
      // Nothing new was queued right after the last message: close
      // (unless it was asked to stay up, e.g. "X used TACKLE!").
      if (this.opts && this.opts.hold) return;
      if (++this.idle > 1) Game.remove(this);
      return;
    }
    const pressed = Input.pressed('a') || Input.pressed('b');
    switch (this.state) {
      case 'typing': {
        const line = this.lines[this.cur] || '';
        this.chars += this.speed;
        if (this.chars >= line.length) {
          this.chars = line.length;
          this.lineDone();
        }
        break;
      }
      case 'waitScroll':
        if (pressed) {
          Sound.sfx('select');
          this.state = 'scrolling';
          this.scroll = 0;
        }
        break;
      case 'scrolling':
        this.scroll += 4;
        if (this.scroll >= 16) {
          this.top++;
          this.cur++;
          this.chars = 0;
          this.scroll = 0;
          this.state = 'typing';
        }
        break;
      case 'waitPara':
        if (pressed) {
          Sound.sfx('select');
          this.para++;
          this.startPara();
        }
        break;
      case 'waitEnd':
        if (pressed) {
          Sound.sfx('select');
          this.finish();
        }
        break;
      case 'auto':
        if (++this.autoTimer >= this.opts.auto || pressed) this.finish();
        break;
      default:
    }
  }

  lineDone() {
    const more = this.cur < this.lines.length - 1;
    if (more && this.cur === this.top) {
      this.cur++;
      this.chars = 0;
    } else if (more) {
      this.state = 'waitScroll';
    } else if (this.para < this.paras.length - 1) {
      this.state = 'waitPara';
    } else if (this.opts.auto) {
      this.state = 'auto';
    } else if (this.opts.noWait) {
      this.finish();
    } else {
      this.state = 'waitEnd';
    }
  }

  finish() {
    this.finished = true;
    this.state = 'done';
    this.idle = 0;
  }

  draw(g) {
    const s = this.style;
    UI.window(g, 2, 112, 236, 46, s);
    g.save();
    g.beginPath();
    g.rect(6, 115, 228, 40);
    g.clip();
    const y0 = 118 - this.scroll;
    for (let i = this.top; i <= this.cur && i < this.lines.length; i++) {
      const full = this.lines[i];
      const txt = i === this.cur && this.state === 'typing' ? full.slice(0, this.chars) : full;
      UI.text(g, txt, TEXT_X, y0 + (i - this.top) * 16, s);
    }
    g.restore();
    if (this.state === 'waitScroll' || this.state === 'waitPara' || this.state === 'waitEnd') {
      const last = this.lines[this.cur] || '';
      UI.moreArrow(g, TEXT_X + Font.width(last) + 3, 118 + (this.cur - this.top) * 16 + 4, s);
    }
  }
}

const Dialog = {
  box: null,

  open(style) {
    const top = Game.top();
    if (top instanceof DialogBox && top.style === style) return top;
    const box = new DialogBox(style);
    Game.push(box);
    return box;
  },

  // Show a message and wait for the player to read it.
  *say(text, opts = {}) {
    const box = this.open(opts.style || 'field');
    box.show(text, opts);
    yield () => box.finished;
  },

  // Show text, then a choice list over it. Returns the chosen index (-1 = B).
  *ask(text, choices = ['YES', 'NO'], opts = {}) {
    const box = this.open(opts.style || 'field');
    box.show(text, { noWait: true });
    yield () => box.finished;
    const i = yield* Menu.choose({
      items: choices, x: opts.x, y: opts.y, cancel: 'cancel' in opts ? opts.cancel : choices.length - 1,
      style: opts.menuStyle || 'field', anchor: 'right',
    });
    return i;
  },

  *yesNo(text, opts) {
    return (yield* this.ask(text, ['YES', 'NO'], opts)) === 0;
  },

  close() {
    for (const s of Game.scenes.slice()) if (s instanceof DialogBox) Game.remove(s);
  },
};

// Shorthand used all over the scripts.
function* say(text, opts) { yield* Dialog.say(text, opts); }
