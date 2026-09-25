'use strict';
// The START menu in the field.

const StartMenu = {
  index: 0,

  *open() {
    for (;;) {
      const entries = [];
      if (State.flag('got_dex')) entries.push(['AIMONDEX', () => Dex.open()]);
      if (State.party.length) entries.push(['AIMON', () => this.party()]);
      entries.push(['BAG', () => Bag.open()]);
      entries.push(['MAP', () => TownMap.open()]);
      entries.push([State.name, () => TrainerCard.open()]);
      entries.push(['SAVE', () => this.save()]);
      entries.push(['OPTION', () => Options.open()]);
      entries.push(['EXIT', null]);
      const i = yield* Menu.choose({
        items: entries.map((e) => e[0]), anchor: 'right', y: 2, w: 88, cancel: entries.length - 1,
        index: Math.min(this.index, entries.length - 1), startCloses: true,
      });
      if (i < 0 || !entries[i][1]) break;
      this.index = i;
      const r = yield* entries[i][1]();
      if (OW.pendingEscape) {
        OW.pendingEscape = false;
        yield* Events.escapeRope();
        break;
      }
      if (OW.pendingFish) {
        OW.pendingFish = false;
        yield* Events.fish();
        break;
      }
      if (OW.pendingFly) {
        const fly = OW.pendingFly;
        OW.pendingFly = null;
        yield* Events.flyTo(fly.to, fly.mon);
        break;
      }
      if (r === 'close') break;
    }
  },

  *party() {
    yield* Party.open({ mode: 'field' });
  },

  *save() {
    const info = {
      draw(g) {
        UI.window(g, 2, 2, 140, 76);
        const ink = ['#404048', '#d0d0c8'];
        Font.draw(g, OW.map.def.name || 'INDOORS', 10, 10, '#5068a0', '#d0d8e8');
        Font.draw(g, `PLAYER   ${State.name}`, 10, 26, ...ink);
        Font.draw(g, `AIMONDEX ${State.flag('got_dex') ? State.caughtCount() : 0}`, 10, 40, ...ink);
        Font.draw(g, `TIME     ${U.formatTime(State.d.frames)}`, 10, 54, ...ink);
      },
    };
    Game.push(info);
    const yes = yield* Dialog.yesNo('Would you like to save the game?');
    if (yes) {
      yield* say('SAVING...\nDON\'T TURN OFF THE POWER.', { auto: 40 });
      const p = OW.player;
      const ok = State.save({ map: OW.map.id, x: p.x, y: p.y, dir: p.dir });
      if (ok) {
        Sound.sfx('save');
        yield* say('{PLAYER} saved the game.');
      } else {
        yield* say('The game could not be saved on this browser.');
      }
    }
    Game.remove(info);
    return 'close';
  },
};
