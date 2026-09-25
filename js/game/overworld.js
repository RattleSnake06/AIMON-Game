'use strict';
// The walking-around part of the game.

const WALK_FRAMES = 16;   // frames per tile when walking
const RUN_FRAMES = 8;     // ...and when running

// ---------------------------------------------------------------------------
// Map instances and the links between them.

const World = {
  maps: {},

  init() {
    // Door warps are derived from buildings: outdoor door <-> interior mat.
    for (const [id, def] of Object.entries(MAPS)) {
      def.warps = def.warps || [];
      for (const b of def.buildings || []) {
        if (!b.to) continue;
        const spec = BUILDINGS[b.type];
        const dx = b.x + spec.door;
        const dy = b.y + spec.h - 1;
        const inner = MAPS[b.to];
        let mx = 0;
        let my = 0;
        inner.rows.forEach((row, y) => {
          const i = row.search(/[Me]/);
          if (i >= 0) { mx = i; my = y; }
        });
        def.warps.push({ x: dx, y: dy, to: b.to, tx: mx, ty: my, dir: 'up', kind: 'door', lock: b.lock });
        inner.warps = inner.warps || [];
        inner.warps.push({ x: mx, y: my, to: id, tx: dx, ty: dy, dir: 'down', kind: 'mat' });
      }
    }
  },

  get(id) {
    if (!this.maps[id]) this.maps[id] = new GameMap(id);
    return this.maps[id];
  },
};

class GameMap {
  constructor(id) {
    this.id = id;
    this.def = MAPS[id];
    this.rows = this.def.rows;
    this.w = this.rows[0].length;
    this.h = this.rows.length;
    this.floor = this.def.floor;
    this.buildings = this.def.buildings || [];
    this.border = this.def.border || 'x';
    this.rendered = null;
  }

  inside(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }

  // Change one tile for this visit (a filled pit, say). resetTiles() undoes it.
  setTile(x, y, ch) {
    if (this.rows === this.def.rows) this.rows = this.def.rows.slice();
    const r = this.rows[y];
    this.rows[y] = r.slice(0, x) + ch + r.slice(x + 1);
    this.rendered = null;
  }

  resetTiles() {
    if (this.rows === this.def.rows) return;
    this.rows = this.def.rows;
    this.rendered = null;
  }

  tileAt(x, y) {
    if (!this.inside(x, y)) return this.border;
    return this.rows[y][x];
  }

  // Like tileAt, but looks into connected maps past the edges (so rivers
  // and paths auto-tile seamlessly across a map join).
  worldTileAt(x, y) {
    if (this.inside(x, y)) return this.rows[y][x];
    for (const l of this.links()) {
      const lx = x - l.ox;
      const ly = y - l.oy;
      if (l.map.inside(lx, ly)) return l.map.rows[ly][lx];
    }
    return this.border;
  }

  render() {
    // Buildings can appear or change with story flags (e.g. the great cedar
    // recovering); re-render when any of those flags change.
    const key = this.buildings.map((b) => (b.showIf || b.hideIf ? +this.showBuilding(b) : '')).join('');
    if (!this.rendered || key !== this.renderKey) {
      this.rendered = Tiles.renderMap(this);
      this.renderKey = key;
    }
    return this.rendered;
  }

  showBuilding(b) {
    if (b.showIf && !State.flag(b.showIf)) return false;
    if (b.hideIf && State.flag(b.hideIf)) return false;
    return true;
  }

  warpAt(x, y) { return (this.def.warps || []).find((w) => w.x === x && w.y === y); }

  // Neighbouring maps with their origin relative to this map (in tiles).
  // north/south offsets shift x; west/east offsets shift y.
  links() {
    if (this.linkCache) return this.linkCache;
    const out = [];
    const c = this.def.connections || {};
    if (c.north) {
      const m = World.get(c.north.map);
      out.push({ map: m, ox: -c.north.offset, oy: -m.h, side: 'north' });
    }
    if (c.south) {
      const m = World.get(c.south.map);
      out.push({ map: m, ox: -c.south.offset, oy: this.h, side: 'south' });
    }
    if (c.west) {
      const m = World.get(c.west.map);
      out.push({ map: m, ox: -m.w, oy: -c.west.offset, side: 'west' });
    }
    if (c.east) {
      const m = World.get(c.east.map);
      out.push({ map: m, ox: this.w, oy: -c.east.offset, side: 'east' });
    }
    this.linkCache = out;
    return out;
  }
}

// ---------------------------------------------------------------------------

class Entity {
  constructor(o) {
    this.def = o;
    this.id = o.id;
    this.person = o.person;
    this.sprite = o.sprite;
    this.x = o.x;
    this.y = o.y;
    this.dir = o.dir || 'down';
    this.home = { x: o.x, y: o.y };
    this.ox = 0;
    this.oy = 0;
    this.moving = false;
    this.moveFrames = WALK_FRAMES;
    this.moveT = 0;
    this.stepAlt = false;
    this.anim = 0;
    this.jumping = false;
    this.hidden = false;
    this.timer = 60 + U.rand(120);
    this.emote = 0;
  }

  get px() { return this.x * TILE + this.ox; }
  get py() { return this.y * TILE + this.oy; }

