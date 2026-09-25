'use strict';
// The GYMS of chapters 3 to 9, each with a small puzzle for its type:
// IVY's greenhouse of sleeping blooms and vine walls, NERISSA's pool of
// currents, TOR's quarry of boulders and pits, SAHRA's sinkholes and the
// floor beneath them, WREN's barn of switch plates and electric gates, and
// CANTOR's hall of bell plates and chime doors. (NOX's starry dome is in
// maps_ch10.js with the rest of the observatory.)
// Row data is laid out with a small script that also checks every puzzle can
// be solved.

const vine = (id, x, y, flag) => ({
  id, prop: 'vineWall', x, y, move: 'still', hideIf: flag, dyn: true,
  text: 'A wall of thorny vines, grown tight across the path. A sleeping bloom somewhere must be holding it shut.',
});
const bloom = (n, x, y) => [
  { id: `cw_bud${n}`, prop: 'bloomBud', x, y, move: 'still', script: 'bloomTouch', bloom: n, hideIf: `cw_bloom${n}`, dyn: true },
  { id: `cw_open${n}`, prop: 'bloomOpen', x, y, move: 'still', showIf: `cw_bloom${n}`, dyn: true,
    text: 'A golden bloom, wide open. It smells like sunshine.' },
];
const zap = (id, x, y, group) => ({
  id, prop: group === 'A' ? 'gateA' : 'gateB', x, y, move: 'still', dyn: true,
  ...(group === 'A' ? { hideIf: 'mf_gate' } : { showIf: 'mf_gate' }),
  text: group === 'A'
    ? 'A crackling BLUE gate. Touch it? Absolutely not.'
    : 'A crackling ORANGE gate. The hairs on your arms stand up.',
});

