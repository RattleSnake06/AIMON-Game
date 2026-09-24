'use strict';
// pocket: items / balls / key / tms

const ITEMS = {
  aimonball: { name: 'AIMON BALL', pocket: 'balls', price: 200, ball: 1,
    desc: 'A ball for catching wild AIMON.' },
  greatball: { name: 'GREAT BALL', pocket: 'balls', price: 600, ball: 1.5,
    desc: 'A better ball with a higher catch rate.' },
  rarecandy: { name: 'RARE CANDY', pocket: 'items', candy: true, infinite: true, field: true,
    desc: 'Raises one AIMON\'s level by 1 instantly. (Test build: it never runs out.)' },
  potion: { name: 'POTION', pocket: 'items', price: 300, heal: 20,
    desc: 'Restores the HP of one AIMON by 20 points.' },
  superpotion: { name: 'SUPER POTION', pocket: 'items', price: 700, heal: 50,
    desc: 'Restores the HP of one AIMON by 50 points.' },
  revive: { name: 'REVIVE', pocket: 'items', price: 1500, revive: true,
    desc: 'Revives a fainted AIMON with half its HP.' },
  parlyzheal: { name: 'PARLYZ HEAL', pocket: 'items', price: 200, cure: ['par'],
    desc: 'Cures one AIMON of paralysis.' },
  awakening: { name: 'AWAKENING', pocket: 'items', price: 250, cure: ['slp'],
    desc: 'Wakes up one sleeping AIMON.' },
  burnheal: { name: 'BURN HEAL', pocket: 'items', price: 250, cure: ['brn'],
    desc: 'Heals one AIMON of a burn.' },
  fullheal: { name: 'FULL HEAL', pocket: 'items', price: 600, cure: ['par', 'slp', 'brn'],
    desc: 'Cures one AIMON of any status problem.' },
  repel: { name: 'REPEL', pocket: 'items', price: 350, repel: 100, field: true,
    desc: 'Keeps weak wild AIMON away for 100 steps.' },
  escaperope: { name: 'ESCAPE ROPE', pocket: 'items', price: 550, escape: true, field: true,
    desc: 'Leads you out of a cave back to its entrance.' },
  expshare: { name: 'EXP. SHARE', pocket: 'key', toggle: true,
    desc: 'Lets AIMON that didn\'t battle earn half the EXP. Select to turn it ON or OFF.' },
  oldrod: { name: 'OLD ROD', pocket: 'key', rod: true,
    desc: 'An old fishing rod. Face the water and press A, or use it from here, to fish for AIMON.' },
  cardkey: { name: 'CARD KEY', pocket: 'key',
    desc: 'A TEAM DISTORTION key card. It opens the energy gates in their hideout.' },
  tm01: { name: 'TM01 SWIFT', pocket: 'tms', tm: 'swift',
    desc: 'Teaches SWIFT: star-shaped rays that never miss. Can be used again and again.' },
  tm02: { name: 'TM02 MAGICAL LEAF', pocket: 'tms', tm: 'magicalleaf',
    desc: 'Teaches MAGICAL LEAF: curious leaves that never miss. Can be used again and again.' },
  tm03: { name: 'TM03 WATER PULSE', pocket: 'tms', tm: 'waterpulse',
    desc: 'Teaches WATER PULSE: a pulsing blast of water. Can be used again and again.' },
};

// What each AIMON MART sells.
const MART_STOCK = {
  archford: ['aimonball', 'potion', 'superpotion', 'parlyzheal', 'awakening', 'burnheal', 'repel', 'escaperope', 'revive'],
  grayhaven: ['aimonball', 'greatball', 'potion', 'superpotion', 'fullheal', 'parlyzheal', 'repel', 'escaperope', 'revive'],
  cedarwood: ['aimonball', 'greatball', 'potion', 'superpotion', 'burnheal', 'parlyzheal', 'awakening', 'repel', 'revive'],
  seabreeze: ['greatball', 'aimonball', 'superpotion', 'potion', 'fullheal', 'parlyzheal', 'repel', 'escaperope', 'revive'],
};

// Status conditions.
const STATUS = {
  par: { name: 'PAR', color: '#d8a820', verb: 'is paralyzed! It may be unable to move!', cured: 'was cured of paralysis.' },
  slp: { name: 'SLP', color: '#8888a0', verb: 'fell asleep!', cured: 'woke up.' },
  brn: { name: 'BRN', color: '#e05830', verb: 'was burned!', cured: 'was cured of its burn.' },
};
