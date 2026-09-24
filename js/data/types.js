'use strict';

const TYPES = {
  normal: { name: 'NORMAL', color: '#a8a878' },
  fire: { name: 'FIRE', color: '#f08030' },
  water: { name: 'WATER', color: '#6890f0' },
  grass: { name: 'GRASS', color: '#78c850' },
  electric: { name: 'ELECTRIC', color: '#e8c020' },
  ground: { name: 'GROUND', color: '#c8a050' },
  fighting: { name: 'FIGHTING', color: '#c03028' },
  bug: { name: 'BUG', color: '#98b020' },
  flying: { name: 'FLYING', color: '#a890f0' },
  rock: { name: 'ROCK', color: '#b8a038' },
  dark: { name: 'DARK', color: '#705848' },
};

// attacker -> defender -> multiplier (missing entries are 1x)
const TYPE_CHART = {
  normal: { rock: 0.5 },
  fire: { grass: 2, bug: 2, fire: 0.5, water: 0.5, rock: 0.5 },
  water: { fire: 2, ground: 2, rock: 2, water: 0.5, grass: 0.5 },
  grass: { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, flying: 0.5, bug: 0.5 },
  electric: { water: 2, flying: 2, electric: 0.5, grass: 0.5, ground: 0 },
  ground: { fire: 2, electric: 2, rock: 2, grass: 0.5, bug: 0.5, flying: 0 },
  fighting: { normal: 2, rock: 2, dark: 2, flying: 0.5, bug: 0.5 },
  bug: { grass: 2, dark: 2, fire: 0.5, fighting: 0.5, flying: 0.5 },
  flying: { grass: 2, fighting: 2, bug: 2, electric: 0.5, rock: 0.5 },
  rock: { fire: 2, flying: 2, bug: 2, fighting: 0.5, ground: 0.5 },
  dark: { dark: 0.5, fighting: 0.5 },
};

function typeEffect(moveType, defTypes) {
  let m = 1;
  for (const t of defTypes) m *= (TYPE_CHART[moveType] || {})[t] ?? 1;
  return m;
}
