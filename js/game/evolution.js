'use strict';
// Evolution: after a battle, any AIMON that levelled up and reached its
// species' evolution level transforms (unless the player holds B).

const Evolution = {
  // Evolve every party member in `leveled` that is ready. Runs while the
  // screen is faded out after a battle.
  *afterBattle(leveled) {
    for (const mon of State.party) {
      if (!leveled.has(mon) || mon.fainted) continue;
      const evo = mon.sp.evo;
      if (evo && mon.level >= evo.level) yield* this.run(mon, evo.to);
    }
  },

  *run(mon, to) {
    const from = mon.species;
    const oldName = mon.name;
    const sc = { opaque: true, mode: 'old', flash: 0, cancel: false, t: 0, stars: [] };
    sc.update = () => {
      sc.t++;
      if (sc.mode !== 'old' && sc.mode !== 'new' && Input.pressed('b')) sc.cancel = true;
    };
    sc.draw = (g) => this.draw(g, sc, from, to);
    Game.push(sc);
    Sound.playMusic('evolution');
    yield* Game.fadeIn(20);
    const dark = { style: 'dark' };
    Sound.cry(from);
    yield* say(`What? ${oldName} is evolving!`, dark);
    Dialog.close();

    // The old and new silhouettes swap faster and faster.
    let period = 26;
    for (let i = 0; i < 18 && !sc.cancel; i++) {
      sc.mode = i % 2 ? 'newWhite' : 'oldWhite';
      for (let f = 0; f < period && !sc.cancel; f++) yield;
      period = Math.max(3, Math.round(period * 0.8));
      if (i % 2 === 0) Sound.sfx('select');
    }

    if (sc.cancel) {
      sc.mode = 'old';
      yield 10;
      Sound.cry(from);
      yield* say(`Huh? ${oldName} stopped evolving!`, dark);
    } else {
      sc.mode = 'newWhite';
      Sound.sfx('confirm');
      yield* BattleFX.tween(20, (t) => { sc.flash = t; });
      mon.evolveTo(to);
      State.markCaught(to);
      sc.mode = 'new';
      for (let i = 0; i < 16; i++) sc.stars.push({ a: (i / 16) * Math.PI * 2, r: 0 });
      yield* BattleFX.tween(24, (t) => { sc.flash = 1 - t; });
      Sound.cry(to);
      yield 30;
      yield Sound.jingle('evolved');
      yield* say(`Congratulations! Your ${oldName} evolved into ${SPECIES[to].name}!`, dark);
      const moves = SPECIES[to].learnset.filter(([l]) => l === mon.level).map(([, m]) => m);
      for (const id of moves) if (!mon.knows(id)) yield* learnMoveFlow(mon, id, 'dark');
    }
    Dialog.close();
    yield* Game.fadeOut(20);
    Game.remove(sc);
  },

  draw(g, sc, from, to) {
    // A dark field with light pouring in from the top.
    const grad = g.createLinearGradient(0, 0, 0, SCREEN_H);
    grad.addColorStop(0, '#302058');
    grad.addColorStop(1, '#080818');
    g.fillStyle = grad;
    g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    for (let i = 0; i < 12; i++) {
      const x = (i * 23 + sc.t * (i % 3 + 1) * 0.4) % SCREEN_W;
      const y = (i * 37 + sc.t * 0.7 * ((i % 2) + 1)) % 112;
      g.fillStyle = i % 3 ? '#8870c8' : '#d8d0f8';
      g.fillRect(Math.round(x), Math.round(112 - y), 1, 1);
    }
    g.globalAlpha = 0.25 + 0.1 * Math.sin(sc.t / 10);
    Pix.ellipse(g, 120, 58, 52, 40, '#a898f0');
    g.globalAlpha = 1;
    let img;
    if (sc.mode === 'old') img = MonSprites.front(from);
    else if (sc.mode === 'new') img = MonSprites.front(to);
    else if (sc.mode === 'oldWhite') img = MonSprites.frontWhite(from);
    else img = MonSprites.frontWhite(to);
    if (img) g.drawImage(img, 120 - 32, 26);
    for (const st of sc.stars) {
      st.r += 1.5;
      if (st.r > 80) continue;
      g.fillStyle = '#f8f0a0';
      g.fillRect(Math.round(120 + Math.cos(st.a) * st.r), Math.round(58 + Math.sin(st.a) * st.r * 0.8), 2, 2);
    }
    if (sc.flash > 0) {
      g.globalAlpha = sc.flash;
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, SCREEN_W, SCREEN_H);
      g.globalAlpha = 1;
    }
  },
};
