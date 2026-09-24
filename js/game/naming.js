'use strict';
// Name entry: pick letters from the grid, or just type on a keyboard.

const NAME_ROWS = ['ABCDEFGHI', 'JKLMNOPQR', 'STUVWXYZ-', 'abcdefghi', 'jklmnopqr', 'stuvwxyz.'];

const Naming = {
  *run(o) {
    const max = o.max || 7;
    const s = { opaque: true, name: o.initial || '', col: 0, row: 0, done: false };
    Input.textMode = true;
    Input.clear();

    const add = (ch) => {
      if (s.name.length >= max) {
        Sound.sfx('bump');
        return;
      }
      s.name += ch;
      Sound.sfx('select');
      if (s.name.length >= max) { s.col = 9; s.row = 4; }
    };
    const del = () => {
      if (!s.name.length) return;
      s.name = s.name.slice(0, -1);
      Sound.sfx('select');
    };
    const confirm = () => {
      if (!s.name.trim()) {
        Sound.sfx('bump');
        return;
      }
      Sound.sfx('confirm');
      s.done = true;
    };

    s.update = () => {
      for (const ch of Input.typed.splice(0)) {
        if (/^[A-Za-z0-9.\-']$/.test(ch)) add(ch);
      }
      if (Input.repeat('left')) { s.col = (s.col + 9) % 10; Sound.sfx('select'); }
      if (Input.repeat('right')) { s.col = (s.col + 1) % 10; Sound.sfx('select'); }
      if (Input.repeat('up')) { s.row = (s.row + 5) % 6; Sound.sfx('select'); }
      if (Input.repeat('down')) { s.row = (s.row + 1) % 6; Sound.sfx('select'); }
      if (Input.pressed('a')) {
        if (s.col < 9) add(NAME_ROWS[s.row][s.col]);
        else if (s.row < 3) del();
        else confirm();
      }
      if (Input.pressed('b')) del();
      if (Input.pressed('start')) {
        if (s.name.length) confirm();
        else { s.col = 9; s.row = 4; }
      }
    };

    s.draw = (g) => {
      UI.stripes(g, '#5878c0', '#6888d0');
      UI.window(g, 4, 4, 232, 40);
      if (o.species) g.drawImage(MonSprites.icon(o.species), 8, 8);
      else g.drawImage(Chars.frame(o.person || 'player', 'down', [0, 1, 0, 2][Math.floor(Game.frame / 12) % 4]), 16, 14);
      Font.draw(g, o.title || 'YOUR NAME?', 48, 10, '#5068a0', '#d0d8e8');
      for (let i = 0; i < max; i++) {
        const x = 48 + i * 10;
        const ch = s.name[i];
        if (ch) Font.draw(g, ch, x, 25, '#404048', '#d0d0c8');
        const blink = i === s.name.length && Math.floor(Game.frame / 16) % 2;
        g.fillStyle = blink ? '#f8a830' : '#8890a8';
        g.fillRect(x, 35, 7, 1);
      }

      UI.window(g, 4, 48, 232, 108);
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 9; c++) {
          const x = 16 + c * 18;
          const y = 54 + r * 15;
          if (r === s.row && c === s.col) {
            g.fillStyle = '#f8d880';
            g.fillRect(x - 4, y - 3, 15, 14);
          }
          Font.draw(g, NAME_ROWS[r][c], x, y, '#404048', '#d0d0c8');
        }
      }
      const btn = (label, y, on) => {
        g.fillStyle = on ? '#f8a830' : '#384058';
        g.fillRect(180, y, 50, 40);
        g.fillStyle = on ? '#f8d880' : '#e8ecf8';
        g.fillRect(182, y + 2, 46, 36);
        Font.drawCenter(g, label, 205, y + 15, '#404048', '#d0d0c8');
      };
      btn('DEL', 56, s.col === 9 && s.row < 3);
      btn('OK', 104, s.col === 9 && s.row >= 3);
      Font.drawCenter(g, 'Type a name, or pick letters', 94, 143, '#8890a8', null);
    };

    Game.push(s);
    yield () => s.done;
    Game.remove(s);
    Input.textMode = false;
    Input.clear();
    return s.name.trim();
  },
};
