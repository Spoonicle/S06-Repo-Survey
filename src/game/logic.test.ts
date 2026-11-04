// Tests for the pure game rules in logic.ts. They run in Deno without a
// browser, which is exactly why the rules live apart from the DOM.

import { assertEquals } from "jsr:@std/assert@1.0.19";
import { PLANETS } from "./data/planets.ts";
import { UPGRADES } from "./data/upgrades.ts";
import {
  buyUpgrade,
  conquerPlanet,
  isGalaxyConquered,
  MAX_OFFLINE_SECONDS,
  offlineGains,
  productionRate,
  upgradeCost,
} from "./logic.ts";
import { createState } from "./state.ts";

function find(id: string) {
  const def = UPGRADES.find((upgrade) => upgrade.id === id);
  if (def === undefined) throw new Error(`unknown upgrade: ${id}`);
  return def;
}

Deno.test("upgrade costs escalate with each purchase", () => {
  const state = createState();
  const barracks = find("barracks");
  assertEquals(upgradeCost(barracks, state), barracks.baseCost);
  state.soldiers = barracks.baseCost;
  assertEquals(buyUpgrade(state, barracks), true);
  assertEquals(
    upgradeCost(barracks, state),
    Math.ceil(barracks.baseCost * barracks.costGrowth),
  );
});

Deno.test("unaffordable purchases change nothing", () => {
  const state = createState();
  const factory = find("factory");
  assertEquals(buyUpgrade(state, factory), false);
  assertEquals(state.soldiers, 0);
  assertEquals(state.owned[factory.id] ?? 0, 0);
});

Deno.test("a valid purchase deducts its cost and raises production", () => {
  const state = createState();
  const barracks = find("barracks");
  state.soldiers = barracks.baseCost;
  assertEquals(buyUpgrade(state, barracks), true);
  assertEquals(state.soldiers, 0);
  assertEquals(
    productionRate(state, UPGRADES, PLANETS),
    barracks.bonus.passive,
  );
});

Deno.test("conquest multiplies recruitment", () => {
  const state = createState();
  state.owned["barracks"] = 2;
  const before = productionRate(state, UPGRADES, PLANETS);
  const ferrum = PLANETS[0];
  state.soldiers = ferrum.cost;
  assertEquals(conquerPlanet(state, ferrum), true);
  assertEquals(
    productionRate(state, UPGRADES, PLANETS),
    before * ferrum.multiplier,
  );
});

Deno.test("a planet cannot be conquered twice", () => {
  const state = createState();
  const ferrum = PLANETS[0];
  state.soldiers = ferrum.cost * 2;
  assertEquals(conquerPlanet(state, ferrum), true);
  const afterFirst = state.soldiers;
  assertEquals(conquerPlanet(state, ferrum), false);
  assertEquals(state.soldiers, afterFirst);
});

Deno.test("victory requires every planet", () => {
  const state = createState();
  for (const planet of PLANETS) state.conquered[planet.id] = true;
  assertEquals(isGalaxyConquered(state, PLANETS), true);
  delete state.conquered[PLANETS[PLANETS.length - 1].id];
  assertEquals(isGalaxyConquered(state, PLANETS), false);
});

Deno.test("offline gains pay for elapsed time and cap at one day", () => {
  const state = createState();
  state.owned["barracks"] = 1; // 0.5 soldiers per second.
  assertEquals(offlineGains(state, UPGRADES, PLANETS, 0), 0);
  assertEquals(offlineGains(state, UPGRADES, PLANETS, -5), 0);
  assertEquals(offlineGains(state, UPGRADES, PLANETS, 3600), 1_800);
  assertEquals(
    offlineGains(state, UPGRADES, PLANETS, Number.MAX_SAFE_INTEGER),
    0.5 * MAX_OFFLINE_SECONDS,
  );
});
