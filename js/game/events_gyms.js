'use strict';
// The GYM puzzles: IVY's sleeping blooms, WREN's switch plates, and the tunes
// that open CANTOR's chime doors. (Currents, boulders, sinkholes and NOX's
// starry floor are handled by the overworld itself.)

// CANTOR's bell plates, lowest first: RED, BLUE, GOLD, GREEN.
const BELL_NAMES = ['RED', 'BLUE', 'GOLD', 'GREEN'];
const BELL_FREQS = [523.25, 659.25, 783.99, 1046.5];
// The tune carved beside each chime door.
const CHIME_TUNES = { 1: [0, 2, 1], 2: [3, 1, 0, 2] };

Object.assign(Events, {
  // -- IVY: wake a bloom and its vine wall withers ----------------------------------------
  *bloomTouch(npc) {
    const n = npc.def.bloom;
    yield* say('A pink bud, curled up tight and fast asleep.');
    yield* say('{PLAYER} touched the bud...');
    Sound.sfx('leaf');
    State.setFlag(`cw_bloom${n}`);
    OW.refreshNpcs();
    yield 20;
    yield* say('It opened into a golden bloom! Somewhere in the greenhouse, vines rustled and pulled away.');
    const left = [1, 2, 3].filter((k) => !State.flag(`cw_bloom${k}`)).length;
    if (left) yield* say(left === 1 ? 'One bloom is still asleep.' : `${left} blooms are still asleep.`);
  },

  // -- WREN: a switch plate flips every gate in the barn -----------------------------------
  *gymSwitch() {
    const flag = OW.map.def.switchFlag;
    State.setFlag(flag, !State.flag(flag));
    Sound.sfx('zap');
    Game.shake = 3;
    OW.refreshNpcs();
    yield 12;
  },

  // -- HM02 FLY ----------------------------------------------------------------------------
  *flyTo(id, monName) {
    const [map, x, y] = TownMap.flySpot(id);
    yield* say(`${monName} used FLY!`);
    Sound.sfx('wind');
    const p = OW.player;
    // Up and away...
    for (let i = 0; i < 16; i++) {
      p.oy = -i * 2;
      yield 1;
    }
    p.hidden = true;
    yield* Game.fadeOut(20, '#ffffff');
    p.oy = 0;
    p.hidden = false;
    OW.loadMap(map, x, y, 'down');
    yield 20;
    Sound.sfx('wind');
    yield* Game.fadeIn(20);
  },

  // -- CANTOR: bell plates and chime doors ------------------------------------------------
  *gymBell(bell, x, y) {
    Sound.chime(BELL_FREQS[bell]);
    OW.bellGlow = OW.bellGlow || {};
    OW.bellGlow[`${x},${y}`] = Game.frame + 40;
    const door = !State.flag('sp_door1') ? 1 : !State.flag('sp_door2') ? 2 : 0;
    // Each door only listens to the plates on its own side of the hall.
    if (!door || (door === 1 && y < 11) || (door === 2 && y > 11)) return;
    const tune = CHIME_TUNES[door];
    OW.bellSeq.push(bell);
    const n = OW.bellSeq.length;
    if (OW.bellSeq[n - 1] !== tune[n - 1]) {
      // A wrong note: the tune starts over (and this note may begin it again).
      OW.bellSeq = bell === tune[0] ? [bell] : [];
      yield 16;
      Sound.sfx('bump');
      return;
    }
    if (n < tune.length) return;
    OW.bellSeq = [];
    yield 30;
    for (const b of tune) {
      Sound.chime(BELL_FREQS[b]);
      yield 10;
    }
    Sound.sfx('bell');
    State.setFlag(`sp_door${door}`);
    OW.refreshNpcs();
    Game.shake = 4;
    yield* say('The tune rang out through the hall... and the chime door swung open!');
  },

  *chimePlaque(t) {
    const door = t.door || (t.def && t.def.door);
    const tune = CHIME_TUNES[door].map((b) => BELL_NAMES[b]).join(', ');
    if (State.flag(`sp_door${door}`)) {
      yield* say(`A brass plaque beside the chime door:\n"${tune}."\fThe door stands open.`);
      return;
    }
    yield* say(`A brass plaque beside the chime door. Notes are engraved on it:\n"${tune}."`);
    yield* say('The door is shut. Its little bells hang silent, waiting for a tune.');
  },
});
