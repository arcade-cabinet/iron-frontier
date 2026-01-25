/**
 * Overworld Rendering System - Iron Frontier
 *
 * Seamless overworld exploration with:
 * - Dynamic terrain with biome-based textures
 * - Day/night cycle lighting
 * - Town markers with LOD
 * - Player movement (WASD/click-to-move)
 *
 * Usage:
 * ```typescript
 * const overworld = new OverworldScene(canvas);
 * await overworld.init();
 * overworld.start();
 *
 * // Register towns
 * overworld.registerTown({ id: 'frontier_edge', name: 'Frontier Edge', ... });
 *
 * // Update from game time
 * overworld.updateTime(gameHour);
 * ```
 */

import {
  Engine,
  Scene,
  Vector3,
} from '@babylonjs/core';

import { DynamicTerrainManager, type TerrainConfig } from './DynamicTerrainManager';
import { DayNightSystem, type DayNightConfig, type DayNightState } from './DayNightSystem';
import { OverworldCamera, type OverworldCameraConfig, type CameraMode } from './OverworldCamera';
import { TownMarkers, type TownDefinition } from './TownMarkers';
import { PlayerMarker, type PlayerMarkerConfig, type MovementState } from './PlayerMarker';

// Re-export types and classes
export { DynamicTerrainManager, type TerrainConfig } from './DynamicTerrainManager';
export { DayNightSystem, type DayNightConfig, type DayNightState, type TimeOfDay } from './DayNightSystem';
export { OverworldCamera, type OverworldCameraConfig, type CameraMode } from './OverworldCamera';
export { TownMarkers, type TownDefinition, type BuildingType, type PropType } from './TownMarkers';
export { PlayerMarker, type PlayerMarkerConfig, type MovementState, type PlayerRepresentation } from './PlayerMarker';

// ============================================================================
// TYPES
// ============================================================================

export interface OverworldConfig {
  /** Random seed */
  seed: number;
  /** Terrain configuration */
  terrain?: Partial<TerrainConfig>;
  /** Day/night configuration */
  dayNight?: Partial<DayNightConfig>;
  /** Camera configuration */
  camera?: Partial<OverworldCameraConfig>;
  /** Player configuration */
  player?: Partial<PlayerMarkerConfig>;
  /** Initial game hour */
  initialHour?: number;
  /** Initial player position */
  initialPosition?: { x: number; y: number; z: number };
}

const DEFAULT_OVERWORLD_CONFIG: OverworldConfig = {
  seed: 42,
  initialHour: 12,
  initialPosition: { x: 0, y: 0, z: 0 },
};

// ============================================================================
// OVERWORLD SCENE
// ============================================================================

export class OverworldScene {
  private canvas: HTMLCanvasElement;
  private config: OverworldConfig;

  // Babylon.js core
  private engine: Engine | null = null;
  private scene: Scene | null = null;

  // Subsystems
  private terrain: DynamicTerrainManager | null = null;
  private dayNight: DayNightSystem | null = null;
  private camera: OverworldCamera | null = null;
  private townMarkers: TownMarkers | null = null;
  private player: PlayerMarker | null = null;

  // State
  private isRunning: boolean = false;
  private lastFrameTime: number = 0;

  // Callbacks
  private onTownEnter?: (townId: string, town: TownDefinition) => void;
  private onTownExit?: (townId: string, town: TownDefinition) => void;
  private onGroundClick?: (position: Vector3) => void;
  private onTimeChange?: (state: DayNightState) => void;

  constructor(canvas: HTMLCanvasElement, config: Partial<OverworldConfig> = {}) {
    this.canvas = canvas;
    this.config = { ...DEFAULT_OVERWORLD_CONFIG, ...config };

    console.log(`[OverworldScene] Created with seed ${this.config.seed}`);
  }

