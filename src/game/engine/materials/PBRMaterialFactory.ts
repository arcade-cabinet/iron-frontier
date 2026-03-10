// PBRMaterialFactory — Image-based PBR materials loaded from /textures/pbr/
// Uses TextureLoader to load color, normal, roughness, AO, and metalness maps
// from AmbientCG textures. Cached via globalTextureCache to avoid redundant loads.

import {
  LinearSRGBColorSpace,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  type Texture,
} from 'three';

import { globalTextureCache } from './TextureCache';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const loader = new TextureLoader();

/** Load a texture with proper wrapping and repeat, returns undefined if path is null. */
function loadTex(
  path: string | null,
  repeat: number,
  srgb: boolean,
): Texture | undefined {
  if (!path) return undefined;
  const tex = loader.load(path);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.colorSpace = srgb ? SRGBColorSpace : LinearSRGBColorSpace;
  return tex;
}

/** Texture map file paths for a single PBR material. */
interface PBRTexturePaths {
  color: string;
  normal: string;
  roughness: string;
  ao: string | null;
  metalness: string | null;
}

/** Build a MeshStandardMaterial from PBR texture paths, cached by name+repeat. */
function createPBRMaterial(
  name: string,
  paths: PBRTexturePaths,
  repeat: number,
  defaults?: { roughness?: number; metalness?: number },
): MeshStandardMaterial {
  const cacheKey = `pbr:${name}:${repeat}`;
  const hit = globalTextureCache.get(cacheKey);
  if (hit) return hit;

  const params: Record<string, unknown> = {
    map: loadTex(paths.color, repeat, true),
    normalMap: loadTex(paths.normal, repeat, false),
    roughnessMap: loadTex(paths.roughness, repeat, false),
    roughness: defaults?.roughness ?? 0.8,
    metalness: defaults?.metalness ?? 0.0,
  };
  // Only add optional maps if they resolve to actual textures
  const ao = loadTex(paths.ao, repeat, false);
  if (ao) params.aoMap = ao;
  const met = loadTex(paths.metalness, repeat, false);
  if (met) params.metalnessMap = met;

  const mat = new MeshStandardMaterial(params as ConstructorParameters<typeof MeshStandardMaterial>[0]);

  globalTextureCache.set(cacheKey, mat);
  return mat;
}

// ---------------------------------------------------------------------------
// Texture path definitions
// ---------------------------------------------------------------------------

const BASE = '/textures/pbr';

