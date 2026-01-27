// Main Babylon.js Game Scene using Reactylon
// @ts-nocheck - Reactylon JSX types are registered at runtime

import type { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Color3, Color4, Vector3 } from '@babylonjs/core/Maths/math';
import { useCallback, useEffect, useMemo } from 'react';
import { Scene, useScene } from 'reactylon';
import { Engine } from 'reactylon/web';
import {
  CELL_SIZE,
  type GridCell,
  generateSector,
  SECTOR_SIZE,
  type SectorData,
} from '../lib/procgen';
import { useGameStore } from '../store/webGameStore';

// Import to register JSX elements
import 'reactylon';

// Ground Component
function Ground({ sector }: { sector: SectorData }) {
  const groundColor = useMemo(() => Color3.FromHexString(sector.groundColor), [sector.groundColor]);
  const size = SECTOR_SIZE * CELL_SIZE + 10;

  return (
    <mesh
      name="ground"
      position={new Vector3((SECTOR_SIZE * CELL_SIZE) / 2, -0.1, (SECTOR_SIZE * CELL_SIZE) / 2)}
    >
      <standardMaterial
        name="groundMat"
        diffuseColor={groundColor}
        specularColor={new Color3(0.1, 0.1, 0.1)}
      />
      <ground name="groundMesh" options={{ width: size, height: size }} />
    </mesh>
  );
}

// Grid cell meshes (walls and obstacles)
function GridCells({ grid }: { grid: GridCell[][] }) {
  const cells = useMemo(() => {
    const result: { x: number; y: number; z: number; height: number; color: Color3 }[] = [];

    for (let gy = 0; gy < grid.length; gy++) {
      for (let gx = 0; gx < grid[gy].length; gx++) {
        const cell = grid[gy][gx];
        if (cell.type === 'wall' || cell.height > 0) {
          const color =
            cell.type === 'wall'
              ? new Color3(0.4, 0.3, 0.2)
              : cell.type === 'stone'
                ? new Color3(0.5, 0.5, 0.5)
                : new Color3(0.6, 0.4, 0.2);

          result.push({
            x: gx * CELL_SIZE,
            y: cell.height / 2,
            z: gy * CELL_SIZE,
            height: cell.height,
            color,
          });
        }
      }
    }
    return result;
  }, [grid]);

  return (
    <>
      {cells.map((cell, i) => (
        <box
          key={`cell-${i}`}
          name={`wall-${i}`}
          options={{ width: CELL_SIZE * 0.9, height: cell.height, depth: CELL_SIZE * 0.9 }}
          position={new Vector3(cell.x, cell.y, cell.z)}
        >
          <standardMaterial name={`wallMat-${i}`} diffuseColor={cell.color} />
        </box>
      ))}
    </>
  );
}

// Props rendering
function Props({ sector }: { sector: SectorData }) {
  const propMeshes = useMemo(() => {
    return sector.props.map((prop) => {
      let size = { w: 0.5, h: 0.5, d: 0.5 };
      let color = new Color3(0.6, 0.4, 0.2);

      switch (prop.type) {
        case 'crate':
          size = { w: 0.8, h: 0.8, d: 0.8 };
          color = new Color3(0.55, 0.35, 0.15);
          break;
        case 'barrel':
          size = { w: 0.5, h: 0.9, d: 0.5 };
          color = new Color3(0.4, 0.25, 0.1);
          break;
        case 'lamp':
          size = { w: 0.2, h: 1.5, d: 0.2 };
          color = new Color3(0.7, 0.6, 0.2);
          break;
        case 'cactus':
          size = { w: 0.3, h: 1.2, d: 0.3 };
          color = new Color3(0.2, 0.5, 0.2);
          break;
        case 'rock':
          size = { w: 0.7, h: 0.4, d: 0.6 };
          color = new Color3(0.5, 0.45, 0.4);
          break;
        case 'gear':
          size = { w: 0.6, h: 0.1, d: 0.6 };
          color = new Color3(0.7, 0.5, 0.2);
          break;
        case 'pipe':
          size = { w: 0.2, h: 0.2, d: 1.5 };
          color = new Color3(0.5, 0.35, 0.2);
          break;
        case 'windmill':
          size = { w: 0.5, h: 2.5, d: 0.5 };
          color = new Color3(0.6, 0.5, 0.4);
          break;
      }

      return { ...prop, size, color };
    });
  }, [sector.props]);

  return (
    <>
      {propMeshes.map((prop) => (
        <box
          key={prop.id}
          name={prop.id}
          options={{
            width: prop.size.w * prop.scale,
            height: prop.size.h * prop.scale,
            depth: prop.size.d * prop.scale,
          }}
          position={new Vector3(prop.x, (prop.size.h * prop.scale) / 2, prop.y)}
          rotation={new Vector3(0, prop.rotation, 0)}
        >
          <standardMaterial name={`${prop.id}-mat`} diffuseColor={prop.color} />
        </box>
      ))}
    </>
  );
}