  /**
   * Initialize all subsystems
   */
  async init(): Promise<void> {
    console.log('[OverworldScene] Initializing...');

    // Create Babylon.js engine
    this.engine = new Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    // Create scene
    this.scene = new Scene(this.engine);

    // Initialize terrain
    this.terrain = new DynamicTerrainManager(this.scene, {
      seed: this.config.seed,
      ...this.config.terrain,
    });
    await this.terrain.init();

    // Initialize day/night system
    this.dayNight = new DayNightSystem(this.scene, this.config.dayNight);
    this.dayNight.init();
    this.dayNight.setHour(this.config.initialHour ?? 12);

    // Set up time change callback
    this.dayNight.onStateChanged((state) => {
      if (this.onTimeChange) {
        this.onTimeChange(state);
      }
    });

    // Calculate initial player position with terrain height
    const initPos = this.config.initialPosition ?? { x: 0, y: 0, z: 0 };
    const terrainHeight = this.terrain.getHeightAt(initPos.x, initPos.z);
    const playerStartPos = new Vector3(initPos.x, terrainHeight, initPos.z);

    // Initialize camera
    this.camera = new OverworldCamera(this.scene, this.canvas, this.config.camera);
    this.camera.init(playerStartPos);

    // Initialize town markers
    this.townMarkers = new TownMarkers(this.scene);
    await this.townMarkers.init();

    // Setup town callbacks
    this.townMarkers.setOnTownEnter((townId) => {
      const town = this.townMarkers?.getTown(townId);
      if (town && this.onTownEnter) {
        this.onTownEnter(townId, town);
      }
    });

    this.townMarkers.setOnTownExit((townId) => {
      const town = this.townMarkers?.getTown(townId);
      if (town && this.onTownExit) {
        this.onTownExit(townId, town);
      }
    });

    // Initialize player
    this.player = new PlayerMarker(this.scene, this.canvas, this.config.player);
    await this.player.init(playerStartPos);

    // Connect player to terrain for height
    this.player.setTerrainHeightCallback((x, z) => this.terrain?.getHeightAt(x, z) ?? 0);

    // Connect player to camera
    this.player.onPositionChange((pos) => {
      this.camera?.setTarget(pos);
      this.townMarkers?.update(pos);
    });

    // Add player to shadow generator
    const shadowGen = this.dayNight.getShadowGenerator();
    if (shadowGen) {
      this.player.addToShadowGenerator(shadowGen);
    }

    // Setup click handling
    this.setupInput();

    console.log('[OverworldScene] Initialization complete');
  }

  /**
   * Setup input handling
   */
  private setupInput(): void {
    if (!this.scene) return;

    this.scene.onPointerDown = (evt, pickResult) => {
      if (!pickResult?.hit || !pickResult.pickedPoint) return;

      const worldPos = pickResult.pickedPoint;

      // Check if clicked on town
      if (pickResult.pickedMesh) {
        const townId = this.townMarkers?.getTownFromMesh(pickResult.pickedMesh);
        if (townId) {
          console.log(`[OverworldScene] Clicked on town: ${townId}`);
          // Could trigger town entry here
        }
      }

      // Set move target for player (click-to-move)
      if (this.player) {
        this.player.setMoveTarget(worldPos);
      }

      // Fire callback
      if (this.onGroundClick) {
        this.onGroundClick(worldPos);
      }
    };
  }

  /**
   * Start the render loop
   */
  start(): void {
    if (!this.engine || !this.scene) {
      throw new Error('[OverworldScene] Not initialized');
    }

    this.isRunning = true;
    this.lastFrameTime = performance.now();

    this.engine.runRenderLoop(() => {
      if (!this.isRunning) return;

      // Calculate delta time
      const now = performance.now();
      const deltaTime = (now - this.lastFrameTime) / 1000;
      this.lastFrameTime = now;

      // Update subsystems
      this.update(deltaTime);

      // Render
      this.scene?.render();
    });

    // Handle resize
    window.addEventListener('resize', this.handleResize);

    console.log('[OverworldScene] Render loop started');
  }

  /**
   * Update all subsystems
   */
  private update(deltaTime: number): void {
    // Update player
    this.player?.update(deltaTime);

    // Update camera
    this.camera?.update(deltaTime);

    // Update terrain (if needed)
    this.terrain?.update(deltaTime);
  }

  /**
   * Handle window resize
   */
  private handleResize = (): void => {
    this.engine?.resize();
  };

  /**
   * Stop the render loop
   */
  stop(): void {
    this.isRunning = false;
    window.removeEventListener('resize', this.handleResize);
    console.log('[OverworldScene] Render loop stopped');
  }