const PATHS = {
  wood_siding: {
    color: `${BASE}/wood_siding_color.jpg`,
    normal: `${BASE}/wood_siding_normal.jpg`,
    roughness: `${BASE}/wood_siding_roughness.jpg`,
    ao: `${BASE}/wood_siding_ao.jpg`,
    metalness: null,
  },
  wood_planks: {
    color: `${BASE}/wood_planks_color.jpg`,
    normal: `${BASE}/wood_planks_normal.jpg`,
    roughness: `${BASE}/wood_planks_roughness.jpg`,
    ao: `${BASE}/wood_planks_ao.jpg`,
    metalness: null,
  },
  wood_aged: {
    color: `${BASE}/wood_aged_color.jpg`,
    normal: `${BASE}/wood_aged_normal.jpg`,
    roughness: `${BASE}/wood_aged_roughness.jpg`,
    ao: null,
    metalness: null,
  },
  metal_corrugated: {
    color: `${BASE}/metal_corrugated_color.jpg`,
    normal: `${BASE}/metal_corrugated_normal.jpg`,
    roughness: `${BASE}/metal_corrugated_roughness.jpg`,
    ao: `${BASE}/metal_corrugated_ao.jpg`,
    metalness: `${BASE}/metal_corrugated_metalness.jpg`,
  },
  metal_rusted: {
    color: `${BASE}/metal_rusted_color.jpg`,
    normal: `${BASE}/metal_rusted_normal.jpg`,
    roughness: `${BASE}/metal_rusted_roughness.jpg`,
    ao: null,
    metalness: `${BASE}/metal_rusted_metalness.jpg`,
  },
  stone_rough: {
    color: `${BASE}/stone_rough_color.jpg`,
    normal: `${BASE}/stone_rough_normal.jpg`,
    roughness: `${BASE}/stone_rough_roughness.jpg`,
    ao: `${BASE}/stone_rough_ao.jpg`,
    metalness: null,
  },
  clay_adobe: {
    color: `${BASE}/clay_adobe_color.jpg`,
    normal: `${BASE}/clay_adobe_normal.jpg`,
    roughness: `${BASE}/clay_adobe_roughness.jpg`,
    ao: `${BASE}/clay_adobe_ao.jpg`,
    metalness: null,
  },
  brick_old: {
    color: `${BASE}/brick_old_color.jpg`,
    normal: `${BASE}/brick_old_normal.jpg`,
    roughness: `${BASE}/brick_old_roughness.jpg`,
    ao: `${BASE}/brick_old_ao.jpg`,
    metalness: null,
  },
  ground_desert: {
    color: `${BASE}/ground_desert_color.jpg`,
    normal: `${BASE}/ground_desert_normal.jpg`,
    roughness: `${BASE}/ground_desert_roughness.jpg`,
    ao: `${BASE}/ground_desert_ao.jpg`,
    metalness: null,
  },
  ground_sandy: {
    color: `${BASE}/ground_sandy_color.jpg`,
    normal: `${BASE}/ground_sandy_normal.jpg`,
    roughness: `${BASE}/ground_sandy_roughness.jpg`,
    ao: `${BASE}/ground_sandy_ao.jpg`,
    metalness: null,
  },
  gravel_road: {
    color: `${BASE}/gravel_road_color.jpg`,
    normal: `${BASE}/gravel_road_normal.jpg`,
    roughness: `${BASE}/gravel_road_roughness.jpg`,
    ao: `${BASE}/gravel_road_ao.jpg`,
    metalness: null,
  },
  rust_heavy: {
    color: `${BASE}/rust_heavy_color.jpg`,
    normal: `${BASE}/rust_heavy_normal.jpg`,
    roughness: `${BASE}/rust_heavy_roughness.jpg`,
    ao: null,
    metalness: `${BASE}/rust_heavy_metalness.jpg`,
  },
} as const satisfies Record<string, PBRTexturePaths>;

// ---------------------------------------------------------------------------
// Public factory functions
// ---------------------------------------------------------------------------

export function createPBRWoodSiding(repeat = 2): MeshStandardMaterial {
  return createPBRMaterial('wood_siding', PATHS.wood_siding, repeat);
}

export function createPBRWoodPlanks(repeat = 2): MeshStandardMaterial {
  return createPBRMaterial('wood_planks', PATHS.wood_planks, repeat);
}

export function createPBRWoodAged(repeat = 2): MeshStandardMaterial {
  return createPBRMaterial('wood_aged', PATHS.wood_aged, repeat);
}

export function createPBRMetalCorrugated(repeat = 2): MeshStandardMaterial {
  return createPBRMaterial('metal_corrugated', PATHS.metal_corrugated, repeat, {
    metalness: 0.8,
  });
}

export function createPBRMetalRusted(repeat = 2): MeshStandardMaterial {
  return createPBRMaterial('metal_rusted', PATHS.metal_rusted, repeat, {
    metalness: 0.6,
  });
}

export function createPBRStoneRough(repeat = 2): MeshStandardMaterial {
  return createPBRMaterial('stone_rough', PATHS.stone_rough, repeat);
}

export function createPBRClayAdobe(repeat = 2): MeshStandardMaterial {
  return createPBRMaterial('clay_adobe', PATHS.clay_adobe, repeat);
}

export function createPBRBrickOld(repeat = 2): MeshStandardMaterial {
  return createPBRMaterial('brick_old', PATHS.brick_old, repeat);
}

export function createPBRGroundDesert(repeat = 4): MeshStandardMaterial {
  return createPBRMaterial('ground_desert', PATHS.ground_desert, repeat);
}

export function createPBRGroundSandy(repeat = 4): MeshStandardMaterial {
  return createPBRMaterial('ground_sandy', PATHS.ground_sandy, repeat);
}

export function createPBRGravelRoad(repeat = 4): MeshStandardMaterial {
  return createPBRMaterial('gravel_road', PATHS.gravel_road, repeat);
}

export function createPBRRustHeavy(repeat = 2): MeshStandardMaterial {
  return createPBRMaterial('rust_heavy', PATHS.rust_heavy, repeat, {
    metalness: 0.5,
  });
}
