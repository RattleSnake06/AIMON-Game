'use strict';
// Story scripts and map events. Each is a generator run by OW.run().

const STARTER_BLURB = {
  skylavine: 'Ah! SKYLAVINE, the GRASS-type AIMON! It glides between the treetops on wings of leaves.',
  moltarock: 'Ah! MOLTAROCK, the FIRE-type AIMON! Its rocky body is warmed by magma trapped inside.',
  archepin: 'Ah! ARCHEPIN, the WATER-type AIMON! Its shell is shaped like a little stone bridge.',
};

const Events = {
  // -- generic -------------------------------------------------------------------
  *talk(npc) {
    const d = npc.def;
    if (d.item) {
      yield* this.pickItem(npc);
      return;
    }
    if (npc.sprite !== 'ball' && !d.noFace && !d.prop) OW.faceTowards(npc, OW.player);
    if (d.trainer) {
      if (!State.flag(`beat_${d.trainer}`)) {
        yield* this.trainerBattle(npc);
        return;
      }
      yield* say(TRAINERS[d.trainer].after);
      return;
    }
    if (d.script) {
      yield* this[d.script](npc);
      return;
    }
    const t = typeof d.text === 'function' ? d.text() : d.text;
    if (t) yield* say(t);
  },

  *sign(text, plain) {
    yield* say(text, { style: plain ? 'field' : 'sign' });
  },

  *receive(id, n = 1, verb = 'received') {
    State.addItem(id, n);
    const name = ITEMS[id].name;
    const what = n > 1 ? `${n} ${name}S` : `the ${name}`;
    Sound.jingle('item');
    yield* say(`{PLAYER} ${verb} ${what}!`);
  },

  *pickItem(npc) {
    const d = npc.def;
    State.setFlag(`item_${d.id}`);
    OW.npcs = OW.npcs.filter((n) => n !== npc);
    yield* this.receive(d.item, d.count || 1, 'found');
  },

  *healJingle() {
    yield* Game.fadeOut(12);
    State.healParty();
    yield Sound.jingle('heal');
    yield* Game.fadeIn(12);
  },

  // -- Willowbrook -----------------------------------------------------------------
  *leaveTownCheck() {
    if (State.flag('got_starter')) return;
    const p = OW.player;
    p.dir = 'up';
    yield* say('Wild AIMON live in the tall grass up ahead...\fIt\'s too dangerous to go without an AIMON of your own. You should visit PROF. LINDEN\'s lab first!');
    yield* OW.walk(p, 'down', 1);
  },

  *momMorning() {
    if (State.flag('mom_intro')) return;
    State.setFlag('mom_intro');
    const mom = OW.npc('mom');
    const p = OW.player;
    mom.emote = 30;
    Sound.sfx('exclaim');
    yield 30;
    OW.faceTowards(mom, p);
    OW.faceTowards(p, mom);
    yield* say('MOM: Good morning, {PLAYER}! You\'re finally up.');
    yield* say('PROF. LINDEN stopped by earlier. He has something for you and {RIVAL}, and asked you both to come to his lab.');
    yield* say('The lab is the big building at the south end of town. Go on, don\'t keep him waiting!');
    mom.dir = 'left';
  },

  *momTalk(npc) {
    if (!State.party.length) {
      yield* say('MOM: PROF. LINDEN\'s lab is at the south end of town. Hurry along, dear!');
      return;
    }
    yield* say('MOM: {PLAYER}! You and your AIMON look tired. Why don\'t you rest for a bit?');
    yield* this.healJingle();
    yield* say('MOM: There! You\'re both full of energy again. Take care out there!');
    npc.dir = 'left';
  },

  *bedroomPC() {
    Sound.sfx('boot');
    yield* say('{PLAYER} turned on the PC.\fThere\'s a note you wrote last night:\n"Wild AIMON hide in tall grass!"');
  },

  // -- The lab ----------------------------------------------------------------------
  *labEnter() {
    if (State.flag('lab_intro')) return;
    State.setFlag('lab_intro');
    const p = OW.player;
    const rival = OW.npc('lab_rival');
    const prof = OW.npc('prof');
    rival.dir = 'down';
    rival.emote = 30;
    Sound.sfx('exclaim');
    yield 30;
    yield* say('{RIVAL}: {PLAYER}! What took you so long? PROF. LINDEN wouldn\'t let me pick until you got here!');
    yield* OW.walk(p, 'up', 5);
    yield* OW.walk(p, 'right', 1);
    p.dir = 'up';
    rival.dir = 'right';
    yield* say('PROF. LINDEN: Ah, {PLAYER}! Good, you\'re here.');
    yield* say('As I promised, I would like each of you to take an AIMON to raise as your partner.');
    yield* say('On the table are three AIMON BALLS. Each holds an AIMON I\'ve been studying.');
    yield* say('Go ahead, {PLAYER}. You may choose first!');
    rival.dir = 'right';
    yield* say('{RIVAL}: Hey! No fair!');
    yield* say('PROF. LINDEN: Patience, {RIVAL}. You\'ll get to choose too.');
    prof.dir = 'down';
  },

  *profTalk(npc) {
    if (!State.flag('got_starter')) {
      yield* say('PROF. LINDEN: Go ahead, {PLAYER}! Choose one of the AIMON on the table.');
      return;
    }
    if (!State.flag('got_dex')) {
      yield* say('PROF. LINDEN: How is your AIMON doing? It seems to like you already!');
      return;
    }
    yield* say(`PROF. LINDEN: Let's see your AIMONDEX...\fYou've seen ${State.seenCount()} and caught ${State.caughtCount()} kinds of AIMON so far.`);
    if (State.caughtCount() >= DEX_ORDER.length) yield* say('Incredible! You\'ve caught every AIMON in the region. I\'m so proud of you!');
    else yield* say('Wild AIMON live in the tall grass on ROUTE 1. Keep exploring!');
  },

  *rivalLabTalk() {
    if (!State.flag('got_starter')) yield* say('{RIVAL}: Hurry up and pick, {PLAYER}! I want my AIMON!');
    else yield* say('{RIVAL}: Heh. My AIMON looks a lot tougher than yours.');
  },

  *pickStarter(ball) {
    const sp = ball.def.arg;
    if (State.flag('got_starter')) {
      yield* say('That\'s PROF. LINDEN\'s last AIMON. Better leave it be.');
      return;
    }
    const pic = Popup.mon(sp);
    yield* say(STARTER_BLURB[sp]);
    const yes = yield* Dialog.yesNo(`So, {PLAYER}, you want ${SPECIES[sp].name}?`);
    Game.remove(pic);
    if (!yes) return;

    const mon = new Mon(sp, 5);
    State.d.starter = sp;
    State.addMon(mon);
    State.setFlag('got_starter');
    State.setFlag(`took_${sp}`);
    OW.npcs = OW.npcs.filter((n) => n !== ball);
    yield* say('PROF. LINDEN: This AIMON is really energetic!');
    Sound.jingle('obtain');
    yield* say(`{PLAYER} received the ${SPECIES[sp].name} from PROF. LINDEN!`);
    if (yield* Dialog.yesNo(`Do you want to give a nickname to ${SPECIES[sp].name}?`)) {
      const nick = yield* Naming.run({ title: `${SPECIES[sp].name}'s nickname?`, species: sp, max: 10 });
      if (nick) mon.nickname = nick;
    }

    // The rival picks the one with the type advantage.
    const rsp = State.rivalStarter();
    const rival = OW.npc('lab_rival');
    const rball = OW.npc(`ball_${rsp}`);
    yield* say('{RIVAL}: Then I\'ll take this one!');
    yield* OW.walkTo(rival, rball.x, rball.y + 1);
    rival.dir = 'up';
    yield 10;
    OW.npcs = OW.npcs.filter((n) => n !== rball);
    State.setFlag(`took_${rsp}`);
    Sound.jingle('obtain');
    yield* say(`{RIVAL} received the ${SPECIES[rsp].name} from PROF. LINDEN!`);
    OW.faceTowards(rival, OW.player);
    yield* say(`{RIVAL}: Heh! My ${SPECIES[rsp].name} looks way stronger than yours!`);
  },

  *rivalChallenge() {
    const p = OW.player;
    if (!State.flag('got_starter')) {
      OW.faceTowards(p, OW.npc('prof'));
      yield* say('PROF. LINDEN: Wait, {PLAYER}! Don\'t go yet. Choose an AIMON from the table first!');
      yield* OW.walk(p, 'up', 1);
      return;
    }
    if (State.flag('rival1_done')) return;
    const rival = OW.npc('lab_rival');
    const prof = OW.npc('prof');
    p.dir = 'up';
    yield* say('{RIVAL}: Wait, {PLAYER}!\fLet\'s see what our AIMON can do. Come on, I\'ll take you on!');
    yield* OW.walkTo(rival, p.x, p.y - 1);
    OW.faceTowards(rival, p);
    OW.faceTowards(p, rival);
    const result = yield* this.battle({ trainer: 'rival1' });
    State.setFlag('rival1_done');
    if (result === 'win') yield* say('{RIVAL}: Tch... fine, you won this time.');
    else yield* say('{RIVAL}: Ha! My AIMON and I are unbeatable!');
    yield* say('{RIVAL}: I\'m heading to ARCHFORD TOWN to train. Try to keep up!');
    yield* OW.walkTo(rival, 6, 11);
    rival.hidden = true;
    Sound.sfx('exit');
    State.setFlag('rival_left_lab');
    OW.npcs = OW.npcs.filter((n) => n !== rival);
    yield 20;

    OW.faceTowards(p, prof);
    yield* say('PROF. LINDEN: That was a fine first battle! Here, let me heal your AIMON.');
    yield* this.healJingle();
    yield* say('PROF. LINDEN: Before you go, take this with you.');
    State.setFlag('got_dex');
    Sound.jingle('obtain');
    yield* say('{PLAYER} received the AIMONDEX from PROF. LINDEN!');
    for (const m of State.party) State.markCaught(m.species);
    State.markSeen(State.rivalStarter());
    yield* say('PROF. LINDEN: The AIMONDEX records data on every AIMON you see or catch.');
    yield* say('To catch a wild AIMON, weaken it in battle first, then throw one of these.');
    yield* this.receive('aimonball', 5);
    yield* say('PROF. LINDEN: ARCHFORD TOWN is north, past ROUTE 1. Its AIMON CENTRE will heal your AIMON for free.');
    yield* say('Now go, {PLAYER}! A world of AIMON is waiting for you!');
  },

  // -- Battles ------------------------------------------------------------------------
  *trainerSpotted(npc) {
    const p = OW.player;
    npc.emote = 40;
    Sound.sfx('exclaim');
    yield 45;
    const steps = Math.abs(npc.x - p.x) + Math.abs(npc.y - p.y) - 1;
    if (steps > 0) yield* OW.walk(npc, npc.dir, steps);
    OW.faceTowards(p, npc);
    yield* this.trainerBattle(npc);
  },

  *trainerBattle(npc) {
    const id = npc.def.trainer;
    const tr = TRAINERS[id];
    if (tr.intro) yield* say(tr.intro);
    const res = yield* this.battle({ trainer: id });
    if (res === 'win') {
      State.setFlag(`beat_${id}`);
      if (tr.reward && !State.count(tr.reward)) {
        if (tr.rewardText) yield* say(tr.rewardText);
        yield* this.receive(tr.reward, 1);
      }
    }
  },

  *wildBattle(species, level) {
    yield* this.battle({ wild: { species, level } });
    OW.encounterCooldown = 3;
  },

  // Full battle from transition to aftermath. Returns 'win' | 'lose' | 'run' | 'caught'.
  *battle(opts) {
    const tr = opts.trainer ? TRAINERS[opts.trainer] : null;
    Sound.playMusic(tr ? (tr.music || 'trainer') : 'battle');
    yield* Transition.play(tr ? 'trainer' : 'wild');
    const b = new Battle(opts);
    Game.push(b);
    Transition.clear();
    yield () => b.done;
    Game.remove(b);
    const lost = b.result === 'lose';
    if (lost && !(tr && tr.canLose)) {
      yield* this.whiteout();
      return 'lose';
    }
    if (lost) State.healParty();
    else yield* Evolution.afterBattle(b.leveled);
    Sound.playMusic(OW.music());
    yield* Game.fadeIn(16);
    return b.result;
  },

  *whiteout() {
    const lost = Math.floor(State.d.money / 2);
    State.d.money -= lost;
    const h = State.d.heal;
    State.healParty();
    OW.loadMap(h.map, h.x, h.y, h.dir);
    yield* Game.fadeIn(20);
    yield* say(`{PLAYER} dropped $${lost} in the panic...\f{PLAYER} hurried back to safety!`);
    if (h.map.startsWith('centre')) {
      yield* say('NURSE: We\'ve restored your AIMON to full health. Please be careful out there!');
    } else {
      yield* say('MOM: Oh, {PLAYER}! You look exhausted. I patched up your AIMON for you.\fDon\'t push yourself too hard, okay?');
    }
  },

  // -- Archford ---------------------------------------------------------------------
  *nurseTalk(npc) {
    yield* say('Welcome to the AIMON CENTRE!\fWe restore tired AIMON to full health.');
    const yes = yield* Dialog.yesNo('Would you like me to heal your AIMON?');
    if (!yes || !State.party.length) {
      yield* say('We hope to see you again!');
      return;
    }
    yield* say('Okay, I\'ll take your AIMON for a few seconds.');
    npc.dir = 'right';
    yield 12;
    for (let i = 1; i <= State.party.length; i++) {
      OW.healBalls = i;
      Sound.sfx('ballClick');
      yield 14;
    }
    OW.healBlink = true;
    yield Sound.jingle('heal');
    OW.healBlink = false;
    OW.healBalls = 0;
    State.healParty();
    State.d.heal = { map: OW.map.id, x: 6, y: 4, dir: 'up' };
    npc.dir = 'down';
    yield* say('Thank you for waiting.\fWe\'ve restored your AIMON to full health.');
    yield* say('We hope to see you again!');
  },

  *centrePC() {
    Sound.sfx('boot');
    yield* say('{PLAYER} turned on the PC.\fAccessed the AIMON STORAGE SYSTEM.');
    yield* Storage.run();
  },

  *martClerk(npc) {
    yield* Shop.run(npc.def.stock || 'archford');
  },

  *grannyGift(npc) {
    if (State.flag('granny_gift')) {
      yield* say('SUPER POTIONS restore a lot of HP. Save them for tough battles, dear.');
      return;
    }
    yield* say('Oh my, a young trainer! You remind me of myself, many years ago.\fHere, take this. It helped my AIMON out of many a tight spot.');
    State.setFlag('granny_gift');
    yield* this.receive('superpotion', 1);
    yield* say('Be good to your AIMON, and they\'ll be good to you.');
  },
  // -- Chapter 2: TEAM DISTORTION ----------------------------------------------------
  *kaiWarning() {
    if (State.flag('kai_news') || !State.flag('got_starter')) return;
    State.setFlag('kai_news');
    const p = OW.player;
    Game.shake = 60;
    Sound.sfx('rumble');
    yield 60;
    yield* say('The ground is shaking...!');
    const kai = OW.spawnNear({ id: 'kai_news', person: 'rival' }, p);
    kai.emote = 30;
    Sound.sfx('exclaim');
    yield 30;
    yield* OW.approach(kai, p);
    const rs = SPECIES[State.rivalStarter()].name;
    yield* say('KAI: {PLAYER}! There you are...\fDid you feel that? That\'s the third one today.');
    yield* say('KAI: I went ahead to RIFTSTONE CAVE, past ROUTE 2 to the west. There were people inside... black coats, violet visors.');
    yield* say('KAI: They called themselves TEAM DISTORTION. They were hauling some huge humming machine deeper into the cave.');
    yield* say(`KAI: I tried to stop them. Their VOLTVIX knocked out my ${rs} with a single shock.`);
    yield* say('KAI: Then HOLT showed up. He\'s the GYM LEADER from GRAYHAVEN CITY. He told me to get out... and went in after them. Alone.');
    yield* say('KAI: That was hours ago. He hasn\'t come back out.');
    yield* say(`KAI: I have to get my ${rs} to the AIMON CENTRE. You go help HOLT! RIFTSTONE CAVE is at the end of ROUTE 2, west of town.`);
    yield* say('KAI: And {PLAYER}... be careful. Those people didn\'t look like they were playing around.');
    yield* OW.walkTo(kai, 7, 20);
    yield* OW.walk(kai, 'up', 1);
    Sound.sfx('door');
    OW.despawn(kai);
  },

  *holtCaveTalk() {
    yield* say('HOLT: Kid, stay back! Their VOLTVIX paralyzed my whole team!');
  },

  *gruntTalk() {
    yield* this.caveShowdown();
  },

  *sealInspect() {
    if (!State.flag('grunt_beaten')) {
      yield* say('The great stone is thrumming violently. Violet light leaks from its center.');
      return;
    }
    yield* say('An ancient stone disc carved with a ring of symbols.\fA thin crack runs through the violet KEYSTONE at its center. It hums softly, like something breathing.');
  },

  *resonatorInspect() {
    if (!State.flag('grunt_beaten')) {
      yield* say('A humming machine covered in violet coils. Its cables are driven straight into the stone!');
      return;
    }
    yield* say('The machine is scorched and silent. A mark is stamped on its side: a broken wave.\fTEAM DISTORTION...');
  },

  *caveShowdown() {
    if (State.flag('grunt_beaten')) return;
    const p = OW.player;
    const holt = OW.npc('holt_cave');
    const grunt = OW.npc('grunt_cave');
    Sound.sfx('hum');
    Game.shake = 40;
    yield 30;
    // Step into the hollow and look up at the seal, the machine and the standoff.
    yield* OW.walk(p, 'up', 2);
    yield* OW.pan(13 - p.x, -1.5, 50);
    yield* say('A low hum fills the cavern. The great stone ahead is glowing violet...');
    yield* say('GRUNT: Heh heh... Almost there. Once this KEYSTONE cracks, the CONDUCTOR will finally hear it sing.');
    yield* say('HOLT: You have no idea what you\'re doing! That stone has held for a thousand years!');
    grunt.emote = 30;
    Sound.sfx('exclaim');
    OW.faceTowards(grunt, p);
    yield 30;
    yield* say('GRUNT: Huh? Another kid? First that spiky-haired brat, and now you?');
    OW.faceTowards(holt, p);
    yield* say('HOLT: Kid, stay back! That VOLTVIX paralyzed my whole team with one wave!');
    yield* say('GRUNT: Listen to the old wall, kid. TEAM DISTORTION doesn\'t play nice.');
    yield* OW.pan(0, 0, 30);
    yield* OW.approach(grunt, p);
    yield* say('GRUNT: ...Nah. Actually, I could use a warm-up. Bend. Break. Become!');
    const res = yield* this.battle({ trainer: 'grunt' });
    if (res !== 'win') return;
    State.setFlag('grunt_beaten');
    yield* say('GRUNT: Tch... Whatever. The RESONATOR already did its job.');
    yield* say('GRUNT: Can you hear it? The KEYSTONE is humming. The crack is already there, and you can\'t un-crack a stone.');
    yield* say('GRUNT: The CONDUCTOR will be pleased. ...See you in the new world, kid.');
    yield* OW.walkTo(grunt, 18, 12);
    OW.despawn(grunt);
    Sound.sfx('zap');
    Game.shake = 24;
    yield 24;
    yield* say('The machine sparks... and falls silent.');
    yield* OW.approach(holt, p);
    yield* say('HOLT: ...You actually beat him. Thank you, kid.');
    yield* say('HOLT: I\'m HOLT. I lead the AIMON GYM in GRAYHAVEN CITY.\fAnd you\'re {PLAYER}? KAI told me about you. You\'ve got a steady spine.');
    holt.dir = 'up';
    yield* say('HOLT: This stone... My family has watched over it for generations. It\'s a KEYSTONE.');
    yield* say('HOLT: The old stories say there are eight, one beneath every AIMON GYM. Together, they hold shut something called the RIFT.');
    yield* say('HOLT: I always thought the RIFT was a bedtime story. But TEAM DISTORTION came down here with a machine built to break the seal.');
    yield* say('HOLT: The crack is small. It\'ll hold...\ffor now.');
    OW.faceTowards(holt, p);
    yield* say('HOLT: Here, let me see to your team. You\'ve earned it.');
    yield* this.healJingle();
    yield* say('HOLT: And take this, too.');
    State.d.expShareOn = true;
    yield* this.receive('expshare', 1);
    yield* say('HOLT: With the EXP. SHARE, your whole team learns from every battle. You can switch it on or off from your BAG.');
    yield* say('HOLT: I closed my GYM to chase these goons. I\'ll open it again for you.');
    yield* say('HOLT: GRAYHAVEN CITY is east of ARCHFORD, past ROUTE 3. Come and challenge me, {PLAYER}.');
    yield* say('HOLT: If TEAM DISTORTION is hunting KEYSTONES, you and I are both going to need to get a lot stronger.');
    yield* OW.walkTo(holt, 4, 15);
    OW.despawn(holt);
    State.setFlag('holt_saved');
    yield 40;
    Sound.sfx('hum');
    Game.shake = 16;
    yield* say('...');
    yield* say('The stone hums faintly in the dark.\fFor a moment, it almost sounds like a voice.');
  },

  *rivalRoute3() {
    if (!State.flag('holt_saved') || State.flag('rival2_done')) return;
    const p = OW.player;
    const kai = OW.spawnNear({ id: 'kai_r3', person: 'rival' }, p, 'east');
    kai.emote = 30;
    Sound.sfx('exclaim');
    yield 30;
    yield* OW.approach(kai, p);
    const rs = SPECIES[State.rivalStarter()].name;
    yield* say('KAI: {PLAYER}! I heard everything. You beat TEAM DISTORTION in the cave?!');
    yield* say(`KAI: My ${rs} is back to full strength, and I caught a GOSKIE on the way. We've been training nonstop.`);
    yield* say('KAI: Before you take on HOLT... let\'s find out which one of us is really stronger!');
    const res = yield* this.battle({ trainer: 'rival2' });
    if (res !== 'win') return;
    State.setFlag('rival2_done');
    yield* say('KAI: Argh... You\'re really something, {PLAYER}.');
    yield* say('KAI: HOLT\'s GYM is just ahead in GRAYHAVEN CITY. ...Don\'t you dare lose to him!');
    yield* OW.walkTo(kai, Math.max(0, p.x - 8), p.y);
    OW.despawn(kai);
  },

  // -- Grayhaven --------------------------------------------------------------------
  *gymStatue() {
    const who = State.flag('badge_keystone') ? State.name : '---';
    yield* say(`GRAYHAVEN CITY AIMON GYM\nLEADER: HOLT\fCERTIFIED TRAINERS:\n${who}`);
  },

  *guardTalk() {
    if (!State.flag('badge_keystone')) {
      yield* say('GUARD: Halt! ROUTE 4 is closed while the city checks the ground for tremor damage.\fOrders from HOLT himself.');
      return;
    }
    if (!State.flag('badge_grove')) {
      yield* say('GUARD: You beat HOLT? Impressive! But ROUTE 4 is still closed, I\'m afraid.');
      yield* say('GUARD: HOLT did leave a message for you, though. IVY, the GYM LEADER of CEDARWOOD VILLAGE, hasn\'t answered his letters.\fCEDARWOOD is west of WILLOWBROOK TOWN, along ROUTE 5.');
      return;
    }
    yield* say('GUARD: IVY called ahead for you. ROUTE 4 is open! It runs south along the coast to SEABREEZE PORT.');
    yield* say('GUARD: Watch yourself down there. That storm hasn\'t moved in days.');
  },

  *historianTalk() {
    if (State.flag('badge_keystone')) {
      yield* say('HISTORIAN: Let me see that BADGE... Yes. That violet sliver is true keystone. Keep it close, young one.');
      return;
    }
    yield* say('HISTORIAN: Ah, a young trainer. Have you heard the old tale of the RIFT?');
    yield* say('Long ago, before any town was built, the land of VALEMORA split open. The old texts call it the RIFT.');
    yield* say('Where it touched, rivers ran backward and AIMON fell silent. Everything was... bent out of shape.');
    yield* say('Eight trainers and their AIMON sealed it with eight great stones, the KEYSTONES. They became the first GYM LEADERS.');
    yield* say('Every GYM stands over a KEYSTONE. Every BADGE carries a sliver of one. That\'s why a trainer with all eight is trusted with the whole region.');
    yield* say('Some believe the RIFT was never a disaster at all... that the world beyond it is the "true" one, and ours is the distortion.');
    yield* say('Nonsense, if you ask me.\f...But lately, I wonder who else has been reading my books.');
  },

  *repelGift() {
    if (State.flag('gift_repel')) {
      yield* say('REPEL keeps weak wild AIMON away. Great for getting through caves in a hurry!');
      return;
    }
    yield* say('Heading back into the caves? Wild AIMON can wear you down fast in there. Here, take these!');
    State.setFlag('gift_repel');
    yield* this.receive('repel', 2);
  },

  *gymGuide() {
    if (State.flag('badge_keystone')) {
      yield* say('GUIDE: You did it! That was a textbook GYM battle, champ!');
      return;
    }
    yield* say('GUIDE: Hey there, future champ! Let me give you some advice.');
    yield* say('GUIDE: HOLT uses NORMAL-type AIMON. They hit hard and never give up, and they have only one weakness: FIGHTING moves!');
    yield* say('GUIDE: A SCRAPAW from RIFTSTONE CAVE would go a long way here. Good luck!');
  },

  *holtGym(npc) {
    if (State.flag('badge_keystone')) {
      yield* say('HOLT: A shard of the KEYSTONE travels with you now. Carry it well, {PLAYER}.');
      yield* say('HOLT: Rest up at the AIMON CENTRE. I have a feeling TEAM DISTORTION isn\'t done with us.');
      if (!State.flag('badge_grove')) yield* say('HOLT: IVY, in CEDARWOOD VILLAGE, still hasn\'t answered me. It\'s west of WILLOWBROOK. Would you check on her?');
      return;
    }
    yield* say('HOLT: {PLAYER}! You came.');
    yield* say('HOLT: Down in that cave, you stood your ground when my team couldn\'t. That\'s what the NORMAL type is all about.');
    yield* say('HOLT: No tricks. Nothing to hide behind. Just the strength to keep standing, no matter what hits you.');
    yield* say('HOLT: I\'m the foundation this city stands on. Let\'s see if you can shake it!');
    const res = yield* this.battle({ trainer: 'holt' });
    if (res !== 'win') return;
    yield* say('HOLT: ...Ha! Now THAT was a battle! You didn\'t budge an inch.');
    yield* say('HOLT: As proof of your victory, take the KEYSTONE BADGE!');
    State.d.badges.keystone = true;
    State.setFlag('badge_keystone');
    Sound.jingle('badge');
    yield* say('{PLAYER} received the KEYSTONE BADGE from HOLT!');
    yield* BadgeShow.run(0);
    yield* say('HOLT: See the violet sliver in its center? That\'s a real piece of the KEYSTONE beneath this GYM.');
    yield* say('HOLT: Every GYM LEADER carries one. It\'s how we recognize each other... and maybe how the stones recognize us.');
    yield* say('HOLT: Take this TM, too.');
    yield* this.receive('tm01', 1);
    yield* say('HOLT: A TM teaches a move to an AIMON. TM01 holds SWIFT, a move that never misses. You can use a TM as many times as you like.');
    yield* say('HOLT: I\'ve sent word to the other GYM LEADERS about TEAM DISTORTION. If they\'re after all eight KEYSTONES, you\'ll cross paths with them again.');
    yield* say('HOLT: Get stronger, {PLAYER}. I think this whole region may end up counting on it.');
  },

  *epilogue() {
    if (!State.flag('badge_keystone') || State.flag('epilogue_seen')) return;
    State.setFlag('epilogue_seen');
    yield* Game.fadeOut(40);
    Sound.playMusic('cave');
    const scene = { opaque: true, t: 0 };
    const shadow = Pix.silhouette(TrainerArt.get('grunt'), '#140c22');
    const rim = Pix.silhouette(TrainerArt.get('grunt'), '#8850d8');
    scene.draw = (g) => {
      g.fillStyle = '#05030a';
      g.fillRect(0, 0, SCREEN_W, SCREEN_H);
      const pulse = 0.3 + 0.2 * Math.sin(Game.frame / 20);
      g.globalAlpha = pulse;
      Pix.ellipse(g, 120, 70, 60, 34, '#4a2090');
      // A jagged crack of light behind the figure: the RIFT.
      g.strokeStyle = '#c090ff';
      g.lineJoin = 'miter';
      for (const [w, a] of [[9, 0.25], [3, 1]]) {
        g.globalAlpha = pulse * a * 1.6;
        g.lineWidth = w;
        g.beginPath();
        RIFT_CRACK.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.stroke();
      }
      g.lineWidth = 1;
      g.globalAlpha = 0.35 + 0.25 * pulse;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1]]) g.drawImage(rim, 88 + dx, 26 + dy);
      g.globalAlpha = 1;
      g.drawImage(shadow, 88, 26);
      g.fillStyle = '#c080ff';
      g.fillRect(114, 42, 3, 1);
      g.fillRect(123, 42, 3, 1);
    };
    Game.push(scene);
    yield* Game.fadeIn(40);
    const dark = { style: 'dark' };
    yield* say('Meanwhile, somewhere deep beneath VALEMORA...', dark);
    yield* say('???: The first KEYSTONE has been touched. Its song has begun.', dark);
    yield* say('???: And the child who stopped us carries a piece of it now.', dark);
    yield* say('???: Good. Let the children collect their little BADGES.', dark);
    yield* say('???: Every seal they visit... shows us the way to the next.', dark);
    yield* say('TO BE CONTINUED...', dark);
    yield* Game.fadeOut(40);
    Game.remove(scene);
    Sound.playMusic(OW.music());
    yield* Game.fadeIn(30);
  },

  // -- Fishing (OLD ROD) ----------------------------------------------------------
  *fishPrompt() {
    if (!(yield* Dialog.yesNo('The water is deep and dark.\nFish with the OLD ROD?'))) return;
    Dialog.close();
    yield* this.fish();
  },

  *fish() {
    const p = OW.player;
    const [dx, dy] = U.dirVec[p.dir];
    const table = OW.map.def.fishing;
    if (!table || !Tiles.def(OW.tile(p.x + dx, p.y + dy)).water) {
      yield* say(table ? 'Face the water to use the OLD ROD.' : 'There\'s nowhere to fish here.');
      return;
    }
    OW.fishing = true;
    Sound.sfx('select');
    yield* say('{PLAYER} cast the OLD ROD...', { auto: 20 });
    yield* say('. . . . . .', { auto: 30 + U.rand(60) });
    if (!U.chance(0.7)) {
      OW.fishing = false;
      yield* say('Not even a nibble...');
      return;
    }
    OW.fishing = 'bite';
    p.emote = 30;
    Sound.sfx('exclaim');
    yield* say('Oh! A bite!', { auto: 30 });
    OW.fishing = false;
    Dialog.close();
    const e = U.weighted(table.table);
    yield* this.wildBattle(e.species, U.randInt(e.min, e.max));
  },

  *escapeRope() {
    const e = OW.map.def.escape;
    Sound.sfx('flee');
    yield* say('{PLAYER} used the ESCAPE ROPE!');
    yield* OW.teleport(e.map, e.x, e.y, e.dir);
  },
};

