// Galactic Conquest: a Cookie Clicker-style incremental game.
// Recruit soldiers, grow your war machine, and conquer every planet in
// the galaxy.

import "./style.css";
import { PLANET_IMAGES, SOLDIER_ICON } from "./assets/images.ts";

const app = document.querySelector<HTMLElement>("#app")!;

// The single source of truth for the game. The display always reads from
// here, so state and screen can never disagree.
const state = {
  soldiers: 0,
  conscription: 0,
  barracks: 0,
  factory: 0,
  conquered: {} as Record<string, boolean>,
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

// The galaxy to conquer. Each planet multiplies recruitment once taken,
// so conquest is itself the late-game engine of growth.
const PLANETS = [
  {
    name: "Ferrum",
    description: "An iron-rich mining world stripped bare by foundries.",
    cost: 1_000,
    multiplier: 1.2,
  },
  {
    name: "Verdant",
    description: "Jungles that hide grain silos enough to feed legions.",
    cost: 10_000,
    multiplier: 1.2,
  },
  {
    name: "Pyros",
    description: "Volcanic forges that never cool, day or night.",
    cost: 100_000,
    multiplier: 1.25,
  },
  {
    name: "Thalassa",
    description: "An ocean world whose tides carry troop barges.",
    cost: 1e6,
    multiplier: 1.25,
  },
  {
    name: "Umbra",
    description: "A lightless world where recruits train unseen.",
    cost: 1e7,
    multiplier: 1.3,
  },
  {
    name: "Cryos",
    description: "Glacier fortresses drilled into ancient ice.",
    cost: 1e8,
    multiplier: 1.3,
  },
  {
    name: "Zephyr",
    description: "Storm-wrapped skies that test the finest pilots.",
    cost: 1e9,
    multiplier: 1.35,
  },
  {
    name: "Aurelia",
    description: "The gilded core world. Take it and the galaxy is won.",
    cost: 1e10,
    multiplier: 1.5,
  },
];

// Soldiers gained per click and per second from all sources.
function clickPower(): number {
  return 1 + state.conscription;
}

function passiveRate(): number {
  return state.barracks * RATES.barracks + state.factory * RATES.factory;
}

function conquestMultiplier(): number {
  let multiplier = 1;
  for (const planet of PLANETS) {
    if (state.conquered[planet.name]) multiplier *= planet.multiplier;
  }
  return multiplier;
}

function productionRate(): number {
  return passiveRate() * conquestMultiplier();
}

function isGalaxyConquered(): boolean {
  return PLANETS.every((planet) => state.conquered[planet.name]);
}

// Compact number display: 1.5K, 3.2M, 7.8B, and so on.
function fmt(n: number): string {
  if (n < 1000) return String(Math.floor(n));
  const units = ["K", "M", "B", "T", "Qa"];
  let value = n;
  let unit = -1;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return `${value.toFixed(2)}${units[unit]}`;
}

// --- Display -------------------------------------------------------------
// Elements are created once; per frame only changed text is rewritten.

const title = document.createElement("h1");
title.textContent = "Galactic Conquest";

const stats = document.createElement("p");
stats.className = "stats";
stats.textContent = "Soldiers: 0";

const recruit = document.createElement("button");
recruit.className = "big-button";
const recruitIcon = document.createElement("img");
recruitIcon.src = SOLDIER_ICON;
recruitIcon.alt = "";
const recruitLabel = document.createElement("span");
recruitLabel.textContent = "Recruit Soldier";
recruit.append(recruitIcon, recruitLabel);
recruit.addEventListener("click", () => {
  state.soldiers += clickPower();
});

const upgradesHeading = document.createElement("h2");
upgradesHeading.textContent = "Recruitment";

const upgradeList = document.createElement("ul");

const planetHeading = document.createElement("h2");
planetHeading.textContent = "Galaxy";

const planetList = document.createElement("ul");

const victory = document.createElement("p");
victory.id = "victory";
victory.hidden = true;
victory.textContent = "The galaxy is yours. Every world flies your banner.";

app.append(
  title,
  stats,
  recruit,
  upgradesHeading,
  upgradeList,
  planetHeading,
  planetList,
  victory,
);

// Each upgrade gets a card button showing its current cost and how many
// are owned. Costs escalate, so the label changes as the player buys.
const UPGRADE_INFO: Array<{ key: UpgradeKey; label: string; detail: string }> =
  [
    {
      key: "conscription",
      label: "Conscription Drive",
      detail: "+1 soldier per click",
    },
    {
      key: "barracks",
      label: "Barracks",
      detail: "+0.5 soldiers/sec",
    },
    {
      key: "factory",
      label: "War Factory",
      detail: "+4 soldiers/sec",
    },
  ];

const upgradeButtons = new Map<UpgradeKey, HTMLButtonElement>();
const upgradeLabels = new Map<UpgradeKey, HTMLSpanElement>();

for (const info of UPGRADE_INFO) {
  const button = document.createElement("button");
  button.className = "card";
  const label = document.createElement("span");
  const item = document.createElement("li");
  button.addEventListener("click", () => {
    const cost = upgradeCost(info.key);
    if (state.soldiers < cost) return;
    state.soldiers -= cost;
    state[info.key] += 1;
  });
  button.append(label);
  item.append(button);
  upgradeList.append(item);
  upgradeButtons.set(info.key, button);
  upgradeLabels.set(info.key, label);
}

function refreshUpgrades(): void {
  for (const info of UPGRADE_INFO) {
    const button = upgradeButtons.get(info.key)!;
    const label = upgradeLabels.get(info.key)!;
    const cost = upgradeCost(info.key);
    label.textContent = `${info.label} (owned: ${
      state[info.key]
    }) - ${info.detail} - cost: ${fmt(cost)}`;
    button.disabled = state.soldiers < cost;
  }
}

// Each planet is a war goal: pay its cost in soldiers to conquer it and
// multiply all recruitment from then on.
const planetButtons = new Map<string, HTMLButtonElement>();
const planetLabels = new Map<string, HTMLSpanElement>();

for (const planet of PLANETS) {
  const button = document.createElement("button");
  button.className = "card";
  button.title = planet.description;
  const icon = document.createElement("img");
  icon.src = PLANET_IMAGES[planet.name];
  icon.alt = planet.name;
  const label = document.createElement("span");
  const item = document.createElement("li");
  button.addEventListener("click", () => {
    if (state.conquered[planet.name] || state.soldiers < planet.cost) return;
    state.soldiers -= planet.cost;
    state.conquered[planet.name] = true;
  });
  button.append(icon, label);
  item.append(button);
  planetList.append(item);
  planetButtons.set(planet.name, button);
  planetLabels.set(planet.name, label);
}

function refreshPlanets(): void {
  for (const planet of PLANETS) {
    const button = planetButtons.get(planet.name)!;
    const label = planetLabels.get(planet.name)!;
    if (state.conquered[planet.name]) {
      label.textContent =
        `${planet.name} - conquered (recruitment x${planet.multiplier})`;
      button.disabled = true;
      button.classList.add("conquered");
    } else {
      label.textContent = `${planet.name} - ${fmt(planet.cost)} soldiers`;
      button.disabled = state.soldiers < planet.cost;
      button.classList.remove("conquered");
    }
  }
}

// --- Persistence ----------------------------------------------------------
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
    for (
      const key of ["soldiers", "conscription", "barracks", "factory"] as const
    ) {
      const value = data[key];
      if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
        state[key] = value;
      }
    }
    if (typeof data.conquered === "object" && data.conquered !== null) {
      for (const planet of PLANETS) {
        if (data.conquered[planet.name] === true) {
          state.conquered[planet.name] = true;
        }
      }
    }
  } catch {
    // A corrupted save is ignored; the game starts fresh instead.
  }
}

load();
addEventListener("pagehide", save);

// --- Main loop ------------------------------------------------------------

let secondsSinceSave = 0;

// Growth runs on elapsed seconds, not frame counts, so production is
// identical at 30, 60, or 144 fps and never counted twice.
let last = performance.now();
function frame(now: number): void {
  const dt = (now - last) / 1000;
  last = now;
  state.soldiers += productionRate() * dt;
  stats.textContent = `Soldiers: ${
    fmt(state.soldiers)
  } - per click: ${clickPower()} - ${fmt(productionRate())}/sec`;
  refreshUpgrades();
  refreshPlanets();
  victory.hidden = !isGalaxyConquered();
  secondsSinceSave += dt;
  if (secondsSinceSave >= 10) {
    secondsSinceSave = 0;
    save();
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
