'use strict';
// Party screen (used from the menu, in battle, and for picking item targets)
// and the summary screen.

class PartyScreen {
  constructor(opts) {
    this.opaque = true;
    this.opts = opts;
    this.mode = opts.mode || 'field';
    this.index = opts.mode === 'forced' ? State.party.findIndex((m) => !m.fainted) : 0;
    if (this.index < 0) this.index = 0;
    this.choice = null;
    this.swapFrom = -1;
    this.msg = opts.msg || (this.mode === 'item' ? 'Use on which AIMON?' : this.mode === 'forced' ? 'Choose the next AIMON.' : 'Choose an AIMON.');
  }

  get n() { return State.party.length; }
  get cancelIndex() { return this.n; }

  update() {
    if (this.choice !== null) return;
    const i = this.index;
    let j = i;
    if (Input.repeat('up')) j = i === 0 ? this.cancelIndex : i === this.cancelIndex ? this.n - 1 : i - 1;
    if (Input.repeat('down')) j = i === this.cancelIndex ? 0 : i + 1 > this.n - 1 ? this.cancelIndex : i + 1;
    if (Input.repeat('left') && i > 0 && i !== this.cancelIndex) j = 0;
    if (Input.repeat('right') && i === 0 && this.n > 1) j = 1;
    if (this.mode === 'forced' && j === this.cancelIndex) j = i;
    if (j !== i) {
      this.index = j;
      Sound.sfx('select');
    }
    if (Input.pressed('a')) {
      Sound.sfx('confirm');
      this.choice = this.index === this.cancelIndex ? -1 : this.index;
    } else if (Input.pressed('b') && this.mode !== 'forced') {
      Sound.sfx('select');
      this.choice = -1;
    }
  }

  draw(g) {
    UI.stripes(g, '#305878', '#386888');
    const party = State.party;
    for (let i = 0; i < 6; i++) {
      const r = this.slotRect(i);
      const mon = party[i];
      if (!mon) {
        g.fillStyle = '#284860';
        g.fillRect(r.x, r.y, r.w, r.h);
        g.fillStyle = '#304f68';
        g.fillRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
        continue;
      }
      const sel = i === this.index;
      const swap = i === this.swapFrom;
      const border = sel ? '#f8a830' : swap ? '#e05050' : '#1c3850';
      const fill = mon.fainted ? '#b86060' : sel ? '#78c0f8' : '#4890d0';
      g.fillStyle = border;
      g.fillRect(r.x, r.y, r.w, r.h);
      g.fillStyle = fill;
      g.fillRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);
      g.fillStyle = 'rgba(255,255,255,0.2)';
      g.fillRect(r.x + 2, r.y + 2, r.w - 4, 3);
      const bounce = sel && Math.floor(Game.frame / 8) % 2 ? -2 : 0;
      const icon = MonSprites.icon(mon.species);
      const txt = '#f8f8f8';
      const sh = '#284860';
      if (i === 0) {
        g.drawImage(icon, r.x + 2, r.y + 4 + bounce);
        Font.draw(g, mon.name, r.x + 36, r.y + 8, txt, sh);
        if (mon.status) UI.statusTag(g, r.x + 44, r.y + 21, mon.status);
        else Font.draw(g, `Lv${mon.level}`, r.x + 44, r.y + 20, txt, sh);
        UI.hpBar(g, r.x + 26, r.y + 36, mon.hp / mon.stats.hp, 48);
        Font.drawRight(g, `${mon.hp}/${mon.stats.hp}`, r.x + r.w - 8, r.y + 44, txt, sh);
      } else {
        g.drawImage(icon, r.x - 2, r.y - 6 + bounce);
        Font.draw(g, mon.name, r.x + 30, r.y + 3, txt, sh);
        if (mon.status) UI.statusTag(g, r.x + r.w - 28, r.y + 3, mon.status);
        else Font.drawRight(g, `Lv${mon.level}`, r.x + r.w - 6, r.y + 3, txt, sh);
        UI.hpBar(g, r.x + 30, r.y + 14, mon.hp / mon.stats.hp, 40);
        Font.drawRight(g, `${mon.hp}/${mon.stats.hp}`, r.x + r.w - 4, r.y + 12, txt, sh);
      }
    }
    UI.window(g, 2, 130, 170, 28);
    Font.draw(g, this.msg, 10, 139, '#404048', '#d0d0c8');
    if (this.mode !== 'forced') {
      const sel = this.index === this.cancelIndex;
      g.fillStyle = sel ? '#f8a830' : '#1c3850';
      g.fillRect(176, 134, 60, 22);
      g.fillStyle = sel ? '#78c0f8' : '#4890d0';
      g.fillRect(178, 136, 56, 18);
      Font.drawCenter(g, 'CANCEL', 206, 140, '#f8f8f8', '#284860');
    }
  }

  slotRect(i) {
    if (i === 0) return { x: 4, y: 24, w: 98, h: 58 };
    return { x: 108, y: 4 + (i - 1) * 25, w: 128, h: 23 };
  }

  *say(text) {
    this.msg = text;
    yield () => Input.pressed('a') || Input.pressed('b');
    Sound.sfx('select');
  }
}