// Zigzag points of the RIFT crack in the epilogue.
const RIFT_CRACK = [[124, 0], [117, 12], [126, 24], [114, 38], [123, 52], [111, 66], [127, 80], [116, 94], [122, 112]];

// Picture window shown above the text box (e.g. choosing a starter).
const Popup = {
  mon(sp) {
    const scene = {
      draw(g) {
        UI.window(g, 88, 22, 80, 80);
        g.fillStyle = '#e8f0f0';
        g.fillRect(92, 26, 72, 72);
        g.drawImage(MonSprites.front(sp), 96, 30);
      },
    };
    Game.push(scene);
    Sound.cry(sp);
    return scene;
  },
};

// Screen wipes into battles.
const Transition = {
  scene: null,
  *play(kind) {
    Sound.sfx('encounter');
    const s = { t: 0, kind, flash: 0 };
    s.draw = (g) => {
      if (s.flash > 0) {
        g.fillStyle = `rgba(255,255,255,${s.flash})`;
        g.fillRect(0, 0, SCREEN_W, SCREEN_H);
      }
      if (s.t <= 0) return;
      g.fillStyle = '#000';
      const bars = 8;
      const h = SCREEN_H / bars;
      for (let i = 0; i < bars; i++) {
        const k = U.clamp((s.t - i * 2) / 18, 0, 1);
        const w = Math.round(SCREEN_W * k);
        if (s.kind === 'trainer') {
          g.fillRect(0, i * h, SCREEN_W, Math.ceil(h * k));
        } else if (i % 2) g.fillRect(SCREEN_W - w, i * h, w, h);
        else g.fillRect(0, i * h, w, h);
      }
    };
    this.scene = s;
    Game.push(s);
    for (let i = 0; i < 2; i++) {
      for (let f = 0; f < 6; f++) { s.flash = f / 6 * 0.8; yield; }
      for (let f = 0; f < 6; f++) { s.flash = (1 - f / 6) * 0.8; yield; }
    }
    s.flash = 0;
    for (let f = 0; f < 36; f++) { s.t = f; yield; }
    Game.fadeA = 1;
    Game.fadeColor = '#000';
  },
  clear() {
    if (this.scene) Game.remove(this.scene);
    this.scene = null;
  },
};
