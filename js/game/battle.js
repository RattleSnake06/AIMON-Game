'use strict';
// Turn-based battles in the GBA style: wild encounters and trainer battles,
// catching, experience, level-ups and learning moves.

const STRUGGLE = { name: 'STRUGGLE', type: 'normal', cat: 'physical', power: 50, acc: 0, pp: 1, fx: 'hit', recoil: 0.25 };

function stageMult(s) { return s >= 0 ? (2 + s) / 2 : 2 / (2 - s); }
function accMult(s) { return s >= 0 ? (3 + s) / 3 : 3 / (3 - s); }

class Battle {
  constructor(opts) {
    this.opaque = true;
    this.trainerId = opts.trainer || null;
    this.tr = this.trainerId ? TRAINERS[this.trainerId] : null;
    this.wild = !this.tr;
    this.enemyParty = this.wild
      ? [new Mon(opts.wild.species, opts.wild.level)]
      : this.tr.party().map(([s, l, moves]) => new Mon(s, l, moves ? { moves: moves.map((id) => ({ id, pp: MOVES[id].pp })) } : {}));
    this.bgKind = OW.map && OW.map.def.outdoor ? 'grass' : 'indoor';
    this.pi = State.party.findIndex((m) => !m.fainted);
    this.ei = 0;
    this.p = this.side(State.party[this.pi], true);
    this.e = this.side(this.enemyParty[0], false);
    this.participants = new Set([this.pi]);
    this.parts = [];
    this.slide = 0;
    this.trainerX = null;      // enemy trainer sprite offset (null = hidden)
    this.playerTrainerX = 0;   // player's back sprite offset (null = hidden)
    this.playerThrow = false;
    this.ball = null;          // thrown ball {x, y, angle, open}
    this.dim = 0;
    this.escapes = 0;
    this.result = null;
    this.done = false;
    this.lastAction = 0;
    this.lastMove = 0;
    Co.start(this.main());
  }

