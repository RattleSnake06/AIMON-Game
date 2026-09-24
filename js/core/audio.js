'use strict';
// A tiny GBA-flavoured synth: two pulse channels, a triangle "wave" channel
// and noise, driven by a look-ahead sequencer. Sound effects and creature
// cries are synthesised on the fly, so there are no audio files.

const Sound = {
  ctx: null,
  master: null,
  musicBus: null,
  sfxBus: null,
  muted: false,
  waves: {},
  noiseBuf: null,
  current: null,   // name of the song that should be playing
  seq: null,       // active sequencer state
  timer: null,
  jingleUntil: 0,

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.55;
    this.master.connect(ctx.destination);
    this.musicBus = ctx.createGain();
    this.musicBus.connect(this.master);
    this.sfxBus = ctx.createGain();
    this.sfxBus.connect(this.master);

    for (const [name, duty] of [['p12', 0.125], ['p25', 0.25], ['p50', 0.5]]) {
      this.waves[name] = this.pulseWave(duty);
    }
    const len = ctx.sampleRate;
    this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    this.timer = setInterval(() => this.schedule(), 25);
    if (this.current) this.startSeq(this.current);
  },

  pulseWave(duty) {
    const n = 48;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    for (let k = 1; k < n; k++) {
      real[k] = Math.sin(2 * Math.PI * k * duty) / (k * Math.PI);
      imag[k] = (1 - Math.cos(2 * Math.PI * k * duty)) / (k * Math.PI);
    }
    return this.ctx.createPeriodicWave(real, imag);
  },

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : 0.55, this.ctx.currentTime, 0.02);
    try { localStorage.setItem('aimon_muted', this.muted ? '1' : '0'); } catch (e) { /* ignore */ }
  },

  loadPrefs() {
    try { this.muted = localStorage.getItem('aimon_muted') === '1'; } catch (e) { /* ignore */ }
  },

  // ---- voices -------------------------------------------------------------

  osc(type, freq, t0, dur, vol, bus, opts = {}) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    if (this.waves[type]) o.setPeriodicWave(this.waves[type]);
    else o.type = type === 'tri' ? 'triangle' : type;
    o.frequency.setValueAtTime(freq, t0);
    if (opts.slideTo) o.frequency.exponentialRampToValueAtTime(opts.slideTo, t0 + (opts.slideTime || dur));
    if (opts.vibrato) {
      const lfo = ctx.createOscillator();
      const lg = ctx.createGain();
      lfo.frequency.value = opts.vibrato;
      lg.gain.setValueAtTime(0, t0);
      lg.gain.linearRampToValueAtTime(freq * 0.012, t0 + Math.min(dur, 0.25));
      lfo.connect(lg);
      lg.connect(o.frequency);
      lfo.start(t0);
      lfo.stop(t0 + dur + 0.05);
    }
    const g = ctx.createGain();
    const a = opts.attack ?? 0.004;
    const rel = opts.release ?? 0.03;
    const sus = opts.sustain ?? 0.75;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + a);
    g.gain.linearRampToValueAtTime(vol * sus, t0 + a + Math.min(0.08, dur * 0.4));
    g.gain.setValueAtTime(vol * sus, t0 + Math.max(a, dur - rel));
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(bus);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  },

  noise(t0, dur, vol, bus, opts = {}) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = opts.filter || 'highpass';
    f.frequency.setValueAtTime(opts.freq || 1000, t0);
    if (opts.freqTo) f.frequency.exponentialRampToValueAtTime(opts.freqTo, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f);
    f.connect(g);
    g.connect(bus);
    src.start(t0, Math.random() * 0.5);
    src.stop(t0 + dur + 0.02);
  },

  // ---- music --------------------------------------------------------------

  playMusic(name) {
    if (this.current === name && this.seq) return;
    this.current = name;
    if (this.ctx) this.startSeq(name);
  },

  stopMusic() {
    this.current = null;
    this.seq = null;
  },

  startSeq(name) {
    const song = MUSIC[name];
    if (!song) { this.seq = null; return; }
    const parsed = Music.compile(song);
    this.seq = {
      name,
      song: parsed,
      step: 0,
      next: this.ctx.currentTime + 0.08,
      stepDur: 60 / song.bpm / 4,
    };
  },

  schedule() {
    const s = this.seq;
    if (!s || !this.ctx) return;
    const ahead = this.ctx.currentTime + 0.12;
    while (s.next < ahead) {
      if (this.ctx.currentTime < this.jingleUntil) {
        // Hold the song while a jingle plays over it.
        s.next = this.jingleUntil + 0.05;
        s.step = 0;
        break;
      }
      for (const ch of s.song.channels) {
        const ev = ch.events[s.step];
        if (!ev) continue;
        const dur = ev.len * s.stepDur;
        if (ch.wave === 'noise') this.drum(ev.note, s.next, ch.vol);
        else this.osc(ch.wave, ev.freq, s.next, dur * (ch.gate || 0.92), ch.vol, this.musicBus,
          { vibrato: dur > 0.3 && ch.vib ? 5.5 : 0, sustain: ch.sustain, release: ch.release });
      }
      s.next += s.stepDur;
      s.step++;
      if (s.step >= s.song.length) {
        if (s.song.loop === false) { this.seq = null; return; }
        s.step = s.song.loopStart || 0;
      }
    }
  },

  drum(kind, t, vol) {
    if (kind === 'k') {
      this.osc('sine', 150, t, 0.12, vol * 2.2, this.musicBus, { slideTo: 45, slideTime: 0.1, sustain: 0.3 });
    } else if (kind === 's') {
      this.noise(t, 0.12, vol * 1.1, this.musicBus, { filter: 'bandpass', freq: 1800 });
    } else if (kind === 'h') {
      this.noise(t, 0.04, vol * 0.6, this.musicBus, { freq: 7000 });
    } else if (kind === 'o') {
      this.noise(t, 0.2, vol * 0.5, this.musicBus, { freq: 6000 });
    }
  },

  // A one-shot tune that pauses the background music. Returns its length in
  // frames so scripts can wait for it.
  jingle(name) {
    const song = MUSIC[name];
    if (!song) return 0;
    const parsed = Music.compile(song);
    const stepDur = 60 / song.bpm / 4;
    const total = parsed.length * stepDur;
    if (!this.ctx) return Math.ceil(total * 60);
    const t0 = this.ctx.currentTime + 0.03;
    for (const ch of parsed.channels) {
      ch.events.forEach((ev, i) => {
        if (!ev) return;
        const t = t0 + i * stepDur;
        if (ch.wave === 'noise') this.drum(ev.note, t, ch.vol);
        else this.osc(ch.wave, ev.freq, t, ev.len * stepDur * 0.95, ch.vol, this.sfxBus, { sustain: 0.8 });
      });
    }
    this.jingleUntil = t0 + total;
    if (this.seq) this.seq.next = this.jingleUntil + 0.05;
    return Math.ceil(total * 60) + 6;
  },

  *jingleWait(name) {
    yield this.jingle(name);
  },

  // ---- effects ------------------------------------------------------------

  sfx(name) {
    if (!this.ctx || this.muted) return;
    const fn = SFX[name];
    if (fn) fn(this, this.ctx.currentTime + 0.005, this.sfxBus);
  },

  cry(speciesId, pitch = 1) {
    if (!this.ctx || this.muted) return;
    const fn = CRIES[speciesId];
    if (fn) fn(this, this.ctx.currentTime + 0.01, this.sfxBus, pitch);
  },
};

