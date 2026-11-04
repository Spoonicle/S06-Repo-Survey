// Galactic Conquest: a Cookie Clicker-style incremental game.
// Recruit soldiers, grow your war machine, and conquer every planet in
// the galaxy.
//
// This file only wires the pieces together; the rules live in
// game/logic.ts, the content in game/data/, the display in ui/render.ts.

import "./style.css";
import { startGameLoop } from "./game/loop.ts";
import { PLANETS } from "./game/data/planets.ts";
import { UPGRADES } from "./game/data/upgrades.ts";
import {
  buyUpgrade,
  clickPower,
  conquerPlanet,
  productionRate,
} from "./game/logic.ts";
import { loadGame, saveGame } from "./game/persistence.ts";
import { createState } from "./game/state.ts";
import { createUI } from "./ui/render.ts";

const state = createState();
loadGame(state);

const ui = createUI(
  document.querySelector<HTMLElement>("#app")!,
  state,
  {
    recruit: () => {
      state.soldiers += clickPower(state, UPGRADES);
    },
    buyUpgrade: (def) => {
      buyUpgrade(state, def);
    },
    conquer: (def) => {
      conquerPlanet(state, def);
    },
  },
);
ui.refresh();

let secondsSinceSave = 0;

// Growth runs on elapsed seconds, not frame counts, so production is
// identical at 30, 60, or 144 fps and never counted twice.
const stopLoop = startGameLoop((dt) => {
  state.soldiers += productionRate(state, UPGRADES, PLANETS) * dt;
  ui.refresh();
  secondsSinceSave += dt;
  if (secondsSinceSave >= 10) {
    secondsSinceSave = 0;
    saveGame(state);
  }
});

// Leaving the page stops the loop and flushes a save; nothing outlives
// the document.
addEventListener("pagehide", () => {
  saveGame(state);
  stopLoop();
});
