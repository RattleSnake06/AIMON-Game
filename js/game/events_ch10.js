'use strict';
// Chapter 10 story: the south road with a silent KAI, EMBERPEAK VOLCANO,
// TEAM DISTORTION's FORGE, and the COMMANDER in the crater's heart: RYKER.
// Chapter 11 story: the COMMANDER's key card, SONANCE TOWER 4F, MORROW, the
// CONDUCTOR (DR. AUGUST VALE) at the GRAND RESONATOR, the master switch and
// the night SILVERFALL went dark, and the WARDENS' council in GRAYHAVEN.
// Chapter 12 story: ROUTE 6 and the MARSHLAND, the final verse in the MYSTIC
// GROVE, VESPER's warning, STARFALL ISLE, NOX and GYM 8, the CHAMPION'S OATH,
// and the night the sky over the south turned violet.

Object.assign(Events, {
  // Captions on a black screen, between two fades (call it faded out).
  *blackCard(lines) {
    const scene = { opaque: true, draw: (g) => { g.fillStyle = '#000'; g.fillRect(0, 0, SCREEN_W, SCREEN_H); } };
    Game.push(scene);
    yield* Game.fadeIn(20);
    for (const line of lines) yield* say(line, DARK);
    yield* Game.fadeOut(20);
    Game.remove(scene);
  },

  // -- WILLOWBROOK: the south road ----------------------------------------------------------
  *kaiSouthRoad() {
    State.setFlag('kai_south');
    const p = OW.player;
    const kai = yield* this.arrive({ id: 'kai_wb', person: 'rival' }, p, 'north');
    yield* say('KAI: ...');
    yield* say('KAI has dark rings under his eyes. It doesn\'t look like he slept at all.');
    yield* say('KAI: The barriers on the south road are gone. Somebody dragged them into the trees last night.');
    yield* say('KAI: He wants us to come. So we\'re going.');
    yield* say('KAI: ...Don\'t tell Mom where we went. Okay?');
    yield* this.leave(kai, 10, 21);
  },

  // -- ROUTE 7: the hot-spring inn --------------------------------------------------------------
  *innHeal(npc) {
    yield* say('INNKEEPER: Welcome to the EMBERPEAK HOT SPRING! The water comes straight up from the volcano.');
    const yes = yield* Dialog.yesNo('INNKEEPER: Would your AIMON like a soak? It\'s on the house.');
    if (!yes) {
      yield* say('INNKEEPER: Come back any time. The spring never gets cold. Lately it barely stops boiling!');
      return;
    }
    npc.dir = 'left';
    yield* this.healJingle();
    npc.dir = 'down';
    yield* say('INNKEEPER: There! Your AIMON look as good as new. Mind the heat on the mountain, now.');
  },

  // -- EMBERPEAK VOLCANO -----------------------------------------------------------------------
  *kaiVolcano() {
    if (State.flag('ep_kai') || OW.busy > 1) return;
    const p = OW.player;
    const kai = OW.npc('ep_kai') || OW.spawn({ id: 'ep_kai', person: 'rival', x: 20, y: 16, dir: 'up' });
    kai.dir = 'up';
    yield* say('KAI is standing at the gate, staring up at the black steel.');
    yield 20;
    yield* OW.approach(kai, p);
    yield* say('KAI: ...{PLAYER}.');
    yield* say('KAI: I didn\'t say a single word the whole way here. Sorry. I\'ve been trying to work out how to say it.');
    yield* say('KAI: That letter. The handwriting. It\'s my brother\'s.\fIt\'s RYKER\'s.');
    yield* say('KAI: Eight years ago he won all eight BADGES and went off to the LEAGUE. He lost the CHAMPION match...');
    yield* say('KAI: ...and he never came home. Not once. Not even a letter. Until now.');
    yield* say('KAI: Mom still sets a place for him at dinner. Every single night.');
    yield* say('KAI: If he\'s in there... If he\'s one of THEM...');
    yield 30;
    yield* say('KAI: ...Let\'s go. Before I lose my nerve.');
    State.setFlag('ep_kai');
    yield* OW.walkTo(kai, 19, 15);
    Sound.sfx('door');
    OW.despawn(kai);
  },

  *forgeGateStop() {
    if (State.flag('letter_read')) {
      yield* this.kaiVolcano();
      return;
    }
    yield* say('A heavy steel gate, shut tight. It won\'t budge.');
  },

  // -- THE FORGE -------------------------------------------------------------------------------
  *forgeEnter() {
    State.setFlag('forge_seen');
    const p = OW.player;
    yield* say('A wall of heat hits you. Rivers of lava glow beneath narrow steel catwalks, and huge pumps thunder along the walls.');
    const kai = yield* this.arrive({ id: 'kai_fg', person: 'rival' }, p, 'east');
    yield* say('KAI: Whoa... They\'re pumping heat straight out of the volcano!');
    yield* say('KAI: See the stairs at the very top? They\'re sealed off with steam from those pumps. Nobody\'s getting up there.');
    yield* say('KAI: There has to be a control room somewhere. I\'ll find it and shut the pumps down.');
    yield* say('KAI: You take the catwalks. Don\'t wait for me!');
    yield* say('KAI: ...I can do this much. Go.');
    yield* this.leave(kai, 25, 20);
    Sound.sfx('door');
    yield* say('KAI slipped through a maintenance hatch in the wall.');
  },

  *kaiPumps() {
    if (State.flag('pumps_off') || OW.busy > 1) return;
    const p = OW.player;
    p.dir = 'up';
    yield* say('Scalding steam blasts out around the stairs. There\'s no getting through.');
    Sound.sfx('hum');
    yield* say('A speaker on the wall crackles.');
    yield* say('KAI: {PLAYER}? Can you hear me? I found the control room!');
    yield* say('KAI: There are like a hundred buttons in here... Okay. Big red one. It\'s always the big red one.');
    yield* say('KAI: Here goes nothing!');
    Sound.sfx('rumble');
    Game.shake = 16;
    yield 40;
    State.setFlag('pumps_off');
    const steam = OW.npc('fg_steam');
    if (steam) {
      yield* BattleFX.tween(24, () => { steam.hidden = !steam.hidden; });
      OW.despawn(steam);
    }
    yield* say('The heat pumps groaned and shuddered to a stop. The steam around the stairs thinned away to nothing.');
    yield* say('KAI: Did it work? ...It WORKED! Go on up! I\'m right behind you!');
  },

  *pumpInspect() {
    if (State.flag('pumps_off')) yield* say('A giant heat pump, silent and ticking as it cools. A SONANCE ENERGY logo is stamped on its side.');
    else yield* say('A giant heat pump, roaring and shaking. Pipes carry the volcano\'s heat away through the walls.\fA SONANCE ENERGY logo is stamped on its side.');
  },

  // -- The crater's heart: the COMMANDER -------------------------------------------------------
  *forgeMachine() {
    if (State.flag('beat_ryker')) {
      yield* say('THE GRAND FORGE. Its fires have gone out, and its screens read:\n"HEAT SUPPLY: OFFLINE."');
      return;
    }
    yield* say('THE GRAND FORGE. It drinks the volcano\'s heat and sends it north, down a thick black cable.\fA screen reads: "TO: GRAND RESONATOR, SONANCE TOWER 4F."');
  },

  *rykerCrater() {
    if (State.flag('beat_ryker') || OW.busy > 1) return;
    const p = OW.player;
    const ryker = OW.npc('cr_ryker');
    if (!ryker) return;
    yield* say('Beneath the roaring furnace stands a tall figure in a long coat, his back to you.');
    yield* OW.walkTo(p, 9, 7);
    p.dir = 'up';
    yield* say('???: You came. Right on time. MORROW said you would. He\'s annoying like that.');
    ryker.dir = 'down';
    yield 20;
    yield* say('???: I\'m the COMMANDER of TEAM DISTORTION. The FORGE, the pumps, the GRUNTS, the ones you\'ve been knocking over all across VALEMORA. They\'re mine.');
    yield* say('RYKER: My name is RYKER.');
    yield* say('RYKER: Eight years ago, I won all eight BADGES. I walked into the AIMON LEAGUE like I owned the place.');
    yield* say('RYKER: And I lost the CHAMPION match. In front of everyone.');
    yield* say('RYKER: You know what the LEAGUE taught me? Second place is silence. Nobody writes songs about the one who almost won.');
    yield* say('RYKER: The CONDUCTOR offered me a world where only the strong are heard. I took it. I\'d take it again.');
    // KAI catches up.
    yield* say('Footsteps pound up the stairs behind you.');
    const kai = yield* this.arrive({ id: 'kai_cr', person: 'rival' }, p, 'south');
    yield* say('KAI: RYKER!');
    ryker.emote = 30;
    Sound.sfx('exclaim');
    yield 30;
    OW.faceTowards(ryker, kai);
    OW.faceTowards(kai, ryker);
    yield* say('KAI: Ryker... Mom still sets a plate for you.');
    yield 50;
    yield* say('RYKER: ...');
    yield* say('RYKER: Go home, little brother.');
    yield* say('KAI: Not without you!');
    yield* say('RYKER: Then you\'ll be waiting a long time.');
    OW.faceTowards(ryker, p);
    OW.faceTowards(p, ryker);
    yield* say('RYKER: And you. The kid from all his stories. Yes, I read the letters he sends home. Mom leaves them on my pillow.');
    yield* say('RYKER: Show me what beat MORROW.');
    yield* OW.approach(ryker, p);
    const res = yield* this.battle({ trainer: 'ryker' });
    if (res !== 'win') return;
    State.setFlag('beat_ryker');
    yield* say('RYKER: ...You took it.');
    yield* say('RYKER: Nobody\'s ever... Not since the LEAGUE. Not once.');
    yield 30;
    yield* say('RYKER dropped a black key card on the grating.');
    yield* this.receive('cmdkey', 1, 'picked up');
    yield* say('RYKER: That opens the fourth floor of the SONANCE TOWER. The GRAND RESONATOR. He\'s up there most nights. Playing.');
    yield* say('RYKER: Whatever you think he is... he\'s worse. And he\'s better. You\'ll see.');
    // RYKER leaves, and stops at the stairs.
    yield* OW.walkTo(ryker, 8, 12);
    ryker.dir = 'up';
    yield 30;
    yield* say('RYKER: ...');
    yield* say('RYKER: ...Tell Mom I\'m sorry.');
    yield* OW.walk(ryker, 'down', 1);
    Sound.sfx('exit');
    OW.despawn(ryker);
    yield 40;
    OW.faceTowards(kai, p);
    OW.faceTowards(p, kai);
    yield* say('KAI is shaking.');
    yield* say('KAI: ...');
    yield* say('KAI: {PLAYER}.');
    yield* say('KAI: Let\'s finish this.');
    yield* say('KAI: SILVERFALL. The SONANCE TOWER. Whatever\'s behind that door on 3F, we end it. Together.');
    yield* say('KAI: I\'ll meet you there. I just need... a minute.');
    yield* this.leave(kai, 8, 12);
    Sound.sfx('exit');
  },

  // -- SONANCE TOWER 3F: the COMMANDER's key card -----------------------------------------------
  *vaultDoor() {
    if (State.flag('vault_open')) {
      yield* say('The steel door stands open. Stairs lead up to 4F.');
      return;
    }
    yield* say('A heavy steel door. The plate reads:\n"4F. EXECUTIVE FLOOR. GRAND RESONATOR."');
    if (!State.count('cmdkey')) {
      yield* say('The key card reader blinks red.\n"COMMANDER\'S KEY CARD REQUIRED."');
      if (State.flag('hq_cleared')) yield* say('It won\'t budge. Not without that key card.');
      return;
    }
    yield* say('{PLAYER} swiped the COMMANDER\'S KEY.');
    Sound.sfx('confirm');
    yield 20;
    yield* say('The reader blinks green.\n"WELCOME BACK, COMMANDER."');
    Sound.sfx('rumble');
    Game.shake = 8;
    State.setFlag('vault_open');
    yield 30;
    Sound.sfx('door');
    yield* say('With a deep hiss, the vault door slid open. A low, sweet hum drifts down the stairs.');
  },

  // -- SONANCE TOWER 4F: the GRAND RESONATOR ----------------------------------------------------
  *resonatorInspect() {
    if (State.flag('switch_thrown')) {
      yield* say('THE GRAND RESONATOR. Its pipes are cold and silent, and the violet light at its heart has gone out.');
      return;
    }
    yield* say('THE GRAND RESONATOR: a cathedral of silver pipes around a violet light. Every pipe hums a different note.\fThick black cables run from it into the walls, and down into the city.');
  },

  *songTanks(t) {
    const tanks = {
      2: 'RIFTSTONE. RECORDED.', 3: 'ROOTSTONE. RECORDED.', 4: 'TIDESTONE. RECORDED.', 5: 'CRAGSTONE. RECORDED.',
      14: 'DUNESTONE. RECORDED.', 15: 'BELLSTONE. RECORDED (PARTIAL).', 16: 'MILLSTONE. FAILED.', 17: 'STARSTONE. PENDING.',
    };
    const label = tanks[t.x] || 'EMPTY.';
    if (t.x === 15) yield* say(`A tall glass tank. The light inside flickers on and off, like a song with half its notes missing.\nLABEL: "${label}"`);
    else if (t.x >= 16) yield* say(`A tall glass tank, dark and empty.\nLABEL: "${label}"`);
    else yield* say(`A tall glass tank full of swirling light, humming one long, low note.\nLABEL: "${label}"`);
  },

  *morrowResonator() {
    if (State.flag('beat_morrow3') || OW.busy > 1) return;
    const p = OW.player;
    const morrow = OW.npc('h4_morrow');
    if (!morrow) return;
    Sound.sfx('hum');
    yield* say('The whole floor hums. Beyond a row of glowing tanks, a cello is playing somewhere, slow and sad.');
    morrow.emote = 30;
    Sound.sfx('exclaim');
    yield 30;
    yield* say('MORROW: Tick, tock. The COMMANDER\'s own key card. So RYKER has finally stopped running.');
    yield* say('MORROW: He always did rush. Winning too early, losing too early. Timing, child. It\'s everything.');
    yield* say('MORROW: The CONDUCTOR is rehearsing. He does not like to be interrupted before the end of a phrase.');
    yield* say('MORROW: So let us pass the time, you and I. One last time before the performance.');
    yield* OW.approach(morrow, p);
    const res = yield* this.battle({ trainer: 'morrow3' });
    if (res !== 'win') return;
    State.setFlag('beat_morrow3');
    yield* say('MORROW: Hm. The phrase is over.');
    yield* OW.walkTo(morrow, 13, 8);
    morrow.dir = 'left';
    yield* say('MORROW: The CONDUCTOR will see you now.');
    yield* say('MORROW: You\'re right on time.');
  },

  *conductorResonator() {
    if (State.flag('beat_conductor1') || OW.busy > 1) return;
    if (!State.flag('beat_morrow3')) {
      yield* this.morrowResonator();
      return;
    }
    const p = OW.player;
    const vale = OW.npc('h4_vale');
    if (!vale) return;
    p.dir = 'up';
    Sound.sfx('hum');
    yield* say('A man sits alone before the GRAND RESONATOR, playing a cello. Every pipe in the machine sings along with his bow.');
    yield 40;
    yield* say('The last note fades. The man lowers his bow.');
    vale.dir = 'down';
    yield 20;
    yield* say('???: Ah. The child who carries seven songs. Please, stay. It\'s so rare to have an audience.');
    yield* say('VALE: I am DR. AUGUST VALE. My players call me the CONDUCTOR. They like titles. I only ever liked music.');
    yield* say('VALE: When I was a boy, I had a SONARION named ECHO. When I played, ECHO sang. We were never apart.');
    yield* say('VALE: Then one winter, ECHO grew quiet. Then quieter. And then, silent.');
    yield* say('VALE: Everyone told me ECHO was gone. But I had read the old books. The RIFT is not a wound, child. It is a door.');
    yield* say('VALE: Behind it lies the true world. The first world. Where every voice that ever fell silent is still singing.');
    yield* say('VALE: ECHO is there. I have only to open the door.');
    yield* say('VALE: You\'ve wondered why you keep winning, haven\'t you? Every GYM. Every KEYSTONE you protected. Every one of my players who fell.');
    yield* say('VALE: Each BADGE holds a sliver of a KEYSTONE. Each sliver sings its stone\'s note. And you have carried them, one by one, across all of VALEMORA.');
    yield* say('VALE: I let you win them, child. You have been carrying my orchestra.');
    yield* say('VALE: Don\'t look so frightened. I\'m not destroying VALEMORA.');
    yield* say('VALE: I\'m finishing its song.');
    yield* say('VALE: Now. Let me hear how you play.');
    yield* OW.approach(vale, p);
    const res = yield* this.battle({ trainer: 'conductor1' });
    if (res !== 'win') return;
    State.setFlag('beat_conductor1');
    yield* say('VALE: Bravo. Truly.');
    yield* say('VALE: And now you think you\'ve stopped something. Listen, child. Can you hear it?');
    Sound.sfx('hum');
    Game.shake = 4;
    yield 40;
    yield* say('Under your feet, the whole tower is humming. So are the walls. So is the city outside.');
    yield* say('VALE: The GRAND RESONATOR was never meant to play the song here. For months it has been tuning.');
    yield* say('VALE: Every SONANCE line in VALEMORA. Every streetlight, every water pump, every windmill that ever took my money. All of them hum my countermelody now, very softly.');
    yield* say('VALE: When the last stone sings, the performance will begin where the first song was sung. At the RIFT itself.');
    yield* say('VALE: The SUNKEN SHRINE.');
    yield* say('VALE: And the last stone? Oh, child.');
    yield* say('VALE: You will bring me the rest yourself.');
    yield* say('VALE: MORROW. The boat.');
    const morrow = OW.npc('h4_morrow');
    if (morrow) yield* OW.walkTo(morrow, 10, 14);
    yield* OW.walkTo(vale, 10, 13);
    if (morrow) {
      yield* OW.walk(morrow, 'down', 1);
      OW.despawn(morrow);
    }
    yield* OW.walk(vale, 'down', 1);
    yield* OW.walk(vale, 'down', 1);
    Sound.sfx('exit');
    OW.despawn(vale);
    yield 40;
    // KAI runs in.
    const kai = yield* this.arrive({ id: 'kai_h4', person: 'rival' }, p, 'south');
    yield* say('KAI: {PLAYER}! I just passed a guy with a CELLO on the stairs! He smiled at me! Was that HIM?!');
    yield* say('{PLAYER} told KAI everything.');
    yield* say('KAI: Tuning? Every SONANCE line in VALEMORA? Then the whole country is one big speaker for his song...');
    yield* say('KAI: ...Then we unplug it. ALL of it. There has to be a master switch somewhere up here.');
    kai.emote = 30;
    Sound.sfx('exclaim');
    yield 30;
    yield* say('KAI: There! That huge lever by the wall! Come on!');
    yield* OW.walkTo(kai, 17, 4);
    kai.dir = 'right';
  },

  *masterSwitch() {
    if (State.flag('switch_thrown')) return;
    if (!State.flag('beat_conductor1')) {
      yield* say('A huge lever marked MASTER. It\'s locked in place while the GRAND RESONATOR plays.');
      return;
    }
    const p = OW.player;
    let kai = OW.npc('kai_h4');
    if (!kai) kai = yield* this.arrive({ id: 'kai_h4', person: 'rival' }, p);
    yield* say('A huge lever marked MASTER. Every SONANCE line in VALEMORA runs through this switch.');
    yield* say('KAI: On three. One... two...');
    yield* say('KAI: THREE!');
    Sound.sfx('rumble');
    Game.shake = 20;
    State.setFlag('switch_thrown');
    const lever = OW.npc('h4_switch');
    if (lever) OW.despawn(lever);
    this.spawnDef('h4_switchoff');
    yield 40;
    Sound.stopMusic();
    yield* say('{PLAYER} and KAI hauled the lever down together!');
    yield* say('The hum stopped.');
    yield* Game.fadeOut(40);
    OW.despawn(kai);
    yield* this.blackCard(['Every light in the tower went out.', 'And then, one after another, every light in SILVERFALL CITY.']);
    yield* this.silverfallDark();
  },

  // The night SILVERFALL went dark.
  *silverfallDark() {
    State.setFlag('sf_night');
    OW.loadMap('silverfall', 25, 9, 'up');
    Sound.playMusic('grove');
    const people = [
      OW.spawn({ id: 'sfn_woman', person: 'woman', x: 22, y: 10, dir: 'up' }),
      OW.spawn({ id: 'sfn_boy', person: 'boy', x: 31, y: 10, dir: 'up' }),
      OW.spawn({ id: 'sfn_old', person: 'oldman', x: 24, y: 12, dir: 'up' }),
      OW.spawn({ id: 'sfn_girl', person: 'lass', x: 28, y: 12, dir: 'up' }),
    ];
    const kai = OW.spawn({ id: 'sfn_kai', person: 'rival', x: 24, y: 9, dir: 'up' });
    yield* Game.fadeIn(60);
    yield* say('For the first time in years, SILVERFALL CITY is dark.');
    yield* say('One by one, people step out into the streets... and look up.');
    yield* say('The sky is full of stars.');
    yield* say('WOMAN: I\'ve lived here my whole life. I never knew there were so many...');
    yield* say('BOY: Mom! Mom, look! A shooting star!');
    yield* say('OLD MAN: Ha! I\'d forgotten. I\'d honestly forgotten what the sky looks like.');
    OW.faceTowards(kai, OW.player);
    OW.faceTowards(OW.player, kai);
    yield* say('KAI: ...Ryker used to take me up on the roof to look at stars. Back home. Before the LEAGUE.');
    yield* say('KAI: He knew all their names. I forgot most of them.');
    yield* say('KAI: ...I\'m going home for a bit. Mom should hear about Ryker from me. Not from some GRUNT\'s letter.');
    yield* say('KAI: You\'ll be fine without me, right? ...Don\'t answer that.');
    yield* this.leave(kai, 36, 16);
    // NERISSA brings word from HOLT.
    const nerissa = yield* this.arrive({ id: 'sfn_nerissa', person: 'nerissa' }, OW.player, 'east');
    yield* say('NERISSA: {PLAYER}! I saw every light on the coast go out from the harbor, and I just knew it was you.');
    yield* say('NERISSA: HOLT\'s sent word to every WARDEN in VALEMORA. We\'re meeting in GRAYHAVEN. Tonight.');
    yield* say('NERISSA: He wants you there too. My boat\'s at the river mouth. Come on, it\'s faster than walking!');
    yield* Game.fadeOut(40);
    OW.despawn(nerissa);
    for (const e of people) OW.despawn(e);
    yield* this.blackCard(['NERISSA\'s boat raced up the dark coast to GRAYHAVEN...']);
    State.setFlag('council_called');
    OW.loadMap('gym', 6, 14, 'up');
    yield* Game.fadeIn(40);
    yield* this.wardenCouncil();
  },

  // -- GRAYHAVEN GYM: the WARDENS' council -----------------------------------------------------
  *wardenCouncil() {
    if (State.flag('council_done')) return;
    const p = OW.player;
    const holt = OW.npc('holt_gym');
    yield* OW.walkTo(p, 6, 8);
    p.dir = 'up';
    yield* say('Seven WARDENS stand in a circle under the lamps of GRAYHAVEN GYM.');
    yield* say('HOLT: Everyone\'s here. Well. Nearly everyone.');
    yield* say('HOLT: {PLAYER}. Tell them what you told NERISSA.');
    yield* say('{PLAYER} told the WARDENS about the GRAND RESONATOR, and the tuning, and AUGUST VALE, and the SUNKEN SHRINE.');
    yield 30;
    const cantor = OW.npc('cn_cantor');
    if (cantor) OW.faceTowards(cantor, p);
    yield* say('CANTOR: ...So it is him. My AUGUST.');
    yield* say('CANTOR: He was the gentlest boy I ever taught. He cried when a string broke.');
    yield* say('IVY: He\'s tuned every SONANCE line? My greenhouse pumps run on SONANCE power!');
    yield* say('TOR: So does half the quarry. And the new bridge. He paid for the whole thing, remember?');
    yield* say('WREN: Not the farm! Grandpa\'s windmill never needed anybody\'s power but the wind\'s.');
    yield* say('SAHRA: "You will bring me the rest yourself." He means the BADGES. Every one holds a sliver of a KEYSTONE.');
    yield* say('HOLT: There\'s worse news. Seven of us came when I called. The eighth didn\'t answer.');
    yield* say('HOLT: NOX. WARDEN of STARFALL ISLE, keeper of the STARSTONE, and the LEADER of the last GYM.');
    yield* say('HOLT: Not one word from her in a week. NOX has never missed a letter in her life.');
    yield* say('NERISSA: STARFALL is a long sail. Clear around the eastern cape. I can have the GUST ready by tomorrow.');
    yield* say('CANTOR: Before anyone sails anywhere, there is something else.');
    yield* say('CANTOR: The FIRST SCORE, the song the first WARDENS sang to seal the RIFT, was never written down in full. Its final verse is lost.');
    yield* say('CANTOR: The old books say it was carved into the standing stones of the MYSTIC GROVE...');
    yield* say('CANTOR: ...and that it can only be read on a night without a moon.');
    yield* say('SAHRA: ...Tonight is the new moon.');
    yield* say('CANTOR: Then tonight it must be.');
    yield* say('SAHRA: I\'ll fetch PROF. LINDEN. He\'s wanted to see those stones for twenty years.');
    yield* say('NERISSA: The GUST can be at the MARSHLAND landing by midnight. {PLAYER}, take ROUTE 6 south from CEDARWOOD. The floods have gone down.');
    yield* say('NERISSA: From the GROVE, I\'ll take you straight on to STARFALL.');
    if (holt) OW.faceTowards(holt, p);
    yield* say('HOLT: {PLAYER}. Seven BADGES. Seven slivers of the old chord.');
    yield* say('HOLT: Whatever the CONDUCTOR needs, you\'re carrying most of it. Be careful out there.');
    State.setFlag('council_done');
    State.setFlag('sf_night', false);
    yield* Game.fadeOut(30);
    for (const id of ['cn_cantor', 'cn_ivy', 'cn_tor', 'cn_nerissa', 'cn_sahra', 'cn_wren']) {
      const e = OW.npc(id);
      if (e) OW.despawn(e);
    }
    Sound.playMusic(OW.music());
    yield* Game.fadeIn(30);
    yield* say('The WARDENS hurried out into the night.');
  },

  *councilTalk() {
    yield* say('The WARDENS are deep in conversation.');
  },

  // -- The MARSHLAND ---------------------------------------------------------------------------
  *marshHeal(npc) {
    yield* say('GRANNY: Out in the mist at this hour? Your poor AIMON must be soaked through.');
    yield* say('GRANNY: Sit by the stove a while, dear.');
    yield* this.healJingle();
    OW.faceTowards(npc, OW.player);
    yield* say('GRANNY: There. Warm and dry. Now mind the boardwalks on your way back.');
  },

  // NERISSA's boat: from the MARSHLAND landing, the GROVE, or STARFALL.
  *sail(to) {
    const dest = {
      marshland: ['marshland', 15, 24, 'up'],
      grove: ['grove', 14, 21, 'up'],
      starfall: ['starfall', 16, 25, 'up'],
    }[to];
    Sound.sfx('confirm');
    yield* Game.fadeOut(30);
    if (to === 'starfall' && !State.flag('st_arrived')) {
      yield* this.blackCard([
        'NERISSA\'s boat sailed on through the night, around the eastern cape...',
        '...and all through the next day, with the wind at its back.',
        'By the time STARFALL ISLE rose out of the sea, night had fallen again.',
      ]);
    } else {
      yield* this.blackCard(['The GUST cut through the dark water...']);
    }
    OW.loadMap(...dest);
    yield* Game.fadeIn(30);
  },

  *boatMenu(here) {
    const places = [['marshland', 'MARSHLAND'], ['grove', 'MYSTIC GROVE']];
    if (State.flag('grove_done')) places.push(['starfall', 'STARFALL']);
    const opts = places.filter(([id]) => id !== here);
    const i = yield* Dialog.ask('NERISSA: Where to?', [...opts.map((o) => o[1]), 'STAY'], { cancel: opts.length });
    if (i < 0 || i >= opts.length) {
      yield* say('NERISSA: I\'ll be right here when you need me.');
      return;
    }
    yield* this.sail(opts[i][0]);
  },

  *nerissaBoat(npc) {
    OW.faceTowards(npc, OW.player);
    if (!State.flag('grove_arrived')) {
      yield* say('NERISSA: There you are! The GUST is ready, and there\'s not a scrap of moon tonight.');
      yield* say('NERISSA: The MYSTIC GROVE is out past the reef. SAHRA and the PROFESSOR went ahead an hour ago.');
      const yes = yield* Dialog.yesNo('NERISSA: Shall we cast off?');
      if (!yes) {
        yield* say('NERISSA: Don\'t take too long. The night won\'t wait.');
        return;
      }
      yield* this.sail('grove');
      return;
    }
    yield* this.boatMenu('marshland');
  },

  // -- The MYSTIC GROVE -------------------------------------------------------------------------
  *groveBoat() {
    if (!State.flag('grove_done')) {
      yield* say('NERISSA: I\'ll wait with the boat. Go and see what those stones have to say!');
      const back = yield* Dialog.yesNo('NERISSA: ...Unless you want to head back to the MARSHLAND?');
      if (back) yield* this.sail('marshland');
      return;
    }
    if (!State.flag('st_arrived')) {
      yield* say('NERISSA: STARFALL is clear across VALEMORA. We\'ll sail all night, and all day tomorrow.');
      const yes = yield* Dialog.yesNo('NERISSA: Ready to go?');
      if (yes) yield* this.sail('starfall');
      else yield* say('NERISSA: Say the word when you\'re ready.');
      return;
    }
    yield* this.boatMenu('grove');
  },

  *groveArrive() {
    if (State.flag('grove_done') || OW.busy > 1) return;
    State.setFlag('grove_arrived');
    const p = OW.player;
    const linden = OW.npc('gr_linden');
    const sahra = OW.npc('gr_sahra');
    const vesper = OW.npc('gr_vesper');
    Sound.sfx('pad');
    yield* say('In the dark, a ring of standing stones glows softly blue, like moonlight with no moon to make it.');
    yield* say('PROF. LINDEN: {PLAYER}! Over here! Quickly, quickly!');
    yield* OW.walkTo(p, 14, 11);
    p.dir = 'up';
    if (linden) OW.faceTowards(linden, p);
    yield* say('PROF. LINDEN: Twenty years I\'ve wanted to see these stones on a moonless night. Twenty years! Look at them!');
    if (sahra) OW.faceTowards(sahra, p);
    yield* say('SAHRA: The carvings only show when there\'s no moonlight to hide them. The whole grove is one long verse, stone to stone.');
    yield* say('SAHRA: And it all leads here. To the altar.');
    if (linden) linden.dir = 'up';
    if (sahra) sahra.dir = 'up';
    Sound.sfx('bell');
    Game.shake = 3;
    yield 40;
    yield* say('The letters on the altar blaze with light.');
    yield* say('PROF. LINDEN: "When the eight fall silent and the tear is wide,\nlet no one sing alone."');
    yield* say('SAHRA: And the last line...');
    yield* say('SAHRA: "Eight voices, one song, forward, together...\nand the one who carries all eight sings last."');
    yield 30;
    if (linden) OW.faceTowards(linden, p);
    yield* say('PROF. LINDEN: "The one who carries all eight." {PLAYER}, that\'s the CHAMPION\'S OATH. The one who holds all eight BADGES.');
    yield* say('PROF. LINDEN: The first WARDENS didn\'t seal the RIFT alone. Someone sang with them. Someone who carried every stone\'s note at once.');
    // VESPER has been watching.
    if (vesper) {
      vesper.emote = 30;
      Sound.sfx('exclaim');
      yield 30;
      yield* say('???: Took you long enough.');
      p.dir = 'right';
      yield* OW.approach(vesper, p);
      yield* say('VESPER: Relax, kid. I\'m not here to fight.');
      yield* say('VESPER: I\'ve been reading these stones for a year. Just never without a moon. I finished the verse about an hour before you did.');
      yield* say('VESPER: So listen, because I\'m only saying this once. The CONDUCTOR\'s recordings are wrong.');
      yield* say('VESPER: He never got the MILLSTONE. WREN\'s windmill kept turning. And MORROW\'s BELLSTONE recording is one note. Half a song, if that.');
      yield* say('VESPER: Play songs like that backwards, off-key and full of holes, and the RIFT won\'t open cleanly. It\'ll tear.');
      yield* say('VESPER: So he needs clean notes. Real ones. And there\'s only one place left in VALEMORA where all eight stones sing together.');
      yield* say('VESPER looked at your BADGE case.');
      yield* say('VESPER: When he plays, your BADGES will answer.');
      yield* say('VESPER: Don\'t let him hear them first.');
      if (sahra) OW.faceTowards(sahra, vesper);
      yield* say('SAHRA: ...Why are you telling us this?');
      yield* say('VESPER: I joined TEAM DISTORTION to find out the truth about the RIFT. Well, I found it. And he\'s wrong.');
      yield* say('VESPER: One more thing. MORROW took a boatload of GRUNTS to STARFALL ISLE a week ago. Your eighth WARDEN hasn\'t been heard from since.');
      yield* say('VESPER: I\'m going to find her. Get there fast, kid. MORROW\'s never late.');
      yield* this.leave(vesper, 25, 12);
      yield* say('VESPER vanished into the dark between the trees.');
    }
    if (sahra) OW.faceTowards(sahra, p);
    yield* say('SAHRA: ...I think she meant every word.');
    if (linden) OW.faceTowards(linden, p);
    yield* say('PROF. LINDEN: STARFALL ISLE. NERISSA can take you straight there. SAHRA and I will copy down every word of these stones, and take them to HOLT.');
    yield* say('PROF. LINDEN: Go, {PLAYER}. And... I\'m proud of you. I should say that more often.');
    State.setFlag('grove_done');
  },

  *groveLinden(npc) {
    if (!State.flag('grove_done')) {
      yield* this.groveArrive();
      return;
    }
    OW.faceTowards(npc, OW.player);
    if (npc.def.person === 'sahra') yield* say('SAHRA: The PROFESSOR\'s copying the stones. I\'m holding the lamp. Go on, STARFALL is waiting!');
    else yield* say('PROF. LINDEN: "Eight voices, one song." Remarkable. Go on, {PLAYER}! NERISSA is waiting at the pier!');
  },

  *groveVesper() {
    yield* this.groveArrive();
  },

  *groveVerse() {
    if (State.flag('grove_done')) {
      yield* say('The altar\'s carvings glow softly:\n"Eight voices, one song, forward, together...\fand the one who carries all eight sings last."');
      return;
    }
    yield* say('An ancient stone altar. Faint carvings cover its face, too dim to read.');
  },

  *groveStone() {
    yield* say('A standing stone, glowing a soft, cold blue. Old carvings wind around it, too worn to read up close.\fThey seem to lead toward the altar.');
  },

  // -- STARFALL ISLE ---------------------------------------------------------------------------
  *starfallArrive() {
    if (State.flag('st_arrived')) return;
    State.setFlag('st_arrived');
    yield* say('STARFALL ISLE. Violet crystals glitter in the grass, and a white observatory dome sits at the top of the hill.');
    const nerissa = OW.npc('st_nerissa');
    if (nerissa) OW.faceTowards(nerissa, OW.player);
    yield* say('NERISSA: NOX lives up in that observatory. It\'s the GYM too.');
    yield* say('NERISSA: ...And it looks like she has company. See the black coats at the door?');
    yield* say('NERISSA: I\'ll stay with the GUST. Go get her, {PLAYER}!');
  },

  *starfallBoat(npc) {
    if (npc && npc.def && npc.def.person) OW.faceTowards(npc, OW.player);
    if (State.flag('countermelody')) yield* say('NERISSA: The sea\'s gone violet all the way to the horizon... Whatever you need, {PLAYER}, the GUST is ready.');
    else if (!State.flag('badge_star')) yield* say('NERISSA: NOX is somewhere in that observatory. I\'ll keep the GUST ready in case we need to leave in a hurry.');
    yield* this.boatMenu('starfall');
  },

  *starShardInspect() {
    yield* say('A violet crystal, warm to the touch. It fell out of the sky long ago, and still hums faintly.');
  },

  *starGift(npc) {
    OW.faceTowards(npc, OW.player);
    if (State.flag('st_gift')) {
      yield* say('GRANNY: NOX used to sit right where you\'re standing and name every star through the window. Every one.');
      return;
    }
    yield* say('GRANNY: Come to see NOX, dear? Those black coats locked the whole observatory up tight.');
    yield* say('GRANNY: Here. My husband always said you can\'t go stargazing on an empty stomach.');
    State.setFlag('st_gift');
    yield* this.receive('moozlemilk', 3);
  },

  // -- The observatory ---------------------------------------------------------------------------
  *archiveDoor() {
    if (State.flag('nox_freed')) {
      yield* say('The archive door hangs open.');
      return;
    }
    yield* say('A heavy steel door, bolted shut with a TEAM DISTORTION lock. The key is nowhere to be seen.');
    Sound.sfx('door');
    yield* say('Someone knocks from the other side.');
    yield* say('???: Hello? If you\'re another GRUNT, go away. I\'ve told you twice: the STARSTONE doesn\'t belong to you.');
    yield* say('???: ...A trainer? With BADGES? Then don\'t waste time on this lock!');
    yield* say('NOX: I\'m NOX. This is my observatory. Get up to the dome! They\'re recording the STARSTONE tonight!');
    yield* say('NOX: I\'ll find my own way out. I always do.');
  },

  *starstoneInspect() {
    yield* say('The STARSTONE: a fallen star, still glowing, resting on a plinth under the open dome.\fIt hums a single low note, too deep for people to hear.');
  },

  *morrowStarstone() {
    if (State.flag('obs_morrow') || OW.busy > 1) return;
    const p = OW.player;
    const morrow = OW.npc('o2_morrow');
    if (!morrow) return;
    yield* OW.walkTo(p, 2, 13);
    p.dir = 'right';
    yield* say('The dome\'s floor is open sky: stars below as well as above. Across the dark, a fallen star glows on a stone plinth. A man in a dark coat stands before it, an hourglass turning in his hand.');
    morrow.dir = 'left';
    yield 20;
    yield* say('MORROW: Ah, child. Late, for once.');
    yield* say('MORROW: No. I was early. It hardly matters which.');
    yield* say('MORROW: The STARSTONE has been recorded. Five stones and a half, and now a sixth. Enough to begin.');
    yield* say('MORROW: The CONDUCTOR will find the rest where he always meant to find it. You know where. You carry it.');
    yield* say('MORROW: Time was always on my side.');
    yield* say('MORROW: We will meet again at the end, you and I. Tick... tock.');
    yield* OW.walkTo(morrow, 10, 4);
    Sound.sfx('pad');
    yield* BattleFX.tween(20, () => { morrow.hidden = !morrow.hidden; });
    OW.despawn(morrow);
    yield* say('MORROW stepped onto the warp pad and vanished! Its light flickered and went dark.');
    yield 30;
    // VESPER has freed NOX.
    yield* say('Footsteps hurry up the stairs.');
    const vesper = OW.spawn({ id: 'o2_vesper', person: 'vesper', x: 1, y: 14, dir: 'up' });
    yield* OW.walkTo(vesper, 1, 12);
    const nox = OW.spawn({ id: 'o2_nox', person: 'nox', x: 1, y: 14, dir: 'up', script: 'noxGym' });
    yield* OW.walkTo(nox, 0, 13);
    OW.faceTowards(p, vesper);
    OW.faceTowards(vesper, p);
    yield* say('VESPER: Too late? ...Figures. MORROW\'s never late.');
    OW.faceTowards(nox, p);
    yield* say('NOX: I\'m NOX. WARDEN of STARFALL ISLE, and LEADER of this GYM. For the past week, I\'ve been a prisoner in my own star archive.');
    yield* say('NOX: Until this one crawled in through the air vent and picked the lock from the inside.');
    yield* say('VESPER: You\'re welcome.');
    yield* say('VESPER: I told you at the grove, kid. I\'m done with them. Consider this me paying back the lighthouse. And the dig site. And... all of it.');
    yield* say('VESPER: Now we\'re even.');
    yield* this.leave(vesper, 1, 14);
    Sound.sfx('exit');
    State.setFlag('nox_freed');
    State.setFlag('obs_morrow');
    yield* say('NOX: TEAM DISTORTION\'s own VESPER, freeing a WARDEN. The stars really are strange tonight.');
    yield* say('NOX: They copied the STARSTONE\'s song. But a copy isn\'t a voice. The stone still sings.');
    yield* say('NOX: And you carry seven BADGES. So you know why a trainer climbs all the way up my observatory.');
    yield* say('NOX: This dome is my GYM. Its floor is open sky, and only one path of stars crosses it.');
    yield* say('NOX: It\'s almost midnight. Come and find me by the STARSTONE, and we\'ll battle properly. Under the open dome.');
    yield* say('NOX: If the dark gets the better of you, my chart of THE WANDERER is in the archive downstairs.');
    yield* OW.walkTo(nox, 8, 7);
    nox.dir = 'down';
    yield* say('NOX walked out across the dark as if it were solid ground.');
  },

  // -- GYM 8: NOX under the dome ---------------------------------------------------------------
  *noxGym(npc) {
    if (npc) OW.faceTowards(npc, OW.player);
    if (State.flag('countermelody')) {
      yield* say('NOX: The sky\'s still violet. The CONDUCTOR has started his performance.');
      yield* say('NOX: HOLT will call the WARDENS to SEABREEZE. That\'s the nearest port to the SUNKEN SHRINE. Rest, {PLAYER}. Then go.');
      return;
    }
    if (State.flag('badge_star')) {
      yield* say('NOX: Eight BADGES. "The one who carries all eight sings last."');
      return;
    }
    yield* say('NOX: Midnight. The dome\'s open, and every star is out. Well. Almost every star.');
    yield* say('NOX: People think the dark is empty. It isn\'t. The dark is where the stars live. You just have to be patient enough to see them.');
    yield* say('NOX: DARK-type AIMON are the same. They wait. They watch. And then they strike.');
    yield* say('NOX: Show me what shines in you, {PLAYER}!');
    const res = yield* this.battle({ trainer: 'nox' });
    if (res !== 'win') return;
    State.setFlag('beat_nox');
    yield* say('NOX: ...So that\'s what shines in you.');
    yield* say('NOX: This is the STAR BADGE. There\'s a sliver of the STARSTONE inside, and its note is still true.');
    yield* this.awardBadge(7, 'NOX');
    yield* say('NOX: And take this. TM08 SHADOW BALL. Throw a little of the dark back at them.');
    yield* this.receive('tm08', 1);
    const count = BADGES.filter((b) => State.d.badges[b.id]).length;
    if (count >= 8) yield* this.championsOath(npc);
  },

  // Eight BADGES sing as one, and the sky turns violet.
  *championsOath(nox) {
    yield 30;
    Sound.sfx('bell');
    yield* say('{PLAYER}\'s BADGE case began to glow...');
    Sound.sfx('pad');
    Game.shake = 3;
    yield 30;
    yield* say('All eight slivers inside it are humming. Eight notes, one chord, clear and bright.');
    yield* say('NOX: The CHAMPION\'S OATH... I\'ve read about it my whole life. I never thought I\'d hear it.');
    yield* say('NOX: "Eight voices, one song."');
    yield* say('NOX: Then you\'re the one who sings last.');
    yield 40;
    Sound.sfx('rumble');
    Game.shake = 24;
    yield 30;
    if (nox) nox.emote = 30;
    Sound.sfx('exclaim');
    yield 30;
    yield* say('NOX: ...Do you feel that?');
    yield* say('Through the slit in the dome, the stars flicker... and one by one, they go out.');
    State.setFlag('countermelody');
    yield* this.violetSky();
  },

  *violetSky() {
    yield* Game.fadeOut(40);
    Sound.playMusic('resonator');
    const start = Game.frame;
    const scene = { opaque: true };
    scene.draw = (g) => {
      const t = Game.frame - start;
      // A violet sky over the southern sea.
      for (let y = 0; y < 100; y++) {
        const k = y / 100;
        g.fillStyle = `rgb(${Math.round(40 + 70 * k)},${Math.round(12 + 18 * k)},${Math.round(70 + 60 * k)})`;
        g.fillRect(0, y, SCREEN_W, 1);
      }
      // The stars going out.
      for (let i = 0; i < 24; i++) {
        const sx = (i * 97) % SCREEN_W;
        const sy = (i * 37) % 70;
        const life = 1 - Math.min(1, Math.max(0, (t - i * 6) / 60));
        if (life <= 0) continue;
        g.globalAlpha = life;
        g.fillStyle = '#f8f0ff';
        g.fillRect(sx, sy, 1, 1);
      }
      g.globalAlpha = 1;
      // The sea.
      g.fillStyle = '#281040';
      g.fillRect(0, 100, SCREEN_W, 60);
      g.fillStyle = '#48207a';
      for (let i = 0; i < 18; i++) {
        const wx = (i * 53 + Math.floor(t / 3)) % (SCREEN_W + 20) - 10;
        g.fillRect(wx, 104 + (i * 7) % 50, 8, 1);
      }
      // The SUNKEN SHRINE rising from the water: a drowned temple, lit from inside.
      const rise = Math.min(1, t / 240);
      const top = Math.round(100 - 50 * rise);
      const dark = '#140820';
      g.fillStyle = '#7a3ab0';
      g.fillRect(92, top + 12, 56, 14);
      g.fillStyle = '#d898ff';
      g.fillRect(116, top + 15, 8, 11);
      g.fillStyle = dark;
      for (let i = 0; i < 6; i++) g.fillRect(92 + i * 10, top + 12, 4, 14);
      // Pediment and roof.
      for (let r = 0; r < 12; r++) g.fillRect(120 - (r * 3 + 4), top + r, (r * 3 + 4) * 2, 1);
      g.fillStyle = '#301448';
      g.fillRect(96, top + 9, 48, 1);
      // Steps and a broken base, dripping into the sea.
      g.fillStyle = dark;
      g.fillRect(86, top + 26, 68, 4);
      g.fillRect(80, top + 30, 80, 100 - top - 30);
      g.fillRect(74, top + 36, 6, 100 - top - 36);
      g.fillRect(160, top + 34, 5, 100 - top - 34);
      // Its reflection in the water.
      g.globalAlpha = 0.35 * rise;
      g.fillStyle = '#7a3ab0';
      for (let y = 0; y < 18; y += 2) g.fillRect(84 + ((y * 3 + Math.floor(t / 8)) % 5), 103 + y, 72 - y * 2, 1);
      g.globalAlpha = 1;
      // The tear above it.
      if (rise >= 1) {
        const pulse = 0.5 + 0.4 * Math.sin(t / 10);
        g.globalAlpha = pulse * 0.5;
        Pix.ellipse(g, 120, top - 20, 9, 20, '#b060f0');
        g.globalAlpha = pulse;
        Pix.ellipse(g, 120, top - 20, 4, 15, '#d898ff');
        g.globalAlpha = 1;
        g.fillStyle = '#ffffff';
        g.fillRect(120, top - 32, 1, 24);
      }
      g.fillStyle = '#281040';
      g.fillRect(0, 100, SCREEN_W, 2);
    };
    Game.push(scene);
    yield* Game.fadeIn(40);
    yield* say('That same night, the sky over the south of VALEMORA turned violet.', DARK);
    yield () => Game.frame - start > 240;
    yield* say('Far out in the southern sea, the SUNKEN SHRINE rose from the waves.', DARK);
    yield* say('And all across VALEMORA, AIMON began to fall silent.', DARK);
    yield* say('Somewhere in the dark, a man raised his bow.\fThe COUNTERMELODY had begun.', DARK);
    yield* say('TO BE CONTINUED...', DARK);
    yield* Game.fadeOut(40);
    Game.remove(scene);
    Sound.playMusic(OW.music());
    yield* Game.fadeIn(30);
    const lead = State.party.find((m) => !m.fainted) || State.party[0];
    if (lead) {
      yield* say(`${lead.name} is looking up at {PLAYER}... and doesn't make a sound.`);
      yield* say('NOX: It\'s happening everywhere. Listen: not one AIMON on the island is calling.');
      yield* say('NOX: HOLT will call the WARDENS to SEABREEZE, the nearest port to the SUNKEN SHRINE. Rest, {PLAYER}. Then go.');
    }
  },
});

Events.kaiSouthRoad.when = () => State.flag('letter_read') && !State.flag('kai_south');
Events.kaiVolcano.when = () => State.flag('letter_read') && !State.flag('ep_kai');
Events.forgeEnter.when = () => !State.flag('forge_seen');
Events.kaiPumps.when = () => !State.flag('pumps_off');
Events.rykerCrater.when = () => !State.flag('beat_ryker');
Events.morrowResonator.when = () => !State.flag('beat_morrow3');
Events.conductorResonator.when = () => State.flag('beat_morrow3') && !State.flag('beat_conductor1');
Events.wardenCouncil.when = () => State.flag('council_called') && !State.flag('council_done');
Events.groveArrive.when = () => !State.flag('grove_done');
Events.starfallArrive.when = () => !State.flag('st_arrived');
Events.morrowStarstone.when = () => !State.flag('obs_morrow');
