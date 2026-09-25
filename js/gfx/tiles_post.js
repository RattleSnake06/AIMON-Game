'use strict';
// After the story: the BATTLE TOWER on the LEAGUE island, a glint to mark
// where MORROW once stood, the lighthouse ghost's lamp, and the player's
// three BATTLE TOWER outfits.

Object.assign(BUILDINGS, {
  battleTower: { w: 5, h: 7, door: 2, draw: 'battleTowerImg' },
});

Object.assign(WALL_THEMES, {
  tower: { wall: '#3a4058', lo: '#323850', dk: '#1a1e2c', rim: '#e8c060', hi: '#4c5470', base: '#2a3044', baseDk: '#141824' },
});

Object.assign(Tiles, {
  battleTowerImg(spec) {
    const W = spec.w * 16;
    const H = spec.h * 16;
    const p = new Painter(W, H);
    const cx = W / 2;
    const steel = { fill: '#5a6480', shade: '#454e68', hi: '#7a86a4', line: '#141824' };
    const gold = { fill: '#e8c060', shade: '#b89030', hi: '#f8e8a0', line: '#3a2810' };
    // Base, shaft and crown.
    p.rect(2, H - 30, W - 5, 29, steel);
    p.poly([[10, H - 30], [16, 22], [W - 17, 22], [W - 11, H - 30]], steel);
    p.rect(12, 14, W - 25, 9, gold);
    p.poly([[cx - 10, 14], [cx, 1], [cx + 10, 14]], gold);
    p.ellipse(cx, 18, 3, 3, { fill: '#e04848', line: '#3a1010', hi: '#f8a0a0' });
    // Windows up the shaft.
    for (const wy of [30, 44, 58, 72]) p.rect(cx - 3, wy, 6, 7, { fill: '#a8e0f8', line: '#141824', hi: '#e8f8ff' });
    // The great door.
    p.rrect(cx - 9, H - 26, 18, 25, 6, { fill: '#2a2230', line: '#0c0810', hi: '#4a3c50' });
    const c = p.toCanvas();
    const g = c.getContext('2d');
    g.fillStyle = '#e8c060';
    g.fillRect(cx - 1, H - 22, 2, 18);
    // Banners.
    for (const bx of [6, W - 11]) {
      g.fillStyle = '#c83838';
      g.fillRect(bx, H - 28, 5, 14);
      g.fillStyle = '#e8c060';
      g.fillRect(bx + 1, H - 24, 3, 3);
    }
    return c;
  },
});

// A soft glint where something was left behind.
Object.assign(Props, {
  glint(f) {
    const c = Pix.canvas(16, 16);
    const g = c.getContext('2d');
    const k = [0.3, 0.7, 1, 0.7][f];
    g.globalAlpha = k;
    g.fillStyle = '#f8e8a0';
    g.fillRect(7, 3 + (f % 2), 2, 9);
    g.fillRect(3, 7 + (f % 2), 10, 2);
    g.fillStyle = '#ffffff';
    g.fillRect(7, 7 + (f % 2), 2, 2);
    g.globalAlpha = 1;
    return c;
  },
});
{
  const baseImage = Props.image;
  Props.image = function image(name, frame) {
    if (name !== 'glint') return baseImage.call(this, name, frame);
    const f = Math.floor(frame / 12) % 4;
    const key = `glint${f}`;
    if (!this.cache[key]) this.cache[key] = this.glint(f);
    return this.cache[key];
  };
}

// The BATTLE TOWER outfits. Same clothes, new colours; a TEAM DISTORTION
// cloak; and the CONDUCTOR's long coat.
Object.assign(PEOPLE, {
  player_alt: { head: 'cap', body: 'tee', pal: { a: '#303040', A: '#1c1c28', h: '#403030', H: '#281c1c', c: '#f0c040', C: '#b88a20', p: '#303040', P: '#1c1c28', k: '#f0c040' } },
  player_cloak: { head: 'hood', body: 'coat', pal: { h: '#383848', H: '#202028', v: '#a060e8', V: '#e0c0ff', c: '#303040', C: '#1c1c28', w: '#2a2438', W: '#1a1624', p: '#1c1a24', P: '#100e16', k: '#8050c0' } },
  player_conductor: { head: 'cap', body: 'coat', pal: { a: '#141418', A: '#6a2cb0', h: '#403030', H: '#281c1c', c: '#f4f4f8', C: '#6a2cb0', w: '#141418', W: '#0a0a0c', p: '#1c1c24', P: '#0c0c10', k: '#0c0c10' } },
});
