// All display concerns live here. Elements are created exactly once and
// each frame only rewrites text that actually changed, so the hot path
// stays allocation-free and the page never rebuilds itself.

import { PLANET_IMAGES, SOLDIER_ICON } from "../assets/images.ts";
import { type PlanetDef, PLANETS } from "../game/data/planets.ts";
import {
  type UpgradeBonus,
  type UpgradeDef,
  UPGRADES,
} from "../game/data/upgrades.ts";
import * as logic from "../game/logic.ts";
import type { GameState } from "../game/state.ts";

export interface GameActions {
  recruit(): void;
  buyUpgrade(def: UpgradeDef): void;
  conquer(def: PlanetDef): void;
  reset(): void;
}

// Compact number display: 1.5K, 3.2M, 7.8B, and so on. Exported because
// the wiring layer composes the welcome-back message from it.
export function compact(n: number): string {
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

// Rates can be fractional below 1K: 0.5/sec reads better than 0/sec.
function rate(n: number): string {
  if (n >= 1000) return compact(n);
  const text = n.toFixed(1);
  return text.endsWith(".0") ? text.slice(0, -2) : text;
}

// Only touched elements are rewritten: identical writes are skipped.
const lastText = new WeakMap<HTMLElement, string>();

function setText(el: HTMLElement, text: string): void {
  if (lastText.get(el) === text) return;
  lastText.set(el, text);
  el.textContent = text;
}

function describeBonus(bonus: UpgradeBonus): string {
  const parts: string[] = [];
  if (bonus.click) parts.push(`+${bonus.click} soldiers per click`);
  if (bonus.passive) parts.push(`+${bonus.passive} soldiers/sec`);
  if (bonus.multiplier) parts.push(`x${bonus.multiplier} recruitment`);
  return parts.join(", ");
}

interface Card {
  item: HTMLLIElement;
  refresh(state: GameState): void;
}

function buildUpgradeCard(
  def: UpgradeDef,
  actions: GameActions,
): Card {
  const button = document.createElement("button");
  button.className = "card";
  const name = document.createElement("span");
  name.className = "name";
  const detail = document.createElement("span");
  detail.className = "detail";
  const text = document.createElement("span");
  text.className = "text";
  text.append(name, detail);
  button.append(text);
  button.addEventListener("click", () => actions.buyUpgrade(def));
  const item = document.createElement("li");
  item.append(button);

  return {
    item,
    refresh(state) {
      const cost = logic.upgradeCost(def, state);
      setText(
        name,
        `${def.name} (owned: ${logic.ownedCount(state, def.id)})`,
      );
      setText(
        detail,
        `${def.description} - ${describeBonus(def.bonus)} - cost: ${
          compact(cost)
        }`,
      );
      button.disabled = state.soldiers < cost;
    },
  };
}

function buildPlanetCard(def: PlanetDef, actions: GameActions): Card {
  const button = document.createElement("button");
  button.className = "card";
  const icon = document.createElement("img");
  icon.src = PLANET_IMAGES[def.id];
  icon.alt = def.name;
  const name = document.createElement("span");
  name.className = "name";
  const detail = document.createElement("span");
  detail.className = "detail";
  const text = document.createElement("span");
  text.className = "text";
  text.append(name, detail);
  button.append(icon, text);
  button.title = def.description;
  button.addEventListener("click", () => actions.conquer(def));
  const item = document.createElement("li");
  item.append(button);

  return {
    item,
    refresh(state) {
      if (state.conquered[def.id]) {
        setText(name, `${def.name} - conquered`);
        setText(detail, `Recruitment x${def.multiplier} - ${def.description}`);
        button.disabled = true;
        button.classList.add("conquered");
      } else {
        setText(name, def.name);
        setText(
          detail,
          `${def.description} - ${compact(def.cost)} soldiers`,
        );
        button.disabled = state.soldiers < def.cost;
        button.classList.remove("conquered");
      }
    },
  };
}

export function createUI(
  root: HTMLElement,
  state: GameState,
  actions: GameActions,
  welcomeBack?: string,
): { refresh(): void } {
  const title = document.createElement("h1");
  title.textContent = "Galactic Conquest";

  const stats = document.createElement("p");
  stats.className = "stats";

  const welcome = document.createElement("p");
  welcome.className = "notice";
  welcome.hidden = welcomeBack === undefined;
  if (welcomeBack !== undefined) welcome.textContent = welcomeBack;

  const recruit = document.createElement("button");
  recruit.className = "big-button";
  const icon = document.createElement("img");
  icon.src = SOLDIER_ICON;
  icon.alt = "";
  const label = document.createElement("span");
  label.textContent = "Recruit Soldier";
  recruit.append(icon, label);
  recruit.addEventListener("click", () => actions.recruit());

  const upgradesHeading = document.createElement("h2");
  upgradesHeading.textContent = "Recruitment";

  const upgradeList = document.createElement("ul");
  const upgradeCards = UPGRADES.map((def) => buildUpgradeCard(def, actions));
  for (const card of upgradeCards) upgradeList.append(card.item);

  const galaxyHeading = document.createElement("h2");
  galaxyHeading.textContent = "Galaxy";

  const planetList = document.createElement("ul");
  const planetCards = PLANETS.map((def) => buildPlanetCard(def, actions));
  for (const card of planetCards) planetList.append(card.item);

  const victory = document.createElement("p");
  victory.id = "victory";
  victory.hidden = true;
  victory.textContent = "The galaxy is yours. Every world flies your banner.";

  const reset = document.createElement("button");
  reset.className = "danger-button";
  reset.textContent = "Abandon Campaign";
  reset.title = "Erase all progress and start a fresh galaxy";
  reset.addEventListener("click", () => actions.reset());

  root.append(
    title,
    stats,
    welcome,
    recruit,
    upgradesHeading,
    upgradeList,
    galaxyHeading,
    planetList,
    victory,
    reset,
  );

  return {
    refresh() {
      setText(
        stats,
        `Soldiers: ${compact(state.soldiers)} - +${
          rate(logic.productionRate(state, UPGRADES, PLANETS))
        }/sec - ${logic.clickPower(state, UPGRADES)} per click`,
      );
      for (const card of upgradeCards) card.refresh(state);
      for (const card of planetCards) card.refresh(state);
      victory.hidden = !logic.isGalaxyConquered(state, PLANETS);
    },
  };
}
