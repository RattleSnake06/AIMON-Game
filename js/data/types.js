'use strict';

const TYPES = {
  normal: { name: 'NORMAL', color: '#a8a878' },
  fire: { name: 'FIRE', color: '#f08030' },
  water: { name: 'WATER', color: '#6890f0' },
  grass: { name: 'GRASS', color: '#78c850' },
  flying: { name: 'FLYING', color: '#a890f0' },
  rock: { name: 'ROCK', color: '#b8a038' },
  dark: { name: 'DARK', color: '#705848' },
};

// attacker -> defender -> multiplier (missing entries are 1x)
const TYPE_CHART = {
  normal: { rock: 0.5 },
  fire: { grass: 2, fire: 0.5, water: 0.5, rock: 0.5 },
  water: { fire: 2, rock: 2, water: 0.5, grass: 0.5 },
  grass: { water: 2, rock: 2, fire: 0.5, grass: 0.5, flying: 0.5 },
  flying: { grass: 2, rock: 0.5 },
  rock: { fire: 2, flying: 2 },
  dark: { dark: 0.5 },
};

function typeEffect(moveType, defTypes) {
  let m = 1;
  for (const t of defTypes) m *= (TYPE_CHART[moveType] || {})[t] ?? 1;
  return m;
}