const SFX = {
  select(S, t, b) { S.osc('p50', 1320, t, 0.035, 0.12, b); },
  confirm(S, t, b) {
    S.osc('p50', 990, t, 0.04, 0.12, b);
    S.osc('p50', 1480, t + 0.04, 0.05, 0.12, b);
  },
  bump(S, t, b) { S.osc('p25', 90, t, 0.07, 0.25, b, { slideTo: 60 }); },
  door(S, t, b) {
    S.noise(t, 0.18, 0.18, b, { filter: 'lowpass', freq: 1800, freqTo: 400 });
    S.osc('p25', 260, t, 0.1, 0.1, b, { slideTo: 180 });
  },
  exit(S, t, b) {
    S.osc('p25', 330, t, 0.06, 0.1, b);
    S.osc('p25', 250, t + 0.06, 0.08, 0.1, b);
  },
  ledge(S, t, b) { S.osc('p50', 300, t, 0.14, 0.14, b, { slideTo: 700, slideTime: 0.12 }); },
  exclaim(S, t, b) {
    S.osc('p25', 880, t, 0.06, 0.14, b);
    S.osc('p25', 1760, t + 0.06, 0.12, 0.14, b);
  },
  encounter(S, t, b) {
    for (let i = 0; i < 6; i++) S.osc('p25', 1200 - i * 120, t + i * 0.05, 0.05, 0.1, b);
  },
  hit(S, t, b) {
    S.noise(t, 0.16, 0.35, b, { filter: 'lowpass', freq: 3000, freqTo: 300 });
    S.osc('p50', 160, t, 0.08, 0.2, b, { slideTo: 60 });
  },
  hitSuper(S, t, b) {
    S.noise(t, 0.26, 0.4, b, { filter: 'lowpass', freq: 5000, freqTo: 200 });
    S.osc('p50', 220, t, 0.14, 0.25, b, { slideTo: 50 });
  },
  hitWeak(S, t, b) { S.noise(t, 0.09, 0.25, b, { filter: 'lowpass', freq: 1500, freqTo: 300 }); },
  faint(S, t, b) { S.osc('p25', 700, t, 0.5, 0.14, b, { slideTo: 80, slideTime: 0.5 }); },
  ballThrow(S, t, b) { S.osc('p12', 300, t, 0.25, 0.1, b, { slideTo: 1400, slideTime: 0.25 }); },
  ballOpen(S, t, b) {
    S.noise(t, 0.2, 0.2, b, { freq: 3000 });
    S.osc('p50', 1600, t, 0.12, 0.1, b, { slideTo: 800 });
  },
  ballShake(S, t, b) {
    S.osc('p50', 420, t, 0.05, 0.14, b);
    S.osc('p50', 380, t + 0.07, 0.05, 0.12, b);
  },
  ballClick(S, t, b) { S.osc('p50', 2200, t, 0.03, 0.14, b); S.noise(t, 0.05, 0.2, b, { freq: 4000 }); },
  statUp(S, t, b) { for (let i = 0; i < 5; i++) S.osc('p50', 600 + i * 150, t + i * 0.05, 0.05, 0.08, b); },
  statDown(S, t, b) { for (let i = 0; i < 5; i++) S.osc('p50', 1200 - i * 150, t + i * 0.05, 0.05, 0.08, b); },
  expTick(S, t, b) { S.osc('p12', 1760, t, 0.02, 0.04, b); },
  flee(S, t, b) { for (let i = 0; i < 3; i++) S.noise(t + i * 0.08, 0.05, 0.15, b, { freq: 2000 }); },
  save(S, t, b) { S.osc('p50', 880, t, 0.08, 0.1, b); S.osc('p50', 1320, t + 0.09, 0.14, 0.1, b); },
  heal(S, t, b) { for (let i = 0; i < 6; i++) S.osc('p25', 880 + (i % 2) * 440, t + i * 0.07, 0.06, 0.08, b); },
  potion(S, t, b) { for (let i = 0; i < 8; i++) S.osc('p50', 700 + i * 90, t + i * 0.04, 0.04, 0.07, b); },
  boot(S, t, b) { S.osc('p25', 523, t, 0.08, 0.1, b); S.osc('p25', 784, t + 0.08, 0.12, 0.1, b); },
  fire(S, t, b) { S.noise(t, 0.4, 0.3, b, { filter: 'lowpass', freq: 900, freqTo: 3000 }); },
  water(S, t, b) {
    for (let i = 0; i < 5; i++) S.osc('sine', 500 + Math.random() * 600, t + i * 0.05, 0.06, 0.12, b, { slideTo: 1400 });
  },
  leaf(S, t, b) {
    S.noise(t, 0.3, 0.15, b, { filter: 'bandpass', freq: 3000, freqTo: 6000 });
    S.osc('p12', 1200, t, 0.1, 0.05, b, { slideTo: 2400 });
  },
  wind(S, t, b) { S.noise(t, 0.45, 0.22, b, { filter: 'bandpass', freq: 600, freqTo: 2400 }); },
  rock(S, t, b) {
    for (let i = 0; i < 3; i++) S.noise(t + i * 0.09, 0.1, 0.3, b, { filter: 'lowpass', freq: 800 });
  },
};

