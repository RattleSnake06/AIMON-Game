'use strict';
// After the story: the BATTLE TOWER on the LEAGUE island, and the FORGOTTEN
// LIGHTHOUSE on its rock far to the west, where VESPER keeps the light and
// MORROW's hourglass leads. Row data is laid out by a small script.

// A glint where MORROW once stood; each appears once the one before is found.
const hourglassGlint = (n, x, y) => ({
  id: `hg_glint${n}`, prop: 'glint', x, y, move: 'still', script: 'hourglassGlint', note: n, dyn: true,
  showIf: () => State.flag(n === 1 ? 'hg_taken' : `hg_note${n - 1}`) && !State.flag(`hg_note${n}`),
});

Object.assign(MAPS, {
  // ---------------------------------------------------------------- The BATTLE TOWER
  tower_lobby: {
    name: 'BATTLE TOWER', popup: true, music: 'league', floor: 'ĥ', theme: 'tower', region: 'league',
    rows: [
      'wwwwwwwwwwwww',
      'WnWWW###WWWnW',
      'pĥĥĥĥ###ĥXXĥp',
      'ĥCChCCĥĥĥĥĥĥĥ',
      'ĥĥĥĥĥĥĥĥĥĥĥĥĥ',
      'ĥĥĥĥĥĥĥĥĥĥĥĥĥ',
      'pĥĥcDcĥcDcĥĥp',
      'ĥĥĥĥĥĥĥĥĥĥĥĥĥ',
      'ĥĥĥĥĥĥMĥĥĥĥĥĥ',
    ],
    buildings: [{ type: 'eliteDoor', x: 5, y: 1 }],
    things: [
      { x: 9, y: 2, script: 'towerBoard' }, { x: 10, y: 2, script: 'towerBoard' },
      { x: 6, y: 2, text: 'The lift to the battle rooms. The RECEPTIONIST will send you up.' },
    ],
    npcs: [
      { id: 'tw_desk', person: 'clerk', x: 3, y: 2, dir: 'down', move: 'still', script: 'towerDesk' },
      { id: 'tw_fan', person: 'youngster', x: 9, y: 5, dir: 'left', move: 'wander',
        text: 'I made it to 3 wins in a row once! Then a HIKER\'s OBELITH sat on my whole team.' },
      { id: 'tw_vet', person: 'veteran', x: 11, y: 7, dir: 'left', move: 'look',
        text: 'Every battle, the challengers get a little stronger, and they bring more AIMON.\fBy twenty wins, they\'re as tough as the ELITE FOUR. Tougher, some days.' },
    ],
  },

  tower_room: {
    name: '', music: 'league', floor: 'ĥ', theme: 'tower', eliteTheme: 'gold', battleBg: 'champion', region: 'league',
    rows: [
      'wwwwwwwwwww',
      'WWWW###WWWW',
      'WĬĥĥ###ĥĥĬW',
      'WĥĥĥĥĥĥĥĥĥW',
      'WĥĥĥĥĥĥĥĥĥW',
      'WĥĥĥĥĥĥĥĥĥW',
      'WĥĥĥĥĥĥĥĥĥW',
      'WĬĥĥĥĥĥĥĥĬW',
      'WWWWWWWWWWW',
    ],
    buildings: [{ type: 'eliteDoor', x: 4, y: 1 }],
  },

  // ---------------------------------------------------------------- The FORGOTTEN LIGHTHOUSE
  fl_isle: {
    name: 'FORGOTTEN LIGHTHOUSE', outdoor: true, border: '~', ground: '.', region: 'lighthouse',
    music: 'grove', battleBg: 'beach',
    weather: { kind: 'night', dark: 0.5 },
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~aaaaaaaaaaaaaa~~~~~',
      '~~~~......###.....r.~~~~',
      '~Z~~rr....###......r~~~~',
      '~~~.....f.###.f......~Z~',
      '~~a..gg...###....r...a~~',
      '~~ar.ggg..###........a~~',
      '~~a.......###.......ra~~',
      '~~a.......###..J.....a~~',
      'Z~a.......:::...gg...a~~',
      '~~a..g.....:....ggg..a~Z',
      '~~ar..gg...:.S.......a~~',
      '~~a......f.:...r....ra~~',
      '~~~...r....:..f......~~~',
      '~Z~a.......:........a~~~',
      '~~~~aaaaaaa:aaaaaaaa~~Z~',
      '~~~~aaaaaaa:aaaaaaaa~~~~',
      '~~~~~~~~~~~<<~~~~~~~~~~~',
      '~~~~~~~~Z~~<<~~~Z~~~~~~~',
      '~~~~~~~~~~~<<~~~~~~~~~~~',
    ],
    buildings: [{ type: 'lighthouse', x: 10, y: 2, to: 'fl_1f' }],
    glows: [{ x: 11, y: 3, r: 30, color: '#fff0a0', alpha: 0.35, speed: 10 }],
    signs: [{ x: 13, y: 11, text: 'THE FORGOTTEN LIGHTHOUSE\nKEEPER: VESPER\f(Another name has been painted over underneath. Only an "M." still shows.)' }],
    things: [{ x: 15, y: 8, script: 'flMemorial' }],
    fishing: {
      table: [
        { species: 'prismanta', min: 55, max: 58, weight: 40 },
        { species: 'abysslure', min: 55, max: 58, weight: 40 },
        { species: 'tidecrusher', min: 56, max: 58, weight: 20 },
      ],
    },
    npcs: [
      { id: 'fl_sailor', person: 'sailor', x: 12, y: 16, dir: 'left', move: 'still', script: 'flFerry' },
      { id: 'fl_boat', prop: 'boat', x: 10, y: 18, move: 'still', script: 'flFerry' },
      { id: 'fl_vesper0', person: 'vesper', x: 11, y: 9, dir: 'down', move: 'still', script: 'flArrive', hideIf: 'fl_met', dyn: true },
    ],
    triggers: [{ x: 10, y: 12, w: 3, h: 1, script: 'flArrive' }],
  },

  fl_1f: {
    name: 'FORGOTTEN LIGHTHOUSE', popup: true, music: 'grove', floor: '(', theme: 'lighthouse', region: 'lighthouse',
    rows: [
      'wKKwwwwwwww',
      'WkkWWnWWWWW',
      '(((((((WUW(',
      '(D(((((((((',
      '(((((((((((',
      '(((((((((((',
      '(((((((((((',
      '(((((((((@(',
      '($((((((($(',
      'x(((((((((x',
      'x((((M((((x',
    ],
    warps: [{ x: 8, y: 2, to: 'fl_top', tx: 2, ty: 2, dir: 'down', kind: 'stairs' }],
    things: [
      { x: 1, y: 3, script: 'flLogbook' },
      { x: 1, y: 1, text: 'Tide tables, star charts and three shelves of poetry. The poetry is new.' },
      { x: 2, y: 1, text: 'Tide tables, star charts and three shelves of poetry. The poetry is new.' },
    ],
    npcs: [
      { id: 'fl_vesper1', person: 'vesper', x: 5, y: 4, dir: 'down', move: 'still', script: 'flVesper', showIf: 'fl_met', dyn: true },
    ],
  },

  fl_top: {
    name: '', music: 'grove', floor: '(', theme: 'lighthouse', battleBg: 'shrine', region: 'lighthouse',
    rows: [
      'wwwwwwwwwww',
      'WnWWWnWWWnW',
      '(WUW###((((',
      '((((###((((',
      '((((###((((',
      '(((((((((((',
      '(((((((((((',
      '(((((((((((',
      '(((((((((((',
      'x(((((((((x',
      'x(((((((((x',
    ],
    buildings: [{ type: 'lens', x: 4, y: 2 }],
    warps: [{ x: 2, y: 2, to: 'fl_1f', tx: 8, ty: 2, dir: 'down', kind: 'stairs' }],
    glows: [{ x: 5, y: 3, r: 26, color: '#fff0a0', alpha: 0.35, speed: 12, hideIf: 'fl_dark' }],
    things: [{ x: 4, y: 4, script: 'flLamp' }, { x: 5, y: 4, script: 'flLamp' }, { x: 6, y: 4, script: 'flLamp' }],
    npcs: [
      { id: 'fl_hourghast', prop: 'mon:hourghast', x: 7, y: 5, move: 'still', script: 'flGhostTalk', showIf: 'fl_ghost_done', dyn: true },
      { id: 'fl_morrow', person: 'morrow', x: 8, y: 6, dir: 'left', move: 'still', script: 'flMorrowTalk', showIf: 'morrow_done', dyn: true },
    ],
    triggers: [
      { x: 2, y: 2, w: 1, h: 1, script: 'flMidnight', onArrive: true },
      { x: 2, y: 2, w: 1, h: 1, script: 'flMorrow', onArrive: true },
    ],
  },
});

// The BATTLE TOWER stands beside the LEAGUE hall, closed until you're CHAMPION.
MAPS.league.buildings.push({ type: 'battleTower', x: 20, y: 1, to: 'tower_lobby',
  lock: { flag: 'game_clear', text: 'The BATTLE TOWER. A sign on the door reads:\n"OPENING SOON. CHAMPIONS ONLY."' } });
MAPS.league.signs.push({ x: 21, y: 11, text: 'BATTLE TOWER\nHow long can your streak last?' });

// MORROW's hourglass: taken from the SUNKEN SHRINE, then followed to the places he met you.
{
  const hg = MAPS.shrine3.npcs.find((n) => n.id === 's3_hourglass');
  hg.showIf = () => State.flag('game_clear') && !State.flag('hg_taken');
  hg.dyn = true;
  MAPS.hq3.npcs.push(hourglassGlint(1, 16, 3));
  MAPS.tower3.npcs.push(hourglassGlint(2, 5, 5));
  MAPS.obs2.npcs.push(hourglassGlint(3, 2, 12));
}
