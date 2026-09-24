'use strict';
// cat: physical / special / status
// stat:    { target: 'foe' | 'self', stat, stages, chance }  (or an array)
// inflict: { status: 'par' | 'slp' | 'brn', chance }          (chance omitted = always)
// acc 0 = never misses. hits = strikes per use. recoil/drain = fraction of damage.

const MOVES = {
  // Normal
  tackle: { name: 'TACKLE', type: 'normal', cat: 'physical', power: 40, acc: 100, pp: 35, fx: 'hit',
    desc: 'A full-body charge attack.' },
  scratch: { name: 'SCRATCH', type: 'normal', cat: 'physical', power: 40, acc: 100, pp: 35, fx: 'claw',
    desc: 'Rakes the foe with sharp claws.' },
  headbutt: { name: 'HEADBUTT', type: 'normal', cat: 'physical', power: 70, acc: 100, pp: 15, fx: 'hit', flinch: 30,
    desc: 'A ramming headbutt. May make the foe flinch.' },
  quickattack: { name: 'QUICK ATTACK', type: 'normal', cat: 'physical', power: 40, acc: 100, pp: 30, priority: 1, fx: 'hit',
    desc: 'An extremely fast attack that always strikes first.' },
  swift: { name: 'SWIFT', type: 'normal', cat: 'special', power: 60, acc: 0, pp: 20, fx: 'stars',
    desc: 'Star-shaped rays that never miss.' },
  takedown: { name: 'TAKE DOWN', type: 'normal', cat: 'physical', power: 90, acc: 85, pp: 20, recoil: 0.25, fx: 'hit',
    desc: 'A reckless charge that also hurts the user.' },
  hyperfang: { name: 'HYPER FANG', type: 'normal', cat: 'physical', power: 80, acc: 90, pp: 15, flinch: 10, fx: 'bite',
    desc: 'Bites hard with sharp front fangs. May cause flinching.' },
  growl: { name: 'GROWL', type: 'normal', cat: 'status', acc: 100, pp: 40, fx: 'sound',
    stat: { target: 'foe', stat: 'atk', stages: -1 }, desc: 'A cute growl that lowers the foe\'s ATTACK.' },
  honk: { name: 'HONK', type: 'normal', cat: 'status', acc: 100, pp: 40, fx: 'sound',
    stat: { target: 'foe', stat: 'atk', stages: -1 }, desc: 'A startling honk that lowers the foe\'s ATTACK.' },
  tailwhip: { name: 'TAIL WHIP', type: 'normal', cat: 'status', acc: 100, pp: 30, fx: 'wiggle',
    stat: { target: 'foe', stat: 'def', stages: -1 }, desc: 'Wags its tail to lower the foe\'s DEFENSE.' },
  leer: { name: 'LEER', type: 'normal', cat: 'status', acc: 100, pp: 30, fx: 'glare',
    stat: { target: 'foe', stat: 'def', stages: -1 }, desc: 'A fierce stare that lowers the foe\'s DEFENSE.' },
  scaryface: { name: 'SCARY FACE', type: 'normal', cat: 'status', acc: 100, pp: 10, fx: 'glare',
    stat: { target: 'foe', stat: 'spe', stages: -2 }, desc: 'A terrifying face that sharply lowers SPEED.' },
  harden: { name: 'HARDEN', type: 'normal', cat: 'status', pp: 30, fx: 'glow',
    stat: { target: 'self', stat: 'def', stages: 1 }, desc: 'Stiffens the body to raise DEFENSE.' },
  defensecurl: { name: 'DEFENSE CURL', type: 'normal', cat: 'status', pp: 40, fx: 'glow',
    stat: { target: 'self', stat: 'def', stages: 1 }, desc: 'Curls up to raise DEFENSE.' },
  growth: { name: 'GROWTH', type: 'normal', cat: 'status', pp: 20, fx: 'glow',
    stat: { target: 'self', stat: 'spa', stages: 1 }, desc: 'Grows in the sunlight to raise SP. ATK.' },
  howl: { name: 'HOWL', type: 'normal', cat: 'status', pp: 40, fx: 'sound',
    stat: { target: 'self', stat: 'atk', stages: 1 }, desc: 'Howls to raise its fighting spirit and ATTACK.' },
  workup: { name: 'WORK UP', type: 'normal', cat: 'status', pp: 30, fx: 'glow',
    stat: [{ target: 'self', stat: 'atk', stages: 1 }, { target: 'self', stat: 'spa', stages: 1 }],
    desc: 'Rouses itself to raise ATTACK and SP. ATK.' },
  smokescreen: { name: 'SMOKESCREEN', type: 'normal', cat: 'status', acc: 100, pp: 20, fx: 'smoke',
    stat: { target: 'foe', stat: 'acc', stages: -1 }, desc: 'Blows smoke to lower the foe\'s accuracy.' },

  // Grass
  leafage: { name: 'LEAFAGE', type: 'grass', cat: 'physical', power: 40, acc: 100, pp: 40, fx: 'leaf',
    desc: 'Strikes the foe with a flurry of leaves.' },
  vinewhip: { name: 'VINE WHIP', type: 'grass', cat: 'physical', power: 45, acc: 100, pp: 25, fx: 'vine',
    desc: 'Strikes the foe with slender, whip-like vines.' },
  razorleaf: { name: 'RAZOR LEAF', type: 'grass', cat: 'physical', power: 55, acc: 95, pp: 25, highCrit: true, fx: 'leaf',
    desc: 'Sharp leaves that often land critical hits.' },
  absorb: { name: 'ABSORB', type: 'grass', cat: 'special', power: 20, acc: 100, pp: 25, drain: 0.5, fx: 'drain',
    desc: 'Drains the foe. Half the damage restores HP.' },
  megadrain: { name: 'MEGA DRAIN', type: 'grass', cat: 'special', power: 40, acc: 100, pp: 15, drain: 0.5, fx: 'drain',
    desc: 'A stronger drain. Half the damage restores HP.' },
  sleeppowder: { name: 'SLEEP POWDER', type: 'grass', cat: 'status', acc: 75, pp: 15, fx: 'powder',
    inflict: { status: 'slp' }, desc: 'Scatters a powder that puts the foe to sleep.' },
  stunspore: { name: 'STUN SPORE', type: 'grass', cat: 'status', acc: 75, pp: 30, fx: 'powder',
    inflict: { status: 'par' }, desc: 'Scatters spores that paralyze the foe.' },

  // Water
  watergun: { name: 'WATER GUN', type: 'water', cat: 'special', power: 40, acc: 100, pp: 25, fx: 'water',
    desc: 'Squirts water to attack the foe.' },
  aquajet: { name: 'AQUA JET', type: 'water', cat: 'physical', power: 40, acc: 100, pp: 20, priority: 1, fx: 'water',
    desc: 'A burst of water that always strikes first.' },
  bubblebeam: { name: 'BUBBLE BEAM', type: 'water', cat: 'special', power: 65, acc: 100, pp: 20, fx: 'water',
    stat: { target: 'foe', stat: 'spe', stages: -1, chance: 10 }, desc: 'A spray of bubbles. May lower SPEED.' },
  withdraw: { name: 'WITHDRAW', type: 'water', cat: 'status', pp: 40, fx: 'glow',
    stat: { target: 'self', stat: 'def', stages: 1 }, desc: 'Hides under its arches to raise DEFENSE.' },

  // Fire
  ember: { name: 'EMBER', type: 'fire', cat: 'special', power: 40, acc: 100, pp: 25, fx: 'fire',
    inflict: { status: 'brn', chance: 10 }, desc: 'A small flame. May leave the foe with a burn.' },
  flamecharge: { name: 'FLAME CHARGE', type: 'fire', cat: 'physical', power: 50, acc: 100, pp: 20, fx: 'fire',
    stat: { target: 'self', stat: 'spe', stages: 1, chance: 100 }, desc: 'Cloaks itself in flame and charges. Raises SPEED.' },

  // Electric
  thundershock: { name: 'THUNDERSHOCK', type: 'electric', cat: 'special', power: 40, acc: 100, pp: 30, fx: 'bolt',
    inflict: { status: 'par', chance: 10 }, desc: 'A jolt of electricity. May paralyze the foe.' },
  spark: { name: 'SPARK', type: 'electric', cat: 'physical', power: 65, acc: 100, pp: 20, fx: 'bolt',
    inflict: { status: 'par', chance: 30 }, desc: 'An electrified tackle. May paralyze the foe.' },
  thunderwave: { name: 'THUNDER WAVE', type: 'electric', cat: 'status', acc: 90, pp: 20, fx: 'bolt',
    inflict: { status: 'par' }, desc: 'A weak jolt that paralyzes the foe.' },
  chargebeam: { name: 'CHARGE BEAM', type: 'electric', cat: 'special', power: 50, acc: 90, pp: 10, fx: 'bolt',
    stat: { target: 'self', stat: 'spa', stages: 1, chance: 70 }, desc: 'A beam of electricity. May raise SP. ATK.' },

  // Ground
  mudslap: { name: 'MUD-SLAP', type: 'ground', cat: 'special', power: 20, acc: 100, pp: 10, fx: 'mud',
    stat: { target: 'foe', stat: 'acc', stages: -1, chance: 100 }, desc: 'Hurls mud in the foe\'s face to lower accuracy.' },
  bulldoze: { name: 'BULLDOZE', type: 'ground', cat: 'physical', power: 60, acc: 100, pp: 20, fx: 'quake',
    stat: { target: 'foe', stat: 'spe', stages: -1, chance: 100 }, desc: 'Stomps the ground to damage and slow the foe.' },
  sandattack: { name: 'SAND ATTACK', type: 'ground', cat: 'status', acc: 100, pp: 15, fx: 'mud',
    stat: { target: 'foe', stat: 'acc', stages: -1 }, desc: 'Kicks sand in the foe\'s eyes to lower accuracy.' },

  // Fighting
  rocksmash: { name: 'ROCK SMASH', type: 'fighting', cat: 'physical', power: 40, acc: 100, pp: 15, fx: 'punch',
    stat: { target: 'foe', stat: 'def', stages: -1, chance: 50 }, desc: 'A rock-breaking punch. May lower DEFENSE.' },
  karatechop: { name: 'KARATE CHOP', type: 'fighting', cat: 'physical', power: 50, acc: 100, pp: 25, highCrit: true, fx: 'punch',
    desc: 'A sharp chop that often lands critical hits.' },
  doublekick: { name: 'DOUBLE KICK', type: 'fighting', cat: 'physical', power: 30, acc: 100, pp: 30, hits: 2, fx: 'punch',
    desc: 'Kicks the foe twice in a row.' },
  bulkup: { name: 'BULK UP', type: 'fighting', cat: 'status', pp: 20, fx: 'glow',
    stat: [{ target: 'self', stat: 'atk', stages: 1 }, { target: 'self', stat: 'def', stages: 1 }],
    desc: 'Tenses its muscles to raise ATTACK and DEFENSE.' },

  // Bug
  stringshot: { name: 'STRING SHOT', type: 'bug', cat: 'status', acc: 95, pp: 40, fx: 'string',
    stat: { target: 'foe', stat: 'spe', stages: -2 }, desc: 'Binds the foe with silk to sharply lower SPEED.' },
  strugglebug: { name: 'STRUGGLE BUG', type: 'bug', cat: 'special', power: 50, acc: 100, pp: 20, fx: 'hit',
    stat: { target: 'foe', stat: 'spa', stages: -1, chance: 100 }, desc: 'A frantic attack that lowers SP. ATK.' },
  bugbite: { name: 'BUG BITE', type: 'bug', cat: 'physical', power: 60, acc: 100, pp: 20, fx: 'bite',
    desc: 'Bites the foe with tiny, powerful jaws.' },

  // Flying
  peck: { name: 'PECK', type: 'flying', cat: 'physical', power: 35, acc: 100, pp: 35, fx: 'peck',
    desc: 'Jabs the foe with a sharp beak.' },
  gust: { name: 'GUST', type: 'flying', cat: 'special', power: 40, acc: 100, pp: 35, fx: 'wind',
    desc: 'Whips up a strong gust of wind.' },
  wingattack: { name: 'WING ATTACK', type: 'flying', cat: 'physical', power: 60, acc: 100, pp: 35, fx: 'wind',
    desc: 'Strikes the foe with wide-spread wings.' },

  // Rock / Dark
  rockthrow: { name: 'ROCK THROW', type: 'rock', cat: 'physical', power: 50, acc: 90, pp: 15, fx: 'rock',
    desc: 'Hurls small rocks at the foe.' },
  rocktomb: { name: 'ROCK TOMB', type: 'rock', cat: 'physical', power: 60, acc: 95, pp: 15, fx: 'rock',
    stat: { target: 'foe', stat: 'spe', stages: -1, chance: 100 }, desc: 'Boulders trap the foe and lower its SPEED.' },
  bite: { name: 'BITE', type: 'dark', cat: 'physical', power: 60, acc: 100, pp: 25, flinch: 30, fx: 'bite',
    desc: 'Bites with sharp fangs. May make the foe flinch.' },
};

// Technical Machines: reusable, teach one move.
const TMS = {
  tm01: { move: 'swift' },
};
