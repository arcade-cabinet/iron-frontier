/**
 * LocationLoader - Converts spatial Location data into renderable HexGrid
 *
 * Takes decoupled Location schema data and produces the tile map
 * that HexGridRenderer can display.
 */

import { ASSEMBLAGES_BY_ID } from '@iron-frontier/shared/data/assemblages/library';
import {
  type AssemblageRef,
  type Location,
  type SlotInstance,
  HexCoord as SpatialHexCoord,
  TerrainTypeSchema,
  type TileDef,
} from '@iron-frontier/shared/data/schemas/spatial';
import { createEmptyGrid, type HexGrid } from './HexGridRenderer';
import {
  createEmptyTile,
  DEFAULT_HEX_LAYOUT,
  HexBuildingType,
  type HexCoord,
  HexEdgeType,
  HexElevation,
  HexFeatureType,
  HexTerrainType,
  type HexTileData,
  hexKey,
} from './HexTypes';

// ============================================================================
// TERRAIN MAPPING
// ============================================================================

/**
 * Map spatial schema terrain to HexTerrainType enum
 */
function mapTerrain(terrain: string): HexTerrainType {
  const mapping: Record<string, HexTerrainType> = {
    grass: HexTerrainType.Grass,
    grass_hill: HexTerrainType.GrassHill,
    grass_forest: HexTerrainType.GrassForest,
    sand: HexTerrainType.Sand,
    sand_hill: HexTerrainType.SandHill,
    sand_dunes: HexTerrainType.SandDunes,
    dirt: HexTerrainType.Dirt,
    dirt_hill: HexTerrainType.DirtHill,
    stone: HexTerrainType.Stone,
    stone_hill: HexTerrainType.StoneHill,
    stone_mountain: HexTerrainType.StoneMountain,
    stone_rocks: HexTerrainType.StoneRocks,
    water: HexTerrainType.Water,
    water_shallow: HexTerrainType.WaterShallow,
    water_deep: HexTerrainType.WaterDeep,
    mesa: HexTerrainType.Mesa,
    canyon: HexTerrainType.Canyon,
    badlands: HexTerrainType.Badlands,
  };
  return mapping[terrain] ?? HexTerrainType.Dirt;
}

/**
 * Map spatial schema structure to HexBuildingType enum
 */
function mapStructure(structure: string): HexBuildingType {
  const mapping: Record<string, HexBuildingType> = {
    none: HexBuildingType.None,
    cabin: HexBuildingType.Cabin,
    house: HexBuildingType.House,
    mansion: HexBuildingType.Mansion,
    saloon_building: HexBuildingType.Saloon,
    store_building: HexBuildingType.GeneralStore,
    bank_building: HexBuildingType.Bank,
    hotel_building: HexBuildingType.Hotel,
    mine_building: HexBuildingType.Mine,
    smelter_building: HexBuildingType.Smelter,
    workshop_building: HexBuildingType.Workshop,
    windmill: HexBuildingType.Windmill,
    water_tower: HexBuildingType.WaterTower,
    office_building: HexBuildingType.SheriffOffice,
    church_building: HexBuildingType.Church,
    station_building: HexBuildingType.TrainStation,
    telegraph_building: HexBuildingType.Telegraph,
    well: HexBuildingType.Well,
    stable: HexBuildingType.Stable,
    warehouse: HexBuildingType.Warehouse,
    dock: HexBuildingType.Dock,
    watch_tower: HexBuildingType.WatchTower,
    fort: HexBuildingType.Fort,
  };
  return mapping[structure] ?? HexBuildingType.None;
}

/**
 * Map spatial schema feature to HexFeatureType enum
 */
function mapFeature(feature: string): HexFeatureType {
  const mapping: Record<string, HexFeatureType> = {
    none: HexFeatureType.None,
    // Vegetation
    tree: HexFeatureType.Tree,
    tree_dead: HexFeatureType.TreeDead,
    bush: HexFeatureType.Bush,
    cactus: HexFeatureType.Cactus,
    cactus_tall: HexFeatureType.CactusTall,
    stump: HexFeatureType.Stump,
    log: HexFeatureType.Log,
    // Rocks
    rock_small: HexFeatureType.RockSmall,
    rock_large: HexFeatureType.RockLarge,
    boulder: HexFeatureType.Boulder,
    // Resources
    ore_vein: HexFeatureType.OreDeposit,
    ore_deposit: HexFeatureType.OreDeposit,
    oil_seep: HexFeatureType.OilSeep,
    spring: HexFeatureType.Spring,
    // Western Props
    barrel: HexFeatureType.Barrel,
    barrel_water: HexFeatureType.BarrelWater,
    barrel_hay: HexFeatureType.BarrelHay,
    fence: HexFeatureType.Fence,
    bench: HexFeatureType.Bench,
    cart: HexFeatureType.Cart,
    wanted_poster: HexFeatureType.WantedPoster,
    signpost: HexFeatureType.Signpost,
    // Special
    ruins: HexFeatureType.Ruins,
    campfire_pit: HexFeatureType.Camp,
    camp: HexFeatureType.Camp,
  };
  return mapping[feature] ?? HexFeatureType.None;
}

