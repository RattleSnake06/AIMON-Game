'use strict';
// Creature sprites converted from the design sheets (tools/make_sprites.py).
// They're decoded into canvases once, along with white silhouettes used
// when a creature pops out of (or is pulled into) a ball.

const MonSprites = {
  img: {},
  white: {},

  load() {
    const jobs = Object.entries(window.SPRITE_DATA || {}).map(([key, uri]) => new Promise((resolve) => {
      const im = new Image();
      im.onload = () => {
        const c = Pix.canvas(im.width, im.height);
        c.getContext('2d').drawImage(im, 0, 0);
        this.img[key] = c;
        this.white[key] = Pix.silhouette(c, '#ffffff');
        resolve();
      };
      im.onerror = () => resolve();
      im.src = uri;
    }));
    return Promise.all(jobs);
  },

  front(id) { return this.img[`${id}_front`]; },
  back(id) { return this.img[`${id}_back`]; },
  icon(id) { return this.img[`${id}_icon`]; },
  frontWhite(id) { return this.white[`${id}_front`]; },
  backWhite(id) { return this.white[`${id}_back`]; },
};
