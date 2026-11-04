// Galactic Conquest: a Cookie Clicker-style incremental game.
// Recruit soldiers by clicking, grow your war machine, conquer the galaxy.

const app = document.querySelector<HTMLElement>("#app")!;

// The single source of truth for the game. The display always reads from
// here, so state and screen can never disagree.
const state = {
  soldiers: 0,
  conscription: 0,
  barracks: 0,
  factory: 0,
};

// Upgrade pricing: each purchase makes the next one COST_GROWTH times
// as expensive, so early spending shapes later decisions.
const BASE_COSTS = {
  conscription: 25,
  barracks: 50,
  factory: 600,
};
const COST_GROWTH = {
  conscription: 1.15,
  barracks: 1.15,
  factory: 1.15,
};

type UpgradeKey = keyof typeof BASE_COSTS;

function upgradeCost(key: UpgradeKey): number {
  return Math.ceil(BASE_COSTS[key] * COST_GROWTH[key] ** state[key]);
}

// What each owned upgrade contributes.
const RATES = { barracks: 0.5, factory: 4 };

// Soldiers gained per click and per second from all sources.
function clickPower(): number {
  return 1 + state.conscription;
}

function productionRate(): number {
  return state.barracks * RATES.barracks + state.factory * RATES.factory;
}

const title = document.createElement("h1");
title.textContent = "Galactic Conquest";

const counter = document.createElement("p");
counter.textContent = `Soldiers: ${state.soldiers}`;

const rateLine = document.createElement("p");
rateLine.textContent =
  `Per click: ${clickPower()} soldier - Recruitment: ${productionRate()}/sec`;

const recruit = document.createElement("button");
recruit.textContent = "Recruit Soldier";
recruit.addEventListener("click", () => {
  state.soldiers += clickPower();
});

// Each upgrade gets a button showing its current cost and how many are
// owned. Costs escalate, so the label changes as the player buys.
const UPGRADE_INFO: Array<{ key: UpgradeKey; label: string }> = [
  { key: "conscription", label: "Conscription Drive" },
  { key: "barracks", label: "Barracks" },
  { key: "factory", label: "War Factory" },
];

const upgradeButtons = new Map<UpgradeKey, HTMLButtonElement>();
const upgradeList = document.createElement("ul");

for (const info of UPGRADE_INFO) {
  const button = document.createElement("button");
  const item = document.createElement("li");
  button.addEventListener("click", () => {
    const cost = upgradeCost(info.key);
    if (state.soldiers < cost) return;
    state.soldiers -= cost;
    state[info.key] += 1;
  });
  item.append(button);
  upgradeList.append(item);
  upgradeButtons.set(info.key, button);
}

function refreshUpgrades(): void {
  for (const info of UPGRADE_INFO) {
    const button = upgradeButtons.get(info.key)!;
    const cost = upgradeCost(info.key);
    button.textContent = `${info.label} (owned: ${
      state[info.key]
    }) - cost: ${cost}`;
    button.disabled = state.soldiers < cost;
  }
}

app.append(title, counter, rateLine, recruit, upgradeList);

// Progress survives reloads. Saving rides the existing frame loop every
// 10 seconds and the pagehide event, so no extra timer ever exists.
const SAVE_KEY = "galactic-conquest-save";

function save(): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function load(): void {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw === null) return;
  try {
    const data = JSON.parse(raw) as Partial<typeof state>;
    for (const key of Object.keys(state) as Array<keyof typeof state>) {
      const value = data[key];
      if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
        state[key] = value;
      }
    }
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
  rateLine.textContent =
    `Per click: ${clickPower()} soldier - Recruitment: ${productionRate()}/sec`;
  refreshUpgrades();
  secondsSinceSave += dt;
  if (secondsSinceSave >= 10) {
    secondsSinceSave = 0;
    save();
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
