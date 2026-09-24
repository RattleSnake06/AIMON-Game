'use strict';
// The professor's welcome speech and choosing the player's name.

const Intro = {
  *run() {
    const s = { opaque: true, actors: [] };
    s.draw = (g) => {
      const bands = ['#101830', '#142040', '#182850', '#1c3060', '#203870', '#284080', '#304890', '#3850a0'];
      bands.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * 14, 240, 14); });
      g.fillStyle = '#3850a0';
      g.fillRect(0, 112, 240, 48);
      Pix.ellipse(g, 120, 100, 70, 12, '#4868b8');
      Pix.ellipse(g, 120, 99, 66, 10, '#5878c8');
      for (const a of s.actors) {
        if (a.alpha <= 0) continue;
        g.globalAlpha = a.alpha;
        const w = a.img.width * a.scale;
        const h = a.img.height * a.scale;
        if (a.white && !a.whiteImg) a.whiteImg = Pix.silhouette(a.img, '#ffffff');
        g.drawImage(a.white ? a.whiteImg : a.img, Math.round(a.x + (a.img.width - w) / 2), Math.round(a.y + a.img.height - h), w, h);
        g.globalAlpha = 1;
      }
    };
    const actor = (img, x, y) => {
      const a = { img, x, y, alpha: 0, scale: 1 };
      s.actors.push(a);
      return a;
    };
    const fade = function* (a, to, frames = 16) {
      const from = a.alpha;
      yield* BattleFX.tween(frames, (t) => { a.alpha = from + (to - from) * t; });
    };
    const move = function* (a, x, frames = 16) {
      const from = a.x;
      yield* BattleFX.tween(frames, (t) => { a.x = from + (x - from) * t; });
    };

    Game.push(s);
    Sound.playMusic('intro');
    Game.fadeA = 0;
    const prof = actor(TrainerArt.get('prof'), 88, 38);
    yield* fade(prof, 1, 30);
    yield* say('Hello there!\nWelcome to the world of AIMON!');
    yield* say('My name is LINDEN.\fPeople around here call me the AIMON PROFESSOR.');

    yield* move(prof, 48, 16);
    const goskie = actor(MonSprites.front('goskie'), 132, 38);
    goskie.alpha = 1;
    goskie.scale = 0.2;
    goskie.white = true;
    Sound.sfx('ballOpen');
    yield* BattleFX.tween(12, (t) => { goskie.scale = 0.2 + 0.8 * t; });
    goskie.white = false;
    Sound.cry('goskie');
    yield* say('This world is home to creatures called AIMON.');
    yield* say('Some glide between the treetops. Some doze on the riverbanks. And some, like this GOSKIE, honk their way up and down the rivers!');
    yield* say('People and AIMON live side by side here, as friends and partners.\fI study AIMON to learn how they live alongside us.');
    goskie.white = true;
    Sound.sfx('ballOpen');
    yield* BattleFX.tween(12, (t) => { goskie.scale = 1 - 0.8 * t; });
    goskie.alpha = 0;
    yield* move(prof, 88, 16);
    yield* say('But that\'s enough about me.\nTell me a little about yourself!');

    yield* fade(prof, 0, 16);
    const hero = actor(TrainerArt.get('playerFront'), 88, 38);
    yield* fade(hero, 1, 16);

    let name = '';
    for (;;) {
      const k = yield* Dialog.ask('Let\'s begin with your name.\nWhat is it?', ['NEW NAME', 'RILEY', 'JORDAN', 'SAM'], { x: 2, y: 2, cancel: null });
      if (k === 0) {
        name = yield* Naming.run({ title: 'YOUR NAME?', person: 'player', max: 7 });
        if (!name) continue;
      } else {
        name = ['', 'RILEY', 'JORDAN', 'SAM'][k];
      }
      if (yield* Dialog.yesNo(`So your name is ${name}?`)) break;
    }
    State.newGame(name);

    yield* fade(hero, 0, 16);
    const rival = actor(TrainerArt.get('rival'), 88, 38);
    yield* fade(rival, 1, 16);
    yield* say('This is {RIVAL}, your neighbor.\fThe two of you have been friendly rivals for as long as anyone can remember.');
    yield* fade(rival, 0, 16);
    yield* fade(hero, 1, 16);
    yield* say('{PLAYER}!\fYour very own AIMON adventure is about to begin!');
    yield* say('A world of dreams and adventures with AIMON awaits!\nLet\'s go!');
    yield 10;
    // Shrink away into the game world.
    yield* BattleFX.tween(40, (t) => { hero.scale = 1 - 0.75 * t; });
    yield* Game.fadeOut(24, '#000');
    Game.clear();
    OW.shownPopup = null;
    OW.start();
    yield 20;
    yield* Game.fadeIn(24);
  },
};
