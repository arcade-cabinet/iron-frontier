/**
 * EncounterZones.tsx - Invisible trigger zones for random encounters
 *
 * Features:
 * - Define where random encounters happen on the overworld
 * - Connect to EncounterSystem from shared package
 * - Visual debug mode to see zone boundaries
 * - Zone type visualization (danger level, terrain type)
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';

import {
  getEncounterSystem,
  createRouteEncounterZones,
  type EncounterZone,
} from '@iron-frontier/shared/systems';
import { TOWN_POSITIONS } from '@iron-frontier/shared/systems';

// ============================================================================
// TYPES
// ============================================================================

export interface EncounterZonesProps {
  /** Current player position */
  playerPosition: THREE.Vector3;
  /** Whether to show debug visualization */
  debugMode?: boolean;
  /** Called when entering an encounter zone */
  onZoneEnter?: (zoneId: string) => void;
  /** Called when exiting an encounter zone */
  onZoneExit?: (zoneId: string) => void;
}

interface EncounterZoneVisual {
  id: string;
  name: string;
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  terrain: string;
  baseRate: number;
  color: THREE.Color;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Terrain type to color mapping for debug visualization */
const TERRAIN_COLORS: Record<string, THREE.Color> = {
  grass: new THREE.Color(0x228b22), // Forest green
  desert: new THREE.Color(0xdaa520), // Goldenrod
  mountain: new THREE.Color(0x696969), // Dim gray
  road: new THREE.Color(0x8b4513), // Saddle brown
  forest: new THREE.Color(0x006400), // Dark green
};

/** Route definitions connecting towns */
const ROUTE_DEFINITIONS = [
  {
    id: 'dusty_trail',
    name: 'Dusty Trail',
    from: 'frontiers_edge',
    to: 'iron_gulch',
    width: 100,
  },
  {
    id: 'canyon_pass',
    name: 'Canyon Pass',
    from: 'iron_gulch',
    to: 'mesa_point',
    width: 80,
  },
  {
    id: 'riverside_path',
    name: 'Riverside Path',
    from: 'iron_gulch',
    to: 'coldwater',
    width: 70,
  },
  {
    id: 'forest_road',
    name: 'Forest Road',
    from: 'coldwater',
    to: 'salvation',
    width: 60,
  },
  {
    id: 'main_road',
    name: 'Main Road',
    from: 'mesa_point',
    to: 'salvation',
    width: 90,
  },
];

// ============================================================================
// ZONE DATA BUILDER
// ============================================================================

function buildEncounterZoneVisuals(): EncounterZoneVisual[] {
  const zones: EncounterZoneVisual[] = [];
  const encounterZones = createRouteEncounterZones();

  // Map encounter zones by ID
  const encounterZoneMap = new Map(encounterZones.map((z) => [z.id, z]));

  // Build visual data for each route
  for (const route of ROUTE_DEFINITIONS) {
    const encounterZone = encounterZoneMap.get(route.id);
    if (!encounterZone) continue;

    // Get town positions
    const fromTown = TOWN_POSITIONS[route.from] ?? { x: 0, z: 0 };
    const toTown = TOWN_POSITIONS[route.to] ?? { x: 100, z: 100 };

    // Calculate bounding box for the route
    const minX = Math.min(fromTown.x, toTown.x) - route.width / 2;
    const maxX = Math.max(fromTown.x, toTown.x) + route.width / 2;
    const minZ = Math.min(fromTown.z, toTown.z) - route.width / 2;
    const maxZ = Math.max(fromTown.z, toTown.z) + route.width / 2;

    const color = TERRAIN_COLORS[encounterZone.terrain] ?? TERRAIN_COLORS.desert;

    zones.push({
      id: route.id,
      name: route.name,
      bounds: { minX, maxX, minZ, maxZ },
      terrain: encounterZone.terrain,
      baseRate: encounterZone.baseRate,
      color,
    });
  }

  return zones;
}

// ============================================================================
// DEBUG ZONE VISUAL COMPONENT
// ============================================================================

interface DebugZoneVisualProps {
  zone: EncounterZoneVisual;
  playerPosition: THREE.Vector3;
  isPlayerInside: boolean;
}

function DebugZoneVisual({ zone, playerPosition, isPlayerInside }: DebugZoneVisualProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Calculate zone dimensions
  const width = zone.bounds.maxX - zone.bounds.minX;
  const depth = zone.bounds.maxZ - zone.bounds.minZ;
  const centerX = (zone.bounds.minX + zone.bounds.maxX) / 2;
  const centerZ = (zone.bounds.minZ + zone.bounds.maxZ) / 2;

  // Animate opacity based on player proximity
  const [opacity, setOpacity] = useState(0.1);

  useFrame(() => {
    const dx = playerPosition.x - centerX;
    const dz = playerPosition.z - centerZ;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const maxDist = Math.max(width, depth);

    // Increase opacity as player gets closer
    const targetOpacity = isPlayerInside ? 0.4 : Math.max(0.05, 0.3 - distance / maxDist);
    setOpacity(opacity + (targetOpacity - opacity) * 0.1);
  });

  return (
    <group position={[centerX, 0, centerZ]}>
      {/* Ground plane showing zone bounds */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.5, 0]}
      >
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial
          color={zone.color}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Zone boundary outline */}
      <lineSegments position={[0, 1, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(width, 0.1, depth)]} />
        <lineBasicMaterial color={zone.color} transparent opacity={opacity * 2} />
      </lineSegments>

