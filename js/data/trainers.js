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
};
