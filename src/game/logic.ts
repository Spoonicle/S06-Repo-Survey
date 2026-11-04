// Pure rules of the game: costs, rates, and purchases. No DOM, no clock,
// no storage. Every function takes state and content in, so the rules
// can be reasoned about and tested without a browser.

import type { PlanetDef } from "./data/planets.ts";
import type { UpgradeDef } from "./data/upgrades.ts";
import type { GameState } from "./state.ts";

export function ownedCount(state: GameState, id: string): number {
  return state.owned[id] ?? 0;
}

/** Cost of the next copy of an upgrade; rises with every purchase. */
export function upgradeCost(def: UpgradeDef, state: GameState): number {
  return Math.ceil(def.baseCost * def.costGrowth ** ownedCount(state, def.id));
}

/** Soldiers gained per click, including all owned upgrades. */
export function clickPower(
  state: GameState,
  upgrades: UpgradeDef[],
): number {
  let power = 1;
  for (const def of upgrades) {
    power += (def.bonus.click ?? 0) * ownedCount(state, def.id);
  }
  return power;
}

/** Base soldiers per second before multipliers. */
export function passiveRate(
  state: GameState,
  upgrades: UpgradeDef[],
): number {
  let rate = 0;
  for (const def of upgrades) {
    rate += (def.bonus.passive ?? 0) * ownedCount(state, def.id);
  }
  return rate;
}

/** Product of every conquered planet's multiplier. */
export function conquestMultiplier(
  state: GameState,
  planets: PlanetDef[],
): number {
  let multiplier = 1;
  for (const planet of planets) {
    if (state.conquered[planet.id]) multiplier *= planet.multiplier;
  }
  return multiplier;
}

/** Soldiers per second from all sources: base rates times multipliers. */
export function productionRate(
  state: GameState,
  upgrades: UpgradeDef[],
  planets: PlanetDef[],
): number {
  let multiplier = conquestMultiplier(state, planets);
  for (const def of upgrades) {
    const bonus = def.bonus.multiplier;
    if (bonus !== undefined) {
      multiplier *= bonus ** ownedCount(state, def.id);
    }
  }
  return passiveRate(state, upgrades) * multiplier;
}

export function isGalaxyConquered(
  state: GameState,
  planets: PlanetDef[],
): boolean {
  return planets.every((planet) => state.conquered[planet.id]);
}

/**
 * Spend soldiers on an upgrade. Returns false and changes nothing when
 * unaffordable; a valid purchase deducts the cost and keeps the effect
 * for the rest of the game.
 */
export function buyUpgrade(state: GameState, def: UpgradeDef): boolean {
  const cost = upgradeCost(def, state);
  if (state.soldiers < cost) return false;
  state.soldiers -= cost;
  state.owned[def.id] = ownedCount(state, def.id) + 1;
  return true;
}

/**
 * Spend soldiers to take a planet. Returns false and changes nothing
 * when already conquered or unaffordable.
 */
export function conquerPlanet(state: GameState, def: PlanetDef): boolean {
  if (state.conquered[def.id] || state.soldiers < def.cost) return false;
  state.soldiers -= def.cost;
  state.conquered[def.id] = true;
  return true;
}
