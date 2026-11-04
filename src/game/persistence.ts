// Progress survives reloads. Saving rides the existing frame loop every
// 10 seconds plus the pagehide event, so no extra timer ever exists.
// Loading validates every field against known content and ignores
// corrupted saves entirely.

import { PLANETS } from "./data/planets.ts";
import { UPGRADES } from "./data/upgrades.ts";
import type { GameState } from "./state.ts";

const SAVE_KEY = "galactic-conquest-save";

interface SaveData {
  soldiers?: unknown;
  owned?: unknown;
  conquered?: unknown;
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function saveGame(state: GameState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function loadGame(state: GameState): void {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw === null) return;
  try {
    const data = JSON.parse(raw) as SaveData;
    if (isCount(data.soldiers)) state.soldiers = data.soldiers;
    if (typeof data.owned === "object" && data.owned !== null) {
      const owned = data.owned as Record<string, unknown>;
      for (const upgrade of UPGRADES) {
        const value = owned[upgrade.id];
        if (isCount(value) && Number.isInteger(value)) {
          state.owned[upgrade.id] = value;
        }
      }
    }
    if (typeof data.conquered === "object" && data.conquered !== null) {
      const conquered = data.conquered as Record<string, unknown>;
      for (const planet of PLANETS) {
        if (conquered[planet.id] === true) state.conquered[planet.id] = true;
      }
    }
  } catch {
    // A corrupted save is ignored; the game starts fresh instead.
  }
}
