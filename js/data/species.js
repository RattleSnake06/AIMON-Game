'use strict';
// The five AIMON from the design sheets. Dex text is adapted from the sheets.

const SPECIES = {
  skylavine: {
    name: 'SKYLAVINE', num: 1, types: ['grass'],
    base: { hp: 45, atk: 52, def: 45, spa: 60, spd: 55, spe: 63 },
    catchRate: 45, baseExp: 64, ability: 'OVERGROW',
    learnset: [[1, 'tackle'], [1, 'growl'], [5, 'leafage'], [8, 'quickattack'], [11, 'gust'],
      [14, 'absorb'], [17, 'razorleaf'], [21, 'wingattack'], [25, 'growth']],
    dex: {
      category: 'SKYWARD SPROUT', height: '1\'04"', weight: '8.8 lbs',
      text: 'Its wings are lined with leaf-like feathers that catch the wind, letting it glide between treetops and cliffs. The leaves on its head sense the weather.',
    },
  },
  moltarock: {
    name: 'MOLTAROCK', num: 2, types: ['fire'],
    base: { hp: 46, atk: 62, def: 58, spa: 55, spd: 45, spe: 48 },
    catchRate: 45, baseExp: 64, ability: 'FLAME BODY',
    learnset: [[1, 'tackle'], [1, 'leer'], [5, 'ember'], [8, 'rockthrow'], [11, 'harden'],
      [14, 'flamecharge'], [17, 'smokescreen'], [21, 'headbutt']],
    dex: {
      category: 'LAVA STONE', height: '1\'00"', weight: '22.5 lbs',
      text: 'Its body is volcanic rock heated by magma trapped inside. When it is excited, the magma surges and flames erupt from the cracks in its body.',
    },
  },
  archepin: {
    name: 'ARCHEPIN', num: 3, types: ['water'],
    base: { hp: 50, atk: 50, def: 64, spa: 50, spd: 55, spe: 45 },
    catchRate: 45, baseExp: 64, ability: 'TORRENT',
    learnset: [[1, 'tackle'], [1, 'tailwhip'], [5, 'watergun'], [8, 'bite'], [11, 'withdraw'],
      [14, 'aquajet'], [17, 'rockthrow'], [21, 'bubblebeam'], [25, 'headbutt']],
    dex: {
      category: 'BRIDGE', height: '1\'04"', weight: '24.3 lbs',
      text: 'Its shell is shaped like a small stone bridge with water flowing through the arches. It helps others cross rivers by making a bridge of its back.',
    },
  },
  goskie: {
    name: 'GOSKIE', num: 4, types: ['water'],
    base: { hp: 40, atk: 45, def: 38, spa: 40, spd: 38, spe: 56 },
    catchRate: 255, baseExp: 50, ability: 'KEEN EYE',
    learnset: [[1, 'peck'], [1, 'honk'], [6, 'watergun'], [9, 'quickattack'], [13, 'wingattack'],
      [17, 'aquajet'], [21, 'bubblebeam']],
    dex: {
      category: 'RIVERBANK', height: '1\'00"', weight: '4.2 lbs',
      text: 'GOSKIE travel in small groups along rivers and lakes. Curious and friendly, they keep in touch with their flock using soft, honking calls.',
    },
  },
  mellowcap: {
    name: 'MELLOWCAP', num: 5, types: ['water'],
    base: { hp: 65, atk: 45, def: 50, spa: 35, spd: 50, spe: 25 },
    catchRate: 255, baseExp: 58, ability: 'OWN TEMPO',
    learnset: [[1, 'tackle'], [1, 'tailwhip'], [6, 'watergun'], [9, 'defensecurl'], [12, 'absorb'],
      [15, 'headbutt'], [19, 'aquajet'], [23, 'bubblebeam']],
    dex: {
      category: 'RIVERBANK', height: '2\'00"', weight: '77.2 lbs',
      text: 'It spends most of its day lounging in or near water. The leaves and flower on its head keep it cool and attract friendly AIMON.',
    },
  },
  dapplekit: {
    name: 'DAPPLEKIT', num: 6, types: ['normal'],
    base: { hp: 50, atk: 55, def: 45, spa: 45, spd: 45, spe: 72 },
    catchRate: 120, baseExp: 62, ability: 'RUN AWAY',
    learnset: [[1, 'scratch'], [1, 'tailwhip'], [5, 'quickattack'], [9, 'bite'], [11, 'swift'],
      [14, 'workup'], [18, 'takedown']],
    dex: {
      category: 'DAPPLE', height: '1\'00"', weight: '6.6 lbs',
      text: 'The pale spots on its coat look like sunlight falling through leaves. It hides nuts in its fluffy tail and forgets where it put half of them.',
    },
  },
  nibblit: {
    name: 'NIBBLIT', num: 7, types: ['normal'],
    base: { hp: 40, atk: 56, def: 38, spa: 30, spd: 40, spe: 78 },
    catchRate: 190, baseExp: 54, ability: 'GUTS',
    learnset: [[1, 'tackle'], [1, 'tailwhip'], [5, 'quickattack'], [9, 'bite'], [13, 'hyperfang'], [17, 'scaryface']],
    dex: {
      category: 'NIBBLE', height: '0\'08"', weight: '2.9 lbs',
      text: 'It gnaws on anything, from roots to rope. Its long pink tail helps it balance on narrow ledges and bridge railings.',
    },
  },
  ruffang: {
    name: 'RUFFANG', num: 8, types: ['normal'],
    base: { hp: 68, atk: 76, def: 56, spa: 40, spd: 52, spe: 64 },
    catchRate: 75, baseExp: 76, ability: 'INTIMIDATE',
    learnset: [[1, 'tackle'], [1, 'howl'], [6, 'bite'], [10, 'quickattack'], [13, 'takedown'], [17, 'scaryface'], [21, 'hyperfang']],
    dex: {
      category: 'LOYAL PUP', height: '2\'04"', weight: '44.1 lbs',
      text: 'The thick ruff around its neck protects it in fights. Once a RUFFANG chooses a partner, it will hold its ground for them no matter what.',
    },
  },
  leafgrub: {
    name: 'LEAFGRUB', num: 9, types: ['bug', 'grass'],
    base: { hp: 52, atk: 42, def: 56, spa: 48, spd: 52, spe: 30 },
    catchRate: 190, baseExp: 56, ability: 'SHIELD DUST',
    learnset: [[1, 'tackle'], [1, 'stringshot'], [6, 'strugglebug'], [9, 'megadrain'], [12, 'bugbite'], [16, 'stunspore']],
    dex: {
      category: 'LEAFROLL', height: '1\'00"', weight: '7.7 lbs',
      text: 'It wraps itself in fresh leaves to hide from birds. The orange spots along its sides look like eyes and scare off anything that gets too close.',
    },
  },
  bambuck: {
    name: 'BAMBUCK', num: 10, types: ['grass'],
    base: { hp: 56, atk: 66, def: 56, spa: 50, spd: 56, spe: 62 },
    catchRate: 120, baseExp: 66, ability: 'CHLOROPHYLL',
    learnset: [[1, 'tackle'], [1, 'growth'], [5, 'vinewhip'], [9, 'sleeppowder'], [12, 'razorleaf'], [16, 'megadrain'], [20, 'takedown']],
    dex: {
      category: 'BAMBOO', height: '3\'03"', weight: '66.1 lbs',
      text: 'The stalks on its body grow a little every day. BAMBUCK herds stand perfectly still among bamboo groves, where they are nearly impossible to spot.',
    },
  },
  terrapike: {
    name: 'TERRAPIKE', num: 11, types: ['ground'],
    base: { hp: 62, atk: 70, def: 82, spa: 30, spd: 46, spe: 30 },
    catchRate: 120, baseExp: 70, ability: 'STURDY',
    learnset: [[1, 'tackle'], [1, 'harden'], [5, 'mudslap'], [9, 'rockthrow'], [12, 'bulldoze'], [16, 'rocktomb'], [20, 'takedown']],
    dex: {
      category: 'SPIKESHELL', height: '2\'00"', weight: '88.2 lbs',
      text: 'Its shell is packed with ore it digs up underground. The orange crystals on its back glow brighter whenever the earth is about to shake.',
    },
  },
  scrapaw: {
    name: 'SCRAPAW', num: 12, types: ['fighting'],
    base: { hp: 52, atk: 78, def: 46, spa: 30, spd: 42, spe: 66 },
    catchRate: 120, baseExp: 68, ability: 'INNER FOCUS',
    learnset: [[1, 'scratch'], [1, 'leer'], [5, 'rocksmash'], [9, 'karatechop'], [12, 'doublekick'], [16, 'bulkup'], [20, 'bite']],
    dex: {
      category: 'SCRAPPER', height: '2\'07"', weight: '45.2 lbs',
      text: 'It trains by punching cave walls until its paws glow red. It only respects opponents who can take a hit without backing down.',
    },
  },
  voltvix: {
    name: 'VOLTVIX', num: 13, types: ['electric'],
    base: { hp: 48, atk: 58, def: 42, spa: 72, spd: 48, spe: 84 },
    catchRate: 45, baseExp: 78, ability: 'STATIC',
    learnset: [[1, 'quickattack'], [1, 'thundershock'], [5, 'tailwhip'], [8, 'thunderwave'], [11, 'spark'],
      [14, 'chargebeam'], [18, 'bite'], [22, 'swift']],
    dex: {
      category: 'STATIC FOX', height: '2\'00"', weight: '28.7 lbs',
      text: 'Rarely seen in the wild. It stores static in its jagged mane and releases it in blinding bursts. TEAM DISTORTION is rumored to breed them in secret.',
    },
  },
};

const DEX_ORDER = Object.keys(SPECIES).sort((a, b) => SPECIES[a].num - SPECIES[b].num);
const STARTERS = ['skylavine', 'moltarock', 'archepin'];

// Where each species can be found in the wild (for the AIMONDEX).
function habitatOf(species) {
  const out = [];
  for (const def of Object.values(MAPS)) {
    const enc = def.encounters;
    if (enc && enc.table.some((e) => e.species === species) && !out.includes(def.name)) out.push(def.name);
  }
  return out;
}
