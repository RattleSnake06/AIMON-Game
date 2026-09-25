'use strict';
// After the story: the BATTLE TOWER and its three outfits, and the FORGOTTEN
// LIGHTHOUSE, where VESPER keeps the light, something puts it out every
// midnight, and MORROW's hourglass finally leads home.

// -- Outfits -------------------------------------------------------------------------------
const Outfit = {
  person() { return State.d && State.d.outfit ? `player_${State.d.outfit}` : 'player'; },
  apply() { if (OW.player) OW.player.person = this.person(); },
};
{
  const baseStart = OW.start;
  OW.start = function start() {
    baseStart.call(this);
    Outfit.apply();
  };
}

// -- The BATTLE TOWER -----------------------------------------------------------------------
const TOWER_PRIZES = [[5, 'outfit_alt'], [10, 'outfit_cloak'], [20, 'outfit_conductor']];
const TOWER_CLASSES = [
  ['VETERAN', 'veteran'], ['BLACK BELT', 'blackbelt'], ['SWIMMER', 'swimmer'], ['HIKER', 'hiker'],
  ['MEDIUM', 'medium'], ['SCIENTIST', 'scientist'], ['SKIER', 'skier'], ['MUSICIAN', 'musician'],
  ['ASTRONOMER', 'astronomer'], ['FARMER', 'farmer'], ['RUIN MANIAC', 'ruinmaniac'], ['SAILOR', 'sailor'],
  ['GARDENER', 'gardener'], ['LASS', 'lass'], ['CAMPER', 'camper'], ['PICNICKER', 'picnicker'], ['FISHER', 'fisher'],
];
const TOWER_NAMES = ['ALDER', 'BRYN', 'CASS', 'DARIO', 'EMBER', 'FINN', 'GWEN', 'HUGO', 'IRIS', 'JUNO', 'KIT', 'LEO', 'MAE',
  'NIKO', 'OPAL', 'PIP', 'QUINN', 'ROWE', 'SAGE', 'TESS', 'UMA', 'VIN', 'WYNN', 'YARA', 'ZED'];
const TOWER_INTROS = [
  'I\'ve been waiting all day for a real challenger!',
  'The CHAMPION? Here? My knees are shaking... but my AIMON aren\'t!',
  'Every streak ends eventually. Let\'s see if yours ends today!',
  'I trained on the VICTORY PATH for a whole year for this!',
  'No items to hide behind, no second chances. That\'s the TOWER!',
  'Let\'s make this one worth remembering!',
  'I\'ve studied every one of your battles. Well. The ones on the radio.',
  'My team and I came all the way from STARFALL for this!',
];
const TOWER_AFTER = [
  'Your streak lives on... I\'ll be back tomorrow!',
  'So that\'s what a CHAMPION\'s team looks like up close.',
  'I didn\'t even see that coming. Good luck with the next one!',
  'Wow. Just... wow.',
  'Next time I\'m bringing a bigger team!',
];

const Tower = {
  team: [],

  rec() {
    if (!State.d.tower) State.d.tower = { streak: 0, best: 0 };
    return State.d.tower;
  },

  // Strong, fully evolved AIMON (no legendaries).
  pool() {
    if (!this.poolCache) {
      this.poolCache = Object.keys(SPECIES).filter((id) => {
        const sp = SPECIES[id];
        const total = Object.values(sp.base).reduce((a, b) => a + b, 0);
        return !sp.evo && sp.catchRate > 3 && total >= 430;
      });
    }
    return this.poolCache;
  },

  // The next challenger: more AIMON and higher levels as the streak grows.
  foe(streak) {
    const size = streak < 5 ? 3 : streak < 10 ? 4 : streak < 20 ? 5 : 6;
    const level = Math.min(75, 55 + streak);
    const pool = this.pool().slice();
    this.team = [];
    for (let i = 0; i < size && pool.length; i++) this.team.push([pool.splice(U.rand(pool.length), 1)[0], level - U.rand(2)]);
    const [cls, person] = TOWER_CLASSES[U.rand(TOWER_CLASSES.length)];
    const foe = {
      cls, person, name: TOWER_NAMES[U.rand(TOWER_NAMES.length)],
      intro: TOWER_INTROS[U.rand(TOWER_INTROS.length)], after: TOWER_AFTER[U.rand(TOWER_AFTER.length)],
    };
    Object.assign(TRAINERS.tower, { cls, name: foe.name, sprite: person, lose: foe.after });
    return foe;
  },
};

