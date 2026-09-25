'use strict';
// Your lead AIMON walks one step behind you in the overworld. It isn't a
// real entity: nothing bumps into it and it never blocks a path. It trails
// the tile the player just left, hides when there's no room, and says
// something about wherever you are when you talk to it.

const Follower = {
  x: 0,
  y: 0,
  dir: 'down',
  fromX: 0,
  fromY: 0,
  moveT: 0,
  moveFrames: 0,
  hidden: true,
  emote: 0,
  emoteKind: '!',
  bubbles: null,

  // The first AIMON in the party that can still walk.
  lead() {
    return State.party.find((m) => !m.fainted) || null;
  },

  enabled() {
    return !State.d.followerOff && !!this.lead() && !OW.map.def.noFollower;
  },

  // Is (x, y) somewhere it can stand?
  open(x, y) {
    if (!OW.map.inside(x, y)) return false;
    const t = Tiles.def(OW.tile(x, y));
    return !t.solid && !t.ledge && !OW.entityAt(x, y) && !OW.map.warpAt(x, y);
  },

  // Put it on the tile behind the player (or tucked in, hidden, if there's no room).
  place() {
    const p = OW.player;
    const [dx, dy] = U.dirVec[p.dir];
    const bx = p.x - dx;
    const by = p.y - dy;
    const room = this.open(bx, by);
    this.x = room ? bx : p.x;
    this.y = room ? by : p.y;
    this.fromX = this.x;
    this.fromY = this.y;
    this.dir = p.dir;
    this.moveT = 0;
    this.moveFrames = 0;
    this.hidden = !room;
  },

  // The player just left (x, y): step onto it.
  follow(x, y, frames) {
    const far = Math.abs(x - this.x) + Math.abs(y - this.y) > 1;
    this.fromX = far ? x : this.x;
    this.fromY = far ? y : this.y;
    if (x > this.x) this.dir = 'right';
    else if (x < this.x) this.dir = 'left';
    else if (y > this.y) this.dir = 'down';
    else if (y < this.y) this.dir = 'up';
    this.x = x;
    this.y = y;
    this.moveT = 0;
    this.moveFrames = far ? 0 : frames;
    this.hidden = false;
  },

  shift(dx, dy) {
    this.x += dx;
    this.y += dy;
    this.fromX += dx;
    this.fromY += dy;
  },

  update() {
    if (this.moveT < this.moveFrames) this.moveT++;
    if (this.emote) this.emote--;
    const p = OW.player;
    if (p.moving || this.moveT < this.moveFrames) return;
    const d = Math.abs(p.x - this.x) + Math.abs(p.y - this.y);
    if (d <= 1) return;
    // Two tiles behind in a straight line (after a ledge hop): one more step.
    if (d === 2 && (p.x === this.x || p.y === this.y)) {
      const mx = (p.x + this.x) / 2;
      const my = (p.y + this.y) / 2;
      if (!Tiles.def(OW.tile(mx, my)).solid) {
        this.follow(mx, my, 12);
        return;
      }
    }
    // Left behind by a cutscene or a fall: catch up.
    this.place();
  },

  visible() {
    const p = OW.player;
    if (this.hidden || p.hidden || !this.enabled()) return false;
    if (this.x === p.x && this.y === p.y) return false;
    return !OW.npcs.some((n) => n.x === this.x && n.y === this.y && !n.hidden);
  },

  // Pixel position, sliding between tiles.
  get px() {
    const t = this.moveFrames ? Math.min(1, this.moveT / this.moveFrames) : 1;
    return Math.round((this.fromX + (this.x - this.fromX) * t) * TILE);
  },
  get py() {
    const t = this.moveFrames ? Math.min(1, this.moveT / this.moveFrames) : 1;
    return Math.round((this.fromY + (this.y - this.fromY) * t) * TILE);
  },

  draw(g, cx, cy) {
    const m = this.lead();
    const img = m && MonSprites.icon(m.species);
    if (!img) return;
    const x = this.px - cx;
    const moving = this.moveT < this.moveFrames;
    const bob = moving ? (Math.floor(this.moveT / 4) % 2) : (Math.floor(Game.frame / 30) % 2);
    const y = this.py - cy + 16 - img.height + 2 - bob;
    g.drawImage(Chars.shadow, x + 1, this.py - cy + 13);
    if (this.dir === 'right') {
      g.save();
      g.translate(x + 8 + img.width / 2, 0);
      g.scale(-1, 1);
      g.drawImage(img, 0, y);
      g.restore();
    } else {
      g.drawImage(img, x + 8 - img.width / 2, y);
    }
    if (this.emote) g.drawImage(this.bubble(this.emoteKind), x + 2, y - 10);
  },

  // Small speech bubbles: surprise, music, silence and a heart.
  bubble(kind) {
    if (!this.bubbles) {
      const frame = (inner) => [
        '.oooooooooo.',
        ...inner.map((r) => `o${r}o`),
        '.ooooowwoooo',
        '.....owo....',
        '.....oo.....',
      ];
      const pal = { o: '#303038', w: '#f8f8f8', r: '#e03838', b: '#3868d0', k: '#404048' };
      this.bubbles = {
        '!': Pix.fromRows(frame(['wwwwrrwwww', 'wwwwrrwwww', 'wwwwrrwwww', 'wwwwrrwwww', 'wwwwwwwwww', 'wwwwrrwwww', 'wwwwwwwwww']), pal),
        note: Pix.fromRows(frame(['wwwwwbbbww', 'wwwwwbwbbw', 'wwwwwbwwww', 'wwwwwbwwww', 'wwwbbbwwww', 'wwwbbbwwww', 'wwwwwwwwww']), pal),
        dots: Pix.fromRows(frame(['wwwwwwwwww', 'wwwwwwwwww', 'wwwwwwwwww', 'wkwwkwwkww', 'wwwwwwwwww', 'wwwwwwwwww', 'wwwwwwwwww']), pal),
        heart: Pix.fromRows(frame(['wwwwwwwwww', 'wwrrwwrrww', 'wrrrrrrrrw', 'wrrrrrrrrw', 'wwrrrrrrww', 'wwwwrrwwww', 'wwwwwwwwww']), pal),
      };
    }
    return this.bubbles[kind] || this.bubbles['!'];
  },

  // A little reaction on arriving somewhere.
  react() {
    const m = this.lead();
    if (!m || !this.enabled()) return;
    const id = OW.map.id;
    const special = /^(shrine|halloffame|champion|grove|fl_|tower_)/.test(id);
    if (!special && Math.random() > 0.4) return;
    this.emoteKind = this.mood(m);
    this.emote = 50;
  },

  mood(m) {
    const id = OW.map.id;
    if (m.hp < m.stats.hp / 4) return 'dots';
    if (/^home|rivalhouse/.test(id)) return 'heart';
    if (/^(shrine|halloffame|champion|elite)/.test(id)) return '!';
    const w = OW.weather();
    if (w && (w.kind === 'violet' || w.kind === 'storm')) return 'dots';
    return Math.random() < 0.5 ? 'note' : 'heart';
  },

  // What it has to say about here.
  line(m) {
    const n = m.name;
    const id = OW.map.id;
    const region = TownMap.regionOf(id) || '';
    const types = SPECIES[m.species].types;
    const is = (t) => types.includes(t);
    const w = OW.weather();
    const pick = (a) => a[U.rand(a.length)];

    if (m.hp < m.stats.hp / 4) return `${n} is exhausted, but it's doing its best to keep up.`;
    if (m.status === 'slp') return `${n} keeps nodding off as it walks...`;
    if (m.status === 'par') return `${n}'s legs are twitching. It's having trouble moving.`;
    if (m.status === 'brn') return `${n} is wincing from its burn.`;

    // Places with a story.
    if (/^home[12]f$/.test(id)) return pick([`${n} is sniffing around the kitchen. It smells MOM's cooking!`, `${n} curled up by the TV like it owns the place.`]);
    if (id === 'rivalhouse') return `${n} is looking at all the plates on the table.`;
    if (id === 'lab') return `${n} is peering at the machines in PROF. LINDEN's lab. It seems to remember this place.`;
    if (id.startsWith('centre')) return `${n} is watching the NURSE with a hopeful look.`;
    if (id.startsWith('mart')) return `${n} is eyeing the shelves. It wants a snack.`;
    if (id.startsWith('gym')) return `${n} is getting fired up. It knows a battle when it sees one!`;
    if (/^shrine/.test(id)) {
      if (State.flag('shrine_done')) return `${n} is gazing at the old stones. It hums a few notes of the true song.`;
      return `${n} is trembling... but it won't leave {PLAYER}'s side.`;
    }
    if (id === 'halloffame') return `${n} is looking at the HALL OF FAME machine with pride.`;
    if (/^(elite|champion)/.test(id)) return `${n} is standing tall. It's ready for anything!`;
    if (id.startsWith('tower_')) return pick([`${n} is pacing. It wants to win one more!`, `${n} is sizing up the next challenger.`]);
    if (id.startsWith('fl_')) return pick([`${n} is watching the lighthouse beam sweep across the sea.`, `${n} is listening to the waves on the rocks.`]);
    if (id === 'grove') return `${n} is gazing at the glowing standing stones.`;
    if (id === 'bramble') return `${n} tilts its head. It hears drumming somewhere...`;
    if (region === 'starfall' || id.startsWith('obs')) return `${n} is watching the sky for falling stars.`;
    if (id.startsWith('hq')) return `${n} doesn't like this tower. It's keeping close.`;

    // The sky.
    if (w && w.kind === 'violet') return `${n} is looking up at the violet sky. It isn't making a sound.`;
    if (w && (w.kind === 'rain' || w.kind === 'storm')) {
      if (is('fire')) return `${n} hates the rain! It's hiding under {PLAYER}'s shadow.`;
      if (is('water')) return `${n} is splashing happily in the puddles.`;
      return `${n} shakes the rain off its back.`;
    }

    // The ground underfoot.
    if (OW.map.def.cave || OW.map.def.dark) {
      if (is('ghost') || is('dark')) return `${n} seems right at home in the dark.`;
      return `${n} is sticking close to {PLAYER} in the dark.`;
    }
    if (['stonepeak', 'route11'].includes(region)) {
      if (is('fire')) return `${n} is melting little puddles into the snow.`;
      if (is('ice')) return `${n} is rolling around in the snow!`;
      return `${n} is shivering. It stays close to keep warm.`;
    }
    if (['sunspire', 'route10'].includes(region)) {
      if (is('water') || is('grass')) return `${n} looks thirsty in this heat.`;
      if (is('ground') || is('rock')) return `${n} loves the warm sand under its feet!`;
      return `${n} is squinting against the desert sun.`;
    }
    if (['emberpeak', 'route7'].includes(region)) {
      if (is('fire')) return `${n} is basking in the heat of the volcano!`;
      if (is('ice') || is('grass')) return `${n} doesn't like this heat at all.`;
      return `${n} is stepping carefully around the hot rocks.`;
    }
    if (['seabreeze', 'route4', 'marshland', 'league'].includes(region)) {
      if (is('water')) return `${n} keeps looking at the sea. It wants to go for a swim!`;
      return `${n} is watching the waves roll in.`;
    }
    if (['pinecrest', 'route5', 'cedarwood', 'bramblewood', 'route6'].includes(region)) {
      if (is('grass') || is('bug')) return `${n} loves the smell of the forest!`;
      return `${n} is listening to the rustling leaves.`;
    }
    if (['meadowfield', 'route12'].includes(region)) {
      if (is('electric')) return `${n} is watching the windmill spin. Its cheeks are sparking!`;
      return `${n} is sniffing the fresh hay.`;
    }
    if (region === 'silverfall') return `${n} is staring up at the great waterfall.`;
    if (region === 'grayhaven') return `${n} is looking up at the big stone buildings.`;
    if (region === 'cragmoor') return `${n} flinches at the quarry hammers.`;

    return pick([
      `${n} is happy to be walking with {PLAYER}!`,
      `${n} is humming a little tune.`,
      `${n} sniffs the air curiously.`,
      `${n} looks up at {PLAYER} and seems very pleased.`,
      `${n} is keeping pace, step for step.`,
    ]);
  },
};