  /**
   * Register a town on the overworld
   */
  async registerTown(town: TownDefinition): Promise<void> {
    if (!this.townMarkers) {
      throw new Error('[OverworldScene] Not initialized');
    }

    // Get terrain height at town position
    const terrainHeight = this.terrain?.getHeightAt(town.position.x, town.position.z) ?? 0;
    const adjustedTown = {
      ...town,
      position: new Vector3(town.position.x, terrainHeight, town.position.z),
    };

    await this.townMarkers.registerTown(adjustedTown);

    // Add as point of interest for camera
    this.camera?.addPointOfInterest(town.id, adjustedTown.position);
  }

  /**
   * Remove a town from the overworld
   */
  removeTown(townId: string): void {
    this.townMarkers?.removeTown(townId);
    this.camera?.removePointOfInterest(townId);
  }

  /**
   * Update game time
   */
  updateTime(hour: number): void {
    this.dayNight?.setHour(hour);
  }

  /**
   * Advance time by delta hours
   */
  advanceTime(deltaHours: number): void {
    this.dayNight?.advanceTime(deltaHours);
  }

  /**
   * Get current time state
   */
  getTimeState(): DayNightState | null {
    return this.dayNight?.getState() ?? null;
  }

  /**
   * Set player position (teleport)
   */
  setPlayerPosition(x: number, z: number): void {
    if (!this.player || !this.terrain) return;

    const y = this.terrain.getHeightAt(x, z);
    this.player.setPosition(new Vector3(x, y, z));
    this.camera?.snapToTarget(new Vector3(x, y, z));
  }

  /**
   * Get player position
   */
  getPlayerPosition(): Vector3 | null {
    return this.player?.getPosition() ?? null;
  }

  /**
   * Get terrain height at world position
   */
  getTerrainHeight(x: number, z: number): number {
    return this.terrain?.getHeightAt(x, z) ?? 0;
  }

  /**
   * Set camera mode
   */
  setCameraMode(mode: CameraMode): void {
    this.camera?.setMode(mode);
  }

  /**
   * Set camera zoom
   */
  setCameraZoom(zoom: number): void {
    this.camera?.setZoom(zoom);
  }

  /**
   * Get currently entered town (if any)
   */
  getCurrentTown(): string | null {
    return this.townMarkers?.getCurrentTown() ?? null;
  }

  /**
   * Set town enter callback
   */
  setOnTownEnter(callback: (townId: string, town: TownDefinition) => void): void {
    this.onTownEnter = callback;
  }

  /**
   * Set town exit callback
   */
  setOnTownExit(callback: (townId: string, town: TownDefinition) => void): void {
    this.onTownExit = callback;
  }

  /**
   * Set ground click callback
   */
  setOnGroundClick(callback: (position: Vector3) => void): void {
    this.onGroundClick = callback;
  }

  /**
   * Set time change callback
   */
  setOnTimeChange(callback: (state: DayNightState) => void): void {
    this.onTimeChange = callback;
  }

  /**
   * Get the Babylon scene
   */
  getScene(): Scene | null {
    return this.scene;
  }

  /**
   * Get the Babylon engine
   */
  getEngine(): Engine | null {
    return this.engine;
  }

  /**
   * Get subsystems for advanced usage
   */
  getSubsystems(): {
    terrain: DynamicTerrainManager | null;
    dayNight: DayNightSystem | null;
    camera: OverworldCamera | null;
    townMarkers: TownMarkers | null;
    player: PlayerMarker | null;
  } {
    return {
      terrain: this.terrain,
      dayNight: this.dayNight,
      camera: this.camera,
      townMarkers: this.townMarkers,
      player: this.player,
    };
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    console.log('[OverworldScene] Disposing...');

    this.stop();

    // Dispose subsystems
    this.player?.dispose();
    this.townMarkers?.dispose();
    this.camera?.dispose();
    this.dayNight?.dispose();
    this.terrain?.dispose();

    // Dispose Babylon.js
    this.scene?.dispose();
    this.engine?.dispose();

    // Clear references
    this.player = null;
    this.townMarkers = null;
    this.camera = null;
    this.dayNight = null;
    this.terrain = null;
    this.scene = null;
    this.engine = null;

    console.log('[OverworldScene] Disposed');
  }
}

export default OverworldScene;
