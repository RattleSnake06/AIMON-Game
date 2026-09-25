'use strict';
// Chapter 5 story: ROUTE 8 to SILVERFALL CITY, where SONANCE ENERGY's tower
// hides TEAM DISTORTION's headquarters (ADMIN MORROW on 3F; the 4th floor
// stays sealed until the COMMANDER's key card is won), then SILVERFALL
// BRIDGE to CRAGMOOR and GYM LEADER TOR (GYM 4).

Object.assign(Events, {
  // -- SILVERFALL: KAI has been watching SONANCE ENERGY ------------------------------
  *silverfallArrive() {
    if (State.flag('sf_kai')) return;
    const p = OW.player;
    const kai = yield* this.arrive({ id: 'kai_sf', person: 'rival' }, p, 'west');
    yield* say('KAI: {PLAYER}! Over here!\f...Took you long enough. I\'ve been stuck in SILVERFALL for two days.');
    yield* say('KAI: The next GYM is in CRAGMOOR, across the river. And the bridge there? "Under construction."');
    yield* say('KAI: Except the workers say it\'s finished! The company paying for it, SONANCE ENERGY, just told everyone to stop.');
    yield* say('KAI: Two weeks ago. Right when TEAM DISTORTION hit the ROOTSTONE.');
    yield* say('KAI: And SONANCE\'s logo? A violet tuning fork. Black coats go in and out of their tower all day long.');
    yield* say('KAI: Today they locked the doors for a "private event." ...I say we crash it.');
    yield* say('KAI: Meet me at the tower, north of the MART. Heal up at the CENTRE first if you need to!');
    State.setFlag('sf_kai');
    yield* OW.walkTo(kai, 25, 9);
    OW.despawn(kai);
    this.spawnDef('sf_kai');
  },

  *kaiTower() {
    yield* say('KAI: Ready? Once we\'re through those doors, there\'s no turning back.');
    yield* say('KAI: SONANCE ENERGY, TEAM DISTORTION... Let\'s find out what they\'re really building in there.');
  },

  *sonanceDoor() {
    yield* say('SONANCE ENERGY HEAD OFFICE.\nThe glass doors are locked tight.');
    yield* say('A sign on the door reads:\n"CLOSED TODAY FOR A PRIVATE EVENT."', { style: 'sign' });
  },

  *foremanTalk() {
    if (State.flag('bridge_open')) {
      yield* say('FOREMAN: SILVERFALL BRIDGE is open for business! CRAGMOOR is straight south.');
      yield* say('FOREMAN: Tell TOR the bridge crew says hi. And that we want our shovels back.');
      return;
    }
    yield* say('FOREMAN: Sorry, kid. The bridge is closed.');
    yield* say('FOREMAN: Between you and me? It\'s done. We just need to crane in the last section. SONANCE ENERGY says "wait," so we wait.');
    yield* say('FOREMAN: Their people come by every day to make sure nobody sneaks across. Creepy folks. They hum.');
  },

  *rockGift() {
    if (State.flag('gift_sfkid')) {
      yield* say('My dad builds bridges! When I grow up, I\'m going to build one all the way to the AIMON LEAGUE!');
      return;
    }
    yield* say('Are you going to CRAGMOOR? Everyone says the GYM LEADER there is as big as a boulder!');
    yield* say('Here, my dad gave me these for my trip. But I\'m not allowed to go yet. You take them!');
    State.setFlag('gift_sfkid');
    yield* this.receive('superpotion', 2);
  },

  // -- SONANCE TOWER 1F: the lobby ambush -------------------------------------------
  *hqEnter() {
    if (State.flag('hq_entered')) return;
    State.setFlag('hq_entered');
    const p = OW.player;
    yield* OW.walk(p, 'up', 1);
    const kai = OW.spawn({ id: 'kai_hq1', person: 'rival', x: 7, y: 11, dir: 'up' });
    yield* OW.walk(kai, 'right', 1);
    kai.dir = 'up';
    const rec = OW.npc('hq_recept');
    rec.emote = 30;
    Sound.sfx('exclaim');
    yield 30;
    yield* say('RECEPTIONIST: Welcome to SONANCE ENERGY! How may I dir... wait.');
    yield* say('RECEPTIONIST: A kid with a BADGE case and a spiky-haired sidekick? The ADMIN said to watch for you two!');
    yield* say('RECEPTIONIST: SECURITY! INTRUDERS IN THE LOBBY!');
    Game.shake = 10;
    Sound.sfx('rumble');
    yield* say('Heavy footsteps thunder somewhere upstairs...');
    OW.faceTowards(kai, p);
    yield* say('KAI: Ha! I knew it. Black coats under the suits.');
    yield* say('KAI: {PLAYER}, go on ahead! I\'ll hold off whoever comes down those stairs!');
    yield* say('KAI: Whatever they\'re hiding, it\'s up top. Don\'t let anyone stop you!');
    yield* OW.walkTo(kai, 7, 8);
    OW.despawn(kai);
    this.spawnDef('hq_kai');
  },

  *kaiLobby() {
    yield* say('KAI: I\'ve got the lobby covered! Nobody\'s getting past me!');
    yield* say('KAI: ...Probably. Go, {PLAYER}!');
  },

  *receptionist() {
    if (State.flag('beat_hqgrunt1')) {
      yield* say('RECEPTIONIST: ...Please take a seat. Or don\'t. I\'m on my break.');
      return;
    }
    yield* say('RECEPTIONIST: You want to speak to the manager? I AM the manager! Of this desk!');
    const res = yield* this.battle({ trainer: 'hqgrunt1' });
    if (res === 'win') State.setFlag('beat_hqgrunt1');
  },

  // -- 2F: a scientist who wants out ------------------------------------------------
  *hqScientist() {
    if (State.flag('gift_hqsci')) {
      yield* say('SCIENTIST: The pads link in pairs. If you get lost, step back onto the pad you came from.');
      return;
    }
    yield* say('SCIENTIST: Eek! D-don\'t battle me! I just analyze the recordings. I\'m not even a real member!');
    yield* say('SCIENTIST: Every KEYSTONE hums its own note. The ADMIN records them and keeps them upstairs, in the archive.');
    yield* say('SCIENTIST: I thought it was music research. Then I read what the recordings are FOR.');
    yield* say('SCIENTIST: Take these. And please... stop them.');
    State.setFlag('gift_hqsci');
    yield* this.receive('revive', 2);
  },

  // -- 3F: the song archive ------------------------------------------------------------
  *cragTank() {
    if (State.flag('badge_crag') || State.flag('hq_cleared')) {
      yield* say('The tank is glowing a warm amber now.\nLABEL: "CRAGSTONE. RECORDED."');
      return;
    }
    yield* say('An empty tank, but its label is already filled in:\n"CRAGSTONE. RECORDING... 97%."');
  },

  *riftScreen() {
    yield* say('A map of VALEMORA with eight KEYSTONES in a ring. Three glow violet: RIFTSTONE, ROOTSTONE, TIDESTONE.');
    yield* say('A fourth, CRAGSTONE, is blinking orange. In the very center, a red point is labeled "THE RIFT."');
  },

  *vaultDoor() {
    yield* say('A heavy steel door. The plate reads:\n"4F. EXECUTIVE FLOOR. GRAND RESONATOR."');
    yield* say('The key card reader blinks red.\n"COMMANDER\'S KEY CARD REQUIRED."');
    if (State.flag('hq_cleared')) yield* say('It won\'t budge. Not without that key card.');
  },

  // -- 3F: ADMIN MORROW ------------------------------------------------------------------
  *morrowShowdown() {
    if (State.flag('hq_cleared') || OW.busy > 1) return;
    const p = OW.player;
    const morrow = OW.npc('hq_morrow');
    if (!morrow) return;
    Sound.sfx('hum');
    yield* say('A man in a dark coat stands before a sealed steel door, turning a small hourglass in his hand.');
    morrow.emote = 30;
    Sound.sfx('exclaim');
    yield 30;
    yield* say('???: Tick, tock. You\'re early, child. I had you arriving in... oh, three or four more songs.');
    yield* say('MORROW: I am MORROW, ADMIN of TEAM DISTORTION, and keeper of this archive.');
    yield* say('MORROW: VESPER calls you interesting. THANE calls you loud. I think you\'re simply... on time.');
    yield* say('MORROW: Do you know what surrounds you? Every KEYSTONE hums a note. RIFTSTONE. ROOTSTONE. TIDESTONE. We record them all.');
    yield* say('MORROW: And CRAGMOOR\'s stone is being recorded right now. That\'s why the bridge is closed. No WARDENS rushing to help.');
    yield* OW.approach(morrow, p);
    yield* say('MORROW: Let\'s see how long your sand lasts.');
    const res = yield* this.battle({ trainer: 'morrow' });
    if (res !== 'win') return;
    State.setFlag('beat_morrow');
    yield* say('MORROW: ...Hm. Faster than expected. You really do keep good time.');
    yield* say('MORROW: No matter. The CRAGMOOR recording finished during our little battle. Open the bridge, close the bridge. It no longer matters.');
    yield* say('MORROW: Shall I tell you the melody? Eight songs, played BACKWARDS, all at once, through the GRAND RESONATOR.');
    yield* say('MORROW: Each KEYSTONE is a lock, and each song is its key. Play them in reverse, and the seals simply... come undone.');
    yield* say('MORROW: The RIFT opens. The true world pours back in. Isn\'t that beautiful?');
    yield* say('MORROW: The RESONATOR waits upstairs. Only the COMMANDER carries the key card to that floor. Not even I may go up without him.');
    yield* say('MORROW: And the COMMANDER does not take visitors. Not yet.');
    yield* say('MORROW: Oh, and your BADGES, child... every one holds a sliver of a stone. Do keep them safe.\fFor us.');
    // MORROW slips away through his private warp pad.
    yield* OW.walkTo(morrow, 18, 3);
    Sound.sfx('pad');
    yield* BattleFX.tween(20, () => { morrow.hidden = !morrow.hidden; });
    OW.despawn(morrow);
    yield* say('MORROW stepped onto a warp pad and vanished! Its light flickered and went dark.');
    // KAI catches up.
    const kai = OW.spawn({ id: 'kai_hq3', person: 'rival', x: 1, y: 12, dir: 'up' });
    yield* OW.approach(kai, p);
    yield* say('KAI: {PLAYER}! The lobby\'s clear! ...Whoa. What IS this place?');
    yield* say('{PLAYER} told KAI everything MORROW said.');
    yield* say('KAI: Play the KEYSTONES backwards to open the RIFT?! And every GYM we beat, they record another stone...');
    yield* say('KAI: The top floor needs this COMMANDER\'s key card. Fine. Whoever he is, we\'ll get it off him.');
    yield* say('KAI: But first, the bridge! If their recording\'s done, there\'s no reason to keep it closed. Come on!');
    State.setFlag('hq_cleared');
    State.setFlag('bridge_open');
    yield* OW.teleport('silverfall', 25, 9, 'down');
    yield* this.bridgeOpens();
  },

  // Outside the tower: the bridge crew gets back to work.
  *bridgeOpens() {
    const p = OW.player;
    const kai = OW.spawn({ id: 'kai_sf2', person: 'rival', x: 26, y: 9, dir: 'down' });
    Sound.sfx('rumble');
    Game.shake = 8;
    yield* say('Engines roar to life down by the river. The crane at the bridge swings around!');
    const foreman = OW.npc('sf_foreman');
    if (foreman) yield* OW.approach(foreman, p);
    yield* say('FOREMAN: Kid! Did you hear? SONANCE just cancelled the stop order! Their whole crew ran out the back door!');
    yield* say('FOREMAN: We craned the last section in just now. SILVERFALL BRIDGE is open! CRAGMOOR is straight south!');
    if (foreman) {
      yield* OW.walkTo(foreman, 19, 28);
      foreman.dir = 'down';
    }
    OW.faceTowards(kai, p);
    OW.faceTowards(p, kai);
    yield* say('KAI: Nice! Race you to CRAGMOOR, {PLAYER}! Loser buys the POTIONS!');
    yield* this.leave(kai, 20, 29);
  },

  // -- CRAGMOOR: GYM LEADER TOR ------------------------------------------------------------
  *cragmoorArrive() {
    if (State.flag('cm_arrived')) return;
    const p = OW.player;
    const tor = OW.npc('cm_tor');
    if (!tor) return;
    State.setFlag('cm_arrived');
    yield* say('The sound of hammers rings off the cliffs...');
    tor.emote = 30;
    Sound.sfx('exclaim');
    yield 30;
    yield* OW.approach(tor, p);
    yield* say('???: Hah! Footsteps from the north road! So that bridge finally opened.');
    yield* say('TOR: Name\'s TOR. I run the quarry, and the GYM. And I\'m WARDEN of the CRAGSTONE.');
    yield* say('TOR: Two weeks we were cut off. Then black coats turned up at the quarry with a humming machine, pointed right at my GYM.');
    yield* say('TOR: I ran them off with a shovel. But one of them laughed. Said they\'d "heard enough."');
    yield* say('TOR: You\'re the kid HOLT wrote to me about, aren\'t you? Three BADGES and a habit of kicking down TEAM DISTORTION\'s doors.');
    yield* say('TOR: Then come prove it. A mountain doesn\'t move for just anyone.');
    yield* OW.walkTo(tor, 16, 10);
    Sound.sfx('door');
    OW.despawn(tor);
    this.spawnDef('cm_kai');
  },

  *kaiCragmoor() {
    yield* say('KAI: Beat you here! ...Then TOR flattened me. Three times.');
    yield* say('KAI: His OBELITH doesn\'t even flinch. Use WATER, GRASS, FIGHTING or GROUND moves. Trust me.');
    yield* say('KAI: I\'m going to train in the quarry until my arms fall off. See you around, {PLAYER}!');
  },

  *cragstoneInspect() {
    yield* say('The CRAGSTONE. A violet KEYSTONE set deep in an ancient boulder.');
    if (State.flag('badge_crag')) {
      yield* say('It hums one low, steady note.\fSomewhere far away, something seems to hum back.');
      return;
    }
    yield* say('It hums one low, steady note, like a mountain breathing.');
  },

  *gymGuideTor() {
    if (State.flag('badge_crag')) {
      yield* say('You moved the mountain! Twenty years I\'ve worked here, and I\'ve never seen TOR grin like that.');
      return;
    }
    yield* say('Hey, champ-in-the-making! CRAGMOOR\'s GYM is a climb. The ledges only go down, so pick your path carefully!');
    yield* say('TOR\'s ROCK types shrug off NORMAL, FIRE and FLYING hits. Crack them with WATER, GRASS, FIGHTING or GROUND!');
  },

  *torGym() {
    if (State.flag('badge_crag')) {
      yield* say('TOR: That CRAG BADGE suits you. Carry it the way you carry your team: with both hands.');
      yield* say('TOR: If those black coats show their faces here again, they\'ll answer to me AND the whole quarry crew.');
      return;
    }
    yield* say('TOR: So you climbed my quarry. Good legs. Now let\'s see a good backbone.');
    yield* say('TOR: ROCK types don\'t dodge. They don\'t need to. They stand there until you break, or they do.');
    yield* say('TOR: Show me you can move a mountain!');
    const res = yield* this.battle({ trainer: 'tor' });
    if (res !== 'win') return;
    State.setFlag('beat_tor');
    yield* say('TOR: Hah! HAH! Twenty years, and nobody\'s shifted that OBELITH an inch!');
    yield* say('TOR: This is the CRAG BADGE. A chip off the CRAGSTONE itself. You earned every grain.');
    yield* this.awardBadge(3, 'TOR');
    yield* say('TOR: And take this TM. ROCK SLIDE! Bury your foes under a hillside.');
    yield* this.receive('tm04', 1);
    yield* say('TOR: KAI told me what you found in SILVERFALL. A RESONATOR on the top floor, and a COMMANDER with the only key.');
    yield* say('TOR: Four BADGES, four stones... and every one of them "heard" by those black coats. I don\'t like it.');
    yield* say('TOR: I\'ll talk to the other WARDENS. Whatever this COMMANDER is planning, we won\'t let it happen quietly.');
    yield* say('TOR: Oh, and PROF. LINDEN\'s been asking after you. The lake road back to WILLOWBROOK should be clear any day now.');
  },

  // -- Epilogue: the COMMANDER -----------------------------------------------------------------
  *epilogue3() {
    if (!State.flag('badge_crag') || State.flag('epilogue3_seen')) return;
    State.setFlag('epilogue3_seen');
    yield* Game.fadeOut(40);
    Sound.playMusic('cave');
    const commander = TrainerArt.admin({ hair: '#181820', hairStyle: 'swept', coat: '#101018', trim: '#e04848', wide: true });
    const scene = { opaque: true };
    const figs = [
      [Pix.silhouette(TrainerArt.get('morrow'), '#140c22'), Pix.silhouette(TrainerArt.get('morrow'), '#e0b048'), 48, 44],
      [Pix.silhouette(commander, '#0c0608'), Pix.silhouette(commander, '#e04848'), 128, 36],
    ];
    scene.draw = (g) => {
      g.fillStyle = '#05030a';
      g.fillRect(0, 0, SCREEN_W, SCREEN_H);
      const pulse = 0.3 + 0.2 * Math.sin(Game.frame / 20);
      // Four KEYSTONE lights now hang in the dark.
      for (const [x, col] of [[48, '#b070f8'], [96, '#78e060'], [144, '#58a0f0'], [192, '#f0b040']]) {
        g.globalAlpha = pulse;
        Pix.ellipse(g, x, 16, 9, 5, col);
      }
      g.globalAlpha = 1;
      for (const [shadow, rim, x, y] of figs) {
        g.globalAlpha = 0.35 + 0.25 * pulse;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1]]) g.drawImage(rim, x + dx, y + dy);
        g.globalAlpha = 1;
        g.drawImage(shadow, x, y);
      }
      g.fillStyle = '#ff6060';
      g.fillRect(154, 50, 3, 1);
      g.fillRect(162, 50, 3, 1);
    };
    Game.push(scene);
    yield* Game.fadeIn(40);
    yield* say('Meanwhile, on the top floor of the SONANCE TOWER...', DARK);
    yield* say('MORROW: The CRAGSTONE\'s song is recorded, CONDUCTOR. Four of eight.', DARK);
    yield* say('MORROW: The child found the archive. And the door.', DARK);
    yield* say('???: Let them find it. A locked door is only a promise.', DARK);
    yield* say('???: ...COMMANDER.', DARK);
    yield* say('COMMANDER: CONDUCTOR.', DARK);
    yield* say('???: When the time comes, the child will want to climb those stairs.', DARK);
    yield* say('COMMANDER: Then they\'ll have to take the key from me.\fNo one has ever taken anything from me.', DARK);
    yield* say('COMMANDER: And the boy with the spiky hair... KAI.\fLeave him to me.', DARK);
    yield* say('???: Four songs. The RIFT is listening more closely now...', DARK);
    yield* say('TO BE CONTINUED...', DARK);
    yield* Game.fadeOut(40);
    Game.remove(scene);
    Sound.playMusic(OW.music());
    yield* Game.fadeIn(30);
  },
});

Events.silverfallArrive.when = () => !State.flag('sf_kai');
Events.hqEnter.when = () => !State.flag('hq_entered');
Events.morrowShowdown.when = () => !State.flag('hq_cleared');
Events.cragmoorArrive.when = () => !State.flag('cm_arrived');
Events.epilogue3.when = () => State.flag('badge_crag') && !State.flag('epilogue3_seen');
