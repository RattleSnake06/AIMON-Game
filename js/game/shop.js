'use strict';
// AIMON MART and the AIMON CENTRE storage PC.

const Shop = {
  *run(stock = 'archford') {
    this.stock = MART_STOCK[stock];
    let q = 'Hi there! Welcome to the AIMON MART. May I help you?';
    for (;;) {
      const k = yield* Dialog.ask(q, ['BUY', 'SELL', 'SEE YA!'], { cancel: 2, x: 2, y: 2 });
      q = 'Is there anything else I can do for you?';
      if (k === 0) yield* this.buy();
      else if (k === 1) yield* this.sell();
      else break;
    }
    yield* say('Please come again!');
  },

  moneyBox() {
    return {
      draw(g) {
        UI.window(g, 2, 2, 90, 30);
        Font.draw(g, 'MONEY', 10, 6, '#5068a0', '#d0d8e8');
        Font.drawRight(g, UI.money(State.d.money), 84, 18, '#404048', '#d0d0c8');
      },
    };
  },

  *buy() {
    const money = this.moneyBox();
    Game.push(money);
    let index = 0;
    for (;;) {
      const items = [...this.stock.map((id) => ({ id, label: ITEMS[id].name })), { label: 'CANCEL' }];
      const box = Dialog.open('field');
      box.show('What would you like?', { noWait: true, hold: true });
      yield () => box.finished;
      const i = yield* Menu.choose({
        items, x: 96, y: 2, w: 142, index, cancel: items.length - 1, visible: 6,
        drawItem: (g, it, x, y) => {
          Font.draw(g, it.label, x, y, '#404048', '#d0d0c8');
          if (it.id) Font.drawRight(g, UI.money(ITEMS[it.id].price), x + 116, y, '#404048', '#d0d0c8');
        },
        onMove: (j) => {
          const it = items[j];
          box.show(it.id ? ITEMS[it.id].desc : 'What would you like?', { instant: true, hold: true });
        },
      });
      Dialog.close();
      if (i < 0 || i === items.length - 1) break;
      index = i;
      const id = items[i].id;
      const it = ITEMS[id];
      const max = Math.min(99, Math.floor(State.d.money / it.price));
      if (max < 1) {
        yield* say('You don\'t have enough money.');
        continue;
      }
      yield* say(`${it.name}? Certainly.\nHow many would you like?`, { noWait: true, hold: true });
      const n = yield* Menu.quantity(max, it.price);
      if (!n) continue;
      const total = n * it.price;
      if (yield* Dialog.yesNo(`${it.name}, and you want ${n}.\nThat will be ${UI.money(total)}. OK?`)) {
        State.d.money -= total;
        State.addItem(id, n);
        Sound.sfx('save');
        yield* say('Here you are!\nThank you!');
        if (id === 'aimonball' && n >= 10) {
          State.addItem('greatball', 1);
          yield* say('I\'ll throw in a GREAT BALL, too!');
        }
      }
    }
    Dialog.close();
    Game.remove(money);
  },

  *sell() {
    const money = this.moneyBox();
    Game.push(money);
    for (;;) {
      const ids = Object.keys(State.d.bag).filter((id) => State.count(id) > 0 && ITEMS[id].price);
      if (!ids.length) {
        yield* say('You don\'t have anything to sell.');
        break;
      }
      const items = [...ids.map((id) => ({ id, label: ITEMS[id].name })), { label: 'CANCEL' }];
      const i = yield* Menu.choose({
        items, x: 96, y: 2, w: 142, cancel: items.length - 1, visible: 6,
        drawItem: (g, it, x, y) => {
          Font.draw(g, it.label, x, y, '#404048', '#d0d0c8');
          if (it.id) Font.drawRight(g, `×${State.count(it.id)}`, x + 116, y, '#404048', '#d0d0c8');
        },
      });
      if (i < 0 || i === items.length - 1) break;
      const id = items[i].id;
      const it = ITEMS[id];
      const price = Math.floor(it.price / 2);
      yield* say(`${it.name}? How many would you like to sell?`, { noWait: true, hold: true });
      const n = yield* Menu.quantity(State.count(id), price);
      if (!n) continue;
      if (yield* Dialog.yesNo(`I can pay ${UI.money(n * price)}.\nWould that be OK?`)) {
        State.removeItem(id, n);
        State.d.money += n * price;
        Sound.sfx('save');
        yield* say(`Turned over the ${it.name} and received ${UI.money(n * price)}.`);
      }
    }
    Dialog.close();
    Game.remove(money);
  },
};

const Storage = {
  *run() {
    for (;;) {
      const k = yield* Menu.choose({ items: ['WITHDRAW AIMON', 'DEPOSIT AIMON', 'LOG OFF'], x: 2, y: 2, cancel: 2 });
      if (k === 0) yield* this.withdraw();
      else if (k === 1) yield* this.deposit();
      else break;
    }
  },

  *withdraw() {
    const box = State.d.box;
    if (!box.length) {
      yield* say('There are no AIMON stored in the PC.');
      return;
    }
    if (State.party.length >= 6) {
      yield* say('Your party is full!');
      return;
    }
    const items = [...box.map((m) => ({ label: `${m.name}  Lv${m.level}` })), { label: 'CANCEL' }];
    const i = yield* Menu.choose({ items, x: 96, y: 2, w: 142, cancel: items.length - 1, visible: 6 });
    if (i < 0 || i === items.length - 1) return;
    const [mon] = box.splice(i, 1);
    State.party.push(mon);
    Sound.sfx('confirm');
    yield* say(`${mon.name} was withdrawn.`);
  },

  *deposit() {
    if (State.party.length <= 1) {
      yield* say('You can\'t deposit your last AIMON!');
      return;
    }
    const i = yield* Party.open({ mode: 'select', msg: 'Deposit which AIMON?' });
    if (i < 0) return;
    const [mon] = State.party.splice(i, 1);
    mon.heal();
    State.d.box.push(mon);
    Sound.sfx('confirm');
    yield* say(`${mon.name} was stored in the PC.`);
  },
};
