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
    if (npc.sprite !== 'ball' && !d.noFace) OW.faceTowards(npc, OW.player);
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
    if (res === 'win') State.setFlag(`beat_${id}`);
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
    Sound.playMusic(OW.map.def.music);
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
    if (h.map === 'centre') {
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
    State.d.heal = { map: 'centre', x: 6, y: 4, dir: 'up' };
    npc.dir = 'down';
    yield* say('Thank you for waiting.\fWe\'ve restored your AIMON to full health.');
    yield* say('We hope to see you again!');
  },

  *centrePC() {
    Sound.sfx('boot');
    yield* say('{PLAYER} turned on the PC.\fAccessed the AIMON STORAGE SYSTEM.');
    yield* Storage.run();
  },

  *martClerk() {
    yield* Shop.run();
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
};

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