// -- MORROW's hourglass ------------------------------------------------------------------------
const HOURGLASS_NOTES = {
  1: '"I was the keeper of a lighthouse once. Eleven years, and I was never late. Not once. (M.)"',
  2: '"One stormy night the lamp\'s gear jammed, and I climbed the stairs to wind it by hand. The light came on one minute late.\fThe ferry from SEABREEZE was already on the rocks. My brother was aboard. (M.)"',
  3: '"The CONDUCTOR promised me a world where every lost voice still sings. I only ever wanted one minute back.\fWhere the light went out, I will be waiting. At midnight. (M.)"',
};

const Hourglass = {
  hint() {
    if (!State.flag('hg_note1')) return 'The sand drifts... toward where you first battled MORROW: the song archive in the SONANCE TOWER.';
    if (!State.flag('hg_note2')) return 'The sand drifts north... toward the top of the STONEPEAK bell tower, where MORROW rang the bell at the wrong hour.';
    if (!State.flag('hg_note3')) return 'The sand drifts east... toward the STARFALL observatory, under the open dome.';
    if (!State.flag('morrow_done')) return 'The sand points west, across the sea, toward the FORGOTTEN LIGHTHOUSE. It seems to be waiting for midnight.';
    return 'The sand falls freely now, grain by grain, the right way down.';
  },
};

Object.assign(Events.sailDest, { lighthouse: ['fl_isle', 11, 16, 'up'] });

