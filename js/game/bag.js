'use strict';
// The bag: ITEMS, BALLS, TMs and KEY ITEMS pockets. In battle it returns
// what to use; in the field it lets you use items, TMs and key items.

const POCKETS = [['items', 'ITEMS'], ['balls', 'BALLS'], ['tms', 'TMs'], ['key', 'KEY ITEMS']];

class BagScreen {
  constructor(opts) {
    this.opaque = true;
    this.opts = opts;
    this.pocket = opts.pocket || 0;
    this.cursor = POCKETS.map(() => 0);
    this.scroll = POCKETS.map(() => 0);
    this.choice = null;
  }

  list() { return State.pocket(POCKETS[this.pocket][0]); }

  update() {
    if (this.choice !== null) return;
    const items = this.list();
    const n = items.length + 1; // + CLOSE BAG
    let c = Math.min(this.cursor[this.pocket], n - 1);
    if (Input.repeat('up') && c > 0) { c--; Sound.sfx('select'); }
    if (Input.repeat('down') && c < n - 1) { c++; Sound.sfx('select'); }
    if (Input.repeat('left') && this.pocket > 0) { this.pocket--; Sound.sfx('select'); return; }
    if (Input.repeat('right') && this.pocket < POCKETS.length - 1) { this.pocket++; Sound.sfx('select'); return; }
    this.cursor[this.pocket] = c;
    const vis = 6;
    if (c < this.scroll[this.pocket]) this.scroll[this.pocket] = c;
    if (c >= this.scroll[this.pocket] + vis) this.scroll[this.pocket] = c - vis + 1;
    if (Input.pressed('a')) {
      Sound.sfx('confirm');
      this.choice = c < items.length ? items[c] : 'close';
    } else if (Input.pressed('b')) {
      Sound.sfx('select');
      this.choice = 'close';
    }
  }

  current() {
    const items = this.list();
    return items[this.cursor[this.pocket]] || null;
  }

  draw(g) {
    UI.stripes(g, '#f0d8a0', '#e8d098');
    // Pocket header and bag picture.
    UI.window(g, 2, 2, 86, 26, 'sign');
    Font.drawCenter(g, POCKETS[this.pocket][1], 45, 10, '#404048', '#d8d0b8');
    if (this.pocket > 0) Font.draw(g, '◀', 8, 10, '#e05038', null);
    if (this.pocket < POCKETS.length - 1) Font.draw(g, '▶', 78, 10, '#e05038', null);
    g.drawImage(Bag.picture(), 12, 34);

    const items = this.list();
    UI.window(g, 92, 2, 146, 108);
    const start = this.scroll[this.pocket];
    const rows = [...items, 'close'];
    for (let i = start; i < Math.min(rows.length, start + 6); i++) {
      const y = 10 + (i - start) * 16;
      const id = rows[i];
      if (id === 'close') Font.draw(g, 'CLOSE BAG', 108, y, '#404048', '#d0d0c8');
      else {
        Font.draw(g, ITEMS[id].name, 108, y, '#404048', '#d0d0c8');
        if (ITEMS[id].toggle) Font.drawRight(g, State.d.expShareOn ? 'ON' : 'OFF', 230, y, State.d.expShareOn ? '#3890e0' : '#909098', '#d0d0c8');
        else if (ITEMS[id].pocket !== 'tms' && ITEMS[id].pocket !== 'key') Font.drawRight(g, `×${ITEMS[id].infinite ? '∞' : State.count(id)}`, 230, y, '#404048', '#d0d0c8');
      }
      if (i === this.cursor[this.pocket]) UI.cursor(g, 99, y);
    }
    if (start > 0) Font.draw(g, '▲', 162, 1, '#e05038', null);
    if (start + 6 < rows.length) Font.draw(g, '▼', 162, 101, '#e05038', null);

    UI.window(g, 2, 112, 236, 46);
    const cur = this.current();
    const desc = cur ? ITEMS[cur].desc : 'Close the bag and go back.';
    Font.wrap(this.message || desc, 216).slice(0, 2).forEach((l, i) => Font.draw(g, l, 11, 120 + i * 16, '#404048', '#d0d0c8'));
  }

  *say(text) {
    this.message = State.text(text);
    yield () => Input.pressed('a') || Input.pressed('b');
    Sound.sfx('select');
    this.message = null;
  }
}