const Party = {
  // Returns the chosen index (or -1). Field mode handles its own sub-menus.
  *open(opts = {}) {
    const scr = new PartyScreen(opts);
    Game.push(scr);
    let result = -1;
    for (;;) {
      scr.choice = null;
      yield () => scr.choice !== null;
      const i = scr.choice;
      if (i < 0) {
        if (scr.swapFrom >= 0) {
          scr.swapFrom = -1;
          scr.msg = 'Choose an AIMON.';
          continue;
        }
        break;
      }
      const mon = State.party[i];
      if (scr.mode === 'item' || scr.mode === 'select') {
        result = i;
        break;
      }
      if (scr.swapFrom >= 0) {
        const a = scr.swapFrom;
        [State.party[a], State.party[i]] = [State.party[i], State.party[a]];
        scr.swapFrom = -1;
        scr.msg = 'Choose an AIMON.';
        continue;
      }
      const battle = scr.mode === 'battle' || scr.mode === 'forced';
      const items = battle ? ['SHIFT', 'SUMMARY', 'CANCEL'] : ['SUMMARY', 'SWITCH', 'CANCEL'];
      scr.msg = 'Do what with this AIMON?';
      const k = yield* Menu.choose({ items, x: 172, y: 160 - (items.length * 16 + 14) - 2, cancel: items.length - 1 });
      scr.msg = scr.mode === 'forced' ? 'Choose the next AIMON.' : 'Choose an AIMON.';
      const pick = items[k];
      if (pick === 'SUMMARY') {
        scr.index = yield* Summary.open(i);
      } else if (pick === 'SWITCH') {
        if (State.party.length < 2) continue;
        scr.swapFrom = i;
        scr.msg = 'Move to where?';
      } else if (pick === 'SHIFT') {
        if (mon.fainted) {
          yield* scr.say(`${mon.name} has no energy left to battle!`);
        } else if (i === opts.active && scr.mode !== 'forced') {
          yield* scr.say(`${mon.name} is already in battle!`);
        } else {
          result = i;
          break;
        }
        scr.msg = scr.mode === 'forced' ? 'Choose the next AIMON.' : 'Choose an AIMON.';
      }
    }
    Game.remove(scr);
    return result;
  },
};

// ---------------------------------------------------------------------------