/**
 * Map spatial schema edge to HexEdgeType enum
 */
function mapEdge(edge: string): HexEdgeType {
  const mapping: Record<string, HexEdgeType> = {
    none: HexEdgeType.None,
    river: HexEdgeType.River,
    road: HexEdgeType.Road,
    railroad: HexEdgeType.Railroad,
    cliff: HexEdgeType.Cliff,
    bridge: HexEdgeType.Bridge,
    ford: HexEdgeType.Ford,
    fence: HexEdgeType.Fence,
  };
  return mapping[edge] ?? HexEdgeType.None;
}

// ============================================================================
// TILE CONVERSION
// ============================================================================

/**
 * Convert a spatial TileDef to a renderable HexTileData
 */
function convertTile(
  tile: TileDef,
  offsetQ: number = 0,
  offsetR: number = 0,
  slotRotation: number = 0
): HexTileData {
  const terrain = mapTerrain(tile.terrain);
  const coord = {
    q: tile.coord.q + offsetQ,
    r: tile.coord.r + offsetR,
  };

  // Map edges if provided
  const edges: [HexEdgeType, HexEdgeType, HexEdgeType, HexEdgeType, HexEdgeType, HexEdgeType] =
    tile.edges
      ? [
          mapEdge(tile.edges[0]),
          mapEdge(tile.edges[1]),
          mapEdge(tile.edges[2]),
          mapEdge(tile.edges[3]),
          mapEdge(tile.edges[4]),
          mapEdge(tile.edges[5]),
        ]
      : [
          HexEdgeType.None,
          HexEdgeType.None,
          HexEdgeType.None,
          HexEdgeType.None,
          HexEdgeType.None,
          HexEdgeType.None,
        ];

  // Combine tile's structure rotation with slot rotation
  const building = mapStructure(tile.structure ?? 'none');
  const baseRotation = tile.structureRotation ?? 0;
  const finalRotation = building !== HexBuildingType.None ? (baseRotation + slotRotation) % 6 : 0;

  return {
    coord,
    terrain,
    elevation: (tile.elevation ?? 0) as HexElevation,
    edges: { edges },
    feature: mapFeature(tile.feature ?? 'none'),
    building,
    buildingRotation: finalRotation,
    isPassable:
      terrain !== HexTerrainType.Water &&
      terrain !== HexTerrainType.WaterDeep &&
      terrain !== HexTerrainType.StoneMountain,
    isWater:
      terrain === HexTerrainType.Water ||
      terrain === HexTerrainType.WaterShallow ||
      terrain === HexTerrainType.WaterDeep,
    isBuildable:
      terrain !== HexTerrainType.Water &&
      terrain !== HexTerrainType.WaterDeep &&
      terrain !== HexTerrainType.StoneMountain,
    modelVariant: tile.variant ?? 0,
    rotationOffset: 0,
  };
}

// ============================================================================
// LOCATION LOADER
// ============================================================================

export interface LoadedLocation {
  grid: HexGrid;
  entryPoints: Map<string, HexCoord>;
  playerSpawn: HexCoord;
  playerSpawnFacing?: number;
  slots: SlotInstance[];
  name: string;
  seed: number;
}

/**
 * Expand an assemblage reference into a slot instance
 */
function expandAssemblageRef(ref: AssemblageRef): SlotInstance | null {
  const assemblage = ASSEMBLAGES_BY_ID.get(ref.assemblageId);
  if (!assemblage) {
    console.warn(`[LocationLoader] Assemblage not found: ${ref.assemblageId}`);
    return null;
  }

  // Create a slot instance from the assemblage template
  return {
    id: ref.instanceId,
    type: ref.slotTypeOverride ?? assemblage.primarySlot,
    name: assemblage.name,
    anchor: ref.anchor,
    rotation: ref.rotation,
    tiles: assemblage.tiles,
    markers: assemblage.markers,
    zones: assemblage.zones,
    tags: [...assemblage.tags, ...ref.tags],
    importance: ref.importance ?? 3,
  };
}

/**
 * Load a Location into a renderable HexGrid
 */
