/**
 * NPCSprites.tsx - Overworld NPC representations in R3F
 *
 * Features:
 * - Billboard sprites for NPCs visible on the overworld
 * - Position-based spawning from NPC data
 * - Interaction radius detection
 * - Distance-based visibility and LOD
 * - Animated idle behaviors
 */

import { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

import { ALL_TOWN_NPCS, TOWN_NPCS_BY_ID, getNPCsInTown } from '@iron-frontier/shared/data/world/towns';
import { TOWN_POSITIONS } from '@iron-frontier/shared/systems';

// ============================================================================
// TYPES
// ============================================================================

export interface NPCSpritesProps {
  /** Current player position for distance calculations */
  playerPosition: THREE.Vector3;
  /** Current town ID (NPCs only show in their respective towns) */
  currentTownId: string | null;
  /** Called when player enters NPC interaction range */
  onNPCInteract?: (npcId: string) => void;
  /** Called when player exits NPC interaction range */
  onNPCLeave?: (npcId: string) => void;
  /** Whether sprites are visible */
  visible?: boolean;
}

interface NPCSpriteData {
  id: string;
  name: string;
  position: THREE.Vector3;
  townId: string;
  role?: string;
  color: THREE.Color;
  interactionRadius: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Default interaction radius for NPCs */
const DEFAULT_INTERACTION_RADIUS = 5;

/** Distance at which NPC sprites become visible */
const VISIBILITY_DISTANCE = 100;

/** Distance at which NPC labels appear */
const LABEL_DISTANCE = 30;

/** NPC role to color mapping */
const ROLE_COLORS: Record<string, THREE.Color> = {
  sheriff: new THREE.Color(0xb8860b), // Dark goldenrod
  merchant: new THREE.Color(0x228b22), // Forest green
  innkeeper: new THREE.Color(0xdaa520), // Goldenrod
  blacksmith: new THREE.Color(0x696969), // Dim gray
  doctor: new THREE.Color(0x4169e1), // Royal blue
  preacher: new THREE.Color(0xffd700), // Gold
  outlaw: new THREE.Color(0x8b0000), // Dark red
  miner: new THREE.Color(0x8b4513), // Saddle brown
  rancher: new THREE.Color(0x556b2f), // Dark olive green
  default: new THREE.Color(0xbc8f8f), // Rosy brown
};

// ============================================================================
// NPC SPRITE DATA BUILDER
// ============================================================================

function buildNPCSpriteData(): NPCSpriteData[] {
  const sprites: NPCSpriteData[] = [];

  for (const npc of ALL_TOWN_NPCS) {
    // Get town position
    const townId = npc.locationId;
    if (!townId) continue;

    const townPos = TOWN_POSITIONS[townId];
    if (!townPos) continue;

    // Calculate NPC position within town
    // Spread NPCs around the town center using their ID as a seed
    const hash = npc.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const angle = (hash % 360) * (Math.PI / 180);
    const distance = 10 + (hash % 30);

    const npcX = townPos.x + Math.cos(angle) * distance;
    const npcZ = townPos.z + Math.sin(angle) * distance;

    // Determine color based on role
    const roleKey = npc.role?.toLowerCase() || 'default';
    let color = ROLE_COLORS.default;
    for (const [key, roleColor] of Object.entries(ROLE_COLORS)) {
      if (roleKey.includes(key)) {
        color = roleColor;
        break;
      }
    }

    sprites.push({
      id: npc.id,
      name: npc.name,
      position: new THREE.Vector3(npcX, 0, npcZ),
      townId,
      role: npc.role,
      color,
      interactionRadius: DEFAULT_INTERACTION_RADIUS,
    });
  }

  return sprites;
}

// ============================================================================
// SINGLE NPC SPRITE COMPONENT
// ============================================================================

interface SingleNPCSpriteProps {
  sprite: NPCSpriteData;
  playerPosition: THREE.Vector3;
  isVisible: boolean;
  onInteract?: (npcId: string) => void;
  onLeave?: (npcId: string) => void;
}

function SingleNPCSprite({
  sprite,
  playerPosition,
  isVisible,
  onInteract,
  onLeave,
}: SingleNPCSpriteProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isInteractable, setIsInteractable] = useState(false);
  const [distance, setDistance] = useState(Infinity);

  // Animation state
  const [bobOffset, setBobOffset] = useState(0);

  // Update distance and interaction state
  useFrame((state, delta) => {
    if (!isVisible) return;

    // Calculate distance
    const dx = playerPosition.x - sprite.position.x;
    const dz = playerPosition.z - sprite.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    setDistance(dist);

    // Check interaction state
    const nowInteractable = dist <= sprite.interactionRadius;
    if (nowInteractable !== isInteractable) {
      setIsInteractable(nowInteractable);
      if (nowInteractable) {
        onInteract?.(sprite.id);
      } else {
        onLeave?.(sprite.id);
      }
    }

    // Animate bob
    setBobOffset(Math.sin(state.clock.elapsedTime * 2 + sprite.position.x) * 0.2);

    // Update visibility
    if (groupRef.current) {
      groupRef.current.visible = isVisible && dist < VISIBILITY_DISTANCE;
    }
  });

  // Early return if not visible
  if (!isVisible) return null;

  const showLabel = distance < LABEL_DISTANCE;
  const scale = isInteractable ? 1.2 : 1;

  return (
    <group ref={groupRef} position={sprite.position}>
      {/* NPC body - simple billboard sprite */}
      <Billboard follow={true} position={[0, 2 + bobOffset, 0]}>
        {/* Body capsule */}
        <mesh scale={[scale, scale, scale]}>
          <capsuleGeometry args={[0.5, 2, 8, 16]} />
          <meshStandardMaterial
            color={sprite.color}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.8, 0]} scale={[scale, scale, scale]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial
            color={new THREE.Color(0xdeb887)} // Burlywood - skin tone
            roughness={0.9}
            metalness={0}
          />
        </mesh>

        {/* Hat (western style) */}
        <group position={[0, 2.2, 0]} scale={[scale, scale, scale]}>
          {/* Hat brim */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 0.1, 16]} />
            <meshStandardMaterial color={sprite.color.clone().multiplyScalar(0.6)} />
          </mesh>
          {/* Hat crown */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.4, 0.5, 0.4, 16]} />
            <meshStandardMaterial color={sprite.color.clone().multiplyScalar(0.6)} />
          </mesh>
        </group>
      </Billboard>

      {/* NPC name label */}
      {showLabel && (
        <Billboard follow={true} position={[0, 4.5, 0]}>
          <Text
            fontSize={0.8}
            color="#f5e6d3"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#2a1f1a"
          >
            {sprite.name}
          </Text>
          {sprite.role && (
            <Text
              fontSize={0.5}
              color="#c0a080"
              anchorX="center"
              anchorY="middle"
              position={[0, -0.8, 0]}
              outlineWidth={0.03}
              outlineColor="#2a1f1a"
            >
              {sprite.role}
            </Text>
          )}
        </Billboard>
      )}

      {/* Interaction prompt */}
      {isInteractable && (
        <Html
          position={[0, 5.5, 0]}
          center
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: '#f5e6d3',
              padding: '6px 12px',
              borderRadius: '4px',
              fontFamily: 'serif',
              fontSize: '12px',
              whiteSpace: 'nowrap',
            }}
          >
            Press <strong>SPACE</strong> to talk
          </div>
        </Html>
      )}

      {/* Interaction radius indicator (debug) */}
      {isInteractable && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[sprite.interactionRadius - 0.2, sprite.interactionRadius, 32]} />
          <meshBasicMaterial
            color={0x00ff00}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

// ============================================================================
// MAIN NPC SPRITES COMPONENT
// ============================================================================

export function NPCSprites({
  playerPosition,
  currentTownId,
  onNPCInteract,
  onNPCLeave,
  visible = true,
}: NPCSpritesProps) {
  // Build sprite data once
  const allSprites = useMemo(() => buildNPCSpriteData(), []);

  // Filter sprites to current town
  const visibleSprites = useMemo(() => {
    if (!currentTownId) return [];
    return allSprites.filter((sprite) => sprite.townId === currentTownId);
  }, [allSprites, currentTownId]);

  if (!visible) return null;

  return (
    <group name="npc-sprites">
      {visibleSprites.map((sprite) => (
        <SingleNPCSprite
          key={sprite.id}
          sprite={sprite}
          playerPosition={playerPosition}
          isVisible={true}
          onInteract={onNPCInteract}
          onLeave={onNPCLeave}
        />
      ))}
    </group>
  );
}

export default NPCSprites;
