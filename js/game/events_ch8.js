'use strict';
// Chapter 8 story: KAI on the farm road (ROUTE 12), MEADOWFIELD FARM and
// WREN, THANE's TEMPEST ARRAY on the storm night, the windmill, and GYM 6.
// Chapter 9 story: the snowy road north (ROUTE 11), STONEPEAK WOODS, CANTOR's
// story of AUGUST VALE, MORROW in the bell tower at the hour of silence,
// GYM 7, and a letter signed "R."

Object.assign(Events, {
  // -- ROUTE 12: KAI checks in -------------------------------------------------------------
  *kaiRoute12() {
    const kai = yield* this.arrive({ id: 'kai_r12', person: 'rival' }, OW.player, 'south');
    yield* say('KAI: {PLAYER}! There you are!');
    yield* say('KAI: Mom made me promise to check on you. She says you looked thin.');
    yield* say('KAI: ...Now I\'ve checked. You\'re still annoying.');
    yield* say('KAI: I heard about SUNSPIRE. VESPER, the giant wall, SAHRA stuck in a hole... and I missed ALL of it.');
    yield* say('KAI: So I\'ve been training on this road for three days straight. Let\'s see whose five BADGES are better!');
    const res = yield* this.battle({ trainer: 'rival4' });
    if (res !== 'win') return;
    State.setFlag('beat_rival4');
    yield* say('KAI: Argh! Every single time!');
    yield* say('KAI: ...Hey. You know what\'s weird? SONANCE ENERGY trucks keep driving down to that farm. MEADOWFIELD.');
    yield* say('KAI: A power company. At a farm that makes its own power with a windmill. Doesn\'t add up.');
    yield* say('KAI: I promised Mom I\'d head home for a bit. Go check it out, okay? And try not to get struck by lightning.');
    yield* this.leave(kai, 12, 0);
  },

  // -- MEADOWFIELD FARM: WREN and the SONANCE man ---------------------------------------------
  *mfArrive() {
    State.setFlag('mf_arrived');
    const p = OW.player;
    yield* say('The sails of a great windmill turn slowly over golden fields. Somewhere, a MOOZLE lows.');
    const wren = OW.npc('mf_wren_intro');
    const suit = OW.npc('mf_suit');
    if (!wren || !suit) return;
    yield* OW.pan(2, 4);
    yield* say('SUIT: ...a very generous offer, MS. WREN. SONANCE ENERGY would pay three times what this old mill is worth.');
    yield* say('WREN: It\'s not for sale. Not for three times, not for a hundred times. Tell your bosses what I told them last week.');
    yield* say('SUIT: The weather turns so quickly out here in the country. Do think it over... before tonight.');
    yield* this.leave(suit, 36, 12);
    yield* OW.pan(0, 0);
    wren.emote = 30;
    Sound.sfx('exclaim');
    yield 30;
    yield* OW.approach(wren, p);
    yield* say('WREN: Sorry you had to see that. They\'ve been sniffing around my windmill all summer.');
    yield* say('WREN: I\'m WREN! I run the farm with my grandpa... and the ELECTRIC-type GYM in that big red barn.');
    yield* say('WREN: Wait. Five BADGES, and a SUNSPIRE sunburn... You\'re {PLAYER}! SAHRA\'s letter came yesterday!');
    yield* say('WREN: TEAM DISTORTION, KEYSTONES, the MILLSTONE... I thought she was pulling my leg. Then SONANCE sent the suit again.');
    yield* say('WREN: "Before tonight"? There hasn\'t been a cloud in the sky all week. Something\'s up.');
    yield* say('WREN: The GYM\'s closed today. I want to check every lightning rod on the farm before dark.');
    yield* say('WREN: Come to the farmhouse for supper! It\'s the one by the silo. Grandpa OLLIE makes the best stew in VALEMORA, and you can stay the night.');
    yield* this.leave(wren, 10, 7);
  },

  *wrenHome() {
    if (State.flag('tempest_done')) {
      yield* say('WREN: Morning, hero! Grandpa\'s been telling the MOOZLE about you since sunrise.');
      yield* say('WREN: The GYM\'s open! I\'ll be waiting in the barn.');
      return;
    }
    yield* say('WREN: Make yourself at home! Supper\'s nearly ready.');
  },

  *ollieTalk() {
    if (State.flag('tempest_done')) {
      yield* say('OLLIE: Seventy years on this farm, and I\'ve never seen a storm like that. And I\'ve never seen one stopped, either.');
      yield* say('OLLIE: The MILLSTONE\'s humming again, happy as anything. Thank you, young one.');
      return;
    }
    yield* say('OLLIE: The MILLSTONE\'s older than the farm. Older than VALEMORA\'s name, my grandfather said.');
    yield* say('OLLIE: It hums when the sails turn. Always has.');
  },

  *milkGift() {
    if (State.flag('got_milk_r12')) {
      yield* say('GRANNY: Come back any time, dear. There\'s always milk on the stove.');
      return;
    }
    yield* say('GRANNY: Oh, a traveler! You look worn out, dear. Here, take some of this. Fresh from the farm down the road.');
    yield* this.receive('moozlemilk', 3);
    State.setFlag('got_milk_r12');
    yield* say('GRANNY: MOOZLE MILK heals your AIMON better than any potion. And it tastes a good deal nicer.');
  },

  // -- The farmhouse: supper, and a storm out of a clear sky ------------------------------------
  *farmSupper() {
    State.setFlag('tempest_on');
    const p = OW.player;
    const wren = OW.npc('mfh_wren');
    const ollie = OW.npc('mfh_ollie');
    yield* say('The farmhouse smells of stew and fresh bread.');
    yield* say('WREN: You made it! Grandpa, this is {PLAYER}. The one from SAHRA\'s letter.');
    yield* say('OLLIE: Welcome, welcome! Sit, sit. Anyone who walks in that door eats until they can\'t move.');
    yield* Game.fadeOut(30);
    p.x = 5;
    p.y = 5;
    p.dir = 'left';
    if (wren) wren.dir = 'down';
    if (ollie) ollie.dir = 'left';
    State.healParty();
    yield* Game.fadeIn(30);
    yield* say('Stew, bread, and three helpings of MOOZLE MILK pudding later...');
    Sound.jingle('heal');
    yield* say('Your AIMON are curled up by the stove, warm and full. They\'re fully rested!');
    yield* say('OLLIE: That windmill\'s older than this farm, you know. The stone inside was there before anyone built a mill around it.');
    yield* say('OLLIE: My grandfather called it the MILLSTONE. It hums when the sails turn.');
    yield* say('WREN: SAHRA says it\'s a KEYSTONE. One of the eight that seal the RIFT. And TEAM DISTORTION wants to record its song.');
    yield* say('WREN: I guess that\'s why SONANCE wants the mill so badly. They can\'t buy it, so...');
    // Lights out.
    Sound.sfx('rumble');
    Game.shake = 20;
    yield* Game.fadeOut(4, '#ffffff');
    yield* Game.fadeIn(12);
    yield* say('KRA-KOOOM!');
    yield* say('Thunder shakes the farmhouse! The lamps flicker and go out.');
    if (wren) {
      wren.emote = 30;
      Sound.sfx('exclaim');
      yield 30;
    }
    yield* say('WREN: Thunder?! There wasn\'t a cloud in the sky an hour ago!');
    Sound.sfx('door');
    const hand = OW.spawn({ id: 'mfh_hand', person: 'farmer', x: 4, y: 7, dir: 'up' });
    yield* OW.walk(hand, 'up', 1);
    yield* say('FARMHAND: WREN! Black coats, out in the fields! They\'ve got some kind of machine up on top of the windmill!');
    yield* say('FARMHAND: And they\'re bending the lightning rods! All three of them, pointed straight at the mill!');
    yield* say('WREN: Without the rods, every bolt will hit the windmill... and the MILLSTONE!');
    yield* say('WREN: They\'re going to tear its song out with lightning. It\'s THANE. SAHRA said he rides storms.');
    if (wren) OW.faceTowards(wren, p);
    yield* say('WREN: {PLAYER}, I need your help. There are three rods: one by the windmill, one in the east wheat field, and one in Grandpa\'s garden.');
    yield* say('WREN: Bend them back upright and the lightning goes to ground instead of the mill. Then we go up the windmill together!');
    yield* say('WREN: I\'ll keep the turbines in the barn running. They\'re the only power the farm has left. Go!');
    yield* say('OLLIE: Be careful out there, young one. Storms like this don\'t come from the sky.');
    for (const i of [1, 2, 3]) State.setFlag(`rod${i}_bent`);
    yield* this.leave(hand, 4, 7);
    if (wren) yield* this.leave(wren, 4, 7);
  },

  // -- The storm night: three bent rods -------------------------------------------------------
  *wrenStorm() {
    const n = [1, 2, 3].filter((i) => State.flag(`rod${i}_fixed`)).length;
    yield* say(`WREN: The barn's holding! That's ${n} of 3 rods fixed. Keep going!`);
    yield* say('WREN: One by the windmill, one in the east field, one in Grandpa\'s garden. Watch out for the black coats!');
  },

  *rodFix(npc) {
    const i = npc.def.rod;
    const grunt = OW.npc(`mf_grunt${i}`);
    if (grunt && !State.flag(`beat_mfgrunt${i}`)) {
      yield* say('GRUNT: Hey! Get away from that rod!');
      yield* this.trainerSpotted(grunt);
      if (!State.flag(`beat_mfgrunt${i}`)) return;
    }
    yield* say('The lightning rod has been wrenched sideways and clamped to point at the windmill. The clamp crackles with violet sparks.');
    if (!(yield* Dialog.yesNo('Bend the rod back upright?'))) return;
    Dialog.close();
    Sound.sfx('zap');
    Game.shake = 6;
    yield* say('{PLAYER} tore off the clamp and heaved the rod upright!');
    State.setFlag(`rod${i}_fixed`);
    State.setFlag(`rod${i}_bent`, false);
    OW.despawn(npc);
    this.spawnDef(`mf_rod${i}ok`);
    yield 20;
    Sound.sfx('rumble');
    OW.flashT = 14;
    Game.shake = 12;
    yield* say('KRA-KOOM! Lightning strikes the rod and runs harmlessly into the ground!');
    const left = [1, 2, 3].filter((k) => !State.flag(`rod${k}_fixed`)).length;
    if (left) {
      yield* say(left === 1 ? 'One more rod to go!' : 'Two more rods to go!');
      return;
    }
    State.setFlag('rods_fixed');
    const stormWren = OW.npc('mf_wren_storm');
    if (stormWren) OW.despawn(stormWren);
    const wren = yield* this.arrive({ id: 'wren_rods', person: 'wren' }, OW.player);
    yield* say('WREN: That\'s all three! Every bolt\'s going to ground now!');
    yield* say('WREN: But THANE\'s machine is still on top of the windmill, pulling the storm in. With the rods up, it\'s safe to go inside.');
    yield* say('WREN: I\'ll guard the door so nobody sneaks up behind you. Go get him, {PLAYER}!');
    yield* this.leave(wren, 27, 9);
  },

  *rodLook() {
    if (State.flag('tempest_done')) {
      yield* say('A tall copper lightning rod. It caught a lot of lightning last night.');
    } else if (State.flag('tempest_on')) {
      yield* say('The lightning rod stands tall. Bolts crash into it and vanish into the ground.');
    } else {
      yield* say('A tall copper lightning rod. WREN checks every one of them before a storm.');
    }
  },

  *millDoor() {
    if (State.flag('tempest_on')) {
      yield* say('Lightning keeps striking the windmill! It\'s too dangerous to go in while the rods point at it.\fFix all three lightning rods first!');
    } else {
      yield* say('The windmill door is bolted. A sign reads:\n"MILL CLOSED. PLEASE DON\'T TOUCH THE STONE! -WREN"');
    }
  },

  *barnDoor() {
    if (State.flag('tempest_on')) {
      yield* say('The barn doors are barred from the inside. Turbines whir behind them. WREN is keeping the power on!');
    } else {
      yield* say('The GYM doors are shut. A chalkboard reads:\n"CLOSED TODAY. CHECKING THE RODS! -WREN"');
    }
  },

  *millstoneInspect() {
    if (State.flag('tempest_on') && !State.flag('tempest_done')) {
      yield* say('The MILLSTONE hums so loudly the floorboards shake. Something upstairs is pulling at it.');
      return;
    }
    yield* say('The MILLSTONE. A great round stone, worn smooth by centuries of grinding.\fA faint, deep hum rises from it, like a single held note.');
  },

  // -- WINDMILL TOP: THANE and the TEMPEST ARRAY -------------------------------------------------
  *thaneWindmill() {
    if (State.flag('beat_thane2') || OW.busy > 1) return;
    const p = OW.player;
    const thane = OW.npc('mill_thane');
    if (!thane) return;
    Sound.sfx('zap');
    Game.shake = 8;
    yield* say('Wind and rain roar through the open shutters. A tangle of coils crackles on the floor, spitting lightning into the clouds.');
    thane.dir = 'down';
    thane.emote = 30;
    Sound.sfx('exclaim');
    yield 30;
    yield* say('THANE: YOU. The kid from the lighthouse!');
    yield* say('THANE: Do you know how long it took to charge this TEMPEST ARRAY? Three days! And you go and fix the RODS?!');
    yield* say('THANE: Doesn\'t matter! There\'s enough charge left for one good bolt. One bolt, straight down into the MILLSTONE, and its song rips right out!');
    yield* say('THANE: Last time you rained on my parade. This time, I AM the rain!');
    yield* OW.approach(thane, p);
    const res = yield* this.battle({ trainer: 'thane2' });
    if (res !== 'win') return;
    State.setFlag('beat_thane2');
    yield* say('THANE: No... no, no, NO!');
    // The storm fizzles out.
    Sound.sfx('zap');
    Game.shake = 16;
    yield* Game.fadeOut(4, '#ffffff');
    State.setFlag('tempest_done');
    Sound.playMusic('farm');
    yield* Game.fadeIn(24);
    yield* say('The TEMPEST ARRAY sparks, sputters... and goes dark.');
    yield* say('Outside, the thunder rolls away. The rain softens to a drizzle, and then to nothing at all.');
    yield* say('Through the shutters, stars come out over the fields.');
    yield* say('THANE: The MILLSTONE... not one note. Not ONE.');
    // A GRAYHAVEN guard and a farmhand come up the stairs.
    const guard = yield* this.arrive({ id: 'mill_guard', person: 'guard' }, thane);
    yield* say('GUARD: ADMIN THANE of TEAM DISTORTION! HOLT sent me from GRAYHAVEN the moment SAHRA\'s letter arrived.');
    yield* say('GUARD: You\'re under arrest for trespassing, vandalism, and making weather without a license.');
    const hand = yield* this.arrive({ id: 'mill_hand', person: 'farmer' }, thane);
    yield* say('FARMHAND: And for scaring the MOOZLE!');
    OW.faceTowards(thane, p);
    yield* say('THANE: Heh. Lock me up. Go on.');
    yield* say('THANE: You think you\'ve won something, kid? You think the COMMANDER loses to kids?');
    yield* say('THANE: He\'s lost ONE battle in his life. At the LEAGUE.');
    yield* Game.fadeOut(16);
    OW.despawn(thane);
    OW.despawn(guard);
    OW.despawn(hand);
    yield* Game.fadeIn(16);
    yield* say('The guard marched THANE down the stairs, with the farmhand close behind.');
    const wren = yield* this.arrive({ id: 'mill_wren', person: 'wren' }, p);
    yield* say('WREN: {PLAYER}! The storm\'s gone! You did it!');
    yield* say('WREN: Grandpa\'s out in the yard, dancing with the MOOZLE. I\'m not even kidding.');
    yield* say('WREN: The MILLSTONE\'s safe. Not one note recorded. SAHRA\'s going to flip.');
    yield* say('WREN: Get some sleep, okay? Tomorrow morning, come to the barn.');
    yield* say('WREN: You\'ve earned a real GYM battle. And I\'ve earned the chance to beat you in one!');
    OW.despawn(wren);
    // The next morning, at the farmhouse.
    yield* Game.fadeOut(40);
    State.healParty();
    OW.loadMap('mf_house', 8, 6, 'left');
    yield* Game.fadeIn(40);
    yield* say('The next morning...');
    Sound.jingle('heal');
    yield* say('{PLAYER} slept like a log in the farmhouse. The team is fully rested!');
  },

  // -- MEADOWFIELD GYM: WREN (GYM 6) -------------------------------------------------------------
  *wrenGym() {
    if (State.flag('badge_spark')) {
      if (!State.count('hm02')) {
        yield* say('WREN: Oh! I almost forgot. I meant to give you this with your BADGE.');
        yield* this.giveFly();
        return;
      }
      yield* say('WREN: That SPARK BADGE looks good on you! All charged up.');
      yield* say('WREN: Tell CANTOR I said hi. He used to come to the farm every harvest just to hear the mill hum.');
      return;
    }
    yield* say('WREN: Morning! Welcome to my barn. I built every turbine in here myself. The VOLTIMP do the running.');
    yield* say('WREN: Last night you fought for my farm. Today, you fight ME. That\'s how it works, right?');
    yield* say('WREN: ELECTRIC types are all speed and power. Let\'s see if you can keep up!');
    const res = yield* this.battle({ trainer: 'wren' });
    if (res !== 'win') return;
    State.setFlag('beat_wren');
    yield* say('WREN: Whew! That was electric! ...Sorry. I had to.');
    yield* say('WREN: This is the SPARK BADGE. There\'s a sliver of the MILLSTONE inside, the one song TEAM DISTORTION never got to hear.');
    yield* this.awardBadge(5, 'WREN');
    yield* say('WREN: And this! TM06 THUNDERBOLT. My favorite move in the whole world.');
    yield* this.receive('tm06', 1);
    yield* say('WREN: Oh, and one more thing. You\'ve got a lot of ground left to cover.');
    yield* this.giveFly();
    yield* say('WREN: Six BADGES... SAHRA says the seventh WARDEN is CANTOR, up in STONEPEAK WOODS. He\'s the oldest of all of us.');
    yield* say('WREN: STONEPEAK is north of ARCHFORD, up ROUTE 11. The road\'s been snowed in, but I called the ARCHFORD road crew this morning. They owe me a favor.');
    yield* say('WREN: CANTOR keeps the great bell in the old tower. SAHRA thinks the bell\'s clapper is a KEYSTONE. The BELLSTONE.');
    yield* say('WREN: If TEAM DISTORTION couldn\'t get my MILLSTONE, they\'ll go after his bell next. Hurry, {PLAYER}!');
  },

  // HM02 FLY, the SPARK BADGE's reward for going the distance.
  *giveFly() {
    yield* this.receive('hm02', 1);
    yield* say('WREN: HM02 FLY! Teach it to a FLYING AIMON from your BAG.');
    yield* say('WREN: Then, whenever you\'re outside, pick FLY from your AIMON menu, choose a town on the map, and off you go!');
    yield* say('WREN: It only goes to towns you\'ve already been to, though. AIMON are clever, but they\'re not psychic.');
  },

  *gymGuideWren() {
    if (State.flag('badge_spark')) {
      yield* say('The SPARK BADGE! You powered right through, champ!');
      return;
    }
    yield* say('Hey, champ-in-the-making! This barn\'s wired to the rafters. The gates run on VOLTIMP power!');
    yield* say('Step on a switch plate and every gate flips: the BLUE ones switch off and the ORANGE ones switch on, or the other way round.');
    yield* say('The bolt on each plate shows which colour is live right now. Plan your route before you step!');
    yield* say('WREN\'s ELECTRIC types hit hard and fast.');
    yield* say('GROUND types shrug off ELECTRIC moves. But watch out for her ZEPHYRON: it flies, so GROUND moves can\'t touch it!');
  },

  // -- Interlude: MORROW and the CONDUCTOR -----------------------------------------------------
  *epilogue5() {
    State.setFlag('epilogue5_seen');
    yield* Game.fadeOut(40);
    Sound.playMusic('cave');
    const conductor = TrainerArt.admin({ hair: '#d8d8e0', hairStyle: 'swept', coat: '#141418', trim: '#d0b060', wide: true });
    const scene = { opaque: true };
    const figs = [
      [Pix.silhouette(TrainerArt.get('morrow'), '#0a1012'), Pix.silhouette(TrainerArt.get('morrow'), '#e0b048'), 44, 44],
      [Pix.silhouette(conductor, '#0a0806'), Pix.silhouette(conductor, '#d0b060'), 132, 34],
    ];
    scene.draw = (g) => {
      g.fillStyle = '#05030a';
      g.fillRect(0, 0, SCREEN_W, SCREEN_H);
      const pulse = 0.3 + 0.2 * Math.sin(Game.frame / 20);
      // Five KEYSTONE lights, and a sixth that stays dark.
      for (const [x, col] of [[30, '#b070f8'], [66, '#78e060'], [102, '#58a0f0'], [138, '#f0b040'], [174, '#f8d870']]) {
        g.globalAlpha = pulse;
        Pix.ellipse(g, x, 16, 9, 5, col);
      }
      g.globalAlpha = 0.6;
      g.strokeStyle = '#484050';
      g.beginPath();
      g.ellipse(210, 16, 8, 4, 0, 0, Math.PI * 2);
      g.stroke();
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
    yield* say('MORROW: THANE has been arrested, CONDUCTOR. The farmers handed him to a GRAYHAVEN guard like a sack of wheat.', DARK);
    yield* say('MORROW: The storm failed. The MILLSTONE is lost to us.', DARK);
    yield* say('???: Nothing is lost, MORROW.', DARK);
    yield* say('???: The child carries a copy now.', DARK);
    yield* say('???: Six BADGES. Six slivers. Every stone that child wins sings for us, in one little case.', DARK);
    yield* say('MORROW: ...And the BELLSTONE?', DARK);
    yield* say('???: Go to STONEPEAK. Ring the bell at the hour of silence.', DARK);
    yield* say('???: I know that tower well, MORROW. I learned to listen there, a long time ago.', DARK);
    yield* Game.fadeOut(40);
    Game.remove(scene);
    Sound.playMusic(OW.music());
    yield* Game.fadeIn(30);
  },

  // -- ROUTE 11 -----------------------------------------------------------------------------------
  *umbraTracks() {
    yield* say('Huge paw prints in the snow, as big as dinner plates. They wander off into the pines.\fUMBRAFANG tracks. They look fresh.');
  },

  *hotCocoaGift() {
    if (State.flag('got_revive_sp')) {
      yield* say('HIKER: Stay warm out there, and stay on the road!');
      return;
    }
    yield* say('HIKER: You came up ROUTE 11 in this weather? Brave. Or silly. Here, I never climb without a couple of these.');
    yield* this.receive('revive', 2);
    State.setFlag('got_revive_sp');
    yield* say('HIKER: Up in the snow, one bad slip and your whole team\'s down. Better safe than frozen!');
  },

  // -- STONEPEAK WOODS -------------------------------------------------------------------------------
  *stonepeakArrive() {
    State.setFlag('sp_arrived');
    yield* say('Snow falls softly over STONEPEAK WOODS. Above the rooftops, an old stone tower holds a great bronze bell.');
    for (let i = 0; i < 3; i++) {
      Sound.sfx('bell');
      yield 50;
    }
    yield* say('BONG... BONG... BONG...');
    yield* say('The bell\'s voice rolls down the mountain and fades into the snow.');
    const kid = yield* this.arrive({ id: 'sp_kid_arrive', person: 'boy' }, OW.player, 'north');
    yield* say('BOY: That\'s MASTER CANTOR ringing the hour! He rings the bell every hour, day and night.');
    yield* say('BOY: Except one. At the hour of silence, the bell must never ring. That\'s the oldest rule in STONEPEAK!');
    yield* say('BOY: MASTER CANTOR\'s the GYM LEADER too. He\'s usually by the bell tower. He\'s super old. Like, a hundred.');
    yield* this.leave(kid, 20, 19);
  },

  *towerDoor() {
    yield* say('The heavy tower door is locked. A small brass plate reads:\n"THE BELL OF STONEPEAK. KEEPER: CANTOR."');
  },

  *hallDoor() {
    if (State.flag('bell_wrong')) {
      yield* say('The CHIME HALL doors are locked. CANTOR must still be at the tower.');
      return;
    }
    yield* say('The CHIME HALL doors are locked. A note is pinned to them:\n"At the tower. -CANTOR"');
  },

  // CANTOR's story, and then the bell rings at the wrong hour.
  *cantorStory(npc) {
    if (State.flag('bell_wrong')) return;
    const p = OW.player;
    OW.faceTowards(npc, p);
    yield* say('???: Hm? A visitor, in this snow?');
    yield* say('CANTOR: I am CANTOR, keeper of the bell and WARDEN of STONEPEAK.');
    yield* say('CANTOR: And you are... ah. Six BADGES. WREN\'s letter said you would come. And SAHRA\'s. And HOLT\'s. I have never received so much mail.');
    yield* say('CANTOR: They all say the same things. TEAM DISTORTION. The KEYSTONES. The RIFT. And a man they call the CONDUCTOR.');
    yield* say('CANTOR: ...Stay with an old man a moment, child. There is something I have never told anyone.');
    yield* say('CANTOR: Long ago, I taught music. Children came from all over VALEMORA to learn the bells, the strings, the voice.');
    yield* say('CANTOR: My brightest pupil was a quiet boy who played the cello. His partner was a SONARION named ECHO.');
    yield* say('CANTOR: When the boy played, ECHO sang with him. I have never heard anything so beautiful, before or since.');
    yield* say('CANTOR: The boy\'s name was AUGUST VALE.');
    yield* say('CANTOR: One winter, ECHO fell ill. It grew quieter, and quieter... and then it fell silent, and it did not wake.');
    yield* say('CANTOR: AUGUST could not bear it. He buried himself in my oldest books, the ones about the RIFT.');
    yield* say('CANTOR: The legends say that where the RIFT opened, every voice fell silent. AUGUST read it the other way around.');
    yield* say('CANTOR: He came to believe that every silenced voice still sings, somewhere beyond the RIFT. ECHO too.');
    yield* say('CANTOR: The day he left, he told me he would build the greatest instrument the world had ever seen.');
    yield* say('CANTOR: Years later, a man named AUGUST VALE founded a company called SONANCE ENERGY.');
    yield* say('CANTOR: ...For a long time now, I have feared that this CONDUCTOR is my student.');
    yield* say('CANTOR: And if he is, then he knows this tower. He knows its one rule.');
    yield* say('CANTOR: At the hour of silence, no bell in VALEMORA rings. If this bell rang then, the BELLSTONE would sing alone. Clear as glass. Easy to record.');
    yield* say('CANTOR: The hour of silence is... why, it is almost upon us.');
    // BONG.
    Sound.sfx('bell');
    Game.shake = 6;
    yield 50;
    npc.emote = 30;
    Sound.sfx('exclaim');
    yield 30;
    yield* say('BONG...');
    yield* say('CANTOR: The bell! At the hour of silence?! That was not my hand on the rope!');
    Sound.sfx('bell');
    yield 50;
    yield* say('CANTOR: Someone is in the tower. Quickly, child! I have unlocked the door. I will follow as fast as these old legs allow!');
    Sound.sfx('door');
    State.setFlag('bell_wrong');
    OW.despawn(npc);
    this.spawnDef('sp_cantor2');
  },

  *cantorWait() {
    yield* say('CANTOR: Go, child! Up the stairs! The belfry is at the very top!');
  },

  *bellInspect() {
    yield* say('The great bell of STONEPEAK, its bronze green with age. Deep inside hangs the clapper: a smooth grey stone, humming faintly.\fThe BELLSTONE.');
  },

  // -- The belfry: MORROW at the wrong hour -----------------------------------------------------
  *morrowBell() {
    if (State.flag('beat_morrow2') || OW.busy > 1) return;
    const p = OW.player;
    const morrow = OW.npc('tw_morrow');
    if (!morrow) return;
    Sound.sfx('bell');
    Game.shake = 4;
    yield* say('BONG...');
    yield* say('A man in a dark coat stands beneath the great bell. A small machine hums in one hand, and a tiny hourglass turns in the other.');
    morrow.dir = 'down';
    morrow.emote = 30;
    Sound.sfx('exclaim');
    yield 30;
    yield* say('MORROW: Tick, tock. And here you are again, child. Right on time. You always are.');
    yield* say('MORROW: The hour of silence. Every other bell in VALEMORA is still. The BELLSTONE sings alone... and I am listening.');
    yield* say('MORROW: Has CANTOR told you his little story yet? The boy with the cello? He tells it to no one. And yet, here you are.');
    yield* say('MORROW: No matter. Shall we pass the time?');
    yield* OW.approach(morrow, p);
    const res = yield* this.battle({ trainer: 'morrow2' });
    if (res !== 'win') return;
    State.setFlag('beat_morrow2');
    yield* say('MORROW: ...Hm. Never early, never late. You do keep good time, child.');
    yield* say('MORROW: A pity for CANTOR, then.');
    yield* say('MORROW: The bell rang anyway. I only needed one note.');
    // MORROW slips away through his private warp pad.
    yield* OW.walkTo(morrow, 9, 2);
    Sound.sfx('pad');
    yield* BattleFX.tween(20, () => { morrow.hidden = !morrow.hidden; });
    OW.despawn(morrow);
    yield* say('MORROW stepped onto a warp pad and vanished! Its light flickered and went dark.');
    // CANTOR arrives, out of breath.
    const cantor = yield* this.arrive({ id: 'cantor_top', person: 'cantor' }, p);
    yield* say('CANTOR: Child... are you hurt? I heard the battle all the way... from the stairs... Oh, my knees.');
    yield* say('{PLAYER} told CANTOR what happened.');
    yield* say('CANTOR: One note. He took one note.');
    yield* say('CANTOR: The BELLSTONE\'s song is long, child. One note is a key with only one tooth.');
    yield* say('CANTOR: But one tooth may be enough... if they can find the rest of the song somewhere else.');
    yield* say('CANTOR: ...Or in someone else.');
    yield* say('CANTOR: Enough. You chased a thief up two hundred stairs for an old man\'s bell. You deserve a proper welcome.');
    yield* say('CANTOR: Come down to the CHIME HALL when you are ready. It is time I heard what you are made of.');
    State.setFlag('tower_cleared');
    OW.despawn(cantor);
    Sound.sfx('door');
  },

  // -- CHIME HALL: CANTOR (GYM 7) -----------------------------------------------------------------
  *cantorGym() {
    if (State.flag('badge_chord')) {
      yield* say('CANTOR: Seven slivers, child. Seven notes of the old chord, in one small case.');
      yield* say('CANTOR: Guard them. If the CONDUCTOR needs the rest of the song, he will not have to steal it from a stone.\fHe will only have to take it from you.');
      return;
    }
    yield* say('CANTOR: Welcome to the CHIME HALL. Every bell here was cast in STONEPEAK, and every one sings a different note.');
    yield* say('CANTOR: SOUND is the oldest power in VALEMORA, child. Older than fire. Older than stone. The world was sung before it was built.');
    yield* say('CANTOR: Now. Let us hear if your song is true!');
    const res = yield* this.battle({ trainer: 'cantor' });
    if (res !== 'win') return;
    State.setFlag('beat_cantor');
    yield* say('CANTOR: Bravo! BRAVO! This hall has not rung like that in fifty years.');
    yield* say('CANTOR: Take the CHORD BADGE. A sliver of the BELLSTONE sleeps inside it.');
    yield* this.awardBadge(6, 'CANTOR');
    yield* say('CANTOR: And this. TM07 HYPER VOICE. Use it loudly. The world is far too quiet these days.');
    yield* this.receive('tm07', 1);
    yield* say('CANTOR: Seven BADGES. Seven notes of the old chord, in one little case. Keep it close, child. Closer than ever.');
    yield* say('CANTOR: If the CONDUCTOR needs the rest of the song, he will not have to steal it from a stone.');
    yield* say('CANTOR: He will only have to take it from you.');
  },

  *gymGuideCantor() {
    if (State.flag('badge_chord')) {
      yield* say('The CHORD BADGE! MASTER CANTOR hasn\'t smiled like that in years, champ!');
      return;
    }
    yield* say('Hey, champ-in-the-making! Listen to that: every bell plate in this hall rings a different note. Beautiful, right?');
    yield* say('The chime doors only open for the right tune. Read the plaque beside each door, then ring the plates in that order.');
    yield* say('Ring a wrong note and you start the tune again. No pressure!');
    yield* say('SOUND moves hit hard, but some of the MASTER\'s AIMON are SOUNDPROOF. Bring a mix of moves!');
  },

  // -- The challenge: a letter signed "R." -----------------------------------------------------
  *theLetter() {
    State.setFlag('letter_read');
    const p = OW.player;
    yield* say('Footsteps crunch through the snow, fast...');
    const grunt = yield* this.arrive({ id: 'letter_grunt', person: 'grunt' }, p, 'south');
    yield* say('GRUNT: You. You\'re the kid, right? Six BADGES, seven, whatever.');
    yield* say('GRUNT: Delivery. For "the child and the boy." Don\'t ask me what it means. I just carry the mail.');
    Sound.sfx('confirm');
    yield* say('{PLAYER} received a letter sealed with black wax!');
    yield* say('GRUNT: Right. I was never here.');
    yield* this.leave(grunt, 17, 29);
    const kai = yield* this.arrive({ id: 'kai_sp', person: 'rival' }, p, 'south');
    yield* say('KAI: {PLAYER}! I heard the bell rang at the wrong hour, so I ran the whole way up here! Was that a GRUNT?!');
    yield* say('KAI: What did he give you? A letter?');
    yield* say('{PLAYER} broke the seal. Inside is a single line, in sharp, slanted handwriting:');
    yield* say('"EMBERPEAK. Tomorrow at dusk. Bring him.\n(R.)"');
    yield* say('KAI: ...Let me see that.');
    yield 40;
    yield* say('KAI went pale.');
    yield* say('KAI: ...I know that handwriting.');
    yield* say('KAI: ...');
    yield* say('KAI: It\'s nothing. Forget I said that.');
    yield* say('KAI: EMBERPEAK is the volcano south of WILLOWBROOK. Tomorrow at dusk. "Bring him." I guess that means me.');
    yield* say('KAI: So we\'re going. Both of us. Right?');
    // TO BE CONTINUED.
    yield* Game.fadeOut(40);
    Sound.playMusic('cave');
    const scene = { opaque: true };
    scene.draw = (g) => {
      g.fillStyle = '#0a0406';
      g.fillRect(0, 0, SCREEN_W, SCREEN_H);
      const pulse = 0.5 + 0.3 * Math.sin(Game.frame / 16);
      // EMBERPEAK against a smoldering sky.
      g.globalAlpha = 0.35 * pulse;
      Pix.ellipse(g, 120, 44, 70, 22, '#c83818');
      g.globalAlpha = 1;
      g.fillStyle = '#160a0a';
      for (let y = 36; y < 112; y++) {
        const half = 10 + Math.round((y - 36) * 1.3);
        g.fillRect(120 - half, y, half * 2, 1);
      }
      g.globalAlpha = pulse;
      g.fillStyle = '#f07028';
      g.fillRect(113, 36, 14, 2);
      g.fillStyle = '#f8b040';
      g.fillRect(117, 35, 6, 1);
      g.globalAlpha = 1;
    };
    Game.push(scene);
    yield* Game.fadeIn(40);
    yield* say('Far to the south, under a sky the color of embers, a volcano smolders.', DARK);
    yield* say('And somewhere inside it, someone is waiting.', DARK);
    yield* say('TO BE CONTINUED...', DARK);
    yield* Game.fadeOut(40);
    Game.remove(scene);
    OW.despawn(kai);
    Sound.playMusic(OW.music());
    yield* Game.fadeIn(30);
  },
});

Events.kaiRoute12.when = () => State.flag('badge_dune') && !State.flag('beat_rival4');
Events.mfArrive.when = () => !State.flag('mf_arrived');
Events.farmSupper.when = () => State.flag('mf_arrived') && !State.flag('tempest_on');
Events.thaneWindmill.when = () => State.flag('tempest_on') && !State.flag('beat_thane2');
Events.epilogue5.when = () => State.flag('badge_spark') && !State.flag('epilogue5_seen');
Events.stonepeakArrive.when = () => !State.flag('sp_arrived');
Events.morrowBell.when = () => State.flag('bell_wrong') && !State.flag('beat_morrow2');
Events.theLetter.when = () => State.flag('badge_chord') && !State.flag('letter_read');
