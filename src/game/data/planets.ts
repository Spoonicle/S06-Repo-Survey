// The galaxy to conquer. Every planet is plain data interpreted by
// logic.ts and ui/render.ts; conquest multiplies recruitment, so taking
// worlds is itself the late-game engine of growth.

export interface PlanetDef {
  id: string;
  name: string;
  description: string;
  /** Soldiers needed to take the planet. */
  cost: number;
  /** Recruitment multiplier granted once conquered. */
  multiplier: number;
}

export const PLANETS: PlanetDef[] = [
  {
    id: "ferrum",
    name: "Ferrum",
    description: "An iron-rich mining world stripped bare by foundries.",
    cost: 1_000,
    multiplier: 1.2,
  },
  {
    id: "verdant",
    name: "Verdant",
    description: "Jungles that hide grain silos enough to feed legions.",
    cost: 10_000,
    multiplier: 1.2,
  },
  {
    id: "pyros",
    name: "Pyros",
    description: "Volcanic forges that never cool, day or night.",
    cost: 100_000,
    multiplier: 1.25,
  },
  {
    id: "thalassa",
    name: "Thalassa",
    description: "An ocean world whose tides carry troop barges.",
    cost: 1e6,
    multiplier: 1.25,
  },
  {
    id: "umbra",
    name: "Umbra",
    description: "A lightless world where recruits train unseen.",
    cost: 1e7,
    multiplier: 1.3,
  },
  {
    id: "cryos",
    name: "Cryos",
    description: "Glacier fortresses drilled into ancient ice.",
    cost: 1e8,
    multiplier: 1.3,
  },
  {
    id: "zephyr",
    name: "Zephyr",
    description: "Storm-wrapped skies that test the finest pilots.",
    cost: 1e9,
    multiplier: 1.35,
  },
  {
    id: "rubicon",
    name: "Rubicon",
    description: "A fortress moon guarding the core worlds' gate.",
    cost: 5e9,
    multiplier: 1.4,
  },
  {
    id: "aurelia",
    name: "Aurelia",
    description: "The gilded core world. Take it and the galaxy is won.",
    cost: 1e10,
    multiplier: 1.5,
  },
];
