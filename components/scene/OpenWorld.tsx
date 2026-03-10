// OpenWorld — R3F open world composition: chunks, towns, routes, vegetation.
//
// Uses the src/game/engine/world/ system for 256x256 chunks, terrain
// flattening under buildings, and internal road connections within towns.

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { VegetationField } from "@/components/scene/VegetationField";

import { WorldManager } from "@/engine/spatial/WorldManager";
import type { World } from "@/src/game/data/schemas/world";
import { ARCHETYPE_REGISTRY } from "@/src/game/engine/archetypes/index";
import { getDoorSystem } from "@/src/game/engine/interiors/DoorSystem";
import {
  addInteriorLighting,
  getDoorWorldPosition,
  hasInterior,
} from "@/src/game/engine/interiors/InteriorGenerator";
import {
  createGlassTexture,
  createMetalTexture,
  createPBRClayAdobe,
  createPBRMetalCorrugated,
  createPBRMetalRusted,
  createPBRRustHeavy,
  createPBRStoneRough,
  createPBRWoodAged,
  createPBRWoodPlanks,
  createPBRWoodSiding,
  createRustTexture,
  createStoneTexture,
  createWoodTexture,
} from "@/src/game/engine/materials";
import {
  buildAllRoutes,
  buildInternalRoadMesh,
  CHUNK_SIZE,
  ChunkManager,
  type ChunkState,
  DEFAULT_LOAD_RADIUS as CONFIG_LOAD_RADIUS,
  DEFAULT_RENDER_RADIUS as CONFIG_RENDER_RADIUS,
  DEFAULT_SEED as CONFIG_SEED,
  DEFAULT_VIEW_DISTANCE as CONFIG_VIEW_DISTANCE,
  collectRouteFlattenZones,
  type FlattenZone,
  placeTown,
  type TownPlacement,
  WORLD_CELL_SIZE,
} from "@/src/game/engine/world/index";
import { getEncounterSystem } from "@/src/game/systems/EncounterSystem";
import { getTownBoundarySystem } from "@/src/game/systems/TownBoundarySystem";

