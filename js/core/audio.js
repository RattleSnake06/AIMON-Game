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

  // A single bell-like note (CANTOR's bell plates).
  chime(freq) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + 0.005;
    for (const [k, v, d] of [[1, 0.16, 1.2], [2, 0.06, 0.8], [3, 0.03, 0.5]]) {
      this.osc('sine', freq * k, t, d, v, this.sfxBus, { sustain: 0.4, release: d * 0.8 });
    }
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
  zap(S, t, b) {
    for (let i = 0; i < 4; i++) S.osc('sawtooth', 1800 - i * 300, t + i * 0.04, 0.05, 0.08, b, { slideTo: 300 });
    S.noise(t, 0.2, 0.2, b, { freq: 5000 });
  },
  rumble(S, t, b) {
    S.noise(t, 0.9, 0.35, b, { filter: 'lowpass', freq: 220, freqTo: 90 });
    S.osc('sine', 48, t, 0.9, 0.3, b, { slideTo: 38 });
  },
  hum(S, t, b) {
    S.osc('sawtooth', 110, t, 1.2, 0.06, b, { vibrato: 6 });
    S.osc('sawtooth', 116, t, 1.2, 0.05, b);
  },
  // Crystals of ice tinkling and cracking.
  ice(S, t, b) {
    for (let i = 0; i < 6; i++) S.osc('triangle', 2093 + (i % 3) * 523, t + i * 0.045, 0.08, 0.07, b);
    S.noise(t + 0.25, 0.12, 0.12, b, { filter: 'highpass', freq: 5000 });
  },
  // A great bronze bell: a low strike with fading overtones.
  bell(S, t, b) {
    for (const [f, v, d] of [[196, 0.2, 2.4], [392, 0.1, 1.8], [588, 0.07, 1.3], [932, 0.05, 0.9], [1244, 0.03, 0.6]]) {
      S.osc('sine', f, t, d, v, b, { sustain: 0.5, release: d * 0.85 });
    }
  },
  pad(S, t, b) {
    S.osc('p25', 300, t, 0.18, 0.1, b, { slideTo: 1400 });
    S.osc('p12', 600, t + 0.05, 0.16, 0.06, b, { slideTo: 2200 });
  },
  rock(S, t, b) {
    for (let i = 0; i < 3; i++) S.noise(t + i * 0.09, 0.1, 0.3, b, { filter: 'lowpass', freq: 800 });
  },
};

