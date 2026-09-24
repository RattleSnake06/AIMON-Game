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
        items, x: 8, y: 23, w: 224, rowH: 17, visible: 7, index, cancel: -1,
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
      sp.types.forEach((t, i) => UI.typeBadge(g, 94 + i * 50, 46, t));
      Font.draw(g, `HT ${caught ? sp.dex.height : '???'}`, 94, 64, ...ink);
      Font.draw(g, `WT ${caught ? sp.dex.weight : '???'}`, 160, 64, ...ink);
      const areas = habitatOf(id);
      const areaText = areas.length ? areas.join(', ') : (id === 'voltvix' ? 'UNKNOWN' : 'TRAINERS ONLY');
      Font.draw(g, `AREA ${Font.wrap(areaText, 110)[0]}`, 94, 77, '#5068a0', '#d0d8e8');
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
      Font.draw(g, `TIME  ${U.formatTime(State.d.frames)}`, 22, 100, ...ink);
      g.drawImage(TrainerArt.get('playerFront'), 158, 44);
      g.fillStyle = '#e0c070';
      g.fillRect(12, 116, 216, 28);
      BADGES.forEach((b, i) => {
        const x = 20 + i * 26;
        if (State.d.badges[b.id]) g.drawImage(BadgeArt.icon(i), x, 118);
        else {
          g.fillStyle = '#c8a858';
          Pix.ellipse(g, x + 12, 130, 9, 9, '#c8a858');
          Pix.ellipse(g, x + 12, 130, 7, 7, '#d8b868');
        }
      });
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
        items: [`SOUND: ${Sound.muted ? 'OFF' : 'ON'}`, `TEXT: ${Dialog.speedName()}`, 'CONTROLS', 'CANCEL'], anchor: 'right', y: 2, cancel: 3,
      });
      if (i === 0) {
        Sound.toggleMute();
        if (!Sound.muted) Sound.init();
      } else if (i === 1) {
        Dialog.cycleSpeed();
      } else if (i === 2) {
        yield* say('Arrow keys or WASD: move\nZ or SPACE: A button');
        yield* say('X or ESC: B button (hold to run)\nENTER: START menu    M: sound');
      } else break;
    }
  },
};

// ---------------------------------------------------------------------------
// Badges

const BadgeArt = {
  cache: {},
  icon(i) {
    if (this.cache[i]) return this.cache[i];
    const [main, dark, hi] = BADGES[i].colors;
    const p = new Painter(24, 24);
    p.poly([[7, 1], [16, 1], [22, 7], [22, 16], [16, 22], [7, 22], [1, 16], [1, 7]],
      { fill: main, line: '#202020', shade: dark, hi: Pix.mix(main, '#ffffff', 0.4) });
    p.ellipse(11.5, 11.5, 6.5, 6.5, { fill: hi, line: '#202020', shade: Pix.shade(hi, 0.75) });
    if (i === 0) {
      // The keystone sliver.
      p.poly([[9, 8], [14, 8], [13.5, 15], [9.5, 15]], { fill: '#9058d8', line: '#281840', hi: '#c8a0f8' });
    } else {
      p.ellipse(11.5, 11.5, 2.5, 2.5, { fill: main, line: dark });
    }
    this.cache[i] = p.toCanvas();
    return this.cache[i];
  },
};

// Presenting a new badge.
const BadgeShow = {
  *run(i) {
    const s = { done: false, t: 0 };
    s.update = () => {
      s.t++;
      if (s.t > 30 && (Input.pressed('a') || Input.pressed('b'))) {
        Sound.sfx('select');
        s.done = true;
      }
    };
    s.draw = (g) => {
      g.fillStyle = 'rgba(8,8,24,0.6)';
      g.fillRect(0, 0, SCREEN_W, SCREEN_H);
      UI.window(g, 70, 20, 100, 100, 'dark');
      const k = Math.min(1, s.t / 20);
      const size = Math.round(48 * k);
      g.drawImage(BadgeArt.icon(i), 120 - size / 2, 58 - size / 2, size, size);
      const sweep = (s.t * 3) % 160;
      if (sweep < 60) {
        g.fillStyle = 'rgba(255,255,255,0.5)';
        g.fillRect(96 + sweep * 0.8, 34, 2, 48);
      }
      Font.drawCenter(g, BADGES[i].name, 120, 98, '#f8f8f8', '#485868');
    };
    Game.push(s);
    yield () => s.done;
    Game.remove(s);
  },
};

// ---------------------------------------------------------------------------
// Town map of VALEMORA

const REGION = [
  { id: 'willowbrook', name: 'WILLOWBROOK TOWN', x: 120, y: 128, kind: 'town', desc: 'A quiet town where the river begins.' },
  { id: 'route1', name: 'ROUTE 1', x: 120, y: 104, kind: 'route', desc: 'A riverside path lined with tall grass.' },
  { id: 'archford', name: 'ARCHFORD TOWN', x: 120, y: 78, kind: 'town', desc: 'The town of old stone bridges.' },
  { id: 'route2', name: 'ROUTE 2', x: 84, y: 72, kind: 'route', desc: 'A path west toward the mountains.' },
  { id: 'cave', name: 'RIFTSTONE CAVE', x: 50, y: 66, kind: 'cave', desc: 'A deep cave. Strange tremors echo inside.' },
  { id: 'route3', name: 'ROUTE 3', x: 154, y: 80, kind: 'route', desc: 'A bamboo-lined path along the river.' },
  { id: 'grayhaven', name: 'GRAYHAVEN CITY', x: 188, y: 84, kind: 'town', desc: 'The city of steadfast stone. Home of the NORMAL-type GYM.' },
  { id: 'route4', name: 'ROUTE 4', x: 206, y: 50, kind: 'closed', desc: 'Closed while the tremors are investigated.' },
];

