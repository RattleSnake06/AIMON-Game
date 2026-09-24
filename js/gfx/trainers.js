'use strict';
// Battle-sized trainer art (64x64), painted from outlined, shaded shapes.

const OUT = '#282030';
const SKIN_ST = { fill: '#f8d0a8', shade: '#e0a078', hi: '#fff0d8', line: OUT };

function style(fill, extra = {}) {
  return { fill, shade: Pix.shade(fill, 0.75), hi: Pix.mix(fill, '#ffffff', 0.35), line: OUT, ...extra };
}

const TrainerArt = {
  sprites: {},

  init() {
    this.sprites.rival = this.front({
      hair: 'spiky', hairCol: '#c87830', shirt: '#8858c8', pants: '#6a5040', shoes: '#383840', pose: 'hips',
    });
    this.sprites.youngster = this.front({
      hair: 'cap', hairCol: '#8a5a30', cap: '#3878e0', shirt: '#f0f0f0', pants: '#e0a040', shoes: '#383840', shorts: true,
    });
    this.sprites.lass = this.front({
      hair: 'long', hairCol: '#6a4030', shirt: '#e878a0', dress: '#e878a0', shoes: '#503848',
    });
    this.sprites.fisher = this.front({
      hair: 'cap', hairCol: '#584030', cap: '#608848', shirt: '#c8b888', pants: '#506070', shoes: '#383840', pose: 'hips',
    });
    this.sprites.prof = this.front({
      hair: 'prof', hairCol: '#c8c8d0', shirt: '#5890c0', pants: '#7a5a40', shoes: '#403838', coat: '#f4f4fa',
    });
    this.sprites.playerBack = this.back(false);
    this.sprites.playerThrow = this.back(true);
    this.sprites.playerFront = this.front({
      hair: 'cap', hairCol: '#403030', cap: '#e84040', shirt: '#3890e0', pants: '#404860', shoes: '#e04848',
    });
  },

  front(o) {
    const p = new Painter(64, 64);
    const cx = 32;
    const skin = SKIN_ST;

    // Long hair sits behind everything.
    if (o.hair === 'long') p.rrect(cx - 13, 8, 26, 32, 8, style(o.hairCol));

    // Legs / lower body.
    if (o.dress) {
      p.rect(cx - 7, 50, 5, 9, skin);
      p.rect(cx + 2, 50, 5, 9, skin);
      p.poly([[cx - 9, 36], [cx + 9, 36], [cx + 14, 53], [cx - 14, 53]], style(o.dress));
    } else if (o.shorts) {
      p.rect(cx - 8, 50, 6, 9, skin);
      p.rect(cx + 2, 50, 6, 9, skin);
      p.rrect(cx - 10, 42, 20, 10, 2, style(o.pants));
    } else {
      p.rrect(cx - 10, 42, 9, 18, 2, style(o.pants));
      p.rrect(cx + 1, 42, 9, 18, 2, style(o.pants));
    }
    p.ellipse(cx - 6, 60, 5, 3, style(o.shoes));
    p.ellipse(cx + 6, 60, 5, 3, style(o.shoes));

    // Torso and arms.
    p.rrect(cx - 11, 26, 22, 19, 4, style(o.shirt));
    if (o.coat) {
      const coat = style(o.coat, { shade: '#c8c8d8', hi: '#ffffff' });
      p.poly([[cx - 12, 26], [cx - 3, 26], [cx - 4, 55], [cx - 15, 55]], coat);
      p.poly([[cx + 3, 26], [cx + 12, 26], [cx + 15, 55], [cx + 4, 55]], coat);
    }
    const armCol = o.coat || o.shirt;
    if (o.pose === 'hips') {
      p.poly([[cx - 11, 27], [cx - 18, 36], [cx - 12, 44], [cx - 8, 40], [cx - 11, 36]], style(armCol));
      p.poly([[cx + 11, 27], [cx + 18, 36], [cx + 12, 44], [cx + 8, 40], [cx + 11, 36]], style(armCol));
      p.ellipse(cx - 10, 42, 3, 3, skin);
      p.ellipse(cx + 10, 42, 3, 3, skin);
    } else {
      p.rrect(cx - 17, 27, 7, 17, 3, style(armCol));
      p.rrect(cx + 10, 27, 7, 17, 3, style(armCol));
      p.ellipse(cx - 13.5, 46, 3.2, 3, skin);
      p.ellipse(cx + 13.5, 46, 3.2, 3, skin);
    }

    // Neck and head.
    const hy = 16;
    p.rect(cx - 3, 24, 6, 5, skin);
    p.ellipse(cx, hy, 10.5, 11, skin);
    p.ellipse(cx - 10, hy + 1, 2, 3, skin);
    p.ellipse(cx + 10, hy + 1, 2, 3, skin);

    const hair = style(o.hairCol);
    switch (o.hair) {
      case 'spiky':
        p.poly([[cx - 12, hy - 1], [cx - 15, hy - 12], [cx - 7, hy - 9], [cx - 5, hy - 16], [cx, hy - 11], [cx + 5, hy - 17], [cx + 7, hy - 10],
          [cx + 15, hy - 13], [cx + 12, hy - 1], [cx + 8, hy - 6], [cx + 2, hy - 4], [cx - 4, hy - 6], [cx - 9, hy - 3]], hair);
        break;
      case 'cap': {
        // Hair peeks out at the sides, under a cap with a forward brim.
        p.ellipse(cx - 9.5, hy - 1, 2.5, 4.5, hair);
        p.ellipse(cx + 9.5, hy - 1, 2.5, 4.5, hair);
        const cap = style(o.cap);
        p.ellipse(cx, hy - 8, 11, 6, cap);
        p.poly([[cx - 12, hy - 5], [cx + 12, hy - 5], [cx + 14, hy - 2], [cx - 14, hy - 2]], style(Pix.shade(o.cap, 0.8)));
        p.ellipse(cx, hy - 10, 3, 2, { fill: '#f8f8f8', line: OUT });
        break;
      }
      case 'long':
        p.ellipse(cx, hy - 7, 11.5, 8, hair);
        p.poly([[cx - 11, hy - 7], [cx + 11, hy - 7], [cx + 8, hy - 3], [cx + 2, hy - 5], [cx - 4, hy - 3], [cx - 10, hy - 4]], hair);
        break;
      case 'prof':
        p.ellipse(cx, hy - 9, 10, 6, hair);
        p.poly([[cx - 11, hy - 2], [cx - 12, hy - 10], [cx - 6, hy - 13], [cx - 7, hy - 7]], hair);
        p.poly([[cx + 11, hy - 2], [cx + 12, hy - 10], [cx + 6, hy - 13], [cx + 7, hy - 7]], hair);
        break;
      default:
        p.ellipse(cx, hy - 7, 11, 7, hair);
    }

    // Face: eyes with a highlight, a hint of a mouth.
    const face = { o: OUT, w: '#f8f8f8', m: '#c86060', b: '#f0a8a0' };
    const eyeY = hy + 1;
    p.rows(cx - 6, eyeY, ['wo', 'oo', 'oo'], face);
    p.rows(cx + 4, eyeY, ['wo', 'oo', 'oo'], face);
    p.rows(cx - 8, eyeY + 4, ['bb'], face);
    p.rows(cx + 6, eyeY + 4, ['bb'], face);
    if (o.hair === 'prof') {
      p.rows(cx - 5, eyeY + 6, ['.ooo.ooo.'], { o: '#a0a0a8' });
      p.rows(cx - 7, eyeY - 2, ['ooo'], { o: '#8a8a98' });
      p.rows(cx + 4, eyeY - 2, ['ooo'], { o: '#8a8a98' });
    } else {
      p.rows(cx - 1, eyeY + 6, ['mm'], face);
    }
    return p.toCanvas();
  },

  // The player seen from behind, as in the battle intro.
  back(throwing) {
    const p = new Painter(64, 64);
    const shirt = style('#3890e0');
    const cap = style('#e84040');
    const hair = style('#403030');
    const skin = SKIN_ST;
    // Arms.
    p.rrect(4, 40, 12, 30, 5, shirt);
    if (throwing) {
      p.poly([[46, 42], [56, 20], [63, 24], [56, 46]], shirt);
      p.ellipse(58, 18, 5, 5, skin);
      p.ellipse(59, 13, 4.5, 4.5, { fill: '#f8f8f8', shade: '#c8c8d0', line: OUT });
      p.rect(54.5, 12.5, 9, 1, { fill: OUT, line: false });
    } else {
      p.rrect(48, 40, 12, 30, 5, shirt);
    }
    // Torso.
    p.rrect(11, 34, 42, 36, 8, shirt);
    // Backpack.
    p.rrect(18, 40, 28, 24, 4, style('#e0b050'));
    p.rrect(22, 44, 20, 8, 2, style('#c89038'));
    p.rect(16, 36, 3, 8, style('#a07028'));
    p.rect(45, 36, 3, 8, style('#a07028'));
    // Head from behind.
    p.rect(27, 30, 10, 6, skin);
    p.ellipse(19.5, 24, 2.5, 3.5, skin);
    p.ellipse(44.5, 24, 2.5, 3.5, skin);
    p.ellipse(32, 22, 12, 11, hair);
    p.ellipse(32, 15, 13, 9.5, cap);
    p.rect(27, 20, 10, 3, { fill: '#a02828', line: OUT });
    return p.toCanvas();
  },

  get(id) { return this.sprites[id]; },
};
