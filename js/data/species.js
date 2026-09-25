'use strict';
// The AIMON from the design sheets. Dex text is adapted from the sheets.

const SPECIES = {
  skylavine: {
    name: 'SKYLAVINE', num: 1, types: ['grass'],
    base: { hp: 45, atk: 52, def: 45, spa: 60, spd: 55, spe: 63 },
    catchRate: 45, baseExp: 64, ability: 'OVERGROW', evo: { to: 'galeaf', level: 20 },
    learnset: [[1, 'tackle'], [1, 'growl'], [5, 'leafage'], [8, 'quickattack'], [11, 'gust'],
      [14, 'absorb'], [17, 'razorleaf'], [21, 'wingattack'], [25, 'growth']],
    dex: {
      category: 'SKYWARD SPROUT', height: '1\'04"', weight: '8.8 lbs',
      text: 'Its wings are lined with leaf-like feathers that catch the wind, letting it glide between treetops and cliffs. The leaves on its head sense the weather.',
    },
  },
  moltarock: {
    name: 'MOLTAROCK', num: 4, types: ['fire'],
    base: { hp: 46, atk: 62, def: 58, spa: 55, spd: 45, spe: 48 },
    catchRate: 45, baseExp: 64, ability: 'FLAME BODY', evo: { to: 'magmorn', level: 20 },
    learnset: [[1, 'tackle'], [1, 'leer'], [5, 'ember'], [8, 'rockthrow'], [11, 'harden'],
      [14, 'flamecharge'], [17, 'smokescreen'], [21, 'headbutt']],
    dex: {
      category: 'LAVA STONE', height: '1\'00"', weight: '22.5 lbs',
      text: 'Its body is volcanic rock heated by magma trapped inside. When it is excited, the magma surges and flames erupt from the cracks in its body.',
    },
  },
  archepin: {
    name: 'ARCHEPIN', num: 7, types: ['water'],
    base: { hp: 50, atk: 50, def: 64, spa: 50, spd: 55, spe: 45 },
    catchRate: 45, baseExp: 64, ability: 'TORRENT', evo: { to: 'marshhyn', level: 20 },
    learnset: [[1, 'tackle'], [1, 'tailwhip'], [5, 'watergun'], [8, 'bite'], [11, 'withdraw'],
      [14, 'aquajet'], [17, 'rockthrow'], [21, 'bubblebeam'], [25, 'headbutt']],
    dex: {
      category: 'BRIDGE', height: '1\'04"', weight: '24.3 lbs',
      text: 'Its shell is shaped like a small stone bridge with water flowing through the arches. It helps others cross rivers by making a bridge of its back.',
    },
  },
  goskie: {
    name: 'GOSKIE', num: 10, types: ['water'],
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
    name: 'MELLOWCAP', num: 11, types: ['water'],
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
    name: 'DAPPLEKIT', num: 12, types: ['normal'],
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
    name: 'NIBBLIT', num: 13, types: ['normal'],
    base: { hp: 40, atk: 56, def: 38, spa: 30, spd: 40, spe: 78 },
    catchRate: 190, baseExp: 54, ability: 'GUTS',
    learnset: [[1, 'tackle'], [1, 'tailwhip'], [5, 'quickattack'], [9, 'bite'], [13, 'hyperfang'], [17, 'scaryface']],
    dex: {
      category: 'NIBBLE', height: '0\'08"', weight: '2.9 lbs',
      text: 'It gnaws on anything, from roots to rope. Its long pink tail helps it balance on narrow ledges and bridge railings.',
    },
  },
  ruffang: {
    name: 'RUFFANG', num: 14, types: ['normal'],
    base: { hp: 68, atk: 76, def: 56, spa: 40, spd: 52, spe: 64 },
    catchRate: 75, baseExp: 76, ability: 'INTIMIDATE',
    learnset: [[1, 'tackle'], [1, 'howl'], [6, 'bite'], [10, 'quickattack'], [13, 'takedown'], [17, 'scaryface'], [21, 'hyperfang']],
    dex: {
      category: 'LOYAL PUP', height: '2\'04"', weight: '44.1 lbs',
      text: 'The thick ruff around its neck protects it in fights. Once a RUFFANG chooses a partner, it will hold its ground for them no matter what.',
    },
  },
  leafgrub: {
    name: 'LEAFGRUB', num: 15, types: ['bug', 'grass'],
    base: { hp: 52, atk: 42, def: 56, spa: 48, spd: 52, spe: 30 },
    catchRate: 190, baseExp: 56, ability: 'SHIELD DUST',
    learnset: [[1, 'tackle'], [1, 'stringshot'], [6, 'strugglebug'], [9, 'megadrain'], [12, 'bugbite'], [16, 'stunspore']],
    dex: {
      category: 'LEAFROLL', height: '1\'00"', weight: '7.7 lbs',
      text: 'It wraps itself in fresh leaves to hide from birds. The orange spots along its sides look like eyes and scare off anything that gets too close.',
    },
  },
  bambuck: {
    name: 'BAMBUCK', num: 16, types: ['grass'],
    base: { hp: 56, atk: 66, def: 56, spa: 50, spd: 56, spe: 62 },
    catchRate: 120, baseExp: 66, ability: 'CHLOROPHYLL',
    learnset: [[1, 'tackle'], [1, 'growth'], [5, 'vinewhip'], [9, 'sleeppowder'], [12, 'razorleaf'], [16, 'megadrain'], [20, 'takedown']],
    dex: {
      category: 'BAMBOO', height: '3\'03"', weight: '66.1 lbs',
      text: 'The stalks on its body grow a little every day. BAMBUCK herds stand perfectly still among bamboo groves, where they are nearly impossible to spot.',
    },
  },
  terrapike: {
    name: 'TERRAPIKE', num: 17, types: ['ground'],
    base: { hp: 62, atk: 70, def: 82, spa: 30, spd: 46, spe: 30 },
    catchRate: 120, baseExp: 70, ability: 'STURDY',
    learnset: [[1, 'tackle'], [1, 'harden'], [5, 'mudslap'], [9, 'rockthrow'], [12, 'bulldoze'], [16, 'rocktomb'], [20, 'takedown']],
    dex: {
      category: 'SPIKESHELL', height: '2\'00"', weight: '88.2 lbs',
      text: 'Its shell is packed with ore it digs up underground. The orange crystals on its back glow brighter whenever the earth is about to shake.',
    },
  },
  scrapaw: {
    name: 'SCRAPAW', num: 18, types: ['fighting'],
    base: { hp: 52, atk: 78, def: 46, spa: 30, spd: 42, spe: 66 },
    catchRate: 120, baseExp: 68, ability: 'INNER FOCUS',
    learnset: [[1, 'scratch'], [1, 'leer'], [5, 'rocksmash'], [9, 'karatechop'], [12, 'doublekick'], [16, 'bulkup'], [20, 'bite']],
    dex: {
      category: 'SCRAPPER', height: '2\'07"', weight: '45.2 lbs',
      text: 'It trains by punching cave walls until its paws glow red. It only respects opponents who can take a hit without backing down.',
    },
  },
  voltvix: {
    name: 'VOLTVIX', num: 19, types: ['electric'],
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
    name: 'TIDEPUP', num: 20, types: ['water'],
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
    name: 'TIDEFIN', num: 21, types: ['water'],
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
    name: 'REEFWHIRL', num: 22, types: ['water'],
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
    name: 'REEFLORD', num: 23, types: ['water'],
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
    name: 'SKYDRIFT', num: 24, types: ['water'],
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
    name: 'SKYSERAPH', num: 25, types: ['water'],
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
    name: 'WRAITHLING', num: 26, types: ['ghost'],
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
    name: 'UMBRAFANG', num: 27, types: ['dark'],
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
    name: 'FLAMBRAMBLE', num: 28, types: ['fire'],
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
    name: 'VOLTIMP', num: 29, types: ['electric'],
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
    name: 'STORMGALE', num: 30, types: ['electric'],
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
    name: 'TUNER', num: 31, types: ['sound'],
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
    name: 'SONARION', num: 32, types: ['sound'],
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
    name: 'GEODILLO', num: 33, types: ['rock', 'electric'],
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
    name: 'HOURGHAST', num: 34, types: ['ghost', 'ground'],
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
    name: 'NOCTUMOTH', num: 35, types: ['dark', 'bug'],
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
    name: 'MOSSTODON', num: 36, types: ['grass', 'ground'],
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
    name: 'PRISMANTA', num: 37, types: ['water', 'flying'],
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
    name: 'CAIRNLING', num: 38, types: ['rock'],
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
    name: 'OBELITH', num: 39, types: ['rock', 'ground'],
    base: { hp: 82, atk: 108, def: 122, spa: 60, spd: 70, spe: 40 },
    catchRate: 45, baseExp: 180, ability: 'STURDY',
    learnset: [[1, 'tackle'], [1, 'harden'], [1, 'rockthrow'], [9, 'defensecurl'], [13, 'mudslap'], [18, 'rocktomb'],
      [23, 'headbutt'], [28, 'rockslide'], [30, 'bulldoze'], [36, 'powergem'], [42, 'earthpower']],
    dex: {
      category: 'MONOLITH', height: '9\'02"', weight: '1,102 lbs',
      text: 'Ancient runes glow across its body. Some scholars think the first OBELITH was carved to guard a KEYSTONE, then simply woke up.',
    },
  },
  // --- Starter evolutions (level 20 and level 45) -----------------------------
  galeaf: {
    name: 'GALEAF', num: 2, types: ['grass'],
    base: { hp: 60, atk: 68, def: 58, spa: 78, spd: 68, spe: 83 },
    catchRate: 45, baseExp: 142, ability: 'OVERGROW', evo: { to: 'sylvaquila', level: 45 },
    learnset: [[1, 'tackle'], [1, 'growl'], [5, 'leafage'], [8, 'quickattack'], [11, 'gust'],
      [14, 'absorb'], [17, 'razorleaf'], [20, 'magicalleaf'], [21, 'wingattack'], [25, 'growth'], [29, 'megadrain'],
      [34, 'airslash'], [39, 'seedbomb'], [44, 'gigadrain']],
    dex: {
      category: 'LEAF GLIDER', height: '2\'07"', weight: '33.5 lbs',
      text: 'It rides the wind on its leaf-blade wings, gliding between forests and mountains. The blades on its tail can split a falling leaf in two.',
    },
  },
  sylvaquila: {
    name: 'SYLVAQUILA', num: 3, types: ['grass', 'flying'],
    base: { hp: 78, atk: 88, def: 75, spa: 105, spd: 88, spe: 101 },
    catchRate: 45, baseExp: 236, ability: 'OVERGROW',
    learnset: [[1, 'tackle'], [1, 'growl'], [5, 'leafage'], [8, 'quickattack'], [11, 'gust'],
      [14, 'absorb'], [17, 'razorleaf'], [20, 'magicalleaf'], [21, 'wingattack'], [25, 'growth'], [29, 'megadrain'],
      [34, 'airslash'], [39, 'seedbomb'], [44, 'gigadrain'], [45, 'leafblade'], [51, 'hurricane']],
    dex: {
      category: 'GROVE GUARDIAN', height: '5\'03"', weight: '85.3 lbs',
      text: 'Said to be the guardian of ancient forests. A single beat of its wings stirs up winds that carry seeds far and help the forest thrive.',
    },
  },
  magmorn: {
    name: 'MAGMORN', num: 5, types: ['fire'],
    base: { hp: 62, atk: 84, def: 72, spa: 70, spd: 60, spe: 67 },
    catchRate: 45, baseExp: 142, ability: 'FLAME BODY', evo: { to: 'calderon', level: 45 },
    learnset: [[1, 'tackle'], [1, 'leer'], [5, 'ember'], [8, 'rockthrow'], [11, 'harden'],
      [14, 'flamecharge'], [17, 'smokescreen'], [20, 'firefang'], [21, 'headbutt'], [25, 'rocktomb'], [29, 'flamewheel'],
      [34, 'crunch'], [39, 'flamethrower'], [44, 'rockslide']],
    dex: {
      category: 'MAGMA CORE', height: '3\'07"', weight: '60.8 lbs',
      text: 'Its magma core keeps its body hot, even in a blizzard. When it gets angry, small explosions pop from the cracks in its hide.',
    },
  },
  calderon: {
    name: 'CALDERON', num: 6, types: ['fire', 'ground'],
    base: { hp: 85, atk: 115, def: 95, spa: 85, spd: 75, spe: 80 },
    catchRate: 45, baseExp: 236, ability: 'FLAME BODY',
    learnset: [[1, 'tackle'], [1, 'leer'], [5, 'ember'], [8, 'rockthrow'], [11, 'harden'],
      [14, 'flamecharge'], [17, 'smokescreen'], [20, 'firefang'], [21, 'headbutt'], [25, 'rocktomb'], [29, 'flamewheel'],
      [34, 'crunch'], [39, 'flamethrower'], [44, 'rockslide'], [45, 'earthquake'], [51, 'flareblitz']],
    dex: {
      category: 'VOLCANO', height: '7\'10"', weight: '150.4 lbs',
      text: 'Its volcanic heart burns hot enough to melt rock. It is said that a single roar from it can reshape the land around it.',
    },
  },
  marshhyn: {
    name: 'MARSHHYN', num: 8, types: ['water'],
    base: { hp: 68, atk: 66, def: 80, spa: 68, spd: 72, spe: 61 },
    catchRate: 45, baseExp: 142, ability: 'TORRENT', evo: { to: 'maelwyrm', level: 45 },
    learnset: [[1, 'tackle'], [1, 'tailwhip'], [5, 'watergun'], [8, 'bite'], [11, 'withdraw'],
      [14, 'aquajet'], [17, 'rockthrow'], [20, 'waterpulse'], [21, 'bubblebeam'], [25, 'headbutt'], [29, 'aquatail'],
      [34, 'crunch'], [39, 'surf'], [44, 'rockslide']],
    dex: {
      category: 'SWIFT FIN', height: '2\'11"', weight: '41.0 lbs',
      text: 'It can hold its breath for a very long time. Its fins let it swim upstream with incredible speed, even through rapids.',
    },
  },
  maelwyrm: {
    name: 'MAELWYRM', num: 9, types: ['water'],
    base: { hp: 90, atk: 85, def: 95, spa: 100, spd: 90, spe: 75 },
    catchRate: 45, baseExp: 236, ability: 'TORRENT',
    learnset: [[1, 'tackle'], [1, 'tailwhip'], [5, 'watergun'], [8, 'bite'], [11, 'withdraw'],
      [14, 'aquajet'], [17, 'rockthrow'], [20, 'waterpulse'], [21, 'bubblebeam'], [25, 'headbutt'], [29, 'aquatail'],
      [34, 'crunch'], [39, 'surf'], [44, 'rockslide'], [45, 'whirlpool'], [51, 'hydropump']],
    dex: {
      category: 'MAELSTROM', height: '3\'11"', weight: '71.4 lbs',
      text: 'It steers the currents with its flowing fins. When it coils through the water, whirlpools form that can swallow a whole boat.',
    },
  },

  // --- Chapter 6: ROUTE 9 --------------------------------------------------------
  skylark: {
    name: 'SKYLARK', num: 40, types: ['normal', 'flying'],
    base: { hp: 40, atk: 45, def: 40, spa: 35, spd: 35, spe: 60 },
    catchRate: 190, baseExp: 52, ability: 'KEEN EYE', evo: { to: 'skyblade', level: 30 },
    learnset: [[1, 'peck'], [1, 'growl'], [5, 'quickattack'], [9, 'gust'], [13, 'wingattack'], [17, 'howl'],
      [21, 'aerialace'], [25, 'headbutt'], [29, 'airslash'], [33, 'takedown']],
    dex: {
      category: 'TINY BIRD', height: '1\'00"', weight: '6.2 lbs',
      text: 'A curious, lively bird that soars over fields and rivers. It calls to others of its kind with sharp little cries.',
    },
  },
  skyblade: {
    name: 'SKYBLADE', num: 41, types: ['normal', 'flying'],
    base: { hp: 63, atk: 70, def: 58, spa: 50, spd: 50, spe: 82 },
    catchRate: 90, baseExp: 125, ability: 'KEEN EYE', evo: { to: 'aerialis', level: 45 },
    learnset: [[1, 'peck'], [1, 'growl'], [5, 'quickattack'], [9, 'gust'], [13, 'wingattack'], [17, 'howl'],
      [21, 'aerialace'], [25, 'headbutt'], [29, 'airslash'], [30, 'swift'], [33, 'takedown'], [38, 'bodyslam']],
    dex: {
      category: 'SWIFT WING', height: '2\'11"', weight: '32.0 lbs',
      text: 'Its wing feathers are stiff and sharp as blades. It dives at prey from high above, then shoots straight back into the sky.',
    },
  },
  aerialis: {
    name: 'AERIALIS', num: 42, types: ['normal', 'flying'],
    base: { hp: 83, atk: 100, def: 75, spa: 65, spd: 70, spe: 112 },
    catchRate: 45, baseExp: 214, ability: 'KEEN EYE',
    learnset: [[1, 'peck'], [1, 'growl'], [5, 'quickattack'], [9, 'gust'], [13, 'wingattack'], [17, 'howl'],
      [21, 'aerialace'], [25, 'headbutt'], [29, 'airslash'], [30, 'swift'], [33, 'takedown'], [38, 'bodyslam'],
      [45, 'bravebird']],
    dex: {
      category: 'HIGH SKY', height: '5\'03"', weight: '87.1 lbs',
      text: 'It circles so far above the clouds that it can hardly be seen. Its cry carries from one mountaintop to the next.',
    },
  },
  aquabug: {
    name: 'AQUABUG', num: 43, types: ['bug', 'water'],
    base: { hp: 45, atk: 50, def: 55, spa: 40, spd: 45, spe: 40 },
    catchRate: 190, baseExp: 55, ability: 'SWIFT SWIM', evo: { to: 'riverclaw', level: 30 },
    learnset: [[1, 'tackle'], [1, 'withdraw'], [5, 'watergun'], [9, 'strugglebug'], [13, 'bugbite'], [17, 'aquajet'],
      [21, 'bubblebeam'], [25, 'waterpulse'], [29, 'xscissor'], [33, 'aquatail']],
    dex: {
      category: 'POND BUG', height: '1\'04"', weight: '11.5 lbs',
      text: 'It lives in fresh water and feels for movement with its leaf-like antennae. It can hold its breath for a long time.',
    },
  },
  riverclaw: {
    name: 'RIVERCLAW', num: 44, types: ['bug', 'water'],
    base: { hp: 65, atk: 80, def: 80, spa: 50, spd: 60, spe: 55 },
    catchRate: 90, baseExp: 130, ability: 'SWIFT SWIM', evo: { to: 'tidecrusher', level: 45 },
    learnset: [[1, 'tackle'], [1, 'withdraw'], [5, 'watergun'], [9, 'strugglebug'], [13, 'bugbite'], [17, 'aquajet'],
      [21, 'bubblebeam'], [25, 'waterpulse'], [29, 'xscissor'], [30, 'crunch'], [34, 'aquatail'], [39, 'rockslide']],
    dex: {
      category: 'RIVER CLAW', height: '2\'11"', weight: '52.9 lbs',
      text: 'It grips the stones of the riverbed to hold steady in strong currents. Crystals begin to grow along its back.',
    },
  },
  tidecrusher: {
    name: 'TIDECRUSHER', num: 45, types: ['bug', 'water'],
    base: { hp: 85, atk: 115, def: 110, spa: 60, spd: 75, spe: 60 },
    catchRate: 45, baseExp: 215, ability: 'SWIFT SWIM',
    learnset: [[1, 'tackle'], [1, 'withdraw'], [5, 'watergun'], [9, 'strugglebug'], [13, 'bugbite'], [17, 'aquajet'],
      [21, 'bubblebeam'], [25, 'waterpulse'], [29, 'xscissor'], [30, 'crunch'], [34, 'aquatail'], [39, 'rockslide'],
      [45, 'stoneedge'], [51, 'earthquake']],
    dex: {
      category: 'CRYSTAL SHELL', height: '5\'07"', weight: '194.0 lbs',
      text: 'Its crystal armor is harder than steel. With one swing of its claws it can split a boulder or turn back a flood.',
    },
  },

  // --- Chapter 7: ROUTE 10 and SUNSPIRE ------------------------------------------
  sandbloom: {
    name: 'SANDBLOOM', num: 46, types: ['ground'],
    base: { hp: 50, atk: 58, def: 55, spa: 35, spd: 40, spe: 45 },
    catchRate: 190, baseExp: 56, ability: 'SAND VEIL', evo: { to: 'dunewalker', level: 30 },
    learnset: [[1, 'scratch'], [1, 'sandattack'], [5, 'mudslap'], [9, 'quickattack'], [13, 'rockthrow'], [17, 'bulldoze'],
      [21, 'bite'], [25, 'rocktomb'], [29, 'headbutt'], [33, 'earthpower']],
    dex: {
      category: 'DESERT', height: '1\'08"', weight: '17.2 lbs',
      text: 'It survives the desert by storing water in its hump. It skims across loose sand and rests in the shade of rocky outcrops.',
    },
  },
  dunewalker: {
    name: 'DUNEWALKER', num: 47, types: ['ground'],
    base: { hp: 72, atk: 82, def: 80, spa: 45, spd: 55, spe: 56 },
    catchRate: 90, baseExp: 132, ability: 'SAND VEIL', evo: { to: 'dunarch', level: 45 },
    learnset: [[1, 'scratch'], [1, 'sandattack'], [5, 'mudslap'], [9, 'quickattack'], [13, 'rockthrow'], [17, 'bulldoze'],
      [21, 'bite'], [25, 'rocktomb'], [29, 'headbutt'], [30, 'crunch'], [34, 'rockslide'], [39, 'earthpower']],
    dex: {
      category: 'DUNE', height: '3\'03"', weight: '79.4 lbs',
      text: 'Its thick, plated back shields it from sandstorms. It can cross the dunes for days without a single sip of water.',
    },
  },
  dunarch: {
    name: 'DUNARCH', num: 48, types: ['ground'],
    base: { hp: 95, atk: 120, def: 105, spa: 60, spd: 75, spe: 65 },
    catchRate: 45, baseExp: 220, ability: 'SAND VEIL',
    learnset: [[1, 'scratch'], [1, 'sandattack'], [5, 'mudslap'], [9, 'quickattack'], [13, 'rockthrow'], [17, 'bulldoze'],
      [21, 'bite'], [25, 'rocktomb'], [29, 'headbutt'], [30, 'crunch'], [34, 'rockslide'], [39, 'earthpower'],
      [45, 'earthquake'], [51, 'stoneedge']],
    dex: {
      category: 'DUNE MONARCH', height: '6\'03"', weight: '242.5 lbs',
      text: 'The ruler of the dunes. Carvings in the SUNSPIRE RUINS show it guarding the city, and some say it guards them still.',
    },
  },
  embertail: {
    name: 'EMBERTAIL', num: 49, types: ['fire', 'ground'],
    base: { hp: 52, atk: 64, def: 50, spa: 60, spd: 50, spe: 64 },
    catchRate: 120, baseExp: 70, ability: 'BLAZE', evo: { to: 'cindrake', level: 45 },
    learnset: [[1, 'scratch'], [1, 'leer'], [5, 'ember'], [9, 'mudslap'], [13, 'flamecharge'], [17, 'bite'],
      [21, 'firefang'], [25, 'bulldoze'], [29, 'flamewheel'], [33, 'lavaplume'], [38, 'earthpower'], [42, 'flamethrower']],
    dex: {
      category: 'EMBER LIZARD', height: '2\'00"', weight: '20.7 lbs',
      text: 'It burrows through hot sand and rock, using the flame on its head to scorch prey and to keep itself safe.',
    },
  },
  cindrake: {
    name: 'CINDRAKE', num: 50, types: ['fire', 'ground'],
    base: { hp: 80, atk: 100, def: 78, spa: 95, spd: 72, spe: 95 },
    catchRate: 45, baseExp: 210, ability: 'BLAZE',
    learnset: [[1, 'scratch'], [1, 'leer'], [5, 'ember'], [9, 'mudslap'], [13, 'flamecharge'], [17, 'bite'],
      [21, 'firefang'], [25, 'bulldoze'], [29, 'flamewheel'], [33, 'lavaplume'], [38, 'earthpower'], [42, 'flamethrower'],
      [45, 'earthquake'], [51, 'flareblitz']],
    dex: {
      category: 'CINDER DRAKE', height: '4\'11"', weight: '127.9 lbs',
      text: 'Flames pour from the vents along its back. Wherever it sleeps, the sand melts and cools into sheets of glass.',
    },
  },
  distortail: {
    name: 'DISTORTAIL', num: 51, types: ['dark', 'sound'],
    base: { hp: 50, atk: 62, def: 45, spa: 65, spd: 45, spe: 70 },
    catchRate: 120, baseExp: 68, ability: 'INTIMIDATE', evo: { to: 'distortionix', level: 38 },
    learnset: [[1, 'scratch'], [1, 'leer'], [5, 'sonicboom'], [9, 'bite'], [13, 'snarl'], [17, 'echoedvoice'],
      [21, 'feintattack'], [25, 'screech'], [29, 'crunch'], [33, 'hypervoice']],
    dex: {
      category: 'DISTORTION', height: '2\'07"', weight: '36.2 lbs',
      text: 'Its warped cries break a foe\'s focus and make it doubt its next move. TEAM DISTORTION uses it to sow chaos in battle.',
    },
  },
  distortionix: {
    name: 'DISTORTIONIX', num: 52, types: ['dark', 'sound'],
    base: { hp: 78, atk: 95, def: 70, spa: 100, spd: 70, spe: 102 },
    catchRate: 45, baseExp: 208, ability: 'PUNK ROCK',
    learnset: [[1, 'scratch'], [1, 'leer'], [5, 'sonicboom'], [9, 'bite'], [13, 'snarl'], [17, 'echoedvoice'],
      [21, 'feintattack'], [25, 'screech'], [29, 'crunch'], [33, 'hypervoice'], [38, 'darkpulse'], [43, 'nastyplot'],
      [48, 'boomburst']],
    dex: {
      category: 'DISTORTION', height: '5\'03"', weight: '107.4 lbs',
      text: 'Its sound waves can shatter glass and seem to bend the air itself. TEAM DISTORTION uses it to tear down a foe\'s defenses.',
    },
  },
  specterib: {
    name: 'SPECTERIB', num: 53, types: ['ghost', 'sound'],
    base: { hp: 50, atk: 40, def: 50, spa: 75, spd: 65, spe: 70 },
    catchRate: 90, baseExp: 75, ability: 'INFILTRATOR', evo: { to: 'phantasmuse', level: 38 },
    learnset: [[1, 'astonish'], [1, 'growl'], [5, 'gust'], [9, 'echoedvoice'], [13, 'nightshade'], [17, 'disarmingvoice'],
      [21, 'hex'], [25, 'willowisp'], [29, 'shadowball'], [33, 'hypervoice']],
    dex: {
      category: 'LOST ECHO', height: '3\'03"', weight: '28.2 lbs',
      text: 'Its mournful calls carry for miles and lure lost travelers into its territory. It can bend sound to slip through walls.',
    },
  },
  phantasmuse: {
    name: 'PHANTASMUSE', num: 54, types: ['ghost', 'sound'],
    base: { hp: 75, atk: 60, def: 72, spa: 115, spd: 95, spe: 98 },
    catchRate: 45, baseExp: 210, ability: 'SOUNDPROOF',
    learnset: [[1, 'astonish'], [1, 'growl'], [5, 'gust'], [9, 'echoedvoice'], [13, 'nightshade'], [17, 'disarmingvoice'],
      [21, 'hex'], [25, 'willowisp'], [29, 'shadowball'], [33, 'hypervoice'], [38, 'airslash'], [43, 'nastyplot'],
      [48, 'boomburst']],
    dex: {
      category: 'PHANTOM MUSE', height: '4\'11"', weight: '54.0 lbs',
      text: 'It sings a haunting melody that seems to come from somewhere far away. Those who hear it remember songs they never learned.',
    },
  },

  // --- Chapter 8: ROUTE 12 and MEADOWFIELD ---------------------------------------
  moozle: {
    name: 'MOOZLE', num: 55, types: ['normal'],
    base: { hp: 80, atk: 60, def: 65, spa: 40, spd: 60, spe: 45 },
    catchRate: 120, baseExp: 72, ability: 'THICK FAT', evo: { to: 'bovelle', level: 36 },
    learnset: [[1, 'tackle'], [1, 'growl'], [5, 'defensecurl'], [10, 'mudslap'], [15, 'headbutt'], [20, 'bulldoze'],
      [25, 'workup'], [30, 'bodyslam'], [35, 'takedown']],
    dex: {
      category: 'MILK COW', height: '3\'07"', weight: '71.7 lbs',
      text: 'Its rich milk is a favorite all over VALEMORA. It is gentle and easygoing, but it can be very stubborn when it wants to be.',
    },
  },
  bovelle: {
    name: 'BOVELLE', num: 56, types: ['normal'],
    base: { hp: 110, atk: 85, def: 95, spa: 55, spd: 90, spe: 55 },
    catchRate: 45, baseExp: 180, ability: 'MILK VEIL',
    learnset: [[1, 'tackle'], [1, 'growl'], [5, 'defensecurl'], [10, 'mudslap'], [15, 'headbutt'], [20, 'bulldoze'],
      [25, 'workup'], [30, 'bodyslam'], [35, 'takedown'], [36, 'bulkup'], [42, 'earthquake'], [48, 'hypervoice']],
    dex: {
      category: 'BELL COW', height: '4\'11"', weight: '260.1 lbs',
      text: 'The bell around its neck rings with every step. When a whole herd comes home, the bells can be heard across the farm.',
    },
  },
  windling: {
    name: 'WINDLING', num: 57, types: ['electric'],
    base: { hp: 45, atk: 40, def: 40, spa: 62, spd: 48, spe: 70 },
    catchRate: 120, baseExp: 64, ability: 'WIND POWER', evo: { to: 'zephyron', level: 38 },
    learnset: [[1, 'thundershock'], [1, 'tailwhip'], [5, 'quickattack'], [9, 'gust'], [13, 'spark'], [17, 'thunderwave'],
      [21, 'chargebeam'], [25, 'shockwave'], [29, 'airslash'], [33, 'thunderbolt']],
    dex: {
      category: 'PROPELLER', height: '2\'00"', weight: '21.6 lbs',
      text: 'It lives near windmills, where the steady breeze keeps its propellers spinning. It makes electricity from the wind.',
    },
  },
  zephyron: {
    name: 'ZEPHYRON', num: 58, types: ['electric', 'flying'],
    base: { hp: 80, atk: 75, def: 70, spa: 110, spd: 80, spe: 110 },
    catchRate: 45, baseExp: 215, ability: 'WIND RIDER',
    learnset: [[1, 'thundershock'], [1, 'tailwhip'], [5, 'quickattack'], [9, 'gust'], [13, 'spark'], [17, 'thunderwave'],
      [21, 'chargebeam'], [25, 'shockwave'], [29, 'airslash'], [33, 'thunderbolt'], [38, 'hurricane'], [44, 'wildcharge']],
    dex: {
      category: 'STORM WIND', height: '5\'11"', weight: '115.3 lbs',
      text: 'The winds from its propellers whip up electric storms. It rules the battlefield from the sky, striking from above.',
    },
  },

  // --- Chapter 9: ROUTE 11 and STONEPEAK ------------------------------------------
  bellpup: {
    name: 'BELLPUP', num: 59, types: ['sound'],
    base: { hp: 48, atk: 42, def: 55, spa: 58, spd: 55, spe: 42 },
    catchRate: 190, baseExp: 60, ability: 'SOUNDPROOF', evo: { to: 'bellchime', level: 30 },
    learnset: [[1, 'tackle'], [1, 'growl'], [5, 'sonicboom'], [9, 'echoedvoice'], [13, 'defensecurl'],
      [17, 'disarmingvoice'], [21, 'headbutt'], [26, 'hypervoice']],
    dex: {
      category: 'LITTLE BELL', height: '1\'04"', weight: '15.0 lbs',
      text: 'Its bell-shaped head rings with soft chimes that calm other AIMON. It often wanders off following the sound of its own bell.',
    },
  },
  bellchime: {
    name: 'BELLCHIME', num: 60, types: ['sound'],
    base: { hp: 68, atk: 58, def: 78, spa: 80, spd: 78, spe: 58 },
    catchRate: 90, baseExp: 140, ability: 'COMPETITIVE', evo: { to: 'bellumor', level: 45 },
    learnset: [[1, 'tackle'], [1, 'growl'], [5, 'sonicboom'], [9, 'echoedvoice'], [13, 'defensecurl'],
      [17, 'disarmingvoice'], [21, 'headbutt'], [26, 'hypervoice'], [30, 'swift'], [35, 'bodyslam'], [40, 'powergem']],
    dex: {
      category: 'CHIME', height: '2\'07"', weight: '40.1 lbs',
      text: 'Its bell rings with a clear, sweet tone that can be heard from far away. It rings out to talk with others of its kind.',
    },
  },
  bellumor: {
    name: 'BELLUMOR', num: 61, types: ['sound'],
    base: { hp: 90, atk: 65, def: 95, spa: 115, spd: 110, spe: 70 },
    catchRate: 45, baseExp: 230, ability: 'LEVITATE',
    learnset: [[1, 'tackle'], [1, 'growl'], [5, 'sonicboom'], [9, 'echoedvoice'], [13, 'defensecurl'],
      [17, 'disarmingvoice'], [21, 'headbutt'], [26, 'hypervoice'], [30, 'swift'], [35, 'bodyslam'], [40, 'powergem'],
      [45, 'boomburst'], [51, 'shadowball']],
    dex: {
      category: 'GREAT BELL', height: '5\'03"', weight: '94.1 lbs',
      text: 'Its great bell can be heard for miles. Its chimes calm even the fiercest AIMON, and it is said its song can soothe a region.',
    },
  },
  glacron: {
    name: 'GLACRON', num: 62, types: ['fighting'],
    base: { hp: 95, atk: 110, def: 85, spa: 40, spd: 65, spe: 55 },
    catchRate: 75, baseExp: 165, ability: 'THICK FAT',
    learnset: [[1, 'scratch'], [1, 'leer'], [5, 'rocksmash'], [9, 'howl'], [13, 'karatechop'], [17, 'headbutt'],
      [21, 'doublekick'], [25, 'bulkup'], [29, 'brickbreak'], [34, 'bodyslam'], [39, 'rockslide'], [44, 'closecombat']],
    dex: {
      category: 'SNOW APE', height: '3\'11"', weight: '93.3 lbs',
      text: 'Its thick fur keeps out the fiercest cold. It is very territorial and will challenge anything that comes near its cave.',
    },
  },
  noctheryx: {
    name: 'NOCTHERYX', num: 63, types: ['dark', 'flying'],
    base: { hp: 70, atk: 80, def: 60, spa: 85, spd: 65, spe: 105 },
    catchRate: 60, baseExp: 170, ability: 'NIGHT VEIL',
    learnset: [[1, 'peck'], [1, 'leer'], [5, 'gust'], [9, 'feintattack'], [13, 'wingattack'], [17, 'snarl'],
      [21, 'bite'], [25, 'nightslash'], [29, 'airslash'], [33, 'crunch'], [37, 'darkpulse'], [42, 'nastyplot'],
      [47, 'hurricane']],
    dex: {
      category: 'NIGHT OWL', height: '2\'07"', weight: '27.8 lbs',
      text: 'Its feathers soak up light, so it can fly without a sound through the dark. It is often seen perched on high cliffs at dusk.',
    },
  },

  // --- Chapter 10: EMBERPEAK ---------------------------------------------------------
  volcarn: {
    name: 'VOLCARN', num: 64, types: ['fire'],
    base: { hp: 60, atk: 78, def: 70, spa: 55, spd: 55, spe: 62 },
    catchRate: 120, baseExp: 90, ability: 'FLASH FIRE', evo: { to: 'pyroclast', level: 45 },
    learnset: [[1, 'tackle'], [1, 'leer'], [5, 'ember'], [9, 'rockthrow'], [13, 'flamecharge'], [17, 'bite'],
      [21, 'firefang'], [25, 'rocktomb'], [29, 'flamewheel'], [33, 'lavaplume'], [38, 'crunch'], [42, 'rockslide']],
    dex: {
      category: 'MOLTEN', height: '2\'11"', weight: '40.6 lbs',
      text: 'Its body is made of cooled lava. It lives on EMBERPEAK, soaking up heat from the volcanic soil to feed its flames.',
    },
  },
  pyroclast: {
    name: 'PYROCLAST', num: 65, types: ['fire', 'rock'],
    base: { hp: 90, atk: 120, def: 115, spa: 80, spd: 70, spe: 55 },
    catchRate: 45, baseExp: 220, ability: 'MAGMA ARMOR',
    learnset: [[1, 'tackle'], [1, 'leer'], [5, 'ember'], [9, 'rockthrow'], [13, 'flamecharge'], [17, 'bite'],
      [21, 'firefang'], [25, 'rocktomb'], [29, 'flamewheel'], [33, 'lavaplume'], [38, 'crunch'], [42, 'rockslide'],
      [45, 'stoneedge'], [51, 'flareblitz']],
    dex: {
      category: 'ERUPTION', height: '5\'11"', weight: '213.2 lbs',
      text: 'When threatened, it erupts with molten energy. Its rocky plates shrug off any heat, and it can steer rivers of lava.',
    },
  },
  rykarn: {
    name: 'RYKARN', num: 66, types: ['dark', 'fighting'],
    base: { hp: 90, atk: 125, def: 80, spa: 70, spd: 75, spe: 100 },
    catchRate: 25, baseExp: 240, ability: 'INTIMIDATE',
    learnset: [[1, 'scratch'], [1, 'leer'], [5, 'bite'], [9, 'rocksmash'], [13, 'feintattack'], [17, 'karatechop'],
      [21, 'scaryface'], [25, 'crunch'], [29, 'brickbreak'], [33, 'nightslash'], [37, 'bulkup'], [41, 'closecombat'],
      [46, 'darkpulse']],
    dex: {
      category: 'SILENCER', height: '5\'07"', weight: '137.3 lbs',
      text: 'Its presence alone silences the weak. It is said that when it roars, only the strong can still be heard.',
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
