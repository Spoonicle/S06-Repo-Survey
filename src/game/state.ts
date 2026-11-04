// The single source of truth for the game. Everything the display shows
// is derived from this state, so the screen and the state can never
// disagree.

export interface GameState {
  soldiers: number;
  /** Upgrade id -> number owned. */
  owned: Record<string, number>;
  /** Planet id -> true once conquered. */
  conquered: Record<string, boolean>;
}

export function createState(): GameState {
  return { soldiers: 0, owned: {}, conquered: {} };
}
