// Recruitment upgrades. Every upgrade is plain data interpreted by
// logic.ts and ui/render.ts; adding an entry here is all it takes to
// ship a new upgrade.

export interface UpgradeBonus {
  /** Extra soldiers per click. */
  click?: number;
  /** Extra soldiers recruited per second. */
  passive?: number;
  /** Multiplier applied to passive recruitment, per owned copy. */
  multiplier?: number;
}

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  /** Cost of the first copy, in soldiers. */
  baseCost: number;
  /** Each owned copy multiplies the cost of the next one. */
  costGrowth: number;
  bonus: UpgradeBonus;
}

export const UPGRADES: UpgradeDef[] = [
  {
    id: "conscription",
    name: "Conscription Drive",
    description: "Every citizen a recruit: bolden the rally drums.",
    baseCost: 25,
    costGrowth: 1.15,
    bonus: { click: 1 },
  },
  {
    id: "barracks",
    name: "Barracks",
    description: "Bunks, drill yards, and endless morning bugles.",
    baseCost: 50,
    costGrowth: 1.15,
    bonus: { passive: 0.5 },
  },
  {
    id: "factory",
    name: "War Factory",
    description: "Assembly lines stamp out armor around the clock.",
    baseCost: 600,
    costGrowth: 1.15,
    bonus: { passive: 4 },
  },
  {
    id: "shipyard",
    name: "Orbital Shipyard",
    description: "Troop transports roll off the rails into orbit.",
    baseCost: 8_000,
    costGrowth: 1.15,
    bonus: { passive: 30 },
  },
  {
    id: "academy",
    name: "Officer Academy",
    description: "Graduates make every regiment march smarter.",
    baseCost: 20_000,
    costGrowth: 2.4,
    bonus: { multiplier: 1.15 },
  },
];
