# AIMON

A small GBA-style monster-catching adventure that runs in the browser. It has
pixel art, a chiptune soundtrack and turn-based battles, and uses the AIMON
designs from the design sheets. The story currently runs up to the first GYM
BADGE.

| | |
|---|---|
| ![Title screen](docs/screenshots/title.png) | ![Professor's intro](docs/screenshots/intro.png) |
| ![Willowbrook Town](docs/screenshots/town.png) | ![Route 1](docs/screenshots/route.png) |
| ![Battle](docs/screenshots/battle.png) | ![Archford Town](docs/screenshots/archford.png) |
| ![Route 2](docs/screenshots/route2.png) | ![Riftstone Cave](docs/screenshots/cave.png) |
| ![TEAM DISTORTION grunt](docs/screenshots/grunt.png) | ![Grayhaven City](docs/screenshots/grayhaven.png) |
| ![GYM LEADER HOLT](docs/screenshots/holt.png) | ![Town map](docs/screenshots/townmap.png) |
| ![Trainer card with the KEYSTONE BADGE](docs/screenshots/card.png) | ![Epilogue](docs/screenshots/epilogue.png) |

## Play

No build step and no dependencies. Either:

- open `index.html` in a browser, or
- serve the folder, e.g. `python3 -m http.server 8000`, then visit
  <http://localhost:8000>.

| Button | Keyboard |
|---|---|
| D-pad | Arrow keys / WASD |
| A | Z, Space |
| B | X, Esc, Backspace (hold to run) |
| START | Enter |
| Sound on/off | M |

On phones and tablets an on-screen D-pad with A/B/START/SELECT appears.
Clicking or tapping the game screen also works as A. The game saves to the
browser's local storage (START → SAVE).

To get the whole game as one self-contained HTML file (for sharing or
hosting anywhere), run `python3 tools/bundle.py`. It writes
`dist/aimon.html`.

## What's in it

**Story**

1. Title screen, then PROF. LINDEN's welcome speech. Pick a preset name or
   type your own.
2. Wake up in your bedroom. Downstairs, Mom tells you the professor is
   waiting at his lab.
3. The lab is at the south end of Willowbrook Town. Choose **SKYLAVINE**
   (Grass), **MOLTAROCK** (Fire) or **ARCHEPIN** (Water). Your neighbour and
   rival **KAI** takes the one with the type advantage, then challenges you on
   your way out.
4. PROF. LINDEN gives you the AIMONDEX and five AIMON BALLS. If you try to
   leave town before this, you're turned back from the tall grass.
5. **Route 1** runs north along a river, crossing it on the Old Willow Bridge.
   Wild **GOSKIE** and **MELLOWCAP** live in the tall grass. There are three
   trainers (one of them in your path), hidden items and one-way ledges.
6. **Archford Town** has three houses to visit (one has a gift), an **AIMON
   CENTRE** that heals for free and has a storage PC, and an **AIMON MART**.
   The road north is closed for bridge repairs.

**Chapter 2: TEAM DISTORTION** (Kai calls it "the third tremor today")

7. When you reach Archford the ground shakes and KAI runs up. He went into
   **RIFTSTONE CAVE** at the end of **Route 2** and found people in black
   coats and violet visors, **TEAM DISTORTION**, hauling a humming machine
   underground. Their VOLTVIX knocked his starter out, and HOLT, the GYM
   LEADER of Grayhaven City, went in after them alone.
8. **Route 2** runs west from Archford along the river to a mountain wall
   and the cave mouth. It has two trainers, tall grass and hidden items.
9. **Riftstone Cave** has two dark floors joined by a ladder, where only
   the area around you is lit and violet crystals glow. Wild **TERRAPIKE**
   (Ground) and **SCRAPAW** (Fighting) live here, alongside a hiker and a
   black belt, and old carvings on the walls read "EIGHT STONES. EIGHT
   WARDENS."
10. On the lower floor, a DISTORTION GRUNT has driven a machine (the
    RESONATOR) into a great carved stone while HOLT's paralysed team looks
    on. The camera pans up to the standoff, then the grunt battles you with
    his electric-type **VOLTVIX**. Beat him and he leaves with a warning:
    the stone is already cracked.
11. HOLT explains that the stone is a **KEYSTONE**. There are eight, one under
    every GYM, and together they seal the **RIFT**. He heals your team, gives
    you the **EXP. SHARE** and reopens his GYM. Until then its doors stay
    locked, with his note pinned to them.
12. **Route 3** runs east from Archford through bamboo groves, with wild
    **LEAFGRUB** (Bug/Grass) and **BAMBUCK** (Grass). KAI is waiting near
    the end of it for a rematch.
13. **Grayhaven City**, the "city of steadfast stone", has a centre, a mart
    with better stock, three houses (a historian who tells the legend of
    VALEMORA and the RIFT, and someone who gives away REPELs) and the
    **GRAYHAVEN GYM**.
14. The GYM has two trainees and a guide, then **LEADER HOLT** and his three
    Normal types: **NIBBLIT**, **DAPPLEKIT** and **RUFFANG**. Win to earn
    the **KEYSTONE BADGE** (it has a real violet sliver of the stone) and
    **TM01 SWIFT**.
15. Walk out of the GYM for a short epilogue: somewhere deep underground,
    someone else is pleased that the children are collecting BADGES. The
    road east (Route 4) is closed for now. That's the end of this chapter.

**Gameplay**

- Tile-based movement with walking, running, ledge hops, doors and stairs.
  Towns and routes join up with no loading screen, and a location banner
  shows when you enter an area.
- Battles use GBA-era formulas: stats and IVs, same-type bonus, type matchups,
  critical hits, accuracy, stat stages, priority moves, draining, recoil and
  flinching. Grass/Water starters get a power boost at low HP
  (Overgrow/Torrent).
- EXP, level-ups (with a stat-gain window), learning moves, and replacing an
  old move once four are known.
- Catching uses the GBA ball-shake formula. You can nickname what you catch,
  and extra AIMON go to the PC.
- Trainers spot you from a distance, walk up and challenge you, and pay prize
  money when beaten. If your whole team faints you "white out" back to the
  last place you healed.
- Menus: AIMONDEX (with entries adapted from the design sheets), party,
  summary pages, bag, trainer card, save and options.
- **Types:** Normal, Grass, Fire, Water, Flying, Rock, Electric, Ground,
  Fighting and Bug, including immunities (Ground ignores Electric moves and
  Flying ignores Ground moves).
- **Status conditions:** paralysis (half speed, sometimes can't move), sleep
  and burn (halves physical damage and hurts each turn). Each has its own
  animation and a tag on the HP box. Electric types can't be paralysed,
  Fire types can't be burned, and powder moves don't affect Grass types.
  PARLYZ HEAL, AWAKENING, BURN HEAL and FULL HEAL cure them.
- Multi-hit moves (DOUBLE KICK), moves that never miss (SWIFT), stat moves
  that raise two stats at once (BULK UP, WORK UP), and new move animations
  for electric, ground, fighting, bug and powder moves.
- **Eight GYM BADGES:** the trainer card has eight badge slots, and each
  badge you win is shown in close-up.
- **Bag pockets:** ITEMS, BALLS, TMs and KEY ITEMS. TMs can be used again
  and again.

**Quality-of-life features**

- **EXP. SHARE** (a key item you can switch on or off): AIMON that sat out a
  battle still get half the EXP.
- **Town map** (START → MAP) of the region, VALEMORA, showing where you are.
  Move the cursor to read about each place.
- **Text speed** (START → OPTION): SLOW, MID or FAST. The setting is kept in
  the browser.
- **REPEL** keeps weaker wild AIMON away for 100 steps. **ESCAPE ROPE** takes
  you straight out of the cave.
- The AIMONDEX shows where each AIMON lives, and the move menu shows the
  selected move's type.
- Trainer AI avoids moves the target is immune to, and won't try to inflict
  a status the target already has or can't get.
- Map edges join seamlessly in all four directions, and rivers and paths
  line up across them.

## Project layout

```
index.html            page, canvas and touch controls
css/style.css
js/core/              game-loop helpers, coroutines, input, synth audio
js/gfx/               pixel font, tiles and buildings, overworld people,
                      trainer portraits, UI windows
js/data/              species, moves, types, items, trainers, maps, music,
                      sprite_data.js (generated)
js/game/              overworld, dialog, menus, battle, story events, screens
assets/sprites/       battle sprites and party icons (generated)
tools/make_sprites.py converts the design sheets into sprites
tools/bundle.py       inlines everything into dist/aimon.html
```

Cutscenes and battles are written as generator functions (`yield* say(...)`,
`yield* OW.walk(...)`) run by a small coroutine scheduler inside the fixed
60 fps loop. All art except the AIMON is drawn in code at startup, and all
music and sound effects are synthesised with the Web Audio API.

## Regenerating the AIMON sprites

The battle sprites come from two kinds of source:

- the design PDFs, for the starters, GOSKIE and MELLOWCAP (Front/Side/Back
  turnaround panels);
- the pixel-art sheets in `art/sheets/`, for everything added in chapter 2.

The script cuts out each view, removes the background, shrinks it to 64×64,
reduces it to 15 colours and adds a dark outline:

```
pip install pymupdf pillow numpy
python3 tools/make_sprites.py                                   # art/sheets only
python3 tools/make_sprites.py starter_mons.pdf route_1_mons.pdf # + the PDFs
```

This rewrites `assets/sprites/*.png` and `js/data/sprite_data.js`. The crop
boxes and sizes are at the top of the script.

## Debug shortcuts

`index.html?debug=route1` skips the story and starts with a level 7 starter.
Other spots: `willowbrook`, `archford`, `lab`, `centre`, `mart`, `home`,
`route2`, `cave`, `route3`, `grayhaven`. Add `&starter=moltarock` or
`&starter=archepin` to pick the starter.