// Each creature gets its own synthesised call.
const CRIES = {
  skylavine(S, t, b, p) {
    S.osc('p25', 1400 * p, t, 0.12, 0.12, b, { slideTo: 2100 * p });
    S.osc('p25', 1700 * p, t + 0.13, 0.18, 0.12, b, { slideTo: 1200 * p, vibrato: 9 });
  },
  archepin(S, t, b, p) {
    S.osc('p50', 330 * p, t, 0.1, 0.13, b, { slideTo: 520 * p });
    S.osc('p50', 440 * p, t + 0.1, 0.25, 0.12, b, { slideTo: 300 * p, vibrato: 7 });
    S.noise(t + 0.05, 0.25, 0.08, b, { filter: 'bandpass', freq: 1200 });
  },
  moltarock(S, t, b, p) {
    S.osc('sawtooth', 110 * p, t, 0.35, 0.12, b, { slideTo: 70 * p, vibrato: 12 });
    S.noise(t, 0.4, 0.2, b, { filter: 'lowpass', freq: 600, freqTo: 1500 });
  },
  goskie(S, t, b, p) {
    S.osc('sawtooth', 300 * p, t, 0.14, 0.12, b, { slideTo: 380 * p });
    S.osc('sawtooth', 320 * p, t + 0.18, 0.22, 0.12, b, { slideTo: 260 * p, vibrato: 14 });
  },
  mellowcap(S, t, b, p) {
    S.osc('p50', 520 * p, t, 0.1, 0.1, b);
    S.osc('p50', 470 * p, t + 0.1, 0.1, 0.1, b);
    S.osc('p50', 560 * p, t + 0.2, 0.2, 0.1, b, { slideTo: 440 * p });
  },
};

