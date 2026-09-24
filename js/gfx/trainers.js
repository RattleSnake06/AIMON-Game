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
    this.sprites.grunt = this.front({
      hair: 'hood', hairCol: '#383848', shirt: '#2c2c3c', pants: '#2c2c3c', shoes: '#8050c0', pose: 'hips', emblem: true,
    });
    this.sprites.hiker = this.front({
      hair: 'hat', hairCol: '#5a3a20', hat: '#8a6a40', shirt: '#c87838', pants: '#6a5a40', shoes: '#503828', beard: '#5a3a20', wide: true,
    });
    this.sprites.blackbelt = this.front({
      hair: 'band', hairCol: '#402818', band: '#303030', shirt: '#f4f4f4', pants: '#f4f4f4', shoes: '#e0c090', skin: 'tan', belt: '#303030', pose: 'hips',
    });
    this.sprites.bugcatcher = this.front({
      hair: 'hat', hairCol: '#5a3a20', hat: '#e8d080', shirt: '#78b848', pants: '#e0b048', shoes: '#503828', shorts: true,
    });
    this.sprites.camper = this.front({
      hair: 'cap', hairCol: '#6a4020', cap: '#48884a', shirt: '#d8a048', pants: '#5a6a3a', shoes: '#503828', shorts: true, pose: 'hips',
    });
    this.sprites.picnicker = this.front({
      hair: 'long', hairCol: '#c07838', shirt: '#78c078', dress: '#78c078', shoes: '#a05038',
    });
    this.sprites.trainee = this.front({
      hair: 'short', hairCol: '#302018', shirt: '#a8a098', pants: '#686058', shoes: '#383030', belt: '#484038', pose: 'hips',
    });
    this.sprites.holt = this.holt();
    this.sprites.playerBack = this.back(false);
    this.sprites.playerThrow = this.back(true);
    this.sprites.playerFront = this.front({
      hair: 'cap', hairCol: '#403030', cap: '#e84040', shirt: '#3890e0', pants: '#404860', shoes: '#e04848',
    });
  },

  front(o) {
    const p = new Painter(64, 64);
    const cx = 32;
    const skin = o.skin === 'tan' ? { fill: '#e0a878', shade: '#b87850', hi: '#f0c8a0', line: OUT } : SKIN_ST;

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
    p.rrect(cx - (o.wide ? 13 : 11), 26, o.wide ? 26 : 22, 19, 4, style(o.shirt));
    if (o.belt) p.rect(cx - 11, 41, 22, 3, style(o.belt));
    if (o.emblem) {
      // TEAM DISTORTION's broken-wave mark.
      p.line(cx - 6, 34, cx - 3, 30, '#b070f8');
      p.line(cx - 3, 30, cx, 35, '#b070f8');
      p.line(cx, 35, cx + 3, 30, '#b070f8');
      p.line(cx + 3, 30, cx + 6, 34, '#b070f8');
      p.line(cx - 10, 38, cx + 10, 38, '#6c34b8');
    }
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
      case 'hood': {
        // A hood with a violet visor across the eyes.
        p.poly([[cx - 13, hy + 9], [cx - 13, hy - 5], [cx - 6, hy - 12], [cx + 6, hy - 12], [cx + 13, hy - 5], [cx + 13, hy + 9],
          [cx + 9, hy + 9], [cx + 9, hy - 3], [cx - 9, hy - 3], [cx - 9, hy + 9]], hair);
        p.rrect(cx - 10, hy - 1, 20, 5, 2, { fill: '#a060e8', shade: '#7038c0', hi: '#e0c0ff', line: OUT });
        break;
      }
      case 'band':
        p.ellipse(cx, hy - 7, 11, 6, hair);
        p.rect(cx - 11, hy - 5, 22, 3, style(o.band || '#c8c0b8'));
        p.poly([[cx + 10, hy - 4], [cx + 17, hy - 1], [cx + 16, hy + 2], [cx + 10, hy - 2]], style(o.band || '#c8c0b8'));
        break;
      case 'hat': {
        const hat = style(o.hat);
        p.ellipse(cx, hy - 3, 16, 3.5, hat);
        p.ellipse(cx, hy - 8, 10, 6, hat);
        p.rect(cx - 9, hy - 6, 18, 2, style(Pix.shade(o.hat, 0.7)));
        break;
      }
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
    if (o.hair === 'hood') {
      p.rows(cx - 2, eyeY + 6, ['mmmm'], { m: '#484050' });
      return p.toCanvas();
    }
    if (o.beard) {
      p.poly([[cx - 9, eyeY + 3], [cx + 9, eyeY + 3], [cx + 6, eyeY + 10], [cx, eyeY + 12], [cx - 6, eyeY + 10]], style(o.beard));
      p.rows(cx - 2, eyeY + 6, ['mmmm'], { m: '#e0a078' });
    }
    if (o.hair === 'prof') {
      p.rows(cx - 5, eyeY + 6, ['.ooo.ooo.'], { o: '#a0a0a8' });
      p.rows(cx - 7, eyeY - 2, ['ooo'], { o: '#8a8a98' });
      p.rows(cx + 4, eyeY - 2, ['ooo'], { o: '#8a8a98' });
    } else {
      p.rows(cx - 1, eyeY + 6, ['mm'], face);
    }
    return p.toCanvas();
  },

  // GYM LEADER HOLT: broader and more detailed than regular trainers.
  holt() {
    const p = new Painter(64, 64);
    const cx = 32;
    const skin = { fill: '#a86c44', shade: '#84502e', hi: '#c88a60', line: OUT };
    const pants = style('#6a4a30');
    // Legs and boots.
    p.rrect(cx - 12, 45, 11, 17, 2, pants);
    p.rrect(cx + 1, 45, 11, 17, 2, pants);
    p.line(cx - 7, 48, cx - 7, 60, '#4a3220');
    p.line(cx + 6, 48, cx + 6, 60, '#4a3220');
    p.rrect(cx - 13, 56, 12, 7, 2, style('#3a2c24'));
    p.rrect(cx + 1, 56, 12, 7, 2, style('#3a2c24'));
    // Broad chest: white tee under a stone-grey vest.
    p.rrect(cx - 15, 22, 30, 24, 5, style('#f0ece4'));
    p.poly([[cx - 15, 24], [cx - 5, 24], [cx - 7, 45], [cx - 15, 45]], style('#7a8090'));
    p.poly([[cx + 5, 24], [cx + 15, 24], [cx + 15, 45], [cx + 7, 45]], style('#7a8090'));
    p.rect(cx - 13, 38, 5, 4, style('#5c6272'));
    p.rect(cx + 9, 38, 5, 4, style('#5c6272'));
    // Belt with the keystone buckle.
    p.rect(cx - 15, 43, 30, 4, style('#4a3020'));
    p.rect(cx - 4, 42, 8, 6, style('#f8d048', { shade: '#c89828' }));
    p.set(cx, 44, '#fff4b0');
    // Shoulders and upper arms, sleeves rolled up.
    p.ellipse(cx - 17, 29, 6, 7, skin);
    p.ellipse(cx + 17, 29, 6, 7, skin);
    p.rrect(cx - 22, 21, 10, 6, 2, style('#f0ece4'));
    p.rrect(cx + 12, 21, 10, 6, 2, style('#f0ece4'));
    // Arms crossed over the chest.
    p.rrect(cx - 19, 31, 27, 8, 3, skin);
    p.rrect(cx - 8, 35, 27, 8, 3, skin);
    p.line(cx - 12, 34, cx - 4, 34, '#84502e');
    p.line(cx + 2, 38, cx + 12, 38, '#84502e');
    // Neck and head.
    p.rect(cx - 5, 16, 10, 7, skin);
    p.ellipse(cx, 11, 10, 10.5, skin);
    p.ellipse(cx - 10, 12, 2, 3, skin);
    p.ellipse(cx + 10, 12, 2, 3, skin);
    // Cropped black hair and headband with trailing tails.
    p.ellipse(cx, 4, 10, 4.5, style('#202020', { hi: '#484848' }));
    p.rect(cx - 11, 5, 22, 3, style('#c8c0b8'));
    p.poly([[cx + 10, 6], [cx + 19, 9], [cx + 18, 12], [cx + 10, 8]], style('#c8c0b8'));
    p.poly([[cx + 11, 7], [cx + 16, 13], [cx + 14, 15], [cx + 10, 9]], style('#b0a8a0'));
    // Beard framing a firm grin.
    p.poly([[cx - 9, 13], [cx - 7, 13], [cx - 5, 17], [cx + 5, 17], [cx + 7, 13], [cx + 9, 13], [cx + 7, 20], [cx, 23], [cx - 7, 20]],
      style('#2a2020', { hi: '#403434' }));
    p.rows(cx - 3, 18, ['wwwwww'], { w: '#f8f8f0' });
    // Heavy brows and eyes.
    const f = { o: OUT, w: '#f8f8f8', b: '#181010' };
    p.rows(cx - 7, 8, ['bbbb'], f);
    p.rows(cx + 3, 8, ['bbbb'], f);
    p.rows(cx - 6, 10, ['wo', 'oo'], f);
    p.rows(cx + 4, 10, ['ow', 'oo'], f);
    p.line(cx, 12, cx, 14, '#84502e');
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
