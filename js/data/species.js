'use strict';
// The AIMON from the design sheets. Dex text is adapted from the sheets.

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

  // --- Chapter 3 ---------------------------------------------------------------
  // evo: { to, level } - evolves after a battle once it reaches that level.
  tidepup: {
    name: 'TIDEPUP', num: 14, types: ['water'],
    base: { hp: 50, atk: 50, def: 45, spa: 44, spd: 45, spe: 58 },
    catchRate: 90, baseExp: 62, ability: 'TORRENT', evo: { to: 'tidefin', level: 20 },
    learnset: [[1, 'tackle'], [1, 'tailwhip'], [4, 'watergun'], [8, 'quickattack'], [12, 'aquajet'],
      [16, 'bite'], [21, 'waterpulse'], [26, 'aquatail']],
    dex: {
      category: 'SPLASH PUP', height: '1\'08"', weight: '17.2 lbs',
      text: 'It loves to play in shallow water. It paddles with its flippers to splash about and move with surprising speed.',
    },
  },
  tidefin: {
    name: 'TIDEFIN', num: 15, types: ['water'],
    base: { hp: 72, atk: 76, def: 62, spa: 62, spd: 62, spe: 84 },
    catchRate: 45, baseExp: 155, ability: 'TORRENT',
    learnset: [[1, 'tackle'], [1, 'tailwhip'], [1, 'watergun'], [8, 'quickattack'], [12, 'aquajet'],
      [16, 'bite'], [21, 'waterpulse'], [26, 'aquatail'], [32, 'crunch'], [38, 'surf']],
    dex: {
      category: 'WAVE RIDER', height: '3\'11"', weight: '62.4 lbs',
      text: 'It races along the coast leaping from wave to wave. Sailors say that when a TIDEFIN calls out, the tide is about to turn.',
    },
  },
  reefwhirl: {
    name: 'REEFWHIRL', num: 16, types: ['water'],
    base: { hp: 55, atk: 35, def: 50, spa: 62, spd: 70, spe: 48 },
    catchRate: 120, baseExp: 66, ability: 'SWIFT SWIM', evo: { to: 'reeflord', level: 26 },
    learnset: [[1, 'watergun'], [1, 'withdraw'], [6, 'whirlpool'], [11, 'megadrain'], [16, 'bubblebeam'],
      [21, 'waterpulse'], [27, 'hex']],
    dex: {
      category: 'DRIFTING', height: '3\'11"', weight: '71.4 lbs',
      text: 'It drifts on ocean currents, snaring food with its tentacles. By spinning, it can stir up powerful whirlpools.',
    },
  },
  reeflord: {
    name: 'REEFLORD', num: 17, types: ['water'],
    base: { hp: 82, atk: 50, def: 72, spa: 92, spd: 100, spe: 62 },
    catchRate: 45, baseExp: 160, ability: 'SWIFT SWIM',
    learnset: [[1, 'watergun'], [1, 'withdraw'], [6, 'whirlpool'], [11, 'megadrain'], [16, 'bubblebeam'],
      [21, 'waterpulse'], [27, 'hex'], [33, 'surf'], [40, 'gigadrain']],
    dex: {
      category: 'REEF CROWN', height: '6\'07"', weight: '165.3 lbs',
      text: 'It rules over coral reefs, raising whirlpools with a sweep of its crowned mantle. Fishing boats give the waters it guards a wide berth.',
    },
  },
  skydrift: {
    name: 'SKYDRIFT', num: 18, types: ['water'],
    base: { hp: 48, atk: 55, def: 42, spa: 55, spd: 45, spe: 72 },
    catchRate: 90, baseExp: 64, ability: 'HYDRATION', evo: { to: 'skyseraph', level: 28 },
    learnset: [[1, 'watergun'], [1, 'gust'], [5, 'quickattack'], [9, 'aquajet'], [14, 'wingattack'],
      [19, 'waterpulse'], [24, 'airslash']],
    dex: {
      category: 'GLIDER FISH', height: '5\'11"', weight: '99.6 lbs',
      text: 'It glides effortlessly through the water on wing-like fins, chasing prey or leaping high above the surface.',
    },
  },
  skyseraph: {
    name: 'SKYSERAPH', num: 19, types: ['water'],
    base: { hp: 75, atk: 80, def: 66, spa: 88, spd: 76, spe: 102 },
    catchRate: 45, baseExp: 172, ability: 'HYDRATION',
    learnset: [[1, 'watergun'], [1, 'gust'], [5, 'quickattack'], [9, 'aquajet'], [14, 'wingattack'],
      [19, 'waterpulse'], [24, 'airslash'], [28, 'aquatail'], [34, 'surf']],
    dex: {
      category: 'SEA WYRM', height: '9\'06"', weight: '187.4 lbs',
      text: 'It is said the first SKYSERAPH was a SKYDRIFT that leapt so high it touched the clouds. It can ride sea winds for days without landing.',
    },
  },
  wraithling: {
    name: 'WRAITHLING', num: 20, types: ['ghost'],
    base: { hp: 45, atk: 40, def: 52, spa: 72, spd: 66, spe: 60 },
    catchRate: 90, baseExp: 72, ability: 'CURSED BODY',
    learnset: [[1, 'astonish'], [1, 'leer'], [5, 'lick'], [9, 'willowisp'], [13, 'nightshade'],
      [18, 'hex'], [24, 'shadowball']],
    dex: {
      category: 'LANTERN', height: '2\'07"', weight: '27.8 lbs',
      text: 'Its lantern burns with the spirits of lost travelers. It follows those who wander at night, its light growing stronger the closer it gets to its prey.',
    },
  },
  umbrafang: {
    name: 'UMBRAFANG', num: 21, types: ['dark'],
    base: { hp: 72, atk: 98, def: 64, spa: 62, spd: 60, spe: 96 },
    catchRate: 25, baseExp: 175, ability: 'PRANKSTER',
    learnset: [[1, 'bite'], [1, 'leer'], [1, 'quickattack'], [8, 'feintattack'], [14, 'snarl'],
      [19, 'crunch'], [25, 'shadowsneak'], [31, 'nastyplot']],
    dex: {
      category: 'SHADOW', height: '5\'03"', weight: '106.5 lbs',
      text: 'It moves like a shadow, striking without a sound. It prefers the cover of darkness and is said to be the guardian of forgotten places.',
    },
  },
  flambramble: {
    name: 'FLAMBRAMBLE', num: 22, types: ['fire'],
    base: { hp: 62, atk: 78, def: 58, spa: 66, spd: 55, spe: 70 },
    catchRate: 60, baseExp: 112, ability: 'BLAZE',
    learnset: [[1, 'ember'], [1, 'leer'], [7, 'flamewheel'], [12, 'bite'], [16, 'firefang'],
      [21, 'flamecharge'], [27, 'flamethrower']],
    dex: {
      category: 'BRAMBLE', height: '3\'11"', weight: '69.9 lbs',
      text: 'Its body is covered in burning brambles that never fade. It protects its territory fiercely, and its flames are said to bloom when it feels threatened.',
    },
  },
  voltimp: {
    name: 'VOLTIMP', num: 23, types: ['electric'],
    base: { hp: 40, atk: 52, def: 38, spa: 62, spd: 45, spe: 82 },
    catchRate: 120, baseExp: 60, ability: 'STATIC', evo: { to: 'stormgale', level: 24 },
    learnset: [[1, 'thundershock'], [1, 'tailwhip'], [5, 'quickattack'], [9, 'thunderwave'], [13, 'spark'],
      [18, 'thunderfang'], [22, 'chargebeam']],
    dex: {
      category: 'SPARK IMP', height: '1\'04"', weight: '15.0 lbs',
      text: 'It makes electricity by swishing its tail. It loves to play and will often zap anything that gets too close, even a friend.',
    },
  },
  stormgale: {
    name: 'STORMGALE', num: 24, types: ['electric'],
    base: { hp: 72, atk: 92, def: 64, spa: 92, spd: 66, spe: 115 },
    catchRate: 45, baseExp: 178, ability: 'STATIC',
    learnset: [[1, 'thundershock'], [1, 'tailwhip'], [5, 'quickattack'], [9, 'thunderwave'], [13, 'spark'],
      [18, 'thunderfang'], [22, 'chargebeam'], [27, 'crunch'], [32, 'thunderbolt']],
    dex: {
      category: 'THUNDERSTORM', height: '5\'11"', weight: '187.8 lbs',
      text: 'It controls electrical storms and runs so fast it leaves trails of lightning behind. It is said the sky grows stormy when it howls.',
    },
  },
  tuner: {
    name: 'TUNER', num: 25, types: ['sound'],
    base: { hp: 45, atk: 35, def: 42, spa: 62, spd: 52, spe: 56 },
    catchRate: 120, baseExp: 62, ability: 'SOUNDPROOF', evo: { to: 'sonarion', level: 32 },
    learnset: [[1, 'sonicboom'], [1, 'growl'], [6, 'quickattack'], [10, 'echoedvoice'], [15, 'screech'],
      [20, 'disarmingvoice'], [26, 'hypervoice']],
    dex: {
      category: 'LISTENING', height: '1\'08"', weight: '11.0 lbs',
      text: 'It can hear a leaf fall a mile away. The rings on its ears hum to copy any sound it likes, so its calls are often mistaken for birdsong.',
    },
  },
  sonarion: {
    name: 'SONARION', num: 26, types: ['sound'],
    base: { hp: 75, atk: 60, def: 66, spa: 112, spd: 82, spe: 96 },
    catchRate: 45, baseExp: 182, ability: 'SOUNDPROOF',
    learnset: [[1, 'sonicboom'], [1, 'growl'], [6, 'quickattack'], [10, 'echoedvoice'], [15, 'screech'],
      [20, 'disarmingvoice'], [26, 'hypervoice'], [32, 'boomburst']],
    dex: {
      category: 'ECHO', height: '3\'03"', weight: '63.1 lbs',
      text: 'It sends out sound waves from its ear-rings to navigate, talk to others and even confuse foes with illusions. Its calls can carry for miles.',
    },
  },

  // Chapter 5: drawn for the game (tools/draw_originals.py).
  geodillo: {
    name: 'GEODILLO', num: 27, types: ['rock', 'electric'],
    base: { hp: 60, atk: 80, def: 95, spa: 62, spd: 58, spe: 45 },
    catchRate: 90, baseExp: 128, ability: 'STURDY',
    learnset: [[1, 'tackle'], [1, 'defensecurl'], [1, 'thundershock'], [6, 'rockthrow'], [11, 'spark'], [16, 'rocktomb'],
      [21, 'chargebeam'], [26, 'rockslide'], [31, 'thunderfang'], [36, 'powergem'], [42, 'thunderbolt']],
    dex: {
      category: 'GEODE', height: '2\'07"', weight: '99.2 lbs',
      text: 'Its shell is made of split geodes. When it curls up and rolls, the crystals rub together and crackle with static.',
    },
  },
  hourghast: {
    name: 'HOURGHAST', num: 28, types: ['ghost', 'ground'],
    base: { hp: 58, atk: 50, def: 82, spa: 88, spd: 80, spe: 50 },
    catchRate: 60, baseExp: 140, ability: 'CURSED BODY',
    learnset: [[1, 'astonish'], [1, 'sandattack'], [5, 'mudslap'], [10, 'nightshade'], [15, 'willowisp'], [20, 'hex'],
      [25, 'bulldoze'], [30, 'shadowball'], [36, 'earthpower']],
    dex: {
      category: 'SANDGLASS', height: '3\'03"', weight: '41.9 lbs',
      text: 'A spirit that moved into a lost traveler\'s hourglass. Anyone who stares into its falling sand loses track of time for hours.',
    },
  },
  noctumoth: {
    name: 'NOCTUMOTH', num: 29, types: ['dark', 'bug'],
    base: { hp: 65, atk: 55, def: 60, spa: 90, spd: 76, spe: 82 },
    catchRate: 75, baseExp: 142, ability: 'SHIELD DUST',
    learnset: [[1, 'strugglebug'], [1, 'snarl'], [6, 'gust'], [11, 'feintattack'], [16, 'stunspore'], [21, 'bugbite'],
      [26, 'airslash'], [31, 'nastyplot'], [36, 'bugbuzz']],
    dex: {
      category: 'ECLIPSE', height: '3\'11"', weight: '27.6 lbs',
      text: 'The gold rings on its wings flare like an eclipsed sun. Its dust makes anyone who breathes it see a second moon.',
    },
  },
  mosstodon: {
    name: 'MOSSTODON', num: 30, types: ['grass', 'ground'],
    base: { hp: 95, atk: 88, def: 80, spa: 50, spd: 60, spe: 42 },
    catchRate: 60, baseExp: 145, ability: 'THICK FUR',
    learnset: [[1, 'tackle'], [1, 'growl'], [5, 'vinewhip'], [10, 'mudslap'], [15, 'megadrain'], [20, 'bulldoze'],
      [25, 'seedbomb'], [30, 'takedown'], [36, 'gigadrain'], [40, 'earthpower']],
    dex: {
      category: 'MOSS MAMMOTH', height: '7\'06"', weight: '661.4 lbs',
      text: 'Moss and flowers grow on its back all year. Small AIMON nest in its fur, and it is careful never to step on a sapling.',
    },
  },
  prismanta: {
    name: 'PRISMANTA', num: 31, types: ['water', 'flying'],
    base: { hp: 62, atk: 45, def: 55, spa: 88, spd: 92, spe: 84 },
    catchRate: 60, baseExp: 144, ability: 'PRISM SCALES',
    learnset: [[1, 'watergun'], [1, 'gust'], [8, 'bubblebeam'], [13, 'wingattack'], [18, 'waterpulse'], [24, 'airslash'],
      [30, 'powergem'], [36, 'surf']],
    dex: {
      category: 'STAINED GLASS', height: '4\'03"', weight: '63.9 lbs',
      text: 'Sunlight through its glassy wings scatters into rainbows on the sea floor. Sailors say spotting one means calm seas.',
    },
  },
  cairnling: {
    name: 'CAIRNLING', num: 32, types: ['rock'],
    base: { hp: 50, atk: 68, def: 82, spa: 35, spd: 45, spe: 30 },
    catchRate: 150, baseExp: 70, ability: 'STURDY',
    evo: { to: 'obelith', level: 30 },
    learnset: [[1, 'tackle'], [1, 'harden'], [5, 'rockthrow'], [9, 'defensecurl'], [13, 'mudslap'], [18, 'rocktomb'],
      [23, 'headbutt'], [28, 'rockslide']],
    dex: {
      category: 'CAIRN', height: '1\'08"', weight: '50.7 lbs',
      text: 'It stacks itself beside mountain trails to show travelers the way. When it gets lost, it adds a stone and waits to be found.',
    },
  },
  obelith: {
    name: 'OBELITH', num: 33, types: ['rock', 'ground'],
    base: { hp: 82, atk: 108, def: 122, spa: 60, spd: 70, spe: 40 },
    catchRate: 45, baseExp: 180, ability: 'STURDY',
    learnset: [[1, 'tackle'], [1, 'harden'], [1, 'rockthrow'], [9, 'defensecurl'], [13, 'mudslap'], [18, 'rocktomb'],
      [23, 'headbutt'], [28, 'rockslide'], [30, 'bulldoze'], [36, 'powergem'], [42, 'earthpower']],
    dex: {
      category: 'MONOLITH', height: '9\'02"', weight: '1,102 lbs',
      text: 'Ancient runes glow across its body. Some scholars think the first OBELITH was carved to guard a KEYSTONE, then simply woke up.',
    },
  },
};

const DEX_ORDER = Object.keys(SPECIES).sort((a, b) => SPECIES[a].num - SPECIES[b].num);
const STARTERS = ['skylavine', 'moltarock', 'archepin'];

// Where each species can be found in the wild (for the AIMONDEX).
function habitatOf(species) {
  const out = [];
  for (const def of Object.values(MAPS)) {
    for (const enc of [def.encounters, def.fishing]) {
      if (enc && enc.table.some((e) => e.species === species) && !out.includes(def.name)) out.push(def.name);
    }
  }
  return out;
}
