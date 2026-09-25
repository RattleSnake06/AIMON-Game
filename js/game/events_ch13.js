'use strict';
// Chapters 13 to 15: the WARDENS' rally and the SUNKEN SHRINE (the finale
// against TEAM DISTORTION and the CHAMPION'S OATH), the VICTORY PATH and the
// AIMON LEAGUE, then the credits, the epilogue and everything after.

// The chord of the eight KEYSTONES, low to high, in KEYSTONE order.
const OATH_CHORD = [130.8, 196.0, 261.6, 329.6, 392.0, 523.3, 659.3, 784.0];
const OATH_RING = [
  ['holt', 'HOLT', 'RIFTSTONE', 6, 2, 'down'],
  ['ivy', 'IVY', 'ROOTSTONE', 10, 2, 'down'],
  ['nerissa', 'NERISSA', 'TIDESTONE', 13, 5, 'left'],
  ['tor', 'TOR', 'CRAGSTONE', 13, 8, 'left'],
  ['sahra', 'SAHRA', 'DUNESTONE', 10, 11, 'up'],
  ['wren', 'WREN', 'MILLSTONE', 6, 11, 'up'],
  ['cantor', 'CANTOR', 'BELLSTONE', 3, 8, 'right'],
  ['nox', 'NOX', 'STARSTONE', 3, 5, 'right'],
];
const E4 = ['shade', 'brawn', 'cindra', 'marina', 'champkai'];

Object.assign(Events.sailDest, {
  seabreeze: ['seabreeze', 18, 18, 'up'],
  shrine: ['shrine1', 11, 23, 'up'],
  league: ['league', 10, 15, 'up'],
  victory: ['victory2', 11, 20, 'up'],
});