const MAP_REGION = {
  willowbrook: 'willowbrook', home1f: 'willowbrook', home2f: 'willowbrook', rivalhouse: 'willowbrook', lab: 'willowbrook',
  route1: 'route1', archford: 'archford', centre: 'archford', mart: 'archford',
  arch_house1: 'archford', arch_house2: 'archford', arch_house3: 'archford',
  route2: 'route2', cave1: 'cave', cave2: 'cave', route3: 'route3',
  grayhaven: 'grayhaven', gym: 'grayhaven', centre_gh: 'grayhaven', mart_gh: 'grayhaven',
  gh_house1: 'grayhaven', gh_house2: 'grayhaven', gh_house3: 'grayhaven',
};

const TownMap = {
  bg: null,

  background() {
    if (this.bg) return this.bg;
    const c = Pix.canvas(SCREEN_W, SCREEN_H);
    const g = c.getContext('2d');
    g.fillStyle = '#3c70b8';
    g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    g.fillStyle = '#4c80c8';
    for (let y = 4; y < SCREEN_H; y += 8) for (let x = (y / 8) % 2 ? 0 : 6; x < SCREEN_W; x += 12) g.fillRect(x, y, 4, 1);
    // Land.
    Pix.ellipse(g, 124, 92, 104, 58, '#5c9848');
    Pix.ellipse(g, 124, 90, 100, 55, '#78b060');
    Pix.ellipse(g, 60, 60, 44, 30, '#78b060');
    Pix.ellipse(g, 196, 60, 34, 36, '#78b060');
    // Mountains in the west.
    for (const [x, y] of [[40, 58], [54, 52], [66, 60], [46, 70]]) {
      g.fillStyle = '#8a6a48';
      for (let i = 0; i < 12; i++) g.fillRect(x - i, y + i - 6, i * 2 + 1, 1);
      g.fillStyle = '#e8e0d8';
      for (let i = 0; i < 3; i++) g.fillRect(x - i, y + i - 6, i * 2 + 1, 1);
    }
    // Bamboo along route 3.
    g.fillStyle = '#3c7a30';
    for (let x = 140; x < 176; x += 5) g.fillRect(x, 88, 2, 6);
    // The river, west to east.
    g.fillStyle = '#5898e0';
    g.fillRect(34, 74, 200, 3);
    g.fillRect(118, 74, 3, 60);
    // Routes.
    const route = (a, b) => {
      g.fillStyle = '#e8d098';
      const n = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
      for (let i = 0; i <= n; i++) g.fillRect(Math.round(U.lerp(a.x, b.x, i / n)) - 1, Math.round(U.lerp(a.y, b.y, i / n)) - 1, 3, 3);
    };
    const at = (id) => REGION.find((r) => r.id === id);
    route(at('willowbrook'), at('archford'));
    route(at('archford'), at('cave'));
    route(at('archford'), at('grayhaven'));
    g.fillStyle = '#c8b080';
    for (let i = 0; i < 30; i += 4) g.fillRect(190 + i * 0.55, 80 - i, 2, 2);
    this.bg = c;
    return c;
  },

  nodeFor(mapId) {
    return REGION.findIndex((r) => r.id === (MAP_REGION[mapId] || mapId));
  },

  *open() {
    const here = Math.max(0, this.nodeFor(OW.map.id));
    const s = { opaque: true, index: here, done: false };
    s.update = () => {
      if (Input.repeat('right') || Input.repeat('down')) { s.index = (s.index + 1) % REGION.length; Sound.sfx('select'); }
      if (Input.repeat('left') || Input.repeat('up')) { s.index = (s.index + REGION.length - 1) % REGION.length; Sound.sfx('select'); }
      if (Input.pressed('b') || Input.pressed('a') || Input.pressed('start')) { Sound.sfx('select'); s.done = true; }
    };
    s.draw = (g) => {
      g.drawImage(this.background(), 0, 0);
      REGION.forEach((r, i) => {
        if (r.kind === 'town') {
          g.fillStyle = '#301818';
          g.fillRect(r.x - 5, r.y - 5, 10, 10);
          g.fillStyle = '#e05848';
          g.fillRect(r.x - 4, r.y - 4, 8, 8);
          g.fillStyle = '#f8a090';
          g.fillRect(r.x - 4, r.y - 4, 8, 2);
        } else if (r.kind === 'cave') {
          g.fillStyle = '#201818';
          for (let k = 0; k < 7; k++) g.fillRect(r.x - k, r.y - 3 + k, k * 2 + 1, 1);
        } else if (r.kind === 'closed') {
          Font.draw(g, '?', r.x - 2, r.y - 4, '#f8f8f8', '#404040');
        }
        if (i === s.index && Math.floor(Game.frame / 12) % 2) {
          g.strokeStyle = '#f8f040';
          g.strokeRect(r.x - 7.5, r.y - 7.5, 15, 15);
        }
      });
      const me = REGION[here];
      if (Math.floor(Game.frame / 16) % 2) g.drawImage(Chars.frame('player', 'down', 0), me.x - 8, me.y - 16);
      UI.window(g, 2, 2, 236, 22, 'dark');
      Font.draw(g, 'VALEMORA', 10, 9, '#b8c8f8', '#303848');
      Font.drawRight(g, REGION[s.index].name, 230, 9, '#f8f8f8', '#303848');
      UI.window(g, 2, 124, 236, 34);
      Font.wrap(REGION[s.index].desc, 220).slice(0, 2).forEach((l, i) => Font.draw(g, l, 10, 130 + i * 12, '#404048', '#d0d0c8'));
    };
    Game.push(s);
    yield () => s.done;
    Game.remove(s);
  },
};
