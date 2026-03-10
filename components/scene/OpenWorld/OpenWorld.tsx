// OpenWorld — R3F open world composition: chunks, towns, routes, vegetation.
//
// Uses the src/game/engine/world/ system for 256x256 chunks, terrain
// flattening under buildings, and internal road connections within towns.

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type * as THREE from "three";
import { VegetationField } from "@/components/scene/VegetationField";

import { WorldManager } from "@/engine/spatial/WorldManager";
import type { World } from "@/src/game/data/schemas/world";
import { getDoorSystem } from "@/src/game/engine/interiors/DoorSystem";
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
} from "@/src/game/engine/world/index";
import { getEncounterSystem } from "@/src/game/systems/EncounterSystem";
import { getTownBoundarySystem } from "@/src/game/systems/TownBoundarySystem";

import { TownBuilding } from "./TownBuilding.tsx";

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
  }, [seed, loadRadius, renderRadius, worldManager, allFlattenZones]);

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