// Each creature gets its own synthesised call.
const CRIES = {
  // Starter evolutions.
  galeaf(S, t, b, p) {
    S.osc('p25', 1200 * p, t, 0.12, 0.12, b, { slideTo: 1900 * p });
    S.osc('p25', 1500 * p, t + 0.13, 0.26, 0.12, b, { slideTo: 1000 * p, vibrato: 14 });
    S.noise(t + 0.1, 0.25, 0.05, b, { filter: 'highpass', freq: 4000 });
  },
  sylvaquila(S, t, b, p) {
    S.osc('p25', 1000 * p, t, 0.14, 0.13, b, { slideTo: 1800 * p });
    S.osc('sawtooth', 1500 * p, t + 0.14, 0.45, 0.09, b, { slideTo: 850 * p, vibrato: 11 });
    S.noise(t + 0.05, 0.55, 0.07, b, { filter: 'bandpass', freq: 2500, freqTo: 800 });
  },
  magmorn(S, t, b, p) {
    S.osc('sawtooth', 150 * p, t, 0.4, 0.13, b, { slideTo: 95 * p, vibrato: 14 });
    S.noise(t, 0.45, 0.2, b, { filter: 'lowpass', freq: 700, freqTo: 1800 });
  },
  calderon(S, t, b, p) {
    S.osc('sawtooth', 95 * p, t, 0.7, 0.15, b, { slideTo: 55 * p, vibrato: 9 });
    S.osc('sawtooth', 190 * p, t + 0.05, 0.6, 0.06, b, { slideTo: 110 * p });
    S.noise(t, 0.75, 0.22, b, { filter: 'lowpass', freq: 400, freqTo: 1400 });
  },
  marshhyn(S, t, b, p) {
    S.osc('p50', 400 * p, t, 0.12, 0.13, b, { slideTo: 640 * p });
    S.osc('p50', 540 * p, t + 0.12, 0.3, 0.12, b, { slideTo: 360 * p, vibrato: 8 });
    S.noise(t + 0.05, 0.3, 0.08, b, { filter: 'bandpass', freq: 1400 });
  },
  maelwyrm(S, t, b, p) {
    S.osc('triangle', 300 * p, t, 0.2, 0.16, b, { slideTo: 520 * p });
    S.osc('sawtooth', 500 * p, t + 0.18, 0.55, 0.09, b, { slideTo: 240 * p, vibrato: 6 });
    S.noise(t + 0.1, 0.6, 0.1, b, { filter: 'bandpass', freq: 900, freqTo: 500 });
  },
  // Chapter 6.
  skylark(S, t, b, p) {
    S.osc('p12', 2000 * p, t, 0.06, 0.1, b, { slideTo: 2600 * p });
    S.osc('p12', 2200 * p, t + 0.08, 0.08, 0.1, b, { slideTo: 1800 * p });
    S.osc('p12', 2100 * p, t + 0.18, 0.1, 0.1, b, { slideTo: 2700 * p });
  },
  skyblade(S, t, b, p) {
    S.osc('p25', 1600 * p, t, 0.1, 0.11, b, { slideTo: 2400 * p });
    S.osc('p25', 2000 * p, t + 0.11, 0.22, 0.11, b, { slideTo: 1400 * p, vibrato: 12 });
  },
  aerialis(S, t, b, p) {
    S.osc('sawtooth', 900 * p, t, 0.15, 0.1, b, { slideTo: 1600 * p });
    S.osc('p25', 1500 * p, t + 0.15, 0.4, 0.11, b, { slideTo: 900 * p, vibrato: 10 });
    S.noise(t + 0.1, 0.45, 0.05, b, { filter: 'highpass', freq: 3500 });
  },
  aquabug(S, t, b, p) {
    S.osc('p50', 700 * p, t, 0.05, 0.1, b);
    S.osc('p50', 900 * p, t + 0.07, 0.05, 0.1, b);
    S.osc('p50', 800 * p, t + 0.14, 0.1, 0.1, b, { slideTo: 1100 * p });
    S.noise(t, 0.25, 0.07, b, { filter: 'bandpass', freq: 1500 });
  },
  riverclaw(S, t, b, p) {
    for (let i = 0; i < 3; i++) S.noise(t + i * 0.06, 0.04, 0.12, b, { filter: 'bandpass', freq: 3000 });
    S.osc('p25', 520 * p, t + 0.18, 0.2, 0.12, b, { slideTo: 340 * p });
  },
  tidecrusher(S, t, b, p) {
    S.osc('sawtooth', 180 * p, t, 0.45, 0.13, b, { slideTo: 115 * p, vibrato: 7 });
    S.noise(t, 0.45, 0.12, b, { filter: 'bandpass', freq: 900 });
    S.osc('p12', 1250 * p, t + 0.3, 0.2, 0.06, b);
  },
  // Chapter 7.
  sandbloom(S, t, b, p) {
    S.osc('p25', 600 * p, t, 0.1, 0.12, b, { slideTo: 900 * p });
    S.osc('p25', 800 * p, t + 0.11, 0.16, 0.12, b, { slideTo: 500 * p });
    S.noise(t, 0.3, 0.06, b, { filter: 'highpass', freq: 5000 });
  },
  dunewalker(S, t, b, p) {
    S.osc('sawtooth', 250 * p, t, 0.35, 0.13, b, { slideTo: 175 * p, vibrato: 6 });
    S.noise(t, 0.35, 0.14, b, { filter: 'lowpass', freq: 800 });
  },
  dunarch(S, t, b, p) {
    S.osc('sawtooth', 140 * p, t, 0.55, 0.14, b, { slideTo: 90 * p, vibrato: 8 });
    S.osc('p25', 280 * p, t + 0.05, 0.4, 0.05, b, { slideTo: 200 * p });
    S.noise(t, 0.55, 0.16, b, { filter: 'bandpass', freq: 600, freqTo: 300 });
  },
  embertail(S, t, b, p) {
    S.osc('p25', 900 * p, t, 0.08, 0.12, b, { slideTo: 1300 * p });
    S.osc('sawtooth', 700 * p, t + 0.09, 0.22, 0.09, b, { slideTo: 400 * p });
    S.noise(t, 0.3, 0.08, b, { freq: 4000 });
  },
  cindrake(S, t, b, p) {
    S.osc('sawtooth', 300 * p, t, 0.15, 0.12, b, { slideTo: 500 * p });
    S.osc('sawtooth', 450 * p, t + 0.15, 0.45, 0.12, b, { slideTo: 200 * p, vibrato: 12 });
    S.noise(t, 0.6, 0.14, b, { filter: 'lowpass', freq: 1500 });
  },
  distortail(S, t, b, p) {
    S.osc('p12', 800 * p, t, 0.1, 0.11, b, { slideTo: 1600 * p });
    S.osc('sawtooth', 1200 * p, t + 0.1, 0.22, 0.09, b, { slideTo: 600 * p, vibrato: 30 });
  },
  distortionix(S, t, b, p) {
    S.osc('sawtooth', 400 * p, t, 0.12, 0.11, b, { slideTo: 900 * p });
    S.osc('sawtooth', 850 * p, t + 0.12, 0.45, 0.11, b, { slideTo: 300 * p, vibrato: 40 });
    S.osc('p12', 1600 * p, t + 0.12, 0.45, 0.05, b, { slideTo: 800 * p, vibrato: 37 });
    S.noise(t + 0.1, 0.45, 0.08, b, { filter: 'bandpass', freq: 2000 });
  },
  specterib(S, t, b, p) {
    S.osc('triangle', 900 * p, t, 0.3, 0.13, b, { slideTo: 1400 * p, vibrato: 12 });
    S.osc('triangle', 1300 * p, t + 0.3, 0.4, 0.11, b, { slideTo: 700 * p, vibrato: 10 });
  },
  phantasmuse(S, t, b, p) {
    S.osc('triangle', 660 * p, t, 0.14, 0.12, b, { vibrato: 7 });
    S.osc('triangle', 880 * p, t + 0.13, 0.14, 0.12, b, { vibrato: 7 });
    S.osc('triangle', 1100 * p, t + 0.26, 0.14, 0.12, b, { vibrato: 7 });
    S.osc('triangle', 1320 * p, t + 0.4, 0.5, 0.12, b, { slideTo: 990 * p, vibrato: 9 });
  },
  // Chapter 8.
  moozle(S, t, b, p) {
    S.osc('sawtooth', 180 * p, t, 0.5, 0.12, b, { slideTo: 150 * p, vibrato: 4 });
    S.osc('p50', 360 * p, t, 0.5, 0.06, b, { slideTo: 300 * p });
  },
  bovelle(S, t, b, p) {
    S.osc('sawtooth', 140 * p, t, 0.6, 0.13, b, { slideTo: 110 * p, vibrato: 4 });
    S.osc('p50', 280 * p, t, 0.6, 0.06, b, { slideTo: 220 * p });
    S.osc('triangle', 1760 * p, t + 0.45, 0.35, 0.08, b);
  },
  windling(S, t, b, p) {
    S.osc('p12', 1400 * p, t, 0.08, 0.1, b, { slideTo: 2000 * p });
    S.osc('p25', 1800 * p, t + 0.09, 0.16, 0.1, b, { slideTo: 1500 * p, vibrato: 30 });
    S.noise(t, 0.25, 0.07, b, { freq: 6000 });
  },
  zephyron(S, t, b, p) {
    S.osc('sawtooth', 700 * p, t, 0.15, 0.11, b, { slideTo: 1400 * p });
    S.osc('p25', 1300 * p, t + 0.15, 0.4, 0.11, b, { slideTo: 700 * p, vibrato: 25 });
    S.noise(t, 0.6, 0.1, b, { filter: 'highpass', freq: 3000 });
  },
  // Chapter 9.
  bellpup(S, t, b, p) {
    S.osc('triangle', 1320 * p, t, 0.08, 0.14, b);
    S.osc('triangle', 1760 * p, t + 0.09, 0.25, 0.14, b, { vibrato: 5 });
  },
  bellchime(S, t, b, p) {
    S.osc('triangle', 988 * p, t, 0.1, 0.14, b);
    S.osc('triangle', 1319 * p, t + 0.1, 0.1, 0.14, b);
    S.osc('triangle', 1568 * p, t + 0.2, 0.35, 0.14, b, { vibrato: 4 });
  },
  bellumor(S, t, b, p) {
    S.osc('triangle', 523 * p, t, 0.6, 0.13, b);
    S.osc('triangle', 659 * p, t + 0.15, 0.55, 0.12, b);
    S.osc('triangle', 784 * p, t + 0.3, 0.6, 0.12, b, { vibrato: 4 });
    S.osc('p12', 1568 * p, t + 0.3, 0.5, 0.03, b);
  },
  glacron(S, t, b, p) {
    S.osc('sawtooth', 200 * p, t, 0.15, 0.13, b, { slideTo: 300 * p });
    S.osc('sawtooth', 280 * p, t + 0.15, 0.4, 0.13, b, { slideTo: 160 * p, vibrato: 10 });
    S.noise(t, 0.5, 0.1, b, { filter: 'lowpass', freq: 900 });
  },
  noctheryx(S, t, b, p) {
    S.osc('p50', 600 * p, t, 0.18, 0.12, b, { slideTo: 500 * p });
    S.osc('p50', 520 * p, t + 0.28, 0.3, 0.12, b, { slideTo: 420 * p, vibrato: 5 });
  },
  // Chapter 10.
  volcarn(S, t, b, p) {
    S.osc('sawtooth', 160 * p, t, 0.12, 0.13, b, { slideTo: 240 * p });
    S.osc('sawtooth', 220 * p, t + 0.12, 0.3, 0.13, b, { slideTo: 130 * p, vibrato: 10 });
    S.noise(t, 0.4, 0.14, b, { filter: 'lowpass', freq: 900 });
  },
  pyroclast(S, t, b, p) {
    S.osc('sawtooth', 100 * p, t, 0.65, 0.15, b, { slideTo: 65 * p, vibrato: 10 });
    S.noise(t, 0.65, 0.2, b, { filter: 'lowpass', freq: 500, freqTo: 1800 });
    S.noise(t + 0.2, 0.3, 0.06, b, { freq: 5000 });
  },
  // Chapters 11-15: new evolutions, the ICE lines and the legendaries.
  gandergale(S, t, b, p) {
    S.osc('p25', 330 * p, t, 0.12, 0.14, b, { slideTo: 440 * p });
    S.osc('p25', 440 * p, t + 0.14, 0.4, 0.14, b, { slideTo: 300 * p, vibrato: 8 });
    S.noise(t + 0.1, 0.4, 0.06, b, { filter: 'bandpass', freq: 1800 });
  },
  hexwraith(S, t, b, p) {
    S.osc('triangle', 700 * p, t, 0.6, 0.13, b, { slideTo: 240 * p, vibrato: 7 });
    S.osc('p12', 1400 * p, t + 0.2, 0.4, 0.04, b, { slideTo: 700 * p });
    S.noise(t + 0.1, 0.6, 0.05, b, { filter: 'highpass', freq: 3500 });
  },
  thundervix(S, t, b, p) {
    S.osc('sawtooth', 600 * p, t, 0.1, 0.12, b, { slideTo: 1100 * p });
    S.osc('sawtooth', 1000 * p, t + 0.1, 0.35, 0.12, b, { slideTo: 450 * p, vibrato: 16 });
    S.noise(t, 0.4, 0.12, b, { freq: 6000 });
  },
  brawlpaw(S, t, b, p) {
    S.osc('sawtooth', 300 * p, t, 0.08, 0.14, b, { slideTo: 520 * p });
    S.osc('sawtooth', 480 * p, t + 0.1, 0.3, 0.14, b, { slideTo: 220 * p, vibrato: 12 });
    S.noise(t + 0.08, 0.2, 0.1, b, { filter: 'lowpass', freq: 1500 });
  },
  quakepike(S, t, b, p) {
    S.osc('sawtooth', 120 * p, t, 0.6, 0.15, b, { slideTo: 70 * p, vibrato: 8 });
    S.noise(t, 0.6, 0.2, b, { filter: 'lowpass', freq: 400, freqTo: 1200 });
  },
  chillpip(S, t, b, p) {
    S.osc('p25', 1100 * p, t, 0.07, 0.12, b, { slideTo: 1500 * p });
    S.osc('p25', 1300 * p, t + 0.09, 0.14, 0.12, b, { slideTo: 1000 * p });
  },
  emperice(S, t, b, p) {
    S.osc('p25', 520 * p, t, 0.14, 0.14, b, { slideTo: 700 * p });
    S.osc('p25', 660 * p, t + 0.15, 0.4, 0.14, b, { slideTo: 440 * p, vibrato: 6 });
    S.osc('triangle', 2093 * p, t + 0.1, 0.3, 0.04, b);
  },
  frostfawn(S, t, b, p) {
    S.osc('triangle', 1400 * p, t, 0.1, 0.13, b, { slideTo: 1800 * p });
    S.osc('triangle', 1700 * p, t + 0.12, 0.25, 0.13, b, { slideTo: 1200 * p, vibrato: 6 });
  },
  crystag(S, t, b, p) {
    S.osc('triangle', 880 * p, t, 0.2, 0.13, b, { slideTo: 1320 * p });
    S.osc('triangle', 1320 * p, t + 0.2, 0.55, 0.13, b, { slideTo: 660 * p, vibrato: 5 });
    S.osc('triangle', 2637 * p, t + 0.3, 0.4, 0.04, b);
  },
  frostling(S, t, b, p) {
    S.osc('p50', 260 * p, t, 0.18, 0.13, b, { slideTo: 200 * p });
    S.noise(t + 0.05, 0.2, 0.08, b, { filter: 'highpass', freq: 4000 });
  },
  glaciolem(S, t, b, p) {
    S.osc('sawtooth', 140 * p, t, 0.55, 0.14, b, { slideTo: 90 * p, vibrato: 6 });
    S.noise(t + 0.1, 0.5, 0.12, b, { filter: 'bandpass', freq: 3000, freqTo: 800 });
  },
  snowkit(S, t, b, p) {
    S.osc('p12', 1500 * p, t, 0.08, 0.1, b, { slideTo: 2000 * p });
    S.osc('p12', 1800 * p, t + 0.1, 0.18, 0.1, b, { slideTo: 1400 * p, vibrato: 10 });
  },
  blizzara(S, t, b, p) {
    S.osc('p25', 1000 * p, t, 0.15, 0.12, b, { slideTo: 1500 * p });
    S.osc('p25', 1400 * p, t + 0.15, 0.45, 0.12, b, { slideTo: 800 * p, vibrato: 9 });
    S.noise(t, 0.6, 0.07, b, { filter: 'bandpass', freq: 800, freqTo: 3000 });
  },
  cygnata(S, t, b, p) {
    S.osc('sawtooth', 220 * p, t, 0.5, 0.08, b, { vibrato: 5 });
    S.osc('sawtooth', 330 * p, t + 0.25, 0.5, 0.08, b, { vibrato: 5 });
    S.osc('p25', 880 * p, t + 0.4, 0.35, 0.1, b, { slideTo: 660 * p });
  },
  fernewt(S, t, b, p) {
    S.osc('p50', 900 * p, t, 0.08, 0.11, b, { slideTo: 1200 * p });
    S.osc('p50', 1100 * p, t + 0.1, 0.16, 0.11, b, { slideTo: 900 * p });
  },
  floraxol(S, t, b, p) {
    S.osc('p50', 500 * p, t, 0.15, 0.13, b, { slideTo: 700 * p });
    S.osc('p50', 650 * p, t + 0.16, 0.4, 0.13, b, { slideTo: 420 * p, vibrato: 5 });
    S.noise(t + 0.2, 0.3, 0.05, b, { filter: 'bandpass', freq: 1200 });
  },
  mudbarbel(S, t, b, p) {
    S.osc('p50', 180 * p, t, 0.2, 0.14, b, { slideTo: 260 * p });
    S.osc('p50', 240 * p, t + 0.22, 0.3, 0.14, b, { slideTo: 150 * p, vibrato: 7 });
  },
  gloamfern(S, t, b, p) {
    S.osc('triangle', 600 * p, t, 0.7, 0.12, b, { slideTo: 900 * p, vibrato: 4 });
    S.noise(t + 0.2, 0.5, 0.04, b, { filter: 'bandpass', freq: 2000 });
  },
  cometcub(S, t, b, p) {
    S.osc('p25', 500 * p, t, 0.1, 0.13, b, { slideTo: 800 * p });
    S.osc('p25', 750 * p, t + 0.12, 0.2, 0.13, b, { slideTo: 500 * p });
    S.osc('triangle', 2400 * p, t + 0.05, 0.1, 0.04, b);
  },
  meteorwolf(S, t, b, p) {
    S.osc('sawtooth', 220 * p, t, 0.15, 0.14, b, { slideTo: 400 * p });
    S.osc('sawtooth', 380 * p, t + 0.15, 0.6, 0.14, b, { slideTo: 190 * p, vibrato: 12 });
    S.noise(t + 0.1, 0.5, 0.1, b, { filter: 'lowpass', freq: 1400 });
  },
  abysslure(S, t, b, p) {
    S.osc('sawtooth', 90 * p, t, 0.6, 0.14, b, { slideTo: 60 * p, vibrato: 4 });
    S.osc('triangle', 1800 * p, t + 0.3, 0.3, 0.04, b, { slideTo: 2400 * p });
  },
  briarlet(S, t, b, p) {
    S.osc('p25', 800 * p, t, 0.1, 0.12, b, { slideTo: 600 * p });
    S.noise(t + 0.08, 0.15, 0.08, b, { filter: 'bandpass', freq: 3000 });
  },
  briarwild(S, t, b, p) {
    S.osc('sawtooth', 350 * p, t, 0.12, 0.13, b, { slideTo: 550 * p });
    S.osc('sawtooth', 500 * p, t + 0.12, 0.4, 0.13, b, { slideTo: 260 * p, vibrato: 10 });
    S.noise(t + 0.1, 0.35, 0.08, b, { filter: 'bandpass', freq: 2500 });
  },
  pebbeat(S, t, b, p) {
    for (let i = 0; i < 3; i++) S.noise(t + i * 0.1, 0.05, 0.14, b, { filter: 'lowpass', freq: 1200 });
    S.osc('p50', 400 * p, t + 0.3, 0.12, 0.1, b);
  },
  riffstone(S, t, b, p) {
    S.osc('sawtooth', 196 * p, t, 0.15, 0.1, b);
    S.osc('sawtooth', 294 * p, t + 0.15, 0.15, 0.1, b);
    S.osc('sawtooth', 262 * p, t + 0.3, 0.35, 0.1, b, { vibrato: 8 });
  },
  ampolith(S, t, b, p) {
    S.osc('sawtooth', 98 * p, t, 0.7, 0.13, b, { vibrato: 6 });
    S.osc('sawtooth', 147 * p, t, 0.7, 0.1, b, { vibrato: 6 });
    S.noise(t, 0.7, 0.16, b, { filter: 'lowpass', freq: 600, freqTo: 2000 });
  },
  elegira(S, t, b, p) {
    for (const [f, d] of [[523, 0], [659, 0.18], [784, 0.36], [1047, 0.54]]) S.osc('triangle', f * p, t + d, 0.9 - d, 0.1, b, { vibrato: 5 });
    S.noise(t + 0.3, 0.8, 0.04, b, { filter: 'highpass', freq: 4000 });
  },
  astralyx(S, t, b, p) {
    S.osc('sawtooth', 160 * p, t, 0.2, 0.14, b, { slideTo: 320 * p });
    S.osc('sawtooth', 300 * p, t + 0.2, 0.8, 0.14, b, { slideTo: 110 * p, vibrato: 14 });
    for (let i = 0; i < 4; i++) S.osc('triangle', (2000 + i * 400) * p, t + 0.3 + i * 0.08, 0.08, 0.04, b);
  },
  rykarn(S, t, b, p) {
    S.osc('sawtooth', 250 * p, t, 0.1, 0.13, b, { slideTo: 450 * p });
    S.osc('sawtooth', 420 * p, t + 0.1, 0.5, 0.14, b, { slideTo: 150 * p, vibrato: 18 });
    S.noise(t + 0.05, 0.5, 0.14, b, { filter: 'bandpass', freq: 1200 });
  },
  geodillo(S, t, b, p) {
    S.osc('p25', 200 * p, t, 0.22, 0.14, b, { slideTo: 140 * p });
    S.noise(t + 0.05, 0.25, 0.09, b, { filter: 'bandpass', freq: 2400 });
    S.osc('p12', 900 * p, t + 0.18, 0.12, 0.07, b, { slideTo: 1400 * p });
  },
  hourghast(S, t, b, p) {
    S.osc('triangle', 520 * p, t, 0.5, 0.14, b, { slideTo: 260 * p, vibrato: 6 });
    S.noise(t + 0.1, 0.45, 0.05, b, { filter: 'highpass', freq: 3000 });
  },
  noctumoth(S, t, b, p) {
    S.osc('p12', 1300 * p, t, 0.3, 0.09, b, { slideTo: 900 * p, vibrato: 22 });
    S.noise(t, 0.3, 0.06, b, { filter: 'bandpass', freq: 700, freqTo: 1200 });
  },
  mosstodon(S, t, b, p) {
    S.osc('p50', 300 * p, t, 0.12, 0.14, b, { slideTo: 520 * p });
    S.osc('p50', 520 * p, t + 0.12, 0.35, 0.14, b, { slideTo: 250 * p, vibrato: 5 });
  },
  prismanta(S, t, b, p) {
    S.osc('triangle', 1200 * p, t, 0.3, 0.12, b, { slideTo: 1500 * p });
    S.osc('triangle', 1800 * p, t + 0.08, 0.35, 0.08, b, { slideTo: 1350 * p, vibrato: 9 });
  },
  cairnling(S, t, b, p) {
    for (let i = 0; i < 3; i++) S.noise(t + i * 0.07, 0.05, 0.14, b, { filter: 'bandpass', freq: 1400 - i * 300 });
    S.osc('p25', 420 * p, t + 0.2, 0.12, 0.1, b, { slideTo: 560 * p });
  },
  obelith(S, t, b, p) {
    S.osc('triangle', 120 * p, t, 0.7, 0.2, b, { slideTo: 95 * p, vibrato: 3 });
    S.osc('p12', 240 * p, t + 0.05, 0.6, 0.06, b, { slideTo: 190 * p });
    S.noise(t, 0.3, 0.07, b, { filter: 'lowpass', freq: 500 });
  },
  tidepup(S, t, b, p) {
    S.osc('p50', 700 * p, t, 0.08, 0.11, b, { slideTo: 950 * p });
    S.osc('p50', 900 * p, t + 0.1, 0.16, 0.11, b, { slideTo: 650 * p, vibrato: 8 });
  },
  tidefin(S, t, b, p) {
    S.osc('p25', 520 * p, t, 0.12, 0.12, b, { slideTo: 880 * p });
    S.osc('p50', 760 * p, t + 0.12, 0.3, 0.12, b, { slideTo: 420 * p, vibrato: 10 });
    S.noise(t + 0.1, 0.3, 0.07, b, { filter: 'bandpass', freq: 900 });
  },
  reefwhirl(S, t, b, p) {
    S.osc('triangle', 600 * p, t, 0.3, 0.14, b, { slideTo: 380 * p, vibrato: 14 });
    S.noise(t, 0.3, 0.05, b, { filter: 'bandpass', freq: 1500 });
  },
  reeflord(S, t, b, p) {
    S.osc('triangle', 300 * p, t, 0.45, 0.15, b, { slideTo: 200 * p, vibrato: 10 });
    S.osc('p12', 900 * p, t + 0.1, 0.3, 0.06, b, { slideTo: 600 * p, vibrato: 16 });
  },
  skydrift(S, t, b, p) {
    S.osc('p25', 1200 * p, t, 0.1, 0.1, b, { slideTo: 1600 * p });
    S.osc('p25', 1500 * p, t + 0.12, 0.2, 0.1, b, { slideTo: 1100 * p, vibrato: 6 });
  },
  skyseraph(S, t, b, p) {
    S.osc('p25', 800 * p, t, 0.15, 0.12, b, { slideTo: 1400 * p });
    S.osc('p50', 1300 * p, t + 0.15, 0.4, 0.11, b, { slideTo: 900 * p, vibrato: 7 });
    S.noise(t + 0.1, 0.4, 0.05, b, { filter: 'highpass', freq: 3000 });
  },
  wraithling(S, t, b, p) {
    S.osc('triangle', 500 * p, t, 0.45, 0.14, b, { slideTo: 260 * p, vibrato: 18 });
    S.osc('p12', 1000 * p, t + 0.05, 0.4, 0.04, b, { slideTo: 520 * p, vibrato: 18 });
  },
  umbrafang(S, t, b, p) {
    S.osc('sawtooth', 160 * p, t, 0.18, 0.13, b, { slideTo: 240 * p });
    S.osc('sawtooth', 240 * p, t + 0.18, 0.4, 0.13, b, { slideTo: 110 * p, vibrato: 9 });
    S.noise(t + 0.15, 0.35, 0.1, b, { filter: 'lowpass', freq: 900 });
  },
  flambramble(S, t, b, p) {
    S.osc('sawtooth', 300 * p, t, 0.12, 0.11, b, { slideTo: 520 * p });
    S.osc('p25', 480 * p, t + 0.12, 0.3, 0.1, b, { slideTo: 260 * p, vibrato: 12 });
    S.noise(t, 0.4, 0.14, b, { filter: 'lowpass', freq: 800, freqTo: 2000 });
  },
  voltimp(S, t, b, p) {
    S.osc('p12', 1600 * p, t, 0.05, 0.1, b);
    S.osc('p25', 1200 * p, t + 0.07, 0.15, 0.1, b, { slideTo: 2000 * p, vibrato: 25 });
    S.noise(t + 0.05, 0.12, 0.1, b, { freq: 5000 });
  },
  stormgale(S, t, b, p) {
    S.osc('sawtooth', 400 * p, t, 0.15, 0.12, b, { slideTo: 900 * p });
    S.osc('sawtooth', 800 * p, t + 0.15, 0.4, 0.1, b, { slideTo: 300 * p, vibrato: 22 });
    S.noise(t + 0.1, 0.45, 0.16, b, { freq: 3000 });
  },
  tuner(S, t, b, p) {
    S.osc('p50', 880 * p, t, 0.08, 0.1, b);
    S.osc('p50', 1320 * p, t + 0.09, 0.08, 0.1, b);
    S.osc('p50', 1760 * p, t + 0.18, 0.18, 0.1, b, { vibrato: 6 });
  },
  sonarion(S, t, b, p) {
    S.osc('p50', 660 * p, t, 0.1, 0.11, b);
    S.osc('p50', 990 * p, t + 0.1, 0.1, 0.11, b);
    S.osc('p25', 1320 * p, t + 0.2, 0.4, 0.11, b, { slideTo: 880 * p, vibrato: 8 });
    S.osc('p12', 1980 * p, t + 0.2, 0.4, 0.04, b, { slideTo: 1320 * p, vibrato: 8 });
  },
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
  voltvix(S, t, b, p) {
    S.osc('p25', 900 * p, t, 0.08, 0.12, b, { slideTo: 1500 * p });
    S.osc('sawtooth', 1200 * p, t + 0.09, 0.2, 0.08, b, { slideTo: 500 * p, vibrato: 20 });
    S.noise(t + 0.05, 0.2, 0.12, b, { freq: 4000 });
  },
  terrapike(S, t, b, p) {
    S.osc('sawtooth', 90 * p, t, 0.4, 0.13, b, { slideTo: 60 * p, vibrato: 8 });
    S.noise(t, 0.35, 0.18, b, { filter: 'lowpass', freq: 500 });
  },
  scrapaw(S, t, b, p) {
    S.osc('p25', 400 * p, t, 0.08, 0.12, b, { slideTo: 700 * p });
    S.osc('p25', 650 * p, t + 0.1, 0.18, 0.12, b, { slideTo: 300 * p });
  },
  dapplekit(S, t, b, p) {
    S.osc('p50', 1100 * p, t, 0.06, 0.1, b);
    S.osc('p50', 1300 * p, t + 0.08, 0.06, 0.1, b);
    S.osc('p50', 1200 * p, t + 0.16, 0.12, 0.1, b, { slideTo: 900 * p });
  },
  nibblit(S, t, b, p) {
    S.osc('p12', 1800 * p, t, 0.05, 0.1, b);
    S.osc('p12', 2000 * p, t + 0.07, 0.05, 0.1, b);
    S.osc('p12', 1600 * p, t + 0.14, 0.1, 0.1, b, { slideTo: 2200 * p });
  },
  ruffang(S, t, b, p) {
    S.osc('sawtooth', 220 * p, t, 0.12, 0.12, b, { slideTo: 330 * p });
    S.osc('sawtooth', 330 * p, t + 0.14, 0.35, 0.12, b, { slideTo: 200 * p, vibrato: 10 });
  },
  leafgrub(S, t, b, p) {
    S.osc('p50', 700 * p, t, 0.1, 0.09, b, { vibrato: 18 });
    S.osc('p50', 600 * p, t + 0.12, 0.14, 0.09, b, { slideTo: 800 * p });
  },
  bambuck(S, t, b, p) {
    S.osc('triangle', 500 * p, t, 0.14, 0.18, b, { slideTo: 700 * p });
    S.osc('p25', 700 * p, t + 0.15, 0.25, 0.1, b, { slideTo: 450 * p, vibrato: 6 });
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
