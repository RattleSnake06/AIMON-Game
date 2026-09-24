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
          const i = row.indexOf('M');
          if (i >= 0) { mx = i; my = y; }
        });
        def.warps.push({ x: dx, y: dy, to: b.to, tx: mx, ty: my, dir: 'up', kind: 'door' });
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

  tileAt(x, y) {
    if (!this.inside(x, y)) return this.border;
    return this.rows[y][x];
  }

  render() {
    if (!this.rendered) this.rendered = Tiles.renderMap(this);
    return this.rendered;
  }

  warpAt(x, y) { return (this.def.warps || []).find((w) => w.x === x && w.y === y); }

  // Neighbouring maps with their origin relative to this map (in tiles).
  links() {
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
    this.spawnNpcs();
    this.onMapChanged();
  },

  spawnNpcs() {
    this.npcs = (this.map.def.npcs || []).filter((n) => this.npcVisible(n)).map((n) => {
      const e = new Entity(n);
      const moved = State.d.flags[`pos_${n.id}`];
      if (moved) Object.assign(e, moved);
      return e;
    });
  },

  npcVisible(n) {
    if (n.hideIf && State.flag(n.hideIf)) return false;
    if (n.showIf && !State.flag(n.showIf)) return false;
    if (n.item && State.flag(`item_${n.id}`)) return false;
    return true;
  },

  onMapChanged() {
    const def = this.map.def;
    if (def.music) Sound.playMusic(def.music);
    if (def.outdoor && def.name && this.shownPopup !== def.name) {
      this.popup = { text: def.name, start: Game.frame };
      this.shownPopup = def.name;
    }
    if (!def.outdoor) this.popup = null;
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
        this.run(this.enterDoor(warp));
        return;
      }
      const running = Input.down.b || Input.down.run;
      this.startMove(p, dir, running ? RUN_FRAMES : WALK_FRAMES);
      this.wasMoving = true;
    } else {
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
    if (this.checkTriggers(false)) return;
    if (this.checkTrainers()) return;
    if (this.encounterCooldown > 0) this.encounterCooldown--;
    const enc = this.map.def.encounters;
    if (enc && Tiles.def(this.tile(p.x, p.y)).grass && this.encounterCooldown <= 0 && U.chance(enc.rate)) {
      const e = U.weighted(enc.table);
      this.run(Events.wildBattle(e.species, U.randInt(e.min, e.max)));
    }
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

  *teleport(mapId, x, y, dir) {
    yield* Game.fadeOut(16);
    this.loadMap(mapId, x, y, dir);
    yield* Game.fadeIn(16);
  },

  // -- drawing -------------------------------------------------------------------
  camera() {
    const p = this.player;
    return [p.px - 112, p.py - 72];
  },

  draw(g) {
    const [cx, cy] = this.camera();
    const frame = Game.frame;

    // Border filler (trees outdoors, black inside).
    const borderImg = this.map.def.outdoor ? Tiles.treeImg() : null;
    if (borderImg) {
      const grass = Tiles.grassImg(0);
      const sx = Math.floor(cx / TILE);
      const sy = Math.floor(cy / TILE);
      for (let ty = sy; ty <= sy + 11; ty++) {
        for (let tx = sx; tx <= sx + 15; tx++) {
          const px = tx * TILE - cx;
          const py = ty * TILE - cy;
          g.drawImage(grass, px, py);
          g.drawImage(borderImg, px, py);
        }
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
    const ents = [...this.npcs, this.player].filter((e) => !e.hidden).sort((a, b) => a.py - b.py);
    for (const e of ents) {
      const x = e.px - cx;
      let y = e.py - cy;
      if (e.sprite === 'ball') {
        g.drawImage(e.image(), x + 2, y + 2);
        continue;
      }
      if (e.jumping) {
        const t = e.moveT / e.moveFrames;
        g.drawImage(Chars.shadow, x + 1, y + 13);
        y -= Math.round(Math.sin(t * Math.PI) * 10);
      }
      g.drawImage(e.image(), x, y - 4);
      if (!e.moving && Tiles.def(this.tile(e.x, e.y)).grass) g.drawImage(Tiles.tallOver, x, y);
      else if (e.moving && e.moveT > e.moveFrames / 2 && Tiles.def(this.tile(e.x, e.y)).grass) g.drawImage(Tiles.tallOver, x, y);
      if (e.emote) g.drawImage(Chars.emote, x + 2, y - 18);
    }

    if (this.popup) this.drawPopup(g);
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
};
