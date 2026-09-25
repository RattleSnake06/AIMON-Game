'use strict';
// Trainer battles. The rival's team is decided by the player's starter.

const TRAINERS = {
  rival1: {
    cls: 'RIVAL', name: 'KAI', sprite: 'rival', payout: 40,
    // Still green: the rival's AIMON hasn't learned its type move yet.
    party: () => {
      const sp = State.rivalStarter();
      const status = { skylavine: 'growl', moltarock: 'leer', archepin: 'tailwhip' }[sp];
      return [[sp, 5, ['tackle', status]]];
    },
    lose: 'What?! I picked the wrong AIMON!',
    win: 'Yeah! Am I great or what?',
    canLose: true,
  },
  ben: {
    cls: 'YOUNGSTER', name: 'BEN', sprite: 'youngster', payout: 16,
    party: () => [['goskie', 4]],
    intro: 'Hey! You just got your first AIMON, right? Let\'s battle!',
    lose: 'Aww, my GOSKIE was flapping so hard...',
    after: 'Wild GOSKIE like the riverbank. You\'ll see lots of them around here.',
  },
  mia: {
    cls: 'LASS', name: 'MIA', sprite: 'lass', payout: 20,
    party: () => [['mellowcap', 4], ['goskie', 3]],
    intro: 'Our eyes met! That means we have to battle!',
    lose: 'My MELLOWCAP just wanted a nap...',
    after: 'MELLOWCAP are so calm. Nothing seems to bother them!',
  },
  ned: {
    cls: 'FISHER', name: 'NED', sprite: 'fisher', payout: 24,
    party: () => [['mellowcap', 5]],
    intro: 'Shh! You\'ll scare the fish! ...Oh, forget it. Battle me!',
    lose: 'Well, I\'m not catching anything today anyway.',
    after: 'Water AIMON love this river. GRASS moves work great against them.',
  },

  // --- Route 2 ---------------------------------------------------------------
  todd: {
    cls: 'CAMPER', name: 'TODD', sprite: 'camper', payout: 20,
    party: () => [['mellowcap', 7], ['goskie', 6]],
    intro: 'I\'m camping by the river until the shaking stops. Want to battle while we wait?',
    lose: 'Guess I should\'ve trained instead of napping.',
    after: 'Every few hours the ground rumbles. It always seems to come from that cave.',
  },
  june: {
    cls: 'PICNICKER', name: 'JUNE', sprite: 'picnicker', payout: 20,
    party: () => [['goskie', 7], ['goskie', 7]],
    intro: 'My GOSKIE flock won\'t stop honking at the cave. Something scared them!',
    lose: 'My poor GOSKIE...',
    after: 'Strange people in black coats marched past here this morning. They didn\'t even say hello.',
  },
  // --- Riftstone Cave ----------------------------------------------------------
  grant: {
    cls: 'HIKER', name: 'GRANT', sprite: 'hiker', payout: 24,
    party: () => [['terrapike', 10]],
    intro: 'Whoa there! These tunnels have been shifting all week. Show me you can handle yourself!',
    lose: 'Solid as bedrock, you are!',
    after: 'TERRAPIKE\'s crystals have been glowing like crazy. The ground here isn\'t settled at all.',
  },
  kenji: {
    cls: 'BLACK BELT', name: 'KENJI', sprite: 'blackbelt', payout: 24,
    party: () => [['scrapaw', 9], ['scrapaw', 10]],
    intro: 'I train in the dark to sharpen my senses. HAAH! Face my fists!',
    lose: 'My focus... shattered!',
    after: 'FIGHTING moves hit NORMAL types hard. Remember that if you ever face HOLT.',
  },
  grunt: {
    cls: 'DISTORTION GRUNT', name: '', sprite: 'grunt', payout: 30, music: 'distortion',
    party: () => [['voltvix', 13, ['spark', 'thundershock', 'thunderwave', 'quickattack']]],
    lose: 'What?! My VOLTVIX... beaten by a kid?!',
  },
  // --- Route 3 -------------------------------------------------------------------
  rio: {
    cls: 'BUG CATCHER', name: 'RIO', sprite: 'bugcatcher', payout: 12,
    party: () => [['leafgrub', 9], ['leafgrub', 10]],
    intro: 'Shh! I almost had a BAMBUCK... Oh well. You\'ll do instead!',
    lose: 'My LEAFGRUB got all tangled up!',
    after: 'BAMBUCK stand so still in the bamboo you can walk right past them.',
  },
  nina: {
    cls: 'LASS', name: 'NINA', sprite: 'lass', payout: 20,
    party: () => [['bambuck', 11]],
    intro: 'Are you heading to GRAYHAVEN? Let\'s see if you\'re ready!',
    lose: 'You\'re really strong!',
    after: 'HOLT\'s GYM was closed for days. Everyone in GRAYHAVEN was worried about him.',
  },
  rival2: {
    cls: 'RIVAL', name: 'KAI', sprite: 'rival', payout: 40,
    party: () => [['goskie', 12], [State.rivalStarter(), 14]],
    intro: '',
    lose: 'Argh! I trained so hard, too...',
    win: 'Ha! Told you I\'d catch up!',
  },
  // --- Grayhaven Gym ---------------------------------------------------------------
  ross: {
    cls: 'GYM TRAINEE', name: 'ROSS', sprite: 'trainee', payout: 24,
    party: () => [['nibblit', 11]],
    intro: 'HOLT taught us that a solid foundation beats flashy tricks. Let me show you!',
    lose: 'My foundation... crumbled.',
    after: 'HOLT\'s RUFFANG is the toughest AIMON I\'ve ever seen. Be ready for it.',
  },
  tessa: {
    cls: 'GYM TRAINEE', name: 'TESSA', sprite: 'trainee', payout: 24,
    party: () => [['dapplekit', 11], ['nibblit', 11]],
    intro: 'You want to face HOLT? You\'ll have to get through me first!',
    lose: 'Okay, okay! You can go see HOLT.',
    after: 'NORMAL types have no weaknesses except FIGHTING. Plan your moves carefully!',
  },
  holt: {
    cls: 'LEADER', name: 'HOLT', sprite: 'holt', payout: 100, music: 'leader', leader: true,
    party: () => [
      ['nibblit', 12, ['quickattack', 'bite', 'tailwhip', 'tackle']],
      ['dapplekit', 13, ['swift', 'quickattack', 'workup', 'tailwhip']],
      ['ruffang', 15, ['takedown', 'bite', 'howl', 'quickattack']],
    ],
    lose: 'Ha! You didn\'t budge an inch. I know when I\'m beaten.',
  },

  // --- Route 5 / Pinecrest Forest --------------------------------------------------
  wes: {
    cls: 'CAMPER', name: 'WES', sprite: 'camper', payout: 20,
    party: () => [['leafgrub', 11], ['goskie', 12]],
    intro: 'The road to CEDARWOOD is my training ground! Show me what you\'ve got!',
    lose: 'Guess I need a few more laps around the pond.',
    after: 'Folks in CEDARWOOD say their giant tree is sick. Weird, right?',
  },
  lena: {
    cls: 'LASS', name: 'LENA', sprite: 'lass', payout: 20,
    party: () => [['mellowcap', 12], ['nibblit', 12]],
    intro: 'Ooh, is that a BADGE? Let\'s see if you earned it!',
    lose: 'Okay, you definitely earned it.',
    after: 'I heard there\'s something scary living deep in PINECREST FOREST...',
  },
  otto: {
    cls: 'PICNICKER', name: 'OTTO', sprite: 'picnicker', payout: 22,
    party: () => [['bambuck', 13]],
    intro: 'You walked right through my picnic! That means a battle!',
    lose: 'My sandwich AND my battle... ruined.',
    after: 'FIRE moves burn right through GRASS types. Remember that in CEDARWOOD!',
  },
  mara: {
    cls: 'MEDIUM', name: 'MARA', sprite: 'medium', payout: 28,
    party: () => [['wraithling', 14], ['wraithling', 15]],
    intro: 'The lanterns told me you would come... Let the spirits judge you.',
    lose: 'The spirits... approve of you.',
    after: 'The old shrine at the heart of the forest has a guardian. It does not like visitors.',
  },
  pip: {
    cls: 'BUG CATCHER', name: 'PIP', sprite: 'bugcatcher', payout: 18,
    party: () => [['leafgrub', 14], ['leafgrub', 14]],
    intro: 'It\'s dark in here, but my LEAFGRUB aren\'t scared! Are you?',
    lose: 'Okay, now I\'m a little scared.',
    after: 'WRAITHLING only come out where it\'s dark. Follow the violet lights!',
  },

  // --- Riftroot Hideout ------------------------------------------------------------
  hgrunt1: {
    cls: 'DISTORTION GRUNT', name: '', sprite: 'grunt', payout: 36, music: 'distortion',
    party: () => [['voltimp', 15], ['wraithling', 16]],
    intro: 'Hey! How did a kid find the bookshelf?! Get lost!',
    lose: 'Tch... The ADMIN is going to have my visor for this.',
    after: 'Bend. Break. Become. ...Ugh, even saying it doesn\'t help right now.',
  },
  hgrunt2: {
    cls: 'DISTORTION GRUNT', name: '', sprite: 'grunt', payout: 36, music: 'distortion',
    party: () => [['tuner', 16], ['voltimp', 16]],
    intro: 'Hear that humming? That\'s the sound of the old world breaking!',
    lose: 'My TUNER... it\'s gone quiet.',
    after: 'You\'ve got the CARD KEY. Happy now? The gate is past the big hall.',
    reward: 'cardkey',
    rewardText: 'Fine! Take the stupid CARD KEY! I was sick of guarding it anyway.',
  },
  hgrunt3: {
    cls: 'DISTORTION GRUNT', name: '', sprite: 'grunt', payout: 38, music: 'distortion',
    party: () => [['voltvix', 17], ['tuner', 17]],
    intro: 'Nobody gets past the gate without a CARD KEY... wait, how do you HAVE that?!',
    lose: 'The ADMIN is right below us. You\'ll regret this.',
    after: 'ADMIN VESPER can hear a lie from across a room. Good luck, kid.',
  },
  hgrunt4: {
    cls: 'DISTORTION GRUNT', name: '', sprite: 'grunt', payout: 38, music: 'distortion',
    party: () => [['wraithling', 16], ['voltimp', 17]],
    intro: 'The root chamber is off-limits! ADMIN\'s orders!',
    lose: 'Nnngh... Go on then. See what happens.',
    after: 'The cedar\'s roots grew right around the KEYSTONE. Easiest job we ever had.',
  },
  vesper: {
    cls: 'ADMIN', name: 'VESPER', sprite: 'vesper', payout: 80, music: 'admin',
    party: () => [
      ['wraithling', 18, ['hex', 'willowisp', 'nightshade', 'astonish']],
      ['voltimp', 19, ['spark', 'thunderwave', 'quickattack', 'thunderfang']],
      ['tuner', 20, ['echoedvoice', 'screech', 'sonicboom', 'disarmingvoice']],
    ],
    lose: 'Hmm. Off-key, but loud. You\'re an interesting noise, child.',
  },
  // --- Cedarwood Gym -----------------------------------------------------------------
  fern: {
    cls: 'GARDENER', name: 'FERN', sprite: 'gardener', payout: 30,
    party: () => [['leafgrub', 15], ['bambuck', 16]],
    intro: 'Mind the flowerbeds! And mind my AIMON, too!',
    lose: 'Oh, my poor petals...',
    after: 'IVY\'s BAMBUCK has been growing in this greenhouse for years. It\'s huge.',
  },
  rowan: {
    cls: 'GARDENER', name: 'ROWAN', sprite: 'gardener', payout: 30,
    party: () => [['bambuck', 16], ['leafgrub', 17]],
    intro: 'Thanks for saving the great cedar! ...But I still can\'t let you pass for free!',
    lose: 'Rooted out. Fair and square.',
    after: 'GRASS types can drain your HP to heal themselves. End battles quickly!',
  },
  ivy: {
    cls: 'LEADER', name: 'IVY', sprite: 'ivy', payout: 110, music: 'leader', leader: true,
    party: () => [
      ['leafgrub', 17, ['stunspore', 'bugbite', 'megadrain', 'stringshot']],
      ['bambuck', 18, ['razorleaf', 'magicalleaf', 'sleeppowder', 'quickattack']],
      ['bambuck', 20, ['gigadrain', 'razorleaf', 'growth', 'headbutt']],
    ],
    lose: 'Your roots run deep, {PLAYER}. I\'m glad I got to see them.',
  },

  // --- Route 4 -------------------------------------------------------------------------
  cole: {
    cls: 'SAILOR', name: 'COLE', sprite: 'sailor', payout: 34,
    party: () => [['tidepup', 18], ['goskie', 19]],
    intro: 'Can\'t sail in this weather, so I\'ll battle instead! Hoist anchor!',
    lose: 'Sunk without a trace!',
    after: 'That storm over SEABREEZE hasn\'t moved in days. Storms always move.',
  },
  hank: {
    cls: 'FISHER', name: 'HANK', sprite: 'fisher', payout: 30,
    party: () => [['reefwhirl', 18], ['goskie', 18], ['goskie', 19]],
    intro: 'Rain\'s great for fishing. Battling, too! Let\'s go!',
    lose: 'Hooked, reeled in, and released. That\'s me.',
    after: 'Got an OLD ROD? Face any water and press A to fish.',
  },
  jade: {
    cls: 'PICNICKER', name: 'JADE', sprite: 'picnicker', payout: 30,
    party: () => [['skydrift', 19], ['dapplekit', 19]],
    intro: 'My beach day got rained out, so I\'m in a battling mood!',
    lose: 'Washed out twice in one day...',
    after: 'SKYDRIFT can leap right out of the water! Isn\'t that amazing?',
  },
  rival3: {
    cls: 'RIVAL', name: 'KAI', sprite: 'rival', payout: 60,
    party: () => [['goskie', 19], ['scrapaw', 20], [State.rivalStarter(22), 22]],
    intro: '',
    lose: 'Again?! How do you keep getting stronger?!',
    win: 'Ha! That\'s what training in the rain gets you!',
  },
  // --- Seabreeze Lighthouse -------------------------------------------------------------
  lgrunt1: {
    cls: 'DISTORTION GRUNT', name: '', sprite: 'grunt', payout: 40, music: 'distortion',
    party: () => [['voltimp', 20], ['voltvix', 21]],
    intro: 'The CARD KEY?! Those idiots in CEDARWOOD let you walk off with it?!',
    lose: 'Great. Now I\'m the idiot.',
    after: 'The coils run on VOLTIMP power. Poor little guys never stop sparking.',
  },
  lgrunt2: {
    cls: 'DISTORTION GRUNT', name: '', sprite: 'grunt', payout: 40, music: 'distortion',
    party: () => [['tuner', 21], ['wraithling', 21]],
    intro: 'Every floor you climb, the storm gets louder. Can you feel it?',
    lose: 'I felt that one.',
    after: 'ADMIN THANE is up top. He\'s been riding this storm for three days straight.',
  },
  lgrunt3: {
    cls: 'DISTORTION GRUNT', name: '', sprite: 'grunt', payout: 42, music: 'distortion',
    party: () => [['voltimp', 21], ['tuner', 22]],
    intro: 'Last line before the lamp room. Nobody interrupts THANE\'s work!',
    lose: 'Okay... somebody interrupts it.',
    after: 'The lamp up there? It\'s no lamp. It\'s a KEYSTONE. The whole tower was built around it.',
  },
  thane: {
    cls: 'ADMIN', name: 'THANE', sprite: 'thane', payout: 90, music: 'admin',
    party: () => [
      ['voltvix', 21, ['spark', 'chargebeam', 'thunderwave', 'bite']],
      ['tuner', 22, ['hypervoice', 'screech', 'echoedvoice', 'sonicboom']],
      ['stormgale', 24, ['thunderfang', 'chargebeam', 'crunch', 'quickattack']],
    ],
    lose: 'The storm breaks... Heh. So it does.',
  },
  // --- Seabreeze Gym -----------------------------------------------------------------------
  marlo: {
    cls: 'SAILOR', name: 'MARLO', sprite: 'sailor', payout: 36,
    party: () => [['tidepup', 21], ['reefwhirl', 21]],
    intro: 'Welcome aboard the SEABREEZE GYM! First, you deal with me!',
    lose: 'Man overboard!',
    after: 'The CAPTAIN\'s SKYSERAPH flies faster than any ship. Don\'t blink.',
  },
  coral: {
    cls: 'SWIMMER', name: 'CORAL', sprite: 'swimmer', payout: 36,
    party: () => [['skydrift', 21], ['tidepup', 22]],
    intro: 'The water\'s lovely today! Thanks for bringing the sun back!',
    lose: 'Glub... I\'m all washed up.',
    after: 'GRASS and ELECTRIC moves are your best friends against water types!',
  },
  nerissa: {
    cls: 'LEADER', name: 'NERISSA', sprite: 'nerissa', payout: 120, music: 'leader', leader: true,
    party: () => [
      ['tidefin', 22, ['aquajet', 'bite', 'waterpulse', 'quickattack']],
      ['reeflord', 23, ['whirlpool', 'hex', 'megadrain', 'waterpulse']],
      ['skyseraph', 25, ['airslash', 'waterpulse', 'aquajet', 'wingattack']],
    ],
    lose: 'Ha! Like a gale at our backs! You\'ve earned your sea legs, {PLAYER}.',
  },

  // --- Route 8 --------------------------------------------------------------------------
  r8hiker: {
    cls: 'HIKER', name: 'DALE', sprite: 'hiker', payout: 40,
    party: () => [['cairnling', 24], ['terrapike', 25]],
    intro: 'The road to SILVERFALL is open again! Celebrate with a battle!',
    lose: 'Crumbled like an old cairn...',
    after: 'Stack a few stones by the trail and a CAIRNLING might come to see who did it.',
  },
  r8pic: {
    cls: 'PICNICKER', name: 'ROSA', sprite: 'picnicker', payout: 36,
    party: () => [['mosstodon', 24], ['dapplekit', 24]],
    intro: 'My MOSSTODON has flowers growing on its back! Isn\'t that the cutest thing?',
    lose: 'Aww, you trampled the flowers...',
    after: 'MOSSTODON are rare around here. I found mine napping in the tall grass.',
  },
  r8bug: {
    cls: 'BUG CATCHER', name: 'NILS', sprite: 'bugcatcher', payout: 28,
    party: () => [['leafgrub', 23], ['noctumoth', 25]],
    intro: 'Look at these golden rings! My NOCTUMOTH is the coolest bug ever!',
    lose: 'Even the eclipse couldn\'t save me!',
    after: 'NOCTUMOTH\'s wing dust makes you see double. Don\'t stare at it too long.',
  },
  r8fisher: {
    cls: 'FISHERMAN', name: 'GUS', sprite: 'fisher', payout: 36,
    party: () => [['prismanta', 25], ['reefwhirl', 24]],
    intro: 'Shh! You\'ll scare the PRISMANTA! ...Too late. Battle!',
    lose: 'The one that got away... was me.',
    after: 'PRISMANTA like clear, calm water. The stream here and the river in the city are good spots.',
  },

  // --- SONANCE TOWER ------------------------------------------------------------------------
  hqgrunt1: {
    cls: 'DISTORTION GRUNT', name: '', sprite: 'grunt', payout: 32, music: 'distortion',
    party: () => [['tuner', 25], ['voltvix', 25]],
    intro: '',
    lose: 'Welcome to SONANCE ENERGY... please enjoy your stay...',
    after: 'The receptionist job was supposed to be the EASY one.',
  },
  hqgrunt2: {
    cls: 'DISTORTION GRUNT', name: '', sprite: 'grunt', payout: 32, music: 'distortion',
    party: () => [['stormgale', 25]],
    intro: 'Stairs are for staff only! And you are NOT staff!',
    lose: 'You can\'t just... walk upstairs...',
    after: 'The elevator\'s "broken" so nobody sneaks up to the top. Heh. Bet you didn\'t know that.',
  },
  hqgrunt3: {
    cls: 'DISTORTION GRUNT', name: '', sprite: 'grunt', payout: 34, music: 'distortion',
    party: () => [['wraithling', 25], ['voltimp', 25], ['tuner', 26]],
    intro: 'Dizzy from the pads yet? Good! Easier to beat you!',
    lose: 'I\'m the one who\'s dizzy now...',
    after: 'The pads link up in pairs. Step on one, pop out of its twin. Took me a week to learn.',
  },
  hqgrunt4: {
    cls: 'DISTORTION GRUNT', name: '', sprite: 'grunt', payout: 34, music: 'distortion',
    party: () => [['noctumoth', 26], ['voltvix', 26]],
    intro: 'How did you even get in here?! This room is a dead end! ...Isn\'t it?',
    lose: 'Guess it isn\'t a dead end for you.',
    after: 'ADMIN MORROW is upstairs with the songs. He doesn\'t like being interrupted.',
  },
  hqsci: {
    cls: 'SCIENTIST', name: 'ELIAS', sprite: 'scientist', payout: 48, music: 'distortion',
    party: () => [['voltimp', 26], ['geodillo', 26]],
    intro: 'An intruder in the lab? The data will be ruined! Stop right there!',
    lose: 'My calculations... did not include you.',
    after: 'The KEYSTONES each hum a note. Together, the eight notes make one great chord. The seal.',
  },
  hqgrunt5: {
    cls: 'DISTORTION GRUNT', name: '', sprite: 'grunt', payout: 36, music: 'distortion',
    party: () => [['hourghast', 27], ['stormgale', 27]],
    intro: 'The archive is off-limits! The ADMIN is busy tuning!',
    lose: 'Out of tune... totally out of tune...',
    after: 'Only the COMMANDER can open the door to the top floor. Not even ADMINS get a key.',
  },
  morrow: {
    cls: 'ADMIN', name: 'MORROW', sprite: 'morrow', payout: 90, music: 'admin',
    party: () => [
      ['hourghast', 28, ['hex', 'willowisp', 'bulldoze', 'nightshade']],
      ['noctumoth', 29, ['airslash', 'bugbite', 'feintattack', 'stunspore']],
      ['umbrafang', 31, ['crunch', 'shadowsneak', 'feintattack', 'snarl']],
    ],
    lose: 'Hmm. The sand runs out for everyone, it seems. Even me.',
  },

  // --- Silverfall Bridge ----------------------------------------------------------------------
  brworker: {
    cls: 'WORKER', name: 'BRUNO', sprite: 'worker', payout: 40,
    party: () => [['geodillo', 26], ['scrapaw', 27]],
    intro: 'Two weeks of waiting and now I finally get to walk my own bridge! Let\'s celebrate!',
    lose: 'Solid work. Solid as steel.',
    after: 'GEODILLO love the girders. The static from their crystals keeps the birds away.',
  },
  brsailor: {
    cls: 'SAILOR', name: 'PERCY', sprite: 'sailor', payout: 40,
    party: () => [['tidefin', 27]],
    intro: 'Ahoy! I sail under this bridge every day. Now I can finally walk over it!',
    lose: 'Scuttled!',
    after: 'The river runs all the way from the falls to the sea. The fish here are huge!',
  },
  brfisher: {
    cls: 'FISHERMAN', name: 'WALT', sprite: 'fisher', payout: 40,
    party: () => [['prismanta', 27], ['goskie', 26], ['reefwhirl', 26]],
    intro: 'Best fishing spot in VALEMORA, this deck. And the best battling spot too!',
    lose: 'Reeled in!',
    after: 'Cast your line off the deck. PRISMANTA gather under the bridge where the water\'s calm.',
  },
  brhiker: {
    cls: 'HIKER', name: 'IGOR', sprite: 'hiker', payout: 40,
    party: () => [['cairnling', 27], ['hourghast', 27]],
    intro: 'CRAGMOOR\'s just ahead. Warm up on me before you face TOR!',
    lose: 'Warmed up and worn out!',
    after: 'HOURGHAST drift out of the old mine at dusk. Lost travelers\' hourglasses, they say.',
  },

  // --- Cragmoor Gym ---------------------------------------------------------------------------
  cmminer1: {
    cls: 'MINER', name: 'DUNCAN', sprite: 'miner', payout: 44,
    party: () => [['cairnling', 27], ['terrapike', 28]],
    intro: 'Mind the ledges, rookie! One wrong step and it\'s back to the bottom!',
    lose: 'Chipped right off the face!',
    after: 'The ledges only go one way. Plan your climb before you jump.',
  },
  cmhiker: {
    cls: 'HIKER', name: 'BERT', sprite: 'hiker', payout: 44,
    party: () => [['geodillo', 28], ['cairnling', 28]],
    intro: 'Halfway up already? TOR will be pleased. I won\'t!',
    lose: 'Rolled right down the hill...',
    after: 'TOR\'s OBELITH is older than this whole town. Nobody has ever made it budge.',
  },
  cmminer2: {
    cls: 'MINER', name: 'OSWIN', sprite: 'miner', payout: 46,
    party: () => [['terrapike', 28], ['geodillo', 29]],
    intro: 'Last stop before the boss! Show me you can dig deep!',
    lose: 'You struck gold!',
    after: 'Go on. TOR\'s waiting by the CRAGSTONE. Try not to get flattened.',
  },
  tor: {
    cls: 'LEADER', name: 'TOR', sprite: 'tor', payout: 130, music: 'leader', leader: true,
    party: () => [
      ['cairnling', 29, ['rocktomb', 'defensecurl', 'headbutt', 'rockthrow']],
      ['geodillo', 30, ['rockslide', 'chargebeam', 'spark', 'defensecurl']],
      ['obelith', 32, ['rockslide', 'bulldoze', 'rocktomb', 'harden']],
    ],
    lose: 'Hrmph! You moved the mountain. Nobody\'s done that in twenty years.',
  },

  // --- Route 9 ------------------------------------------------------------------------------
  r9youngster: {
    cls: 'YOUNGSTER', name: 'TIMMY', sprite: 'youngster', payout: 40,
    party: () => [['skylark', 29], ['bellpup', 29], ['scrapaw', 30]],
    intro: 'The road\'s open again! I\'ve been waiting a whole week to battle someone new!',
    lose: 'Aww! That was worth the wait, though.',
    after: 'My SKYLARK is going to evolve any day now. Then it\'s going to be SO fast.',
  },
  r9picnicker: {
    cls: 'PICNICKER', name: 'DAISY', sprite: 'picnicker', payout: 44,
    party: () => [['bellpup', 30], ['dapplekit', 30], ['skylark', 29]],
    intro: 'Perfect day for a picnic by the lake! And a battle for dessert!',
    lose: 'Oh no, my sandwiches got sand in them...',
    after: 'BELLPUP ring their heads when they\'re happy. Mine rings all day long!',
  },
  r9swimmer: {
    cls: 'SWIMMER', name: 'MAYA', sprite: 'swimmer', payout: 44,
    party: () => [['prismanta', 31], ['tidefin', 30]],
    intro: 'The lake\'s warm today! Want to battle before I jump back in?',
    lose: 'Splashed!',
    after: 'PRISMANTA glow gold when the sun sets over the water. You should stay and watch!',
  },
  r9fisher: {
    cls: 'FISHERMAN', name: 'HANK', sprite: 'fisher', payout: 44,
    party: () => [['aquabug', 29], ['goskie', 30], ['riverclaw', 31]],
    intro: 'Nothing biting all morning. I\'ll catch a battle instead!',
    lose: 'The one that got away...',
    after: 'AQUABUG hide under the pier. When they evolve, their claws can snap a fishing line clean in two.',
  },
  r9camper: {
    cls: 'CAMPER', name: 'OWEN', sprite: 'camper', payout: 44,
    party: () => [['skyblade', 31], ['ruffang', 31]],
    intro: 'I\'m camping here till the rockslide\'s all cleared. Care to pass the time?',
    lose: 'Knocked my tent flat!',
    after: 'SKYBLADE dive faster than anything I\'ve ever seen. Watch the sky over the lake.',
  },

  // --- Route 10 -----------------------------------------------------------------------------
  r10hiker: {
    cls: 'HIKER', name: 'GUS', sprite: 'hiker', payout: 46,
    party: () => [['cairnling', 30], ['sandbloom', 30], ['dunewalker', 32]],
    intro: 'Heading for the dunes? Better make sure your legs are tough enough!',
    lose: 'My knees give out before my AIMON do.',
    after: 'Carry plenty of water out there. Or a SANDBLOOM. Same thing, really.',
  },
  r10picnicker: {
    cls: 'PICNICKER', name: 'JUNE', sprite: 'picnicker', payout: 46,
    party: () => [['embertail', 31], ['bellpup', 31]],
    intro: 'It\'s so hot out here! Let\'s battle quick before I melt!',
    lose: 'I melted anyway...',
    after: 'My EMBERTAIL loves the sand. It dug a hole to China. Well, to the oasis.',
  },
  r10ruin1: {
    cls: 'RUIN MANIAC', name: 'ABE', sprite: 'ruinmaniac', payout: 48,
    party: () => [['hourghast', 32], ['terrapike', 32]],
    intro: 'Stay back from that column! It\'s three thousand years old! ...Fine, battle me instead!',
    lose: 'Crumbled like old sandstone...',
    after: 'The columns out here are covered in carvings that look like music. Nobody can read them but SAHRA.',
  },
  r10ruin2: {
    cls: 'RUIN MANIAC', name: 'LEON', sprite: 'ruinmaniac', payout: 48,
    party: () => [['sandbloom', 31], ['obelith', 33]],
    intro: 'I dug this OBELITH out of a dune myself! Want to see what it can do?',
    lose: 'Buried!',
    after: 'SAHRA was digging under SUNSPIRE for the FIRST SCORE. Then those black coats chased us all out.',
  },
  r10grunt: {
    cls: 'GRUNT', name: 'TEAM DISTORTION', sprite: 'grunt', payout: 48,
    party: () => [['distortail', 32], ['voltvix', 32]],
    intro: 'Nobody gets to SUNSPIRE today! The dig site is closed for... a private recital!',
    lose: 'Off-key! Totally off-key!',
    after: 'Go ahead. The ADMIN\'s already downstairs. You\'re too late to stop the recording.',
  },

  // --- Sunspire dig site --------------------------------------------------------------------
  ssgrunt1: {
    cls: 'GRUNT', name: 'TEAM DISTORTION', sprite: 'grunt', payout: 48,
    party: () => [['distortail', 32], ['wraithling', 32]],
    intro: 'Hey! This dig site belongs to TEAM DISTORTION now!',
    lose: 'Ugh! Bad acoustics out here!',
    after: 'The ADMIN said nobody comes in until the song is done. ...Well, I tried.',
  },
  ssgrunt2: {
    cls: 'GRUNT', name: 'TEAM DISTORTION', sprite: 'grunt', payout: 48,
    party: () => [['hourghast', 32], ['distortail', 33]],
    intro: 'You beat my partner? Then you\'ll have to get through me too!',
    lose: 'We\'re supposed to be the loud ones!',
    after: 'Go on down. VESPER will deal with you herself.',
  },
  diggrunt1: {
    cls: 'GRUNT', name: 'TEAM DISTORTION', sprite: 'grunt', payout: 50,
    party: () => [['noctumoth', 32], ['distortail', 33]],
    intro: 'A kid in the tunnels? Did you get lost on the way to the gift shop?',
    lose: 'Buried alive... by a kid...',
    after: 'That old digger behind the rubble keeps yelling at us. She\'s louder than our machine!',
  },
  diggrunt2: {
    cls: 'GRUNT', name: 'TEAM DISTORTION', sprite: 'grunt', payout: 50,
    party: () => [['geodillo', 33], ['wraithling', 32]],
    intro: 'The stairs down are off-limits! Orders from VESPER!',
    lose: 'Guess orders don\'t win battles.',
    after: 'Down there is where the DUNESTONE\'s roots come through the floor. That\'s where the machine is.',
  },
  diggrunt3: {
    cls: 'GRUNT', name: 'TEAM DISTORTION', sprite: 'grunt', payout: 50,
    party: () => [['distortail', 33], ['hourghast', 33]],
    intro: 'Hear that hum? That\'s the sound of TEAM DISTORTION winning!',
    lose: 'Humbled...',
    after: 'Every time the machine hums, a little more of the ceiling comes down. Great place to work.',
  },
  diggrunt4: {
    cls: 'GRUNT', name: 'TEAM DISTORTION', sprite: 'grunt', payout: 50,
    party: () => [['noctumoth', 33], ['voltvix', 33]],
    intro: 'VESPER\'s reading the big wall. She said not to disturb her. That means you!',
    lose: 'Disturbed!',
    after: 'VESPER\'s been staring at those carvings for hours. She looks... upset.',
  },
  digsci: {
    cls: 'SCIENTIST', name: 'TEAM DISTORTION', sprite: 'scientist', payout: 56,
    party: () => [['geodillo', 33], ['voltvix', 33], ['distortail', 34]],
    intro: '',
    lose: 'Doesn\'t matter! The data\'s already safe!',
    after: 'The DUNESTONE\'s song is on its way to the archive. There\'s nothing you can do now.',
  },
  vesper2: {
    cls: 'ADMIN', name: 'VESPER', sprite: 'vesper', payout: 100, music: 'admin',
    party: () => [
      ['wraithling', 33, ['hex', 'willowisp', 'nightshade', 'shadowsneak']],
      ['hourghast', 34, ['shadowball', 'bulldoze', 'willowisp', 'hex']],
      ['sonarion', 34, ['hypervoice', 'echoedvoice', 'screech', 'quickattack']],
      ['specterib', 35, ['shadowball', 'hypervoice', 'hex', 'airslash']],
    ],
    lose: 'Silence... No. Not silence. Not yet.',
  },

  // --- Sunspire Gym -------------------------------------------------------------------------
  ssgym1: {
    cls: 'RUIN MANIAC', name: 'OMAR', sprite: 'ruinmaniac', payout: 50,
    party: () => [['hourghast', 33], ['sandbloom', 33]],
    intro: 'Every pillar in this GYM came from the old city. Treat them with respect!',
    lose: 'Knocked flat like a fallen column!',
    after: 'SAHRA dug this whole arena up with her own two hands. And one very large DUNARCH.',
  },
  ssgym2: {
    cls: 'HIKER', name: 'RASHID', sprite: 'hiker', payout: 50,
    party: () => [['cairnling', 33], ['dunewalker', 34]],
    intro: 'The sand here is hot enough to cook an egg. Is your team hot enough?',
    lose: 'Cooked!',
    after: 'GROUND moves can\'t touch FLYING types. Use that against SAHRA if you can.',
  },
  ssgym3: {
    cls: 'PICNICKER', name: 'LAYLA', sprite: 'picnicker', payout: 52,
    party: () => [['embertail', 34], ['terrapike', 34]],
    intro: 'Last one before the LEADER! Show me what you\'ve dug up!',
    lose: 'You struck water!',
    after: 'SAHRA\'s waiting at the top. She\'s tougher than the desert, but fair.',
  },
  sahra: {
    cls: 'LEADER', name: 'SAHRA', sprite: 'sahra', payout: 140, music: 'leader', leader: true,
    party: () => [
      ['terrapike', 33, ['bulldoze', 'rockthrow', 'headbutt', 'sandattack']],
      ['hourghast', 34, ['earthpower', 'shadowball', 'willowisp', 'hex']],
      ['dunewalker', 35, ['rockslide', 'crunch', 'bulldoze', 'sandattack']],
      ['dunarch', 37, ['earthquake', 'rockslide', 'crunch', 'sandattack']],
    ],
    lose: 'Ha! Dug right to the bottom of me. Nobody\'s done that since I was your age.',
  },

  // --- Route 12 ---------------------------------------------------------------------------
  rival4: {
    cls: 'RIVAL', name: 'KAI', sprite: 'rival', payout: 80,
    party: () => [['goskie', 34], ['scrapaw', 35], ['stormgale', 35], [State.rivalStarter(37), 37]],
    intro: '',
    lose: 'Five BADGES and you STILL won\'t let me win one?!',
    win: 'Ha! Told you I\'d been training!',
  },
  r12picnicker: {
    cls: 'PICNICKER', name: 'CLARA', sprite: 'picnicker', payout: 52,
    party: () => [['windling', 33], ['skylark', 34]],
    intro: 'I came out for a picnic, but the wind keeps stealing my sandwiches!',
    lose: 'And now it\'s stolen my win, too.',
    after: 'WINDLING make power from the wind. The farm down south is full of them.',
  },
  r12farmer1: {
    cls: 'FARMER', name: 'HANK', sprite: 'farmer', payout: 54,
    party: () => [['moozle', 35], ['voltimp', 34]],
    intro: 'Mind the wheat! Oh, you\'re on the road. Well then... let\'s battle!',
    lose: 'Flattened like a hay bale!',
    after: 'That red barn at MEADOWFIELD\'s the GYM. WREN built half the machines in it herself.',
  },
  r12camper: {
    cls: 'CAMPER', name: 'TOBY', sprite: 'camper', payout: 52,
    party: () => [['dapplekit', 34], ['skyblade', 35]],
    intro: 'I\'ve been camping in the tall grass all week. I\'m practically a wild AIMON now!',
    lose: 'Caught!',
    after: 'Last night the sky flashed purple over the farm. There wasn\'t a single cloud!',
  },
  r12hiker: {
    cls: 'HIKER', name: 'GUS', sprite: 'hiker', payout: 54,
    party: () => [['geodillo', 35], ['cairnling', 34]],
    intro: 'Flat roads make my legs lazy. A battle will wake them up!',
    lose: 'Legs... still lazy...',
    after: 'GEODILLO are part ROCK and part ELECTRIC. GROUND moves hit them hard.',
  },
  r12farmer2: {
    cls: 'FARMER', name: 'MAE', sprite: 'farmer', payout: 56,
    party: () => [['bovelle', 36], ['windling', 35]],
    intro: 'My BOVELLE could pull a tractor. Let\'s see what it does to your team!',
    lose: 'Well, butter my biscuits.',
    after: 'Try the MOOZLE MILK at the farm. It fixes anything. Well, anything but losing.',
  },

  // --- Meadowfield: the TEMPEST ARRAY -------------------------------------------------------
  mfgrunt1: {
    cls: 'GRUNT', name: 'TEAM DISTORTION', sprite: 'grunt', payout: 52, music: 'distortion',
    party: () => [['voltvix', 35], ['distortail', 36]],
    intro: 'Hands off the rod! Every bolt that hits the mill brings the song closer!',
    lose: 'Grounded...',
    after: 'Go ahead, fix it. There are two more, and THANE\'s up top.',
  },
  mfgrunt2: {
    cls: 'GRUNT', name: 'TEAM DISTORTION', sprite: 'grunt', payout: 52, music: 'distortion',
    party: () => [['voltimp', 35], ['hourghast', 36]],
    intro: 'Out here in the storm? You must really like getting struck by lightning!',
    lose: 'Zapped!',
    after: 'This wheat is soaked. My boots are soaked. Everything is soaked.',
  },
  mfgrunt3: {
    cls: 'GRUNT', name: 'TEAM DISTORTION', sprite: 'grunt', payout: 52, music: 'distortion',
    party: () => [['noctumoth', 36], ['stormgale', 35]],
    intro: 'The old man\'s garden is ours tonight! Bent rods, bright bolts!',
    lose: 'My bolts... unbright...',
    after: 'THANE\'s machine up on the windmill pulls the lightning down. The MILLSTONE will scream its song.',
  },
  mfgrunt4: {
    cls: 'GRUNT', name: 'TEAM DISTORTION', sprite: 'grunt', payout: 54, music: 'distortion',
    party: () => [['distortail', 36], ['geodillo', 36]],
    intro: 'Nobody goes up the windmill! ADMIN\'s orders!',
    lose: 'Nobody except you, I guess.',
    after: 'The door\'s open. But THANE doesn\'t lose twice. ...Does he?',
  },
  millgrunt: {
    cls: 'GRUNT', name: 'TEAM DISTORTION', sprite: 'grunt', payout: 54, music: 'distortion',
    party: () => [['voltvix', 36], ['specterib', 36]],
    intro: 'You fixed the rods?! The lightning\'s going to the ground now! Do you know how long we charged that thing?!',
    lose: 'All that charge... wasted...',
    after: 'The TEMPEST ARRAY\'s on the top floor. THANE won\'t let it go without a fight.',
  },
  thane2: {
    cls: 'ADMIN', name: 'THANE', sprite: 'thane', payout: 110, music: 'admin',
    party: () => [
      ['voltvix', 36, ['thunderbolt', 'thunderfang', 'thunderwave', 'crunch']],
      ['sonarion', 37, ['hypervoice', 'echoedvoice', 'screech', 'shockwave']],
      ['stormgale', 39, ['wildcharge', 'thunderfang', 'crunch', 'quickattack']],
    ],
    lose: 'Twice?! Twice, by the same KID?!',
  },

  // --- Meadowfield Gym ------------------------------------------------------------------------
  mfgym1: {
    cls: 'FARMER', name: 'JED', sprite: 'farmer', payout: 58,
    party: () => [['voltimp', 37], ['moozle', 37]],
    intro: 'Welcome to the barn! Watch your step. The floor bites.',
    lose: 'Well, I\'ll be milked.',
    after: 'The turbines run on VOLTIMP laps. Don\'t worry, they love it.',
  },
  mfgym2: {
    cls: 'WORKER', name: 'RIVKA', sprite: 'worker', payout: 58,
    party: () => [['geodillo', 37], ['windling', 38]],
    intro: 'I wire the turbines. WREN designs them. You? You\'re about to get shocked.',
    lose: 'Short circuit!',
    after: 'WREN\'s ZEPHYRON flies. GROUND moves won\'t touch it. Plan ahead!',
  },
  mfgym3: {
    cls: 'PICNICKER', name: 'DAISY', sprite: 'picnicker', payout: 60,
    party: () => [['voltvix', 37], ['stormgale', 38]],
    intro: 'Last stop before WREN! You look like you\'ve had a long night.',
    lose: 'A long night and a strong team!',
    after: 'WREN\'s been grinning all morning. I think she\'s been waiting for you.',
  },
  wren: {
    cls: 'LEADER', name: 'WREN', sprite: 'wren', payout: 160, music: 'leader', leader: true,
    party: () => [
      ['voltvix', 38, ['thunderbolt', 'thunderwave', 'quickattack', 'bite']],
      ['geodillo', 39, ['rockslide', 'thunderfang', 'bulldoze', 'harden']],
      ['stormgale', 39, ['wildcharge', 'thunderfang', 'crunch', 'quickattack']],
      ['zephyron', 41, ['thunderbolt', 'airslash', 'aerialace', 'thunderwave']],
    ],
    lose: 'Whew! That\'s the most fun I\'ve had since I built my first turbine!',
  },

  // --- Route 11 ------------------------------------------------------------------------------
  r11hiker1: {
    cls: 'HIKER', name: 'BRAM', sprite: 'hiker', payout: 60,
    party: () => [['glacron', 40], ['cairnling', 39]],
    intro: 'The cold keeps a hiker honest! And a battle keeps him warm!',
    lose: 'Brr... Now I\'m cold AND beaten.',
    after: 'Keep to the road when the snow\'s deep. Wild AIMON love the drifts.',
  },
  r11skier1: {
    cls: 'SKIER', name: 'SOL', sprite: 'skier', payout: 60,
    party: () => [['noctheryx', 40], ['skyblade', 40]],
    intro: 'Out of the way! ...Oh, you want to battle? Even better!',
    lose: 'Wiped out!',
    after: 'NOCTHERYX glide down the slopes at dusk. You never hear them coming.',
  },
  r11blackbelt: {
    cls: 'BLACKBELT', name: 'KENJI', sprite: 'blackbelt', payout: 62,
    party: () => [['glacron', 41], ['scrapaw', 41]],
    intro: 'I train barefoot in the snow! HYAH! ...It\'s very cold!',
    lose: 'My toes... have lost...',
    after: 'GLACRON challenge anything near their caves. It\'s their way of saying hello.',
  },
  r11skier2: {
    cls: 'SKIER', name: 'ANYA', sprite: 'skier', payout: 62,
    party: () => [['bellchime', 41], ['glacron', 41]],
    intro: 'Hear that? The bell\'s ringing up at STONEPEAK. Let\'s make some noise of our own!',
    lose: 'Out of tune!',
    after: 'The bell rings every hour. Except one. Everyone up here knows to be quiet then.',
  },
  r11hiker2: {
    cls: 'HIKER', name: 'ODELL', sprite: 'hiker', payout: 64,
    party: () => [['obelith', 42], ['geodillo', 41]],
    intro: 'Almost at the top! Show me you earned it!',
    lose: 'You earned it, all right.',
    after: 'STONEPEAK WOODS is just past the pines. Mind the ice on the pond.',
  },

  // --- Stonepeak bell tower -------------------------------------------------------------------
  towergrunt1: {
    cls: 'GRUNT', name: 'TEAM DISTORTION', sprite: 'grunt', payout: 56, music: 'distortion',
    party: () => [['hourghast', 40], ['distortail', 40]],
    intro: 'The hour of silence! Shhh! ...Now, BATTLE!',
    lose: 'So much for silence.',
    after: 'We cut the ropes so nobody could ring it properly. Only MORROW rings it now.',
  },
  towergrunt2: {
    cls: 'GRUNT', name: 'TEAM DISTORTION', sprite: 'grunt', payout: 56, music: 'distortion',
    party: () => [['noctumoth', 40], ['specterib', 41]],
    intro: 'One note! That\'s all MORROW needs! You won\'t stop one little note!',
    lose: 'That was more than one note...',
    after: 'The bell rings alone at the hour of silence. No other bells, no echoes. Just the BELLSTONE.',
  },
  towergrunt3: {
    cls: 'GRUNT', name: 'TEAM DISTORTION', sprite: 'grunt', payout: 56, music: 'distortion',
    party: () => [['wraithling', 41], ['noctheryx', 40]],
    intro: 'The belfry is off-limits! MORROW doesn\'t like to be interrupted!',
    lose: 'He REALLY doesn\'t like it...',
    after: 'Go on up. It\'s your funeral. ...That\'s a bell joke.',
  },
  morrow2: {
    cls: 'ADMIN', name: 'MORROW', sprite: 'morrow', payout: 120, music: 'admin',
    party: () => [
      ['hourghast', 40, ['shadowball', 'earthpower', 'willowisp', 'hex']],
      ['noctumoth', 41, ['airslash', 'bugbuzz', 'feintattack', 'stunspore']],
      ['umbrafang', 42, ['crunch', 'nightslash', 'shadowsneak', 'snarl']],
    ],
    lose: 'Tick... tock. Late again, am I? No. Precisely on time.',
  },

  // --- Chime Hall (Stonepeak Gym) ---------------------------------------------------------------
  spgym1: {
    cls: 'MUSICIAN', name: 'ARIA', sprite: 'musician', payout: 62,
    party: () => [['bellchime', 41], ['specterib', 42]],
    intro: 'Every chime in this hall is tuned by hand. Don\'t knock any over!',
    lose: 'A sour note...',
    after: 'MASTER CANTOR can hear a chime a quarter-tone flat from across the hall.',
  },
  spgym2: {
    cls: 'MEDIUM', name: 'SELENE', sprite: 'medium', payout: 62,
    party: () => [['phantasmuse', 42]],
    intro: 'The bells call the spirits, and the spirits sing back. Can you hear them?',
    lose: 'The spirits... have gone quiet...',
    after: 'SOUND moves ignore a SOUNDPROOF AIMON. The MASTER\'s bells know it well.',
  },
  spgym3: {
    cls: 'MUSICIAN', name: 'FELIX', sprite: 'musician', payout: 64,
    party: () => [['sonarion', 42], ['bellchime', 42]],
    intro: 'The final movement before the MASTER! Let\'s play it fortissimo!',
    lose: 'Fine. Fine! Pianissimo...',
    after: 'MASTER CANTOR once taught a boy who played the cello better than anyone. He never says the name.',
  },
  cantor: {
    cls: 'LEADER', name: 'CANTOR', sprite: 'cantor', payout: 180, music: 'leader', leader: true,
    party: () => [
      ['bellchime', 42, ['hypervoice', 'disarmingvoice', 'echoedvoice', 'workup']],
      ['noctumoth', 43, ['bugbuzz', 'airslash', 'feintattack', 'stunspore']],
      ['sonarion', 44, ['hypervoice', 'screech', 'aerialace', 'crunch']],
      ['bellumor', 46, ['boomburst', 'disarmingvoice', 'bodyslam', 'workup']],
    ],
    lose: 'Bravo. Bravo! Oh, it has been a long time since anyone made these old bells sing like that.',
  },
};

