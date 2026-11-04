// Vite asset imports return URL strings, not file contents; this module
// maps each game image to its production-safe URL so art survives
// deployment under any base path. Presentation-only: game data never
// touches asset URLs.
// @deno-types="../asset-url.d.ts"
import soldierUrl from "./soldier.svg?no-inline";
// @deno-types="../asset-url.d.ts"
import ferrumUrl from "./planet-ferrum.svg?no-inline";
// @deno-types="../asset-url.d.ts"
import verdantUrl from "./planet-verdant.svg?no-inline";
// @deno-types="../asset-url.d.ts"
import pyrosUrl from "./planet-pyros.svg?no-inline";
// @deno-types="../asset-url.d.ts"
import thalassaUrl from "./planet-thalassa.svg?no-inline";
// @deno-types="../asset-url.d.ts"
import umbraUrl from "./planet-umbra.svg?no-inline";
// @deno-types="../asset-url.d.ts"
import cryosUrl from "./planet-cryos.svg?no-inline";
// @deno-types="../asset-url.d.ts"
import zephyrUrl from "./planet-zephyr.svg?no-inline";
// @deno-types="../asset-url.d.ts"
import rubiconUrl from "./planet-rubicon.svg?no-inline";
// @deno-types="../asset-url.d.ts"
import aureliaUrl from "./planet-aurelia.svg?no-inline";

export const SOLDIER_ICON = soldierUrl;

/** Planet id -> card art. */
export const PLANET_IMAGES: Record<string, string> = {
  ferrum: ferrumUrl,
  verdant: verdantUrl,
  pyros: pyrosUrl,
  thalassa: thalassaUrl,
  umbra: umbraUrl,
  cryos: cryosUrl,
  zephyr: zephyrUrl,
  rubicon: rubiconUrl,
  aurelia: aureliaUrl,
};
