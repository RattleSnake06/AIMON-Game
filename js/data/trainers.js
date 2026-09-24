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
};

// The eight GYM badges. Only the first gym exists so far.
const BADGES = [
  { id: 'keystone', name: 'KEYSTONE BADGE', leader: 'HOLT', town: 'GRAYHAVEN CITY', type: 'normal',
    colors: ['#a8a0a0', '#686060', '#f8d048'] },
  { id: 'b2', name: '???', colors: ['#7890c8', '#405080', '#c8e0f8'] },
  { id: 'b3', name: '???', colors: ['#78b860', '#406830', '#d8f0a0'] },
  { id: 'b4', name: '???', colors: ['#e07848', '#884020', '#f8d0a0'] },
  { id: 'b5', name: '???', colors: ['#c878c8', '#704070', '#f8c8f8'] },
  { id: 'b6', name: '???', colors: ['#e0c048', '#886820', '#f8f0a0'] },
  { id: 'b7', name: '???', colors: ['#60b8c8', '#306878', '#c8f0f8'] },
  { id: 'b8', name: '???', colors: ['#886860', '#403030', '#e8c8c0'] },
];
