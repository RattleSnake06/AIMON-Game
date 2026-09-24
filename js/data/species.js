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
};

const DEX_ORDER = Object.keys(SPECIES).sort((a, b) => SPECIES[a].num - SPECIES[b].num);
const STARTERS = ['skylavine', 'moltarock', 'archepin'];
