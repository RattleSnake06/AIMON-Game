'use strict';
// AIMONDEX, trainer card and options.

const Dex = {
  *open() {
    const s = { opaque: true, done: false };
    let pick = null;
    s.update = () => {};
    s.draw = (g) => {
      UI.stripes(g, '#c83838', '#b83030');
      g.fillStyle = '#801818';
      g.fillRect(0, 0, 240, 18);
      Font.draw(g, 'AIMONDEX', 8, 5, '#f8f8f8', '#401010');
      Font.drawRight(g, `SEEN ${State.seenCount()}  OWN ${State.caughtCount()}`, 232, 5, '#f8f8f8', '#401010');
    };
    Game.push(s);
    let index = 0;
    for (;;) {
      const items = DEX_ORDER.map((id) => {
        const sp = SPECIES[id];
        const seen = State.d.dex.seen[id];
        return { id, label: `No${U.pad(sp.num, 3, '0')} ${seen ? sp.name : '----------'}`, caught: State.d.dex.caught[id] };
      });
      const i = yield* Menu.choose({
        items, x: 8, y: 26, w: 224, rowH: 18, index, cancel: -1,
        drawItem: (g, it, x, y) => {
          Font.draw(g, it.label, x + 12, y, '#404048', '#d0d0c8');
          if (it.caught) g.drawImage(BattleArt.ballImg(), x, y - 2);
        },
      });
      if (i < 0) break;
      index = i;
      const id = DEX_ORDER[i];
      if (!State.d.dex.seen[id]) {
        Sound.sfx('bump');
        continue;
      }
      pick = id;
      yield* this.entry(pick);
    }
    Game.remove(s);
  },

  *entry(id) {
    const sp = SPECIES[id];
    const caught = State.d.dex.caught[id];
    const s = { opaque: true, done: false };
    Sound.cry(id);
    s.update = () => {
      if (Input.pressed('b') || Input.pressed('a')) {
        Sound.sfx('select');
        s.done = true;
      }
    };
    s.draw = (g) => {
      UI.stripes(g, '#c83838', '#b83030');
      UI.window(g, 4, 4, 232, 152);
      g.fillStyle = '#e8f0e8';
      g.fillRect(12, 12, 72, 72);
      g.drawImage(caught ? MonSprites.front(id) : MonSprites.frontWhite(id), 16, 16);
      if (!caught) {
        g.globalAlpha = 0.5;
        g.drawImage(Pix.silhouette(MonSprites.front(id), '#606070'), 16, 16);
        g.globalAlpha = 1;
      }
      const ink = ['#404048', '#d0d0c8'];
      Font.draw(g, `No${U.pad(sp.num, 3, '0')}  ${sp.name}`, 94, 16, ...ink);
      Font.draw(g, caught ? `${sp.dex.category} AIMON` : '???', 94, 32, '#5068a0', '#d0d8e8');
      sp.types.forEach((t, i) => UI.typeBadge(g, 94 + i * 42, 46, t));
      Font.draw(g, `HT ${caught ? sp.dex.height : '???'}`, 94, 64, ...ink);
      Font.draw(g, `WT ${caught ? sp.dex.weight : '???'}`, 160, 64, ...ink);
      g.fillStyle = '#c8c8d0';
      g.fillRect(12, 90, 216, 1);
      const text = caught ? sp.dex.text : 'Catch this AIMON to learn more about it.';
      Font.wrap(text, 212).slice(0, 4).forEach((l, i) => Font.draw(g, l, 14, 96 + i * 14, ...ink));
    };
    Game.push(s);
    yield () => s.done;
    Game.remove(s);
  },
};

const TrainerCard = {
  *open() {
    const s = { opaque: true, done: false };
    s.update = () => {
      if (Input.pressed('b') || Input.pressed('a')) {
        Sound.sfx('select');
        s.done = true;
      }
    };
    s.draw = (g) => {
      UI.stripes(g, '#305878', '#386888');
      g.fillStyle = '#2c3c60';
      g.fillRect(10, 14, 220, 132);
      g.fillStyle = '#f0d890';
      g.fillRect(12, 16, 216, 128);
      g.fillStyle = '#e0c070';
      g.fillRect(12, 16, 216, 20);
      const ink = ['#404048', '#e8d8a8'];
      Font.draw(g, 'TRAINER CARD', 20, 22, '#604010', '#f0e0b0');
      Font.drawRight(g, `IDNo.${U.pad(State.d.id, 5, '0')}`, 220, 22, '#604010', '#f0e0b0');
      Font.draw(g, `NAME: ${State.name}`, 22, 46, ...ink);
      Font.draw(g, `MONEY  ${UI.money(State.d.money)}`, 22, 66, ...ink);
      Font.draw(g, `AIMONDEX  ${State.flag('got_dex') ? State.caughtCount() : 0}`, 22, 86, ...ink);
      Font.draw(g, `TIME  ${U.formatTime(State.d.frames)}`, 22, 106, ...ink);
      g.drawImage(TrainerArt.get('playerFront'), 158, 60);
    };
    Game.push(s);
    yield () => s.done;
    Game.remove(s);
  },
};

const Options = {
  *open() {
    for (;;) {
      const i = yield* Menu.choose({
        items: [`SOUND: ${Sound.muted ? 'OFF' : 'ON'}`, 'CONTROLS', 'CANCEL'], anchor: 'right', y: 2, cancel: 2,
      });
      if (i === 0) {
        Sound.toggleMute();
        if (!Sound.muted) Sound.init();
      } else if (i === 1) {
        yield* say('Arrow keys or WASD: move\nZ or SPACE: A button');
        yield* say('X or ESC: B button (hold to run)\nENTER: START menu    M: sound');
      } else break;
    }
  },
};
