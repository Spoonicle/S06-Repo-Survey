# Galactic Conquest

A Cookie Clicker-style incremental game with a military theme: recruit
soldiers by hand, build the machinery of recruitment, and spend armies to
conquer every planet in the galaxy.

## Play

The production build deploys to GitHub Pages on every push to `main`:

**https://spoonicle.github.io/S06-Repo-Survey/**

## How to play

- **Recruit Soldier** — clicking gains soldiers. Your first and always
  available source of troops.
- **Recruitment** — spend soldiers on upgrades. Each purchase raises its
  own next price by 15%, and each copy adds to recruitment forever:
  Conscription Drives add soldiers per click, Barracks, War Factories,
  and Orbital Shipyards add soldiers per second, and Officer Academies
  multiply everything passive.
- **Galaxy** — spend a large force to conquer a planet. Every conquered
  world multiplies all passive recruitment from then on, so conquest is
  the late-game engine of growth. Conquer all nine worlds and the galaxy
  is yours.
- Progress saves automatically every 10 seconds and when the page is
  closed; reloading resumes where you left off. While the page is
  closed your war machine keeps recruiting, and up to 24 hours of
  production is credited when you return.
- **Abandon Campaign** — the small red button at the bottom wipes all
  progress and starts a fresh galaxy, after a confirmation.

## Run and build

Requires [Deno](https://deno.com). All tasks are in `deno.json`:

```
deno task dev      # dev server at http://127.0.0.1:3000
deno task build    # production build into dist/
deno task preview  # serve the production build
deno task test     # browser-free tests of the game rules
deno task ci       # fmt + lint + type-check + tests + build
```

## Code tour

The game is built around one idea: **content is data, rules are code,
display is a mirror of state**.

- `src/main.ts` — wiring only: creates state, loads the save, builds the
  UI, and runs the single frame loop.
- `src/game/state.ts` — the single mutable `GameState` (soldiers,
  upgrades owned, planets conquered). The display is always derived from
  it, so screen and state cannot disagree.
- `src/game/data/` — all content lives here as plain data:
  `upgrades.ts` (cost, growth, effect) and `planets.ts` (cost,
  multiplier). Adding content means adding one object literal; no
  component needs new code.
- `src/game/logic.ts` — pure rules: costs, rates, affordability, and
  purchases. No DOM, no clock, no storage, so it is testable headlessly
  in `src/game/logic.test.ts`.
- `src/game/loop.ts` — the game's only timer: one `requestAnimationFrame`
  loop reporting elapsed seconds. Production is computed from elapsed
  time, not frame counts, and the returned stop function cancels it.
- `src/game/persistence.ts` — validates and stores progress in
  `localStorage`; corrupted saves are ignored.
- `src/ui/render.ts` — creates every element once and, per frame,
  rewrites only text that changed (dirty-checked), keeping the hot path
  allocation-free.
- `src/assets/` — imported SVG art (a soldier sigil and one world per
  planet) served through Vite's production-safe asset pipeline.

### The revision we are most proud of

Early on, upgrade effects and costs lived in parallel records keyed by
name, and rates were computed with hand-written chains like
`state.barracks * RATES.barracks + state.factory * RATES.factory` (see
[this point in history](https://github.com/Spoonicle/S06-Repo-Survey/blob/45e298f/src/main.ts)).
Adding a fourth upgrade would have meant touching four separate places.

The refactor in
[9a50d81](https://github.com/Spoonicle/S06-Repo-Survey/commit/9a50d81)
applied the **Single Responsibility Principle**: content definitions
moved into `game/data/`, the rules that interpret them into
`game/logic.ts`, and presentation into `ui/render.ts`. What became easy:
extending the game with the Orbital Shipyard, Officer Academy, and the
moon Rubicon in
[42e88c8](https://github.com/Spoonicle/S06-Repo-Survey/commit/42e88c8)
— two data files changed, zero code changed, and all behavior (costs,
effects, display, victory) came along through the shared model.

## Credits

Tooling adapted from the [CMPM 121 Fall 2026 S01 starter](https://github.com/ucsc-cmpm-121-f26/s01-starter/tree/8974888efb6537be82e8eb069db139ea885039da), which has no explicit repository license. No new license is assigned to that material; the starter's scaffold and original SVG were authored with OpenAI GPT-6 Astra assistance per its README. The Galactic Conquest game code and planet art in this repository were produced with AI coding assistance; dependencies retain their respective licenses.
