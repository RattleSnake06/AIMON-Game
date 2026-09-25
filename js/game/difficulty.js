'use strict';
// EASY, NORMAL and HARD. The story is the same in every mode; only the
// levels of the AIMON you face change (and on EASY, RARE CANDY never runs out).

const DIFFICULTIES = {
  easy: {
    name: 'EASY', color: '#58b858',
    lines: ['Wild AIMON and trainers are', 'much weaker. RARE CANDY never', 'runs out. A relaxed adventure.'],
  },
  normal: {
    name: 'NORMAL', color: '#4878d0',
    lines: ['The adventure as it was meant', 'to be played. No endless', 'RARE CANDY.'],
  },
  hard: {
    name: 'HARD', color: '#d85040',
    lines: ['Every trainer\'s AIMON are 5 to', '10 levels stronger. No endless', 'RARE CANDY. For veterans!'],
  },
};
const DIFFICULTY_ORDER = ['easy', 'normal', 'hard'];

const Difficulty = {
  id() { return (State.d && State.d.difficulty) || 'normal'; },
  name(id = this.id()) { return DIFFICULTIES[id].name; },

  // The level an opposing AIMON actually appears at.
  level(level, trainer) {
    const mode = this.id();
    if (mode === 'easy') return Math.max(2, Math.round(level * 0.7));
    if (mode === 'hard' && trainer) return Math.min(MAX_LEVEL, level + Math.min(10, 5 + Math.floor(level / 12)));
    return level;
  },

  // Only EASY keeps the endless RARE CANDY.
  endlessCandy() { return this.id() === 'easy'; },

  // Give or take away the RARE CANDY to match the mode.
  applyCandy(d) {
    if (d.difficulty === 'easy') d.bag.rarecandy = 1;
    else delete d.bag.rarecandy;
  },

  // The screen shown when starting a new game. Returns 'easy' | 'normal' | 'hard'.
  *choose() {
    const s = { opaque: true, index: 1, picked: null, start: Game.frame };
    s.update = () => {
      if (s.picked) return;
      if (Input.repeat('up') && s.index > 0) { s.index--; Sound.sfx('select'); }
      if (Input.repeat('down') && s.index < 2) { s.index++; Sound.sfx('select'); }
      if (Input.pressed('a') || Input.pressed('start')) { Sound.sfx('confirm'); s.picked = DIFFICULTY_ORDER[s.index]; }
    };
    s.draw = (g) => {
      UI.stripes(g, '#284880', '#305090');
      Font.drawCenter(g, 'CHOOSE A DIFFICULTY', SCREEN_W / 2, 6, '#f8f8f8', '#182850');
      DIFFICULTY_ORDER.forEach((id, i) => {
        const y = 22 + i * 24;
        UI.window(g, 40, y, 160, 22);
        const mode = DIFFICULTIES[id];
        g.fillStyle = mode.color;
        g.fillRect(52, y + 8, 6, 6);
        Font.draw(g, mode.name, 64, y + 6, '#404048', '#d0d0c8');
        if (i === s.index) UI.cursor(g, 44, y + 6);
      });
      UI.window(g, 8, 96, 224, 58);
      DIFFICULTIES[DIFFICULTY_ORDER[s.index]].lines.forEach((line, i) => Font.draw(g, line, 18, 104 + i * 14, '#404048', '#d0d0c8'));
    };
    Game.push(s);
    Sound.playMusic('intro');
    yield* Game.fadeIn(20);
    for (;;) {
      s.picked = null;
      yield () => s.picked !== null;
      const name = DIFFICULTIES[s.picked].name;
      const yes = yield* Dialog.yesNo(`Play on ${name}? The difficulty can't be changed later.`);
      if (yes) break;
    }
    const picked = s.picked;
    yield* Game.fadeOut(20);
    Game.remove(s);
    return picked;
  },
};
