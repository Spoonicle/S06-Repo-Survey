// Galactic Conquest: a Cookie Clicker-style incremental game.
// Recruit soldiers by clicking, grow your war machine, conquer the galaxy.

const app = document.querySelector<HTMLElement>("#app")!;

// The single source of truth for the game. The display always reads from
// here, so state and screen can never disagree.
const state = {
  soldiers: 0,
  barracks: 0,
};

// A Barracks trains 0.5 soldiers per second, forever.
const BARRACKS_COST = 50;
const BARRACKS_RATE = 0.5;

// Soldiers per second from all sources.
function productionRate(): number {
  return state.barracks * BARRACKS_RATE;
}

const title = document.createElement("h1");
title.textContent = "Galactic Conquest";

const counter = document.createElement("p");
counter.textContent = `Soldiers: ${state.soldiers}`;

const rateLine = document.createElement("p");
rateLine.textContent = "Recruitment: 0 soldiers/sec";

const recruit = document.createElement("button");
recruit.textContent = "Recruit Soldier";
recruit.addEventListener("click", () => {
  state.soldiers += 1;
});

const barracks = document.createElement("button");
barracks.textContent = `Build Barracks (cost: ${BARRACKS_COST} soldiers)`;
barracks.addEventListener("click", () => {
  // Unaffordable purchases are prevented before state changes.
  if (state.soldiers < BARRACKS_COST) return;
  state.soldiers -= BARRACKS_COST;
  state.barracks += 1;
});

app.append(title, counter, rateLine, recruit, barracks);

// Progress survives reloads. Saving rides the existing frame loop every
// 10 seconds and the pagehide event, so no extra timer ever exists.
const SAVE_KEY = "galactic-conquest-save";

function save(): void {
  const data = {
    soldiers: Math.floor(state.soldiers),
    barracks: state.barracks,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function load(): void {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw === null) return;
  try {
    const data = JSON.parse(raw) as Partial<typeof state>;
    if (typeof data.soldiers === "number") state.soldiers = data.soldiers;
    if (typeof data.barracks === "number") state.barracks = data.barracks;
  } catch {
    // A corrupted save is ignored; the game starts fresh instead.
  }
}

load();
addEventListener("pagehide", save);

let secondsSinceSave = 0;

// Growth runs on elapsed seconds, not frame counts, so production is
// identical at 30, 60, or 144 fps and never counted twice.
let last = performance.now();
function frame(now: number): void {
  const dt = (now - last) / 1000;
  last = now;
  state.soldiers += productionRate() * dt;
  counter.textContent = `Soldiers: ${Math.floor(state.soldiers)}`;
  rateLine.textContent = `Recruitment: ${productionRate()} soldiers/sec`;
  barracks.disabled = state.soldiers < BARRACKS_COST;
  secondsSinceSave += dt;
  if (secondsSinceSave >= 10) {
    secondsSinceSave = 0;
    save();
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
