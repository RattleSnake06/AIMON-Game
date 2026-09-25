'use strict';
// Chapter 6 story: home to WILLOWBROOK along ROUTE 9, where PROF. LINDEN
// finds that the BADGES "listen" and sends the player to SAHRA; KAI at home.
// Chapter 7 story: the dune road to SUNSPIRE RUINS, TEAM DISTORTION's dig
// site, ADMIN VESPER at the FIRST SCORE, and GYM LEADER SAHRA (GYM 5).

Object.assign(Events, {
  // -- WILLOWBROOK: coming home ----------------------------------------------------------
  *wbHomecoming() {
    State.setFlag('wb_home');
    const p = OW.player;
    yield* say('The river, the old willow, the smell of MOM\'s cooking...\fWILLOWBROOK TOWN. Home.');
    const aide = yield* this.arrive({ id: 'aide_wb', person: 'aide' }, p, 'south');
    yield* say('AIDE: {PLAYER}! You\'re back! PROF. LINDEN has been pacing the lab all morning.');
    yield* say('AIDE: He heard about your fourth BADGE and wants to see them right away. He says it\'s important!');
    yield* say('AIDE: The lab\'s at the south end of town, as always. See you there!');
    yield* this.leave(aide, 12, 19);
  },

  // -- The lab: the BADGES are listening --------------------------------------------------
  *lindenBadges() {
    State.setFlag('linden_notes');
    const p = OW.player;
    const prof = OW.npc('prof');
    prof.emote = 30;
    Sound.sfx('exclaim');
    yield 30;
    yield* OW.approach(prof, p);
    yield* say('PROF. LINDEN: {PLAYER}! Welcome home! HOLT, IVY, NERISSA, and now TOR... Four BADGES!');
    yield* say('PROF. LINDEN: May I see them? I\'ve been dying to test an idea.');
    yield* say('{PLAYER} opened the BADGE case.');
    Sound.sfx('pad');
    yield 20;
    yield* say('The four slivers of KEYSTONE begin to glow...\fand to hum. Four notes, together, like a single chord.');
    yield* say('PROF. LINDEN: Remarkable. They\'re in harmony. Your BADGES are listening, {PLAYER}.');
    yield* say('PROF. LINDEN: I\'ve been studying the old texts HOLT sent me. I don\'t think the CHAMPION\'S OATH is just a ceremony.');
    yield* say('PROF. LINDEN: Each BADGE holds a sliver of its WARDEN\'s KEYSTONE. Eight slivers, sung together, could renew the seal on the RIFT itself.');
    yield* say('PROF. LINDEN: And TEAM DISTORTION is recording the KEYSTONES\' songs to play them backwards. If they tear the seal open...');
    yield* say('PROF. LINDEN: ...someone may need to sing it closed again.');
    yield* say('PROF. LINDEN: There\'s one person who knows that old song better than anyone alive. SAHRA, the WARDEN of SUNSPIRE RUINS.');
    yield* say('PROF. LINDEN: She\'s spent twenty years digging up the FIRST SCORE: carvings of the very song that sealed the RIFT.');
    yield* say('PROF. LINDEN: But she\'s stopped answering my letters. After what happened to IVY... I don\'t like it one bit.');
    yield* say('PROF. LINDEN: Would you take her my notes? She\'ll know what to make of them.');
    yield* this.receive('lindennotes', 1);
    yield* say('PROF. LINDEN: SUNSPIRE is far to the west. Take ROUTE 5 to CEDARWOOD, then follow the old caravan road, ROUTE 10, into the desert.');
    yield* say('PROF. LINDEN: Oh, and KAI came home last night too. Do say hello before you go. His mother would like that.');
    yield* OW.walkTo(prof, 9, 3);
    prof.dir = 'down';
  },

  // -- KAI's house: the missing brother -------------------------------------------------------
  *kaiHome() {
    State.setFlag('kai_home_seen');
    const p = OW.player;
    const lena = OW.npc('lena');
    const kai = OW.spawn({ id: 'kai_home', person: 'rival', x: 6, y: 4, dir: 'left' });
    if (lena) {
      yield* OW.walkTo(lena, 3, 4);
      lena.dir = 'right';
    }
    yield* say('LENA: KAI... did you write to your brother again? I saw the envelope on the table.');
    yield* say('KAI: Mom. RYKER\'s not going to write back. He never does.');
    yield* say('LENA: You don\'t know that. Eight years, and I still set a plate for him at dinner. Just in case.');
    kai.emote = 30;
    Sound.sfx('exclaim');
    yield 30;
    yield* OW.approach(kai, p);
    yield* say('KAI: ...Oh. Hey, {PLAYER}. How long have you been standing there?');
    yield* say('KAI: You heard that, huh. RYKER won all eight BADGES. Everyone said he\'d be CHAMPION for sure.');
    yield* say('KAI: Then he lost the final match... and he just never came home. No letters. Nothing.');
    yield* say('KAI: But RYKER didn\'t just disappear. When I\'m CHAMPION, he\'ll hear about it, wherever he is.');
    yield* say('KAI: Anyway! I heard you flattened TOR. Four BADGES each. We\'re even...\fNot for long, though!');
    yield* say('KAI: I\'m heading out. See you on the road, {PLAYER}!');
    yield* OW.walk(p, 'left', 1);
    p.dir = 'right';
    yield* OW.walkTo(kai, 5, 8);
    Sound.sfx('door');
    OW.despawn(kai);
    if (lena) OW.faceTowards(lena, p);
    yield* say('LENA: Stubborn to the bone. Just like his brother.\fLook after each other out there, {PLAYER}.');
  },

  // -- CEDARWOOD: IVY's warning -----------------------------------------------------------------
  *ivyWest() {
    State.setFlag('ivy_west');
    const p = OW.player;
    const ivy = yield* this.arrive({ id: 'ivy_west', person: 'ivy' }, p, 'east');
    yield* say('IVY: {PLAYER}! Are you heading down the SUNSPIRE road?');
    yield* say('IVY: LINDEN sent you to SAHRA? She\'s a dear friend. She once dug up half my greenhouse looking for a clay pot.\fShe found three.');
    yield* say('IVY: But listen. All week, black coats have been marching west along that road. At night, in twos and threes.');
    yield* say('IVY: They were carrying shovels... and something that hummed.');
    yield* say('IVY: The sandstorm has died down, at least. If SAHRA is in trouble, she\'ll be glad to see you. Please be careful.');
    yield* this.leave(ivy, 12, 10);
  },

  // -- SUNSPIRE RUINS: SAHRA's apprentice -------------------------------------------------------
  *sunspireArrive() {
    State.setFlag('ss_arrived');
    const p = OW.player;
    const pip = yield* this.arrive({ id: 'pip_arrive', person: 'apprentice' }, p, 'west');
    yield* say('???: A trainer?! Oh, thank the sun! Please, you have to help us!');
    yield* say('PIP: I\'m PIP, LEADER SAHRA\'s apprentice. A week ago, TEAM DISTORTION took over our dig site under the ruins.');
    yield* say('PIP: SAHRA was down in the deepest gallery, at the FIRST SCORE. Then they set up a humming machine, and the whole site started to shake...');
    yield* say('PIP: A passage caved in, and SAHRA\'s trapped behind it! We can hear her shouting, but every time we dig, that machine brings more rock down.');
    yield* say('{PLAYER} showed PIP LINDEN\'S NOTES.');
    yield* say('PIP: PROF. LINDEN sent you? Then SAHRA will want to see you for sure. If we can get her out...');
    yield* say('PIP: The dig site is in the ruins to the north, past the GYM. Two of them are guarding the way in. Please hurry!');
    yield* OW.walkTo(pip, 17, 7);
    OW.despawn(pip);
    this.spawnDef('ss_pip');
  },

  // The second guard steps in if you try to slip past into the dig site.
  *digGuardStop() {
    const g = OW.npc('ss_grunt2');
    if (!g) return;
    yield* say('GRUNT: Hey! Where do you think you\'re going?');
    yield* this.trainerSpotted(g);
  },

  *pipTalk() {
    if (State.flag('beat_vesper2')) {
      yield* say('PIP: The humming stopped! Is SAHRA all right? Please, go check on her!');
      return;
    }
    if (State.flag('beat_ssgrunt1') && State.flag('beat_ssgrunt2')) {
      yield* say('PIP: You beat the guards! SAHRA\'s somewhere below. The passage caved in on the first floor, to the east.');
      return;
    }
    yield* say('PIP: The dig site entrance is just west of here, behind those two guards. Be careful!');
  },

  *sunSpireInspect() {
    yield* say('The SUN SPIRE. At its tip, a golden stone catches the light: the DUNESTONE, KEYSTONE of the desert.');
    if (State.flag('badge_dune')) yield* say('It hums one warm, low note.\fYour DUNE BADGE hums along with it.');
    else if (State.flag('dig_recorded')) yield* say('It hums one warm, low note.\fSomewhere far below, a machine hummed it back.');
    else yield* say('The door at its foot is sealed with a heavy stone slab.');
  },

  *sunCharmGift() {
    if (State.flag('gift_suncharm')) {
      yield* say('When I grow up, I\'m going to be an archaeologist like SAHRA! I\'ll dig up a whole city!');
      return;
    }
    yield* say('You\'re going into the ruins? Mom says it\'s dangerous down there. Take these, just in case!');
    State.setFlag('gift_suncharm');
    yield* this.receive('revive', 1);
  },

  *lakeCabinGift() {
    if (State.flag('gift_lakecabin')) {
      yield* say('Come back any time, dear. The kettle\'s always on, and the lake is always gold at sunset.');
      return;
    }
    yield* say('Oh my, a traveler on the lake road! It\'s been so quiet since the rockslide.');
    yield* say('You remind me of my grandson. He went off on his own journey too. Here, take these for the road.');
    State.setFlag('gift_lakecabin');
    yield* this.receive('superpotion', 3);
  },

  // -- DIG SITE B1F: SAHRA behind the rubble ----------------------------------------------------
  *sahraRubble() {
    if (State.flag('sahra_heard')) {
      yield* say('SAHRA (behind the rocks): Still here, kid! Shut off that machine! One floor down, where the DUNESTONE\'s roots come through!');
      return;
    }
    State.setFlag('sahra_heard');
    yield* say('A voice calls through the rubble...');
    yield* say('???: Hello?! Somebody\'s out there! You\'re not wearing a black coat, I hope?');
    yield* say('???: ...PIP sent you? And you\'ve got notes from LINDEN? Ha! That old worrier.');
    yield* say('SAHRA: I\'m SAHRA. And I\'m fine, before you ask. Bored out of my skull, but fine.');
    yield* say('SAHRA: Listen. Don\'t try to dig me out. Those clowns set a RESONATOR on the DUNESTONE\'s roots, one floor down.');
    yield* say('SAHRA: Every time it hums, the whole site shakes and more ceiling comes down. Shut that machine up, and my DUNARCH will do the rest.');
    yield* say('SAHRA: Go on, kid! And watch your head.');
  },

  // -- DIG SITE B2F: the RESONATOR --------------------------------------------------------------
  *digGuard() {
    yield* say('GRUNT: Stop right there! ADMIN VESPER is reading the wall.');
    yield* say('GRUNT: Nobody goes in until the recording\'s finished. Orders!');
  },

  *digScientist() {
    if (State.flag('dig_recorded')) {
      yield* say('SCIENTIST: The DUNESTONE\'s song is already on its way to the archive. There\'s nothing you can do now.');
      return;
    }
    yield* this.digResonator();
  },

  *digResonator() {
    const p = OW.player;
    const sci = OW.npc('dig_sci');
    if (!State.flag('dig_rec_heard')) {
      State.setFlag('dig_rec_heard');
      Sound.sfx('rumble');
      Game.shake = 8;
      yield* say('The RESONATOR is humming louder and louder. The golden roots around it pulse in time.');
      yield* say('SCIENTIST: RECORDING... 97 percent... 98 percent...');
      if (sci) {
        sci.emote = 30;
        Sound.sfx('exclaim');
        yield 30;
        OW.faceTowards(sci, p);
      }
      yield* say('SCIENTIST: Hey! Who let a kid down here?! ...Doesn\'t matter. You\'re too late!');
      yield* say('SCIENTIST: 99 percent... 100 percent!');
      Sound.sfx('pad');
      Game.shake = 16;
      yield* say('The RESONATOR lets out a long, rising note... and falls silent.');
      yield* say('SCIENTIST: RECORDING COMPLETE! The DUNESTONE\'s song belongs to TEAM DISTORTION!');
    }
    if (sci) yield* OW.approach(sci, p);
    yield* say('SCIENTIST: Now get lost! ...Or don\'t. I\'ve been dying to field-test these AIMON!');
    const res = yield* this.battle({ trainer: 'digsci' });
    if (res !== 'win') return;
    State.setFlag('beat_digsci');
    State.setFlag('dig_recorded');
    yield* say('SCIENTIST: Doesn\'t matter! The data\'s already on its way to the archive.');
    yield* say('SCIENTIST: And ADMIN VESPER wanted to meet the kid who keeps crashing our recitals. She\'s in the gallery, north.');
    yield* say('SCIENTIST: GUARD! Let the brat through!');
    const guard = OW.npc('dig_guard');
    if (guard) {
      yield* say('GRUNT: Fine, fine. It\'s your funeral, kid.');
      yield* this.leave(guard, 26, 8);
    }
    if (sci) sci.dir = 'up';
  },

  *digResonatorInspect() {
    if (State.flag('dig_recorded')) {
      yield* say('RESONATOR MK-IV. Its display reads:\n"DUNESTONE: RECORDED. UPLOADING TO ARCHIVE..."');
      return;
    }
    yield* say('A humming machine clamped onto the golden roots. Its display reads:\n"DUNESTONE: RECORDING... 97%"');
  },

  // -- DIG SITE B2F: ADMIN VESPER at the FIRST SCORE --------------------------------------------
  *vesperScore() {
    const vesper = OW.npc('dig_vesper');
    if (!vesper || !State.flag('dig_recorded')) return;
    const p = OW.player;
    yield* OW.walkTo(p, 14, 3);
    p.dir = 'up';
    yield* say('VESPER is reading the carved wall aloud, her back to you...');
    yield* say('VESPER: "...and where the RIFT opened, every voice fell still. River and wind. Bird and beast. Every AIMON..."');
    yield* say('VESPER: "Beyond the RIFT waits no greater song.\fThere is no song at all."');
    vesper.dir = 'down';
    yield 20;
    yield* say('VESPER: ...You. The interesting noise. Of course it\'s you.');
    yield* say('VESPER: Do you know what this is? The FIRST SCORE. The song that sealed the RIFT, carved by the ones who were there.');
    yield* say('VESPER: The CONDUCTOR told us the other side was music. A true world, where every silenced voice still sings.');
    yield* say('VESPER: But the ones who were THERE wrote that it was silence. That the AIMON simply... stopped. Forever.');
    yield* say('VESPER: ...It must be a mistranslation. It must be.');
    yield* say('VESPER: Enough! I didn\'t come all this way to read. I came to record. Let\'s hear whether your song has improved!');
    const res = yield* this.battle({ trainer: 'vesper2' });
    if (res !== 'win') return;
    State.setFlag('beat_vesper2');
    yield* say('VESPER: ...');
    yield* say('VESPER takes out a notebook and starts copying the carvings, line by line, out of habit.');
    vesper.dir = 'up';
    yield 40;
    yield* say('Halfway down the page, her pen stops.');
    yield 30;
    vesper.dir = 'down';
    yield* say('She closes the notebook, looks at you for a long moment...\fand walks away without a word.');
    yield* this.leave(vesper, 26, 8);
    Sound.sfx('rumble');
    Game.shake = 6;
    yield* say('Far above, the ground rumbles.\fWith the RESONATOR silent, the halls have stopped shaking...');
  },

  *carvingsInspect() {
    yield* say('Row after row of carved lines, dotted with notes: the FIRST SCORE.');
    if (State.flag('sahra_freed')) yield* say('The last line stops in the middle of a phrase. The final verse is missing.');
    else yield* say('Some notes are picked out in gold. You can almost hear them.');
  },

  // -- DIG SITE B1F: SAHRA breaks out -----------------------------------------------------------
  *sahraFreed() {
    State.setFlag('sahra_freed');
    const p = OW.player;
    Sound.sfx('rumble');
    Game.shake = 20;
    yield* say('A deep rumble shakes the whole floor!');
    yield* OW.pan(14, 9, 40);
    Sound.sfx('rock');
    Game.shake = 16;
    for (const id of ['dig_rubble1', 'dig_rubble2']) {
      const r = OW.npc(id);
      if (r) OW.despawn(r);
    }
    Sound.cry('dunarch');
    yield* say('With a roar, something huge bursts through the rubble!');
    const sahra = OW.npc('dig_sahra');
    yield* say('???: HA! Fresh air! Well... fresher air.');
    yield* OW.pan(0, 0, 40);
    if (sahra) yield* OW.approach(sahra, p);
    yield* say('SAHRA: Took you long enough, kid! I\'m SAHRA: WARDEN of the DUNESTONE, LEADER of the SUNSPIRE GYM, and, as of this week, professional prisoner.');
    yield* say('SAHRA: The minute that machine went quiet, my DUNARCH dug through like it was butter. I\'d say I owe you one.');
    yield* say('{PLAYER} handed SAHRA LINDEN\'S NOTES.');
    State.removeItem('lindennotes', 1);
    yield* say('SAHRA: Hm... hm! LINDEN, you old genius. He thinks the CHAMPION\'S OATH is real.');
    yield* say('SAHRA: And those black coats were after my wall, weren\'t they. Come on. There\'s something you need to see.');
    yield* Game.fadeOut(20);
    OW.loadMap('dig2', 15, 3, 'up');
    const s2 = OW.spawn({ id: 'sahra_wall', person: 'sahra', x: 13, y: 3, dir: 'up' });
    yield* Game.fadeIn(20);
    yield* say('SAHRA: The FIRST SCORE. Twenty years I\'ve spent digging it out of this hill, one line at a time.');
    yield* say('SAHRA: Read it forwards, and it\'s the song that sealed the RIFT. Eight voices: one for each KEYSTONE.');
    yield* say('SAHRA: Read it backwards, and it\'s the song that opens it again. That\'s what they\'re recording. Every KEYSTONE\'s voice, to play in reverse.');
    s2.dir = 'right';
    OW.faceTowards(p, s2);
    yield* say('SAHRA: But the ones who carved this left more than a song. They left instructions. Right here.');
    yield* say('SAHRA: "When the seal grows thin, let one who carries all eight slivers sing it whole again."');
    yield* say('SAHRA: Eight slivers, kid. Your BADGE case. LINDEN\'s right. Those BADGES were never trophies.\fThey\'re the spare key.');
    s2.dir = 'up';
    yield* say('SAHRA: There\'s just one problem. Look at the end of the wall.');
    yield* say('SAHRA: The song stops, right in the middle of a line. The final verse is missing. Whoever carved this ran out of wall... or out of time.');
    yield* say('SAHRA: My guess? The last verse was carved somewhere else. I\'ll find it. I always do.');
    OW.faceTowards(s2, p);
    yield* say('SAHRA: But first things first! You came all this way and haven\'t even challenged my GYM.');
    yield* say('SAHRA: Meet me there. I owe you a battle, and those black coats a very large hole.');
    yield* this.leave(s2, 23, 7);
  },

  // -- SUNSPIRE GYM: LEADER SAHRA ------------------------------------------------------------
  *sahraGym() {
    if (State.flag('badge_dune')) {
      yield* say('SAHRA: The DUNESTONE\'s song is gone, but the stone still sings. And so do those BADGES of yours.');
      yield* say('SAHRA: Keep them safe, kid. When the time comes, VALEMORA\'s going to need someone to sing.');
      return;
    }
    yield* say('SAHRA: So you found your way through my ruins. Good eyes, good feet.');
    yield* say('SAHRA: GROUND types are patient. They wait, they shift... and then the whole world moves under your feet.');
    yield* say('SAHRA: Let\'s see if you can keep your footing!');
    const res = yield* this.battle({ trainer: 'sahra' });
    if (res !== 'win') return;
    State.setFlag('beat_sahra');
    yield* say('SAHRA: Ha! You dug right to the bottom of me. I haven\'t lost like that since I was your age.');
    yield* say('SAHRA: This is the DUNE BADGE. There\'s a sliver of the DUNESTONE inside. Listen to it sometime.');
    yield* this.awardBadge(4, 'SAHRA');
    yield* say('SAHRA: And take this TM. EARTH POWER! Make the ground itself fight for you.');
    yield* this.receive('tm05', 1);
    yield* say('SAHRA: Five KEYSTONES recorded. RIFTSTONE, ROOTSTONE, TIDESTONE, CRAGSTONE, and now mine.');
    yield* say('SAHRA: But the MILLSTONE hasn\'t been touched yet. It\'s the old grinding stone in the windmill at MEADOWFIELD FARM.');
    yield* say('SAHRA: WREN runs the GYM there. If TEAM DISTORTION wants a sixth song, that\'s where they\'ll go next.');
    yield* say('SAHRA: MEADOWFIELD is down the farm road, ROUTE 12, south off ROUTE 3. I\'ll write to WREN and the other WARDENS tonight.');
    yield* say('SAHRA: Now go on. I\'ve got a wall to finish reading.');
  },

  *gymGuideSahra() {
    if (State.flag('badge_dune')) {
      yield* say('The DUNE BADGE! SAHRA hasn\'t handed one out in months. You should be proud, champ!');
      return;
    }
    yield* say('Hey, champ-in-the-making! SAHRA\'s GYM is a maze of fallen pillars. Find the gaps and you\'ll find the way.');
    yield* say('Her GROUND types shrug off ELECTRIC moves completely! Hit them with WATER, GRASS or... well, anything that floats.');
  },

  *gymRootsInspect() {
    yield* say('Golden crystal roots push up through the GYM floor. They\'re warm to the touch.\fThe DUNESTONE\'s roots reach all the way here.');
  },

  // -- Interlude: VESPER and the CONDUCTOR --------------------------------------------------
  *epilogue4() {
    if (!State.flag('badge_dune') || State.flag('epilogue4_seen')) return;
    State.setFlag('epilogue4_seen');
    yield* Game.fadeOut(40);
    Sound.playMusic('cave');
    const conductor = TrainerArt.admin({ hair: '#d8d8e0', hairStyle: 'swept', coat: '#141418', trim: '#d0b060', wide: true });
    const scene = { opaque: true };
    const figs = [
      [Pix.silhouette(TrainerArt.get('vesper'), '#140c22'), Pix.silhouette(TrainerArt.get('vesper'), '#a060e8'), 44, 44],
      [Pix.silhouette(conductor, '#0a0806'), Pix.silhouette(conductor, '#d0b060'), 132, 34],
    ];
    scene.draw = (g) => {
      g.fillStyle = '#05030a';
      g.fillRect(0, 0, SCREEN_W, SCREEN_H);
      const pulse = 0.3 + 0.2 * Math.sin(Game.frame / 20);
      // Five KEYSTONE lights now hang in the dark.
      for (const [x, col] of [[40, '#b070f8'], [80, '#78e060'], [120, '#58a0f0'], [160, '#f0b040'], [200, '#f8d870']]) {
        g.globalAlpha = pulse;
        Pix.ellipse(g, x, 16, 9, 5, col);
      }
      g.globalAlpha = 1;
      // A cello leaning beside the CONDUCTOR.
      g.globalAlpha = 0.5 + 0.2 * pulse;
      Pix.ellipse(g, 188, 92, 10, 14, '#2a1a10');
      Pix.ellipse(g, 188, 72, 7, 9, '#2a1a10');
      g.fillStyle = '#2a1a10';
      g.fillRect(187, 40, 2, 30);
      g.globalAlpha = 1;
      for (const [shadow, rim, x, y] of figs) {
        g.globalAlpha = 0.35 + 0.25 * pulse;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1]]) g.drawImage(rim, x + dx, y + dy);
        g.globalAlpha = 1;
        g.drawImage(shadow, x, y);
      }
    };
    Game.push(scene);
    yield* Game.fadeIn(40);
    yield* say('Meanwhile, on the top floor of the SONANCE TOWER...', DARK);
    yield* say('VESPER: The DUNESTONE\'s song, CONDUCTOR. Five of eight.', DARK);
    yield* say('???: Beautifully done. And yet you sound troubled, VESPER.', DARK);
    yield* say('VESPER: There was a wall beneath SUNSPIRE. The FIRST SCORE. The ones who sealed the RIFT wrote down what they saw.', DARK);
    yield* say('VESPER: Where it opened, the AIMON fell silent. Not a greater song...\fno song at all.', DARK);
    yield* say('VESPER: You told us the other side was music.', DARK);
    yield* say('???: Silence is only the rest between notes, VESPER.', DARK);
    yield* say('???: Every musician knows it. Without the rests, there is no music at all.', DARK);
    yield* say('VESPER: ...Yes, CONDUCTOR.', DARK);
    yield* say('???: The MILLSTONE is next. THANE is already on his way to MEADOWFIELD.', DARK);
    yield* say('???: Five songs. Soon, the whole chord...', DARK);
    yield* say('TO BE CONTINUED...', DARK);
    yield* Game.fadeOut(40);
    Game.remove(scene);
    Sound.playMusic(OW.music());
    yield* Game.fadeIn(30);
  },
});

Events.wbHomecoming.when = () => State.flag('badge_crag') && !State.flag('wb_home');
Events.lindenBadges.when = () => State.flag('badge_crag') && !State.flag('linden_notes');
Events.kaiHome.when = () => State.flag('linden_notes') && !State.flag('kai_home_seen');
Events.ivyWest.when = () => State.flag('linden_notes') && !State.flag('ivy_west');
Events.sunspireArrive.when = () => !State.flag('ss_arrived');
Events.digResonator.when = () => !State.flag('dig_recorded');
Events.vesperScore.when = () => State.flag('dig_recorded') && !State.flag('beat_vesper2');
Events.sahraFreed.when = () => State.flag('beat_vesper2') && !State.flag('sahra_freed');
Events.epilogue4.when = () => State.flag('badge_dune') && !State.flag('epilogue4_seen');