  side(mon, isPlayer) {
    return {
      mon, isPlayer,
      st: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 },
      hp: mon.hp, exp: mon.expFrac(),
      vis: false, hide: false, dx: 0, dy: 0, scale: 1, white: 0, sink: 0,
      hud: false, hudX: 0, tint: null, tintA: 0, flinch: false,
    };
  }

  other(s) { return s === this.p ? this.e : this.p; }

  prefix(s) {
    if (s.isPlayer) return '';
    return this.wild ? 'Wild ' : 'Foe ';
  }

  nameOf(s) { return `${this.prefix(s)}${s.mon.name}`; }

  get trainerTitle() { return `${this.tr.cls} ${this.tr.name}`; }

  // ---- messages ------------------------------------------------------------
  *msg(text, mode) {
    // mode: undefined = wait for A, 'auto' = short pause, 'hold' = stay up
    const opts = { style: 'battle' };
    if (mode === 'auto') opts.auto = 40;
    if (mode === 'hold') { opts.noWait = true; opts.hold = true; }
    yield* Dialog.say(text, opts);
  }

  // ---- main flow -----------------------------------------------------------
  *main() {
    yield* this.intro();
    while (!this.result) {
      const act = yield* this.chooseAction();
      yield* this.turn(act);
    }
    yield* this.outro();
    Dialog.close();
    yield* Game.fadeOut(16);
    this.done = true;
  }

  *intro() {
    const e = this.e;
    if (this.wild) {
      e.vis = true;
      State.markSeen(e.mon.species);
    } else {
      this.trainerX = 0;
    }
    Co.start(Game.fadeIn(12));
    yield* BattleFX.tween(50, (t) => { this.slide = t; });
    this.slide = 1;
    if (this.wild) {
      Sound.cry(e.mon.species);
      yield* this.showHud(e);
      yield* this.msg(`Wild ${e.mon.name} appeared!`);
    } else {
      yield* this.msg(`${this.trainerTitle} would like to battle!`);
      yield* BattleFX.tween(20, (t) => { this.trainerX = t * 110; });
      this.trainerX = null;
      yield* this.sendOutEnemy();
    }
    yield* this.sendOutPlayer(true);
  }

  *showHud(s) {
    s.hud = true;
    yield* BattleFX.tween(10, (t) => { s.hudX = (1 - t) * (s.isPlayer ? 120 : -120); });
    s.hudX = 0;
  }

  *sendOutEnemy() {
    const e = this.e;
    State.markSeen(e.mon.species);
    yield* this.msg(`${this.trainerTitle} sent out ${e.mon.name}!`, 'hold');
    Sound.sfx('ballThrow');
    this.ball = { x: 176, y: 20, angle: 0 };
    yield* BattleFX.tween(12, (t) => { this.ball.y = 20 + t * 48; this.ball.angle = t * 6; });
    yield* this.popOut(e);
    yield* this.showHud(e);
  }

  // Ball opens and the creature grows out of a white flash.
  *popOut(s) {
    Sound.sfx('ballOpen');
    this.ball = null;
    const at = BattleFX.center(this, s);
    Co.start(BattleFX.burst(this, BattleArt.sprite('sparkle'), [at[0], at[1] + 16], 8, 22, 16));
    s.vis = true;
    s.hp = s.mon.hp;
    s.exp = s.mon.expFrac();
    yield* BattleFX.tween(12, (t) => { s.scale = 0.2 + 0.8 * t; s.white = 1; });
    yield* BattleFX.tween(8, (t) => { s.white = 1 - t; });
    s.scale = 1;
    s.white = 0;
    Sound.cry(s.mon.species);
    yield 20;
  }

  *sendOutPlayer(first) {
    const p = this.p;
    yield* this.msg(`Go! ${p.mon.name}!`, 'hold');
    if (first) {
      this.playerThrow = true;
      yield 6;
    }
    Sound.sfx('ballThrow');
    this.ball = { x: 30, y: 70, angle: 0 };
    const trainerOut = first ? BattleFX.tween(24, (t) => { this.playerTrainerX = -t * 110; }) : null;
    if (trainerOut) Co.start(trainerOut);
    yield* BattleFX.tween(22, (t) => {
      this.ball.x = 30 + t * 38;
      this.ball.y = 70 + t * 22 - Math.sin(t * Math.PI) * 40;
      this.ball.angle = t * 10;
    });
    if (first) this.playerTrainerX = null;
    yield* this.popOut(p);
    this.participants.add(this.pi);
    yield* this.showHud(p);
  }

  // ---- choosing ------------------------------------------------------------
  *chooseAction() {
    for (;;) {
      const box = Dialog.open('battle');
      box.show(`What will\n${this.p.mon.name} do?`, { noWait: true, hold: true });
      yield () => box.finished;
      this.bob = true;
      const i = yield* Menu.choose({
        items: ['FIGHT', 'BAG', 'AIMON', 'RUN'], cols: 2, x: 120, y: 112, w: 120, h: 48, colW: 56,
        cancel: null, index: this.lastAction,
      });
      this.bob = false;
      this.lastAction = i;
      if (i === 0) {
        const usable = this.p.mon.moves.some((m) => m.pp > 0);
        if (!usable) {
          yield* this.msg(`${this.p.mon.name} has no moves left!`, 'auto');
          return { type: 'move', struggle: true };
        }
        const slot = yield* this.chooseMove();
        if (slot >= 0) return { type: 'move', slot };
      } else if (i === 1) {
        const r = yield* Bag.open({ battle: true, wild: this.wild, active: this.pi });
        if (r) return { type: 'item', ...r };
      } else if (i === 2) {
        const idx = yield* Party.open({ mode: 'battle', active: this.pi });
        if (idx >= 0) return { type: 'switch', idx };
      } else {
        if (!this.wild) {
          yield* this.msg('No! There\'s no running from a trainer battle!');
          continue;
        }
        return { type: 'run' };
      }
    }
  }

  *chooseMove() {
    const mon = this.p.mon;
    const items = mon.moves.map((m) => ({ label: MOVES[m.id].name, disabled: m.pp <= 0 }));
    while (items.length < 4) items.push({ label: '-', disabled: true });
    const menu = new ChoiceMenu({
      items, cols: 2, x: 0, y: 112, w: 160, h: 48, colW: 72, cancel: -1,
      index: Math.min(this.lastMove, mon.moves.length - 1),
    });
    const baseDraw = menu.draw.bind(menu);
    menu.draw = (g) => {
      baseDraw(g);
      UI.window(g, 160, 112, 80, 48);
      const m = mon.moves[menu.index];
      if (!m) return;
      const mv = MOVES[m.id];
      Font.draw(g, 'PP', 168, 120, '#404048', '#d0d0c8');
      const low = m.pp === 0 ? '#e03030' : m.pp <= mv.pp / 4 ? '#e07818' : '#404048';
      Font.drawRight(g, `${m.pp}/${mv.pp}`, 230, 120, low, '#d0d0c8');
      Font.draw(g, 'TYPE/', 168, 136, '#404048', '#d0d0c8');
      Font.drawRight(g, TYPES[mv.type].name, 230, 136, '#404048', '#d0d0c8');
    };
    // Disabled entries: allow the cursor on them but refuse A for empty PP.
    const origUpdate = menu.update.bind(menu);
    menu.update = () => {
      if (Input.pressed('a') && mon.moves[menu.index] && mon.moves[menu.index].pp <= 0) {
        Input.now.a = false;
        Co.start(this.msg('There\'s no PP left for this move!'));
        return;
      }
      origUpdate();
    };
    Game.push(menu);
    yield () => menu.result !== null;
    Game.remove(menu);
    if (menu.result >= 0) this.lastMove = menu.result;
    return menu.result;
  }

  enemyAction() {
    const m = this.e.mon;
    const slots = m.moves.map((mv, i) => i).filter((i) => m.moves[i].pp > 0);
    if (!slots.length) return { type: 'move', struggle: true };
    if (this.wild) return { type: 'move', slot: U.pick(slots) };
    // Trainers favour strong, effective moves but mix in the rest.
    const scored = slots.map((i) => {
      const mv = MOVES[m.moves[i].id];
      let s;
      if (mv.cat === 'status') {
        const st = mv.stat;
        const side = st.target === 'self' ? this.e : this.p;
        s = Math.abs(side.st[st.stat]) >= 2 ? 1 : 25;
      } else {
        s = mv.power * typeEffect(mv.type, this.p.mon.types) * (m.types.includes(mv.type) ? 1.5 : 1);
      }
      return { i, s };
    }).sort((a, b) => b.s - a.s);
    const pick = U.chance(0.7) ? scored[0] : U.pick(scored);
    return { type: 'move', slot: pick.i };
  }

  speedOf(s) { return s.mon.stats.spe * stageMult(s.st.spe); }

  // ---- a turn ----------------------------------------------------------------
  *turn(act) {
    const eAct = this.enemyAction();
    this.p.flinch = false;
    this.e.flinch = false;

    if (act.type === 'run') {
      if (yield* this.tryRun()) return;
      yield* this.useMove(this.e, eAct);
      yield* this.checkFaints();
      return;
    }
    if (act.type === 'item') {
      yield* this.useItem(act);
      if (this.result) return;
      yield* this.useMove(this.e, eAct);
      yield* this.checkFaints();
      return;
    }
    if (act.type === 'switch') {
      yield* this.switchTo(act.idx);
      yield* this.useMove(this.e, eAct);
      yield* this.checkFaints();
      return;
    }
    const pri = (a, s) => (a.struggle ? 0 : MOVES[s.mon.moves[a.slot].id].priority || 0);
    const pp = pri(act, this.p);
    const ep = pri(eAct, this.e);
    let playerFirst;
    if (pp !== ep) playerFirst = pp > ep;
    else {
      const a = this.speedOf(this.p);
      const b = this.speedOf(this.e);
      playerFirst = a === b ? U.chance(0.5) : a > b;
    }
    const order = playerFirst ? [[this.p, act], [this.e, eAct]] : [[this.e, eAct], [this.p, act]];
    for (let k = 0; k < 2; k++) {
      const [s, a] = order[k];
      if (s.mon.fainted || !s.vis) continue;
      this.firstMover = k === 0;
      yield* this.useMove(s, a);
      if (yield* this.checkFaints()) return;
    }
  }

  *useMove(s, act) {
    const t = this.other(s);
    if (!s.vis || s.mon.fainted) return;
    if (s.flinch) {
      yield* this.msg(`${this.nameOf(s)} flinched!`, 'auto');
      return;
    }
    let mv;
    if (act.struggle) mv = STRUGGLE;
    else {
      const slot = s.mon.moves[act.slot];
      slot.pp = Math.max(0, slot.pp - 1);
      mv = MOVES[slot.id];
    }
    yield* this.msg(`${this.nameOf(s)} used ${mv.name}!`, 'hold');
    yield 8;

    if (mv.acc) {
      const chance = mv.acc * accMult(U.clamp(s.st.acc - t.st.eva, -6, 6));
      if (U.rand(100) >= chance) {
        yield* this.msg(`${this.nameOf(s)}'s attack missed!`, 'auto');
        return;
      }
    }

    if (mv.cat === 'status') {
      yield* BattleFX.move(this, mv.fx, s, t);
      const st = mv.stat;
      yield* this.changeStat(st.target === 'self' ? s : t, st.stat, st.stages);
      return;
    }

    // Damage.
    const eff = typeEffect(mv.type, t.mon.types);
    const crit = U.chance(mv.highCrit ? 1 / 8 : 1 / 16);
    const physical = mv.cat === 'physical';
    const ak = physical ? 'atk' : 'spa';
    const dk = physical ? 'def' : 'spd';
    let aStage = s.st[ak];
    let dStage = t.st[dk];
    if (crit) {
      aStage = Math.max(0, aStage);
      dStage = Math.min(0, dStage);
    }
    const A = s.mon.stats[ak] * stageMult(aStage);
    const D = t.mon.stats[dk] * stageMult(dStage);
    let power = mv.power;
    const ab = s.mon.sp.ability;
    if (s.mon.hp <= s.mon.stats.hp / 3 && ((ab === 'OVERGROW' && mv.type === 'grass') || (ab === 'TORRENT' && mv.type === 'water'))) power *= 1.5;
    const L = s.mon.level;
    let dmg = Math.floor(Math.floor((Math.floor((2 * L) / 5 + 2) * power * A) / D) / 50) + 2;
    if (crit) dmg = Math.floor(dmg * 1.5);
    dmg = Math.floor(dmg * U.randInt(85, 100) / 100);
    if (!act.struggle && s.mon.types.includes(mv.type)) dmg = Math.floor(dmg * 1.5);
    dmg = Math.floor(dmg * eff);
    dmg = Math.max(1, dmg);

    if (physical) yield* BattleFX.lunge(this, s);
    yield* BattleFX.move(this, mv.fx, s, t);
    Sound.sfx(eff > 1 ? 'hitSuper' : eff < 1 ? 'hitWeak' : 'hit');
    yield* BattleFX.blink(this, t, 3);
    const dealt = Math.min(t.mon.hp, dmg);
    t.mon.hp -= dealt;
    yield* this.drainBar(t);

    if (crit) yield* this.msg('A critical hit!', 'auto');
    if (eff > 1) yield* this.msg('It\'s super effective!', 'auto');
    else if (eff < 1) yield* this.msg('It\'s not very effective...', 'auto');

    if (mv.drain && dealt > 0 && s.mon.hp < s.mon.stats.hp) {
      const heal = Math.max(1, Math.floor(dealt * mv.drain));
      s.mon.hp = Math.min(s.mon.stats.hp, s.mon.hp + heal);
      yield* this.drainBar(s);
      yield* this.msg(`${this.nameOf(t)} had its energy drained!`, 'auto');
    }
    if (mv.recoil) {
      const r = Math.max(1, Math.floor(dealt * mv.recoil));
      s.mon.hp = Math.max(0, s.mon.hp - r);
      yield* this.drainBar(s);
      yield* this.msg(`${this.nameOf(s)} is hit with recoil!`, 'auto');
    }
    if (t.mon.fainted) return;
    if (mv.stat && U.rand(100) < (mv.stat.chance ?? 100)) {
      yield* this.changeStat(mv.stat.target === 'self' ? s : t, mv.stat.stat, mv.stat.stages);
    }
    if (mv.flinch && this.firstMover && U.rand(100) < mv.flinch) t.flinch = true;
  }

  *changeStat(side, stat, stages) {
    const cur = side.st[stat];
    const name = `${this.nameOf(side)}'s ${STAT_NAMES[stat]}`;
    if (stages > 0 && cur >= 6) {
      yield* this.msg(`${name} won't go any higher!`, 'auto');
      return;
    }
    if (stages < 0 && cur <= -6) {
      yield* this.msg(`${name} won't go any lower!`, 'auto');
      return;
    }
    side.st[stat] = U.clamp(cur + stages, -6, 6);
    yield* BattleFX.statChange(this, side, stages > 0);
    const sharp = Math.abs(stages) >= 2 ? ' sharply' : '';
    yield* this.msg(`${name}${sharp} ${stages > 0 ? 'rose' : 'fell'}!`, 'auto');
  }

  // Animate the HP bar towards the real HP.
  *drainBar(s) {
    const target = s.mon.hp;
    const step = Math.max(s.mon.stats.hp / 48, 0.25);
    while (Math.abs(s.hp - target) > 0.01) {
      if (s.hp > target) s.hp = Math.max(target, s.hp - step);
      else s.hp = Math.min(target, s.hp + step);
      yield;
    }
    s.hp = target;
  }

  // ---- fainting ----------------------------------------------------------------
  *checkFaints() {
    let stop = false;
    if (this.e.vis && this.e.mon.fainted) {
      yield* this.enemyFainted();
      stop = true;
    }
    if (!this.result && this.p.vis && this.p.mon.fainted) {
      yield* this.playerFainted();
      stop = true;
    }
    return stop;
  }

  *faintAnim(s) {
    Sound.cry(s.mon.species, 0.7);
    yield 14;
    Sound.sfx('faint');
    yield* BattleFX.tween(18, (t) => { s.sink = t * 64; });
    s.vis = false;
    s.sink = 0;
    s.hud = false;
  }

  *enemyFainted() {
    const e = this.e;
    yield* this.faintAnim(e);
    yield* this.msg(`${this.nameOf(e)} fainted!`);
    // Experience for everyone who fought it.
    const sp = e.mon.sp;
    const base = Math.floor((sp.baseExp * e.mon.level / 7) * (this.wild ? 1 : 1.5));
    const alive = [...this.participants].filter((i) => State.party[i] && !State.party[i].fainted);
    const each = Math.max(1, Math.floor(base / Math.max(1, alive.length)));
    for (const i of alive) yield* this.giveExp(i, each);

    const next = this.enemyParty.findIndex((m) => !m.fainted);
    if (!this.wild && next >= 0) {
      this.ei = next;
      this.e = this.side(this.enemyParty[next], false);
      this.participants = new Set([this.pi]);
      yield* this.sendOutEnemy();
      return;
    }
    this.result = 'win';
  }

  *playerFainted() {
    const p = this.p;
    yield* this.faintAnim(p);
    yield* this.msg(`${p.mon.name} fainted!`);
    this.participants.delete(this.pi);
    if (!State.anyAlive()) {
      this.result = 'lose';
      return;
    }
    const idx = yield* Party.open({ mode: 'forced', active: this.pi });
    this.pi = idx;
    this.p = this.side(State.party[idx], true);
    yield* this.sendOutPlayer(false);
  }

  // ---- experience ------------------------------------------------------------------
  *giveExp(i, amount) {
    const mon = State.party[i];
    if (mon.level >= MAX_LEVEL) return;
    const active = i === this.pi && this.p.vis;
    yield* this.msg(`${mon.name} gained ${amount} EXP. Points!`);
    let left = amount;
    while (left > 0 && mon.level < MAX_LEVEL) {
      const add = Math.min(left, mon.expToNext());
      const from = mon.expFrac();
      mon.exp += add;
      left -= add;
      const leveled = mon.exp >= Mon.expFor(mon.level + 1);
      const to = leveled ? 1 : mon.expFrac();
      if (active) {
        const frames = Math.max(8, Math.round((to - from) * 48));
        yield* BattleFX.tween(frames, (t, f) => {
          this.p.exp = from + (to - from) * t;
          if (f % 4 === 0) Sound.sfx('expTick');
        });
      }
      if (leveled) {
        const oldStats = { ...mon.stats };
        const { newMoves } = mon.levelUp();
        if (active) {
          this.p.exp = 0;
          this.p.hp = mon.hp;
        }
        Sound.jingle('levelup');
        yield* this.msg(`${mon.name} grew to Lv. ${mon.level}!`);
        yield* StatWindow.show(oldStats, mon.stats);
        for (const mv of newMoves) yield* this.learnMove(mon, mv);
      }
    }
  }

  *learnMove(mon, id) {
    const name = MOVES[id].name;
    if (mon.moves.length < 4) {
      mon.learn(id);
      Sound.jingle('levelup');
      yield* this.msg(`${mon.name} learned ${name}!`);
      return;
    }
    yield* this.msg(`${mon.name} is trying to learn ${name}.\fBut ${mon.name} can't learn more than four moves.`);
    for (;;) {
      if (yield* Dialog.yesNo(`Delete an older move to make room for ${name}?`, { style: 'battle' })) {
        yield* this.msg('Which move should be forgotten?', 'hold');
        const i = yield* Menu.choose({
          items: [...mon.moves.map((m) => MOVES[m.id].name), 'CANCEL'], anchor: 'right', cancel: 4,
        });
        if (i >= 0 && i < 4) {
          const old = MOVES[mon.moves[i].id].name;
          yield* this.msg(`1, 2, and... ... Poof!\f${mon.name} forgot ${old}.`);
          mon.learn(id, i);
          Sound.jingle('levelup');
          yield* this.msg(`And... ${mon.name} learned ${name}!`);
          return;
        }
      }
      if (yield* Dialog.yesNo(`Stop trying to learn ${name}?`, { style: 'battle' })) {
        yield* this.msg(`${mon.name} did not learn ${name}.`);
        return;
      }
    }
  }

  // ---- other actions ------------------------------------------------------------
  *tryRun() {
    this.escapes++;
    const a = this.speedOf(this.p);
    const b = this.speedOf(this.e);
    const ok = a >= b || U.rand(256) < Math.floor((a * 128) / b) + 30 * this.escapes;
    if (ok) {
      Sound.sfx('flee');
      yield* this.msg('Got away safely!');
      this.result = 'run';
      return true;
    }
    yield* this.msg('Couldn\'t get away!');
    return false;
  }

  *switchTo(idx) {
    const p = this.p;
    yield* this.msg(`${p.mon.name}, come back!`, 'hold');
    Sound.sfx('ballOpen');
    yield* BattleFX.tween(12, (t) => { p.white = 1; p.scale = 1 - t * 0.8; });
    p.vis = false;
    p.hud = false;
    this.pi = idx;
    this.p = this.side(State.party[idx], true);
    yield 10;
    yield* this.sendOutPlayer(false);
  }

  *useItem(act) {
    const it = ITEMS[act.item];
    State.removeItem(act.item);
    if (it.ball) {
      yield* this.throwBall(act.item);
      return;
    }
    const mon = State.party[act.target];
    yield* this.msg(`{PLAYER} used ${it.name}!`, 'hold');
    Sound.sfx('potion');
    if (it.revive) {
      mon.hp = Math.floor(mon.stats.hp / 2);
      yield* this.msg(`${mon.name} was revived!`);
      return;
    }
    const before = mon.hp;
    mon.hp = Math.min(mon.stats.hp, mon.hp + it.heal);
    if (act.target === this.pi) yield* this.drainBar(this.p);
    yield* this.msg(`${mon.name}'s HP was restored by ${mon.hp - before} points.`);
  }

  *throwBall(itemId) {
    const e = this.e;
    const it = ITEMS[itemId];
    yield* this.msg(`{PLAYER} threw an ${it.name}!`, 'hold');
    Sound.sfx('ballThrow');
    this.ball = { x: 40, y: 100, angle: 0 };
    yield* BattleFX.tween(24, (t) => {
      this.ball.x = 40 + t * 136;
      this.ball.y = 100 - t * 60 - Math.sin(t * Math.PI) * 30;
      this.ball.angle = t * 12;
    });
    this.ball.angle = 0;
    Sound.sfx('ballOpen');
    yield* BattleFX.tween(14, (t) => { e.white = 1; e.scale = 1 - t; });
    e.vis = false;
    e.hud = false;
    yield* BattleFX.tween(12, (t) => { this.ball.y = 40 + t * 28 - Math.sin(t * Math.PI) * 8; });
    Sound.sfx('ballClick');
    yield 20;

    // GBA catch formula.
    const m = e.mon;
    const a = Math.floor(((3 * m.stats.hp - 2 * m.hp) * m.sp.catchRate * it.ball) / (3 * m.stats.hp));
    let shakes = 4;
    if (a < 255) {
      const b = Math.floor(1048560 / Math.floor(Math.sqrt(Math.floor(Math.sqrt(Math.floor(16711680 / Math.max(1, a)))))));
      shakes = 0;
      while (shakes < 4 && U.rand(65536) < b) shakes++;
    }
    for (let i = 0; i < Math.min(3, shakes); i++) {
      Sound.sfx('ballShake');
      yield* BattleFX.tween(16, (t) => { this.ball.angle = Math.sin(t * Math.PI * 2) * 0.6; });
      this.ball.angle = 0;
      yield 18;
    }
    if (shakes >= 4) {
      Sound.sfx('ballClick');
      this.ball.caught = true;
      Co.start(BattleFX.burst(this, BattleArt.sprite('sparkle'), [this.ball.x, this.ball.y], 6, 14, 20));
      yield 20;
      Sound.jingle('caught');
      const first = !State.d.dex.caught[m.species];
      yield* this.msg(`Gotcha!\n${m.name} was caught!`);
      if (first && State.flag('got_dex')) yield* this.msg(`${m.name}'s data was added to the AIMONDEX.`);
      if (yield* Dialog.yesNo(`Give a nickname to the caught ${m.name}?`, { style: 'battle' })) {
        const nick = yield* Naming.run({ title: `${m.name}'s nickname?`, species: m.species, max: 10 });
        if (nick) m.nickname = nick;
      }
      const where = State.addMon(m);
      if (where === 'box') yield* this.msg(`${m.name} was sent to the PC.`);
      this.result = 'caught';
      return;
    }
    Sound.sfx('ballOpen');
    this.ball = null;
    e.vis = true;
    yield* BattleFX.tween(10, (t) => { e.scale = t; e.white = 1 - t; });
    e.scale = 1;
    e.white = 0;
    e.hud = true;
    const lines = ['Oh no! It broke free right away!', 'Aww! It looked like it was caught!', 'Argh! So close!', 'Shoot! It almost stayed in!'];
    yield* this.msg(lines[Math.min(shakes, 3)]);
  }

  // ---- ending ---------------------------------------------------------------------
  *outro() {
    if (this.result === 'win') {
      if (this.wild) {
        Sound.playMusic('victory');
        return;
      }
      Sound.playMusic('victory');
      yield* BattleFX.tween(24, (t) => { this.trainerX = (1 - t) * 110; });
      this.trainerX = 0;
      yield* this.msg(`{PLAYER} defeated\n${this.trainerTitle}!`);
      if (this.tr.lose) yield* this.msg(this.tr.lose);
      const prize = this.tr.payout * this.enemyParty[this.enemyParty.length - 1].level;
      State.d.money += prize;
      yield* this.msg(`{PLAYER} got $${prize} for winning!`);
    } else if (this.result === 'lose') {
      yield* this.msg('{PLAYER} is out of usable AIMON!');
      if (this.tr && this.tr.canLose) {
        this.trainerX = 0;
        if (this.tr.win) yield* this.msg(this.tr.win);
      } else {
        yield* this.msg('{PLAYER} whited out!');
      }
    }
  }

  // ---- drawing --------------------------------------------------------------------
  update() {}

  draw(g) {
    const slide = this.slide;
    g.drawImage(BattleArt.bg(this.bgKind), 0, 0);
    const eOff = Math.round((1 - slide) * -240);
    const pOff = Math.round((1 - slide) * 240);
    const ep = BattleArt.platform(this.bgKind, 60, 13);
    const pp = BattleArt.platform(this.bgKind, 72, 16);
    g.drawImage(ep, 116 + eOff, 60);
    g.drawImage(pp, -8 + pOff, 96);

    if (this.trainerX !== null) {
      const img = TrainerArt.get(this.tr.sprite);
      g.drawImage(img, 148 + eOff + this.trainerX, 8);
    }
    this.drawMon(g, this.e, 144 + eOff, 10, 74);
    if (this.playerTrainerX !== null) {
      g.drawImage(TrainerArt.get(this.playerThrow ? 'playerThrow' : 'playerBack'), 36 + pOff + this.playerTrainerX, 48);
    }
    const bob = this.bob && Math.floor(Game.frame / 12) % 2 ? 1 : 0;
    this.drawMon(g, this.p, 36 + pOff, 48 + bob, 112);

    if (this.ball) {
      g.drawImage(BattleArt.ballRot(this.ball.angle || 0), Math.round(this.ball.x - 8), Math.round(this.ball.y - 8));
    }
    for (const p of this.parts) {
      if (p.hidden) continue;
      g.globalAlpha = p.alpha ?? 1;
      const s = p.scale || 1;
      const w = p.img.width * s;
      const h = p.img.height * s;
      if (p.flipV) {
        g.save();
        g.translate(Math.round(p.x), Math.round(p.y));
        g.scale(1, -1);
        g.drawImage(p.img, -w / 2, -h / 2, w, h);
        g.restore();
      } else {
        g.drawImage(p.img, Math.round(p.x - w / 2), Math.round(p.y - h / 2), w, h);
      }
      g.globalAlpha = 1;
    }
    if (this.dim) {
      g.fillStyle = `rgba(0,0,0,${this.dim})`;
      g.fillRect(0, 0, SCREEN_W, 112);
    }
    if (this.e.hud) this.drawEnemyHud(g, 8 + this.e.hudX, 14);
    if (this.p.hud) this.drawPlayerHud(g, 126 + this.p.hudX, 74 + bob);

    UI.window(g, 2, 112, 236, 46, 'battle');
  }

  drawMon(g, s, x, y, floorY) {
    if (!s.vis || s.hide) return;
    const img = s.isPlayer ? MonSprites.back(s.mon.species) : MonSprites.front(s.mon.species);
    const white = s.isPlayer ? MonSprites.backWhite(s.mon.species) : MonSprites.frontWhite(s.mon.species);
    const sc = s.scale;
    const w = 64 * sc;
    const dx = Math.round(x + s.dx + (64 - w) / 2);
    const dy = Math.round(y + s.dy + 64 - w + s.sink);
    g.save();
    if (s.sink) {
      g.beginPath();
      g.rect(0, 0, SCREEN_W, floorY);
      g.clip();
    }
    if (s.white < 1) g.drawImage(img, dx, dy, w, w);
    if (s.white > 0) {
      g.globalAlpha = s.white;
      g.drawImage(white, dx, dy, w, w);
      g.globalAlpha = 1;
    }
    if (s.tint && s.tintA > 0) {
      g.globalAlpha = s.tintA;
      g.drawImage(Pix.silhouette(img, s.tint), dx, dy, w, w);
      g.globalAlpha = 1;
    }
    g.restore();
  }

  hudBox(g, x, y, w, h) {
    g.fillStyle = '#383838';
    g.fillRect(x + 1, y, w - 2, h);
    g.fillRect(x, y + 1, w, h - 2);
    g.fillStyle = '#f8f8d8';
    g.fillRect(x + 1, y + 1, w - 2, h - 2);
    g.fillStyle = '#d8d8b0';
    g.fillRect(x + 1, y + h - 3, w - 2, 2);
  }

  drawEnemyHud(g, x, y) {
    const s = this.e;
    this.hudBox(g, x, y, 104, 30);
    Font.draw(g, s.mon.name, x + 6, y + 4, '#404040', '#d8d0b0');
    Font.drawRight(g, `Lv${s.mon.level}`, x + 98, y + 4, '#404040', '#d8d0b0');
    if (this.wild && State.d.dex.caught[s.mon.species]) g.drawImage(BattleArt.ballImg(), x + 4, y + 16, 8, 8);
    UI.hpBar(g, x + 34, y + 17, s.hp / s.mon.stats.hp, 48);
  }

  drawPlayerHud(g, x, y) {
    const s = this.p;
    this.hudBox(g, x, y, 108, 37);
    Font.draw(g, s.mon.name, x + 10, y + 3, '#404040', '#d8d0b0');
    Font.drawRight(g, `Lv${s.mon.level}`, x + 102, y + 3, '#404040', '#d8d0b0');
    UI.hpBar(g, x + 38, y + 14, s.hp / s.mon.stats.hp, 48);
    Font.drawRight(g, `${Math.ceil(s.hp)}/${U.pad(s.mon.stats.hp, 3)}`, x + 102, y + 21, '#404040', '#d8d0b0');
    UI.expBar(g, x + 8, y + 31, s.exp, 92);
  }
}

// Level-up stat window: first the gains, then the new totals.
const StatWindow = {
  *show(before, after) {
    const w = { mode: 0, done: false };
    w.update = () => {
      if (Input.pressed('a') || Input.pressed('b')) {
        Sound.sfx('select');
        if (w.mode === 0) w.mode = 1;
        else w.done = true;
      }
    };
    w.draw = (g) => {
      UI.window(g, 120, 4, 116, 106);
      STAT_KEYS.forEach((k, i) => {
        const y = 12 + i * 15;
        Font.draw(g, STAT_NAMES[k], 128, y, '#404048', '#d0d0c8');
        const val = w.mode === 0 ? `+${after[k] - before[k]}` : String(after[k]);
        Font.drawRight(g, val, 228, y, '#404048', '#d0d0c8');
      });
    };
    Game.push(w);
    yield () => w.done;
    Game.remove(w);
  },
};