/** Distance at which building interiors become visible (meters). */
const INTERIOR_RENDER_DISTANCE = 30;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface OpenWorldProps {
  /** World definition to render. */
  world: World;
  /** World seed string. */
  seed?: string;
  /** How far towns/routes are visible (world units). */
  viewDistance?: number;
  /** Chunk load radius (chunks in each direction). */
  loadRadius?: number;
  /** Chunk render (full detail) radius. */
  renderRadius?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OpenWorld({
  world,
  seed = CONFIG_SEED,
  viewDistance = CONFIG_VIEW_DISTANCE,
  loadRadius = CONFIG_LOAD_RADIUS,
  renderRadius = CONFIG_RENDER_RADIUS,
}: OpenWorldProps) {
  const { camera } = useThree();

  // World manager — handles town transitions, biome lookups, connections
  const worldManager = useMemo(() => new WorldManager(world), [world]);

  // Pre-build town placements (buildings, NPCs, props, flatten zones)
  const townPlacements = useMemo(() => {
    const placements = new Map<string, TownPlacement>();
    for (const town of worldManager.getAllTowns()) {
      if (town.location) {
        const placement = placeTown(town.location, town.worldPosition);
        placements.set(town.ref.id, placement);
      }
    }
    return placements;
  }, [worldManager]);

  // Build route segments (roads, trails, railroads between towns)
  const routes = useMemo(() => {
    return buildAllRoutes(
      worldManager.getConnections(),
      (id) => worldManager.getLocationPosition(id),
      seed,
    );
  }, [worldManager, seed]);

  // Collect all flatten zones from towns AND routes
  const allFlattenZones = useMemo(() => {
    const zones: FlattenZone[] = [];
    // Town building footprints
    for (const placement of townPlacements.values()) {
      for (const fz of placement.flattenZones) {
        zones.push(fz);
      }
    }
    // Route flatten zones (road beds)
    zones.push(...collectRouteFlattenZones(routes));
    return zones;
  }, [townPlacements, routes]);

  // Chunk manager — creates and manages 256x256 terrain chunks
  const chunkManager = useMemo(() => {
    const cm = new ChunkManager(
      { loadRadius, renderRadius, seed, defaultBiome: "desert" },
      (cx, cz) => {
        return worldManager.getBiomeAt(
          cx * CHUNK_SIZE + CHUNK_SIZE / 2,
          cz * CHUNK_SIZE + CHUNK_SIZE / 2,
        );
      },
    );
    // Register flatten zones before first update so terrain is flat under buildings
    cm.addFlattenZones(allFlattenZones);
    return cm;
  }, [world, seed, loadRadius, renderRadius, worldManager, allFlattenZones]);

  // Clean up on unmount
  useEffect(() => {
    return () => chunkManager.dispose();
  }, [chunkManager]);

  // Pre-build internal road meshes for each town
  const internalRoadMeshes = useMemo(() => {
    const meshes: Array<{ key: string; mesh: THREE.Mesh }> = [];
    for (const [townId, placement] of townPlacements) {
      for (let i = 0; i < placement.internalRoads.length; i++) {
        const road = placement.internalRoads[i];
        meshes.push({
          key: `${townId}-road-${i}`,
          mesh: buildInternalRoadMesh(road.from, road.to, road.width),
        });
      }
    }
    return meshes;
  }, [townPlacements]);

  // Track rendered chunks
  const [chunks, setChunks] = useState<readonly ChunkState[]>([]);
  const lastChunkCenter = useRef({ cx: -9999, cz: -9999 });

  // Visible towns (updated per frame)
  const [visibleTownIds, setVisibleTownIds] = useState<Set<string>>(() => new Set());

  // Town boundary system integration
  const townBoundary = useMemo(() => getTownBoundarySystem(), []);
  const encounterSystem = useMemo(() => getEncounterSystem(), []);
  const doorSystem = useMemo(() => getDoorSystem(), []);

  // Track town visibility factors for smooth fading
  const [townOpacities, setTownOpacities] = useState<Map<string, number>>(() => new Map());

  // Per-frame update
  useFrame((_state, dt) => {
    const px = camera.position.x;
    const pz = camera.position.z;

    // Animate doors (smooth 0.3s open/close rotation)
    doorSystem.update(dt);

    // Update chunk manager when player crosses a chunk boundary
    const cx = Math.floor(px / CHUNK_SIZE);
    const cz = Math.floor(pz / CHUNK_SIZE);

    if (cx !== lastChunkCenter.current.cx || cz !== lastChunkCenter.current.cz) {
      lastChunkCenter.current = { cx, cz };
      const updated = chunkManager.update(px, pz);
      setChunks(updated);
    }

    // Update world manager for town transition events
    worldManager.tick(px, camera.position.y, pz, loadRadius);

    // Update town boundary system
    townBoundary.update(px, pz);

    // Feed distance-to-town into the encounter system for safety suppression
    const distToTown = worldManager.getDistanceToNearestTown(px, pz);
    encounterSystem.setDistanceToTown(distToTown);

    // Update encounter system with player position
    encounterSystem.updatePosition(px, pz);

    // Update visible towns with smooth fade based on distance
    const visible = worldManager.getVisibleTowns(px, pz, viewDistance);
    const visibleIds = new Set(visible.map((t) => t.ref.id));

    // Calculate opacity for each visible town (smooth blend zone)
    const newOpacities = new Map<string, number>();
    for (const town of visible) {
      const opacity = townBoundary.getTownVisibility(town.ref.id, px, pz);
      // Clamp: always show if within view distance (min 0.3 opacity), full at boundary
      const clampedOpacity = opacity > 0 ? Math.max(0.3, opacity) : 1;
      newOpacities.set(town.ref.id, clampedOpacity);
    }

    // Only update React state if the set actually changed
    if (visibleIds.size !== visibleTownIds.size) {
      setVisibleTownIds(visibleIds);
    }

    // Update opacities if any changed significantly
    let opacitiesChanged = false;
    for (const [id, opacity] of newOpacities) {
      const prev = townOpacities.get(id) ?? 1;
      if (Math.abs(prev - opacity) > 0.05) {
        opacitiesChanged = true;
        break;
      }
    }
    if (opacitiesChanged || newOpacities.size !== townOpacities.size) {
      setTownOpacities(newOpacities);
    }
  });

  return (
    <group name="open-world">
      {/* Terrain chunks (256x256 with flattened building zones) */}
      <group name="terrain-chunks">
        {chunks.map((chunk) => (
          <primitive key={chunk.key} object={chunk.mesh} />
        ))}
      </group>

      {/* Inter-town route segments (roads, trails, railroads) */}
      <group name="routes">
        {routes.map((route) => (
          <primitive key={route.connectionId} object={route.group} />
        ))}
      </group>

      {/* Internal town road strips */}
      <group name="internal-roads">
        {internalRoadMeshes.map(({ key, mesh }) => (
          <primitive key={key} object={mesh} />
        ))}
      </group>

      {/* Town buildings (with smooth fade at boundary) */}
      <group name="towns">
        {Array.from(townPlacements.entries()).map(([townId, placement]) => {
          if (!visibleTownIds.has(townId)) return null;
          return (
            <group key={townId} name={`town-${townId}`}>
              {placement.buildings.map((building) => (
                <TownBuilding
                  key={building.id}
                  id={building.id}
                  position={building.position}
                  rotation={building.rotation}
                  structureType={building.structureType}
                  name={building.name}
                  importance={building.importance}
                />
              ))}
            </group>
          );
        })}
      </group>

      {/* Signposts at road junctions (placed at town entry points) */}
      <group name="signposts">
        {routes.map((route) => {
          // Place a signpost at the midpoint of each route
          if (!route.group.children.length) return null;
          return null; // Signpost geometry handled by RouteRenderer
        })}
      </group>

      {/* Vegetation for full-detail chunks */}
      <group name="vegetation">
        {chunks
          .filter((c) => c.fullDetail)
          .map((chunk) => (
            <VegetationField
              key={`veg-${chunk.key}`}
              center={[
                chunk.cx * CHUNK_SIZE + CHUNK_SIZE / 2,
                0,
                chunk.cz * CHUNK_SIZE + CHUNK_SIZE / 2,
              ]}
              radius={CHUNK_SIZE / 2}
              seed={`${seed}:veg:${chunk.key}`}
              density={chunk.biome === "grassland" ? 0.03 : 0.015}
              viewDistance={80}
            />
          ))}
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// TownBuilding sub-component
// ---------------------------------------------------------------------------

interface TownBuildingProps {
  id: string;
  position: [number, number, number];
  rotation: number;
  structureType: string;
  name: string;
  importance: number;
}

/** Renders a single building using the archetype registry or a fallback box.
 *  Adds interior lighting and registers doors with the DoorSystem for
 *  archetypes that have walkable interiors. */
function TownBuilding({
  id,
  position,
  rotation,
  structureType,
  name,
  importance,
}: TownBuildingProps) {
  const groupRef = useRef<THREE.Group>(null);

  const archetypeKey = useMemo(
    () => STRUCTURE_TO_ARCHETYPE[structureType] ?? structureType,
    [structureType],
  );

  const buildingGroup = useMemo(() => {
    const archetype = ARCHETYPE_REGISTRY.get(archetypeKey);

    if (archetype) {
      const group = archetype.construct({ signText: name });

      // Add interior lighting (warm point lights, idempotent)
      addInteriorLighting(group, archetypeKey);

      return group;
    }

    // No archetype registered — use procedural PBR building
    console.warn(
      `[OpenWorld] No archetype "${archetypeKey}" for structure "${structureType}" — using procedural building`,
    );
    return buildFallbackBuilding(structureType, importance);
  }, [archetypeKey, structureType, name, importance]);

  // Register door trigger zone with the DoorSystem when mounted
  useEffect(() => {
    if (!hasInterior(archetypeKey)) return;

    const doorPos = getDoorWorldPosition(archetypeKey, position[0], position[2], rotation);
    if (!doorPos) return;

    const doorSystem = getDoorSystem();

    // Find the door mesh inside the building group for animation
    let doorMesh: THREE.Object3D | undefined;
    buildingGroup.traverse((child) => {
      if (child.name === "door" || child.name === "door-panel") {
        doorMesh = child;
      }
    });

    doorSystem.registerDoor(
      id,
      archetypeKey,
      name,
      new THREE.Vector3(doorPos.x, doorPos.y, doorPos.z),
      doorMesh,
    );

    return () => {
      doorSystem.unregisterDoor(id);
    };
  }, [id, archetypeKey, name, position, rotation, buildingGroup]);

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotation, 0]}
      name={`building-${id}`}
      userData={{ name, archetypeKey }}
    >
      <primitive object={buildingGroup} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STRUCTURE_TO_ARCHETYPE: Record<string, string> = {
  saloon_building: "saloon",
  store_building: "general_store",
  office_building: "doctor_office",
  bank_building: "bank",
  hotel_building: "inn",
  church_building: "church",
  telegraph_building: "telegraph_office",
  workshop_building: "blacksmith",
  mine_building: "mining_office",
  stable: "livery",
  // These have no matching archetype — fall through to procedural building
  station_building: "station",
  warehouse: "warehouse",
  mansion: "mansion",
  house: "house",
  cabin: "cabin",
  well: "well",
  water_tower: "water_tower",
  watch_tower: "watch_tower",
  fort: "fort",
};

// Material configs for fallback buildings: [wallFactory, roofFactory]
// Each factory returns a cached MeshStandardMaterial with a procedural texture.
type MaterialConfig = {
  wall: () => THREE.MeshStandardMaterial;
  roof: () => THREE.MeshStandardMaterial;
  trim?: () => THREE.MeshStandardMaterial;
};

const FALLBACK_MATERIALS: Record<string, MaterialConfig> = {
  saloon_building: {
    wall: () => createPBRWoodSiding(),
    roof: () => createPBRMetalCorrugated(),
  },
  store_building: {
    wall: () => createPBRWoodPlanks(),
    roof: () => createPBRMetalCorrugated(),
  },
  office_building: {
    wall: () => createPBRStoneRough(),
    roof: () => createPBRWoodAged(),
  },
  bank_building: {
    wall: () => createPBRStoneRough(),
    roof: () => createPBRMetalRusted(),
    trim: () => createPBRMetalRusted(),
  },
  hotel_building: {
    wall: () => createPBRWoodSiding(),
    roof: () => createPBRWoodAged(),
  },
  church_building: {
    wall: () => createPBRClayAdobe(),
    roof: () => createPBRWoodAged(),
  },
  station_building: {
    wall: () => createPBRStoneRough(),
    roof: () => createPBRMetalCorrugated(),
  },
  stable: {
    wall: () => createPBRWoodPlanks(),
    roof: () => createPBRWoodAged(),
  },
  mansion: {
    wall: () => createPBRClayAdobe(),
    roof: () => createPBRWoodAged(),
    trim: () => createPBRWoodSiding(),
  },
  house: {
    wall: () => createPBRWoodSiding(),
    roof: () => createPBRWoodPlanks(),
  },
  cabin: {
    wall: () => createPBRWoodPlanks(),
    roof: () => createPBRWoodAged(),
  },
  well: {
    wall: () => createPBRStoneRough(),
    roof: () => createPBRWoodAged(),
  },
  water_tower: {
    wall: () => createPBRMetalCorrugated(),
    roof: () => createPBRMetalRusted(),
    trim: () => createPBRWoodAged(),
  },
  warehouse: {
    wall: () => createPBRMetalCorrugated(),
    roof: () => createPBRRustHeavy(),
  },
};

function buildFallbackBuilding(structureType: string, importance: number): THREE.Group {
  const group = new THREE.Group();
  group.name = `fallback-${structureType}`;
  const w = 2 + importance * 0.5,
    h = 2 + importance * 0.4;

  const matConfig = FALLBACK_MATERIALS[structureType] ?? {
    wall: () => createWoodTexture("#7B6B5B", "#5A4A3A"),
    roof: () => createWoodTexture("#3A2518", "#2A1A10"),
  };

  // Main body — textured walls
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), matConfig.wall());
  body.position.y = h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Roof — textured
  const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.75, h * 0.4, 4), matConfig.roof());
  roof.position.y = h + h * 0.2;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);

  // Door — dark wood plank
  const doorMat = createWoodTexture("#3A2010", "#251508");
  const door = new THREE.Mesh(new THREE.BoxGeometry(w * 0.18, h * 0.45, 0.05), doorMat);
  door.position.set(0, h * 0.22, w / 2 + 0.025);
  door.name = "door-panel";
  group.add(door);

  // Windows — glass panes on two sides
  const glassMat = createGlassTexture("#C8DDE8");
  const windowGeo = new THREE.BoxGeometry(w * 0.15, h * 0.18, 0.03);
  const windowOffsetY = h * 0.55;

  // Front windows flanking the door
  const winL = new THREE.Mesh(windowGeo, glassMat);
  winL.position.set(-w * 0.28, windowOffsetY, w / 2 + 0.02);
  group.add(winL);
  const winR = new THREE.Mesh(windowGeo, glassMat);
  winR.position.set(w * 0.28, windowOffsetY, w / 2 + 0.02);
  group.add(winR);

  // Side windows
  const winSide = new THREE.Mesh(windowGeo, glassMat);
  winSide.position.set(w / 2 + 0.02, windowOffsetY, 0);
  winSide.rotation.y = Math.PI / 2;
  group.add(winSide);

  // Trim / accent details if configured
  if (matConfig.trim) {
    const trimMat = matConfig.trim();
    // Corner trim posts
    const trimGeo = new THREE.BoxGeometry(0.08, h, 0.08);
    const corners: [number, number][] = [
      [w / 2, w / 2],
      [-w / 2, w / 2],
      [w / 2, -w / 2],
      [-w / 2, -w / 2],
    ];
    for (const [cx, cz] of corners) {
      const post = new THREE.Mesh(trimGeo, trimMat);
      post.position.set(cx, h / 2, cz);
      post.castShadow = true;
      group.add(post);
    }
  }

  return group;
}