// The eight GYM badges. The first seven gyms exist so far.
const BADGES = [
  { id: 'keystone', name: 'KEYSTONE BADGE', leader: 'HOLT', town: 'GRAYHAVEN CITY', type: 'normal',
    colors: ['#a8a0a0', '#686060', '#f8d048'] },
  { id: 'grove', name: 'GROVE BADGE', leader: 'IVY', town: 'CEDARWOOD VILLAGE', type: 'grass',
    colors: ['#78b860', '#3c6830', '#e8f0a0'] },
  { id: 'tide', name: 'TIDE BADGE', leader: 'NERISSA', town: 'SEABREEZE PORT', type: 'water',
    colors: ['#5890d8', '#284878', '#c8e8f8'] },
  { id: 'crag', name: 'CRAG BADGE', leader: 'TOR', town: 'CRAGMOOR TOWN', type: 'rock',
    colors: ['#c09060', '#6a4a28', '#f8e0b0'] },
  { id: 'dune', name: 'DUNE BADGE', leader: 'SAHRA', town: 'SUNSPIRE RUINS', type: 'ground',
    colors: ['#e0b060', '#8a6428', '#f8e8b0'] },
  { id: 'spark', name: 'SPARK BADGE', leader: 'WREN', town: 'MEADOWFIELD FARM', type: 'electric',
    colors: ['#e0c048', '#886820', '#f8f0a0'] },
  { id: 'chord', name: 'CHORD BADGE', leader: 'CANTOR', town: 'STONEPEAK WOODS', type: 'sound',
    colors: ['#60b8c8', '#306878', '#c8f0f8'] },
  { id: 'b8', name: '???', colors: ['#886860', '#403030', '#e8c8c0'] },
];