// Items on ground
function Items({ sector }: { sector: SectorData }) {
  const { collectedItems } = useGameStore();

  const visibleItems = useMemo(
    () => sector.items.filter((item) => !collectedItems.includes(item.id)),
    [sector.items, collectedItems]
  );

  const getItemColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return new Color3(1, 0.8, 0);
      case 'rare':
        return new Color3(0.6, 0.2, 0.8);
      case 'uncommon':
        return new Color3(0.2, 0.6, 0.2);
      default:
        return new Color3(0.8, 0.7, 0.5);
    }
  };

  return (
    <>
      {visibleItems.map((item) => (
        <box
          key={item.id}
          name={item.id}
          options={{ width: 0.4, height: 0.4, depth: 0.4 }}
          position={new Vector3(item.x, 0.3, item.y)}
        >
          <standardMaterial
            name={`${item.id}-mat`}
            diffuseColor={getItemColor(item.rarity)}
            emissiveColor={getItemColor(item.rarity).scale(0.3)}
          />
        </box>
      ))}
    </>
  );
}

// NPCs
function NPCs({ sector }: { sector: SectorData }) {
  return (
    <>
      {sector.npcs.map((npc) => (
        <transformNode key={npc.id} name={npc.id} position={new Vector3(npc.x, 0, npc.y)}>
          {/* Body */}
          <box
            name={`${npc.id}-body`}
            options={{ width: 0.6, height: 1.2, depth: 0.4 }}
            position={new Vector3(0, 0.8, 0)}
          >
            <standardMaterial name={`${npc.id}-bodyMat`} diffuseColor={new Color3(0.5, 0.3, 0.2)} />
          </box>
          {/* Head */}
          <sphere
            name={`${npc.id}-head`}
            options={{ diameter: 0.5 }}
            position={new Vector3(0, 1.65, 0)}
          >
            <standardMaterial name={`${npc.id}-headMat`} diffuseColor={new Color3(0.9, 0.7, 0.6)} />
          </sphere>
          {/* Hat */}
          <cylinder
            name={`${npc.id}-hat`}
            options={{ diameter: 0.7, height: 0.3 }}
            position={new Vector3(0, 2, 0)}
          >
            <standardMaterial name={`${npc.id}-hatMat`} diffuseColor={new Color3(0.3, 0.2, 0.1)} />
          </cylinder>
          {/* Indicator for quest giver */}
          {npc.questGiver && (
            <sphere
              name={`${npc.id}-indicator`}
              options={{ diameter: 0.3 }}
              position={new Vector3(0, 2.5, 0)}
            >
              <standardMaterial
                name={`${npc.id}-indicatorMat`}
                diffuseColor={new Color3(1, 0.8, 0)}
                emissiveColor={new Color3(0.5, 0.4, 0)}
              />
            </sphere>
          )}
        </transformNode>
      ))}
    </>
  );
}

// Player character
function Player() {
  const { player } = useGameStore();

  return (
    <transformNode name="player" position={new Vector3(player.position.x, 0, player.position.y)}>
      {/* Body */}
      <box
        name="player-body"
        options={{ width: 0.5, height: 1.0, depth: 0.35 }}
        position={new Vector3(0, 0.7, 0)}
      >
        <standardMaterial name="player-bodyMat" diffuseColor={new Color3(0.3, 0.25, 0.2)} />
      </box>
      {/* Head */}
      <sphere name="player-head" options={{ diameter: 0.4 }} position={new Vector3(0, 1.45, 0)}>
        <standardMaterial name="player-headMat" diffuseColor={new Color3(0.85, 0.65, 0.5)} />
      </sphere>
      {/* Hat */}
      <cylinder
        name="player-hat"
        options={{ diameter: 0.55, height: 0.25 }}
        position={new Vector3(0, 1.75, 0)}
      >
        <standardMaterial name="player-hatMat" diffuseColor={new Color3(0.25, 0.15, 0.1)} />
      </cylinder>
      {/* Selection ring */}
      <torus
        name="player-ring"
        options={{ diameter: 1, thickness: 0.05 }}
        position={new Vector3(0, 0.05, 0)}
        rotation={new Vector3(Math.PI / 2, 0, 0)}
      >
        <standardMaterial
          name="player-ringMat"
          diffuseColor={new Color3(0.9, 0.7, 0.2)}
          emissiveColor={new Color3(0.4, 0.3, 0.1)}
        />
      </torus>
    </transformNode>
  );
}

// Camera controller
function CameraController() {
  const { player } = useGameStore();
  const scene = useScene();

  useEffect(() => {
    if (!scene) return;
    const camera = scene.activeCamera as ArcRotateCamera;
    if (camera?.target) {
      camera.target = new Vector3(player.position.x, 0, player.position.y);
    }
  }, [player.position.x, player.position.y, scene]);

  return null;
}