Object.assign(Events, {
  keyLit: null,

  // ---------------------------------------------------------------- Boats and ferries
  *boatMenu(here) {
    const clear = State.flag('game_clear');
    const places = [['marshland', 'MARSHLAND'], ['grove', 'MYSTIC GROVE']];
    if (State.flag('grove_done')) places.push(['starfall', 'STARFALL']);
    if (State.flag('countermelody')) places.push(['seabreeze', 'SEABREEZE']);
    if (clear) places.push(['shrine', 'SUNKEN SHRINE'], ['league', 'AIMON LEAGUE']);
    const opts = places.filter(([id]) => id !== here);
    const ask = clear ? 'Where would you like to sail?' : 'NERISSA: Where to?';
    const i = yield* Dialog.ask(ask, [...opts.map((o) => o[1]), 'STAY'], { cancel: opts.length });
    if (i < 0 || i >= opts.length) {
      yield* say(clear ? 'The ferry bobs gently at the pier.' : 'NERISSA: I\'ll be right here when you need me.');
      return;
    }
    yield* this.sail(opts[i][0]);
  },

  *starfallBoat(npc) {
    if (npc && npc.def && npc.def.person) OW.faceTowards(npc, OW.player);
    if (State.flag('shrine_done')) {
      yield* this.boatMenu('starfall');
      return;
    }
    if (State.flag('countermelody')) yield* say('NERISSA: The sea\'s gone violet all the way to the horizon. HOLT\'s calling everyone to SEABREEZE.');
    else if (!State.flag('badge_star')) yield* say('NERISSA: NOX is somewhere in that observatory. I\'ll keep the GUST ready in case we need to leave in a hurry.');
    yield* this.boatMenu('starfall');
  },

  // After the story, SEABREEZE's ferries run to every island.
  *ferryTalkPost() {
    yield* say('SAILOR: The ferries are running again! Every island in VALEMORA, and the LEAGUE besides.');
    yield* this.boatMenu('seabreeze');
  },

  // ---------------------------------------------------------------- CRAGMOOR: the VICTORY PATH gate
  *vpGuard(npc) {
    OW.faceTowards(npc, OW.player);
    if (State.flag('countermelody')) {
      yield* say('GUARD: With the sky like this? The LEAGUE has shut its doors until the WARDENS say it\'s safe.');
      yield* say('GUARD: Word is they\'re gathering at SEABREEZE PORT. If anyone can fix this, it\'s them.');
      return;
    }
    yield* say('GUARD: This is the VICTORY PATH, the road through BRAMBLEWOOD FOREST to the AIMON LEAGUE.');
    yield* say(`GUARD: Only trainers with all eight BADGES may pass. You have ${State.badgeCount()}.`);
    yield* say('GUARD: Come back when your BADGE case is full. The LEAGUE will still be here.');
  },

  // ================================================================ CHAPTER 13: THE SUNKEN SHRINE
  // -- SEABREEZE: the WARDENS rally ---------------------------------------------------------------
  *rallyScene() {
    if (State.flag('rally_done') || OW.busy > 1) return;
    State.setFlag('rally_done');
    const p = OW.player;
    const face = (id) => {
      const e = OW.npc(`sb_r_${id}`);
      if (e) OW.faceTowards(e, p);
    };
    yield* OW.walkTo(p, 19, 16);
    p.dir = 'down';
    yield* say('The docks are crowded under the violet sky. Every WARDEN in VALEMORA is here.');
    face('nerissa');
    yield* say('NERISSA: There you are, {PLAYER}! Look who answered HOLT\'s call.');
    yield* say('HOLT: {PLAYER}. Every AIMON from here to STONEPEAK has stopped singing. Mine included.');
    yield* say('HOLT: The CONDUCTOR is at the SUNKEN SHRINE, playing all eight songs backwards. The seal is coming undone, one note at a time.');
    yield* say('IVY: My cedar went quiet this morning. Not wilted. Just... quiet. I\'ve never been so scared of silence.');
    yield* say('TOR: Then we go make some noise! My crew\'s got shovels, and I\'ve got a boulder with the CONDUCTOR\'s name on it.');
    yield* say('SAHRA: The FIRST SCORE is clear. "Eight voices, one song, forward, together." The WARDENS form the ring.');
    yield* say('SAHRA: "And the one who carries all eight sings last." That\'s you.');
    yield* say('WREN: And the MILLSTONE\'s still spinning! He never got its song. Whatever he\'s playing, it\'s got a hole in it.');
    yield* say('CANTOR: The BELLSTONE, too. MORROW caught half a note. August always did rush the difficult passages.');
    yield* say('NOX: Which is why he needs your BADGES. When he plays, they\'ll answer him. Keep them close.');
    face('linden');
    yield* say('PROF. LINDEN: {PLAYER}! I, er, brought supplies. Your mother packed the sandwiches. I packed these.');
    yield* this.receive('maxpotion', 3);
    yield* say('PROF. LINDEN: I study AIMON. I don\'t fight beside them. But I wasn\'t going to wait at home.');
    face('vesper');
    yield* say('VESPER: Don\'t look at me like that, kid. I know the shrine\'s halls. I helped plan the "performance."');
    yield* say('HOLT: She freed NOX. That buys her a place on the boat. Not a place at my back.');
    yield* say('VESPER: Fair.');
    yield* say('VESPER: The CONDUCTOR will be at the heart of the shrine. MORROW will be somewhere in between. And the inner door...');
    yield* say('VESPER: The COMMANDER guards the inner door. He always does.');
    face('kai');
    yield* say('KAI: ...Ryker.');
    yield* say('KAI: Then I\'m coming. Don\'t even try to stop me.');
    yield* say('NERISSA: Then that\'s everyone. The GUST is small, but she\'s fast, and she\'s never lost a crew.');
    yield* this.rallyAsk();
  },

  *rallyAsk() {
    const yes = yield* Dialog.yesNo('NERISSA: Ready to sail for the SUNKEN SHRINE?');
    if (!yes) {
      yield* say('NERISSA: Rest up. Stock up. We\'re not going anywhere without you.');
      return;
    }
    yield* this.sailShrine();
  },

  *rallyTalk(npc) {
    if (!State.flag('rally_done')) {
      yield* this.rallyScene();
      return;
    }
    OW.faceTowards(npc, OW.player);
    const lines = {
      nerissa: null,
      holt: 'HOLT: The OATH was sworn three hundred years ago. It\'s never been kept. Not once. Let\'s be the first.',
      tor: 'TOR: Ready when you are. Well. I\'ve been ready since yesterday.',
      ivy: 'IVY: Whatever happens at the shrine, we\'ll be right there with you. All eight of us.',
      sahra: 'SAHRA: I\'ve spent my life digging up the FIRST SCORE. I never thought I\'d get to hear it played.',
      wren: 'WREN: I brought spare batteries. For the boat. And for courage.',
      cantor: 'CANTOR: August was my student. Whatever he\'s become, I taught him to play. I\'ll be there when he stops.',
      nox: 'NOX: The stars went out over STARFALL. I want them back.',
      prof: 'PROF. LINDEN: Those MAX POTIONS will restore every bit of an AIMON\'s HP. Use them well!',
      rival: 'KAI: ...I keep thinking about what I\'ll say to him. Nothing sounds right.',
      vesper: 'VESPER: Relax, kid. If I wanted to betray you, I\'d have done it somewhere with better lighting.',
    };
    const line = lines[npc.def.person];
    if (line) {
      yield* say(line);
      return;
    }
    yield* this.rallyAsk();
  },

  // SEABREEZE, while everyone is at the shrine: NERISSA runs the GUST back and forth.
  *sbGust(npc) {
    OW.faceTowards(npc, OW.player);
    yield* say('NERISSA: Rested? The WARDENS are holding the shrine. They won\'t hold it forever.');
    const yes = yield* Dialog.yesNo('NERISSA: Back to the SUNKEN SHRINE?');
    if (yes) yield* this.sail('shrine', ['The GUST raced back south, through the violet water...']);
    else yield* say('NERISSA: Don\'t take too long.');
  },

  *sailShrine() {
    Sound.sfx('confirm');
    yield* Game.fadeOut(30);
    yield* this.blackCard([
      'The GUST sailed south through violet water.',
      'No gulls called. No AIMON surfaced. The only sound was the wind in the sails.',
      'Then, out of the haze, the SUNKEN SHRINE rose ahead of them...',
    ]);
    State.setFlag('shrine_sailed');
    OW.loadMap('shrine1', 11, 23, 'up');
    const holt = OW.spawn({ id: 's1_holt_t', person: 'holt', x: 11, y: 21, dir: 'down' });
    const kai = OW.spawn({ id: 's1_kai_t', person: 'rival', x: 10, y: 21, dir: 'down' });
    const tor = OW.spawn({ id: 's1_tor_t', person: 'tor', x: 12, y: 21, dir: 'down' });
    yield* Game.fadeIn(30);
    yield* say('The WARDENS leapt from the GUST onto the broken causeway.');
    yield* OW.walk(OW.player, 'up', 1);
    yield* say('HOLT: Listen up! We hold this place in pairs, the way the first WARDENS did.');
    yield* say('HOLT: TOR and I take the gate. IVY and SAHRA, the flooded stairs. WREN and NOX, the pillar hall. CANTOR, the bell.');
    yield* say('TOR: Whatever TEAM DISTORTION has left, it\'s not getting past us.');
    yield* say('HOLT: You go deeper, {PLAYER}. You and those BADGES. When the time comes, we\'ll find you.');
    OW.faceTowards(kai, OW.player);
    yield* say('KAI: I\'m going to help clear the way. Then I\'m finding Ryker.');
    yield* say('KAI: Don\'t wait for me. I\'ll catch up. I always do.');
    yield* Game.fadeOut(24);
    for (const e of [holt, kai, tor]) OW.despawn(e);
    OW.refreshNpcs();
    yield* Game.fadeIn(24);
    yield* say('The WARDENS took their posts. Far above, the shrine\'s gate glowed violet.');
  },

  *shrineBoat(npc) {
    if (npc && npc.def && npc.def.person) OW.faceTowards(npc, OW.player);
    if (State.flag('shrine_done')) {
      yield* this.boatMenu('shrine');
      return;
    }
    yield* say('NERISSA: I\'ll keep the GUST ready. If you need to rest, I can run you back to SEABREEZE and straight back here.');
    const yes = yield* Dialog.yesNo('NERISSA: Head back to SEABREEZE for now?');
    if (yes) yield* this.sail('seabreeze', ['The GUST slipped away north, through the violet water...']);
    else yield* say('NERISSA: Then go get him, {PLAYER}.');
  },

  *shrineVesper(npc) {
    OW.faceTowards(npc, OW.player);
    yield* say('VESPER: I\'ll stay with the boat. Somebody has to make sure there\'s a way home.');
    yield* say('VESPER: The shrine\'s stairs flood every time he plays. Ride the currents. Don\'t fight them.');
  },

  *shrineWarden(npc) {
    OW.faceTowards(npc, OW.player);
    const lines = {
      holt: 'HOLT: Nothing gets through this gate while I\'m standing. Go on.',
      tor: 'TOR: Ha! Let \'em come. I\'ve moved bigger problems than a few black coats.',
      ivy: 'IVY: Ride the side currents across, then climb where the stone\'s dry. If the torrent catches you, it only washes you back down a level!',
      sahra: 'SAHRA: These stairs are older than SUNSPIRE. Older than anything I\'ve ever dug up. Try not to fall down them.',
      wren: 'WREN: VOLTVIX has the pillars lit up like a barn dance. Nobody\'s sneaking past us!',
      nox: 'NOX: It\'s dark in here. Good. The dark is where I\'m strongest.',
      cantor: 'CANTOR: When the bell rings, the water listens. The stairs down to the inner hall are just there. Go, child.',
    };
    yield* say(lines[npc.def.person] || '...');
  },

  // -- The outer halls -------------------------------------------------------------------------------
  *shrineStairs() {
    State.setFlag('s2_stairs');
    const p = OW.player;
    yield* say('Water pours down the shrine\'s great stairs in a roaring torrent.');
    const sahra = OW.npc('s2_sahra');
    const ivy = OW.npc('s2_ivy');
    if (sahra) OW.faceTowards(sahra, p);
    if (ivy) OW.faceTowards(ivy, p);
    yield* say('SAHRA: {PLAYER}! The shrine\'s flooding from the inside. Every time that cello plays, more water comes down those stairs.');
    yield* say('IVY: My vines are holding the steps together, and SAHRA\'s AIMON raised the dry ones. Ride the side currents across and climb where the stone is dry.');
    yield* say('IVY: If the torrent catches you, it\'ll only wash you back down a level. You can do this!');
    yield* say('SAHRA: We\'ll hold the stairs. Go!');
    if (sahra) sahra.dir = 'up';
    if (ivy) ivy.dir = 'up';
  },

  *shrinePillars() {
    State.setFlag('s2_pillars');
    const p = OW.player;
    const wren = OW.npc('s2_wren');
    const nox = OW.npc('s2_nox');
    if (wren) OW.faceTowards(wren, p);
    yield* say('WREN: You made it up! Nice riding, {PLAYER}!');
    if (nox) OW.faceTowards(nox, p);
    yield* say('NOX: Careful. One of them is still hiding somewhere among the pillars.');
    yield* say('WREN: VOLTVIX and I will keep the hall lit. NOX will watch the shadows. CANTOR\'s up by the old bell.');
  },

  *shrineBell() {
    State.setFlag('s2_bell');
    const p = OW.player;
    const cantor = OW.npc('s2_cantor');
    yield* say('Up ahead, CANTOR raises a mallet to an ancient bell.');
    Sound.sfx('bell');
    Game.shake = 10;
    yield 40;
    yield* say('Its deep note rolls down the stairs. For a moment, even the torrent seems to listen.');
    if (cantor) OW.faceTowards(cantor, p);
    yield* say('CANTOR: The first WARDENS hung this bell. It remembers the true chord, even if nothing else in this place does.');
    yield* say('CANTOR: August is below, at the heart of the shrine. {PLAYER}... he was a gentle boy once. Remember that, whatever he says.');
    yield* say('CANTOR: The stairs to the inner hall are just there. Go. I\'ll keep ringing.');
    if (cantor) cantor.dir = 'left';
  },

  *shrineBellInspect() {
    yield* say('An ancient bronze bell, green with age. The KEYSTONES\' eight colors are set into its rim.');
  },

  // -- The inner hall: MORROW, for the last time -------------------------------------------------------
  *morrowFinal() {
    if (State.flag('beat_morrow4') || OW.busy > 1) return;
    const p = OW.player;
    const morrow = OW.npc('s3_morrow');
    if (!morrow) return;
    yield* OW.walkTo(p, 7, 12);
    p.dir = 'up';
    yield* say('MORROW stands in the middle of the hall, turning his hourglass over, and over, and over.');
    yield* say('MORROW: Tick. Tock. Right on time, child. Of course you are.');
    yield* say('MORROW: Six stones and a half in the CONDUCTOR\'s tanks. And the rest, walking in through the front door, in your pocket.');
    yield* say('MORROW: I have watched every one of your battles. The cave. The tower. The bell. The stars. I always knew how they would end.');
    yield* say('MORROW: This one, I confess, I cannot see.');
    yield* say('MORROW: So. One last hour. Let us find out whose it is.');
    const res = yield* this.battle({ trainer: 'morrow4' });
    if (res !== 'win') return;
    State.setFlag('beat_morrow4');
    yield* say('MORROW: ...Ah.');
    yield* say('MORROW held up his hourglass. The last grains of sand ran through.');
    yield 40;
    yield* say('MORROW: It seems your time has come, and mine has passed.');
    yield* say('MORROW: Go on, child. The CONDUCTOR is waiting. It would be rude to keep him.');
    p.dir = 'down';
    yield* say('{PLAYER} glanced back toward the stairs...');
    OW.despawn(morrow);
    yield 30;
    p.dir = 'up';
    yield 20;
    yield* say('...and when {PLAYER} turned around, MORROW was gone. Not a footstep. Not a grain of sand.');
  },

  // -- The inner door: RYKER -----------------------------------------------------------------------------
  *rykerDoor() {
    if (State.flag('ryker_door') || !State.flag('beat_morrow4') || OW.busy > 1) return;
    const p = OW.player;
    const ryker = OW.npc('s3_ryker');
    if (!ryker) return;
    yield* OW.walkTo(p, 7, 8);
    p.dir = 'up';
    yield* say('A tall figure stands before the inner door, arms folded. Violet light spills out from under the door behind him.');
    yield* say('RYKER: So MORROW let you through. He always did like you.');
    yield* say('RYKER: The CONDUCTOR\'s been playing for a day and a night without stopping. His fingers are bleeding. He doesn\'t notice.');
    yield* say('RYKER: I told him I\'d hold this door. So I\'m holding it.');
    yield* say('Footsteps pound across the hall behind you.');
    const kai = yield* this.arrive({ id: 's3_kai_t', person: 'rival' }, p, 'south');
    yield* say('KAI: RYKER!');
    ryker.emote = 30;
    Sound.sfx('exclaim');
    yield 30;
    yield* say('KAI: {PLAYER}. Step aside.');
    yield* say('KAI: This one\'s mine.');
    yield* OW.walk(p, 'left', 1);
    p.dir = 'right';
    yield* OW.walkTo(kai, 7, 8);
    yield* OW.walkTo(kai, 7, 7);
    kai.dir = 'up';
    yield* say('RYKER: Little brother. You really think you can...');
    yield* say('KAI: I don\'t think. I KNOW. I\'ve been chasing you for eight years. Every BADGE. Every battle. Every letter I sent home that you never answered.');
    yield* say('KAI: You don\'t get to hide behind a door anymore. Let\'s go!');
    // The brothers' battle.
    Sound.sfx('ballOpen');
    Sound.cry(State.rivalStarter(64));
    yield 30;
    Sound.sfx('ballOpen');
    Sound.cry('umbrafang');
    yield* say('KAI and RYKER sent out their AIMON!');
    for (let i = 0; i < 4; i++) {
      Sound.sfx(i % 2 ? 'hit' : 'zap');
      Game.shake = 10;
      yield* Game.fadeOut(3, '#ffffff');
      yield* Game.fadeIn(8);
      yield 14;
    }
    yield* say('The battle shook the whole hall. Neither brother gave an inch.');
    for (let i = 0; i < 3; i++) {
      Sound.sfx('hit');
      Game.shake = 12;
      yield* Game.fadeOut(3, '#ffffff');
      yield* Game.fadeIn(8);
      yield 10;
    }
    yield* say('Then RYKER\'s UMBRAFANG stepped into the violet light spilling from under the door...');
    yield* say('...threw back its head to howl...');
    yield 50;
    yield* say('...and made no sound at all.');
    ryker.emote = 30;
    yield 40;
    yield* say('RYKER: ...UMBRAFANG?');
    yield* say('RYKER: Hey. Hey, look at me. Say something.');
    yield* say('UMBRAFANG looked up at RYKER, jaws wide, straining with everything it had. Silence.');
    yield* say('RYKER: ...This is it. This is his "true world." Where every voice still sings.');
    yield* say('RYKER: It isn\'t singing. It\'s the opposite of singing. It\'s nothing.');
    yield* say('RYKER: He\'d take every voice in VALEMORA to hear one that\'s already gone. And I held the door for him.');
    yield 30;
    yield* say('RYKER called his UMBRAFANG back to its ball, very gently.');
    OW.faceTowards(ryker, kai);
    yield* say('RYKER: KAI.');
    yield* say('RYKER: You fight like Dad. Did you know that? Too loud. Never quits.');
    yield* OW.walkTo(ryker, 5, 6);
    ryker.dir = 'right';
    yield* say('RYKER: Go. I\'ll hold the door, little brother.');
    yield* say('RYKER: Nobody comes through this hall behind you. Not while I\'m standing here.');
    yield* say('KAI: ...Ryker.');
    yield* OW.walkTo(kai, 9, 6);
    kai.dir = 'left';
    yield* say('KAI: We\'ll hold it together.');
    OW.faceTowards(kai, p);
    yield* say('KAI: {PLAYER}! What are you waiting for? Go finish it!');
    yield* say('For the first time in eight years, KAI and RYKER stood on the same side.');
    State.setFlag('ryker_door');
    OW.despawn(ryker);
    OW.despawn(kai);
    OW.refreshNpcs();
    Sound.sfx('door');
    yield* say('Behind them, the inner door swung open.');
  },

  *rykerHolds(npc) {
    OW.faceTowards(npc, OW.player);
    if (npc.def.person === 'ryker') yield* say('RYKER: Go on. I\'ve got this door. ...We\'ve got this door.');
    else yield* say('KAI: We\'ve got this! Go, {PLAYER}!');
  },

  // -- The heart of the shrine ------------------------------------------------------------------------------
  *altarInspect() {
    if (State.flag('shrine_done')) {
      yield* say('The ancient altar. Its eight carvings glow softly, one for each KEYSTONE. The air above it is still and calm.');
      return;
    }
    yield* say('An ancient altar, carved with eight symbols. Above it, the violet tear hums.');
  },

  // Play a chord on the KEYSTONE notes; backwards for the COUNTERMELODY.
  *playChord(reverse, gap = 5) {
    const notes = reverse ? OATH_CHORD.slice().reverse() : OATH_CHORD;
    for (const f of notes) {
      Sound.chime(reverse ? f * 0.94 : f);
      yield gap;
    }
  },

  *conductorFinal() {
    if (State.flag('beat_conductor2') || OW.busy > 1) return;
    const p = OW.player;
    const vale = OW.npc('s4_vale');
    if (!vale) return;
    this.keyLit = 8;
    yield* OW.walkTo(p, 8, 9);
    p.dir = 'up';
    yield* say('The heart of the shrine. A violet tear hangs in the air above an ancient altar, ringed by eight ghostly lights.');
    yield* say('Before the altar, a man plays the cello. The notes come out wrong. Backwards. Each one pulls at the air like a tide going out.');
    yield* this.playChord(true, 10);
    yield 30;
    if (!State.flag('vale_met')) {
      State.setFlag('vale_met');
      yield* say('VALE: Six and a half songs in my tanks... and the rest, walking toward me in a little case.');
      vale.dir = 'down';
      yield 20;
      yield* say('VALE: Hello again, child.');
      yield* say('VALE: Listen...');
      yield 60;
      yield* say('VALE: Can\'t you hear? ECHO is singing.');
      yield* say('{PLAYER} listened. There was only silence.');
      yield* say('VALE: The whole world is quieter today. The birds. The AIMON. Even the sea. They\'re all holding their breath, so that we can hear the ones on the other side.');
      yield* say('VALE: And your BADGES are humming. I can hear them from here. The MILLSTONE I never recorded. The BELLSTONE MORROW only half caught. Everything I was missing.');
      yield* say('VALE: I would much rather you gave them to me. But one way or another, they will sing tonight.');
      yield* say('VALE: Come, then. One last duet.');
    } else {
      vale.dir = 'down';
      yield* say('VALE: You came back. Good. The piece isn\'t finished without you.');
    }
    const res = yield* this.battle({ trainer: 'conductor2' });
    if (res !== 'win') return;
    State.setFlag('beat_conductor2');
    yield* this.riftOpens(vale);
  },

  *riftOpens(vale) {
    const p = OW.player;
    yield* say('VALE: ...It doesn\'t matter. The piece is already playing. It plays itself now.');
    Sound.sfx('rumble');
    Game.shake = 60;
    for (let i = 8; i >= 0; i--) {
      this.keyLit = i;
      Sound.chime(OATH_CHORD[Math.max(0, i - 1)] * 0.94);
      yield 8;
    }
    yield* Game.fadeOut(4, '#d8a0ff');
    yield* Game.fadeIn(20);
    yield* say('The violet tear split wide open, with a sound like a thousand strings snapping at once!');
    Game.shake = 40;
    Sound.sfx('wind');
    yield* say('{PLAYER}\'s BADGE case jerked toward the RIFT! The eight slivers inside were being pulled in!');
    vale.dir = 'up';
    yield* say('VALE: ECHO! ECHO, I\'m here! I\'m right here!');
    yield 60;
    yield* say('VALE stared into the RIFT.');
    yield* say('There was nothing on the other side. No song. No ECHO. No first world.');
    yield* say('Only silence, deeper and colder than anything.');
    yield 40;
    yield* say('VALE: ...ECHO?');
    Sound.sfx('bump');
    yield* say('His bow slipped from his fingers and clattered on the stone.');
    Game.shake = 30;
    yield* say('HOLT: {PLAYER}! HOLD ON!');
    // The WARDENS arrive and form the ring.
    yield* Game.fadeOut(20);
    vale.x = 6;
    vale.y = 9;
    vale.dir = 'right';
    p.x = 8;
    p.y = 8;
    p.dir = 'up';
    const ring = OATH_RING.map(([person, , , x, y, dir]) => OW.spawn({ id: `oath_${person}`, person, x, y, dir }));
    yield* Game.fadeIn(20);
    yield* say('The WARDENS burst into the heart of the shrine and spread out around the altar.');
    yield* say('HOLT: Into the ring! Just like the first eight!');
    yield* say('SAHRA: "Eight voices, one song, forward, together..."');
    yield* say('NOX: "...and the one who carries all eight sings last." {PLAYER}! The BADGE case!');
    yield* say('{PLAYER} raised the BADGE case toward the RIFT.');
    for (let i = 0; i < 8; i++) {
      const [, name, stone] = OATH_RING[i];
      ring[i].emote = 30;
      this.keyLit = i + 1;
      Sound.chime(OATH_CHORD[i]);
      yield* say(`${name} hummed the ${stone}'s note.`);
    }
    yield* say('Eight notes, one chord. In the BADGE case, eight slivers of stone sang back.');
    yield* say('And then {PLAYER} sang last.');
    yield* this.playChord(false, 4);
    yield* this.playChord(false, 4);
    yield* Game.fadeOut(40, '#ffffff');
    const rift = OW.npc('s4_rift');
    if (rift) OW.despawn(rift);
    Game.shake = 30;
    yield 40;
    yield* Game.fadeIn(60);
    yield* say('The true song rang out forwards, the way it was always meant to be played.');
    yield* say('The RIFT closed, like an eye falling asleep.');
    Sound.sfx('rumble');
    Game.shake = 50;
    yield* say('With a long, deep groan, the SUNKEN SHRINE settled back into the sea.');
    yield 20;
    const voices = [...State.party.map((m) => m.species), 'pebbeat', 'voltvix', 'bellumor', 'meteorwolf', 'cedarling'];
    for (let i = 0; i < voices.length; i++) {
      Sound.cry(voices[i], 1 + (i % 3) * 0.1);
      yield 8;
    }
    yield* say('And all across VALEMORA, every AIMON cried out at once.');
    const lead = State.party.find((m) => !m.fainted) || State.party[0];
    if (lead) yield* say(`${lead.name} cried out too, loud and bright!`);
    yield* this.shrineAftermath(vale, ring);
  },

  *shrineAftermath(vale, ring) {
    const p = OW.player;
    const cantor = ring[6];
    yield 40;
    yield* say('VALE sank to his knees beside his cello.');
    yield* say('VALE: There was nothing there. Nothing at all.');
    yield* say('VALE: Twenty years building a door... and nothing behind it.');
    yield* OW.walkTo(cantor, 5, 9);
    OW.faceTowards(cantor, vale);
    OW.faceTowards(vale, cantor);
    yield* say('CANTOR: August.');
    yield* say('VALE: Master CANTOR. I... I heard ECHO everywhere. In every bell. Every string. I couldn\'t stop hearing.');
    yield* say('CANTOR: I know. You don\'t stop hearing them, August. You learn to play along.');
    yield* say('VALE: Will you... keep playing ECHO\'s song? The one we wrote, the three of us? I don\'t think I can anymore.');
    yield* say('CANTOR: Every morning, if you like. Loud enough for the bells to hear.');
    const holt = ring[0];
    yield* OW.walkTo(holt, 7, 9);
    OW.faceTowards(holt, vale);
    yield* say('HOLT: AUGUST VALE. You\'ll come with us.');
    yield* say('VALE: Yes. Yes, of course.');
    const vesper = yield* this.arrive({ id: 's4_vesper_t', person: 'vesper' }, p, 'south');
    yield* say('VESPER: Take me too, HOLT.');
    yield* say('VESPER: I recorded the ROOTSTONE. I wrecked the lighthouse. I dug up a city\'s past and sold it. I\'m done running from it.');
    yield* say('HOLT: ...All right.');
    OW.faceTowards(vesper, p);
    yield* say('VESPER: Hey. Kid. That was some song.');
    const ryker = OW.spawn({ id: 's4_ryker_t', person: 'ryker', x: 8, y: 13, dir: 'up' });
    const kai = OW.spawn({ id: 's4_kai_t', person: 'rival', x: 7, y: 13, dir: 'up' });
    yield* OW.walkTo(ryker, 8, 11);
    yield* OW.walkTo(kai, 7, 11);
    yield* say('RYKER: ...And me.');
    yield* say('KAI: Ryker...');
    yield* say('RYKER: I held the door for him, KAI. For a whole year I held every door he asked me to. I don\'t get to just walk home.');
    yield* say('RYKER: ...Not yet.');
    OW.faceTowards(kai, ryker);
    yield* say('KAI: Then I\'ll walk with you. All the way to the boat. And after.');
    yield* Game.fadeOut(40);
    for (const e of [...ring, vesper, ryker, kai]) OW.despawn(e);
    yield* this.blackCard([
      'The WARDENS took AUGUST VALE into custody. VESPER went with them, without handcuffs, by her own choice.',
      'RYKER went too. KAI walked beside him, all the way to the boat.',
      'TEAM DISTORTION was finished.',
      'SILVERFALL CITY took over SONANCE ENERGY, and painted a new motto over the old one on the tower:',
      '"Every city deserves a song."',
      'This time, they meant it.',
    ]);
    State.setFlag('shrine_done');
    this.keyLit = null;
    State.healParty();
    yield* this.leagueCall();
  },

  // ================================================================ CHAPTER 14: THE AIMON LEAGUE
  // SEABREEZE, the morning after.
  *leagueCall() {
    const p = OW.player;
    OW.loadMap('seabreeze', 18, 18, 'down');
    const holt = OW.spawn({ id: 'sb_holt_t', person: 'holt', x: 17, y: 18, dir: 'right' });
    yield* Game.fadeIn(40);
    yield* say('The GUST sailed home under a clear blue sky. Gulls wheeled over SEABREEZE, calling as if they\'d never stop.');
    OW.faceTowards(p, holt);
    yield* say('HOLT: Well. That\'s the OATH kept. First time in three hundred years.');
    yield* say('HOLT: The LEAGUE sent word this morning. With the sky clear, they\'ve opened the VICTORY PATH again. It starts at the south end of CRAGMOOR.');
    yield* say('HOLT: Every CHAMPION in VALEMORA\'s history walked that road with eight BADGES in their pocket. You\'ve got yours.');
    yield* say('HOLT: You carried the Oath, {PLAYER}. Now finish the journey.');
    const kai = yield* this.arrive({ id: 'sb_kai_t', person: 'rival' }, p, 'north');
    yield* say('KAI: {PLAYER}! There you are!');
    yield* say('KAI: Ryker\'s going with the WARDENS to GRAYHAVEN. He said he\'ll come home after. He said "after," {PLAYER}! Not "never." "AFTER"!');
    yield* say('KAI: So I\'ve got time to kill. And you know what that means.');
    yield* say('KAI: Race you to the LEAGUE! Loser buys the POTIONS!');
    yield* OW.walk(kai, 'up', 4, 8);
    OW.despawn(kai);
    yield 20;
    yield* say('KAI was gone before {PLAYER} could answer.');
    OW.faceTowards(holt, p);
    yield* say('HOLT: ...He\'s had a head start his whole life. Doesn\'t seem to help him much.');
    yield* say('HOLT: Go on. CRAGMOOR, then south. And {PLAYER}... thank you.');
    yield* this.leave(holt, 17, 14);
    State.setFlag('league_call');
  },

  // -- BRAMBLEWOOD FOREST -----------------------------------------------------------------------------
  *brambleEnter() {
    yield* Game.fadeOut(16);
    if (State.flag('bramble_known')) {
      OW.loadMap('victory2', 11, 1, 'down');
      yield* Game.fadeIn(16);
      if (!State.flag('bramble_said')) {
        State.setFlag('bramble_said');
        yield* say('{PLAYER} followed the drumming PEBBEAT\'s path straight through the brambles.');
      }
      return;
    }
    State.d.flags.bramble = 0;
    OW.loadMap('bramble', 7, 1, 'down');
    yield* Game.fadeIn(16);
    Sound.cry('pebbeat');
    if (!State.flag('bramble_seen')) {
      State.setFlag('bramble_seen');
      yield* say('The trees close in overhead. Four paths lead out of a small clearing... and they all look exactly the same.');
      yield* say('Ba-dum, ba-dum... Somewhere in the clearing, a PEBBEAT is drumming.');
    }
  },

  *brambleExit(t) {
    const stage = State.d.flags.bramble || 0;
    if (t.exit === 'north' && stage === 0) {
      yield* Game.fadeOut(16);
      OW.loadMap('victory1', 12, 32, 'up');
      yield* Game.fadeIn(16);
      return;
    }
    yield* Game.fadeOut(16);
    if (t.exit === BRAMBLE_ROUTE[stage]) {
      if (stage + 1 >= BRAMBLE_ROUTE.length) {
        State.setFlag('bramble_known');
        State.d.flags.bramble = 0;
        OW.loadMap('victory2', 11, 1, 'down');
        yield* Game.fadeIn(16);
        yield* say('At last the brambles thinned, and the path opened out toward the sea.');
        return;
      }
      State.d.flags.bramble = stage + 1;
      const [x, y, dir] = { north: [7, 12, 'up'], south: [7, 1, 'down'], west: [14, 6, 'left'], east: [1, 6, 'right'] }[t.exit];
      OW.loadMap('bramble', x, y, dir);
      yield* Game.fadeIn(16);
      Sound.cry('pebbeat');
      return;
    }
    State.d.flags.bramble = 0;
    OW.loadMap('bramble', 7, 1, 'down');
    yield* Game.fadeIn(16);
    yield* say('The brambles rustled and shifted behind {PLAYER}...\f...and somehow, this was the clearing where it all started.');
  },

  *brambleBack() {
    yield* Game.fadeOut(16);
    OW.loadMap('victory1', 12, 32, 'up');
    yield* Game.fadeIn(16);
  },

  *vpNurse(npc) {
    OW.faceTowards(npc, OW.player);
    yield* say('NURSE: The LEAGUE sends me out here to look after challengers before the crossing. Let me see your team.');
    yield* this.healJingle();
    yield* say('NURSE: All better! Good luck out there.');
  },

  // -- The LEAGUE ferry ------------------------------------------------------------------------------------
  *leagueFerry(npc) {
    if (npc && npc.def && npc.def.person) OW.faceTowards(npc, OW.player);
    if (!State.flag('league_arrived')) {
      yield* say('FERRYMAN: Off to the LEAGUE, are we? Eight BADGES, let\'s have a look...');
      yield* say('FERRYMAN: Well, I\'ll be. The real thing. That\'s two today!');
      yield* say('FERRYMAN: A spiky-haired kid came tearing through an hour ago. Nearly jumped in and swam.');
    }
    const yes = yield* Dialog.yesNo('FERRYMAN: Cast off for the AIMON LEAGUE?');
    if (!yes) {
      yield* say('FERRYMAN: I\'ll be right here.');
      return;
    }
    yield* this.sail('league', ['The LEAGUE ferry cut across sea route 21, bright spray flying...']);
    if (!State.flag('league_arrived')) {
      State.setFlag('league_arrived');
      yield* say('The AIMON LEAGUE: a white hall on a small island, gleaming in the sun. Every CHAMPION in VALEMORA began right here.');
    }
  },

  *leagueFerryBack(npc) {
    if (npc && npc.def && npc.def.person) OW.faceTowards(npc, OW.player);
    if (State.flag('game_clear')) {
      yield* this.boatMenu('league');
      return;
    }
    const i = yield* Dialog.ask('FERRYMAN: Heading back?', ['VICTORY PATH', 'STAY'], { cancel: 1 });
    if (i === 0) yield* this.sail('victory', ['The LEAGUE ferry cut back across sea route 21...']);
    else yield* say('FERRYMAN: Good luck in there!');
  },

  // -- The ELITE FOUR ---------------------------------------------------------------------------------------
  *e4Guard(npc) {
    const p = OW.player;
    OW.faceTowards(npc, p);
    yield* say('GUARD: Beyond this door wait the ELITE FOUR. And after them, the CHAMPION.');
    yield* say('GUARD: Once you go in, there\'s no coming back out. Not until you\'ve won... or lost.');
    const yes = yield* Dialog.yesNo('GUARD: Are you ready?');
    if (!yes) {
      yield* say('GUARD: Take your time. Heal up. The LEAGUE isn\'t going anywhere.');
      return;
    }
    for (const id of E4) State.setFlag(`beat_${id}`, false);
    yield* say('GUARD: Then go. And good luck.');
    yield* OW.walk(npc, 'right', 1);
    npc.dir = 'left';
    yield* OW.walkTo(p, 12, 3);
    p.dir = 'up';
    yield* OW.enterDoor(OW.map.warpAt(12, 2));
  },

  eliteLines: {
    shade: {
      intro: [
        'SHADE: ...The spirits told me you would come today. They whisper about you. The child who closed the RIFT.',
        'SHADE: I have spent my life listening to those who are gone. The CONDUCTOR wanted to hear them too.',
        'SHADE: The difference is, I never tried to drag them back.',
        'SHADE: The dead are not silent, child. They simply speak very, very softly. Let me show you.',
      ],
      again: ['SHADE: The spirits said you would return. They are rarely wrong. Shall we?'],
      after: ['SHADE: The spirits are laughing. They like you.', 'SHADE: Go on. BRAWN is next, and he is very... loud.'],
    },
    brawn: {
      intro: [
        'BRAWN: HA HA HA! FINALLY! Do you know how QUIET it\'s been in here? Nobody\'s gotten past SHADE in two years!',
        'BRAWN: I don\'t do puzzles. I don\'t do speeches. I do THIS!',
        'BRAWN flexed so hard the braziers flickered.',
        'BRAWN: Show me what your AIMON have got!',
      ],
      again: ['BRAWN: YOU\'RE BACK! My muscles have been waiting! LET\'S GO!'],
      after: ['BRAWN: HAAA! What a battle! My ears are RINGING!', 'BRAWN: Go on, go on! CINDRA\'s through there. Try not to get singed!'],
    },
    cindra: {
      intro: [
        'CINDRA: So you\'re the one who stopped the COUNTERMELODY. I watched the sky go violet from the slopes of EMBERPEAK.',
        'CINDRA: The volcano stopped rumbling. For the first time in my life, the mountain was silent. I hated every second.',
        'CINDRA: Fire is loud. Fire is alive. Let\'s see if you can stand the heat.',
      ],
      again: ['CINDRA: Back for more? The fire\'s still burning.'],
      after: ['CINDRA: ...Hm. You didn\'t even flinch.', 'CINDRA: MARINA\'s beyond that door. She\'s the strongest of us. Don\'t tell BRAWN I said so.'],
    },
    marina: {
      intro: [
        'MARINA: Welcome. You\'ve come a long way. I can see the salt on your boots.',
        'MARINA: I sailed with NERISSA once, when we were young. She says you rode the currents up the drowned stairs of the SUNKEN SHRINE.',
        'MARINA: Far enough out, the sea and the sky are the same blue. Let\'s see how far you\'ve come.',
      ],
      again: ['MARINA: The tide always comes back. So do you. Let\'s go.'],
      after: [
        'MARINA: Beautiful. Like a wave that never breaks.',
        'MARINA: The CHAMPION\'s chamber lies beyond. ...I should warn you. There\'s a new CHAMPION. As of this morning.',
      ],
    },
  },

  *eliteMeet(t) {
    const id = t.elite;
    if (State.flag(`beat_${id}`) || OW.busy > 1) return;
    const p = OW.player;
    const elite = OW.npc(`${OW.map.id}_elite`);
    yield* OW.walkTo(p, 6, 5);
    p.dir = 'up';
    if (elite) elite.dir = 'down';
    const L = this.eliteLines[id];
    const intro = State.flag(`met_${id}`) ? L.again : L.intro;
    State.setFlag(`met_${id}`);
    for (const line of intro) yield* say(line);
    const res = yield* this.battle({ trainer: id });
    if (res !== 'win') return;
    State.setFlag(`beat_${id}`);
    for (const line of L.after) yield* say(line);
    Sound.sfx('rumble');
    Game.shake = 12;
    yield* say(`Behind ${TRAINERS[id].name}, the great door rumbled open.`);
  },

  *eliteTalk(npc) {
    const id = npc.def.elite;
    if (!State.flag(`beat_${id}`)) {
      yield* this.eliteMeet({ elite: id });
      return;
    }
    OW.faceTowards(npc, OW.player);
    yield* say(this.eliteLines[id].after[this.eliteLines[id].after.length - 1]);
  },

  // -- The CHAMPION -------------------------------------------------------------------------------------------
  *championMeet() {
    if (State.flag('beat_champkai') || OW.busy > 1) return;
    const p = OW.player;
    const kai = OW.npc('ch_kai');
    if (!kai) return;
    if (State.flag('game_clear')) {
      yield* OW.walkTo(p, 6, 5);
      p.dir = 'up';
      kai.dir = 'down';
      yield* say('KAI: There you are, CHAMPION! Took you long enough.');
      yield* say('KAI: Ryker\'s been training me every day. Morning, noon and night. He says I still punch above my weight. I say that\'s the point!');
      yield* say('KAI: Title match. Let\'s go!');
      const res = yield* this.battle({ trainer: 'kaiR' });
      if (res !== 'win') return;
      State.setFlag('beat_champkai');
      yield* say('KAI: AGAIN?! ...Ryker\'s going to make me run laps around the whole island.');
      yield* say('KAI: Go on. Get your team in the HALL OF FAME. Again.');
      Sound.sfx('door');
      yield* OW.walk(kai, 'left', 1);
      kai.dir = 'right';
      return;
    }
    // ORLA, on her way out.
    const orla = OW.spawn({ id: 'ch_orla', person: 'orla', x: 6, y: 6, dir: 'down' });
    yield* OW.walkTo(orla, 6, 8);
    OW.faceTowards(orla, p);
    OW.faceTowards(p, orla);
    yield* say('???: Oh! Another challenger. It\'s a busy day.');
    yield* say('ORLA: I\'m ORLA. I was the CHAMPION... until about ten minutes ago.');
    yield* say('ORLA: You\'re too late to fight me, I\'m afraid. Someone beat you to it.');
    yield* say('ORLA: A loud boy. Spiky hair. He wouldn\'t stop talking about someone called {PLAYER}.');
    yield* say('ORLA: He fought just like his brother. I beat RYKER in this room eight years ago. I never forgot the look on his face.');
    yield* say('ORLA: This boy\'s face, when he won... I won\'t forget that either.');
    yield* say('ORLA: Go on. He\'s waiting for you.');
    yield* OW.walk(orla, 'right', 1);
    yield* OW.walkTo(orla, 7, 13);
    OW.despawn(orla);
    Sound.sfx('exit');
    yield 20;
    yield* say('KAI: HEY! {PLAYER}!');
    kai.emote = 30;
    Sound.sfx('exclaim');
    yield* OW.walkTo(p, 6, 5);
    p.dir = 'up';
    kai.dir = 'down';
    yield* say('KAI: Beat you here!');
    yield* say('KAI: Ha! Look at your face! I beat the ELITE FOUR, I beat ORLA, and now I\'m the CHAMPION!');
    yield* say('KAI: You know what I kept thinking about, the whole way here? The shrine. You carried all eight. You sang last.');
    yield* say('KAI: And I thought, if THAT\'s who I\'m racing, I\'d better run. So I ran. And for once in my life, I made it first!');
    yield* say('KAI: ...But being CHAMPION doesn\'t count if I haven\'t beaten the one person I\'ve been chasing this whole time.');
    yield* say('KAI: Ryker used to say it\'s all about who gets heard. I think it\'s about who shows up. And you showed up. Every time.');
    yield* say('KAI: So here we go. This is for Ryker. And for me. And... for you too, I guess!');
    const res = yield* this.battle({ trainer: 'champkai' });
    if (res !== 'win') return;
    State.setFlag('beat_champkai');
    yield* say('KAI: ...');
    yield* say('KAI: Yeah. Yeah, I knew it. I think I always knew it.');
    yield* say('KAI: Guess I only got to be CHAMPION for ten minutes.');
    yield* say('KAI: ...Best ten minutes of my life, though.');
    yield* say('KAI: Hey. {PLAYER}. Thanks. For the cave, and the tower, and the volcano... and for bringing my brother back.');
    yield* say('KAI: Now go on! That door\'s the HALL OF FAME. Get your team in there before I change my mind!');
    Sound.sfx('door');
    yield* say('The great door behind KAI swung open.');
    yield* OW.walk(kai, 'left', 1);
    kai.dir = 'right';
  },

  *championTalk(npc) {
    if (!State.flag('beat_champkai')) {
      yield* this.championMeet();
      return;
    }
    OW.faceTowards(npc, OW.player);
    yield* say('KAI: Go on, CHAMPION! The HALL OF FAME\'s right through there!');
  },

  // -- The HALL OF FAME -----------------------------------------------------------------------------------------
  *hofInspect() {
    const n = (State.d.hof || []).length;
    yield* say(`The HALL OF FAME machine. It has recorded ${n} team${n === 1 ? '' : 's'} from {PLAYER}.`);
  },

  *hofShow(team) {
    const scene = { opaque: true, i: -1, start: Game.frame };
    scene.draw = (g) => {
      const t = Game.frame - scene.start;
      for (let y = 0; y < SCREEN_H; y++) {
        const k = y / SCREEN_H;
        g.fillStyle = `rgb(${Math.round(60 + 60 * k)},${Math.round(40 + 40 * k)},${Math.round(10 + 10 * k)})`;
        g.fillRect(0, y, SCREEN_W, 1);
      }
      for (let i = 0; i < 20; i++) {
        const sx = (i * 53 + t) % SCREEN_W;
        const sy = (i * 29 + t * (1 + (i % 3))) % SCREEN_H;
        g.fillStyle = i % 2 ? '#f8e088' : '#fff8d0';
        g.fillRect(sx, sy, 1, 1);
      }
      Font.drawCenter(g, 'HALL OF FAME', SCREEN_W / 2, 8, '#f8e088', '#402800');
      if (scene.i >= 0 && scene.i < team.length) {
        const m = team[scene.i];
        const img = MonSprites.front(m.species);
        if (img) g.drawImage(img, Math.round(SCREEN_W / 2 - img.width / 2), Math.round(80 - img.height / 2));
        Font.drawCenter(g, m.name, SCREEN_W / 2, 124, '#ffffff', '#402800');
        Font.drawCenter(g, `Lv${m.level}`, SCREEN_W / 2, 138, '#f8e088', '#402800');
      } else if (scene.i >= team.length) {
        team.forEach((m, j) => {
          const img = MonSprites.icon(m.species) || MonSprites.front(m.species);
          if (!img) return;
          const w = Math.min(img.width, 36);
          const x = SCREEN_W / 2 - (team.length * 38) / 2 + j * 38 + 1;
          g.drawImage(img, x, 50, w, Math.round(img.height * (w / img.width)));
        });
        Font.drawCenter(g, State.text('{PLAYER}'), SCREEN_W / 2, 104, '#ffffff', '#402800');
        Font.drawCenter(g, 'CHAMPION OF VALEMORA', SCREEN_W / 2, 118, '#f8e088', '#402800');
      }
    };
    yield* Game.fadeOut(20, '#ffffff');
    Game.push(scene);
    Sound.playMusic('halloffame');
    yield* Game.fadeIn(20);
    for (let i = 0; i < team.length; i++) {
      scene.i = i;
      Sound.cry(team[i].species);
      yield 90;
    }
    scene.i = team.length;
    yield 60;
    yield* say('Congratulations! {PLAYER} and team have entered the HALL OF FAME!');
    yield* Game.fadeOut(30);
    Game.remove(scene);
  },

  *hallOfFame() {
    const p = OW.player;
    const first = !State.flag('game_clear');
    yield* say('The HALL OF FAME. A great machine hums at the far end of the room.');
    yield* OW.walkTo(p, 5, 4);
    p.dir = 'up';
    yield* say('{PLAYER} placed each AIMON\'s ball on the machine...');
    const team = State.party.map((m) => ({ species: m.species, name: m.name, level: m.level }));
    State.d.hof = [...(State.d.hof || []), team];
    Sound.sfx('boot');
    yield 30;
    yield* this.hofShow(team);
    if (!first) {
      OW.loadMap('league', 10, 8, 'down');
      Sound.playMusic(OW.music());
      yield* Game.fadeIn(30);
      return;
    }
    Sound.playMusic('halloffame');
    yield* Game.fadeIn(30);
    // RYKER, in the doorway.
    const ryker = OW.spawn({ id: 'hof_ryker', person: 'ryker', x: 5, y: 8, dir: 'up' });
    yield 30;
    for (let i = 0; i < 3; i++) {
      Sound.sfx('select');
      yield 24;
    }
    yield* say('Clap. Clap. Clap.');
    p.dir = 'down';
    yield* say('RYKER is standing in the doorway.');
    yield* OW.walk(ryker, 'up', 1);
    yield* say('RYKER: ...Not bad, kid.');
    yield* say('RYKER: I stood in that room eight years ago and lost. I thought second place meant nobody would ever hear me again.');
    yield* say('RYKER: Turns out my little brother was shouting my name the whole time. I just wasn\'t listening.');
    const kai = OW.spawn({ id: 'hof_kai', person: 'rival', x: 5, y: 8, dir: 'up' });
    yield* say('KAI: RYKER! You CLAPPED! I saw that! You never clap!');
    yield* say('RYKER: Don\'t make it weird.');
    yield 30;
    yield* this.credits();
    OW.despawn(ryker);
    OW.despawn(kai);
  },

  // ================================================================ CHAPTER 15: EPILOGUE
  creditStops: [
    { map: 'silverfall', x: 24, y: 13, dx: 0, dy: -5, text: 'In SILVERFALL CITY, the lights came back on. The waterfall powers them now.',
      credit: ['AIMON', 'a story of songs and stones'] },
    { map: 'cedarwood', x: 17, y: 20, dx: 0, dy: -6, text: 'In CEDARWOOD, the great cedar bloomed for the first time in a hundred years.',
      credit: ['starring', '{PLAYER}'] },
    { map: 'seabreeze', x: 19, y: 12, dx: 0, dy: 8, text: 'The ferries sailed from SEABREEZE again, to every island in VALEMORA.',
      credit: ['and', '{TEAM}'] },
    { map: 'cragmoor', x: 16, y: 18, dx: 0, dy: -9, text: 'TOR\'s quarry rang with hammers from dawn to dusk.',
      credit: ['your rival', 'KAI'] },
    { map: 'sunspire', x: 20, y: 16, dx: 6, dy: -8, text: 'In SUNSPIRE, SAHRA restored the FIRST SCORE, verse by verse.',
      credit: ['the WARDENS', 'HOLT  IVY  NERISSA  TOR'] },
    { map: 'meadowfield', x: 22, y: 14, dx: 5, dy: -8, text: 'The MEADOWFIELD windmill turned, and every light on the farm came on.',
      credit: ['', 'SAHRA  WREN  CANTOR  NOX'] },
    { map: 'stonepeak', x: 18, y: 20, dx: 0, dy: -11, text: 'At STONEPEAK, CANTOR rang the bell. He played a new song every morning.',
      credit: ['with', 'PROF. LINDEN  MOM  LENA'], sfx: 'bell' },
    { map: 'starfall', x: 17, y: 20, dx: 0, dy: -10, text: 'And stars fell over STARFALL ISLE. NOX named every one.',
      credit: ['TEAM DISTORTION', 'VESPER  THANE  MORROW'], stars: true },
  ],

  *credits() {
    const p = OW.player;
    const team = State.party.map((m) => m.name).join('  ');
    const roll = { text: '', credit: ['', ''], start: Game.frame, stars: false };
    roll.draw = (g) => {
      const t = Game.frame - roll.start;
      const a = Math.min(1, t / 30);
      if (roll.stars) {
        for (let i = 0; i < 3; i++) {
          const k = ((t + i * 70) % 120) / 120;
          const sx = (i * 83 + Math.floor((t + i * 70) / 120) * 47) % SCREEN_W;
          g.globalAlpha = 1 - k;
          g.fillStyle = '#fff8d0';
          for (let j = 0; j < 8; j++) g.fillRect(sx - k * 60 + j, 10 + k * 50 + j * 0.6, 1, 1);
        }
        g.globalAlpha = 1;
      }
      g.globalAlpha = a * 0.72;
      g.fillStyle = '#000';
      g.fillRect(0, 0, SCREEN_W, 30);
      g.fillRect(0, SCREEN_H - 34, SCREEN_W, 34);
      g.globalAlpha = a;
      Font.drawCenter(g, State.text(roll.credit[0]), SCREEN_W / 2, 3, '#b8b0d8', '#000');
      Font.drawCenter(g, State.text(roll.credit[1]).replace('{TEAM}', team), SCREEN_W / 2, 16, '#ffffff', '#000');
      Font.wrap(roll.text, 228).slice(0, 2).forEach((line, i) => Font.drawCenter(g, line, SCREEN_W / 2, SCREEN_H - 30 + i * 13, '#ffffff', '#000'));
      g.globalAlpha = 1;
    };
    yield* Game.fadeOut(40);
    OW.forceMusic = 'credits';
    Sound.playMusic('credits');
    Game.push(roll);
    for (const stop of this.creditStops) {
      OW.loadMap(stop.map, stop.x, stop.y, 'down');
      p.hidden = true;
      OW.popup = null;
      Object.assign(roll, { text: stop.text, credit: stop.credit, start: Game.frame, stars: !!stop.stars });
      yield* Game.fadeIn(30);
      if (stop.sfx) Sound.sfx(stop.sfx);
      yield* OW.pan(stop.dx, stop.dy, 300);
      yield* Game.fadeOut(30);
    }
    Game.remove(roll);
    yield* this.lighthouseLit();
    yield* this.endCard(['THE CONDUCTOR', 'DR. AUGUST VALE'], ['and', 'RYKER']);
    yield* this.endCard(['in memory of', 'ECHO'], ['', '']);
    yield* this.endCard(['thank you', 'for playing'], ['', '']);
    p.hidden = false;
    OW.forceMusic = null;
    yield* this.homeEpilogue();
  },

  *endCard(a, b) {
    const start = Game.frame;
    const scene = { opaque: true };
    scene.draw = (g) => {
      const t = Game.frame - start;
      g.fillStyle = '#000';
      g.fillRect(0, 0, SCREEN_W, SCREEN_H);
      g.globalAlpha = Math.min(1, t / 40);
      Font.drawCenter(g, a[0], SCREEN_W / 2, 52, '#b8b0d8', '#000');
      Font.drawCenter(g, a[1], SCREEN_W / 2, 66, '#ffffff', '#000');
      if (b[1]) {
        Font.drawCenter(g, b[0], SCREEN_W / 2, 88, '#b8b0d8', '#000');
        Font.drawCenter(g, b[1], SCREEN_W / 2, 102, '#ffffff', '#000');
      }
      g.globalAlpha = 1;
    };
    Game.push(scene);
    yield* Game.fadeIn(10);
    yield 200;
    yield* Game.fadeOut(30);
    Game.remove(scene);
  },

  // The FORGOTTEN LIGHTHOUSE, lit again.
  *lighthouseLit() {
    const start = Game.frame;
    const scene = { opaque: true, text: 'Far to the west, the FORGOTTEN LIGHTHOUSE, dark for years, was lit again.' };
    scene.draw = (g) => {
      const t = Game.frame - start;
      for (let y = 0; y < 104; y++) {
        const k = y / 104;
        g.fillStyle = `rgb(${Math.round(16 + 40 * k)},${Math.round(20 + 30 * k)},${Math.round(48 + 50 * k)})`;
        g.fillRect(0, y, SCREEN_W, 1);
      }
      for (let i = 0; i < 30; i++) {
        if ((Math.floor(t / 14) + i * 7) % 11 === 0) continue;
        g.fillStyle = '#e8e8ff';
        g.fillRect((i * 97) % SCREEN_W, (i * 31) % 80, 1, 1);
      }
      g.fillStyle = '#0c1830';
      g.fillRect(0, 104, SCREEN_W, 56);
      g.fillStyle = '#1c3050';
      for (let i = 0; i < 16; i++) g.fillRect((i * 61 + Math.floor(t / 4)) % (SCREEN_W + 20) - 10, 108 + (i * 7) % 48, 8, 1);
      // The lonely isle and its lighthouse.
      g.fillStyle = '#16202c';
      g.fillRect(140, 98, 60, 8);
      g.fillRect(150, 94, 40, 4);
      g.fillStyle = '#d8d0c0';
      g.fillRect(166, 52, 10, 42);
      g.fillStyle = '#a83028';
      g.fillRect(166, 62, 10, 5);
      g.fillRect(166, 78, 10, 5);
      g.fillStyle = '#303848';
      g.fillRect(164, 44, 14, 8);
      g.fillRect(168, 40, 6, 4);
      // The light, and its beam sweeping the sea.
      const lit = t > 60;
      if (lit) {
        const ang = t / 40;
        const bx = Math.cos(ang) * 120;
        g.globalAlpha = 0.18 + 0.1 * Math.abs(Math.sin(ang));
        g.fillStyle = '#fff0a0';
        g.beginPath();
        g.moveTo(171, 48);
        g.lineTo(171 + bx, 40);
        g.lineTo(171 + bx, 58);
        g.closePath();
        g.fill();
        g.globalAlpha = 1;
        g.fillStyle = '#fff0a0';
        g.fillRect(167, 45, 8, 6);
      } else {
        g.fillStyle = '#404858';
        g.fillRect(167, 45, 8, 6);
      }
      // A figure in a long coat at the door.
      g.fillStyle = '#281830';
      g.fillRect(180, 88, 3, 6);
      g.fillRect(179, 91, 5, 4);
      g.fillStyle = '#e0c8b0';
      g.fillRect(180, 86, 3, 2);
      g.globalAlpha = 0.72;
      g.fillStyle = '#000';
      g.fillRect(0, SCREEN_H - 34, SCREEN_W, 34);
      g.globalAlpha = 1;
      Font.wrap(scene.text, 228).slice(0, 2).forEach((line, i) => Font.drawCenter(g, line, SCREEN_W / 2, SCREEN_H - 30 + i * 13, '#ffffff', '#000'));
    };
    Game.push(scene);
    yield* Game.fadeIn(40);
    yield 280;
    scene.text = 'They say a woman in a long coat keeps it now. She is on parole, and she has never once let the light go out.';
    yield 300;
    yield* Game.fadeOut(40);
    Game.remove(scene);
  },

  // Home.
  *homeEpilogue() {
    const p = OW.player;
    OW.loadMap('home1f', 5, 7, 'up');
    Sound.playMusic('home');
    const prof = OW.spawn({ id: 'ep_prof', person: 'prof', x: 3, y: 5, dir: 'right' });
    const mom = OW.npc('mom');
    yield* Game.fadeIn(40);
    yield* say('Home. The kitchen smells of stew, and the table is set for three.');
    if (mom) OW.faceTowards(mom, p);
    yield* say('MOM: {PLAYER}! Just in time, as always. Sit, sit! You must be starving.');
    yield* say('MOM: I heard it all on the radio. The shrine, the LEAGUE... CHAMPION! My kid, the CHAMPION!');
    yield* say('MOM: I always knew. Well. I knew you\'d be on time, at least.');
    OW.faceTowards(prof, p);
    yield* say('PROF. LINDEN: Ahem. {PLAYER}. Before the stew gets cold... may I see your AIMONDEX?');
    yield* say(`PROF. LINDEN: ${State.caughtCount()} AIMON caught, and ${State.seenCount()} seen! Remarkable!`);
    yield* say('PROF. LINDEN: And there are still AIMON out there no one has ever recorded. They say something sleeps at the SUNKEN SHRINE... and that the MYSTIC GROVE has a visitor on moonless nights.');
    yield* say('PROF. LINDEN: Keep filling it in, would you? For an old professor.');
    yield* say('MOM: After dinner! Honestly, you two.');
    yield* Game.fadeOut(40);
    OW.despawn(prof);
    yield* this.blackCard([
      'After dinner, there was a knock at the door.',
      'It was LENA, KAI\'s mom. "Come over," she said. "Both of you. There\'s someone I want you to see."',
    ]);
    OW.loadMap('rivalhouse', 5, 7, 'up');
    const ryker = OW.spawn({ id: 'ep_ryker', person: 'ryker', x: 7, y: 6, dir: 'left' });
    const kai = OW.spawn({ id: 'ep_kai', person: 'rival', x: 4, y: 6, dir: 'right' });
    const lena = OW.npc('lena');
    yield* Game.fadeIn(40);
    yield* say('KAI\'s house. The table is set with every plate in the cupboard.');
    if (lena) OW.faceTowards(lena, p);
    yield* say('LENA: For eight years, I set one extra plate. Tonight I set two more.');
    yield* say('LENA: One for my son, who came home. And one for the trainer who brought him.');
    OW.faceTowards(ryker, p);
    yield* say('RYKER: ...Hey.');
    yield* say('RYKER: She made my favorite. She remembered.');
    yield* say('LENA: Of course I remembered.');
    OW.faceTowards(kai, p);
    yield* say('KAI: {PLAYER}! Sit here! Ryker, tell them about the part where...');
    yield* say('KAI: No, wait, I\'ll tell it. So there I am, in the CHAMPION\'s room, right...');
    yield* say('RYKER: KAI.');
    OW.faceTowards(kai, ryker);
    yield* say('KAI: Yeah?');
    yield* say('RYKER: ...Nothing. I\'m just glad I\'m home.');
    yield 60;
    yield* Game.fadeOut(60);
    OW.despawn(ryker);
    OW.despawn(kai);
    yield* this.theEnd();
    State.setFlag('game_clear');
    State.healParty();
    State.d.heal = { map: 'home1f', x: 7, y: 6, dir: 'up' };
    OW.loadMap('home1f', 5, 7, 'up');
    Sound.playMusic(OW.music());
    yield* Game.fadeIn(40);
    const ok = State.save({ map: 'home1f', x: 5, y: 7, dir: 'up' });
    if (ok) yield* say('{PLAYER}\'s adventure was saved.');
    yield* say('MOM: Oh! The WARDENS called while you were out. All eight of them want a rematch.');
    yield* say('MOM: And KAI says he\'ll be training with RYKER at the LEAGUE. He said, and I quote, "Tell {PLAYER} I\'m coming for that title!"');
  },

  *theEnd() {
    const start = Game.frame;
    const scene = { opaque: true };
    scene.draw = (g) => {
      const t = Game.frame - start;
      g.fillStyle = '#000';
      g.fillRect(0, 0, SCREEN_W, SCREEN_H);
      g.globalAlpha = Math.min(1, t / 60);
      Font.drawCenter(g, 'THE END', SCREEN_W / 2, 64, '#ffffff', '#000');
      g.globalAlpha = Math.max(0, Math.min(1, (t - 120) / 60));
      Font.drawCenter(g, '...but the song goes on.', SCREEN_W / 2, 84, '#b8b0d8', '#000');
      g.globalAlpha = 1;
    };
    Game.push(scene);
    Sound.playMusic('credits');
    yield* Game.fadeIn(20);
    yield 360;
    yield* Game.fadeOut(60);
    Game.remove(scene);
  },

  // ================================================================ POST-GAME
  *rematch(npc, trainer, before, after) {
    OW.faceTowards(npc, OW.player);
    yield* say(before);
    const yes = yield* Dialog.yesNo('Battle again?');
    if (!yes) {
      yield* say('Come back any time. The door\'s always open for the one who sang last.');
      return;
    }
    const res = yield* this.battle({ trainer });
    if (res === 'win') yield* say(after);
  },

  *astralyxMeet(npc) {
    Sound.cry('astralyx');
    Game.shake = 16;
    yield* say('A great dark beast stands by the altar, its fur scattered with stars. It has been waiting for you.');
    yield* say('It lowers its head... and its eyes blaze like falling stars!', { auto: 40 });
    const res = yield* this.battle({ wild: { species: 'astralyx', level: 70 } });
    if (res === 'lose') return;
    if (res === 'run') {
      yield* say('ASTRALYX is still watching from beside the altar.');
      return;
    }
    State.setFlag('astralyx_done');
    OW.despawn(npc);
    if (res === 'win') yield* say('ASTRALYX leapt into the sky and vanished among the stars...');
  },

  *elegiraMeet(npc) {
    Sound.cry('elegira');
    yield* say('Where the RIFT once hung, something is sleeping, curled in the air above the altar.');
    yield* say('It stirs. The whole shrine hums with a single, gentle note...');
    Game.shake = 16;
    yield* say('ELEGIRA opened its eyes!', { auto: 40 });
    const res = yield* this.battle({ wild: { species: 'elegira', level: 70 } });
    if (res === 'lose') return;
    if (res === 'run') {
      yield* say('ELEGIRA drifts back to sleep above the altar, humming softly.');
      return;
    }
    State.setFlag('elegira_done');
    OW.despawn(npc);
    if (res === 'win') yield* say('ELEGIRA\'s song faded into the stone. Only an echo remained.');
  },

  *hourglassNote() {
    yield* say('An hourglass stands where MORROW vanished. The sand is frozen halfway down.');
    yield* say('A note is tucked beneath it, in neat, old-fashioned handwriting:\n"Time will tell. (M.)"');
  },

  *kaiPostgame(npc) {
    OW.faceTowards(npc, OW.player);
    yield* say('KAI: Ryker and I train out here every morning! I\'m getting stronger. Way stronger.');
    yield* say('KAI: Get through the ELITE FOUR again and I\'ll be waiting in the CHAMPION\'s room. Title match! Loser buys the POTIONS!');
  },

  *rykerPostgame(npc) {
    OW.faceTowards(npc, OW.player);
    yield* say('RYKER: The WARDENS let me off with community service. HOLT\'s got me rebuilding every wall TEAM DISTORTION ever knocked down.');
    yield* say('RYKER: And training this one. Don\'t tell him, but he\'s better than I was at his age.');
  },

  *orlaLobby(npc) {
    OW.faceTowards(npc, OW.player);
    yield* say('ORLA: The ex-CHAMPION, reduced to sitting in the lobby! I don\'t mind. I get to watch the good battles.');
    yield* say('ORLA: RYKER came by to say sorry for something he said to me eight years ago. It took him long enough.');
  },
});