// -- hooks into the overworld ---------------------------------------------------------------
{
  const base = {
    startMove: OW.startMove,
    startJump: OW.startJump,
    loadMap: OW.loadMap,
    crossLink: OW.crossLink,
    update: OW.update,
    onMapChanged: OW.onMapChanged,
  };
  OW.startMove = function startMove(ent, dir, frames) {
    const p = this.player;
    if (ent === p) Follower.follow(p.x, p.y, frames);
    return base.startMove.call(this, ent, dir, frames);
  };
  OW.startJump = function startJump(ent) {
    if (ent === this.player) Follower.follow(ent.x, ent.y, 16);
    return base.startJump.call(this, ent);
  };
  OW.loadMap = function loadMap(...args) {
    const r = base.loadMap.apply(this, args);
    Follower.place();
    return r;
  };
  OW.crossLink = function crossLink() {
    const p = this.player;
    const [x0, y0] = [p.x, p.y];
    const r = base.crossLink.call(this);
    if (p.x !== x0 || p.y !== y0) Follower.shift(p.x - x0, p.y - y0);
    return r;
  };
  OW.update = function update() {
    Follower.update();
    return base.update.call(this);
  };
  OW.onMapChanged = function onMapChanged() {
    const r = base.onMapChanged.call(this);
    Follower.react();
    return r;
  };
}

Object.assign(Events, {
  *followerTalk() {
    const m = Follower.lead();
    if (!m) return;
    const p = OW.player;
    if (p.x < Follower.x) Follower.dir = 'left';
    else if (p.x > Follower.x) Follower.dir = 'right';
    Sound.cry(m.species);
    Follower.emoteKind = Follower.mood(m);
    Follower.emote = 40;
    yield 20;
    yield* say(Follower.line(m));
  },
});
