'use strict';

const ITEMS = {
  aimonball: { name: 'AIMON BALL', pocket: 'balls', price: 200, ball: 1,
    desc: 'A ball for catching wild AIMON.' },
  greatball: { name: 'GREAT BALL', pocket: 'balls', price: 600, ball: 1.5,
    desc: 'A better ball with a higher catch rate.' },
  potion: { name: 'POTION', pocket: 'items', price: 300, heal: 20,
    desc: 'Restores the HP of one AIMON by 20 points.' },
  superpotion: { name: 'SUPER POTION', pocket: 'items', price: 700, heal: 50,
    desc: 'Restores the HP of one AIMON by 50 points.' },
  revive: { name: 'REVIVE', pocket: 'items', price: 1500, revive: true,
    desc: 'Revives a fainted AIMON with half its HP.' },
};

const MART_STOCK = ['aimonball', 'potion', 'superpotion', 'revive'];