  image() {
    if (this.sprite === 'ball') return Chars.ball;
    if (this.def.prop) return Props.image(this.def.prop, Game.frame);
    let phase = 0;
    if (this.moving && this.moveT < this.moveFrames / 2) phase = this.stepAlt ? 2 : 1;
    if (this.bumping) phase = (Math.floor(this.bumping / 8) % 2) ? (this.stepAlt ? 2 : 1) : 0;
    return Chars.frame(this.person, this.dir, phase);
  }
}

// ---------------------------------------------------------------------------

const OW = {
  map: null,
  player: null,
  npcs: [],
  busy: 0,
  popup: null,
  shownPopup: null,
  openDoor: null,
  turnHold: 0,
  bumpSfx: 0,
  lastDir: null,
  encounterCooldown: 0,
  camOff: { x: 0, y: 0 },

  // -- setup ------------------------------------------------------------------
  start() {
    const d = State.d;
    this.player = new Entity({ id: 'player', person: 'player', x: d.x, y: d.y, dir: d.dir });
    this.loadMap(d.map, d.x, d.y, d.dir);
    Game.push(this);
  },

  loadMap(id, x, y, dir) {
    this.map = World.get(id);
    this.player.x = x;
    this.player.y = y;
    this.player.dir = dir || this.player.dir;
    this.player.ox = 0;
    this.player.oy = 0;
    this.player.moving = false;
    this.camOff = { x: 0, y: 0 };
    // GYM puzzles start fresh each visit (pits unfilled, bells silent).
    this.map.resetTiles();
    this.lit = new Set();
    this.bellSeq = [];
    this.spawnNpcs();
    if (this.map.def.onLoad) this.map.def.onLoad(this.map);
    this.onMapChanged();
  },

  // Show or hide the NPCs and props whose showIf/hideIf flags have changed
  // (gates, doors and blooms in the GYMS), without reloading the map.
  refreshNpcs() {
    for (const n of this.map.def.npcs || []) {
      if (!n.dyn) continue;
      const vis = this.npcVisible(n);
      const e = this.npc(n.id);
      if (vis && !e && !this.entityAt(n.x, n.y)) this.npcs.push(new Entity(n));
      else if (!vis && e) this.despawn(e);
    }
  },

  // A map's music can depend on the story (a function returning a name).
  music() {
    if (this.forceMusic) return this.forceMusic;   // the credits keep their own song
    const m = this.map.def.music;
    return typeof m === 'function' ? m() : m;
  },

  spawnNpcs() {
    this.npcs = (this.map.def.npcs || []).filter((n) => this.npcVisible(n)).map((n) => {
      const e = new Entity(n);
      const moved = State.d.flags[`pos_${n.id}`];
      if (moved) Object.assign(e, moved);
      return e;
    });
  },

  // showIf/hideIf: a flag name, or a function for anything fancier.
  npcVisible(n) {
    const on = (c) => (typeof c === 'function' ? c() : State.flag(c));
    if (n.hideIf && on(n.hideIf)) return false;
    if (n.showIf && !on(n.showIf)) return false;
    if (n.item && State.flag(`item_${n.id}`)) return false;
    return true;
  },

  onMapChanged() {
    const def = this.map.def;
    const region = TownMap.regionOf(this.map.id);
    if (region) State.setFlag(`visit_${region}`);
    const music = this.music();
    if (music) Sound.playMusic(music);
    const named = (def.outdoor || def.popup) && def.name;
    if (named && this.shownPopup !== def.name) {
      this.popup = { text: def.name, start: Game.frame };
      this.shownPopup = def.name;
    }
    if (!named) this.popup = null;
  },

  // -- world queries ---------------------------------------------------------
  // Tile at world coordinates relative to the current map, following links.
  tile(x, y) {
    if (this.map.inside(x, y)) return this.map.tileAt(x, y);
    for (const l of this.map.links()) {
      const lx = x - l.ox;
      const ly = y - l.oy;
      if (l.map.inside(lx, ly)) return l.map.tileAt(lx, ly);
    }
    return this.map.border;
  },

  entityAt(x, y, except) {
    if (this.player !== except && this.player.x === x && this.player.y === y) return this.player;
    return this.npcs.find((n) => n !== except && !n.hidden && n.x === x && n.y === y) || null;
  },

  canEnter(ent, x, y, dir) {
    const ch = this.tile(x, y);
    const def = Tiles.def(ch);
    const warp = this.map.warpAt(x, y);
    if (def.ledge) return false;
    if (def.solid && !(warp && warp.kind === 'door' && ent === this.player)) return false;
    if (!this.map.inside(x, y) && ent !== this.player) return false;
    if (!this.map.inside(x, y) && !this.map.links().some((l) => l.map.inside(x - l.ox, y - l.oy))) return false;
    if (this.entityAt(x, y, ent)) return false;
    if (ent !== this.player && ent.def.move === 'wander') {
      if (warp) return false;
      if ((this.map.def.triggers || []).some((t) => x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h)) return false;
      const r = ent.def.range || 2;
      if (Math.abs(x - ent.home.x) > r || Math.abs(y - ent.home.y) > r) return false;
    }
    return true;
  },

  // -- movement ----------------------------------------------------------------
  startMove(ent, dir, frames) {
    const [dx, dy] = U.dirVec[dir];
    ent.dir = dir;
    ent.x += dx;
    ent.y += dy;
    ent.ox = -dx * TILE;
    ent.oy = -dy * TILE;
    ent.moving = true;
    ent.moveFrames = frames;
    ent.moveT = 0;
    ent.stepAlt = !ent.stepAlt;
    ent.jumping = false;
    if (ent === this.player) this.crossLink();
  },

  startJump(ent) {
    ent.dir = 'down';
    ent.y += 2;
    ent.oy = -2 * TILE;
    ent.ox = 0;
    ent.moving = true;
    ent.jumping = true;
    ent.moveFrames = 32;
    ent.moveT = 0;
    Sound.sfx('ledge');
  },

  // Walking over a map edge switches the current map, keeping positions.
  crossLink() {
    const p = this.player;
    if (this.map.inside(p.x, p.y)) return;
    for (const l of this.map.links()) {
      const lx = p.x - l.ox;
      const ly = p.y - l.oy;
      if (l.map.inside(lx, ly)) {
        this.map = l.map;
        p.x = lx;
        p.y = ly;
        this.spawnNpcs();
        this.onMapChanged();
        return;
      }
    }
  },

  stepEntity(ent) {
    if (!ent.moving) return false;
    ent.moveT++;
    const t = ent.moveT / ent.moveFrames;
    const total = ent.jumping ? 2 * TILE : TILE;
    const [dx, dy] = U.dirVec[ent.dir];
    ent.ox = Math.round(-dx * total * (1 - t));
    ent.oy = Math.round(-dy * total * (1 - t));
    if (ent.moveT >= ent.moveFrames) {
      ent.ox = 0;
      ent.oy = 0;
      ent.moving = false;
      ent.jumping = false;
      return true;
    }
    return false;
  },

  // -- scene hooks ----------------------------------------------------------
  update() {
    State.d.frames++;
    for (const n of this.npcs) {
      this.stepEntity(n);
      if (n.emote) n.emote--;
    }
    if (!this.busy) this.updateNpcs();

    const p = this.player;
    if (p.moving) {
      if (this.stepEntity(p) && !this.busy) this.onPlayerStep();
      return;
    }
    if (this.busy) return;
    // After riding a current, land as if the player had just stepped there.
    if (this.deferStep) {
      this.deferStep = false;
      this.onPlayerStep();
      return;
    }
    if (p.bumping) p.bumping = 0;
    this.handleInput();
  },

  handleInput() {
    const p = this.player;
    if (Input.pressed('start')) {
      Sound.sfx('select');
      this.run(StartMenu.open());
      return;
    }
    if (Input.pressed('a')) {
      this.interact();
      return;
    }
    const dir = Input.dirHeld();
    if (!dir) {
      this.turnHold = 0;
      this.lastDir = null;
      this.wasMoving = false;
      p.bumping = 0;
      return;
    }
    // A quick tap turns in place; holding walks.
    if (dir !== p.dir && this.lastDir !== dir && !this.wasMoving) {
      p.dir = dir;
      this.turnHold = 5;
      this.lastDir = dir;
      return;
    }
    if (this.turnHold > 0) {
      this.turnHold--;
      if (Input.down[dir]) return;
    }
    this.lastDir = dir;
    this.tryMove(dir);
  },

  tryMove(dir) {
    const p = this.player;
    const [dx, dy] = U.dirVec[dir];
    const nx = p.x + dx;
    const ny = p.y + dy;
    p.dir = dir;

    // Leaving a building through the mat.
    const here = this.map.warpAt(p.x, p.y);
    if (here && here.kind === 'mat' && dir === 'down') {
      this.run(this.warp(here));
      return;
    }
    // Hop down a ledge.
    if (dir === 'down' && Tiles.def(this.tile(nx, ny)).ledge) {
      const land = Tiles.def(this.tile(nx, ny + 1));
      if (!land.solid && !land.ledge && !this.entityAt(nx, ny + 1)) {
        this.startJump(p);
        return;
      }
    }
    if (this.canEnter(p, nx, ny, dir)) {
      const warp = this.map.warpAt(nx, ny);
      if (warp && warp.kind === 'door') {
        if (warp.lock && !State.flag(warp.lock.flag)) {
          this.run(warp.lock.script ? Events[warp.lock.script](warp) : Events.sign(warp.lock.text, true));
          return;
        }
        this.run(this.enterDoor(warp));
        return;
      }
      const running = Input.down.b || Input.down.run;
      this.startMove(p, dir, running ? RUN_FRAMES : WALK_FRAMES);
      this.wasMoving = true;
    } else {
      const rock = this.entityAt(nx, ny, p);
      if (rock && rock.def.push && !rock.moving) {
        this.run(this.pushRock(rock, dir));
        return;
      }
      p.bumping = (p.bumping || 0) + 1;
      if (this.bumpSfx <= 0) {
        Sound.sfx('bump');
        this.bumpSfx = 20;
      }
      this.wasMoving = false;
    }
    if (this.bumpSfx > 0) this.bumpSfx--;
  },

  onPlayerStep() {
    const p = this.player;
    this.wasMoving = !!Input.dirHeld();
    const warp = this.map.warpAt(p.x, p.y);
    if (warp && warp.kind === 'stairs') {
      this.run(this.warp(warp));
      return;
    }
    if (warp && warp.kind !== 'mat' && warp.kind !== 'door') {
      this.run(this.warp(warp));
      return;
    }
    const pad = (this.map.def.pads || []).find((q) => q.x === p.x && q.y === p.y);
    if (pad) {
      this.run(this.padWarp(pad));
      return;
    }
    if (this.floorEffect()) return;
    if (this.checkTriggers(false)) return;
    if (this.checkTrainers()) return;
    if (this.encounterCooldown > 0) this.encounterCooldown--;
    if (State.d.repel > 0 && --State.d.repel === 0) {
      this.run(Events.sign('REPEL\'s effect wore off...', true));
      return;
    }
    const enc = this.map.def.encounters;
    const here = Tiles.def(this.tile(p.x, p.y));
    if (enc && (here.grass || here.wild) && this.encounterCooldown <= 0 && U.chance(enc.rate)) {
      const e = U.weighted(enc.table);
      const level = U.randInt(e.min, e.max);
      // REPEL keeps away wild AIMON weaker than your lead.
      const lead = State.party.find((m) => !m.fainted);
      if (State.d.repel > 0 && lead && level < lead.level) return;
      this.run(Events.wildBattle(e.species, level));
    }
  },

  // -- GYM puzzle floors ------------------------------------------------------
  // Returns true when the tile under the player took over (a current, a
  // sinkhole, the open sky of the dome...).
  floorEffect() {
    const p = this.player;
    const d = Tiles.def(this.tile(p.x, p.y));
    if (d.starPath) this.lit.add(`${p.x},${p.y}`);
    if (d.push && this.canRide(d.push)) {
      this.run(this.ride());
      return true;
    }
    if (d.sink && this.map.def.sinkTo) {
      this.run(this.sinkFall());
      return true;
    }
    if (d.fall && this.map.def.fallTo) {
      this.run(this.voidFall());
      return true;
    }
    if (d.toggle && this.map.def.onSwitch) {
      this.run(Events[this.map.def.onSwitch](p.x, p.y));
      return true;
    }
    if (d.bell !== undefined && this.map.def.onBell) {
      this.run(Events[this.map.def.onBell](d.bell, p.x, p.y));
      return true;
    }
    return false;
  },

  canRide(dir) {
    const p = this.player;
    const [dx, dy] = U.dirVec[dir];
    const nx = p.x + dx;
    const ny = p.y + dy;
    return this.map.inside(nx, ny) && !Tiles.def(this.tile(nx, ny)).solid && !this.entityAt(nx, ny, p);
  },

  // Carried along by a water current until it lets go.
  *ride() {
    const p = this.player;
    Sound.sfx('water');
    for (let guard = 0; guard < 60; guard++) {
      const d = Tiles.def(this.tile(p.x, p.y)).push;
      if (!d || !this.canRide(d)) break;
      this.startMove(p, d, RUN_FRAMES);
      yield () => !p.moving;
    }
    this.deferStep = true;
  },

  // Down through a sinkhole to the floor below, landing on the same spot.
  *sinkFall() {
    const p = this.player;
    Sound.sfx('ledge');
    for (let i = 0; i < 12; i++) {
      p.oy = i;
      yield 1;
    }
    p.hidden = true;
    yield* Game.fadeOut(12);
    p.oy = 0;
    p.hidden = false;
    this.loadMap(this.map.def.sinkTo, p.x, p.y, p.dir);
    Sound.sfx('bump');
    Game.shake = 6;
    yield* Game.fadeIn(12);
  },

  // A step off the hidden path into the open sky: back to the start.
  *voidFall() {
    const p = this.player;
    const [x, y, dir] = this.map.def.fallTo;
    Sound.sfx('faint');
    for (let i = 0; i < 10; i++) {
      p.hidden = i % 2 === 0;
      yield 3;
    }
    yield* Game.fadeOut(16);
    p.hidden = false;
    p.x = x;
    p.y = y;
    p.dir = dir || 'down';
    yield* Game.fadeIn(16);
    const fall = this.map.def.fallText;
    if (fall && !State.flag(`fell_${this.map.id}`)) {
      State.setFlag(`fell_${this.map.id}`);
      yield* say(fall);
    }
  },

  // Shove a boulder one tile; it drops into a pit and fills it.
  *pushRock(rock, dir) {
    const [dx, dy] = U.dirVec[dir];
    const bx = rock.x + dx;
    const by = rock.y + dy;
    const t = Tiles.def(this.tile(bx, by));
    if (!this.map.inside(bx, by) || this.entityAt(bx, by) || this.map.warpAt(bx, by) || (t.solid && !t.hole)) {
      Sound.sfx('bump');
      yield 10;
      return;
    }
    Sound.sfx('rock');
    this.startMove(rock, dir, WALK_FRAMES + 4);
    yield () => !rock.moving;
    if (t.hole) {
      Sound.sfx('rumble');
      Game.shake = 8;
      this.despawn(rock);
      this.map.setTile(bx, by, this.map.def.floor);
      yield 16;
    }
  },

  // Put a person on the map for a cutscene.
  spawn(o) {
    const e = new Entity({ move: 'still', ...o });
    this.npcs.push(e);
    return e;
  },

  despawn(e) {
    this.npcs = this.npcs.filter((n) => n !== e);
  },

  // Spawn someone a few steps from `near`, somewhere they can walk from.
  spawnNear(o, near, side) {
    const cands = [];
    for (let dy = -5; dy <= 5; dy++) {
      for (let dx = -5; dx <= 5; dx++) {
        const d = Math.abs(dx) + Math.abs(dy);
        if (d < 3 || d > 5) continue;
        if (side === 'east' && dx <= 0) continue;
        if (side === 'south' && dy <= 0) continue;
        if (side === 'north' && dy >= 0) continue;
        if (side === 'west' && dx >= 0) continue;
        const x = near.x + dx;
        const y = near.y + dy;
        if (!this.map.inside(x, y)) continue;
        const t = Tiles.def(this.tile(x, y));
        if (t.solid || t.ledge || t.water || this.entityAt(x, y) || this.map.warpAt(x, y)) continue;
        cands.push([x, y, Math.abs(dy) * 2 + d]);
      }
    }
    cands.sort((a, b) => a[2] - b[2]);
    for (const [x, y] of cands) {
      const e = new Entity({ move: 'still', dir: 'down', ...o, x, y });
      const path = this.findPath(e, near.x, near.y);
      if (path && path.length > 1) {
        this.npcs.push(e);
        this.faceTowards(e, near);
        return e;
      }
    }
    return this.spawn({ ...o, x: near.x, y: near.y - 1 });
  },

  // Walk up to someone and face them.
  *approach(ent, other) {
    const path = this.findPath(ent, other.x, other.y);
    if (path && path.length > 1) yield* this.walkPath(ent, path.slice(0, -1));
    this.faceTowards(ent, other);
    this.faceTowards(other, ent);
  },

  checkTriggers(arrive) {
    const p = this.player;
    for (const t of this.map.def.triggers || []) {
      if (arrive && !t.onArrive) continue;
      if (p.x >= t.x && p.x < t.x + t.w && p.y >= t.y && p.y < t.y + t.h) {
        const fn = Events[t.script];
        if (fn && (!fn.when || fn.when(t))) {
          this.run(fn.call(Events, t));
          return true;
        }
      }
    }
    return false;
  },

  checkTrainers() {
    const p = this.player;
    for (const n of this.npcs) {
      const tr = n.def.trainer;
      if (!tr || State.flag(`beat_${tr}`) || n.hidden) continue;
      const [dx, dy] = U.dirVec[n.dir];
      for (let i = 1; i <= (n.def.sight || 4); i++) {
        const x = n.x + dx * i;
        const y = n.y + dy * i;
        if (p.x === x && p.y === y) {
          this.run(Events.trainerSpotted(n));
          return true;
        }
        if (Tiles.def(this.tile(x, y)).solid || this.entityAt(x, y, p)) break;
      }
    }
    return false;
  },

  updateNpcs() {
    for (const n of this.npcs) {
      if (n.moving || n.hidden) continue;
      const mv = n.def.move;
      if (mv !== 'wander' && mv !== 'look') continue;
      if (--n.timer > 0) continue;
      n.timer = 90 + U.rand(150);
      const dir = U.pick(['up', 'down', 'left', 'right']);
      if (mv === 'look' || U.chance(0.4)) {
        n.dir = dir;
        continue;
      }
      const [dx, dy] = U.dirVec[dir];
      if (this.canEnter(n, n.x + dx, n.y + dy, dir)) this.startMove(n, dir, WALK_FRAMES);
      else n.dir = dir;
    }
  },

  // -- interaction -------------------------------------------------------------
  facing(ent = this.player) {
    const [dx, dy] = U.dirVec[ent.dir];
    return [ent.x + dx, ent.y + dy];
  },

  interact() {
    const p = this.player;
    const [fx, fy] = this.facing();
    let npc = this.entityAt(fx, fy, p);
    // Talk across counters.
    if (!npc && Tiles.def(this.tile(fx, fy)).counter) {
      const [dx, dy] = U.dirVec[p.dir];
      npc = this.entityAt(fx + dx, fy + dy, p);
    }
    if (npc && npc !== p) {
      this.run(Events.talk(npc));
      return;
    }
    if (Follower.visible() && Follower.x === fx && Follower.y === fy) {
      this.run(Events.followerTalk());
      return;
    }
    const def = this.map.def;
    const sign = (def.signs || []).find((s) => s.x === fx && s.y === fy);
    if (sign) {
      this.run(Events.sign(sign.text));
      return;
    }
    const thing = (def.things || []).find((s) => s.x === fx && s.y === fy);
    if (thing) {
      this.run(thing.script ? Events[thing.script](thing) : Events.sign(thing.text, true));
      return;
    }
    if (Tiles.def(this.tile(fx, fy)).water && State.count('oldrod') && def.fishing) {
      this.run(Events.fishPrompt());
      return;
    }
    const generic = TILE_TEXT[Tiles.def(this.tile(fx, fy)).name];
    if (generic) this.run(Events.sign(generic, true));
  },

  // Run a cutscene coroutine with player control locked.
  run(gen) {
    this.busy++;
    this.player.bumping = 0;
    Co.start(gen, () => {
      this.busy--;
      Input.clear();
    });
  },

  // -- scripted movement ---------------------------------------------------
  *walk(ent, dir, steps = 1, frames = WALK_FRAMES) {
    for (let i = 0; i < steps; i++) {
      const [dx, dy] = U.dirVec[dir];
      ent.dir = dir;
      let waited = 0;
      yield () => !this.entityAt(ent.x + dx, ent.y + dy, ent) || ++waited > 60;
      if (this.entityAt(ent.x + dx, ent.y + dy, ent)) continue;
      this.startMove(ent, dir, frames);
      yield () => !ent.moving;
    }
  },

  *walkPath(ent, dirs) {
    for (const d of dirs) yield* this.walk(ent, d, 1);
  },

  // Breadth-first path to (tx, ty); walks there step by step.
  *walkTo(ent, tx, ty) {
    const path = this.findPath(ent, tx, ty);
    if (path) yield* this.walkPath(ent, path);
  },

  findPath(ent, tx, ty) {
    const key = (x, y) => `${x},${y}`;
    const prev = new Map([[key(ent.x, ent.y), null]]);
    const q = [[ent.x, ent.y]];
    while (q.length) {
      const [x, y] = q.shift();
      if (x === tx && y === ty) break;
      for (const d of ['up', 'down', 'left', 'right']) {
        const [dx, dy] = U.dirVec[d];
        const nx = x + dx;
        const ny = y + dy;
        const k = key(nx, ny);
        if (prev.has(k) || !this.map.inside(nx, ny)) continue;
        const solid = Tiles.def(this.tile(nx, ny)).solid || Tiles.def(this.tile(nx, ny)).ledge;
        const blocker = this.entityAt(nx, ny, ent);
        if ((solid || blocker) && !(nx === tx && ny === ty && !solid)) continue;
        prev.set(k, [x, y, d]);
        q.push([nx, ny]);
      }
    }
    if (!prev.has(key(tx, ty))) return null;
    const out = [];
    let cur = prev.get(key(tx, ty));
    while (cur) {
      out.unshift(cur[2]);
      cur = prev.get(key(cur[0], cur[1]));
    }
    return out;
  },

  face(ent, dir) { ent.dir = dir; },

  faceTowards(ent, other) {
    const dx = other.x - ent.x;
    const dy = other.y - ent.y;
    if (Math.abs(dx) > Math.abs(dy)) ent.dir = dx > 0 ? 'right' : 'left';
    else ent.dir = dy > 0 ? 'down' : 'up';
  },

  npc(id) { return this.npcs.find((n) => n.id === id); },

  // -- warps ---------------------------------------------------------------------
  *enterDoor(warp) {
    const p = this.player;
    Sound.sfx('door');
    this.openDoor = { x: warp.x, y: warp.y };
    yield 8;
    p.dir = 'up';
    this.startMove(p, 'up', WALK_FRAMES);
    yield () => !p.moving;
    p.hidden = true;
    yield* this.warp(warp, true);
  },

  *warp(w, fromDoor = false) {
    const p = this.player;
    if (!fromDoor) Sound.sfx(w.kind === 'mat' ? 'exit' : 'door');
    yield* Game.fadeOut(12);
    this.openDoor = null;
    p.hidden = false;
    const dir = w.kind === 'door' ? 'up' : w.kind === 'mat' ? 'down' : (w.dir || p.dir);
    this.loadMap(w.to, w.tx, w.ty, dir);
    if (w.kind === 'mat') {
      // Step out of the doorway onto the street.
      this.openDoor = { x: w.tx, y: w.ty };
      yield* Game.fadeIn(12);
      yield* this.walk(p, 'down', 1);
      this.openDoor = null;
    } else {
      yield* Game.fadeIn(12);
    }
    if (this.checkTriggers(true)) yield 1;
  },

  // Warp pads: flicker out, reappear on the linked pad on the same floor.
  *padWarp(pad) {
    const p = this.player;
    Sound.sfx('pad');
    for (let i = 0; i < 10; i++) {
      p.hidden = i % 2 === 0;
      yield 2;
    }
    p.hidden = true;
    yield* Game.fadeOut(6);
    [p.x, p.y] = pad.to;
    yield* Game.fadeIn(6);
    Sound.sfx('pad');
    for (let i = 0; i < 10; i++) {
      p.hidden = i % 2 === 1;
      yield 2;
    }
    p.hidden = false;
  },

  *teleport(mapId, x, y, dir) {
    yield* Game.fadeOut(16);
    this.loadMap(mapId, x, y, dir);
    yield* Game.fadeIn(16);
  },

  // -- drawing -------------------------------------------------------------------
  camera() {
    const p = this.player;
    return [p.px - 112 + Math.round(this.camOff.x), p.py - 72 + Math.round(this.camOff.y)];
  },

  // Slide the camera by (dx, dy) tiles from the player, for cutscenes.
  *pan(dx, dy, frames = 30) {
    const from = { ...this.camOff };
    for (let i = 1; i <= frames; i++) {
      const t = 0.5 - Math.cos((i / frames) * Math.PI) / 2;
      this.camOff.x = from.x + (dx * TILE - from.x) * t;
      this.camOff.y = from.y + (dy * TILE - from.y) * t;
      yield;
    }
  },

  draw(g) {
    const [cx, cy] = this.camera();
    const frame = Game.frame;

    // Border filler (trees outdoors, rock in caves, black inside).
    const borderImg = Tiles.borderImg(this.map.border);
    if (borderImg) {
      const sx = Math.floor(cx / TILE);
      const sy = Math.floor(cy / TILE);
      for (let ty = sy; ty <= sy + 11; ty++) {
        for (let tx = sx; tx <= sx + 15; tx++) g.drawImage(borderImg, tx * TILE - cx, ty * TILE - cy);
      }
    } else {
      g.fillStyle = '#000';
      g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    }

    const layers = [{ map: this.map, ox: 0, oy: 0 }, ...this.map.links()];
    for (const l of layers) {
      const r = l.map.render();
      const bx = l.ox * TILE - cx;
      const by = l.oy * TILE - cy;
      if (bx > SCREEN_W || by > SCREEN_H || bx + r.canvas.width < 0 || by + r.canvas.height < 0) continue;
      g.drawImage(r.canvas, bx, by);
      for (const a of r.anims) {
        const ax = bx + a.x * TILE;
        const ay = by + a.y * TILE;
        if (ax < -TILE || ay < -TILE || ax > SCREEN_W || ay > SCREEN_H) continue;
        Tiles.drawAnim(g, a, ax, ay, frame);
      }
    }

    if (this.openDoor) g.drawImage(Tiles.doorOpen(), this.openDoor.x * TILE - cx, this.openDoor.y * TILE - cy);
    if (this.healBalls) this.drawHealBalls(g, cx, cy);

    // People, sorted so lower ones overlap higher ones.
    const ents = [...this.npcs, this.player].filter((e) => !e.hidden);
    if (Follower.visible()) ents.push(Follower);
    ents.sort((a, b) => a.py - b.py);
    for (const e of ents) {
      if (e === Follower) {
        Follower.draw(g, cx, cy);
        continue;
      }
      const x = e.px - cx;
      let y = e.py - cy;
      if (e.sprite === 'ball') {
        g.drawImage(e.image(), x + 2, y + 2);
        continue;
      }
      if (e.def.prop) {
        const img = e.image();
        g.drawImage(img, x + 8 - img.width / 2, y + 16 - img.height);
        continue;
      }
      if (e.jumping) {
        const t = e.moveT / e.moveFrames;
        g.drawImage(Chars.shadow, x + 1, y + 13);
        y -= Math.round(Math.sin(t * Math.PI) * 10);
      }
      g.drawImage(e.image(), x, y - 4);
      const under = Tiles.def(this.tile(e.x, e.y));
      if (under.grass && (!e.moving || e.moveT > e.moveFrames / 2)) {
        g.drawImage(under.over ? Tiles[`${under.over}Img`]() : Tiles.tallOver, x, y);
      }
      if (e.emote) g.drawImage(Chars.emote, x + 2, y - 18);
    }

    // Darkness is lit around the player; crystal glows shine through it.
    if (this.map.def.dark) {
      g.drawImage(Tiles.darkness(this.map.def.dark), -120 - Math.round(this.camOff.x), -88 - Math.round(this.camOff.y));
    }
    g.globalCompositeOperation = 'lighter';
    for (const gl of this.map.def.glows || []) {
      if (gl.showIf && !State.flag(gl.showIf)) continue;
      if (gl.hideIf && State.flag(gl.hideIf)) continue;
      const a = (gl.alpha || 0.3) * (0.6 + 0.4 * Math.sin(frame / (gl.speed || 20) + gl.x));
      g.globalAlpha = a;
      Pix.ellipse(g, gl.x * TILE + 8 - cx, gl.y * TILE + 8 - cy, gl.r || 14, Math.round((gl.r || 14) * 0.7), gl.color || '#b070f8');
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    if (this.fishing) this.drawRod(g, cx, cy);
    const weather = this.weather();
    if (weather) this.drawWeather(g, weather, frame);
    if (this.popup) this.drawPopup(g);
  },

  // --- weather ---------------------------------------------------------------
  // def.weather: { kind: 'rain' | 'storm' | 'night' | 'mist' | 'violet', hideIf, showIf }
  weather() {
    const d = this.map.def.weather;
    const w = typeof d === 'function' ? d() : d;
    if (!w || (w.hideIf && State.flag(w.hideIf)) || (w.showIf && !State.flag(w.showIf))) return null;
    return w;
  },

  drawWeather(g, w, frame) {
    if (w.kind === 'night' || w.kind === 'violet') {
      // A dark sky (or the violet sky of the COUNTERMELODY) with a few stars.
      g.fillStyle = w.kind === 'night' ? `rgba(10,14,40,${w.dark || 0.42})` : 'rgba(60,20,90,0.38)';
      g.fillRect(0, 0, SCREEN_W, SCREEN_H);
      for (let i = 0; i < 14; i++) {
        const tw = (Math.floor(frame / 12) + i * 5) % 9;
        if (tw > 5) continue;
        g.fillStyle = w.kind === 'night' ? 'rgba(255,250,220,0.8)' : 'rgba(230,200,255,0.8)';
        g.fillRect((i * 67 + 13) % SCREEN_W, (i * 29 + 7) % 48, 1, 1);
      }
      return;
    }
    if (w.kind === 'mist') {
      // Low banks of mist drifting across the marsh.
      g.fillStyle = 'rgba(220,230,228,0.12)';
      g.fillRect(0, 0, SCREEN_W, SCREEN_H);
      for (let i = 0; i < 6; i++) {
        const y = (i * 31 + 10) % SCREEN_H;
        const x = ((frame * (0.3 + (i % 3) * 0.15) + i * 70) % (SCREEN_W + 120)) - 120;
        g.fillStyle = 'rgba(236,242,240,0.16)';
        g.fillRect(Math.round(x), y, 110, 10);
        g.fillRect(Math.round(x) + 14, y - 4, 70, 4);
      }
      return;
    }
    const storm = w.kind === 'storm';
    g.fillStyle = storm ? 'rgba(16,24,48,0.38)' : 'rgba(24,32,56,0.18)';
    g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    const n = storm ? 70 : 36;
    g.fillStyle = storm ? 'rgba(200,215,240,0.75)' : 'rgba(200,215,240,0.55)';
    for (let i = 0; i < n; i++) {
      const sp = 5 + (i % 3);
      const x = ((i * 41 + frame * (storm ? 3 : 1.5)) % 272) - 16;
      const y = ((i * 67 + frame * sp) % 192) - 16;
      for (let k = 0; k < 4; k++) g.fillRect(Math.round(x - k * (storm ? 0.8 : 0.4)), Math.round(y + k * 1.5), 1, 2);
    }
    if (!storm) return;
    // Lightning every few seconds.
    if (this.flashT > 0) this.flashT--;
    else if (Math.random() < 1 / 260) {
      this.flashT = 14;
      Sound.sfx('rumble');
      Game.shake = Math.max(Game.shake, 10);
    }
    if (this.flashT > 8 || (this.flashT > 2 && this.flashT < 5)) {
      g.fillStyle = 'rgba(240,240,255,0.55)';
      g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    }
  },

  // --- fishing -----------------------------------------------------------------
  drawRod(g, cx, cy) {
    const p = this.player;
    const [dx, dy] = U.dirVec[p.dir];
    const hx = p.px - cx + 8 + dx * 6;
    const hy = p.py - cy + 4 + dy * 6;
    const bx = p.px - cx + 8 + dx * 18;
    const by = p.py - cy + 8 + dy * 18 + (this.fishing === 'bite' ? (Game.frame % 8 < 4 ? 2 : 0) : 0);
    g.strokeStyle = '#f0f0f0';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(hx + 0.5, hy + 0.5);
    g.lineTo(bx + 0.5, by + 0.5);
    g.stroke();
    g.fillStyle = '#e04040';
    g.fillRect(bx - 1, by - 1, 3, 3);
    g.fillStyle = '#f8f8f8';
    g.fillRect(bx - 1, by - 1, 3, 1);
  },

  // Balls placed on the AIMON CENTRE machine while healing.
  drawHealBalls(g, cx, cy) {
    let hx = -1;
    const hy = this.map.rows.findIndex((r) => (hx = r.indexOf('h')) >= 0);
    if (hy < 0) return;
    const blink = this.healBlink && Math.floor(Game.frame / 6) % 2;
    for (let i = 0; i < this.healBalls; i++) {
      const x = hx * TILE - cx + 2 + (i % 3) * 4;
      const y = hy * TILE - cy + 1 + Math.floor(i / 3) * 3;
      g.fillStyle = blink ? '#f8f8a0' : '#3878e0';
      g.fillRect(x, y, 3, 2);
      g.fillStyle = '#f8f8f8';
      g.fillRect(x, y + 2, 3, 1);
    }
  },

  drawPopup(g) {
    const t = Game.frame - this.popup.start;
    if (t > 150) {
      this.popup = null;
      return;
    }
    let y = 4;
    if (t < 12) y = -26 + (t / 12) * 30;
    if (t > 130) y = 4 - ((t - 130) / 20) * 30;
    const w = Math.max(96, Font.width(this.popup.text) + 24);
    UI.window(g, 4, Math.round(y), w, 24, 'sign');
    Font.drawCenter(g, this.popup.text, 4 + w / 2, Math.round(y) + 8, '#404048', '#d8d0b8');
  },
};

// Default descriptions for furniture.
const TILE_TEXT = {
  shelf: 'It\'s crammed full of books about AIMON.',
  shelfTop: 'It\'s crammed full of books about AIMON.',
  window: 'The sky outside looks clear and blue.',
  picture: 'A painting of the river at sunrise.',
  clock: 'The clock is ticking steadily.',
  tv: 'There\'s an AIMON documentary on TV.',
  pc: 'It\'s a PC. Somebody left it on.',
  goods: 'The shelves are neatly stocked with goods.',
  machine: 'Complicated machinery for studying AIMON.',
  kitchen: 'The kitchen smells like fresh bread.',
  plant: 'A healthy potted plant.',
  vase: 'A vase of freshly picked flowers.',
  bedTop: 'A comfy-looking bed.',
  bed: 'A comfy-looking bed.',
  healer: 'A machine that restores tired AIMON.',
  pillar: 'A sturdy stone pillar. It hasn\'t moved in a hundred years.',
  statue: 'A stone statue of a RUFFANG, standing proud.',
  lamp: 'An old iron street lamp.',
  crystal: 'A crystal glowing with a faint violet light.',
  boulder: 'A big boulder. It won\'t budge.',
  bamboo: 'Tall bamboo sways in the breeze.',
  stoneWall: 'An old stone wall. Moss grows between the bricks.',
};