Object.assign(MAPS, {
  // ---------------------------------------------------------------- GYM 2: IVY
  gym_cw: {
    name: '', music: 'gym', floor: '3', theme: 'greenhouse', battleBg: 'forest', region: 'cedarwood',
    rows: [
      'wwwwwwwwwwwwwww',
      'WWWnWWWWWWWnWWW',
      'p3335553555333p',
      '333333333333333',
      '222222232222222',
      '333333333333333',
      '332333233332333',
      '232222222222222',
      '333333333333333',
      '322222222222222',
      '333333333333333',
      '232222222222232',
      '333333333333333',
      '322222232222222',
      '333333333333333',
      '222222222222223',
      '333333333333333',
      '3333333M3333333',
    ],
    npcs: [
      { id: 'cw_ivy', person: 'ivy', x: 7, y: 2, dir: 'down', move: 'still', script: 'ivyGym' },
      { id: 'cw_fern', person: 'gardener', x: 7, y: 13, dir: 'down', move: 'still', trainer: 'fern', sight: 1 },
      { id: 'cw_rowan', person: 'gardener', x: 12, y: 6, dir: 'up', move: 'still', trainer: 'rowan', sight: 1 },
      { id: 'cw_guide', person: 'man', x: 5, y: 17, dir: 'right', move: 'still', script: 'gymGuideIvy' },
      ...bloom(1, 1, 11), ...bloom(2, 13, 8), ...bloom(3, 13, 5),
      vine('cw_vine1', 13, 11, 'cw_bloom1'),
      vine('cw_vine2', 1, 7, 'cw_bloom2'),
      vine('cw_vine3', 7, 4, 'cw_bloom3'),
    ],
  },

  // ---------------------------------------------------------------- GYM 3: NERISSA
  gym_sb: {
    name: '', music: 'gym', floor: ']', theme: 'seagym', battleBg: 'beach', region: 'seabreeze',
    rows: [
      'wwwwwwwwwwwwwww',
      'WWWnWWWWWWWnWWW',
      ']]]]]]]]]]]]]]]',
      ']]]]]]]]]]]]]]]',
      '~~~~~~~ă~~~~~ą~',
      '~~~~~~~ă~~~~~ą~',
      '~~~~~~]]]~~~~ą~',
      '~~~~~~]]]ććććą~',
      ']]]~~~~~~~~~]]]',
      ']]]ĉĉĉĉĉĉĉĉĉ]]]',
      ']]]~~~~~~~~~]]]',
      ']]]~~~~~~~~~]]]',
      'ąă~~~~]]]~~~~~ą',
      'ąă~~~~~ăą~~~~~ą',
      'ąă~~~~~ăą~~~~~ą',
      ']]]]]]]]]]]]]]]',
      ']]]]]]]]]]]]]]]',
      ']]]]]]]M]]]]]]]',
    ],
    npcs: [
      { id: 'sb_nerissa_gym', person: 'nerissa', x: 7, y: 2, dir: 'down', move: 'still', script: 'nerissaGym' },
      { id: 'sb_marlo', person: 'sailor', x: 1, y: 8, dir: 'down', move: 'still', trainer: 'marlo', sight: 3 },
      { id: 'sb_coral', person: 'swimmer', x: 14, y: 9, dir: 'left', move: 'still', trainer: 'coral', sight: 2 },
      { id: 'sb_guide', person: 'man', x: 10, y: 16, dir: 'left', move: 'still', script: 'gymGuideNerissa' },
    ],
  },

  // ---------------------------------------------------------------- GYM 4: TOR
  gym_cm: {
    name: '', music: 'gym', floor: 'Ö', theme: 'quarry', battleBg: 'cave', region: 'cragmoor',
    rows: [
      'wwwwwwwwwwwwwww',
      'WWWWWW###WWWWWW',
      'ÖÖÖÖOÖ###ÖOÖÖÖÖ',
      'ÖÖOÖÖÖ###ÖÖÖOÖÖ',
      'ÖOÖÖÖIÖÖÖIÖÖÖOÖ',
      'ÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖ',
      'OOOOOOOOOOċOOOO',
      'ÖÖÖÖÖÖÖÖÖÖÖÖÖOÖ',
      'ÖÖOÖÖÖÖÖÖÖÖÖÖÖÖ',
      'ÖÖÖÖÖÖÖÖÖÖÖÖOÖÖ',
      'OOOċOOOOOOOOOOO',
      'ÖÖÖÖÖÖÖÖÖOÖÖÖÖÖ',
      'ÖOÖÖÖÖÖÖÖÖÖÖÖÖÖ',
      'ÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖ',
      'OOOOOOOOOOOċOOO',
      'ÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖ',
      'ÖÖOÖÖÖÖÖÖÖÖÖÖOÖ',
      'ÖÖÖÖÖÖÖMÖÖÖÖÖÖÖ',
    ],
    buildings: [{ type: 'cragstone', x: 6, y: 1 }],
    // Once TOR is beaten, the crew leaves the pits filled in.
    onLoad(map) {
      if (!State.flag('badge_crag')) return;
      map.rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === 'ċ') map.setTile(x, y, 'Ö'); }));
    },
    things: [
      { x: 6, y: 3, script: 'cragstoneInspect' }, { x: 7, y: 3, script: 'cragstoneInspect' }, { x: 8, y: 3, script: 'cragstoneInspect' },
    ],
    npcs: [
      { id: 'cm_tor_gym', person: 'tor', x: 7, y: 4, dir: 'down', move: 'still', script: 'torGym' },
      { id: 'cm_miner1', person: 'miner', x: 13, y: 13, dir: 'left', move: 'still', trainer: 'cmminer1', sight: 2 },
      { id: 'cm_hiker', person: 'hiker', x: 4, y: 7, dir: 'down', move: 'still', trainer: 'cmhiker', sight: 2 },
      { id: 'cm_miner2', person: 'miner', x: 13, y: 5, dir: 'left', move: 'still', trainer: 'cmminer2', sight: 3 },
      { id: 'cm_guide', person: 'man', x: 5, y: 17, dir: 'right', move: 'still', script: 'gymGuideTor' },
      { id: 'cm_rock1', prop: 'pushRock', x: 10, y: 16, move: 'still', push: true, hideIf: 'badge_crag' },
      { id: 'cm_rock2', prop: 'pushRock', x: 5, y: 12, move: 'still', push: true, hideIf: 'badge_crag' },
      { id: 'cm_rock3', prop: 'pushRock', x: 8, y: 8, move: 'still', push: true, hideIf: 'badge_crag' },
    ],
  },

  // ---------------------------------------------------------------- GYM 5: SAHRA
  gym_ss: {
    name: '', music: 'gym', floor: 'Ô', theme: 'ruins', battleBg: 'desert', region: 'sunspire',
    rows: [
      'wwwwwwwwwwwwwwwww',
      'WWWWWWWWWWWWWWWWW',
      'ÔÔÔÔÔÔÔÜÜÜÔÔÔÔÔÔÔ',
      'ÔÔÌÔÔÌÔÔÔÔÔÌÔÔÌÔÔ',
      'ÔÔÔÔÔÔÔÔÔÔÔÔÔÔÔÔÔ',
      'ÔÔÔÔÔÔÔÔÔÔÔÔÔÔÔÔÔ',
      'ÏÏĺÏÏÏÏÏÏÏÏÏÏÏÏÏÏ',
      'ÔÔÔÔÔÔÀÀÀÔÌÔÔÔÔÔÔ',
      'ÔÌÔÔÔÀÀÀÀÔÌÔčÔÔÔÔ',
      'ÔÔÔÔÔÀÀÀÔÔÌÔÔÔÔÔÔ',
      'ÔÔÔÔÔÔÔÔÔÔÌÔÔÔÔÔÔ',
      'ÔÔÔÔÔÔÔÔčÔÏÏÏÏÏÏÏ',
      'ÔÀÀÀÔÔÔÔÔÔÔÔÔÔÔÌÔ',
      'ÔÀÀÀÔÔÔÔÔÔÔÔÔÔÔÔÔ',
      'ÔÀÀÀÔÌÔÔÔÔÔÔÔčÔÔÔ',
      'ÔÔÔčÔÔÔÔÔÔÀÀÀÔÔÔÔ',
      'ÔÌÔÔÔÔÔÔÔÔÀÀÀÔÔÌÔ',
      'ÔÔÔÔÔÔÔÔÔÔÔÔÔÔÔÔÔ',
      'xxxxxxxxMxxxxxxxx',
    ],
    sinkTo: 'gym_ss_b1',
    things: [
      { x: 7, y: 2, script: 'gymRootsInspect' }, { x: 8, y: 2, script: 'gymRootsInspect' }, { x: 9, y: 2, script: 'gymRootsInspect' },
    ],
    npcs: [
      { id: 'ss_sahra_gym', person: 'sahra', x: 8, y: 3, dir: 'down', move: 'still', script: 'sahraGym' },
      { id: 'ss_guide', person: 'man', x: 9, y: 17, dir: 'left', move: 'still', script: 'gymGuideSahra' },
    ],
  },
  gym_ss_b1: {
    name: 'SUNSPIRE GYM B1F', popup: true, music: 'gym', floor: 'Ô', theme: 'ruins', battleBg: 'desert', region: 'sunspire',
    rows: [
      'wwwwwwwwwwwwwwwww',
      'WWWWWWWWWWWWWWWWW',
      'ÌÌÌÌÌÌÌÌÌÌÌÔÔÔÔÔÌ',
      'ÌÌÌÌÌÌÌÌÌÌÌÔÔÔÔÔÌ',
      'ÌÌÌÌÌÌÌÌÌÌÌÔÔÔUÔÌ',
      'ÌÌÌÌÌÌÌÌÌÌÌÔÔÔÔÔÌ',
      'ÌÔÔÔÔÔÔÔÔÔÌÔÔÔÔÔÌ',
      'ÌÔÀÀÀÔÔÔÔÔÌÔÔÔÔÔÌ',
      'ÌÔÀÀÀÔÔÔÔÔÌÔÔÔÔÔÌ',
      'ÌÔÔÔÔÔÔÔÔÔÌÌÌÌÌÌÌ',
      'ÌÔÔÔÔÔÔÔÔÔÌÔÔÔÔÔÌ',
      'ÌUÔÔÔÔÔÔÔÔÌÔÔÔÔÔÌ',
      'ÌÌÌÌÌÌÌÌÌÌÌÔÔÔÔÔÌ',
      'ÌÔÔÔÔÔÔÔÔÔÌÔÔÔÔÔÌ',
      'ÌÔÔÔÔÔÔÔÔÔÌÔÔÔÔÔÌ',
      'ÌÔÔÔÔÔÔÔÔÔÌÔÔÔÔÔÌ',
      'ÌÔÀÀÔÔÔÔÔÔÌÔÔÔÔUÌ',
      'ÌUÔÔÔÔÔÔÔÔÌÔÔÔÔÔÌ',
      'ÌÌÌÌÌÌÌÌÌÌÌÌÌÌÌÌÌ',
    ],
    warps: [
      { x: 14, y: 4, to: 'gym_ss', tx: 14, ty: 4, dir: 'down', kind: 'stairs' },
      { x: 1, y: 11, to: 'gym_ss', tx: 7, ty: 16, dir: 'up', kind: 'stairs' },
      { x: 15, y: 16, to: 'gym_ss', tx: 14, ty: 9, dir: 'down', kind: 'stairs' },
      { x: 1, y: 17, to: 'gym_ss', tx: 2, ty: 17, dir: 'up', kind: 'stairs' },
    ],
    things: [
      { x: 2, y: 7, text: 'Old sandstone blocks, stacked long ago. Sand trickles down from the holes in the ceiling.' },
    ],
    npcs: [
      { id: 'ss_gym1', person: 'ruinmaniac', x: 7, y: 11, dir: 'right', move: 'still', trainer: 'ssgym1', sight: 1 },
      { id: 'ss_gym2', person: 'hiker', x: 15, y: 14, dir: 'left', move: 'still', trainer: 'ssgym2', sight: 2 },
      { id: 'ss_gym3', person: 'picnicker', x: 13, y: 5, dir: 'left', move: 'still', trainer: 'ssgym3', sight: 1 },
      { id: 'ssb_item', sprite: 'ball', x: 4, y: 16, item: 'revive' },
    ],
  },

  // ---------------------------------------------------------------- GYM 6: WREN
  gym_mf: {
    name: '', music: 'gym', floor: '_', theme: 'barn', battleBg: 'farm', region: 'meadowfield',
    rows: [
      'wwwwwwwwwwwwwww',
      'WWWWWWWWWWWWWWW',
      '_èè__È___È__èè_',
      '_______________',
      'ÈÈÈÈÈÈÈ_ÈÈÈÈÈÈÈ',
      '_ā_____________',
      '__è___è___è____',
      'ÈÈ_ÈÈÈÈÈÈÈÈÈ_ÈÈ',
      '_______è_______',
      '______èāè______',
      '_______________',
      'ÈÈ_ÈÈÈÈÈÈÈÈÈ_ÈÈ',
      '_______________',
      '___È___ā___È___',
      '_______________',
      '_______________',
      '_______M_______',
    ],
    switchFlag: 'mf_gate',
    onSwitch: 'gymSwitch',
    npcs: [
      { id: 'mf_wren_gym', person: 'wren', x: 7, y: 2, dir: 'down', move: 'still', script: 'wrenGym' },
      { id: 'mf_gym1', person: 'farmer', x: 1, y: 13, dir: 'right', move: 'still', trainer: 'mfgym1', sight: 3 },
      { id: 'mf_gym2', person: 'worker', x: 2, y: 9, dir: 'right', move: 'still', trainer: 'mfgym2', sight: 3 },
      { id: 'mf_gym3', person: 'picnicker', x: 13, y: 5, dir: 'left', move: 'still', trainer: 'mfgym3', sight: 4 },
      { id: 'mf_guide', person: 'man', x: 11, y: 15, dir: 'left', move: 'still', script: 'gymGuideWren' },
      { id: 'mf_voltimp1', prop: 'mon:voltimp', x: 8, y: 6, move: 'still', text: 'VOLTIMP: Bzzt!\fIt\'s running laps inside a little turbine to power the gates.' },
      { id: 'mf_voltimp2', prop: 'mon:voltimp', x: 13, y: 10, move: 'still', text: 'VOLTIMP: Bzzzt bzzt!\fIt waves at you mid-spin.' },
      zap('mf_gateA1', 2, 7, 'A'), zap('mf_gateA2', 12, 7, 'A'), zap('mf_gateA3', 2, 11, 'A'),
      zap('mf_gateB1', 7, 4, 'B'), zap('mf_gateB2', 12, 11, 'B'),
    ],
  },

  // ---------------------------------------------------------------- GYM 7: CANTOR
  gym_sp: {
    name: '', music: 'gym', floor: 'î', theme: 'hall', battleBg: 'tower', region: 'stonepeak',
    rows: [
      'wwwwwwwwwwwwwww',
      'WWWWWWWWWWWWWWW',
      'îìîîîîîîîîîîîìî',
      'îîîîîîîîîîîîîîî',
      'îîîîîîîîîîîîîîî',
      'ìììììììîììììììì',
      'îîîîîîîîîîîîîîî',
      'îîďîîđîîîēîîĕîî',
      'îîîîîîîîîîîîîîî',
      'îîîîîîîîîîîîîîî',
      'îîîîîîîîîîîîîîî',
      'ìììììììîììììììì',
      'îîîîîîîîîîîîîîî',
      'îîďîîđîîîēîîĕîî',
      'îîîîîîîîîîîîîîî',
      'jîîîîîîîîîîîîîj',
      'îîîîîîîMîîîîîîî',
    ],
    onBell: 'gymBell',
    things: [
      { x: 1, y: 2, text: 'A rack of silver chimes. They ring softly as you pass.' },
      { x: 13, y: 2, text: 'A rack of silver chimes. They ring softly as you pass.' },
      { x: 6, y: 11, script: 'chimePlaque', door: 1 }, { x: 8, y: 11, script: 'chimePlaque', door: 1 },
      { x: 6, y: 5, script: 'chimePlaque', door: 2 }, { x: 8, y: 5, script: 'chimePlaque', door: 2 },
    ],
    npcs: [
      { id: 'sp_cantor_gym', person: 'cantor', x: 7, y: 3, dir: 'down', move: 'still', script: 'cantorGym' },
      { id: 'sp_gym1', person: 'musician', x: 11, y: 15, dir: 'left', move: 'still', trainer: 'spgym1', sight: 3 },
      { id: 'sp_gym2', person: 'medium', x: 1, y: 9, dir: 'right', move: 'still', trainer: 'spgym2', sight: 3 },
      { id: 'sp_gym3', person: 'musician', x: 12, y: 10, dir: 'left', move: 'still', trainer: 'spgym3', sight: 4 },
      { id: 'sp_guide', person: 'man', x: 9, y: 16, dir: 'left', move: 'still', script: 'gymGuideCantor' },
      { id: 'sp_door1', prop: 'chimeDoor', x: 7, y: 11, move: 'still', hideIf: 'sp_door1', dyn: true, script: 'chimePlaque', door: 1 },
      { id: 'sp_door2', prop: 'chimeDoor', x: 7, y: 5, move: 'still', hideIf: 'sp_door2', dyn: true, script: 'chimePlaque', door: 2 },
    ],
  },
});
