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
    this.sprites.sailor = this.front({
      hair: 'cap', hairCol: '#402818', cap: '#f4f4f4', shirt: '#f4f4f4', stripes: '#3050a0', pants: '#304880', shoes: '#383840',
      skin: 'tan', pose: 'hips', wide: true,
    });
    this.sprites.medium = this.front({
      hair: 'veil', hairCol: '#5a3c80', shirt: '#6a4a90', dress: '#5a3c80', shoes: '#302040', beads: '#b070f8',
    });
    this.sprites.gardener = this.front({
      hair: 'hat', hairCol: '#6a4020', hat: '#e8c870', shirt: '#78a848', pants: '#6a5a40', shoes: '#503828', apron: '#e8dcc0', pose: 'hips',
    });
    this.sprites.swimmer = this.front({
      hair: 'long', hairCol: '#3868a8', shirt: '#48a8e0', dress: '#48a8e0', shoes: '#f8d0a8', pose: 'hips',
    });
    this.sprites.vesper = this.admin({
      hair: '#ded6f8', hairStyle: 'long', coat: '#2a2438', trim: '#a060e8', lips: '#9050a0',
    });
    this.sprites.thane = this.admin({
      hair: '#302840', hairStyle: 'swept', coat: '#262634', trim: '#f0c030', wide: true,
    });
    this.sprites.morrow = this.admin({
      hair: '#c8ccd8', hairStyle: 'swept', coat: '#1e2a2e', trim: '#e0b048',
    });
    this.sprites.scientist = this.front({
      hair: 'prof', hairCol: '#5a4a3a', shirt: '#58a8a0', pants: '#4a4a58', shoes: '#302830', coat: '#f4f4fa',
    });
    this.sprites.worker = this.front({
      hair: 'cap', hairCol: '#403030', cap: '#f8d030', shirt: '#f08030', stripes: '#f8f070', pants: '#4868a0', shoes: '#503828',
      pose: 'hips', wide: true,
    });
    this.sprites.miner = this.front({
      hair: 'cap', hairCol: '#3a2818', cap: '#e0b030', shirt: '#6a6258', pants: '#4a4238', shoes: '#302820', beard: '#3a2818',
      belt: '#3a2a1c', wide: true,
    });
    this.sprites.tor = this.tor();
    this.sprites.ivy = this.ivy();
    this.sprites.nerissa = this.nerissa();
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
    if (o.stripes) for (let y = 30; y < 43; y += 4) p.rect(cx - (o.wide ? 12 : 10), y, o.wide ? 24 : 20, 1, { fill: o.stripes, line: false });
    if (o.apron) {
      p.rrect(cx - 6, 33, 12, 18, 2, style(o.apron));
      p.rect(cx - 3, 38, 6, 4, style(Pix.shade(o.apron, 0.85)));
      p.line(cx - 6, 33, cx - 9, 26, Pix.shade(o.apron, 0.7));
      p.line(cx + 5, 33, cx + 8, 26, Pix.shade(o.apron, 0.7));
    }
    if (o.beads) for (let i = 0; i < 7; i++) p.set(cx - 6 + i * 2, 29 + Math.abs(3 - i), o.beads);
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
      case 'veil':
        p.poly([[cx - 14, hy + 12], [cx - 13, hy - 6], [cx - 6, hy - 13], [cx + 6, hy - 13], [cx + 13, hy - 6], [cx + 14, hy + 12],
          [cx + 10, hy + 12], [cx + 9, hy - 4], [cx - 9, hy - 4], [cx - 10, hy + 12]], hair);
        p.rect(cx - 9, hy - 5, 18, 2, style('#b070f8'));
        break;
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

  // GYM LEADER TOR of CRAGMOOR: a quarry boss with a hard hat, a grey beard
  // and a pickaxe over his shoulder.
  tor() {
    const p = new Painter(64, 64);
    const cx = 32;
    const skin = { fill: '#d09870', shade: '#a87050', hi: '#e8b890', line: OUT };
    const denim = style('#4a5a78');
    // Boots and overalls.
    p.rrect(cx - 12, 44, 11, 17, 2, denim);
    p.rrect(cx + 1, 44, 11, 17, 2, denim);
    p.rrect(cx - 13, 56, 12, 7, 2, style('#3a2818'));
    p.rrect(cx + 1, 56, 12, 7, 2, style('#3a2818'));
    // Pickaxe resting on the right shoulder (behind the body).
    p.poly([[cx + 12, 40], [cx + 26, 6], [cx + 29, 7], [cx + 15, 41]], style('#7a5230'));
    p.poly([[cx + 16, 4], [cx + 30, 1], [cx + 36, 8], [cx + 28, 6], [cx + 20, 9]], style('#b8c0c8', { shade: '#8890a0' }));
    // Broad plaid shirt under the overall bib.
    p.rrect(cx - 16, 22, 32, 24, 6, style('#a84838'));
    for (let x = cx - 14; x < cx + 16; x += 5) p.line(x, 23, x, 45, '#7a2e24');
    p.rect(cx - 9, 30, 18, 16, denim);
    p.rect(cx - 3, 34, 6, 4, style('#3a4a66'));
    p.line(cx - 9, 30, cx - 12, 23, '#303c54');
    p.line(cx + 9, 30, cx + 12, 23, '#303c54');
    // Arms: one hand on the hip, one gripping the pickaxe.
    p.ellipse(cx - 18, 30, 6, 7, style('#a84838'));
    p.rrect(cx - 23, 33, 7, 12, 3, skin);
    p.ellipse(cx + 17, 29, 6, 7, style('#a84838'));
    p.rrect(cx + 15, 31, 7, 10, 3, skin);
    p.ellipse(cx + 17, 40, 3.5, 3, skin);
    // Head: hard hat with a lamp, big grey beard.
    p.rect(cx - 5, 16, 10, 7, skin);
    p.ellipse(cx, 12, 10, 10.5, skin);
    p.poly([[cx - 10, 12], [cx - 8, 21], [cx - 3, 26], [cx + 3, 26], [cx + 8, 21], [cx + 10, 12], [cx + 6, 15], [cx - 6, 15]],
      style('#b0b0b8', { hi: '#d8d8e0' }));
    p.rows(cx - 3, 17, ['.mmmm.'], { m: '#6a3a2a' });
    p.ellipse(cx, 5, 12, 6, style('#e0b030', { hi: '#f8d870' }));
    p.rect(cx - 14, 6, 28, 3, style('#c89820'));
    p.ellipse(cx, 4, 3, 2.4, style('#f8f4c0', { shade: '#d8c870' }));
    const f = { o: OUT, w: '#f8f8f8', b: '#606068' };
    p.rows(cx - 7, 10, ['bbbb'], f);
    p.rows(cx + 3, 10, ['bbbb'], f);
    p.rows(cx - 6, 12, ['wo'], f);
    p.rows(cx + 4, 12, ['ow'], f);
    return p.toCanvas();
  },

  // TEAM DISTORTION ADMINS: long coats with violet trim, visors, the broken
  // wave on the chest. A notch more detail than the grunts.
  admin(o) {
    const p = new Painter(64, 64);
    const cx = 32;
    const coat = style(o.coat, { hi: Pix.mix(o.coat, '#ffffff', 0.18) });
    const trim = style(o.trim);
    if (o.hairStyle === 'long') p.rrect(cx - 14, 6, 28, 38, 9, style(o.hair));
    // Boots and legs.
    p.rrect(cx - 10, 44, 9, 16, 2, style('#1c1a24'));
    p.rrect(cx + 1, 44, 9, 16, 2, style('#1c1a24'));
    p.rrect(cx - 11, 56, 10, 7, 2, style('#383048'));
    p.rrect(cx + 1, 56, 10, 7, 2, style('#383048'));
    // Long coat, open at the front, with a high collar.
    const w = o.wide ? 16 : 14;
    p.poly([[cx - w, 24], [cx + w, 24], [cx + w + 4, 58], [cx + 3, 58], [cx, 40], [cx - 3, 58], [cx - w - 4, 58]], coat);
    p.line(cx - w - 3, 57, cx - 3, 57, o.trim);
    p.line(cx + 3, 57, cx + w + 3, 57, o.trim);
    p.line(cx - 1, 26, cx - 3, 56, o.trim);
    p.line(cx + 1, 26, cx + 3, 56, o.trim);
    p.poly([[cx - 9, 18], [cx - 4, 26], [cx + 4, 26], [cx + 9, 18], [cx + 11, 26], [cx - 11, 26]], coat);
    // Emblem.
    p.line(cx - 8, 33, cx - 5, 29, o.trim);
    p.line(cx - 5, 29, cx - 2, 34, o.trim);
    p.line(cx + 2, 34, cx + 5, 29, o.trim);
    p.line(cx + 5, 29, cx + 8, 33, o.trim);
    // Arms: one on the hip, one raised holding a ball.
    p.poly([[cx - w, 25], [cx - w - 7, 36], [cx - w - 2, 44], [cx - w + 2, 40], [cx - w, 35]], coat);
    p.ellipse(cx - w - 1, 42, 3, 3, SKIN_ST);
    p.poly([[cx + w, 25], [cx + w + 6, 30], [cx + w + 5, 18], [cx + w + 1, 18], [cx + w + 1, 27]], coat);
    p.ellipse(cx + w + 3, 16, 4, 4, { fill: '#9058d8', shade: '#6030a8', hi: '#e0c8ff', line: OUT });
    // Head.
    const hy = 13;
    p.rect(cx - 3, 20, 6, 5, SKIN_ST);
    p.ellipse(cx, hy, 10, 10.5, SKIN_ST);
    const hair = style(o.hair);
    if (o.hairStyle === 'long') {
      p.ellipse(cx, hy - 6, 11.5, 7, hair);
      p.poly([[cx - 11, hy - 6], [cx + 11, hy - 6], [cx + 10, hy + 2], [cx + 6, hy - 3], [cx - 1, hy - 4], [cx - 9, hy - 1]], hair);
    } else {
      p.poly([[cx - 11, hy], [cx - 12, hy - 8], [cx - 4, hy - 13], [cx + 8, hy - 14], [cx + 16, hy - 9], [cx + 10, hy - 6], [cx + 11, hy],
        [cx + 6, hy - 5], [cx - 4, hy - 6], [cx - 8, hy - 2]], hair);
    }
    // Visor.
    p.rrect(cx - 10, hy - 1, 20, 4, 2, { fill: o.trim, shade: Pix.shade(o.trim, 0.7), hi: '#fff0ff', line: OUT });
    p.line(cx - 7, hy, cx - 3, hy, '#ffffff');
    p.rows(cx - 2, hy + 6, [o.lips ? 'mmmm' : '.mm.'], { m: o.lips || '#b07060' });
    return p.toCanvas();
  },

  // GYM LEADER IVY of CEDARWOOD: braided green hair, flower crown, leaf cloak.
  ivy() {
    const p = new Painter(64, 64);
    const cx = 32;
    const hair = style('#4a8a3c', { hi: '#78b860' });
    // Hair behind, with a long braid over the left shoulder.
    p.rrect(cx - 13, 6, 26, 24, 8, hair);
    // Boots, leggings and skirt.
    p.rrect(cx - 9, 46, 7, 14, 2, style('#5a4a38'));
    p.rrect(cx + 2, 46, 7, 14, 2, style('#5a4a38'));
    p.rrect(cx - 10, 55, 9, 8, 2, style('#7a5a38'));
    p.rrect(cx + 1, 55, 9, 8, 2, style('#7a5a38'));
    p.poly([[cx - 10, 38], [cx + 10, 38], [cx + 15, 50], [cx + 8, 48], [cx + 3, 51], [cx - 3, 48], [cx - 8, 51], [cx - 15, 49]], style('#5a9848'));
    // Tunic, belt with a seed pouch.
    p.rrect(cx - 11, 23, 22, 18, 4, style('#78b050'));
    p.line(cx, 24, cx, 38, '#4c7c34');
    p.rect(cx - 11, 37, 22, 3, style('#7a5030'));
    p.rrect(cx + 5, 38, 7, 7, 2, style('#a87848'));
    // Leaf cloak over the shoulders.
    for (const [x, y, d] of [[-13, 24, -1], [-11, 30, -1], [13, 24, 1], [11, 30, 1], [-6, 22, -1], [6, 22, 1]]) {
      p.poly([[cx + x, y], [cx + x + d * 7, y + 3], [cx + x + d * 3, y + 9]], style('#3c7a30', { hi: '#6aa850' }));
    }
    // Arms: left holds a sprouting vine, right on the hip.
    p.rrect(cx - 18, 27, 7, 15, 3, SKIN_ST);
    p.ellipse(cx - 14.5, 43, 3, 3, SKIN_ST);
    p.line(cx - 15, 20, cx - 14, 56, '#3c6a2c');
    p.line(cx - 16, 20, cx - 15, 56, '#5a8a3c');
    p.poly([[cx - 15, 18], [cx - 21, 14], [cx - 16, 12]], style('#78c050'));
    p.poly([[cx - 15, 22], [cx - 9, 17], [cx - 13, 16]], style('#78c050'));
    p.poly([[cx + 11, 26], [cx + 18, 35], [cx + 12, 43], [cx + 8, 39], [cx + 11, 35]], SKIN_ST);
    // Head.
    const hy = 14;
    p.rect(cx - 3, 20, 6, 5, SKIN_ST);
    p.ellipse(cx, hy, 10, 10.5, SKIN_ST);
    p.ellipse(cx, hy - 7, 11.5, 7, hair);
    p.poly([[cx - 11, hy - 6], [cx + 11, hy - 6], [cx + 9, hy - 1], [cx + 4, hy - 4], [cx - 2, hy - 2], [cx - 7, hy - 4], [cx - 11, hy]], hair);
    // Braid.
    for (let i = 0; i < 5; i++) p.ellipse(cx - 11 + i * 0.5, hy + 6 + i * 4, 3, 2.5, hair);
    p.ellipse(cx - 9, hy + 26, 2, 2, style('#f070a0'));
    // Flower crown.
    for (const [x, col] of [[-9, '#f8f8f8'], [-4, '#f070a0'], [1, '#f8e060'], [6, '#f070a0'], [10, '#f8f8f8']]) {
      p.ellipse(cx + x, hy - 10 + Math.abs(x) * 0.25, 2.2, 2, style(col));
      p.set(cx + x, hy - 10 + Math.abs(x) * 0.25, '#f8d030');
    }
    // Face: calm eyes, freckles, a small smile.
    const f = { o: OUT, w: '#f8f8f8', g: '#3c8a40', m: '#c86060', b: '#f0a8a0', d: '#c89070' };
    p.rows(cx - 6, hy + 1, ['wg', 'gg', 'oo'], f);
    p.rows(cx + 4, hy + 1, ['gw', 'gg', 'oo'], f);
    p.rows(cx - 8, hy + 5, ['d.d'], f);
    p.rows(cx + 5, hy + 5, ['d.d'], f);
    p.rows(cx - 2, hy + 7, ['m..m', '.mm.'], f);
    return p.toCanvas();
  },

  // GYM LEADER NERISSA of SEABREEZE: sea captain's coat and hat, teal hair.
  nerissa() {
    const p = new Painter(64, 64);
    const cx = 32;
    const hair = style('#2a9a9a', { hi: '#60d0c8' });
    const coat = style('#24386a', { hi: '#3c5a98' });
    const gold = style('#f0c848', { shade: '#b88a20' });
    // Long wavy hair behind.
    p.rrect(cx - 14, 8, 28, 34, 10, hair);
    p.poly([[cx - 14, 36], [cx - 18, 44], [cx - 12, 42]], hair);
    p.poly([[cx + 14, 36], [cx + 18, 44], [cx + 12, 42]], hair);
    // Boots and trousers.
    p.rrect(cx - 10, 44, 9, 16, 2, style('#f0ece0'));
    p.rrect(cx + 1, 44, 9, 16, 2, style('#f0ece0'));
    p.rrect(cx - 11, 54, 10, 9, 2, style('#2a2018'));
    p.rrect(cx + 1, 54, 10, 9, 2, style('#2a2018'));
    // Captain's coat with tails, gold buttons and epaulettes.
    p.poly([[cx - 14, 24], [cx + 14, 24], [cx + 17, 54], [cx + 4, 50], [cx, 40], [cx - 4, 50], [cx - 17, 54]], coat);
    p.poly([[cx - 5, 24], [cx + 5, 24], [cx + 2, 36], [cx - 2, 36]], style('#f4f4f4'));
    for (const y of [28, 33, 38]) { p.set(cx - 6, y, '#f0c848'); p.set(cx + 6, y, '#f0c848'); }
    p.rrect(cx - 18, 22, 9, 4, 2, gold);
    p.rrect(cx + 9, 22, 9, 4, 2, gold);
    for (let i = 0; i < 4; i++) { p.set(cx - 17 + i * 2, 26, '#f0c848'); p.set(cx + 10 + i * 2, 26, '#f0c848'); }
    // Right arm on hip; left holds a brass spyglass across the body.
    p.poly([[cx + 14, 25], [cx + 20, 35], [cx + 14, 44], [cx + 10, 40], [cx + 14, 35]], coat);
    p.ellipse(cx + 12, 42, 3, 3, SKIN_ST);
    p.rrect(cx - 19, 26, 7, 14, 3, coat);
    p.rrect(cx - 16, 38, 20, 4, 2, gold);
    p.rect(cx - 17, 37, 3, 6, style('#8a6020'));
    p.ellipse(cx - 13, 41, 3, 3, SKIN_ST);
    // Head.
    const hy = 15;
    p.rect(cx - 3, 21, 6, 5, SKIN_ST);
    p.ellipse(cx, hy, 10, 10.5, SKIN_ST);
    p.poly([[cx - 11, hy - 4], [cx + 11, hy - 4], [cx + 10, hy + 3], [cx + 6, hy - 1], [cx, hy - 2], [cx - 6, hy - 1], [cx - 10, hy + 3]], hair);
    // Tricorn-ish captain's hat with an anchor badge.
    p.poly([[cx - 17, hy - 5], [cx - 10, hy - 16], [cx + 10, hy - 16], [cx + 17, hy - 5], [cx, hy - 7]], style('#1c2a50', { hi: '#34487c' }));
    p.line(cx - 16, hy - 5, cx, hy - 7, '#f0c848');
    p.line(cx, hy - 7, cx + 16, hy - 5, '#f0c848');
    p.ellipse(cx, hy - 12, 3, 3, style('#f4f4f4'));
    p.rows(cx - 1, hy - 14, ['.o.', 'ooo', '.o.', 'o.o'], { o: '#1c2a50' });
    // Face: confident smirk, sea-blue eyes.
    const f = { o: OUT, w: '#f8f8f8', t: '#2878a8', m: '#c05858' };
    p.rows(cx - 6, hy + 1, ['wt', 'tt', 'oo'], f);
    p.rows(cx + 4, hy + 1, ['tw', 'tt', 'oo'], f);
    p.rows(cx - 1, hy + 7, ['.mmm', 'm...'], f);
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