export function loadLocation(location: Location): LoadedLocation {
  console.log(`[LocationLoader] Loading location: ${location.name}`);

  // Create empty grid
  const grid = createEmptyGrid(DEFAULT_HEX_LAYOUT);

  // Set bounds based on location dimensions
  grid.bounds = {
    minQ: 0,
    maxQ: location.width - 1,
    minR: 0,
    maxR: location.height - 1,
  };

  // Fill with base terrain
  const baseTerrain = mapTerrain(location.baseTerrain);
  for (let q = 0; q < location.width; q++) {
    for (let r = 0; r < location.height; r++) {
      const coord = { q, r };
      const tile: HexTileData = {
        coord,
        terrain: baseTerrain,
        elevation: HexElevation.Ground,
        edges: {
          edges: [
            HexEdgeType.None,
            HexEdgeType.None,
            HexEdgeType.None,
            HexEdgeType.None,
            HexEdgeType.None,
            HexEdgeType.None,
          ],
        },
        feature: HexFeatureType.None,
        building: HexBuildingType.None,
        buildingRotation: 0,
        isPassable: true,
        isWater: false,
        isBuildable: true,
        modelVariant: (q + r) % 4, // Simple variation pattern
        rotationOffset: (q * 3 + r * 7) % 6, // Pseudo-random rotation
      };
      grid.tiles.set(hexKey(coord), tile);
    }
  }

  console.log(
    `[LocationLoader] Created ${location.width}x${location.height} base grid with ${baseTerrain}`
  );

  // Apply base tiles (roads, terrain shaping)
  for (const tileDef of location.baseTiles) {
    const tile = convertTile(tileDef);
    grid.tiles.set(hexKey(tile.coord), tile);
  }

  console.log(`[LocationLoader] Applied ${location.baseTiles.length} base tile overrides`);

  // Expand assemblage references into slots
  const expandedSlots: SlotInstance[] = [];
  for (const ref of location.assemblages ?? []) {
    const slot = expandAssemblageRef(ref);
    if (slot) {
      expandedSlots.push(slot);
    }
  }

  console.log(`[LocationLoader] Expanded ${expandedSlots.length} assemblage references`);

  // Combine inline slots with expanded assemblage slots
  const allSlots = [...location.slots, ...expandedSlots];

  // Apply slot tiles
  let slotTileCount = 0;
  for (const slot of allSlots) {
    // Apply each tile in the slot, offset by the slot's anchor position
    // Pass slot rotation to be applied to building rotations
    for (const tileDef of slot.tiles) {
      const tile = convertTile(tileDef, slot.anchor.q, slot.anchor.r, slot.rotation);
      grid.tiles.set(hexKey(tile.coord), tile);
      slotTileCount++;
    }
  }

  console.log(`[LocationLoader] Applied ${slotTileCount} tiles from ${allSlots.length} slots`);

  // Extract entry points (convert from spatial coords to engine coords)
  const entryPoints = new Map<string, HexCoord>();
  for (const entry of location.entryPoints) {
    const coord: HexCoord = {
      q: entry.coord.q,
      r: entry.coord.r,
    };
    entryPoints.set(entry.id, coord);
  }

  console.log(`[LocationLoader] Registered ${entryPoints.size} entry points`);

  // Determine player spawn point
  let playerSpawn: HexCoord;
  let playerSpawnFacing: number | undefined;

  if (location.playerSpawn) {
    // Use explicit spawn point from town planner
    playerSpawn = {
      q: location.playerSpawn.coord.q,
      r: location.playerSpawn.coord.r,
    };
    playerSpawnFacing = location.playerSpawn.facing;
    console.log(
      `[LocationLoader] Using explicit player spawn: (${playerSpawn.q}, ${playerSpawn.r})`
    );
  } else {
    // Fall back to first entry point
    const firstEntry = location.entryPoints[0];
    playerSpawn = {
      q: firstEntry.coord.q,
      r: firstEntry.coord.r,
    };
    console.log(
      `[LocationLoader] Using first entry point as spawn: (${playerSpawn.q}, ${playerSpawn.r})`
    );
  }

  return {
    grid,
    entryPoints,
    playerSpawn,
    playerSpawnFacing,
    slots: allSlots,
    name: location.name,
    seed: location.seed,
  };
}

/**
 * Get the player spawn point from a loaded location
 */
export function getDefaultSpawnPoint(loaded: LoadedLocation): HexCoord {
  // Use the pre-computed playerSpawn (already determined during load)
  return loaded.playerSpawn;
}

/**
 * Get the player spawn facing direction (if specified)
 */
export function getSpawnFacing(loaded: LoadedLocation): number | undefined {
  return loaded.playerSpawnFacing;
}
