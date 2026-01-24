// Iron Frontier - Modern Diorama Game
// No tiles, no isometric constraints - pure 3D terrain with overlays

import { useEffect, useRef } from 'react';
import { SceneManager } from '../engine/rendering/SceneManager';
import { WorldPosition } from '../engine/types';
import { TitleScreen } from './screens/TitleScreen';
import { useGameStore } from './store/gameStore';

// Import decoupled UI components
import { ActionBar } from './ui/ActionBar';
import { DialogueBox } from './ui/DialogueBox';
import { GameHUD } from './ui/GameHUD';
import { InventoryPanel } from './ui/InventoryPanel';
import { MenuPanel } from './ui/MenuPanel';
import { NotificationFeed } from './ui/NotificationFeed';
import { QuestLog } from './ui/QuestLog';
import { SettingsPanel } from './ui/SettingsPanel';

// ============================================================================
// GAME CANVAS - Babylon.js 3D Scene
// ============================================================================

function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  const {
    worldSeed,
    playerPosition,
    setPlayerPosition,
    phase,
  } = useGameStore();

  // Initialize scene
  useEffect(() => {
    if (!canvasRef.current || (phase !== 'playing' && phase !== 'dialogue' && phase !== 'paused')) return;

    // Create scene manager
    const manager = new SceneManager(canvasRef.current, worldSeed);
    sceneManagerRef.current = manager;

    // Set initial player position
    manager.setPlayerPosition(playerPosition);

    // Handle ground clicks for movement
    manager.setGroundClickHandler((pos: WorldPosition) => {
      const height = manager.getHeightAt(pos.x, pos.z);
      setPlayerPosition({ x: pos.x, y: height, z: pos.z });
      manager.movePlayerTo({ x: pos.x, y: height, z: pos.z });
    });

    // Start render loop
    manager.start();

    return () => {
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, [worldSeed, phase]);

  // Update player position when it changes
  useEffect(() => {
    if (sceneManagerRef.current && (phase === 'playing' || phase === 'dialogue')) {
      sceneManagerRef.current.setPlayerPosition(playerPosition);
    }
  }, [playerPosition, phase]);

  return (
    <canvas
      ref={canvasRef}
      id="game-canvas"
      className="w-full h-full touch-none"
      style={{ outline: 'none' }}
    />
  );
}

// ============================================================================
// MAIN GAME COMPONENT
// ============================================================================

export function Game() {
  const { phase } = useGameStore();

  // Show title screen
  if (phase === 'title') {
    return (
      <div className="fixed inset-0 bg-stone-950">
        <TitleScreen />
      </div>
    );
  }

  // Main game view
  return (
    <div className="relative w-full h-full min-h-screen bg-stone-950 overflow-hidden">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <GameCanvas />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto">
          <GameHUD />
          <ActionBar />
          <DialogueBox />
          <NotificationFeed />
        </div>
      </div>

      {/* Modal Panels */}
      <InventoryPanel />
      <QuestLog />
      <SettingsPanel />
      <MenuPanel />
    </div>
  );
}

export default Game;
