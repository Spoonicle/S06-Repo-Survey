// Progress survives reloads. Saving rides the existing frame loop every
// 10 seconds plus the pagehide event, so no extra timer ever exists,
// and each save records when it was written. Loading validates every
// field against known content, ignores corrupted saves entirely, and
// reports how long the page was closed so absence can be credited.

import { PLANETS } from "./data/planets.ts";
import { UPGRADES } from "./data/upgrades.ts";
import type { GameState } from "./state.ts";

const SAVE_KEY = "galactic-conquest-save";

interface SaveData {
  soldiers?: unknown;
  owned?: unknown;
  conquered?: unknown;
  savedAt?: unknown;
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function saveGame(state: GameState): void {
  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({ ...state, savedAt: Date.now() }),
  );
}

/** Seconds since this save was written; 0 when absent or from the future. */
function absence(data: SaveData): number {
  if (typeof data.savedAt !== "number" || !Number.isFinite(data.savedAt)) {
    return 0;
  }
  const elapsed = (Date.now() - data.savedAt) / 1000;
  return elapsed > 0 ? elapsed : 0;
}

/**
 * Apply a save to state and return how many seconds the page stayed
 * closed: 0 for a fresh game, a save older than timestamps, or clock
 * skew. Old saves without a timestamp simply load with no absence.
 */
export function loadGame(state: GameState): number {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw === null) return 0;
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
    return absence(data);
  } catch {
    // A corrupted save is ignored; the game starts fresh instead.
    return 0;
  }
}

/** Remove the stored save; used when a campaign is abandoned. */
export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
