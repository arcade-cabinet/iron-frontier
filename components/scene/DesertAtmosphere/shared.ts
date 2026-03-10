import Alea from "alea";
import {
  createMetalTexture,
  createRustTexture,
  createWoodTexture,
} from "@/src/game/engine/materials";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const BUZZARD_COUNT = 5;
export const TUMBLEWEED_COUNT = 4;
export const GROUND_PATCH_COUNT = 40;
export const STONE_COUNT = 60;
export const TELEGRAPH_POLE_COUNT = 7;
export const FENCE_POST_COUNT = 12;
export const CLOUD_COUNT = 6;
export const DUST_WISP_COUNT = 15;

// ---------------------------------------------------------------------------
// PRNG
// ---------------------------------------------------------------------------

export type PRNG = () => number;

export function makePrng(seed: string): PRNG {
  return Alea(seed) as unknown as PRNG;
}

// ---------------------------------------------------------------------------
// Cached material factories
// ---------------------------------------------------------------------------

export const TELEGRAPH_POLE_MAT = () => createWoodTexture("#5C3317", "#3A1F0E");
export const FENCE_POST_MAT = () => createWoodTexture("#6B5240", "#4A3828");
export const FENCE_RAIL_MAT = () => createWoodTexture("#7A6B5A", "#5A4A38");
export const RAILROAD_TIE_MAT = () => createWoodTexture("#5C3317", "#3A1F0E");
export const RAILROAD_RAIL_MAT = () => createRustTexture("#555555");
export const WINDMILL_LEG_MAT = () => createWoodTexture("#6B5B4B", "#4A3A2A");
export const WINDMILL_PLATFORM_MAT = () => createWoodTexture("#5C4033", "#3A2A1E");
export const WINDMILL_BLADE_MAT = () => createMetalTexture("#AAAAAA", "#888888");
export const WINDMILL_HUB_MAT = () => createMetalTexture("#555555", "#3A3A3A");
export const WINDMILL_VANE_MAT = () => createMetalTexture("#888888", "#666666");