      {/* Zone label */}
      <group position={[0, 5, 0]}>
        <Text
          fontSize={4}
          color={zone.color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.2}
          outlineColor="#000000"
          fillOpacity={opacity * 2}
        >
          {zone.name}
        </Text>
        <Text
          fontSize={2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          position={[0, -3, 0]}
          outlineWidth={0.1}
          outlineColor="#000000"
          fillOpacity={opacity * 2}
        >
          {`${zone.terrain.toUpperCase()} - ${Math.round(zone.baseRate * 100)}% base rate`}
        </Text>
      </group>

      {/* Danger indicator when player is inside */}
      {isPlayerInside && (
        <Html position={[0, 15, 0]} center style={{ pointerEvents: 'none' }}>
          <div
            style={{
              backgroundColor: 'rgba(139, 0, 0, 0.9)',
              color: '#ffffff',
              padding: '4px 8px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '11px',
              fontWeight: 'bold',
            }}
          >
            ENCOUNTER ZONE ACTIVE
          </div>
        </Html>
      )}
    </group>
  );
}

// ============================================================================
// ENCOUNTER ZONE TRIGGER COMPONENT
// ============================================================================

interface EncounterZoneTriggerProps {
  zone: EncounterZoneVisual;
  playerPosition: THREE.Vector3;
  onEnter?: (zoneId: string) => void;
  onExit?: (zoneId: string) => void;
}

function EncounterZoneTrigger({
  zone,
  playerPosition,
  onEnter,
  onExit,
}: EncounterZoneTriggerProps) {
  const [isInside, setIsInside] = useState(false);

  // Check if player is inside zone
  useFrame(() => {
    const inside =
      playerPosition.x >= zone.bounds.minX &&
      playerPosition.x <= zone.bounds.maxX &&
      playerPosition.z >= zone.bounds.minZ &&
      playerPosition.z <= zone.bounds.maxZ;

    if (inside !== isInside) {
      setIsInside(inside);
      if (inside) {
        // Update encounter system
        const encounterSystem = getEncounterSystem();
        encounterSystem.setCurrentZone(zone.id);
        onEnter?.(zone.id);
      } else {
        const encounterSystem = getEncounterSystem();
        encounterSystem.setCurrentZone(null);
        onExit?.(zone.id);
      }
    }
  });

  return null; // No visual output - just trigger logic
}

// ============================================================================
// MAIN ENCOUNTER ZONES COMPONENT
// ============================================================================

export function EncounterZones({
  playerPosition,
  debugMode = false,
  onZoneEnter,
  onZoneExit,
}: EncounterZonesProps) {
  // Build zone visuals once
  const zones = useMemo(() => buildEncounterZoneVisuals(), []);

  // Track current zone for debug display
  const [currentZoneId, setCurrentZoneId] = useState<string | null>(null);

  // Initialize encounter system with route zones
  useEffect(() => {
    const encounterSystem = getEncounterSystem();
    const routeZones = createRouteEncounterZones();

    for (const zone of routeZones) {
      encounterSystem.registerZone(zone);
    }

    console.log(`[EncounterZones] Registered ${routeZones.length} encounter zones`);

    return () => {
      // Cleanup could go here if needed
    };
  }, []);

  // Handle zone enter/exit
  const handleZoneEnter = (zoneId: string) => {
    setCurrentZoneId(zoneId);
    onZoneEnter?.(zoneId);
  };

  const handleZoneExit = (zoneId: string) => {
    if (currentZoneId === zoneId) {
      setCurrentZoneId(null);
    }
    onZoneExit?.(zoneId);
  };

  return (
    <group name="encounter-zones">
      {/* Zone triggers (always active) */}
      {zones.map((zone) => (
        <EncounterZoneTrigger
          key={`trigger-${zone.id}`}
          zone={zone}
          playerPosition={playerPosition}
          onEnter={handleZoneEnter}
          onExit={handleZoneExit}
        />
      ))}

      {/* Debug visualization (only when debugMode is true) */}
      {debugMode &&
        zones.map((zone) => (
          <DebugZoneVisual
            key={`visual-${zone.id}`}
            zone={zone}
            playerPosition={playerPosition}
            isPlayerInside={currentZoneId === zone.id}
          />
        ))}

      {/* Debug HUD */}
      {debugMode && (
        <Html
          position={[playerPosition.x, playerPosition.y + 20, playerPosition.z]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: '#00ff00',
              padding: '8px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '11px',
              minWidth: '200px',
            }}
          >
            <div>ENCOUNTER DEBUG</div>
            <div>Zone: {currentZoneId ?? 'None (Safe)'}</div>
            <div>Pos: {`${playerPosition.x.toFixed(1)}, ${playerPosition.z.toFixed(1)}`}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default EncounterZones;
