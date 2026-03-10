// PhysicsProvider — R3F component that initialises the physics layer.
//
// Creates a PhysicsWorld + PlayerController, provides them via React context,
// and runs the physics tick each frame via useFrame. Child components (Terrain,
// Building) register their colliders through the exposed context helpers.

import { useFrame, useThree } from "@react-three/fiber";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";

import {
  type Collider,
  createTerrainCollider,
  createTriggerVolume,
  extractBuildingColliders,
  PhysicsWorld,
  PlayerController,
  type TriggerCallback,
} from "@/engine/physics";
import { InputManager } from "@/src/game/input";
import { gameStore } from "@/src/game/store/webGameStore";

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

export interface PhysicsContextValue {
  /** The underlying physics world (for direct raycast calls, etc). */
  world: PhysicsWorld;
  /** The player character controller. */
  player: PlayerController;
  /** Register a terrain chunk mesh as a trimesh collider. Returns the collider id. */
  registerTerrain: (mesh: THREE.Mesh) => string;
  /** Register a building group as one or more box colliders. Returns collider ids. */
  registerBuilding: (group: THREE.Group) => string[];
  /** Register a trigger volume (quest zone, town boundary). Returns the collider id. */
  registerTrigger: (
    width: number,
    height: number,
    depth: number,
    position: THREE.Vector3,
    tag: string,
  ) => string;
  /** Register any Collider directly. Returns the collider id. */
  registerCollider: (collider: Collider) => string;
  /** Subscribe to trigger enter/exit events. Returns unsubscribe function. */
  onTrigger: (callback: TriggerCallback) => () => void;
  /** Unregister a collider by id. */
  unregister: (id: string) => void;
}

const PhysicsContext = createContext<PhysicsContextValue | null>(null);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access the physics context. Throws if used outside a PhysicsProvider.
 */
export function usePhysics(): PhysicsContextValue {
  const ctx = useContext(PhysicsContext);
  if (!ctx) {
    throw new Error("usePhysics must be used inside a <PhysicsProvider>");
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PhysicsProviderProps {
  /** Initial player spawn position (feet/ground level). */
  spawnPosition?: THREE.Vector3;
  /** Initial camera yaw in radians. 0 = north, -PI/2 = east, PI/2 = west. */
  initialYaw?: number;
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PhysicsProvider({ spawnPosition, initialYaw, children }: PhysicsProviderProps) {
  const { camera } = useThree();

  // Create physics singletons once (stable across renders)
  const world = useMemo(() => new PhysicsWorld(), []);
  const player = useMemo(() => {
    const ctrl = new PlayerController(world, spawnPosition);
    if (initialYaw !== undefined) {
      ctrl.yaw = initialYaw;
    }
    return ctrl;
  }, [world, spawnPosition, initialYaw]);

  // Track registered collider ids for cleanup
  const registeredIds = useRef<Set<string>>(new Set());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const id of registeredIds.current) {
        world.removeStaticCollider(id);
      }
      registeredIds.current.clear();
      world.clearAll();
    };
  }, [world]);

  // --- Collider registration callbacks ---

  const registerTerrain = useCallback(
    (mesh: THREE.Mesh): string => {
      const collider = createTerrainCollider(mesh);
      world.addStaticCollider(collider);
      registeredIds.current.add(collider.id);
      return collider.id;
    },
    [world],
  );

  const registerBuilding = useCallback(
    (group: THREE.Group): string[] => {
      const colliders = extractBuildingColliders(group, true);
      const ids: string[] = [];
      for (const collider of colliders) {
        world.addStaticCollider(collider);
        registeredIds.current.add(collider.id);
        ids.push(collider.id);
      }
      return ids;
    },
    [world],
  );

  const registerTrigger = useCallback(
    (
      width: number,
      height: number,
      depth: number,
      position: THREE.Vector3,
      tag: string,
    ): string => {
      const collider = createTriggerVolume(width, height, depth, position, tag);
      world.addStaticCollider(collider);
      registeredIds.current.add(collider.id);
      return collider.id;
    },
    [world],
  );

  const registerCollider = useCallback(
    (collider: Collider): string => {
      world.addStaticCollider(collider);
      registeredIds.current.add(collider.id);
      return collider.id;
    },
    [world],
  );

  const onTriggerCb = useCallback(
    (callback: TriggerCallback): (() => void) => {
      return player.onTrigger(callback);
    },
    [player],
  );

  const unregister = useCallback(
    (id: string): void => {
      world.removeStaticCollider(id);
      registeredIds.current.delete(id);
    },
    [world],
  );

  // --- Per-frame physics tick ---

  // Scratch objects for camera update (avoid per-frame allocation)
  const eyePos = useRef(new THREE.Vector3());
  const cameraQuat = useRef(new THREE.Quaternion());

  useFrame((_state, delta) => {
    // Cap delta to prevent physics explosion after tab-out / suspend
    const dt = Math.min(delta, 0.1);

    // Poll input (InputManager.tick() must happen before player.update)
    const input = InputManager.getInstance();
    input.tick();
    const frame = input.getFrame();

    // Overlay store crouch state onto input frame so PlayerController
    // applies crouch speed. The C-key toggle is handled by StealthDetector.
    const isCrouching = gameStore.getState().stealthState.isCrouching;
    const patchedFrame = isCrouching ? { ...frame, crouch: true } : frame;

    // Run character controller (applies input, gravity, collision response)
    player.update(patchedFrame, dt);

    // Sync R3F camera to the resolved physics position and rotation
    player.getEyePosition(eyePos.current);
    player.getCameraQuaternion(cameraQuat.current);

    camera.position.copy(eyePos.current);
    camera.quaternion.copy(cameraQuat.current);
  });

  // --- Context value (stable reference via useMemo) ---

  const value = useMemo<PhysicsContextValue>(
    () => ({
      world,
      player,
      registerTerrain,
      registerBuilding,
      registerTrigger,
      registerCollider,
      onTrigger: onTriggerCb,
      unregister,
    }),
    [
      world,
      player,
      registerTerrain,
      registerBuilding,
      registerTrigger,
      registerCollider,
      onTriggerCb,
      unregister,
    ],
  );

  return <PhysicsContext.Provider value={value}>{children}</PhysicsContext.Provider>;
}
