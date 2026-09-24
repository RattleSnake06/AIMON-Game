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
    party: () => [['goskie', 19], ['scrapaw', 20], [State.rivalStarter(), 22]],
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
};

// The eight GYM badges. The first three gyms exist so far.
const BADGES = [
  { id: 'keystone', name: 'KEYSTONE BADGE', leader: 'HOLT', town: 'GRAYHAVEN CITY', type: 'normal',
    colors: ['#a8a0a0', '#686060', '#f8d048'] },
  { id: 'grove', name: 'GROVE BADGE', leader: 'IVY', town: 'CEDARWOOD VILLAGE', type: 'grass',
    colors: ['#78b860', '#3c6830', '#e8f0a0'] },
  { id: 'tide', name: 'TIDE BADGE', leader: 'NERISSA', town: 'SEABREEZE PORT', type: 'water',
    colors: ['#5890d8', '#284878', '#c8e8f8'] },
  { id: 'b4', name: '???', colors: ['#e07848', '#884020', '#f8d0a0'] },
  { id: 'b5', name: '???', colors: ['#c878c8', '#704070', '#f8c8f8'] },
  { id: 'b6', name: '???', colors: ['#e0c048', '#886820', '#f8f0a0'] },
  { id: 'b7', name: '???', colors: ['#60b8c8', '#306878', '#c8f0f8'] },
  { id: 'b8', name: '???', colors: ['#886860', '#403030', '#e8c8c0'] },
];
