'use strict';
// A single AIMON: stats, moves, experience. Uses GBA-era stat formulas.

const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
const STAT_NAMES = { hp: 'HP', atk: 'ATTACK', def: 'DEFENSE', spa: 'SP. ATK', spd: 'SP. DEF', spe: 'SPEED', acc: 'accuracy', eva: 'evasion' };
const MAX_LEVEL = 100;

class Mon {
  constructor(species, level, opts = {}) {
    this.species = species;
    this.level = level;
    this.nickname = opts.nickname || null;
    this.ivs = opts.ivs || Object.fromEntries(STAT_KEYS.map((k) => [k, U.rand(32)]));
    this.exp = opts.exp ?? Mon.expFor(level);
    this.moves = opts.moves || Mon.defaultMoves(species, level);
    this.ot = opts.ot || null;
    this.calcStats();
    this.hp = opts.hp ?? this.stats.hp;
    this.status = opts.status || null;
    this.sleep = opts.sleep || 0;
  }

  get sp() { return SPECIES[this.species]; }
  get name() { return this.nickname || this.sp.name; }
  get types() { return this.sp.types; }
  get fainted() { return this.hp <= 0; }

  static expFor(level) { return level <= 1 ? 0 : level ** 3; }

  static defaultMoves(species, level) {
    const learned = SPECIES[species].learnset.filter(([l]) => l <= level).map(([, m]) => m);
    const unique = [...new Set(learned)].slice(-4);
    return unique.map((id) => ({ id, pp: MOVES[id].pp }));
  }

  calcStats() {
    const b = this.sp.base;
    const L = this.level;
    const s = {};
    for (const k of STAT_KEYS) {
      const core = Math.floor(((2 * b[k] + this.ivs[k]) * L) / 100);
      s[k] = k === 'hp' ? core + L + 10 : core + 5;
    }
    this.stats = s;
  }

  expToNext() {
    if (this.level >= MAX_LEVEL) return 0;
    return Mon.expFor(this.level + 1) - this.exp;
  }

  expFrac() {
    if (this.level >= MAX_LEVEL) return 0;
    const a = Mon.expFor(this.level);
    const b = Mon.expFor(this.level + 1);
    return (this.exp - a) / (b - a);
  }

  // Raise level by one; returns {gains, newMoves}.
  levelUp() {
    const old = { ...this.stats };
    this.level++;
    this.calcStats();
    this.hp = Math.min(this.stats.hp, this.hp + (this.stats.hp - old.hp));
    const gains = Object.fromEntries(STAT_KEYS.map((k) => [k, this.stats[k] - old[k]]));
    const newMoves = this.sp.learnset.filter(([l]) => l === this.level).map(([, m]) => m)
      .filter((m) => !this.moves.some((x) => x.id === m));
    return { gains, newMoves };
  }

  knows(id) { return this.moves.some((m) => m.id === id); }

  learn(id, slot = this.moves.length) {
    this.moves[slot] = { id, pp: MOVES[id].pp };
  }

  heal() {
    this.hp = this.stats.hp;
    this.status = null;
    for (const m of this.moves) m.pp = MOVES[m.id].pp;
  }

  toJSON() {
    return {
      species: this.species, level: this.level, nickname: this.nickname, ivs: this.ivs,
      exp: this.exp, moves: this.moves, hp: this.hp, ot: this.ot, status: this.status, sleep: this.sleep,
    };
  }

  static fromJSON(o) {
    return new Mon(o.species, o.level, o);
  }
}