const Summary = {
  // Returns the index being viewed when closed.
  *open(index, list = State.party) {
    const s = { page: 0, index, done: false, moveCursor: -1 };
    s.opaque = true;
    s.update = () => {
      if (Input.pressed('b')) {
        Sound.sfx('select');
        s.done = true;
      }
      if (Input.repeat('right') && s.page < 2) { s.page++; Sound.sfx('select'); }
      if (Input.repeat('left') && s.page > 0) { s.page--; Sound.sfx('select'); }
      if (Input.repeat('up')) {
        if (s.page === 2) s.moveCursor = Math.max(0, s.moveCursor - 1);
        else if (s.index > 0) { s.index--; Sound.sfx('select'); }
      }
      if (Input.repeat('down')) {
        const mon = list[s.index];
        if (s.page === 2) s.moveCursor = Math.min(mon.moves.length - 1, s.moveCursor + 1);
        else if (s.index < list.length - 1) { s.index++; Sound.sfx('select'); }
      }
      if (s.page !== 2) s.moveCursor = 0;
    };
    s.draw = (g) => this.draw(g, s, list[s.index]);
    Game.push(s);
    yield () => s.done;
    Game.remove(s);
    return s.index;
  },

  draw(g, s, mon) {
    UI.stripes(g, '#e0e8f0', '#d0d8e8');
    const titles = ['AIMON INFO', 'AIMON SKILLS', 'KNOWN MOVES'];
    g.fillStyle = '#304870';
    g.fillRect(0, 0, 240, 16);
    Font.draw(g, titles[s.page], 6, 4, '#f8f8f8', '#182840');
    for (let i = 0; i < 3; i++) {
      g.fillStyle = i === s.page ? '#f8d048' : '#6078a0';
      g.fillRect(200 + i * 12, 5, 8, 6);
    }
    // Picture panel.
    UI.window(g, 4, 20, 84, 104);
    g.fillStyle = '#e8f0e8';
    g.fillRect(8, 24, 76, 70);
    g.drawImage(MonSprites.front(mon.species), 14, 26);
    Font.draw(g, mon.name, 10, 98, '#404048', '#d0d0c8');
    Font.draw(g, `Lv${mon.level}`, 10, 110, '#404048', '#d0d0c8');
    Font.drawRight(g, `No${U.pad(mon.sp.num, 3, '0')}`, 82, 110, '#404048', '#d0d0c8');

    const tx = 96;
    UI.window(g, 90, 20, 146, 138);
    const ink = ['#404048', '#d0d0c8'];
    const row = (label, value, y) => {
      Font.draw(g, label, tx + 2, y, '#5068a0', '#d0d8e8');
      if (value !== undefined) Font.drawRight(g, String(value), 228, y, ...ink);
    };
    if (s.page === 0) {
      row('TYPE', undefined, 28);
      mon.types.forEach((t, i) => UI.typeBadge(g, 180 - i * 50, 26, t));
      row('OT', mon.ot || State.name, 44);
      row('ID No', U.pad(State.d.id, 5, '0'), 58);
      row('ABILITY', mon.sp.ability, 72);
      row('SPECIES', mon.sp.name, 86);
      const lines = Font.wrap(`A ${mon.sp.dex.category} AIMON.`, 132);
      lines.forEach((l, i) => Font.draw(g, l, tx + 2, 104 + i * 14, ...ink));
      UI.window(g, 4, 126, 84, 32);
      Font.draw(g, '◀ ▶ PAGE', 12, 136, ...ink);
    } else if (s.page === 1) {
      row('HP', `${mon.hp}/${mon.stats.hp}`, 28);
      UI.hpBar(g, tx + 64, 40, mon.hp / mon.stats.hp, 48);
      ['atk', 'def', 'spa', 'spd', 'spe'].forEach((k, i) => row(STAT_NAMES[k], mon.stats[k], 50 + i * 13));
      row('EXP POINTS', mon.exp, 118);
      row('NEXT LV', mon.expToNext(), 132);
      UI.expBar(g, tx + 2, 146, mon.expFrac(), 128);
      UI.window(g, 4, 126, 84, 32);
      Font.draw(g, '◀ ▶ PAGE', 12, 136, ...ink);
    } else {
      mon.moves.forEach((m, i) => {
        const mv = MOVES[m.id];
        const y = 26 + i * 22;
        if (i === s.moveCursor) {
          g.fillStyle = '#f8e8a0';
          g.fillRect(tx - 2, y - 3, 138, 21);
        }
        UI.typeBadge(g, tx, y, mv.type);
        Font.draw(g, mv.name, tx + 52, y, ...ink);
        Font.drawRight(g, `PP${m.pp}/${mv.pp}`, 228, y + 9, ...ink);
      });
      const cur = mon.moves[s.moveCursor];
      if (cur) {
        const mv = MOVES[cur.id];
        g.fillStyle = '#c8d0e0';
        g.fillRect(tx - 2, 114, 138, 1);
        Font.draw(g, `POWER ${mv.power || '---'}`, tx, 118, ...ink);
        Font.drawRight(g, `ACC ${mv.acc || '---'}`, 228, 118, ...ink);
        Font.wrap(mv.desc || '', 132).slice(0, 2).forEach((l, i) => Font.draw(g, l, tx, 130 + i * 12, '#606070', '#d0d0c8'));
      }
      UI.window(g, 4, 126, 84, 32);
      Font.draw(g, '▲▼ MOVE', 12, 136, ...ink);
    }
  },
};