const Bag = {
  pic: null,

  picture() {
    if (this.pic) return this.pic;
    const p = new Painter(64, 64);
    const st = (c) => ({ fill: c, shade: Pix.shade(c, 0.78), hi: Pix.mix(c, '#ffffff', 0.3), line: '#302418' });
    p.rrect(8, 14, 48, 46, 10, st('#d89048'));
    p.rrect(14, 4, 36, 14, 6, st('#b87038'));
    p.rect(18, 8, 28, 3, { fill: '#302418', line: false });
    p.rrect(14, 30, 36, 20, 4, st('#e8a858'));
    p.rect(29, 26, 6, 10, st('#f8d048'));
    this.pic = p.toCanvas();
    return this.pic;
  },

  // opts: { battle, wild, active }
  *open(opts = {}) {
    const scr = new BagScreen(opts);
    Game.push(scr);
    let result = null;
    for (;;) {
      scr.choice = null;
      yield () => scr.choice !== null;
      const id = scr.choice;
      if (id === 'close') break;
      const it = ITEMS[id];
      if (opts.battle) {
        if (it.pocket === 'key' || it.pocket === 'tms' || it.field || it.rod) {
          yield* scr.say('This can\'t be used in battle.');
          continue;
        }
        if (it.ball) {
          if (!opts.wild) {
            yield* scr.say('You can\'t catch another trainer\'s AIMON!');
            continue;
          }
          if (State.party.length >= 6 && State.d.box.length >= 60) {
            yield* scr.say('There\'s no room for more AIMON!');
            continue;
          }
          result = { item: id };
          break;
        }
        const target = yield* this.pickTarget(scr, id);
        if (target >= 0) {
          result = { item: id, target };
          break;
        }
        continue;
      }
      // Field use.
      if (it.toggle) {
        State.d.expShareOn = !State.d.expShareOn;
        Sound.sfx('confirm');
        yield* scr.say(`The ${it.name} was turned ${State.d.expShareOn ? 'ON' : 'OFF'}.`);
        continue;
      }
      if (it.tm) {
        const learned = yield* this.useTM(scr, id);
        if (learned === 'close') { result = null; break; }
        continue;
      }
      if (it.rod) {
        const k = yield* Menu.choose({ items: ['USE', 'CANCEL'], x: 170, y: 58, cancel: 1 });
        if (k !== 0) continue;
        Game.remove(scr);
        OW.pendingFish = true;
        return null;
      }
      const choices = it.pocket === 'key' ? ['CANCEL'] : it.infinite ? ['USE', 'CANCEL'] : ['USE', 'TOSS', 'CANCEL'];
      const k = yield* Menu.choose({ items: choices, x: 170, y: 58, cancel: choices.length - 1 });
      if (it.pocket === 'key' || (it.infinite && k !== 0)) continue;
      if (k === 0) {
        if (it.ball) {
          yield* scr.say('There\'s nothing to catch here!');
          continue;
        }
        if (it.repel) {
          if (State.d.repel > 0) {
            yield* scr.say('The last REPEL is still working.');
            continue;
          }
          State.removeItem(id);
          State.d.repel = it.repel;
          Sound.sfx('potion');
          yield* scr.say('{PLAYER} used the REPEL.\nWeak wild AIMON will stay away.');
          continue;
        }
        if (it.escape) {
          if (!OW.map.def.escape) {
            yield* scr.say('This can\'t be used here.');
            continue;
          }
          State.removeItem(id);
          Game.remove(scr);
          OW.pendingEscape = true;
          return null;
        }
        if (it.candy) {
          // The supply is endless, so keep offering it until B.
          for (let at = 0; ;) {
            const target = yield* this.pickTarget(scr, id, at);
            if (target < 0) break;
            at = target;
            yield* this.useCandy(scr, State.party[target]);
          }
          continue;
        }
        const target = yield* this.pickTarget(scr, id);
        if (target >= 0) {
          const mon = State.party[target];
          State.removeItem(id);
          Sound.sfx('potion');
          if (it.revive) {
            mon.hp = Math.floor(mon.stats.hp / 2);
            yield* scr.say(`${mon.name} was revived!`);
          } else if (it.cure) {
            const st = mon.status;
            mon.status = null;
            yield* scr.say(`${mon.name} ${STATUS[st].cured}`);
          } else {
            const before = mon.hp;
            mon.hp = Math.min(mon.stats.hp, mon.hp + it.heal);
            yield* scr.say(`${mon.name}'s HP was restored by ${mon.hp - before} points.`);
          }
        }
      } else if (k === 1) {
        const n = yield* Menu.quantity(State.count(id));
        if (n > 0) {
          State.removeItem(id, n);
          yield* scr.say(`Threw away ${n} ${it.name}${n > 1 ? 'S' : ''}.`);
        }
      }
    }
    Game.remove(scr);
    return result;
  },

  // Teach a TM's move to a party member (TMs are reusable).
  *useTM(scr, id) {
    const mv = ITEMS[id].tm;
    const i = yield* Party.open({ mode: 'item', msg: `Teach ${MOVES[mv].name} to which AIMON?` });
    if (i < 0) return false;
    const mon = State.party[i];
    const { compat, also } = TMS[id] || {};
    if (compat && !mon.types.some((t) => compat.includes(t)) && !(also || []).includes(mon.species)) {
      yield* scr.say(`${mon.name} can't learn ${MOVES[mv].name}.`);
      return false;
    }
    Game.remove(scr);
    Sound.sfx('boot');
    const ok = yield* learnMoveFlow(mon, mv, 'field');
    Game.push(scr);
    return ok;
  },

  // RARE CANDY: one level up, with any new moves and a possible evolution.
  *useCandy(scr, mon) {
    const before = { ...mon.stats };
    mon.exp = Mon.expFor(mon.level + 1);
    const { newMoves } = mon.levelUp();
    Sound.jingle('levelup');
    yield* scr.say(`${mon.name} grew to Lv. ${mon.level}!`);
    yield* StatWindow.show(before, mon.stats);
    for (const mv of newMoves) yield* learnMoveFlow(mon, mv, 'field');
    Dialog.close();
    const evo = mon.sp.evo;
    if (evo && mon.level >= evo.level && !mon.fainted) {
      yield* Game.fadeOut(16);
      yield* Evolution.run(mon, evo.to);
      Sound.playMusic(OW.music());
      yield* Game.fadeIn(16);
    }
  },

  // Choose which AIMON an item is for; checks it would do something.
  *pickTarget(scr, id, index = 0) {
    const it = ITEMS[id];
    for (;;) {
      const i = yield* Party.open({ mode: 'item', index });
      if (i < 0) return -1;
      const mon = State.party[i];
      const useful = it.candy ? mon.level < MAX_LEVEL
        : it.revive ? mon.fainted
        : it.cure ? !mon.fainted && it.cure.includes(mon.status)
          : !mon.fainted && mon.hp < mon.stats.hp;
      if (useful) return i;
      yield* scr.say('It won\'t have any effect.');
    }
  },
};