// A sea-route ferry for SEABREEZE after the story.
{
  const baseFerry = Events.ferryTalk;
  Events.ferryTalk = function* ferryTalk(npc) {
    if (State.flag('game_clear')) yield* this.ferryTalkPost(npc);
    else yield* baseFerry.call(this, npc);
  };
}

// The WARDENS' rematches, once the story is over.
{
  const REMATCH = {
    holtGym: ['holtR', 'HOLT: Rebuilt the city walls, trained every morning, and I\'m still itching for a rematch. Steadfast, {PLAYER}. Show me.', 'HOLT: Still the one who sang last. Good.'],
    ivyGym: ['ivyR', 'IVY: The cedar\'s in full bloom, and so are my AIMON! Want to see how much they\'ve grown?', 'IVY: Beautiful. Like a whole garden in one battle.'],
    nerissaGym: ['nerissaR', 'NERISSA: The GUST misses you, and so does my crew. Care to ride the currents one more time?', 'NERISSA: Ha! You\'d make a fine CAPTAIN.'],
    torGym: ['torR', 'TOR: The quarry\'s back to work, and I\'ve got energy to burn! Rematch?', 'TOR: HA! Solid as bedrock, you are.'],
    sahraGym: ['sahraR', 'SAHRA: The FIRST SCORE is fully restored. Now I\'ve got time to battle again. Shall we?', 'SAHRA: History will remember that one.'],
    wrenGym: ['wrenR', 'WREN: I built a new turbine! It powers my AIMON AND the barn lights. Wanna see it in action?', 'WREN: Bzzt! You short-circuited the whole plan!'],
    cantorGym: ['cantorR', 'CANTOR: I play ECHO\'s song every morning now. Afterwards, I feel like a battle. Would you oblige an old man?', 'CANTOR: A fine duet. August would have loved it.'],
    noxGym: ['noxR', 'NOX: Every star\'s back in the sky, and I\'ve named them all twice. Battle under the dome?', 'NOX: You shine brighter every time.'],
  };
  for (const [script, [trainer, before, after]] of Object.entries(REMATCH)) {
    const base = Events[script];
    Events[script] = function* gymLeader(npc) {
      if (State.flag('game_clear')) yield* this.rematch(npc, trainer, before, after);
      else yield* base.call(this, npc);
    };
  }
}

// Seabreeze: when the GUST lands in the middle of the rally.
{
  const baseSail = Events.sail;
  Events.sail = function* sail(to, lines) {
    yield* baseSail.call(this, to, lines);
    if (to === 'seabreeze' && State.flag('countermelody') && !State.flag('rally_done')) yield* this.rallyScene();
  };
}

Events.rallyScene.when = () => State.flag('countermelody') && !State.flag('shrine_sailed') && !State.flag('rally_done');
Events.shrineStairs.when = () => AT_SHRINE() && !State.flag('s2_stairs');
Events.shrinePillars.when = () => AT_SHRINE() && !State.flag('s2_pillars');
Events.shrineBell.when = () => AT_SHRINE() && !State.flag('s2_bell');
Events.morrowFinal.when = () => AT_SHRINE() && !State.flag('beat_morrow4');
Events.rykerDoor.when = () => AT_SHRINE() && State.flag('beat_morrow4') && !State.flag('ryker_door');
Events.conductorFinal.when = () => AT_SHRINE() && !State.flag('beat_conductor2');
Events.eliteMeet.when = (t) => !State.flag(`beat_${t.elite}`);
Events.championMeet.when = () => !State.flag('beat_champkai');
