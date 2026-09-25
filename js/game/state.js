'use strict';
// Everything that gets saved: the player, their AIMON, bag, money, flags.

const SAVE_KEY = 'aimon_save_v1';

const State = {
  d: null,

  newGame(name) {
    this.d = {
      name,
      rival: 'KAI',
      id: U.rand(65536),
      money: 3000,
      party: [],
      box: [],
      bag: { rarecandy: 1, potion: 1 },
      flags: {},
      dex: { seen: {}, caught: {} },
      map: 'home2f',
      x: 2,
      y: 5,
      dir: 'down',
      frames: 0,
      heal: { map: 'home1f', x: 7, y: 6, dir: 'up' },
      starter: null,
      badges: {},
      repel: 0,
      expShareOn: false,
    };
  },

  get name() { return this.d.name; },
  get rivalName() { return this.d.rival; },
  get party() { return this.d.party; },

  flag(f) { return !!this.d.flags[f]; },
  setFlag(f, v = true) { this.d.flags[f] = v; },

  text(s) {
    return String(s).replace(/\{PLAYER\}/g, this.d ? this.d.name : 'YOU')
      .replace(/\{RIVAL\}/g, this.d ? this.d.rival : 'KAI');
  },

  // --- AIMON ----------------------------------------------------------------
  addMon(mon) {
    mon.ot = mon.ot || this.d.name;
    this.markCaught(mon.species);
    if (this.d.party.length < 6) {
      this.d.party.push(mon);
      return 'party';
    }
    this.d.box.push(mon);
    return 'box';
  },

  markSeen(sp) { this.d.dex.seen[sp] = true; },
  markCaught(sp) {
    this.d.dex.seen[sp] = true;
    this.d.dex.caught[sp] = true;
  },
  seenCount() { return Object.keys(this.d.dex.seen).length; },
  caughtCount() { return Object.keys(this.d.dex.caught).length; },

  healParty() { for (const m of this.d.party) m.heal(); },
  anyAlive() { return this.d.party.some((m) => !m.fainted); },

  // Kai's starter; given a level, the form it would have evolved into by then.
  rivalStarter(level) {
    let sp = { skylavine: 'moltarock', moltarock: 'archepin', archepin: 'skylavine' }[this.d.starter] || 'moltarock';
    while (level && SPECIES[sp].evo && level >= SPECIES[sp].evo.level) sp = SPECIES[sp].evo.to;
    return sp;
  },

  badgeCount() { return BADGES.filter((b) => this.d.badges[b.id]).length; },

  // --- bag --------------------------------------------------------------------
  count(id) { return this.d.bag[id] || 0; },
  addItem(id, n = 1) { this.d.bag[id] = Math.min(999, this.count(id) + n); },
  removeItem(id, n = 1) {
    this.d.bag[id] = Math.max(0, this.count(id) - n);
    if (!this.d.bag[id]) delete this.d.bag[id];
  },
  pocket(p) {
    return Object.keys(this.d.bag).filter((id) => ITEMS[id] && ITEMS[id].pocket === p && this.d.bag[id] > 0);
  },

  // --- save / load --------------------------------------------------------------
  save(pos) {
    Object.assign(this.d, pos);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.d));
      return true;
    } catch (e) {
      return false;
    }
  },

  hasSave() {
    try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
  },

  peek() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; }
  },

  load() {
    const d = this.peek();
    if (!d) return false;
    d.party = d.party.map(Mon.fromJSON);
    d.box = (d.box || []).map(Mon.fromJSON);
    d.badges = d.badges || {};
    d.repel = d.repel || 0;
    d.bag = { rarecandy: 1, ...d.bag };   // test build: endless RARE CANDY
    // Saves from before HM02 FLY existed: WREN's BADGE comes with it now.
    if ((d.badges.spark || (d.flags || {}).badge_spark) && !d.bag.hm02) d.bag.hm02 = 1;
    this.d = d;
    return true;
  },
};
