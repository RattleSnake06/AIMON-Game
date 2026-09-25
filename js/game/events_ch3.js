'use strict';
// Chapter 3 story: the withering cedar and TEAM DISTORTION's hideout under
// CEDARWOOD's library (GYM 2), then the storm over SEABREEZE PORT and the
// lighthouse (GYM 3).

// The same mono-coloured cutscene style as the chapter 2 epilogue.
const DARK = { style: 'dark' };

Object.assign(Events, {
  // Hand over a GYM BADGE with the jingle and close-up.
  *awardBadge(i, leader) {
    const b = BADGES[i];
    State.d.badges[b.id] = true;
    State.setFlag(`badge_${b.id}`);
    Sound.jingle('badge');
    yield* say(`{PLAYER} received the ${b.name} from ${leader}!`);
    yield* BadgeShow.run(i);
  },

  // Someone walks in from off to one side and faces the player.
  *arrive(o, near, side) {
    const p = near || OW.player;
    const e = OW.spawnNear(o, p, side);
    e.emote = 30;
    Sound.sfx('exclaim');
    yield 30;
    yield* OW.approach(e, p);
    return e;
  },

  // Walk someone away and remove them.
  *leave(e, x, y) {
    yield* OW.walkTo(e, x, y);
    OW.despawn(e);
  },

  // A copy of a map NPC/prop definition, spawned by id (for props that
  // change state, like the coils in the lighthouse).
  spawnDef(id) {
    const def = (OW.map.def.npcs || []).find((n) => n.id === id);
    return def ? OW.spawn(def) : null;
  },

  // -- Willowbrook: PROF. LINDEN explains evolution ------------------------------
  *lindenEvolution() {
    if (!State.flag('badge_keystone') || State.flag('linden_evo')) return;
    State.setFlag('linden_evo');
    const prof = yield* this.arrive({ id: 'linden_w', person: 'prof' }, OW.player, 'east');
    yield* say('PROF. LINDEN: {PLAYER}! Wait a moment!');
    yield* say('PROF. LINDEN: HOLT called me. A KEYSTONE, TEAM DISTORTION... and you with a BADGE already! I\'m proud of you.');
    yield* say('PROF. LINDEN: I have news of my own. Ever since the tremors began, AIMON all over VALEMORA have been changing shape.');
    yield* say('PROF. LINDEN: We call it EVOLUTION. When some AIMON grow strong enough, they transform into a new form after a battle.');
    yield* say('PROF. LINDEN: An evolved AIMON is stronger and can learn new moves. If you\'d rather it stayed as it is, hold the B BUTTON while it evolves.');
    yield* say('PROF. LINDEN: TIDEPUP, REEFWHIRL, SKYDRIFT... There\'s a lot we still don\'t know. Here, these will help you meet them.');
    yield* this.receive('greatball', 5);
    yield* say('PROF. LINDEN: One more thing. My old friend IVY leads the GYM in CEDARWOOD VILLAGE, west along ROUTE 5.');
    yield* say('PROF. LINDEN: She hasn\'t answered a single letter in weeks. That isn\'t like her.\fPlease check on her for me, {PLAYER}.');
    yield* this.leave(prof, 14, 12);
  },

  // -- Route 5 ------------------------------------------------------------------------
  *rodGift() {
    if (State.count('oldrod')) {
      yield* say('Face any water and press A to fish with the OLD ROD. Some AIMON only live underwater!');
      return;
    }
    yield* say('Catching anything? Me neither. They\'ve been skittish since the tremors started.');
    yield* say('Tell you what, you look like a trainer who needs this more than me. I\'ve got a spare.');
    yield* this.receive('oldrod', 1);
    yield* say('That\'s an OLD ROD. Face the water and press A, or use it from your BAG. You never know what\'ll bite!');
  },

  // -- Pinecrest Forest ---------------------------------------------------------------
  *shrineInspect() {
    if (State.flag('umbrafang_done')) {
      yield* say('An old, moss-covered shrine. The violet light at its heart has gone quiet.');
      return;
    }
    yield* say('An old, moss-covered shrine. A faint violet light flickers on the offering stone.\fWords are carved into the base:\n"TO THE GUARDIAN OF FORGOTTEN PLACES."');
  },

  *umbrafangEncounter(npc) {
    Sound.cry('umbrafang');
    Game.shake = 16;
    yield* say('A shadow stirs in front of the shrine...');
    yield* say('Its eyes flash violet!', { auto: 40 });
    const res = yield* this.battle({ wild: { species: 'umbrafang', level: 19 } });
    if (res === 'lose') return;
    if (res === 'run') {
      yield* say('The UMBRAFANG is still watching from the shadows...');
      return;
    }
    State.setFlag('umbrafang_done');
    OW.despawn(npc);
    if (res === 'win') yield* say('The shadow melted into the forest...');
  },

  // -- Cedarwood Village --------------------------------------------------------------
  *cedarArrive() {
    if (State.flag('cw_arrived')) return;
    State.setFlag('cw_arrived');
    yield 20;
    yield* say('Needles are drifting down from a giant tree at the heart of the village...');
    const kai = yield* this.arrive({ id: 'kai_cw', person: 'rival' }, OW.player, 'west');
    yield* say('KAI: {PLAYER}! You came too? Look at that tree. The whole village says it\'s dying from the roots up.');
    yield* say('KAI: And guess what? People in black coats and violet visors have been sneaking around at night.');
    yield* say('KAI: TEAM DISTORTION. It has to be. IVY, the GYM LEADER, is holed up in the LIBRARY trying to figure it out.');
    yield* say('KAI: I\'m going to check the woods around the village. You go talk to IVY. Whoever finds them first wins, deal?');
    yield* this.leave(kai, 21, 14);
  },

  *cedarInspect() {
    if (State.flag('hideout_cleared')) {
      yield* say('THE GREAT CEDAR\nOver a thousand years old.\fFresh green needles are sprouting all along its branches!');
      return;
    }
    yield* say('THE GREAT CEDAR\nOver a thousand years old.\fIts needles are brown and falling. The roots look grey and dry.');
  },

  *librarianTalk() {
    if (State.flag('hideout_cleared')) {
      yield* say('LIBRARIAN: A secret passage in MY library, all this time! I\'ve moved VOLUME 4 to a very ordinary shelf.');
      return;
    }
    if (State.flag('library_open')) {
      yield* say('LIBRARIAN: Please be careful down there! And... try not to scuff the stairs.');
      return;
    }
    if (State.flag('ivy_library')) {
      yield* say('LIBRARIAN: The night visitors? They always went to the back corner, by the clock. I thought they just loved history.');
      return;
    }
    yield* say('LIBRARIAN: Welcome to the CEDARWOOD LIBRARY. Please keep your voice down.');
  },

  *tornNote() {
    State.setFlag('read_note');
    yield* say('A torn page lies on the table. Someone wrote on the back of it:\f"New recruits: RIFT HISTORIES, VOL. 4, back wall by the clock.\nThe one with the cold spine. PULL, don\'t push. -V"');
  },

  *ivyLibrary() {
    if (State.flag('library_open')) {
      yield* say('IVY: Go on! I\'ll make sure nobody sneaks out behind you.');
      return;
    }
    if (State.flag('ivy_library')) {
      yield* say('IVY: They come in here at night and never leave by the door. There has to be another way out of this room.');
      yield* say(State.flag('read_note')
        ? 'IVY: A note about VOLUME 4 of RIFT HISTORIES? By the clock... Let\'s look at the back wall!'
        : 'IVY: Look around for anything strange. A book out of place, a note someone dropped...');
      return;
    }
    State.setFlag('ivy_library');
    yield* say('IVY: Hm? Oh! I\'m sorry, I didn\'t hear you come in. I\'m IVY. I lead the GYM here in CEDARWOOD.');
    yield* say('IVY: PROF. LINDEN sent you? ...I\'ve been ignoring my letters. I\'m sorry. I couldn\'t leave the cedar.');
    yield* say('IVY: The great cedar isn\'t sick. Something is draining it from below, from the roots. I can feel it through my AIMON.');
    yield* say('IVY: And every night, people in black coats slip into this library... and they never walk out the front door.');
    yield* say('IVY: There must be a hidden way down somewhere in this room. Will you help me find it?');
  },

  *secretShelf(npc) {
    if (!State.flag('ivy_library')) {
      yield* say('RIFT HISTORIES, VOLUMES 1 to 8... except VOLUME 4, which is pushed in oddly far.');
      return;
    }
    yield* say('RIFT HISTORIES, VOLUME 4.\nIts spine is cold and smooth, like metal...');
    if (!(yield* Dialog.yesNo('Pull on VOLUME 4?'))) return;
    Dialog.close();
    Sound.sfx('rumble');
    Game.shake = 30;
    yield* say('Click!', { auto: 20 });
    Dialog.close();
    // The bookcase grinds aside.
    Sound.sfx('rumble');
    yield* BattleFX.tween(40, (t) => { npc.ox = Math.round(t * 16); });
    OW.despawn(npc);
    State.setFlag('library_open');
    yield* say('The bookcase slid aside, revealing a staircase going down!');
    const p = OW.player;
    yield* OW.walk(p, 'left', 1);
    p.dir = 'right';
    const ivy = OW.npc('lib_ivy');
    if (ivy) {
      OW.faceTowards(ivy, p);
      ivy.emote = 30;
      yield 30;
      yield* say('IVY: A hidden staircase! Right under the roots of the great cedar...');
    }
    const kai = yield* this.arrive({ id: 'kai_lib', person: 'rival' }, OW.player, 'south');
    yield* say('KAI: I heard a rumble all the way from outside! A secret passage?!');
    yield* say('KAI: Ha! Then I found it first... well, second. Whatever! I\'m going in. Try to keep up, {PLAYER}!');
    yield* OW.walkTo(kai, 12, 2);
    yield* OW.walk(kai, 'up', 1);
    Sound.sfx('door');
    OW.despawn(kai);
    if (ivy) {
      OW.faceTowards(ivy, OW.player);
      yield* say('IVY: That boy! ...{PLAYER}, please follow him. I\'ll guard this entrance so nobody escapes behind you.');
      yield* say('IVY: Be careful. Whatever is down there is hurting the cedar.');
    }
  },

  // -- The hideout ------------------------------------------------------------------
  *hideoutGate(npc) {
    if (!State.count('cardkey')) {
      yield* say('A humming wall of violet energy blocks the way.\fThere\'s a slot for a CARD KEY.');
      return;
    }
    yield* say('{PLAYER} used the CARD KEY!');
    Sound.sfx('zap');
    Game.shake = 8;
    OW.despawn(npc);
    State.setFlag('gate_open');
    yield* say('The energy gate flickered out!');
  },

  *rootstoneInspect() {
    if (State.flag('hideout_cleared')) {
      yield* say('The ROOTSTONE. Green veins pulse through the violet stone like sap through a branch.\fA hairline crack runs down its face.');
      return;
    }
    yield* say('A violet stone wrapped in the roots of the great cedar. Cables from the machine are clamped onto it.');
  },

  *resonator2Inspect() {
    if (State.flag('hideout_cleared')) {
      yield* say('RESONATOR MK-II. Its cables have been torn out. A little screen still reads:\n"SONG RECORDED: ROOTSTONE."');
      return;
    }
    yield* say('A humming machine labeled "RESONATOR MK-II." It\'s sucking something out of the stone.');
  },

  *vesperShowdown() {
    if (State.flag('hideout_cleared') || OW.busy > 1) return;
    const p = OW.player;
    const vesper = OW.npc('h_vesper');
    if (!vesper) return;
    Sound.sfx('hum');
    yield* OW.pan(0, -1.5, 40);
    const kai = OW.spawn({ id: 'kai_h2', person: 'rival', x: 5, y: 7, dir: 'up' });
    yield* say('A woman in a long coat stands before a stone wrapped in giant roots. KAI is on his knees beside her.');
    yield* say('KAI: Ugh... {PLAYER}... Don\'t... her AIMON don\'t attack. They sing...');
    vesper.dir = 'down';
    yield 20;
    yield* say('???: Shh. Listen.\fThe ROOTSTONE is singing. A little off-key... but we\'ve nearly recorded the whole song.');
    yield* say('VESPER: I\'m VESPER, an ADMIN of TEAM DISTORTION. And you must be the child who silenced our RESONATOR in RIFTSTONE CAVE.');
    yield* say('VESPER: The CONDUCTOR thinks you\'re just noise. I think you\'re... interesting. Let\'s find out which of us is right.');
    yield* OW.pan(0, 0, 30);
    yield* OW.approach(vesper, p);
    yield* say('VESPER: Bend. Break. Become.');
    const res = yield* this.battle({ trainer: 'vesper' });
    if (res !== 'win') return;
    yield* say('VESPER: ...Well. The song is recorded anyway. Every note of it.');
    yield* say('VESPER: Keep collecting your little BADGES, child. You\'re doing our work for us.');
    Sound.sfx('zap');
    Game.shake = 16;
    yield* BattleFX.tween(20, () => { vesper.hidden = !vesper.hidden; });
    OW.despawn(vesper);
    yield* say('VESPER vanished in a flash of violet light!');
    // The cedar's warden arrives.
    const ivy = OW.spawn({ id: 'ivy_h2', person: 'ivy', x: 8, y: 12, dir: 'up' });
    yield* OW.approach(ivy, p);
    yield* say('IVY: {PLAYER}! Are you hurt? I heard the battle all the way up the stairs...');
    OW.faceTowards(ivy, { x: 11, y: 3 });
    yield* say('IVY: That machine! It\'s clamped onto the stone...');
    Sound.sfx('confirm');
    Game.shake = 12;
    yield* say('IVY tore the cables loose from the stone!');
    State.setFlag('hideout_cleared');
    Sound.sfx('heal');
    yield* say('The roots around the stone shudder... and a pulse of green light runs up through them!');
    OW.faceTowards(ivy, p);
    yield* say('IVY: This is the ROOTSTONE. CEDARWOOD\'s KEYSTONE. The great cedar grew around it long before the village was built.');
    yield* say('IVY: Every GYM LEADER is a WARDEN of one of the eight stones. HOLT wrote to me about RIFTSTONE CAVE... I should have listened.');
    yield* say('IVY: They didn\'t try to break this one. They were recording it. Its "song." ...What would anyone want with that?');
    OW.faceTowards(kai, ivy);
    yield* say('KAI: Whatever it is, I\'m going to stop them. Next time I won\'t be the one on the floor!');
    yield* say('KAI: {PLAYER}... thanks. I owe you one. But don\'t get used to it!');
    yield* this.leave(kai, 8, 12);
    yield* say('IVY: Let me take care of your team. You\'ve earned it.');
    yield* this.healJingle();
    yield* say('IVY: My GYM is open again. When you\'re ready, come and challenge me at the greenhouse.');
    yield* say('IVY: I\'ll warn HOLT and the other WARDENS about the songs. Something tells me this is only the beginning.');
    yield* this.leave(ivy, 8, 12);
  },

  // -- Cedarwood GYM ------------------------------------------------------------------
  *gymGuideIvy() {
    if (State.flag('badge_grove')) {
      yield* say('GUIDE: You beat IVY! Even the greenhouse flowers are cheering for you!');
      return;
    }
    yield* say('GUIDE: Hey, future champ! IVY\'s greenhouse is a maze, and her vines are shut tight.');
    yield* say('GUIDE: See those pink buds? Three of them are asleep somewhere in here. Wake one up and its vine wall withers away!');
    yield* say('GUIDE: IVY uses GRASS types. They\'ll put you to sleep and drain your HP.');
    yield* say('GUIDE: FIRE, FLYING and BUG moves work great against them. A FLAMBRAMBLE from ROUTE 5 would scorch this place!');
  },

  *ivyGym() {
    if (State.flag('badge_grove')) {
      yield* say('IVY: The great cedar is growing new needles every day. The whole village has come to see it.');
      yield* say('IVY: NERISSA leads the GYM in SEABREEZE PORT. A storm has sat over the port for days. It doesn\'t move.');
      yield* say('IVY: I\'ve asked GRAYHAVEN to open ROUTE 4 for you. It runs south from the city to the coast.');
      return;
    }
    yield* say('IVY: Welcome to my greenhouse, {PLAYER}. Every AIMON in here grew up under the great cedar.');
    yield* say('IVY: A GRASS type bends in the wind, but it never breaks. Its roots hold.');
    yield* say('IVY: You helped save my cedar. Now let me see how deep your own roots go!');
    const res = yield* this.battle({ trainer: 'ivy' });
    if (res !== 'win') return;
    yield* say('IVY: What a battle! You grew stronger with every move.');
    yield* say('IVY: Please take the GROVE BADGE. Its violet sliver was cut from the ROOTSTONE, just like HOLT\'s.');
    yield* this.awardBadge(1, 'IVY');
    yield* say('IVY: And this TM. It holds MAGICAL LEAF, a move that never misses.');
    yield* this.receive('tm02', 1);
    yield* say('IVY: Now, listen. NERISSA, the GYM LEADER of SEABREEZE PORT, hasn\'t answered me since the storm rolled in.');
    yield* say('IVY: A storm that sits in one place for days... that isn\'t weather. Head south from GRAYHAVEN along ROUTE 4. I\'ll call ahead.');
  },

  // A kindly old sage who helps AIMON remember forgotten moves.
  *moveReminder() {
    yield* say('SAGE: I help AIMON remember moves they forgot, or learned too long ago to recall.');
    if (!(yield* Dialog.yesNo('SAGE: Shall I help one of yours?'))) {
      yield* say('SAGE: Come back whenever you like.');
      return;
    }
    Dialog.close();
    const i = yield* Party.open({ mode: 'item', msg: 'Which AIMON should remember a move?' });
    if (i < 0) return;
    const mon = State.party[i];
    const moves = [...new Set(mon.sp.learnset.filter(([l]) => l <= mon.level).map(([, m]) => m))].filter((m) => !mon.knows(m));
    if (!moves.length) {
      yield* say(`SAGE: Hm... ${mon.name} remembers everything it knows. Impressive!`);
      return;
    }
    yield* say(`SAGE: Which move should ${mon.name} remember?`, { noWait: true, hold: true });
    const k = yield* Menu.choose({ items: [...moves.map((m) => MOVES[m].name), 'CANCEL'], anchor: 'right', cancel: moves.length, visible: 6 });
    Dialog.close();
    if (k < 0 || k >= moves.length) return;
    yield* learnMoveFlow(mon, moves[k], 'field');
  },

  // -- Route 4 -------------------------------------------------------------------------
  *rivalRoute4() {
    if (State.flag('rival3_done') || !State.flag('badge_grove')) return;
    const kai = yield* this.arrive({ id: 'kai_r4', person: 'rival' }, OW.player, 'south');
    yield* say('KAI: {PLAYER}! Figures you\'d come this way too.');
    yield* say('KAI: I\'ve been training in the rain since CEDARWOOD. Every single day. I\'m not losing to TEAM DISTORTION again...');
    yield* say('KAI: ...and I\'m not losing to you either! Let\'s go!');
    const res = yield* this.battle({ trainer: 'rival3' });
    if (res !== 'win') return;
    State.setFlag('rival3_done');
    yield* say('KAI: Still not enough, huh...');
    yield* say('KAI: The storm over SEABREEZE is TEAM DISTORTION\'s doing, I\'d bet on it. The sailors can\'t even get home.');
    yield* say('KAI: I\'m going on ahead to help. See you in SEABREEZE!');
    yield* this.leave(kai, 11, 45);
  },

  // -- Seabreeze Port ------------------------------------------------------------------
  *seabreezeArrive() {
    if (State.flag('sb_arrived') || State.flag('storm_cleared')) return;
    State.setFlag('sb_arrived');
    Sound.sfx('rumble');
    Game.shake = 24;
    OW.flashT = 14;
    yield 30;
    yield* say('Thunder crashes over SEABREEZE PORT. The storm hangs right over the harbor, and it isn\'t moving.');
    yield* say('Out on the point, the lighthouse is shining an eerie violet...');
  },

  *nerissaDock() {
    if (State.flag('lighthouse_open')) {
      yield* say('NERISSA: The door\'s open! Go! I\'ll make sure every boat in the harbor stays tied down.');
      return;
    }
    if (State.flag('nerissa_met')) {
      yield* say('NERISSA: That door\'s sealed with the same energy lock the CEDARWOOD gang used. If only we had one of their key cards...');
      return;
    }
    State.setFlag('nerissa_met');
    yield* say('???: Stand back, kid! This is no place for... Hold on. You\'re {PLAYER}, aren\'t you? IVY told me about you.');
    yield* say('NERISSA: I\'m NERISSA, captain of SEABREEZE and its GYM LEADER. And that lighthouse is mine to protect.');
    yield* say('NERISSA: Three nights ago TEAM DISTORTION took it. They set up some tower of coils around the lamp, and the storm started that same hour.');
    yield* say('NERISSA: The lamp isn\'t glass. It\'s the TIDESTONE, our KEYSTONE. The whole lighthouse was built around it.');
    yield* say('NERISSA: I tried to sail around to the gallery, but the waves threw my boat back every time. And this door is sealed with an energy lock.');
    if (State.count('cardkey')) {
      yield* say('NERISSA: ...Wait. Is that a TEAM DISTORTION CARD KEY? You took it from their hideout?!');
      yield* say('NERISSA: Ha! Then that door is yours to open. Go on, try it!');
    }
  },

  *lighthouseDoor() {
    if (!State.flag('nerissa_met')) {
      yield* say('The door is sealed by a humming violet energy lock.');
      return;
    }
    if (!State.count('cardkey')) {
      yield* say('The door is sealed by an energy lock. It needs a CARD KEY.');
      return;
    }
    yield* say('{PLAYER} used the CARD KEY!');
    Sound.sfx('zap');
    Game.shake = 8;
    State.setFlag('lighthouse_open');
    yield* say('The energy lock slid open with a hiss!');
    const kai = yield* this.arrive({ id: 'kai_sb', person: 'rival' }, OW.player, 'west');
    yield* say('KAI: {PLAYER}! You got it open? Nice!');
    yield* say('KAI: Grunts keep circling back to this door. I\'ll hold it. Nobody\'s sneaking up the stairs behind you.');
    yield* say('KAI: Go shut that storm off!');
    OW.despawn(kai);
    this.spawnDef('sb_kai');
  },

  *kaiDoor() {
    yield* say('KAI: I\'ve got the door covered. Go, go, go!');
  },

  // -- The lighthouse -----------------------------------------------------------------
  *stormCoil(npc) {
    const id = npc.def.arg;
    yield* say('A tall coil crackling with violet energy. At its base, a VOLTIMP is locked in a cage, sparking weakly.\fIt\'s being forced to power the storm!');
    if (!(yield* Dialog.yesNo('Open the cage and free the VOLTIMP?'))) return;
    Dialog.close();
    Sound.sfx('door');
    yield* say('The cage door swung open!');
    Sound.cry('voltimp');
    npc.emote = 30;
    yield 30;
    yield* say('The VOLTIMP is panicking! It attacks!');
    const res = yield* this.battle({ wild: { species: 'voltimp', level: 20 } });
    if (res === 'lose') return;
    State.setFlag(`coil_${id}`);
    OW.despawn(npc);
    this.spawnDef(`${npc.def.id}off`);
    Sound.sfx('zap');
    yield* say(res === 'caught' ? 'With its VOLTIMP gone, the coil sputtered out!' : 'The VOLTIMP scampered off to freedom, and the coil sputtered out!');
    yield* this.checkGates();
  },

  // Lower an energy gate once every coil feeding it is shut down.
  *checkGates() {
    const gates = { l1_gate: ['l1a'], l2_gate: ['l2a', 'l2b'] };
    for (const [id, coils] of Object.entries(gates)) {
      const gate = OW.npc(id);
      if (!gate || !coils.every((c) => State.flag(`coil_${c}`))) continue;
      if (id === 'l2_gate') State.setFlag('gate_l2');
      Sound.sfx('zap');
      Game.shake = 8;
      OW.despawn(gate);
      yield* say('The energy gate by the stairs flickered and died!');
      return;
    }
    if (OW.npc('l2_gate')) yield* say('The gate is still humming. Another coil must be powering it.');
  },

  *coilGate() {
    yield* say('A humming wall of violet energy. Cables run from it to the coils on this floor.');
  },

  *lensInspect() {
    if (State.flag('storm_cleared')) {
      yield* say('The TIDESTONE, cut like a giant lens. Its steady light reaches far out to sea.');
      return;
    }
    yield* say('The lamp is a huge cut stone, pulsing violet. Cables from the coils below are clamped all around it.');
  },

  *thaneShowdown() {
    if (State.flag('storm_cleared') || OW.busy > 1) return;
    const thane = OW.npc('l3_thane');
    if (!thane) return;
    const p = OW.player;
    Sound.sfx('rumble');
    Game.shake = 20;
    OW.flashT = 14;
    yield 20;
    yield* say('Wind howls through the lamp room. A man in a long coat stands with his back to you, watching the storm.');
    yield* say('???: So the kid from CEDARWOOD made it all the way up. VESPER said you would.');
    OW.faceTowards(thane, p);
    yield* say('THANE: Name\'s THANE. ADMIN. I\'ve been riding this storm for three days, and I\'m not about to let a kid ground it.');
    yield* say('THANE: The TIDESTONE doesn\'t sing unless you shake it hard enough. So we shook the whole coast.');
    yield* OW.approach(thane, p);
    yield* say('THANE: Let\'s see if you can weather it. STORMGALE, you\'re up last. Bend. Break. Become!');
    const res = yield* this.battle({ trainer: 'thane' });
    if (res !== 'win') return;
    yield* say('THANE: Tch. The coils are down anyway. You saw to that.');
    Sound.sfx('select');
    yield* say('Something on THANE\'s coat crackles. A cold voice comes through a radio...', { auto: 50 });
    yield* say('???: Enough, THANE. Leave the stone.', DARK);
    yield* say('???: The RIFTSTONE. The ROOTSTONE. And now the TIDESTONE. Three songs are enough to hear the shape of the melody.', DARK);
    yield* say('THANE: ...Understood, CONDUCTOR.');
    yield* say('THANE: Enjoy the sunshine, kid. It won\'t last.');
    Sound.sfx('zap');
    OW.flashT = 14;
    yield* BattleFX.tween(20, () => { thane.hidden = !thane.hidden; });
    OW.despawn(thane);
    yield* say('THANE leapt from the gallery into the waves below and was gone!');
    // The storm breaks.
    State.setFlag('storm_cleared');
    Sound.playMusic('lighthouse');
    Sound.sfx('heal');
    yield* Game.fadeOut(20, '#ffffff');
    yield 20;
    yield* Game.fadeIn(40);
    yield* say('The violet glow drained from the lamp. Through the windows, the clouds are tearing apart and sunlight is pouring in!');
    const ner = OW.spawn({ id: 'nerissa_l3', person: 'nerissa', x: 2, y: 2, dir: 'down' });
    yield* OW.approach(ner, p);
    yield* say('NERISSA: {PLAYER}! The storm... it\'s gone! Every boat in the harbor is safe!');
    yield* say('NERISSA: And the TIDESTONE is shining gold again. Three hundred years, and it\'s never looked so bright.');
    yield* say('NERISSA: I\'m its WARDEN, same as HOLT and IVY are for theirs. I should\'ve been here to guard it.');
    yield* say('NERISSA: "Songs"... "the shape of the melody"... Whatever their CONDUCTOR is planning, it needs every KEYSTONE.');
    yield* say('NERISSA: Here, let me patch up your crew.');
    yield* this.healJingle();
    yield* say('NERISSA: My GYM is open again, and I owe you a real battle. Meet me there when you\'re ready!');
    yield* this.leave(ner, 2, 2);
  },

  // -- Seabreeze GYM ------------------------------------------------------------------
  *gymGuideNerissa() {
    if (State.flag('badge_tide')) {
      yield* say('GUIDE: You beat the CAPTAIN! The whole port is going to celebrate tonight!');
      return;
    }
    yield* say('GUIDE: Ahoy, future champ! The CAPTAIN built her GYM around the tides. Step into a current and it\'ll carry you!');
    yield* say('GUIDE: Every current flows one way only. Pick the wrong one and it\'ll wash you right back here. Watch the arrows in the water.');
    yield* say('GUIDE: Once you\'ve beaten the CAPTAIN, the current on the right of her deck will carry you back down.');
    yield* say('GUIDE: The CAPTAIN uses WATER types, and every one of them has evolved.');
    yield* say('GUIDE: GRASS and ELECTRIC moves hit them hard. And watch out for her SKYSERAPH. It\'s faster than the wind!');
  },

  *nerissaGym() {
    if (State.flag('badge_tide')) {
      yield* say('NERISSA: The road west is clear again. SILVERFALL CITY lies that way, and CRAGMOOR\'s GYM beyond it.');
      yield* say('NERISSA: Five more BADGES, five more WARDENS. Keep your eyes on the water, and your crew close.');
      return;
    }
    yield* say('NERISSA: Welcome aboard, {PLAYER}! The sun\'s out and the tide\'s high. Perfect battling weather.');
    yield* say('NERISSA: The sea can be gentle as a lullaby or wild enough to swallow ships. My AIMON are both.');
    yield* say('NERISSA: Show me the strength that broke that storm!');
    const res = yield* this.battle({ trainer: 'nerissa' });
    if (res !== 'win') return;
    yield* say('NERISSA: Ha! What a battle! You rode every wave I threw at you.');
    yield* say('NERISSA: This is yours, the TIDE BADGE. Look close: a sliver of the TIDESTONE, set in the middle.');
    yield* this.awardBadge(2, 'NERISSA');
    yield* say('NERISSA: And take this TM. WATER PULSE, a move my crew swears by.');
    yield* this.receive('tm03', 1);
    yield* say('NERISSA: Three BADGES. Three stones that TEAM DISTORTION has "heard." I don\'t like how that sounds.');
    yield* say('NERISSA: The storm buried the road west, but the crews are digging it out as we speak.');
    yield* say('NERISSA: Follow ROUTE 8 to SILVERFALL CITY. The next GYM is in CRAGMOOR, across the river. And I think you\'ll be needed out there.');
  },

  *ferryTalk() {
    if (!State.flag('storm_cleared')) {
      yield* say('SAILOR: Ferry\'s cancelled! Nobody\'s sailing anywhere in this storm.');
      return;
    }
    if (!State.flag('badge_tide')) {
      yield* say('SAILOR: The sea\'s calm again! Ferries to the islands start up again soon, once we\'ve checked the boats.');
      return;
    }
    yield* say('SAILOR: The ferries to STARFALL ISLE and the AIMON LEAGUE island are still being repaired after the storm.');
    yield* say('SAILOR: If you\'re heading on, take ROUTE 8 west out of town. It goes all the way to SILVERFALL CITY.');
  },

  *healGift() {
    if (State.flag('gift_fullheal')) {
      yield* say('FULL HEAL cures any status problem. Great against those sneaky ELECTRIC and GRASS types!');
      return;
    }
    yield* say('You\'re the trainer who went into the lighthouse? My dad says you\'re crazy. I think you\'re awesome!');
    yield* say('Here, take these. My mom says every good sailor carries a few.');
    State.setFlag('gift_fullheal');
    yield* this.receive('fullheal', 2);
  },

  // -- Epilogue: the admins report to the CONDUCTOR ----------------------------------------
  *epilogue2() {
    if (!State.flag('badge_tide') || State.flag('epilogue2_seen')) return;
    State.setFlag('epilogue2_seen');
    yield* Game.fadeOut(40);
    Sound.playMusic('cave');
    const scene = { opaque: true };
    const grunt = TrainerArt.get('grunt');
    const figs = [
      [Pix.silhouette(TrainerArt.get('vesper'), '#140c22'), Pix.silhouette(TrainerArt.get('vesper'), '#8850d8'), 40, 44],
      [Pix.silhouette(grunt, '#0c0814'), Pix.silhouette(grunt, '#b070f8'), 88, 24],
      [Pix.silhouette(TrainerArt.get('thane'), '#140c22'), Pix.silhouette(TrainerArt.get('thane'), '#f0c030'), 136, 44],
    ];
    scene.draw = (g) => {
      g.fillStyle = '#05030a';
      g.fillRect(0, 0, SCREEN_W, SCREEN_H);
      const pulse = 0.3 + 0.2 * Math.sin(Game.frame / 20);
      // Three KEYSTONE lights hang in the dark.
      for (const [x, col] of [[60, '#b070f8'], [120, '#78e060'], [180, '#58a0f0']]) {
        g.globalAlpha = pulse;
        Pix.ellipse(g, x, 18, 10, 6, col);
      }
      g.globalAlpha = 1;
      for (const [shadow, rim, x, y] of figs) {
        g.globalAlpha = 0.35 + 0.25 * pulse;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1]]) g.drawImage(rim, x + dx, y + dy);
        g.globalAlpha = 1;
        g.drawImage(shadow, x, y);
      }
      g.fillStyle = '#c080ff';
      g.fillRect(114, 40, 3, 1);
      g.fillRect(123, 40, 3, 1);
    };
    Game.push(scene);
    yield* Game.fadeIn(40);
    yield* say('Meanwhile, somewhere deep beneath VALEMORA...', DARK);
    yield* say('VESPER: The ROOTSTONE\'s song is recorded, CONDUCTOR. Every note.', DARK);
    yield* say('THANE: And the TIDESTONE\'s. The kid broke the storm, but we got what we came for.', DARK);
    yield* say('???: Three songs. The RIFT is already listening.', DARK);
    yield* say('???: Five more WARDENS. Five more stones.', DARK);
    yield* say('???: And the child carries three pieces of the melody now. Let them keep collecting...', DARK);
    yield* say('???: When the last BADGE is won, every stone will be singing the same song.\fOurs.', DARK);
    yield* Game.fadeOut(40);
    Game.remove(scene);
    Sound.playMusic(OW.music());
    yield* Game.fadeIn(30);
  },
});
