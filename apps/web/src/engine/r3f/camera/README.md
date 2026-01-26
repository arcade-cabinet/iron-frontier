# R3F Camera System

Camera and player controls for React Three Fiber in Iron Frontier.

## Components

### ThirdPersonCamera

Follow camera for overworld exploration with smooth interpolation and terrain collision.

```tsx
import { ThirdPersonCamera, usePlayerMovement, PlayerMesh } from '@/engine/r3f/camera';
import { getHeightmapGenerator } from '@/engine/terrain/HeightmapGenerator';

function OverworldPlayer() {
  const heightGenerator = getHeightmapGenerator(12345);

  const { state, positionRef } = usePlayerMovement({
    getHeightAt: (x, z) => heightGenerator.getHeightAt(x, z),
    onPositionChange: (pos, rot) => {
      // Update game store with new position
      gameStore.setPlayerPosition({ x: pos.x, z: pos.z });
    },
  });

  // Determine animation based on movement state
  const animation = state.isMoving
    ? (state.isSprinting ? 'run' : 'walk')
    : 'idle';

  return (
    <>
      <ThirdPersonCamera
        targetPosition={positionRef.current}
        targetRotation={state.rotation}
        getHeightAt={(x, z) => heightGenerator.getHeightAt(x, z)}
        zoom="medium"
      />
      <PlayerMesh
        position={positionRef.current}
        rotation={state.rotation}
        animation={animation}
      />
    </>
  );
}
```

### CombatCamera

Fixed isometric-style camera for turn-based combat with focus transitions.

```tsx
import { CombatCameraWithControls, type UseCombatCameraReturn } from '@/engine/r3f/camera';

function CombatScene() {
  const [controls, setControls] = useState<UseCombatCameraReturn | null>(null);

  const combatants = [
    { id: 'player', position: new THREE.Vector3(-5, 0, 0), isPlayer: true },
    { id: 'enemy1', position: new THREE.Vector3(5, 0, 0) },
  ];

  // Focus on enemy when they're hit
  const handleEnemyHit = () => {
    controls?.focusOn('enemy1');
    controls?.shake(0.3, 0.4); // intensity, duration
  };

  return (
    <>
      <CombatCameraWithControls
        arenaCenter={new THREE.Vector3(0, 0, 0)}
        combatants={combatants}
        activeCombatantId="player"
        onControlsReady={setControls}
      />
      {/* Combat scene content */}
    </>
  );
}
```

### PlayerMesh

Simple capsule-based player representation with animation states.

```tsx
import { PlayerMesh } from '@/engine/r3f/camera';

<PlayerMesh
  position={playerPosition}
  rotation={facingAngle}
  animation="walk" // 'idle' | 'walk' | 'run'
  config={{
    color: 0x4488ff,
    height: 1.8,
    radius: 0.5,
  }}
/>
```

## Hooks

### useKeyboardInput

Low-level keyboard state tracking.

```tsx
import { useKeyboardInput } from '@/engine/r3f/camera';

function Controls() {
  const {
    movement,      // { x: -1..1, z: -1..1 } normalized
    isSprinting,   // boolean
    isInteractPressed,
    pressedKeys,   // Set<string>
  } = useKeyboardInput({
    context: 'overworld',
    enabled: true,
  });
}
```

### usePlayerMovement

Complete WASD movement with terrain following and stamina.

```tsx
import { usePlayerMovement } from '@/engine/r3f/camera';

function Player() {
  const {
    state,           // Current movement state
    positionRef,     // Mutable position reference
    teleport,        // (position: Vector3) => void
    restoreStamina,  // (amount?: number) => void
    getFacingDirection, // () => 'north'|'south'|'east'|'west'
  } = usePlayerMovement({
    initialPosition: new THREE.Vector3(0, 0, 0),
    config: {
      baseSpeed: 5,
      sprintSpeed: 8,
    },
    getHeightAt: (x, z) => terrain.getHeight(x, z),
    onPositionChange: (pos, rot) => {
      // Sync with game state
    },
  });
}
```

## Configuration

### Camera Zoom Presets

```typescript
const ZOOM_CONFIGS = {
  close: { distance: 8, heightOffset: 5 },
  medium: { distance: 15, heightOffset: 8 },
  far: { distance: 25, heightOffset: 12 },
};
```

### Combat Camera Presets

```typescript
const COMBAT_CAMERA_PRESETS = {
  overview: { distance: 20, height: 15, angle: 45 },
  playerTurn: { distance: 12, height: 8, angle: 30 },
  enemyTurn: { distance: 15, height: 10, angle: 60 },
  dramatic: { distance: 8, height: 5, angle: 20 },
};
```

## Integration with Game Store

```tsx
import { useGameStore } from '@/game/store/webGameStore';
import { usePlayerMovement, ThirdPersonCamera, PlayerMesh } from '@/engine/r3f/camera';

function GamePlayer() {
  const phase = useGameStore((s) => s.phase);
  const setPlayerPosition = useGameStore((s) => s.setOverworldPosition);

  const enabled = phase === 'playing';

  const { state, positionRef } = usePlayerMovement({
    enabled,
    context: enabled ? 'overworld' : 'menu',
    onPositionChange: (pos) => {
      setPlayerPosition({ x: pos.x, z: pos.z });
    },
  });

  return (
    <>
      <ThirdPersonCamera
        targetPosition={positionRef.current}
        targetRotation={state.rotation}
        enabled={enabled}
      />
      <PlayerMesh
        position={positionRef.current}
        rotation={state.rotation}
        visible={enabled}
      />
    </>
  );
}
```
