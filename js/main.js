'use strict';
// Boot, main loop and the scene stack.

const Game = {
  canvas: null,
  g: null,
  frame: 0,
  scenes: [],
  fadeA: 0,
  fadeColor: '#000',
  error: null,
  shake: 0,

  push(s) { this.scenes.push(s); },
  remove(s) {
    const i = this.scenes.indexOf(s);
    if (i >= 0) this.scenes.splice(i, 1);
  },
  top() { return this.scenes[this.scenes.length - 1]; },
  clear() { this.scenes = []; },

  *fadeOut(n = 16, color = '#000') {
    this.fadeColor = color;
    const start = this.fadeA;
    for (let i = 1; i <= n; i++) {
      this.fadeA = start + (1 - start) * (i / n);
      yield;
    }
    this.fadeA = 1;
  },

  *fadeIn(n = 16) {
    const start = this.fadeA;
    for (let i = 1; i <= n; i++) {
      this.fadeA = start * (1 - i / n);
      yield;
    }
    this.fadeA = 0;
  },

  update() {
    Input.update();
    const t = this.top();
    if (t && t.update) t.update();
    Co.tick();
    this.frame++;
  },

  draw() {
    const g = this.g;
    let start = 0;
    for (let i = this.scenes.length - 1; i >= 0; i--) {
      if (this.scenes[i].opaque) { start = i; break; }
    }
    if (!this.scenes.length || !this.scenes[start].opaque) {
      g.fillStyle = '#000';
      g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    }
    g.save();
    if (this.shake > 0) {
      this.shake--;
      g.translate(U.randInt(-2, 2), U.randInt(-1, 1));
    }
    for (let i = start; i < this.scenes.length; i++) this.scenes[i].draw(g);
    g.restore();
    if (this.fadeA > 0) {
      g.globalAlpha = this.fadeA;
      g.fillStyle = this.fadeColor;
      g.fillRect(0, 0, SCREEN_W, SCREEN_H);
      g.globalAlpha = 1;
    }
    if (this.error) {
      g.fillStyle = 'rgba(120,0,0,0.85)';
      g.fillRect(0, 0, SCREEN_W, 40);
      Font.wrap(this.error.split('\n')[0], 230).slice(0, 2).forEach((l, i) => Font.draw(g, l, 4, 4 + i * 12, '#fff', null));
    }
  },

  fatal(err) {
    console.error(err);
    this.error = String((err && err.message) || err);
  },

  fit() {
    const touch = document.body.classList.contains('touch');
    const availW = window.innerWidth - 32 - 20;
    const availH = window.innerHeight - (touch ? 190 : 70) - 20;
    let s = Math.min(availW / SCREEN_W, availH / SCREEN_H);
    s = s >= 2 ? Math.floor(s) : Math.max(1, s);
    this.canvas.style.width = `${Math.floor(SCREEN_W * s)}px`;
    this.canvas.style.height = `${Math.floor(SCREEN_H * s)}px`;
  },

  start() {
    this.canvas = document.getElementById('screen');
    this.g = this.canvas.getContext('2d');
    this.g.imageSmoothingEnabled = false;
    this.fit();
    window.addEventListener('resize', () => this.fit());
    Input.init();
    Input.onFirstGesture.push(() => Sound.init());
    document.body.addEventListener('touchstart', () => this.fit(), { once: true, passive: true });
    Sound.loadPrefs();
    Font.init();
    Tiles.init();
    Chars.init();
    TrainerArt.init();
    World.init();

    MonSprites.load().then(() => {
      const params = new URLSearchParams(location.search);
      if (params.has('debug')) Debug.start(params.get('debug'));
      else Title.open();
      this.loop();
    });
  },

  loop() {
    const STEP = 1000 / 60;
    let last = performance.now();
    let acc = 0;
    const tick = (now) => {
      acc += Math.min(100, now - last);
      last = now;
      let n = 0;
      while (acc >= STEP && n < 4) {
        try {
          this.update();
        } catch (e) {
          this.fatal(e);
        }
        acc -= STEP;
        n++;
      }
      try {
        this.draw();
      } catch (e) {
        this.fatal(e);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },
};

// Jump straight into the game for testing: index.html?debug=route1
const Debug = {
  start(where) {
    State.newGame('RED');
    const starter = new URLSearchParams(location.search).get('starter') || 'skylavine';
    State.d.starter = starter;
    State.addMon(new Mon(starter, 7));
    State.addItem('aimonball', 5);
    for (const f of ['mom_intro', 'lab_intro', 'got_starter', 'rival1_done', 'rival_left_lab', 'got_dex', `took_${starter}`]) State.setFlag(f);
    const spots = {
      willowbrook: ['willowbrook', 11, 10], route1: ['route1', 11, 30], archford: ['archford', 14, 20],
      lab: ['lab', 6, 10], centre: ['centre', 6, 6], mart: ['mart', 3, 6], home: ['home2f', 2, 5],
      route2: ['route2', 36, 9], cave: ['cave1', 14, 21], route3: ['route3', 2, 11], grayhaven: ['grayhaven', 2, 17],
      route5: ['route5', 46, 11], pinecrest: ['pinecrest', 16, 27], cedarwood: ['cedarwood', 30, 14], library: ['library', 7, 10],
      route4: ['route4', 10, 5], seabreeze: ['seabreeze', 17, 4], lighthouse: ['light1', 5, 9],
      route8: ['route8', 53, 11], silverfall: ['silverfall', 36, 17], hq: ['hq1', 7, 10], bridge: ['bridge', 9, 2],
      cragmoor: ['cragmoor', 16, 3], route9: ['route9', 2, 6], route10: ['route10', 57, 12],
      sunspire: ['sunspire', 36, 18], dig: ['dig1', 12, 16],
      route12: ['route12', 12, 2], meadowfield: ['meadowfield', 19, 3], windmill: ['mill1', 4, 7],
      route11: ['route11', 11, 45], stonepeak: ['stonepeak', 17, 25], belltower: ['tower1', 4, 7],
      route7: ['route7', 12, 2], emberpeak: ['emberpeak', 4, 2], forge: ['forge', 13, 20], resonator: ['hq3', 16, 3],
      route6: ['route6', 13, 2], marshland: ['marshland', 8, 2], grove: ['grove', 14, 21], starfall: ['starfall', 16, 24],
      observatory: ['obs1', 6, 11],
      shrine: ['shrine1', 11, 23], shrine2: ['shrine2', 8, 28], shrine3: ['shrine3', 7, 18], shrine4: ['shrine4', 8, 13],
      victory: ['victory1', 14, 2], bramble: ['bramble', 7, 1], victory2: ['victory2', 11, 2], league: ['league', 10, 9],
      lobby: ['centre_lg', 6, 8], elite1: ['elite1', 6, 11], champion: ['champion', 6, 13], hof: ['halloffame', 5, 7],
    };
    const [map, x, y] = spots[where] || spots.willowbrook;
    Object.assign(State.d, { map, x, y, dir: 'down' });
    OW.start();
  },
};

window.addEventListener('load', () => Game.start());