Object.assign(Events, {
  // After the story, the ferries run to every island, the FORGOTTEN LIGHTHOUSE included.
  *boatMenu(here) {
    const clear = State.flag('game_clear');
    const places = [['marshland', 'MARSHLAND'], ['grove', 'MYSTIC GROVE']];
    if (State.flag('grove_done')) places.push(['starfall', 'STARFALL']);
    if (State.flag('countermelody')) places.push(['seabreeze', 'SEABREEZE']);
    if (clear) places.push(['shrine', 'SUNKEN SHRINE'], ['league', 'AIMON LEAGUE'], ['lighthouse', 'LIGHTHOUSE']);
    const opts = places.filter(([id]) => id !== here);
    const ask = clear ? 'Where would you like to sail?' : 'NERISSA: Where to?';
    const i = yield* Dialog.ask(ask, [...opts.map((o) => o[1]), 'STAY'], { cancel: opts.length, visible: Math.min(6, opts.length + 1) });
    if (i < 0 || i >= opts.length) {
      yield* say(clear ? 'The ferry bobs gently at the pier.' : 'NERISSA: I\'ll be right here when you need me.');
      return;
    }
    const to = opts[i][0];
    if (to === 'lighthouse') yield* this.sail(to, ['The ferry sailed west into the night, past the last of the islands...', '...until a single light swept across the dark water ahead.']);
    else yield* this.sail(to);
  },

  // ================================================================ The BATTLE TOWER
  *towerDesk(npc) {
    OW.faceTowards(npc, OW.player);
    const t = Tower.rec();
    if (!State.flag('tower_intro')) {
      State.setFlag('tower_intro');
      yield* say('RECEPTIONIST: Welcome to the BATTLE TOWER! We opened the day the new CHAMPION was crowned. That\'s you!');
      yield* say('RECEPTIONIST: Here, you battle one trainer after another. Every win adds to your streak. One loss, and it\'s back to zero.');
      yield* say('RECEPTIONIST: And for long streaks, we have some very special prizes...');
    }
    yield* say(`RECEPTIONIST: Your current streak is ${t.streak}. Your best ever is ${t.best}.`);
    for (;;) {
      const i = yield* Dialog.ask('RECEPTIONIST: Would you like to take the challenge?', ['CHALLENGE', 'RULES', 'PRIZES', 'CANCEL'], { cancel: 3 });
      if (i === 0) {
        yield* this.towerChallenge();
        return;
      }
      if (i === 1) {
        yield* say('RECEPTIONIST: Your AIMON are healed before every battle. Each challenger brings more AIMON, and stronger ones, the longer your streak.');
        yield* say('RECEPTIONIST: You can take a rest between battles whenever you like. Your streak will be waiting. Only a loss ends it.');
        continue;
      }
      if (i === 2) {
        yield* say('RECEPTIONIST: 5 wins in a row: the VICTORY OUTFIT, your own clothes in black and gold.');
        yield* say('RECEPTIONIST: 10 wins: a real TEAM DISTORTION cloak, recovered from the SONANCE TOWER.');
        yield* say('RECEPTIONIST: 20 wins: the CONDUCTOR\'s own coat. SILVERFALL CITY donated it. They didn\'t want it anymore.');
        yield* say('RECEPTIONIST: Put them on from the KEY ITEMS pocket of your BAG!');
        continue;
      }
      yield* say('RECEPTIONIST: We\'ll be here. The TOWER never closes!');
      return;
    }
  },

  *towerBoard() {
    const t = Tower.rec();
    const got = TOWER_PRIZES.filter(([, id]) => State.count(id)).length;
    yield* say(`BATTLE TOWER RECORDS\n{PLAYER}: current streak ${t.streak}, best ${t.best}.`);
    yield* say(`Prizes won: ${got} of ${TOWER_PRIZES.length}.`);
  },

  *towerChallenge() {
    const p = OW.player;
    yield* say('RECEPTIONIST: Right this way! The lift will take you up to the battle room.');
    State.healParty();
    yield* Game.fadeOut(24);
    OW.loadMap('tower_room', 5, 6, 'up');
    yield* Game.fadeIn(24);
    for (;;) {
      const t = Tower.rec();
      State.healParty();
      const foe = Tower.foe(t.streak);
      yield* say(`ANNOUNCER: Battle number ${t.streak + 1}! Here comes your challenger!`);
      Sound.sfx('door');
      const e = OW.spawn({ id: 'tw_foe', person: foe.person, x: 5, y: 3, dir: 'down' });
      yield* OW.walkTo(e, 5, 4);
      p.dir = 'up';
      yield* say(`${foe.cls} ${foe.name}: ${foe.intro}`);
      const res = yield* this.battle({ trainer: 'tower' });
      if (res !== 'win') {
        t.streak = 0;
        OW.despawn(e);
        yield* say('ANNOUNCER: And the streak ends there! What a run. Come back and try again any time!');
        yield* this.towerLeave();
        return;
      }
      t.streak++;
      t.best = Math.max(t.best, t.streak);
      yield* OW.walkTo(e, 5, 3);
      Sound.sfx('door');
      OW.despawn(e);
      yield* say(`ANNOUNCER: That's ${t.streak} win${t.streak === 1 ? '' : 's'} in a row!`);
      for (const [n, id] of TOWER_PRIZES) {
        if (t.streak < n || State.count(id)) continue;
        yield* say(`ANNOUNCER: ${n} wins in a row! That earns a very special prize!`);
        yield* this.receive(id, 1);
        yield* say(`${ITEMS[id].name} was put in the KEY ITEMS pocket. Use it from the BAG to wear it!`);
      }
      const i = yield* Dialog.ask('ANNOUNCER: Ready for the next challenger?', ['NEXT BATTLE', 'TAKE A REST'], { cancel: 1 });
      if (i !== 0) {
        yield* say('ANNOUNCER: A well-earned rest! Your streak will be waiting for you.');
        yield* this.towerLeave();
        return;
      }
    }
  },

  *towerLeave() {
    yield* Game.fadeOut(24);
    State.healParty();
    OW.loadMap('tower_lobby', 3, 4, 'up');
    yield* Game.fadeIn(24);
  },

  // ================================================================ The FORGOTTEN LIGHTHOUSE
  *flFerry(npc) {
    if (npc && npc.def && npc.def.person) OW.faceTowards(npc, OW.player);
    yield* say('SAILOR: Lonely little rock, isn\'t it? The ferry\'s ready whenever you are.');
    yield* this.boatMenu('lighthouse');
  },

  *flArrive() {
    if (State.flag('fl_met') || OW.busy > 1) return;
    const p = OW.player;
    const v = OW.npc('fl_vesper0');
    yield* OW.walkTo(p, 11, 10);
    p.dir = 'up';
    yield* say('The FORGOTTEN LIGHTHOUSE. For thirty years it stood dark on this rock. Tonight its beam sweeps slowly across the black sea.');
    yield* say('Someone in a long coat is sitting on the step by the door, reading by the light of the lamp.');
    if (v) {
      v.emote = 30;
      v.dir = 'down';
    }
    Sound.sfx('exclaim');
    yield 30;
    yield* say('VESPER: Well, well. The CHAMPION, on my little rock. Come to check up on the parolee?');
    yield* say('VESPER: The WARDENS gave me a choice. A cell in GRAYHAVEN, or this lighthouse. Nobody had lit it in thirty years.');
    yield* say('VESPER: I said yes before HOLT finished the sentence.');
    yield* say('VESPER: I light it at dusk and put it out at dawn. In between, I read. I write a little. It\'s quiet here. I like quiet now. ...Mostly.');
    yield* say('VESPER: Except for one thing. Every night, at midnight exactly, the light goes out. For one minute. Then it comes back on by itself.');
    yield* say('VESPER: I\'ve checked the lamp, the oil, the clockwork. Nothing is broken. Something puts it out.');
    yield* say('VESPER: It\'s nearly midnight now. Come up to the lamp room. If it\'s a ghost, I want a witness.');
    yield* say('VESPER: ...And if it isn\'t a ghost, I want a CHAMPION.');
    State.setFlag('fl_met');
    Sound.sfx('door');
    if (v) OW.despawn(v);
    yield* say('VESPER went inside.');
  },

  *flVesper(npc) {
    OW.faceTowards(npc, OW.player);
    if (!State.flag('fl_ghost_done')) {
      yield* say('VESPER: The stairs are just there. It\'s almost midnight.');
      yield* say('VESPER: The old keeper\'s logbook is on the desk, if you want to know what kind of place this is.');
      return;
    }
    if (!State.flag('morrow_done')) {
      yield* say('VESPER: HOURGHAST sits by the lamp all night now. It doesn\'t put the light out anymore. It just... watches it turn.');
      yield* say('VESPER: Every page of that logbook is signed "M." I keep thinking about a man with an hourglass.');
    } else {
      yield* say('VESPER: Two keepers now. He winds the clock, I read to the HOURGHAST. It\'s almost like a family.');
      yield* say('VESPER: Don\'t tell anyone I said that.');
    }
    const yes = yield* Dialog.yesNo('VESPER: Want to hear how loud I can still be?');
    if (!yes) {
      yield* say('VESPER: Suit yourself. The light will be on when you come back.');
      return;
    }
    const res = yield* this.battle({ trainer: 'vesperR' });
    if (res === 'win') yield* say('VESPER: Ha. Some things don\'t change. Come back soon, CHAMPION.');
  },

  *flLogbook() {
    State.setFlag('fl_log');
    yield* say('An old logbook, thick with salt. The same neat handwriting fills every page:\n"Lamp lit at dusk. Out at dawn. Never late. (M.)"');
    yield* say('...The same line, night after night, for eleven years. Near the end, the entries change:');
    yield* say('"The gear in the lamp is sticking. I have sent to SEABREEZE for a new one. Until it comes, I will wind it by hand. (M.)"');
    yield* say('"The storm. The gear jammed. I climbed. One minute. It was only one minute. (M.)"');
    yield* say('The next pages have been torn out. On the very last page, a single line:\n"I cannot keep this light. (M.)"');
  },

  *flMemorial() {
    yield* say('A weathered stone faces the sea. The carving reads:\n"IN MEMORY OF THE FERRY LARK AND ALL ABOARD. LOST IN THE GREAT STORM."');
    if (State.flag('morrow_done')) yield* say('Fresh flowers have been left at its foot, and a small hourglass, its sand still falling.');
  },

  *flLamp() {
    if (State.flag('fl_ghost_done')) yield* say('The great lamp turns slowly and steadily, sweeping its light across the sea.');
    else yield* say('The great lamp turns slowly. Its clockwork ticks. Everything seems to be in perfect order.');
  },

  *flGhostTalk() {
    Sound.cry('hourghast');
    if (State.flag('morrow_done')) yield* say('HOURGHAST floats beside MORROW. Its sand falls slowly and steadily, the right way down.');
    else yield* say('HOURGHAST sits by the lamp, watching it turn. It isn\'t counting the minutes anymore.');
  },

  // Midnight in the lamp room.
  *flMidnight() {
    const p = OW.player;
    const def = OW.map.def;
    const v = OW.spawn({ id: 'fl_v_t', person: 'vesper', x: 7, y: 6, dir: 'left' });
    yield* OW.walk(p, 'down', 1);
    yield* OW.walkTo(p, 4, 6);
    p.dir = 'up';
    yield* say('The lamp room. The great lamp turns slowly, throwing its beam far out across the sea.');
    OW.faceTowards(v, p);
    yield* say('VESPER: There you are. Thirty seconds to midnight.');
    v.dir = 'left';
    yield 40;
    for (let i = 0; i < 3; i++) {
      Sound.sfx('bell');
      yield 45;
    }
    yield* say('Somewhere below, an old clock chimes midnight...');
    State.setFlag('fl_dark');
    def.dark = 0.8;
    Sound.sfx('wind');
    Game.shake = 8;
    yield* say('The light went out!');
    const ghost = OW.spawn({ id: 'fl_ghost_t', prop: 'mon:hourghast', x: 5, y: 5 });
    for (let i = 0; i < 10; i++) {
      ghost.hidden = i % 2 === 0;
      yield 4;
    }
    ghost.hidden = false;
    Sound.cry('hourghast');
    yield* say('A ghostly HOURGHAST drifts out of the dark lamp. The sand inside it is pouring upward.');
    yield* say('VESPER: There. Do you see it? It\'s turning its own sand over. Again and again. As if it\'s trying to wind something back.');
    Sound.cry('hourghast');
    Game.shake = 10;
    yield* say('The HOURGHAST shrieked and flew at {PLAYER}!', { auto: 40 });
    const res = yield* this.battle({ wild: { species: 'hourghast', level: 62 }, bound: true });
    const relight = () => {
      State.setFlag('fl_dark', false);
      def.dark = null;
    };
    if (res === 'lose') {
      relight();
      return;
    }
    if (res === 'run') {
      OW.despawn(ghost);
      relight();
      yield* say('The HOURGHAST faded back into the lamp. A minute later, the light came back on by itself.');
      yield* say('VESPER: ...Same time tomorrow, then. Come back up whenever you\'re ready.');
      OW.despawn(v);
      return;
    }
    yield* say('The HOURGHAST sank to the floor. The sand inside it stopped.');
    yield* OW.walkTo(v, 6, 5);
    v.dir = 'left';
    yield* say('VESPER knelt beside it and began to hum: a low, slow song, the kind you sing to someone who can\'t sleep.');
    for (const f of [392, 330, 294, 262, 294, 330, 262]) {
      Sound.chime(f);
      yield 26;
    }
    yield* say('Slowly, the HOURGHAST\'s sand began to fall again. The right way down.');
    relight();
    Sound.sfx('confirm');
    yield* say('With a soft click, the great lamp came back on.');
    OW.faceTowards(v, p);
    yield* say('VESPER: It isn\'t haunting the light. It\'s guarding a minute.');
    yield* say('VESPER: The logbook downstairs. The old keeper was late one night, just one minute, the night of the great storm. This HOURGHAST was his.');
    yield* say('VESPER: It\'s been living that same minute over and over for thirty years, trying to turn it back.');
    yield* say('VESPER: ...I know a little about being stuck on the worst minute of your life.');
    yield* say('VESPER: It can stay. We\'ll keep the light together. I\'m not great company. But I\'m learning.');
    yield* say('VESPER: Here. My old signature move. I don\'t need to be that loud anymore.');
    yield* this.receive('tm09', 1);
    yield* say('VESPER: Every page of that logbook is signed "M." ...I know someone who signs everything that way.');
    yield* say('VESPER: A man with an hourglass.');
    State.setFlag('fl_ghost_done');
    OW.despawn(ghost);
    yield* OW.walkTo(v, 2, 3);
    OW.despawn(v);
    Sound.sfx('exit');
    OW.refreshNpcs();
    if (State.flag('hg_note3') && !State.flag('morrow_done')) {
      yield 40;
      yield* this.flMorrow();
    }
  },

  // MORROW comes home.
  *flMorrow() {
    const p = OW.player;
    if (p.x === 2 && p.y === 2) {
      yield* OW.walk(p, 'down', 1);
      yield* OW.walkTo(p, 4, 6);
    }
    p.dir = 'up';
    yield* say('Midnight. Somewhere below, the old clock begins to chime...');
    for (let i = 0; i < 3; i++) {
      Sound.sfx('bell');
      yield 45;
    }
    yield* say('...and this time, the light stays on.');
    yield* say('Slow footsteps climb the stairs.');
    const m = OW.spawn({ id: 'fl_m_t', person: 'morrow', x: 2, y: 3, dir: 'down' });
    yield* OW.walkTo(m, 6, 6);
    OW.faceTowards(m, p);
    OW.faceTowards(p, m);
    yield* say('MORROW: Midnight. And the light is still burning.');
    yield* say('MORROW: She lights it on time, every night. In the end, I never could.');
    yield* say('MORROW: Good evening, child. You followed the sand. I hoped someone would.');
    yield* say('MORROW: Thirty years ago, I was the keeper of this lighthouse. Eleven years, and never once late.');
    yield* say('MORROW: Then one stormy night, the gear jammed, and I climbed the stairs to wind it by hand. The light came on one minute late.');
    yield* say('MORROW: The ferry LARK was already on the rocks. My brother was aboard. They found everyone... but him.');
    yield* say('MORROW: So I left. The lamp, the island... and my HOURGHAST, sitting right there by the light. It wouldn\'t come. It was waiting for that minute to come back.');
    const h = OW.npc('fl_hourghast');
    Sound.cry('hourghast');
    if (h) yield* OW.walkTo(h, 6, 5);
    yield* say('The HOURGHAST drifted up from its place by the lamp... and settled against MORROW\'s shoulder.');
    yield 30;
    yield* say('MORROW: ...You waited. Thirty years, and you waited.');
    yield 30;
    OW.faceTowards(m, p);
    yield* say('MORROW: When the CONDUCTOR told me every lost voice still sings beyond the RIFT, I thought: one minute. Give me back one minute. That was all I ever wanted from him.');
    yield* say('MORROW: You showed me there was nothing behind that door. So I followed my own sand, back to where it started.');
    yield* say('MORROW: Time is on no one\'s side, child. It simply goes. The trick is to go with it.');
    yield* say('MORROW: Now. Indulge an old man. One last battle, for the sake of good timing.');
    const res = yield* this.battle({ trainer: 'morrowR' });
    if (res !== 'win') return;
    yield* say('MORROW: I made these from the glass of the old lamp. The longer you wait, the better they work.');
    yield* this.receive('sandglassball', 5);
    yield* say('MORROW: Patience, child. It\'s the only thing I ever got right.');
    yield* say('MORROW: VESPER tells me the lighthouse needs a second keeper. Someone who is never late.');
    yield* say('MORROW: I think I\'ll stay. My HOURGHAST and I have some time to make up.');
    yield* say('MORROW: Keep the hourglass. The sand falls freely now.');
    State.setFlag('morrow_done');
    yield* OW.walkTo(m, 8, 6);
    OW.despawn(m);
    OW.refreshNpcs();
    const mm = OW.npc('fl_morrow');
    if (mm) mm.dir = 'left';
  },

  *flMorrowTalk(npc) {
    OW.faceTowards(npc, OW.player);
    yield* say('MORROW: The clock downstairs was eleven seconds fast. I fixed it. VESPER says that is "not the point."');
    const yes = yield* Dialog.yesNo('MORROW: Another battle, child? We have all the time in the world.');
    if (!yes) {
      yield* say('MORROW: Then another time. There will be one.');
      return;
    }
    const res = yield* this.battle({ trainer: 'morrowR' });
    if (res === 'win') yield* say('MORROW: Right on time. As always.');
  },

  // -- The hourglass left at the SUNKEN SHRINE ---------------------------------------------------
  *hourglassNote(npc) {
    yield* say('An hourglass stands where MORROW vanished. The sand is frozen halfway down.');
    yield* say('A note is tucked beneath it, in neat, old-fashioned handwriting:\n"Time will tell. (M.)"');
    const yes = yield* Dialog.yesNo('Take the hourglass?');
    if (!yes) return;
    State.setFlag('hg_taken');
    OW.despawn(npc);
    yield* this.receive('hourglass', 1, 'took');
    yield* say('The sand shivered, as if it had somewhere it wanted to be.\f(USE the HOURGLASS from the KEY ITEMS pocket to see where it leads.)');
  },

  *hourglassGlint(npc) {
    const n = npc.def.note;
    Sound.sfx('pad');
    yield* say('The HOURGLASS in {PLAYER}\'s bag grows warm... and the sand begins to fall!');
    yield* say('Something is tucked into a crack where MORROW once stood: a folded note.');
    yield* say(HOURGLASS_NOTES[n]);
    State.setFlag(`hg_note${n}`);
    OW.despawn(npc);
    if (n === 3) yield* say('The sand in the HOURGLASS settles... pointing west, across the sea, toward the FORGOTTEN LIGHTHOUSE.');
    else yield* say('The sand stops again, halfway down. It wants to go somewhere else.');
  },
});

Events.flArrive.when = () => !State.flag('fl_met');
Events.flMidnight.when = () => State.flag('fl_met') && !State.flag('fl_ghost_done');
Events.flMorrow.when = () => State.flag('fl_ghost_done') && State.flag('hg_note3') && !State.flag('morrow_done');