// Tracker-style song notation, see js/data/music.js.
const Music = {
  cache: new Map(),
  NOTES: { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 },

  freq(name) {
    const m = /^([A-G])([#b]?)(\d)$/.exec(name);
    if (!m) return 0;
    let n = this.NOTES[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    n += (parseInt(m[3], 10) + 1) * 12;
    return 440 * Math.pow(2, (n - 69) / 12);
  },

  expand(src) {
    // [ ... ]*N repeats a group N times (groups do not nest).
    return src.replace(/\[([^\]]*)\]\*(\d+)/g, (_, body, n) => ` ${body} `.repeat(parseInt(n, 10)));
  },

  compile(song) {
    if (this.cache.has(song)) return this.cache.get(song);
    let length = 0;
    const channels = song.ch.map((ch) => {
      const events = [];
      let pos = 0;
      let len = 2;
      for (const tok of this.expand(ch.notes).trim().split(/\s+/)) {
        if (!tok || tok === '|') continue;
        let [n, d] = tok.split(':');
        if (d) len = parseInt(d, 10);
        if (n !== 'r' && n !== '_') {
          events[pos] = ch.wave === 'noise' ? { note: n, len } : { freq: this.freq(n), len };
        }
        pos += len;
      }
      length = Math.max(length, pos);
      return { ...ch, events, total: pos };
    });
    const out = { channels, length, loop: song.loop, loopStart: song.loopStart };
    this.cache.set(song, out);
    return out;
  },
};
