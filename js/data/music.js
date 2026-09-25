'use strict';
// Original chiptune soundtrack.
// Notes: NAME+OCTAVE:length in 16th-note steps; the length carries over to
// following notes. r = rest. [ ... ]*N repeats. Drums: k kick, s snare,
// h hat, o open hat. Waves: p12/p25/p50 pulse, tri, noise.

const DRUM_ROCK = '[k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2]*8';

const MUSIC = {
  title: {
    bpm: 120,
    ch: [
      { wave: 'p25', vol: 0.1, vib: true, notes:
        'G4:2 C5 E5 G5:6 E5:2 G5 | A5:6 G5:2 E5:4 C5 | F5:4 A5:2 C6:6 A5:2 F5 | G5:6 A5:2 B5:4 D6 |'
        + ' C6:6 B5:2 G5:4 E5 | B5:6 G5:2 E5:4 G5 | A5:4 C6 B5 D6 | C6:12 r:4' },
      { wave: 'p12', vol: 0.05, notes: 'E4:8 G4 | E4 A4 | F4 A4 | D4 B4 | E4 G4 | E4 G4 | F4 G4 | E4:16' },
      { wave: 'tri', vol: 0.16, notes:
        '[C3:2 C3 G2 C3]*2 [A2:2 A2 E3 A2]*2 [F2:2 F2 C3 F2]*2 [G2:2 G2 D3 G2]*2'
        + ' [C3:2 C3 G2 C3]*2 [E2:2 E2 B2 E2]*2 F2:2 F2 C3 F2 G2 G2 D3 G2 C3:2 G2 C3 E3 C3:8' },
      { wave: 'noise', vol: 0.05, notes: '[k:4 h:2 h:2 s:4 h:2 k:2]*8' },
    ],
  },

  intro: {
    bpm: 92,
    ch: [
      { wave: 'p50', vol: 0.08, vib: true, notes:
        'A4:4 C5 F5:6 E5:2 | G5:6 E5:2 C5:8 | D5:4 F5 A5:6 G5:2 | F5:6 D5:2 Bb4:8 |'
        + ' A4:4 C5 F5 A5 | G5:6 A5:2 E5:8 | D5:4 F5 E5 G5 | F5:12 r:4' },
      { wave: 'p12', vol: 0.045, notes:
        '[F4:2 A4 C5 A4]*2 [E4:2 G4 C5 G4]*2 [D4:2 F4 A4 F4]*2 [D4:2 F4 Bb4 F4]*2'
        + ' [F4:2 A4 C5 A4]*2 [E4:2 G4 C5 G4]*2 D4:2 F4 Bb4 F4 E4 G4 C5 G4 F4:2 A4 C5 A4 F4:8' },
      { wave: 'tri', vol: 0.15, notes: 'F2:8 C3 | C3 G2 | D3 A2 | Bb2 F2 | F2 C3 | C3 G2 | Bb2 C3 | F2:16' },
    ],
  },

  town: {
    bpm: 104,
    ch: [
      { wave: 'p25', vol: 0.09, vib: true, notes:
        'B4:4 D5:2 G5:4 F#5:2 E5 D5 | E5:6 D5:2 B4:4 G4 | C5:4 E5:2 G5:4 A5:2 G5 E5 | F#5:6 E5:2 D5:8 |'
        + ' B4:4 D5:2 G5:4 A5:2 B5:4 | G5:4 E5 B4 E5 | C5:4 A4 D5 F#5 | G5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes: 'G4:8 B4 | G4 B4 | E4 G4 | F#4 A4 | G4 B4 | E4 G4 | E4 F#4 | D4 B3' },
      { wave: 'tri', vol: 0.15, notes:
        'G2:4 D3 G3 D3 | E2 B2 E3 B2 | C3 G2 C3 G2 | D3 A2 D3 F#2 | G2 D3 G3 D3 | E2 B2 E3 B2 | A2 E3 D3 A2 | G2 D3 G2:8' },
      { wave: 'noise', vol: 0.035, notes: '[k:4 h:4 s:4 h:4]*8' },
    ],
  },

  route: {
    bpm: 132,
    ch: [
      { wave: 'p25', vol: 0.09, vib: true, notes:
        'A4:2 D5 F#5 A5:6 F#5:2 D5 | E5:2 C#5 A4 E5:6 C#5:2 E5 | F#5:4 D5:2 B4 F#5:4 E5:2 D5 | D5:4 B4:2 G4 B4:4 D5 |'
        + ' A4:2 D5 F#5 A5:6 B5:2 A5 | G5:4 E5:2 C#5 E5:4 A5 | G5:4 F#5:2 E5 A5:4 G5:2 E5 | D5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes: 'F#4:8 A4 | E4 C#5 | D4 F#4 | D4 G4 | F#4 A4 | E4 A4 | D4 E4 | F#4:16' },
      { wave: 'tri', vol: 0.15, notes:
        '[D3:2 D3 A2 D3]*2 [A2:2 A2 E3 A2]*2 [B2:2 B2 F#3 B2]*2 [G2:2 G2 D3 G2]*2'
        + ' [D3:2 D3 A2 D3]*2 [A2:2 A2 E3 A2]*2 G2:2 G2 D3 G2 A2 A2 E3 A2 D3:2 A2 D3 F#3 D3:8' },
      { wave: 'noise', vol: 0.045, notes: DRUM_ROCK },
    ],
  },

  city: {
    bpm: 112,
    ch: [
      { wave: 'p25', vol: 0.09, vib: true, notes:
        'C5:2 F5 A5:4 G5:2 F5 C5:4 | D5:4 F5:2 A5 G5:6 F5:2 | Bb4:2 D5 F5:4 Bb5 A5:2 G5 | G5:6 E5:2 C5:8 |'
        + ' C5:2 F5 A5:4 C6 A5:2 F5 | E5:4 A5 C6:2 B5 A5:4 | Bb5:4 A5:2 G5 C6:4 Bb5:2 G5 | F5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes: 'A4:8 C5 | F4 A4 | D4 F4 | E4 G4 | A4 C5 | C4 E4 | D4 E4 | F4:16' },
      { wave: 'tri', vol: 0.15, notes:
        'F2:4 C3 F3 C3 | D2 A2 D3 A2 | Bb2 F3 Bb2 F3 | C3 G2 C3 G2 | F2 C3 F3 C3 | A2 E3 A2 E3 | Bb2 F3 C3 G2 | F2 C3 F2:8' },
      { wave: 'noise', vol: 0.04, notes: '[k:4 h:2 h:2 s:4 h:2 h:2]*8' },
    ],
  },

  home: {
    bpm: 96,
    ch: [
      { wave: 'p50', vol: 0.07, vib: true, notes:
        'E5:4 G5 C6 G5 | A5:6 G5:2 E5:8 | F5:4 A5 C6 A5 | G5:6 F5:2 D5:8 | E5:4 G5 C6 D6 | C6 A5 E5 A5 | F5 A5 G5 B5 | C6:12 r:4' },
      { wave: 'p12', vol: 0.04, notes:
        '[C4:2 E4 G4 E4]*2 [A3:2 C4 E4 C4]*2 [F3:2 A3 C4 A3]*2 [G3:2 B3 D4 B3]*2'
        + ' [C4:2 E4 G4 E4]*2 [A3:2 C4 E4 C4]*2 F3:2 A3 C4 A3 G3 B3 D4 B3 C4:2 E4 G4 E4 C4:8' },
      { wave: 'tri', vol: 0.14, notes: 'C3:8 G2 | A2 E3 | F2 C3 | G2 D3 | C3 G2 | A2 E3 | F2 G2 | C3:16' },
    ],
  },

  lab: {
    bpm: 108,
    ch: [
      { wave: 'p25', vol: 0.085, vib: true, notes:
        'A4:2 C5 E5:4 D5:2 C5 B4:4 | A4:2 C5 F5:4 E5:2 D5 C5:4 | E5:2 G5 C6:4 B5:2 A5 G5:4 | D5:6 G5:2 B4:8 |'
        + ' A4:2 C5 E5:4 A5 G5:2 E5 | F5:4 A5 G5:2 F5 E5:4 | D5:4 F5 E5:2 G#5 B5:4 | A5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes: 'C4:8 E4 | C4 F4 | E4 G4 | D4 G4 | C4 E4 | C4 F4 | D4 E4 | C4:16' },
      { wave: 'tri', vol: 0.15, notes:
        'A2:4 E3 A2 E3 | F2 C3 F2 C3 | C3 G2 C3 G2 | G2 D3 G2 D3 | A2 E3 A2 E3 | F2 C3 F2 C3 | D3 A2 E2 B2 | A2:8 A2' },
      { wave: 'noise', vol: 0.03, notes: '[h:4 h:4 s:4 h:4]*8' },
    ],
  },

  centre: {
    bpm: 112,
    ch: [
      { wave: 'p50', vol: 0.075, notes:
        'G5:2 E5 C5 E5 G5:4 C6 | A5:2 F5 C5 F5 A5:4 C6 | B5:2 G5 D5 G5 B5:4 D6 | C6:8 G5 |'
        + ' G5:2 E5 C5 E5 G5:4 E5 | A5:4 E5 C5 E5 | F5:4 A5 G5 B5 | C6:12 r:4' },
      { wave: 'p12', vol: 0.04, notes:
        '[r:2 E4:2]*4 [r:2 F4:2]*4 [r:2 D4:2]*4 [r:2 E4:2]*4 [r:2 E4:2]*4 [r:2 C4:2]*4 r:2 F4:2 r:2 F4 r:2 D4 r:2 D4 [r:2 E4:2]*4' },
      { wave: 'tri', vol: 0.14, notes:
        'C3:4 G2 C3 G2 | F2 C3 F2 C3 | G2 D3 G2 D3 | C3 G2 C3:8 | C3:4 G2 C3 G2 | A2 E3 A2 E3 | D3 A2 G2 D3 | C3:8 C3' },
      { wave: 'noise', vol: 0.03, notes: '[k:4 s:4]*16' },
    ],
  },

  battle: {
    bpm: 150,
    loopStart: 32,
    ch: [
      { wave: 'p25', vol: 0.09, notes:
        'B5:1 A#5 A5 G#5 G5 F#5 F5 E5 D#5 D5 C#5 C5 B4 A#4 A4 G#4 E4:2 r E4 r E4 r D#4 r |'
        + ' E5:4 G5:2 B5:4 A5:2 G5 F#5 | E5:4 C5:2 E5:4 G5:2 A5:4 | F#5:4 D5:2 F#5:4 A5:2 G5 F#5 | D#5:6 F#5:2 B5:8 |'
        + ' E5:4 G5:2 B5:4 E6:2 D6 B5 | C6:4 B5:2 G5:4 E5:2 G5:4 | A5:4 C6 B5 D#5 | E5:8 r:4 B4:4' },
      { wave: 'p12', vol: 0.045, notes:
        'r:16 B3:2 r B3 r B3 r A#3 r |'
        + ' [B4:2 G4:2]*4 [G4:2 E4:2]*4 [A4:2 F#4:2]*4 [F#4:2 D#4:2]*4'
        + ' [B4:2 G4:2]*4 [G4:2 E4:2]*4 [A4:2 E4:2]*2 [F#4:2 D#4:2]*2 [B4:2 G4:2]*4' },
      { wave: 'tri', vol: 0.16, notes:
        'E2:4 E2 E2 E2 E2:2 r E2 r E2 r D#2 r |'
        + ' [E2:2 E3]*4 [C2:2 C3]*4 [D2:2 D3]*4 [B1:2 B2]*4 [E2:2 E3]*4 [C2:2 C3]*4 [A1:2 A2]*2 [B1:2 B2]*2 [E2:2 E3]*4' },
      { wave: 'noise', vol: 0.05, notes: 'k:4 k k k s:2 s s s s:1 s s s s:4 ' + DRUM_ROCK },
    ],
  },

  trainer: {
    bpm: 156,
    loopStart: 32,
    ch: [
      { wave: 'p25', vol: 0.09, notes:
        'A5:1 E5 C5 A4 A5 E5 C5 A4 A5 E5 C5 A4 G#5 E5 B4 G#4 A4:4 r:2 A4 r A4 G#4:4 |'
        + ' A5:2 A5 E5 A5:4 C6:2 B5 A5 | F5:4 A5:2 C6:4 A5:2 F5:4 | G5:2 G5 D5 G5:4 B5:2 A5 G5 | G#5:6 B5:2 E6:8 |'
        + ' A5:2 A5 E5 A5:4 C6:2 D6 E6 | F6:4 E6:2 C6:4 A5:2 C6:4 | D6:4 A5 B5 G#5 | A5:8 E5:4 A4' },
      { wave: 'p12', vol: 0.045, notes:
        'r:16 E4:2 r E4 r E4 r E4:4 |'
        + ' [C5:2 E4:2]*4 [C5:2 F4:2]*4 [B4:2 D4:2]*4 [B4:2 E4:2]*4'
        + ' [C5:2 E4:2]*4 [C5:2 F4:2]*4 [A4:2 D4:2]*2 [G#4:2 E4:2]*2 [C5:2 E4:2]*4' },
      { wave: 'tri', vol: 0.16, notes:
        'A2:4 A2 A2 G#2 A2:2 r A2 r A2 r E2:4 |'
        + ' [A2:2 A3]*4 [F2:2 F3]*4 [G2:2 G3]*4 [E2:2 E3]*4 [A2:2 A3]*4 [F2:2 F3]*4 [D2:2 D3]*2 [E2:2 E3]*2 [A2:2 A3]*4' },
      { wave: 'noise', vol: 0.05, notes: 'k:2 h k h k h s:1 s s s s:4 k:2 k s:4 k:2 s:2 ' + DRUM_ROCK },
    ],
  },

  victory: {
    bpm: 132,
    ch: [
      { wave: 'p25', vol: 0.09, vib: true, notes:
        'C5:2 E5 G5 C6:6 B5:2 C6 | A5:4 F5:2 A5 C6:8 | B5:2 G5 D5 G5 B5:4 D6 | C6:12 r:4 |'
        + ' A5:2 C6 E6:4 D6:2 C6 A5:4 | F5:2 A5 C6:4 A5:2 G5 F5:4 | G5:4 B5 D6 F6 | E6:4 D6:2 B5 C6:8' },
      { wave: 'p12', vol: 0.04, notes: 'E4:8 G4 | F4 A4 | D4 G4 | E4:16 | C4:8 E4 | C4 F4 | D4 G4 | E4:16' },
      { wave: 'tri', vol: 0.15, notes:
        'C3:4 G2 C3 E3 | F2 C3 F3 C3 | G2 D3 G3 D3 | C3 G2 C3:8 | A2:4 E3 A3 E3 | F2 C3 F3 C3 | G2 B2 D3 G2 | C3 G2 C3:8' },
      { wave: 'noise', vol: 0.04, notes: '[k:4 h:4 s:4 h:4]*8' },
    ],
  },

  // One-shot jingles.
  heal: {
    bpm: 120, loop: false,
    ch: [
      { wave: 'p50', vol: 0.1, notes: 'C5:2 E5 G5 C6:4 G5:2 C6:6' },
      { wave: 'p12', vol: 0.05, notes: 'E4:2 G4 C5 E5:4 D5:2 E5:6' },
      { wave: 'tri', vol: 0.15, notes: 'C3:4 G3:4 C4:10' },
    ],
  },
  levelup: {
    bpm: 150, loop: false,
    ch: [
      { wave: 'p50', vol: 0.1, notes: 'E5:2 G5 C6 E6:6' },
      { wave: 'p12', vol: 0.05, notes: 'C5:2 E5 G5 C6:6' },
      { wave: 'tri', vol: 0.15, notes: 'C3:12' },
    ],
  },
  item: {
    bpm: 140, loop: false,
    ch: [
      { wave: 'p50', vol: 0.1, notes: 'G5:2 G5 G5 A5:4 B5:2 C6:8' },
      { wave: 'p12', vol: 0.05, notes: 'E5:2 E5 E5 F5:4 G5:2 E5:8' },
      { wave: 'tri', vol: 0.15, notes: 'C3:6 F3:4 G3:2 C3:8' },
    ],
  },
  obtain: {
    bpm: 132, loop: false,
    ch: [
      { wave: 'p50', vol: 0.1, notes: 'C5:2 C5 C5 C5:4 G#4 A#4 C5:2 r A#4:2 C5:8' },
      { wave: 'p12', vol: 0.05, notes: 'G4:2 G4 G4 G4:4 D#4 F4 G4:2 r F4:2 G4:8' },
      { wave: 'tri', vol: 0.15, notes: 'C3:12 G#2:4 A#2:4 C3:12' },
    ],
  },
  caught: {
    bpm: 140, loop: false,
    ch: [
      { wave: 'p50', vol: 0.1, notes: 'C5:2 E5 G5 C6 B5 G5 E5 G5 C6:8' },
      { wave: 'p12', vol: 0.05, notes: 'E4:2 G4 C5 E5 D5 B4 G4 B4 E5:8' },
      { wave: 'tri', vol: 0.15, notes: 'C3:8 G2:8 C3:8' },
    ],
  },
  cave: {
    bpm: 80,
    ch: [
      { wave: 'p12', vol: 0.07, vib: true, notes: 'D5:6 F5:2 E5:8 | D5:4 C5:4 Bb4:8 | G4:6 Bb4:2 A4:8 | C#5:8 E5:8 | D5:6 F5:2 A5:8 | G5:4 F5:4 D5:8 | Bb4:4 D5:4 C#5:4 E5:4 | D5:12 r:4' },
      { wave: 'p12', vol: 0.03, notes: 'r:3 D5:6 F5:2 E5:8 | D5:4 C5:4 Bb4:8 | G4:6 Bb4:2 A4:8 | C#5:8 E5:8 | D5:6 F5:2 A5:8 | G5:4 F5:4 D5:8 | Bb4:4 D5:4 C#5:4 E5:4 | D5:12 r:1' },
      { wave: 'tri', vol: 0.16, notes: 'D2:8 A2 | Bb1 F2 | G1 D2 | A1 E2 | D2 A2 | Bb1 F2 | G1 A1 | D2:16' },
      { wave: 'noise', vol: 0.02, notes: '[r:12 h:4]*8' },
    ],
  },

  distortion: {
    bpm: 162,
    loopStart: 16,
    ch: [
      { wave: 'p25', vol: 0.09, notes:
        'E5:1 F5 E5 F5 E5 F5 E5 F5 B4:2 r A#4 r |'
        + ' E5:2 E5 G5 E5 F5:4 E5:2 D5 | C5:2 C5 F5 C5 E5:4 D5:2 C5 | B4:2 E5 G5 B5 A#5:4 G5:2 F5 | E5:8 F5:4 E5 |'
        + ' G5:2 G5 E5 C5 D5:4 E5:2 G5 | F#5:4 D#5 B4:8 | E5:2 G5 B5 E6 F6:4 E6 | E6:8 B5:4 G5' },
      { wave: 'p12', vol: 0.045, notes:
        'r:16 [B4:2 G4:2]*4 [C5:2 A4:2]*4 [B4:2 G4:2]*4 [C5:2 A4:2]*4 [G4:2 E4:2]*4 [F#4:2 D#4:2]*4 [B4:2 G4:2]*2 [C5:2 A4:2]*2 [B4:2 G4:2]*4' },
      { wave: 'tri', vol: 0.17, notes:
        'E2:2 E2 E2 E2 F2 F2 F2 F2 [E2:2 E3]*4 [F2:2 F3]*4 [E2:2 E3]*4 [F2:2 F3]*4 [C2:2 C3]*4 [B1:2 B2]*4 [E2:2 E3]*2 [F2:2 F3]*2 [E2:2 E3]*4' },
      { wave: 'noise', vol: 0.05, notes: 'k:2 k k k s:1 s s s s:2 s:1 s ' + DRUM_ROCK },
    ],
  },

  gym: {
    bpm: 124,
    ch: [
      { wave: 'p25', vol: 0.09, vib: true, notes:
        'C5:2 C5 G5:4 E5:2 C5 G4:4 | B4:2 D5 G5:4 F5:2 D5 B4:4 | A4:2 C5 E5:4 A5 G5:2 E5 | F5:6 E5:2 D5:4 C5 |'
        + ' C5:2 E5 G5:4 C6 B5:2 A5 | G5:6 F5:2 D5:8 | F5:4 A5 G5 B5 | C6:12 r:4' },
      { wave: 'p12', vol: 0.04, notes: 'E4:8 G4 | D4 G4 | C4 E4 | A4 F4 | E4 G4 | B3 D4 | A4 B4 | E4:16' },
      { wave: 'tri', vol: 0.15, notes:
        '[C3:2 G2]*4 [G2:2 D3]*4 [A2:2 E3]*4 [F2:2 C3]*4 [C3:2 G2]*4 [G2:2 D3]*4 [F2:2 C3]*2 [G2:2 D3]*2 C3:4 G2 C3:8' },
      { wave: 'noise', vol: 0.04, notes: '[k:4 h:2 h:2 s:4 h:2 h:2]*8' },
    ],
  },

  leader: {
    bpm: 168,
    loopStart: 32,
    ch: [
      { wave: 'p25', vol: 0.095, notes:
        'A5:2 r A5 r G5 A5:6 | E5:2 r E5 r D5 E5:6 |'
        + ' A5:4 C6:2 B5 A5:4 E5 | F5:4 A5:2 C6 D6:4 C6 | E6:4 D6:2 C6 G5:4 C6 | B5:6 A5:2 G5:8 |'
        + ' A5:2 B5 C6 E6 D6:4 C6:2 B5 | A5:4 C6 F6 E6:2 D6 | D6:4 F6 E6 G#5 | A5:8 E5:4 A4' },
      { wave: 'p12', vol: 0.045, notes:
        'E4:16 B3:16 [E5:2 C5:2]*4 [C5:2 A4:2]*4 [E5:2 G4:2]*4 [D5:2 B4:2]*4 [E5:2 C5:2]*4 [C5:2 A4:2]*4 [A4:2 F4:2]*2 [G#4:2 E4:2]*2 [E5:2 C5:2]*4' },
      { wave: 'tri', vol: 0.17, notes:
        'A2:2 r A2 r G2 A2:6 E2:2 r E2 r D2 E2:6'
        + ' [A2:2 A3]*4 [F2:2 F3]*4 [C3:2 C4]*4 [G2:2 G3]*4 [A2:2 A3]*4 [F2:2 F3]*4 [D2:2 D3]*2 [E2:2 E3]*2 [A2:2 A3]*4' },
      { wave: 'noise', vol: 0.055, notes: '[k:4 s:4]*4 ' + DRUM_ROCK },
    ],
  },

  grayhaven: {
    bpm: 100,
    ch: [
      { wave: 'p25', vol: 0.085, vib: true, notes:
        'D5:4 F5 Bb5:6 A5:2 | G5:6 F5:2 D5:8 | Eb5:4 G5 Bb5 G5 | F5:6 G5:2 A5:8 |'
        + ' Bb5:4 A5:2 G5 F5:4 D5 | G5:4 Bb4 D5:8 | Eb5:4 C5 F5 A4 | Bb4:12 r:4' },
      { wave: 'p12', vol: 0.04, notes:
        '[Bb3:2 D4 F4 D4]*2 [G3:2 Bb3 D4 Bb3]*2 [Eb4:2 G4 Bb4 G4]*2 [F3:2 A3 C4 A3]*2'
        + ' [Bb3:2 D4 F4 D4]*2 [G3:2 Bb3 D4 Bb3]*2 C4:2 Eb4 G4 Eb4 F3 A3 C4 A3 Bb3:2 D4 F4 D4 Bb3:8' },
      { wave: 'tri', vol: 0.15, notes: 'Bb2:8 F2 | G2 D2 | Eb2 Bb2 | F2 C3 | Bb2 F2 | G2 D2 | C3 F2 | Bb1:16' },
      { wave: 'noise', vol: 0.03, notes: '[k:4 h:4 s:4 h:4]*8' },
    ],
  },

  route3: {
    bpm: 128,
    ch: [
      { wave: 'p50', vol: 0.075, vib: true, notes:
        'G5:2 B5 D6:4 B5:2 A5 G5:4 | F#5:2 A5 D6:4 C6:2 B5 A5:4 | E5:2 G5 B5:4 A5:2 G5 E5:4 | C5:4 E5 G5:6 F#5:2 |'
        + ' G5:2 B5 D6:4 E6 D6:2 B5 | A5:6 B5:2 F#5:8 | E5:4 G5 F#5 A5 | G5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes: 'B4:8 D5 | A4 F#4 | G4 B4 | E4 G4 | B4 D5 | F#4 A4 | E4 F#4 | G4:16' },
      { wave: 'tri', vol: 0.15, notes:
        '[G2:2 D3]*4 [D3:2 A2]*4 [E2:2 B2]*4 [C3:2 G2]*4 [G2:2 D3]*4 [D3:2 A2]*4 [C3:2 G2]*2 [D3:2 A2]*2 G2:4 D3 G2:8' },
      { wave: 'noise', vol: 0.04, notes: '[k:2 h:2 s:2 h:2]*16' },
    ],
  },

  // --- Chapter 3 -------------------------------------------------------------
  route5: {
    bpm: 126,
    ch: [
      { wave: 'p25', vol: 0.085, vib: true, notes:
        'D5:2 G5 B5:4 A5:2 G5 E5:4 | F#5:2 A5 D6:4 C6:2 B5 A5:4 | B5:2 G5 E5:4 G5:2 A5 B5:4 | A5:6 G5:2 E5:8 |'
        + ' D5:2 G5 B5:4 D6:2 C6 B5:4 | C6:2 A5 F#5:4 A5:2 G5 E5:4 | F#5:4 A5 D6 C6 | B5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes: 'B4:8 D5 | A4 F#4 | G4 E4 | C5 B4 | B4 D5 | A4 C5 | D5 F#4 | G4:16' },
      { wave: 'tri', vol: 0.15, notes:
        '[G2:2 D3]*4 [D3:2 A2]*4 [E2:2 B2]*4 [C3:2 G2]*4 [G2:2 D3]*4 [A2:2 E3]*4 [D3:2 A2]*4 G2:4 D3 G2:8' },
      { wave: 'noise', vol: 0.04, notes: '[k:4 h:4 s:4 h:4]*8' },
    ],
  },

  forest: {
    bpm: 88,
    ch: [
      { wave: 'p12', vol: 0.07, vib: true, notes:
        'E5:6 G5:2 F#5:8 | D5:6 E5:2 B4:8 | C5:4 E5 G5 F#5 | E5:12 r:4 | G5:6 A5:2 B5:8 | A5:4 G5 F#5 D5 | E5:6 F#5:2 G5:4 F#5 | E5:12 r:4' },
      { wave: 'p12', vol: 0.028, notes:
        'r:3 E5:6 G5:2 F#5:8 | D5:6 E5:2 B4:8 | C5:4 E5 G5 F#5 | E5:12 r:4 | G5:6 A5:2 B5:8 | A5:4 G5 F#5 D5 | E5:6 F#5:2 G5:4 F#5 | E5:12 r:1' },
      { wave: 'tri', vol: 0.15, notes: 'E2:8 B2 | D2 A2 | C2 G2 | B1 E2 | E2 B2 | D2 A2 | C2 B1 | E2:16' },
      { wave: 'noise', vol: 0.02, notes: '[r:12 h:4]*8' },
    ],
  },

  cedarwood: {
    bpm: 96,
    ch: [
      { wave: 'p50', vol: 0.075, vib: true, notes:
        'A4:4 C5 F5:6 E5:2 | D5:4 F5 A5:8 | G5:4 E5 C5 E5 | F5:12 r:4 | A5:4 G5 F5:6 D5:2 | C5:4 D5 F5:8 | G5:4 A5 G5 E5 | F5:12 r:4' },
      { wave: 'p12', vol: 0.035, notes:
        '[F4:2 A4 C5 A4]*2 [D4:2 F4 A4 F4]*2 [C4:2 E4 G4 E4]*2 [F4:2 A4 C5 A4]*2'
        + ' [Bb3:2 D4 F4 D4]*2 [F4:2 A4 C5 A4]*2 [C4:2 E4 G4 E4]*2 [F4:2 A4 C5 A4]*2' },
      { wave: 'tri', vol: 0.14, notes: 'F2:8 C3 | D2 A2 | C2 G2 | F2 C3 | Bb1 F2 | F2 C3 | C2 G2 | F2:16' },
      { wave: 'noise', vol: 0.025, notes: '[k:8 h:8]*8' },
    ],
  },

  hideout: {
    bpm: 140,
    ch: [
      { wave: 'p25', vol: 0.08, notes:
        'D5:2 r D5 F5 E5:4 C5 | D5:2 r D5 A5 G5:4 F5 | E5:2 r E5 G5 F5:4 D5 | C#5:8 A4 |'
        + ' D5:2 r D5 F5 E5:4 C5 | D5:2 F5 A5 D6 C6:4 A5 | Bb5:4 G5 A5 C#5 | D5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes:
        '[D4:2 A4]*4 [D4:2 A4]*4 [C4:2 G4]*4 [A3:2 E4]*4 [D4:2 A4]*4 [F4:2 D5]*4 [G4:2 D5]*2 [A4:2 E5]*2 [D4:2 A4]*4' },
      { wave: 'tri', vol: 0.16, notes:
        '[D2:2 D3]*4 [D2:2 D3]*4 [C2:2 C3]*4 [A1:2 A2]*4 [D2:2 D3]*4 [F2:2 F3]*4 [G2:2 G3]*2 [A2:2 A3]*2 [D2:2 D3]*4' },
      { wave: 'noise', vol: 0.045, notes: '[k:2 h:2 s:2 h:2]*16' },
    ],
  },

  route4: {
    bpm: 120,
    ch: [
      { wave: 'p25', vol: 0.085, vib: true, notes:
        'A4:2 C5 E5:4 D5:2 C5 B4:4 | C5:2 E5 A5:4 G5:2 E5 D5:4 | F5:4 E5:2 D5 C5:4 B4 | A4:12 r:4 |'
        + ' E5:2 G5 C6:4 B5:2 A5 G5:4 | F5:2 A5 D6:4 C6:2 B5 A5:4 | G#5:4 B5 E5 G#5 | A5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes: 'E4:8 A4 | E4 G4 | F4 D4 | E4:16 | C4:8 E4 | D4 F4 | E4 G#4 | A4:16' },
      { wave: 'tri', vol: 0.15, notes:
        '[A2:2 E3]*4 [A2:2 E3]*4 [F2:2 C3]*4 [E2:2 B2]*4 [C3:2 G2]*4 [D3:2 A2]*4 [E2:2 B2]*4 A2:4 E3 A2:8' },
      { wave: 'noise', vol: 0.04, notes: '[k:2 h:2 s:2 h:2]*16' },
    ],
  },

  storm: {
    bpm: 150,
    ch: [
      { wave: 'p25', vol: 0.085, notes:
        'C5:2 Eb5 G5 C6 Bb5:4 G5 | Ab5:2 G5 F5 Eb5 D5:4 B4 | C5:2 Eb5 G5 C6 D6:4 Eb6 | D6:8 B5 |'
        + ' C6:2 Bb5 Ab5 G5 F5:4 Eb5 | D5:2 F5 Ab5 C6 B5:4 G5 | Ab5:4 G5 F5 D5 | C5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes:
        '[G4:2 Eb4]*4 [F4:2 D4]*4 [G4:2 Eb4]*4 [G4:2 D4]*4 [Ab4:2 Eb4]*4 [F4:2 D4]*4 [F4:2 C4]*2 [G4:2 B3]*2 [G4:2 Eb4]*4' },
      { wave: 'tri', vol: 0.16, notes:
        '[C2:2 C3]*4 [Bb1:2 Bb2]*4 [Ab1:2 Ab2]*4 [G1:2 G2]*4 [Ab1:2 Ab2]*4 [F1:2 F2]*4 [G1:2 G2]*4 [C2:2 C3]*4' },
      { wave: 'noise', vol: 0.05, notes: DRUM_ROCK },
    ],
  },

  seabreeze: {
    bpm: 112,
    ch: [
      { wave: 'p50', vol: 0.08, vib: true, notes:
        'A4:2 D5 F#5:4 E5:2 D5 A4:4 | B4:2 D5 G5:4 F#5:2 E5 D5:4 | E5:4 C#5:2 A4 E5:4 G5 | F#5:12 r:4 |'
        + ' A5:2 F#5 D5:4 G5:2 E5 C#5:4 | F#5:2 D5 B4:4 E5:2 C#5 A4:4 | B4:4 D5 C#5 E5 | D5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes: 'F#4:8 A4 | G4 B4 | A4 C#5 | D5:16 | F#4:8 G4 | D4 C#4 | G4 A4 | F#4:16' },
      { wave: 'tri', vol: 0.15, notes:
        '[D3:2 A2]*4 [G2:2 D3]*4 [A2:2 E3]*4 [D3:2 A2]*4 [D3:2 A2]*4 [B2:2 F#2]*4 [G2:2 A2]*4 D3:4 A2 D3:8' },
      { wave: 'noise', vol: 0.035, notes: '[k:4 h:2 h:2 s:4 h:4]*8' },
    ],
  },

  lighthouse: {
    bpm: 132,
    ch: [
      { wave: 'p25', vol: 0.08, notes:
        'E5:2 F#5 G5 B5 A5:4 G5 | F#5:2 G5 A5 C6 B5:8 | C6:2 B5 A5 G5 F#5:4 D5 | E5:8 B4 |'
        + ' E5:2 G5 B5 E6 D6:4 B5 | C6:2 A5 F#5 A5 G5:8 | F#5:4 A5 G5 D#5 | E5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes:
        '[B4:2 G4]*4 [C5:2 A4]*4 [A4:2 F#4]*4 [G4:2 E4]*4 [B4:2 G4]*4 [A4:2 E4]*4 [F#4:2 D#4]*4 [G4:2 E4]*4' },
      { wave: 'tri', vol: 0.16, notes:
        '[E2:2 E3]*4 [A2:2 A3]*4 [D2:2 D3]*4 [E2:2 E3]*4 [G2:2 G3]*4 [A2:2 A3]*4 [B1:2 B2]*4 [E2:2 E3]*4' },
      { wave: 'noise', vol: 0.045, notes: '[k:2 h:2 s:2 h:2]*16' },
    ],
  },

  admin: {
    bpm: 170,
    loopStart: 16,
    ch: [
      { wave: 'p25', vol: 0.095, notes:
        'B4:1 C5 B4 C5 B4 C5 B4 C5 F#5:2 r F5 r |'
        + ' B5:2 B5 D6 B5 C#6:4 B5:2 A5 | G5:2 G5 B5 G5 A5:4 G5:2 F#5 | E5:2 G5 B5 E6 D6:4 C#6:2 B5 | A#5:8 F#5:4 A#5 |'
        + ' B5:2 D6 F#6 D6 E6:4 D6:2 C#6 | D6:2 B5 G5 B5 A5:4 G5:2 F#5 | G5:4 E5 F#5 A#5 | B5:8 F#5:4 D5' },
      { wave: 'p12', vol: 0.045, notes:
        'r:16 [F#5:2 D5:2]*4 [E5:2 B4:2]*4 [G5:2 E5:2]*4 [F#5:2 C#5:2]*4 [F#5:2 D5:2]*4 [D5:2 B4:2]*4 [E5:2 C#5:2]*2 [F#5:2 C#5:2]*2 [F#5:2 D5:2]*4' },
      { wave: 'tri', vol: 0.17, notes:
        'B1:2 B1 B1 B1 C2 C2 C2 C2 [B1:2 B2]*4 [G1:2 G2]*4 [E2:2 E3]*4 [F#1:2 F#2]*4 [B1:2 B2]*4 [G1:2 G2]*4 [E2:2 E3]*2 [F#2:2 F#3]*2 [B1:2 B2]*4' },
      { wave: 'noise', vol: 0.055, notes: 'k:2 k k k s:1 s s s s:2 s:1 s ' + DRUM_ROCK },
    ],
  },

  // Evolution: a rising, shimmering loop, then a fanfare.
  evolution: {
    bpm: 110,
    ch: [
      { wave: 'p12', vol: 0.07, notes: '[C5:1 E5 G5 C6 G5 E5]*2 C5:1 E5 G5 C6 | [D5:1 F5 A5 D6 A5 F5]*2 D5:1 F5 A5 D6 |'
        + ' [E5:1 G5 B5 E6 B5 G5]*2 E5:1 G5 B5 E6 | [F5:1 A5 C6 F6 C6 A5]*2 G5:1 B5 D6 G6 |' },
      { wave: 'tri', vol: 0.15, notes: 'C3:16 D3:16 E3:16 F3:8 G3:8' },
      { wave: 'noise', vol: 0.02, notes: '[h:2]*32' },
    ],
  },
  evolved: {
    bpm: 132, loop: false,
    ch: [
      { wave: 'p50', vol: 0.1, notes: 'G5:2 G5 G5 C6:6 B5:2 A5 G5 A5:2 B5 C6:8' },
      { wave: 'p12', vol: 0.05, notes: 'E5:2 E5 E5 E5:6 G5:2 F5 E5 F5:2 G5 E5:8' },
      { wave: 'tri', vol: 0.15, notes: 'C3:8 F3:4 G3:6 C3:12' },
    ],
  },

  badge: {
    bpm: 140, loop: false,
    ch: [
      { wave: 'p50', vol: 0.1, notes: 'C5:2 E5 G5 C6:4 G5:2 C6:2 E6:8 r:2' },
      { wave: 'p12', vol: 0.05, notes: 'E4:2 G4 C5 E5:4 D5:2 E5:2 G5:8 r:2' },
      { wave: 'tri', vol: 0.15, notes: 'C3:6 F3:4 G3:4 C3:10' },
    ],
  },
};

// Chapter 5: ROUTE 8, SILVERFALL CITY, SONANCE TOWER, SILVERFALL BRIDGE, CRAGMOOR.
Object.assign(MUSIC, {
  route8: {
    bpm: 132,
    ch: [
      { wave: 'p25', vol: 0.09, vib: true, notes:
        'G4:2 B4 D5 G5:4 F#5:2 E5 D5 | E5:4 C5:2 E5 G5:6 E5:2 | D5:2 F#5 A5 D6:4 C6:2 B5 A5 | B5:6 A5:2 G5:8 |'
        + ' C5:2 E5 G5 C6:4 B5:2 A5 G5 | A5:4 F#5:2 D5 E5:6 F#5:2 | G5:2 A5 B5 D6:4 B5:2 A5 F#5 | G5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes: 'B4:8 D5 | C5 E5 | A4 D5 | D5 B4 | E5 C5 | C5 A4 | B4 D5 | B4:16' },
      { wave: 'tri', vol: 0.16, notes:
        '[G2:2 D3]*4 [C3:2 G3]*4 [D3:2 A3]*4 [G2:2 D3]*4 [C3:2 G3]*4 [D3:2 A3]*4 [G2:2 D3]*4 [G2:2 D3]*4' },
      { wave: 'noise', vol: 0.045, notes: '[k:2 h:2 s:2 h:2]*16' },
    ],
  },
  silverfall: {
    bpm: 118,
    ch: [
      { wave: 'p25', vol: 0.09, vib: true, notes:
        'E5:4 G5:2 B5 A5:4 G5:2 E5 | D5:4 F#5:2 A5 G5:8 | C5:4 E5:2 G5 F#5:4 E5:2 C5 | B4:6 D#5:2 F#5:8 |'
        + ' E5:4 G5:2 B5 D6:4 C6:2 B5 | A5:4 C6:2 A5 G5:4 E5:2 D5 | C5:4 E5:2 A5 B5:4 A5:2 F#5 | E5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes:
        '[E4:2 G4 B4 G4]*2 [D4:2 F#4 A4 F#4]*2 [C4:2 E4 G4 E4]*2 [B3:2 D#4 F#4 D#4]*2'
        + ' [E4:2 G4 B4 G4]*2 [A3:2 C4 E4 C4]*2 [C4:2 E4 A4 E4]*2 [E4:2 G4 B4 G4]*2' },
      { wave: 'tri', vol: 0.16, notes:
        '[E2:2 E2 B2 E2]*2 [D2:2 D2 A2 D2]*2 [C2:2 C2 G2 C2]*2 [B1:2 B1 F#2 B1]*2'
        + ' [E2:2 E2 B2 E2]*2 [A1:2 A1 E2 A1]*2 [C2:2 C2 G2 C2]*2 [E2:2 E2 B2 E2]*2' },
      { wave: 'noise', vol: 0.05, notes: '[k:2 h:2 s:2 h:1 h:1 k:2 h:2 s:2 h:2]*8' },
    ],
  },
  hq: {
    bpm: 136,
    ch: [
      { wave: 'p25', vol: 0.08, notes:
        'D5:2 r D5 A5:4 G5:2 F5 E5 | F5:4 E5:2 D5 C#5:8 | D5:2 r D5 Bb5:4 A5:2 G5 F5 | G5:4 F5:2 E5 A5:8 |'
        + ' Bb5:2 r Bb5 A5:4 G5:2 F5 E5 | F5:4 G5:2 A5 D6:8 | C#6:4 Bb5:2 A5 G5:4 E5:2 C#5 | D5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes:
        '[D4:1 D4 A4 D4]*8 [Bb3:1 Bb3 F4 Bb3]*4 [A3:1 A3 E4 A3]*4 [D4:1 D4 A4 D4]*8 [G3:1 G3 D4 G3]*4 [A3:1 A3 E4 A3]*4' },
      { wave: 'tri', vol: 0.16, notes: '[D2:2 D3]*8 [Bb1:2 Bb2]*4 [A1:2 A2]*4 [D2:2 D3]*8 [G1:2 G2]*4 [A1:2 A2]*4' },
      { wave: 'noise', vol: 0.045, notes: '[k:2 h:1 h:1 s:2 h:2 k:1 k:1 h:2 s:2 h:2]*8' },
    ],
  },
  bridge: {
    bpm: 124,
    ch: [
      { wave: 'p25', vol: 0.09, vib: true, notes:
        'F4:2 A4 C5 F5:6 E5:2 D5 | C5:4 A4 Bb4:2 D5:6 | C5:2 E5 G5 C6:6 Bb5:2 A5 | G5:8 F5:4 E5 |'
        + ' D5:2 F5 A5 D6:6 C6:2 Bb5 | A5:4 F5 G5:2 Bb5:6 | A5:2 G5 F5 E5:4 D5:2 E5:4 | F5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes: 'A4:8 C5 | F4 D4 | E4 G4 | Bb4 G4 | F4 A4 | F4 D4 | C5 Bb4 | A4:16' },
      { wave: 'tri', vol: 0.16, notes:
        '[F2:2 C3]*4 [Bb1:2 F2]*4 [C2:2 G2]*4 [C2:2 G2]*4 [D2:2 A2]*4 [Bb1:2 F2]*4 [C2:2 G2]*4 [F2:2 C3]*4' },
      { wave: 'noise', vol: 0.045, notes: '[k:2 h:2 s:2 h:2 k:2 h:2 s:2 o:2]*8' },
    ],
  },
  cragmoor: {
    bpm: 108,
    ch: [
      { wave: 'p50', vol: 0.08, vib: true, notes:
        'A4:4 C5:2 E5 D5:4 C5:2 B4 | C5:4 A4:2 G4 A4:8 | F4:4 A4:2 C5 E5:4 D5:2 C5 | B4:6 G4:2 E4:8 |'
        + ' A4:4 C5:2 E5 A5:4 G5:2 E5 | F5:4 E5:2 D5 C5:8 | D5:4 C5:2 B4 C5:4 B4:2 G#4 | A4:12 r:4' },
      { wave: 'p12', vol: 0.04, notes: 'E4:8 C4 | E4 E4 | C4 F4 | G4 E4 | E4 C5 | A4 E4 | F4 E4 | C4:16' },
      { wave: 'tri', vol: 0.17, notes:
        '[A1:4 E2]*2 [A1:4 E2]*2 [F1:4 C2]*2 [E1:4 B1]*2 [A1:4 E2]*2 [D2:4 A2]*2 [D2:4 E2]*2 [A1:4 E2]*2' },
      { wave: 'noise', vol: 0.05, notes: '[k:4 s:2 h:2 k:2 k:2 s:4]*8' },
    ],
  },
});

// Chapters 6 and 7: the lake road home, the dune road, SUNSPIRE RUINS and
// TEAM DISTORTION's dig site.
Object.assign(MUSIC, {
  route9: {
    bpm: 108,
    ch: [
      { wave: 'p50', vol: 0.08, vib: true, notes:
        'F5:4 A5:2 G5 F5:4 C5:4 | D5:4 F5:2 E5 D5:8 | Bb4:4 D5:2 F5 A5:4 G5:2 F5 | G5:12 r:4 |'
        + ' F5:4 A5:2 C6 A5:4 F5:4 | G5:4 Bb5:2 A5 G5:8 | A5:4 G5:2 F5 E5:4 G5:4 | F5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes: 'A4:16 F4 D4 E4 A4 Bb4 C5 A4' },
      { wave: 'tri', vol: 0.16, notes:
        '[F2:4 C3]*2 [D2:4 A2]*2 [Bb1:4 F2]*2 [C2:4 G2]*2 [F2:4 C3]*2 [G2:4 D3]*2 [C2:4 G2]*2 [F2:4 C3]*2' },
      { wave: 'noise', vol: 0.035, notes: '[h:4 k:4 h:4 s:4]*8' },
    ],
  },
  desert: {
    bpm: 120,
    ch: [
      { wave: 'p25', vol: 0.08, vib: true, notes:
        'D5:2 Eb5 F#5 G5 A5:4 G5:2 F#5 | Eb5:4 D5:4 C5:2 D5 Eb5:4 | D5:2 F#5 A5 Bb5 A5:4 G5:2 F#5 | G5:6 F#5:2 Eb5:4 D5:4 |'
        + ' A5:2 Bb5 A5 G5 F#5:4 G5:2 A5 | Bb5:4 A5:2 G5 F#5:4 Eb5:4 | D5:2 Eb5 F#5 A5 G5:4 F#5:2 Eb5 | D5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes: 'A4:16 G4 A4 Bb4 C5 D5 A4 A4' },
      { wave: 'tri', vol: 0.16, notes:
        '[D2:2 A2 D3 A2]*2 [C2:2 G2 C3 G2]*2 [D2:2 A2 D3 A2]*2 [Eb2:2 Bb2 Eb3 Bb2]*2'
        + ' [D2:2 A2 D3 A2]*2 [G2:2 D3 G3 D3]*2 [Eb2:2 Bb2 Eb3 Bb2]*2 [D2:2 A2 D3 A2]*2' },
      { wave: 'noise', vol: 0.045, notes: '[k:4 h:2 h:2 s:4 h:2 k:2]*8' },
    ],
  },
  sunspire: {
    bpm: 100,
    ch: [
      { wave: 'p50', vol: 0.08, vib: true, notes:
        'A4:4 C5:2 E5 A5:4 G#5:4 | F5:4 E5:2 D5 E5:8 | D5:4 F5:2 A5 G5:4 F5:2 E5 | E5:6 D5:2 C5:4 B4:4 |'
        + ' A4:4 C5:2 E5 A5:4 B5:4 | C6:4 B5:2 A5 G#5:8 | A5:4 F5:2 E5 D5:4 B4:4 | A4:12 r:4' },
      { wave: 'p12', vol: 0.04, notes: 'E4:16 C4 D4 G#4 E4 E4 F4 E4' },
      { wave: 'tri', vol: 0.16, notes:
        '[A1:4 E2]*2 [A1:4 E2]*2 [D2:4 A2]*2 [E2:4 B2]*2 [A1:4 E2]*2 [E2:4 B2]*2 [D2:4 A2]*2 [A1:4 E2]*2' },
      { wave: 'noise', vol: 0.04, notes: '[k:4 h:4 s:4 h:2 h:2]*8' },
    ],
  },
  digsite: {
    bpm: 116,
    ch: [
      { wave: 'p25', vol: 0.08, notes:
        'D5:2 r:2 D5:2 F5:2 Ab5:4 G5:4 | F5:2 r:2 E5:2 D5:2 C#5:8 | D5:2 r:2 D5:2 F5:2 A5:4 Bb5:4 | A5:6 G5:2 F5:4 E5:4 |'
        + ' D6:2 r:2 C6:2 Bb5:2 A5:4 Ab5:4 | G5:2 r:2 F5:2 E5:2 F5:8 | E5:2 F5:2 G5:2 Ab5:2 A5:4 C#5:4 | D5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes:
        '[D4:2 A4]*4 [D4:2 Ab4]*4 [D4:2 A4]*4 [C#4:2 A4]*4 [Bb3:2 F4]*4 [G3:2 D4]*4 [A3:2 E4]*4 [D4:2 A4]*4' },
      { wave: 'tri', vol: 0.16, notes:
        '[D2:4 D2]*2 [D2:4 Ab1]*2 [D2:4 D2]*2 [A1:4 A1]*2 [Bb1:4 Bb1]*2 [G1:4 G1]*2 [A1:4 A1]*2 [D2:4 D2]*2' },
      { wave: 'noise', vol: 0.045, notes: '[k:2 h:2 h:2 h:2 s:2 h:2 k:2 h:2]*8' },
    ],
  },
});

// Chapters 8 and 9: the farm road and MEADOWFIELD FARM, THANE's storm night,
// the snowy road north, STONEPEAK WOODS and its bell tower.
Object.assign(MUSIC, {
  farm: {
    bpm: 112,
    ch: [
      { wave: 'p50', vol: 0.08, vib: true, notes:
        'G5:2 B5 D6 B5 G5:4 A5:2 B5 | C6:4 B5:2 A5 G5:4 E5:4 | D5:2 G5 B5 G5 A5:4 G5:2 E5 | D5:12 r:4 |'
        + ' G5:2 B5 D6 E6 D6:4 B5:2 G5 | C6:4 E6:2 D6 C6:4 A5:4 | B5:2 A5 G5 E5 D5:4 F#5:4 | G5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes: 'B4:16 C5 B4 A4 B4 C5 D5 B4' },
      { wave: 'tri', vol: 0.16, notes:
        '[G2:4 D3]*2 [C3:4 G2]*2 [G2:4 D3]*2 [D2:4 A2]*2 [G2:4 D3]*2 [C3:4 G2]*2 [D2:4 A2]*2 [G2:4 D3]*2' },
      { wave: 'noise', vol: 0.04, notes: '[k:4 h:2 h:2 s:4 h:2 h:2]*8' },
    ],
  },
  tempest: {
    bpm: 144,
    ch: [
      { wave: 'p25', vol: 0.08, notes:
        'D5:2 D5 F5 A5 D6:4 C6:2 A5 | Bb5:4 A5:2 G5 F5:4 E5:4 | D5:2 D5 F5 A5 C6:4 Bb5:2 A5 | A5:12 r:4 |'
        + ' F5:2 F5 A5 C6 F6:4 E6:2 C6 | D6:4 C6:2 Bb5 A5:4 G5:4 | F5:2 E5 D5 E5 F5:4 C#5:4 | D5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes:
        '[D4:2 A4]*4 [D4:2 G4]*4 [D4:2 A4]*4 [C#4:2 A4]*4 [F4:2 C5]*4 [Bb3:2 F4]*4 [G3:2 D4]*4 [A3:2 E4]*4' },
      { wave: 'tri', vol: 0.16, notes:
        '[D2:2 D3]*4 [G2:2 G3]*4 [D2:2 D3]*4 [A1:2 A2]*4 [F2:2 F3]*4 [Bb1:2 Bb2]*4 [G1:2 G2]*4 [A1:2 A2]*4' },
      { wave: 'noise', vol: 0.05, notes: '[k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2]*8' },
    ],
  },
  snowroad: {
    bpm: 96,
    ch: [
      { wave: 'p50', vol: 0.08, vib: true, notes:
        'E5:4 G5:2 B5 E6:4 D6:4 | C6:4 B5:2 A5 B5:8 | A5:4 C6:2 E6 D6:4 B5:4 | G5:6 A5:2 B5:8 |'
        + ' E5:4 G5:2 B5 E6:4 F#6:4 | G6:4 F#6:2 E6 D6:8 | C6:4 B5:2 A5 G5:4 F#5:4 | E5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes: 'B4:16 G4 C5 D5 B4 B4 A4 G4' },
      { wave: 'tri', vol: 0.16, notes:
        '[E2:4 B2]*2 [C2:4 G2]*2 [A1:4 E2]*2 [G1:4 D2]*2 [E2:4 B2]*2 [B1:4 F#2]*2 [A1:4 E2]*2 [E2:4 B2]*2' },
      { wave: 'noise', vol: 0.03, notes: '[h:4 h:4 k:4 h:4]*8' },
    ],
  },
  stonepeak: {
    bpm: 88,
    ch: [
      { wave: 'p25', vol: 0.08, vib: true, notes:
        'A5:4 C6:4 F6:4 E6:2 D6 | C6:4 A5:4 G5:8 | Bb5:4 D6:4 F6:4 E6:2 D6 | C6:12 r:4 |'
        + ' A5:4 C6:4 F6:4 G6:2 A6 | Bb6:4 A6:4 G6:8 | F6:2 E6 D6 C6 Bb5:4 E5:4 | F5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes:
        '[F4:2 A4 C5 A4]*4 [Bb3:2 D4 F4 D4]*2 [C4:2 E4 G4 E4]*2 [F4:2 A4 C5 A4]*4 [Bb3:2 D4 F4 D4]*2 [C4:2 E4 G4 E4]*2' },
      { wave: 'tri', vol: 0.15, notes: 'F2:8 C3 F2 C3 Bb1 F2 C2 G2 F2 C3 F2 C3 Bb1 F2 C2 G2' },
      { wave: 'noise', vol: 0.03, notes: '[k:8 h:4 h:4]*8' },
    ],
  },
  belltower: {
    bpm: 104,
    ch: [
      { wave: 'p50', vol: 0.08, notes:
        'C5:4 Eb5:4 G5:4 C6:4 | B4:4 D5:4 G5:8 | Ab5:4 G5:4 F5:4 Eb5:4 | D5:12 r:4 |'
        + ' C5:4 Eb5:4 G5:4 Eb6:4 | D6:4 C6:4 B5:8 | C6:4 G5:4 Ab5:4 B5:4 | C6:12 r:4' },
      { wave: 'p12', vol: 0.05, notes:
        '[C6:2 r:6 G5:2 r:6]*2 [G5:2 r:6 D5:2 r:6]*2 [Ab5:2 r:6 Eb5:2 r:6]*2 [G5:2 r:6 B4:2 r:6]*2' },
      { wave: 'tri', vol: 0.16, notes:
        '[C2:4 G2]*2 [G1:4 D2]*2 [Ab1:4 Eb2]*2 [G1:4 D2]*2 [C2:4 G2]*2 [G1:4 D2]*2 [Ab1:4 Eb2]*2 [G1:4 G2]*2' },
      { wave: 'noise', vol: 0.045, notes: '[k:4 h:4 s:4 h:4]*8' },
    ],
  },
  // EMBERPEAK VOLCANO and ROUTE 7: heavy, smoldering, a little Phrygian.
  volcano: {
    bpm: 120,
    ch: [
      { wave: 'p25', vol: 0.08, notes:
        'D5:4 Eb5:2 D5 C5:4 A4:4 | Bb4:4 A4:2 G4 A4:8 | D5:4 F5:2 G5 A5:4 Bb5:2 A5 | G5:4 F5:2 Eb5 D5:8 |'
        + ' A5:4 Bb5:2 A5 G5:4 F5:4 | Eb5:4 D5:2 C5 D5:8 | F5:2 G5 A5 C6 Bb5:4 A5:2 G5 | A5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes:
        '[D4:2 A4]*4 [G3:2 D4]*4 [D4:2 A4]*4 [G3:2 Eb4]*4 [F4:2 A4]*4 [C4:2 G4]*4 [Bb3:2 F4]*4 [A3:2 E4]*4' },
      { wave: 'tri', vol: 0.17, notes:
        '[D2:2 D3]*4 [G1:2 G2]*4 [D2:2 D3]*4 [Eb2:2 Eb3]*4 [F2:2 F3]*4 [C2:2 C3]*4 [Bb1:2 Bb2]*4 [A1:2 A2]*4' },
      { wave: 'noise', vol: 0.05, notes: '[k:4 h:2 h:2 k:4 s:4]*8' },
    ],
  },
  // THE FORGE: pumps, pistons and TEAM DISTORTION.
  forge: {
    bpm: 138,
    ch: [
      { wave: 'p25', vol: 0.08, notes:
        'C5:2 r C5 Eb5 G5:4 F5:2 Eb5 | D5:2 r D5 F5 Ab5:4 G5:4 | C5:2 r C5 Eb5 G5:4 Bb5:2 Ab5 | G5:12 r:4 |'
        + ' Ab5:4 G5:2 F5 Eb5:4 D5:4 | G5:4 F5:2 Eb5 D5:4 C5:4 | Eb5:2 F5 G5 Ab5 B5:4 D6:4 | C6:8 B5:4 G5:4' },
      { wave: 'p12', vol: 0.04, notes: '[C5:1 r G4 r]*16 [D5:1 r Ab4 r]*8 [B4:1 r G4 r]*8' },
      { wave: 'tri', vol: 0.17, notes: '[C2:2 C2 C3 C2]*8 [Ab1:2 Ab1 Ab2 Ab1]*4 [G1:2 G1 G2 G1]*4' },
      { wave: 'noise', vol: 0.055, notes: '[k:2 h:2 k:2 s:2 h:2 k:2 s:2 s:1 s:1]*8' },
    ],
  },
  // The GRAND RESONATOR: an organ in a machine.
  resonator: {
    bpm: 96,
    ch: [
      { wave: 'p50', vol: 0.07, notes:
        'D5:8 F5:4 A5:4 | G5:8 E5:8 | F5:8 A5:4 D6:4 | C#6:16 |'
        + ' D6:8 C6:4 Bb5:4 | A5:8 G5:4 F5:4 | E5:4 F5:4 G5:4 A5:4 | D5:16' },
      { wave: 'p12', vol: 0.045, notes:
        '[D4:1 F4 A4 D5]*4 [C4:1 E4 G4 C5]*4 [Bb3:1 D4 F4 Bb4]*4 [A3:1 C#4 E4 A4]*4'
        + ' [Bb3:1 D4 G4 Bb4]*4 [F3:1 A3 C4 F4]*4 [G3:1 Bb3 C#4 E4]*4 [A3:1 D4 F4 A4]*4' },
      { wave: 'tri', vol: 0.17, notes: 'D2:16 C2:16 Bb1:16 A1:16 G1:16 F1:16 G1:8 A1:8 D2:16' },
      { wave: 'noise', vol: 0.025, notes: '[k:8 h:4 h:4]*8' },
    ],
  },
  // ROUTE 6 and the MARSHLAND: lazy, misty.
  marsh: {
    bpm: 100,
    ch: [
      { wave: 'p50', vol: 0.07, notes:
        'G4:4 B4:2 D5 E5:6 D5:2 | C5:4 B4:2 A4 G4:8 | E4:4 G4:2 A4 B4:6 D5:2 | A4:12 r:4 |'
        + ' G4:4 B4:2 D5 G5:6 F#5:2 | E5:4 D5:2 B4 C5:8 | A4:4 B4:2 C5 D5:4 E5:2 C5 | G4:12 r:4' },
      { wave: 'p12', vol: 0.04, notes:
        '[G3:2 D4 B4 D4]*2 [C4:2 G4 E4 G4]*2 [E3:2 B3 G4 B3]*2 [D4:2 A4 F#4 A4]*2'
        + ' [G3:2 D4 B4 D4]*2 [C4:2 G4 E4 G4]*2 [A3:2 E4 C5 E4]*2 [G3:2 D4 B4 D4]*2' },
      { wave: 'tri', vol: 0.16, notes:
        'G1:8 D2:8 C2:8 G1:8 E2:8 B1:8 D2:8 A1:8 G1:8 D2:8 C2:8 G1:8 A1:8 E2:8 G1:8 D2:8' },
      { wave: 'noise', vol: 0.035, notes: '[k:4 h:4 s:4 h:2 h:2]*8' },
    ],
  },
  // The MYSTIC GROVE on a moonless night.
  grove: {
    bpm: 84,
    ch: [
      { wave: 'p50', vol: 0.07, notes:
        'E5:6 F#5:2 G5:4 B5:4 | A5:6 G5:2 F#5:8 | D5:6 E5:2 F#5:4 A5:4 | G5:12 r:4 |'
        + ' B5:6 C6:2 B5:4 A5:4 | G5:6 F#5:2 E5:8 | C5:4 E5:4 G5:4 F#5:4 | E5:12 r:4' },
      { wave: 'p12', vol: 0.035, notes:
        '[B5:1 r:3 E6:1 r:3]*2 [A5:1 r:3 D6:1 r:3]*2 [F#5:1 r:3 B5:1 r:3]*2 [G5:1 r:3 D6:1 r:3]*2'
        + ' [G5:1 r:3 E6:1 r:3]*2 [E5:1 r:3 B5:1 r:3]*2 [E5:1 r:3 C6:1 r:3]*2 [B5:1 r:3 G5:1 r:3]*2' },
      { wave: 'tri', vol: 0.16, notes: 'E2:16 D2:16 B1:16 G1:16 C2:16 E2:16 C2:8 B1:8 E2:16' },
      { wave: 'noise', vol: 0.02, notes: '[r:8 h:8]*8' },
    ],
  },
  // STARFALL ISLE and its observatory.
  starfall: {
    bpm: 108,
    ch: [
      { wave: 'p25', vol: 0.075, notes:
        'A4:2 C#5 E5 A5 G#5:4 E5:4 | F#5:4 E5:2 D5 C#5:8 | D5:2 F#5 A5 D6 C#6:4 A5:4 | B5:12 r:4 |'
        + ' C#6:4 B5:2 A5 G#5:4 F#5:4 | E5:4 F#5:2 G#5 A5:8 | F#5:2 G#5 A5 B5 C#6:4 G#5:4 | A5:12 r:4' },
      { wave: 'p12', vol: 0.04, notes:
        '[A4:2 E5 C#5 E5]*2 [D4:2 A4 F#4 A4]*2 [B3:2 F#4 D4 F#4]*2 [E4:2 B4 G#4 B4]*2'
        + ' [F#4:2 C#5 A4 C#5]*2 [C#4:2 G#4 E4 G#4]*2 [D4:2 A4 F#4 A4]*2 [E4:2 B4 G#4 B4]*2' },
      { wave: 'tri', vol: 0.16, notes:
        'A1:8 E2:8 D2:8 A1:8 B1:8 F#2:8 E2:8 B1:8 F#2:8 C#2:8 C#2:8 G#1:8 D2:8 A1:8 E2:8 E1:8' },
      { wave: 'noise', vol: 0.04, notes: '[k:4 h:2 h:2 s:4 h:4]*8' },
    ],
  },
  // Battle: THE CONDUCTOR.
  conductor: {
    bpm: 176,
    ch: [
      { wave: 'p25', vol: 0.095, notes:
        'D5:1 E5 F5 G5 A5:4 D6:4 C6:2 A5 | Bb5:4 A5:2 G5 A5:8 | G5:2 A5 Bb5 D6 C6:4 Bb5:2 A5 | A5:4 G5:2 F5 E5:8 |'
        + ' F5:2 G5 A5 D6 F6:4 E6:2 D6 | C#6:4 D6:2 E6 A5:8 | Bb5:2 A5 G5 F5 E5:4 G5:2 C#6 | D6:12 r:4' },
      { wave: 'p12', vol: 0.045, notes:
        '[D5:2 A4]*4 [G4:2 D5]*4 [Bb4:2 G4]*4 [A4:2 E4]*4 [D5:2 A4]*4 [A4:2 E5]*4 [G4:2 Bb4]*4 [A4:2 F4]*4' },
      { wave: 'tri', vol: 0.17, notes:
        '[D2:2 D3]*4 [G1:2 G2]*4 [Bb1:2 Bb2]*4 [A1:2 A2]*4 [D2:2 D3]*4 [A1:2 A2]*4 [G1:2 G2]*4 [A1:2 A2]*4' },
      { wave: 'noise', vol: 0.055, notes: DRUM_ROCK },
    ],
  },
});