// Input handler
function InputHandler({ sector }: { sector: SectorData }) {
  const { movePlayer, collectItem, talkToNPC, collectedItems, settings } = useGameStore();
  const scene = useScene();

  const handlePointerDown = useCallback(
    (evt: PointerEvent) => {
      if (!scene) return;

      const pickResult = scene.pick(evt.clientX, evt.clientY);
      if (pickResult?.hit && pickResult.pickedPoint) {
        const targetX = pickResult.pickedPoint.x;
        const targetZ = pickResult.pickedPoint.z;

        // Check grid bounds
        const gridX = Math.floor(targetX / CELL_SIZE);
        const gridY = Math.floor(targetZ / CELL_SIZE);

        if (gridX >= 0 && gridX < SECTOR_SIZE && gridY >= 0 && gridY < SECTOR_SIZE) {
          const cell = sector.grid[gridY]?.[gridX];
          if (cell?.walkable) {
            // Check for nearby items
            const nearbyItem = sector.items.find((item) => {
              if (collectedItems.includes(item.id)) return false;
              const dx = item.x - targetX;
              const dy = item.y - targetZ;
              return Math.sqrt(dx * dx + dy * dy) < 1.5;
            });

            if (nearbyItem) {
              collectItem(nearbyItem);
              // Haptic feedback
              if (settings.haptics && navigator.vibrate) {
                navigator.vibrate(50);
              }
            }

            // Check for nearby NPCs
            const nearbyNPC = sector.npcs.find((npc) => {
              const dx = npc.x - targetX;
              const dy = npc.y - targetZ;
              return Math.sqrt(dx * dx + dy * dy) < 2;
            });

            if (nearbyNPC) {
              talkToNPC(nearbyNPC);
              if (settings.haptics && navigator.vibrate) {
                navigator.vibrate([30, 20, 30]);
              }
            } else {
              movePlayer(targetX, targetZ);
            }
          }
        }
      }
    },
    [scene, sector, movePlayer, collectItem, talkToNPC, collectedItems, settings.haptics]
  );

  useEffect(() => {
    const canvas = scene?.getEngine().getRenderingCanvas();
    if (canvas) {
      canvas.addEventListener('pointerdown', handlePointerDown);
      return () => canvas.removeEventListener('pointerdown', handlePointerDown);
    }
  }, [scene, handlePointerDown]);

  return null;
}

// Scene ready handler
function SceneSetup() {
  const scene = useScene();

  useEffect(() => {
    if (scene) {
      scene.clearColor = new Color4(0.4, 0.35, 0.3, 1);
    }
  }, [scene]);

  return null;
}

// Main scene content
function SceneContent({ sector }: { sector: SectorData }) {
  const ambientColor = useMemo(
    () => Color3.FromHexString(sector.ambientColor),
    [sector.ambientColor]
  );

  return (
    <>
      <SceneSetup />

      {/* Lighting */}
      <hemisphericLight
        name="ambient"
        direction={new Vector3(0, 1, 0)}
        intensity={0.6}
        diffuse={ambientColor}
        groundColor={new Color3(0.3, 0.25, 0.2)}
      />
      <directionalLight
        name="sun"
        direction={new Vector3(-1, -2, -1)}
        intensity={0.8}
        diffuse={new Color3(1, 0.95, 0.8)}
      />

      {/* Camera */}
      <arcRotateCamera
        name="camera"
        alpha={-Math.PI / 4}
        beta={Math.PI / 3}
        radius={25}
        target={new Vector3((SECTOR_SIZE * CELL_SIZE) / 2, 0, (SECTOR_SIZE * CELL_SIZE) / 2)}
        lowerRadiusLimit={15}
        upperRadiusLimit={40}
        lowerBetaLimit={0.3}
        upperBetaLimit={Math.PI / 2.2}
        panningSensibility={100}
        pinchPrecision={50}
      />

      {/* World */}
      <Ground sector={sector} />
      <GridCells grid={sector.grid} />
      <Props sector={sector} />
      <Items sector={sector} />
      <NPCs sector={sector} />
      <Player />

      {/* Controllers */}
      <CameraController />
      <InputHandler sector={sector} />
    </>
  );
}

// Main exported component
export function GameScene() {
  const { currentSector, gamePhase } = useGameStore();

  useEffect(() => {
    if (gamePhase === 'playing' && !currentSector) {
      // Regenerate sector if needed
      const sector = generateSector('frontier_start', 12345);
      useGameStore.setState({ currentSector: sector });
    }
  }, [gamePhase, currentSector]);

  if (!currentSector || gamePhase !== 'playing') {
    return null;
  }

  return (
    <Engine canvasId="game-canvas">
      <Scene>
        <SceneContent sector={currentSector} />
      </Scene>
    </Engine>
  );
}
