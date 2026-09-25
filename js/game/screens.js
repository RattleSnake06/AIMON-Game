'use strict';
// AIMONDEX, trainer card and options.

// Every species some trainer uses (the dex shows "TRAINERS ONLY" for those
// that never appear in the wild).
function trainerSpecies() {
  const out = new Set();
  for (const t of Object.values(TRAINERS)) {
    try {
      for (const [sp] of t.party()) out.add(sp);
    } catch (e) { /* a party that depends on story state */ }
  }
  return out;
}

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
    const areas = habitatOf(id);
    // Special encounters that aren't in any grass or fishing table.
    const special = { voltvix: 'UNKNOWN', voltimp: 'SEABREEZE LIGHTHOUSE', umbrafang: 'PINECREST FOREST' };
    const areaText = areas.length ? areas.join(', ') : (special[id] || (trainerSpecies().has(id) ? 'TRAINERS ONLY' : 'UNKNOWN'));
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
    const b = BADGES[i];
    const [main, dark, hi] = b.colors;
    const p = new Painter(24, 24);
    const shapes = {
      grove: [[12, 0], [19, 5], [22, 12], [18, 19], [12, 23], [6, 19], [2, 12], [5, 5]],
      tide: [[12, 0], [17, 7], [21, 13], [19, 19], [12, 23], [5, 19], [3, 13], [7, 7]],
      crag: [[12, 0], [15, 5], [19, 3], [23, 14], [18, 22], [6, 22], [1, 14], [5, 4], [9, 6]],
    };
    p.poly(shapes[b.id] || [[7, 1], [16, 1], [22, 7], [22, 16], [16, 22], [7, 22], [1, 16], [1, 7]],
      { fill: main, line: '#202020', shade: dark, hi: Pix.mix(main, '#ffffff', 0.4) });
    if (b.id === 'grove') p.line(12, 3, 12, 20, dark);
    if (b.id === 'tide') { p.line(7, 16, 10, 14, hi); p.line(10, 14, 14, 16, hi); p.line(14, 16, 17, 14, hi); }
    if (b.id === 'crag') { p.line(4, 15, 8, 18, dark); p.line(16, 19, 20, 15, dark); }
    p.ellipse(11.5, 11.5, 6.5, 6.5, { fill: hi, line: '#202020', shade: Pix.shade(hi, 0.75) });
    if (b.leader) {
      // A sliver of the leader's KEYSTONE.
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
// Town map of VALEMORA. The terrain is baked from the region painting by
// tools/make_townmap.py; roads, places and labels are drawn here.

// Places, in map pixels (the terrain image is 240x158, drawn at y = 1).
// kind: town | route | cave | spot | isle.
const REGION = [
  { id: 'willowbrook', name: 'WILLOWBROOK TOWN', x: 116, y: 84, kind: 'town', desc: 'A quiet riverside town. Your journey began here.' },
  { id: 'route1', name: 'ROUTE 1', x: 116, y: 63, kind: 'route', desc: 'A riverside path between WILLOWBROOK and ARCHFORD.' },
  { id: 'archford', name: 'ARCHFORD TOWN', x: 116, y: 48, kind: 'town', desc: 'A crossroads town of old stone bridges.' },
  { id: 'route2', name: 'ROUTE 2', x: 70, y: 38, kind: 'route', desc: 'A trail west along the river to the mountains.' },
  { id: 'cave', name: 'RIFTSTONE CAVE', x: 40, y: 37, kind: 'cave', desc: 'A deep cave in the western mountains. A KEYSTONE sleeps below.' },
  { id: 'route3', name: 'ROUTE 3', x: 153, y: 39, kind: 'route', desc: 'A bamboo-lined path along the river.' },
  { id: 'grayhaven', name: 'GRAYHAVEN CITY', x: 187, y: 35, kind: 'town', desc: 'The city of steadfast stone. Home of the NORMAL-type GYM.' },
  { id: 'route4', name: 'ROUTE 4', x: 190, y: 64, kind: 'route', desc: 'A windswept coastal road south from GRAYHAVEN.' },
  { id: 'seabreeze', name: 'SEABREEZE PORT', x: 216, y: 83, kind: 'town', desc: 'A bustling harbor with a tall lighthouse. Home of the WATER-type GYM.' },
  { id: 'route5', name: 'ROUTE 5', x: 92, y: 86, kind: 'route', desc: 'A forest road between WILLOWBROOK and CEDARWOOD.' },
  { id: 'cedarwood', name: 'CEDARWOOD VILLAGE', x: 69, y: 88, kind: 'town', desc: 'A village among giant cedars. Home of the GRASS-type GYM.' },
  { id: 'pinecrest', name: 'PINECREST FOREST', x: 80, y: 66, kind: 'spot', desc: 'Dense, dark woods. Travelers tell of violet lights among the trees.' },
  { id: 'sunspire', name: 'SUNSPIRE RUINS', x: 36, y: 71, kind: 'town', desc: 'Sun-bleached ruins of an ancient city in the western dunes.' },
  { id: 'stonepeak', name: 'STONEPEAK WOODS', x: 117, y: 29, kind: 'spot', desc: 'Snowy woods beneath the tallest peak. An old tower watches over them.' },
  { id: 'meadowfield', name: 'MEADOWFIELD FARM', x: 156, y: 54, kind: 'spot', desc: 'A sprawling farm with a windmill. Its milk is famous.' },
  { id: 'silverfall', name: 'SILVERFALL CITY', x: 171, y: 76, kind: 'town', desc: 'A city of mills and power plants around a great waterfall. SONANCE ENERGY runs the lights.' },
  { id: 'route8', name: 'ROUTE 8', x: 194, y: 79, kind: 'route', desc: 'A hilly road west from SEABREEZE PORT to SILVERFALL CITY.' },
  { id: 'bridge', name: 'SILVERFALL BRIDGE', x: 161, y: 86, kind: 'route', desc: 'A brand-new bridge over the river, south to CRAGMOOR.' },
  { id: 'cragmoor', name: 'CRAGMOOR TOWN', x: 150, y: 95, kind: 'town', desc: 'A quarry town cut into the hills. Home of the ROCK-type GYM.' },
  { id: 'bramblewood', name: 'BRAMBLEWOOD FOREST', x: 157, y: 103, kind: 'spot', desc: 'A tangled forest whose paths seem to shift.' },
  { id: 'emberpeak', name: 'EMBERPEAK VOLCANO', x: 121, y: 110, kind: 'cave', desc: 'A smoldering volcano south of WILLOWBROOK.' },
  { id: 'route7', name: 'ROUTE 7', x: 141, y: 110, kind: 'route', desc: 'A road from the volcano east to BRAMBLEWOOD.' },
  { id: 'marshland', name: 'MARSHLAND', x: 87, y: 107, kind: 'spot', desc: 'Misty wetlands where the rivers meet the sea.' },
  { id: 'route6', name: 'ROUTE 6', x: 62, y: 116, kind: 'route', desc: 'A road south from CEDARWOOD to the coast.' },
  { id: 'lighthouse', name: 'FORGOTTEN LIGHTHOUSE', x: 16, y: 108, kind: 'isle', desc: 'A lighthouse on a lonely isle. No one has lit it in years.' },
  { id: 'grove', name: 'MYSTIC GROVE', x: 58, y: 136, kind: 'isle', desc: 'An island grove said to glow on moonless nights.' },
  { id: 'shrine', name: 'SUNKEN SHRINE', x: 105, y: 141, kind: 'isle', desc: 'A shrine half-swallowed by the sea.' },
  { id: 'league', name: 'AIMON LEAGUE', x: 177, y: 138, kind: 'town', desc: 'Where the strongest trainers gather. Eight BADGES are needed to enter.' },
  { id: 'starfall', name: 'STARFALL ISLE', x: 228, y: 24, kind: 'isle', desc: 'An island where falling stars are said to land.' },
];

// Roads as polylines, and sea routes (dotted).
const REGION_ROADS = [
  [[41, 37], [67, 37], [93, 38], [107, 39], [115, 45]],
  [[116, 50], [116, 82]],
  [[124, 46], [134, 42], [148, 39], [171, 38], [184, 36]],
  [[188, 38], [189, 46], [188, 58], [189, 69], [202, 78], [213, 82]],
  [[108, 84], [99, 85], [90, 87], [80, 89], [71, 88]],
  [[66, 88], [48, 87], [37, 84], [36, 73]],
  [[78, 94], [70, 106], [62, 116], [73, 123]],
  [[124, 112], [140, 110], [155, 110], [161, 115]],
  [[128, 83], [137, 83], [155, 92], [158, 100]],
  [[213, 82], [202, 80], [188, 79], [176, 77]],
  [[169, 79], [164, 84], [157, 90], [152, 94]],
];
const REGION_SEA = [
  [[38, 97], [31, 102], [27, 106], [20, 107]],
  [[27, 106], [31, 114], [39, 131], [48, 136]],
  [[68, 138], [90, 139], [95, 132], [105, 127], [114, 135], [120, 138]],
  [[161, 115], [164, 124], [171, 131]],
];

// Map id -> REGION id (new maps can also set def.region).
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

  regionOf(mapId) {
    return MAP_REGION[mapId] || (MAPS[mapId] && MAPS[mapId].region) || null;
  },

  background() {
    if (this.bg) return this.bg;
    const c = Pix.canvas(SCREEN_W, SCREEN_H);
    const g = c.getContext('2d');
    g.fillStyle = '#3868c0';
    g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    const terrain = MonSprites.img.region_map;
    if (terrain) g.drawImage(terrain, 0, 1);
    const line = (pts, w, color) => {
      g.fillStyle = color;
      for (let k = 1; k < pts.length; k++) {
        const [ax, ay] = pts[k - 1];
        const [bx, by] = pts[k];
        const n = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1);
        for (let i = 0; i <= n; i++) {
          g.fillRect(Math.round(U.lerp(ax, bx, i / n)) - (w >> 1), Math.round(U.lerp(ay, by, i / n)) - (w >> 1), w, w);
        }
      }
    };
    for (const r of REGION_ROADS) line(r, 3, '#8a6c40');
    for (const r of REGION_ROADS) line(r, 1, '#f0d898');
    g.fillStyle = '#f8f0b0';
    for (const r of REGION_SEA) {
      for (let k = 1; k < r.length; k++) {
        const [ax, ay] = r[k - 1];
        const [bx, by] = r[k];
        const n = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1);
        for (let i = 0; i <= n; i += 3) g.fillRect(Math.round(U.lerp(ax, bx, i / n)), Math.round(U.lerp(ay, by, i / n)), 1, 1);
      }
    }
    this.bg = c;
    return c;
  },

  drawPlace(g, r, visited) {
    if (r.kind === 'town') {
      g.fillStyle = '#301818';
      g.fillRect(r.x - 4, r.y - 4, 8, 8);
      g.fillStyle = visited ? '#e84838' : '#b08078';
      g.fillRect(r.x - 3, r.y - 3, 6, 6);
      g.fillStyle = visited ? '#f8a898' : '#d0b0a8';
      g.fillRect(r.x - 3, r.y - 3, 6, 1);
    } else if (r.kind === 'cave') {
      g.fillStyle = '#201818';
      for (let k = 0; k < 5; k++) g.fillRect(r.x - k, r.y - 2 + k, k * 2 + 1, 1);
      g.fillStyle = '#d0c0a0';
      g.fillRect(r.x - 4, r.y + 3, 9, 1);
    } else if (r.kind === 'spot' || r.kind === 'isle') {
      g.fillStyle = '#302818';
      g.fillRect(r.x - 2, r.y - 2, 5, 5);
      g.fillStyle = visited ? '#f8d048' : '#c8b890';
      g.fillRect(r.x - 1, r.y - 1, 3, 3);
    }
  },

  // Nearest place in a direction from the current one.
  step(from, dir) {
    const [dx, dy] = U.dirVec[dir];
    let best = null;
    let bestScore = Infinity;
    for (const r of REGION) {
      const vx = r.x - from.x;
      const vy = r.y - from.y;
      const along = vx * dx + vy * dy;
      if (along <= 0) continue;
      const across = Math.abs(vx * dy - vy * dx);
      const score = along + across * 2.2;
      if (score < bestScore) { bestScore = score; best = r; }
    }
    return best;
  },

  *open() {
    const hereId = this.regionOf(OW.map.id);
    const here = REGION.find((r) => r.id === hereId) || REGION[0];
    const s = { opaque: true, cur: here, done: false };
    s.update = () => {
      for (const d of ['up', 'down', 'left', 'right']) {
        if (!Input.repeat(d)) continue;
        const next = this.step(s.cur, d);
        if (next) { s.cur = next; Sound.sfx('select'); }
      }
      if (Input.pressed('b') || Input.pressed('a') || Input.pressed('start')) { Sound.sfx('select'); s.done = true; }
    };
    s.draw = (g) => {
      g.drawImage(this.background(), 0, 0);
      for (const r of REGION) this.drawPlace(g, r, State.flag(`visit_${r.id}`));
      const cur = s.cur;
      if (Math.floor(Game.frame / 10) % 2) {
        g.strokeStyle = '#f8f040';
        g.lineWidth = 1;
        g.strokeRect(cur.x - 6.5, cur.y - 6.5, 13, 13);
      }
      if (Math.floor(Game.frame / 16) % 2) {
        const head = Chars.frame('player', 'down', 0);
        g.drawImage(head, 0, 0, 16, 12, here.x - 8, here.y - 15, 16, 12);
      }
      // Name bar at the top, description at the bottom (or top, if the
      // cursor is down south where the box would cover it).
      g.globalAlpha = 0.9;
      UI.window(g, 2, 2, 236, 20, 'dark');
      g.globalAlpha = 1;
      Font.draw(g, 'VALEMORA', 9, 8, '#b8c8f8', '#303848');
      Font.drawRight(g, cur.name, 231, 8, '#f8f8f8', '#303848');
      const by = cur.y > 104 ? 24 : 122;
      UI.window(g, 2, by, 236, 36);
      Font.wrap(cur.desc, 220).slice(0, 2).forEach((l, i) => Font.draw(g, l, 10, by + 7 + i * 12, '#404048', '#d0d0c8'));
    };
    Game.push(s);
    yield () => s.done;
    Game.remove(s);
  },
};
