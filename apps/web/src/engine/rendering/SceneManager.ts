// Scene Manager - Main Babylon.js scene orchestration
// Uses a DIORAMA approach: bounded platform + 2D sky backdrop + fixed isometric camera
import {
  type AbstractMesh,
  type AnimationGroup,
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  SceneLoader,
  ShadowGenerator,
  type Skeleton,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { WesternAssets } from '@iron-frontier/assets';
import { getHeightmapGenerator, type HeightmapGenerator } from '../terrain/HeightmapGenerator';
import { TerrainChunk } from '../terrain/TerrainChunk';
import {
  type CameraState,
  type ChunkCoord,
  chunkKey,
  DEFAULT_CAMERA_STATE,
  VIEW_DISTANCE,
  type WorldPosition,
  worldToChunk,
} from '../types';

// Diorama world bounds - the visible play area
const WORLD_SIZE = 256; // 256x256 meter play area
const WORLD_CENTER = WORLD_SIZE / 2;

export class SceneManager {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private scene: Scene;
  private camera!: ArcRotateCamera;
  private shadowGenerator: ShadowGenerator | null = null;

  // Terrain chunks
  private terrainGenerator: HeightmapGenerator;
  private loadedChunks: Map<string, TerrainChunk> = new Map();

  // Diorama elements
  private skyBackdrop: Mesh | null = null;
  private platformBase: Mesh | null = null;

  // Player
  private playerMesh: AbstractMesh | null = null;
  private playerSkeleton: Skeleton | null = null;
  private playerAnimations: AnimationGroup[] = [];
  private playerPosition: WorldPosition = { x: 0, y: 0, z: 0 };
  private playerYOffset: number = 0; // Compensate for models not centered at origin

  // Camera state
  private cameraState: CameraState = { ...DEFAULT_CAMERA_STATE };

  // Callbacks
  private onGroundClick?: (position: WorldPosition) => void;

  constructor(canvas: HTMLCanvasElement, seed: number = 12345) {
    this.canvas = canvas;

    // Create engine with performance settings
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    // Create scene - NO clear color, we use sky backdrop
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.4, 0.6, 0.9, 1); // Fallback sky blue

    // Initialize terrain generator
    this.terrainGenerator = getHeightmapGenerator(seed);

    // Set initial player position at world center
    const spawnX = WORLD_CENTER;
    const spawnZ = WORLD_CENTER;
    const spawnHeight = this.terrainGenerator.getHeightAt(spawnX, spawnZ);
    this.playerPosition = { x: spawnX, y: spawnHeight, z: spawnZ };

    console.log(
      `[SceneManager] Diorama world: ${WORLD_SIZE}x${WORLD_SIZE}m, spawn at center (${spawnX}, ${spawnHeight.toFixed(2)}, ${spawnZ})`
    );

    // Setup diorama components in correct order
    this.setupSkyBackdrop(); // 1. Sky backdrop behind everything
    this.setupDioramaCamera(); // 2. Fixed isometric camera
    this.setupLighting(); // 3. Lighting
    this.setupPlatformBase(); // 4. Platform edge/cliff
    this.setupInput(); // 5. Input handling

    // Create player mesh
    this.createPlayerMesh();

    // Load terrain chunks for visible area
    this.updateLoadedChunks(this.playerPosition);
  }

  /**
   * Creates a sky dome hemisphere behind the diorama.
   * Positioned so it's always visible in the background above the terrain.
   */
  private setupSkyBackdrop(): void {
    // Create a hemisphere for the sky - visible from inside
    this.skyBackdrop = MeshBuilder.CreateSphere(
      'skyDome',
      {
        diameter: WORLD_SIZE * 6,
        segments: 32,
        slice: 0.5, // Half sphere (hemisphere)
        sideOrientation: Mesh.BACKSIDE, // Render inside
      },
      this.scene
    );

    // Position centered on world, slightly below to show horizon
    this.skyBackdrop.position = new Vector3(WORLD_CENTER, -WORLD_SIZE * 0.5, WORLD_CENTER);

    // Sky material - warm western sky blue
    const skyMat = new StandardMaterial('skyMat', this.scene);
    skyMat.emissiveColor = new Color3(0.6, 0.78, 0.95); // Warm sky blue
    skyMat.disableLighting = true;
    skyMat.backFaceCulling = false;

    this.skyBackdrop.material = skyMat;
    this.skyBackdrop.isPickable = false;
    this.skyBackdrop.renderingGroupId = 0; // Render first (behind everything)

    console.log('[SceneManager] Sky dome created');
  }

  /**
   * Creates a visible platform base around the terrain.
   * This gives the diorama a "stage" appearance with visible edges.
   */
  private setupPlatformBase(): void {
    // Create a ground plane that extends beyond terrain
    const platformSize = WORLD_SIZE + 40;
    this.platformBase = MeshBuilder.CreateGround(
      'platformBase',
      {
        width: platformSize,
        height: platformSize,
      },
      this.scene
    );

    // Position at terrain base level, centered on world
    this.platformBase.position = new Vector3(WORLD_CENTER, -2, WORLD_CENTER);

    const platformMat = new StandardMaterial('platformMat', this.scene);
    platformMat.diffuseColor = new Color3(0.35, 0.28, 0.22); // Dark rocky earth
    platformMat.specularColor = new Color3(0.05, 0.05, 0.05);
    this.platformBase.material = platformMat;
    this.platformBase.receiveShadows = true;
    this.platformBase.isPickable = false;

    console.log('[SceneManager] Platform base created');
  }

  /**
   * Sets up a modern third-person camera (Fallout 3/NV style).
   * Player can rotate freely around the character, zoom in/out.
   */
  private setupDioramaCamera(): void {
    // Camera target starts at player spawn position (chest height)
    const targetHeight = this.terrainGenerator.getHeightAt(
      this.playerPosition.x,
      this.playerPosition.z
    );
    const target = new Vector3(this.playerPosition.x, targetHeight + 1.2, this.playerPosition.z);

    // MODERN THIRD-PERSON CAMERA:
    // Alpha = horizontal rotation (start behind player)
    // Beta = vertical angle (slightly above horizontal for over-shoulder view)
    // Radius = distance from player (close enough to see details)
    const alpha = Math.PI; // Start behind the player
    const beta = Math.PI * 0.4; // ~72° from vertical (slightly looking down at player)
    const radius = 8; // Close third-person distance

    this.camera = new ArcRotateCamera('thirdPersonCamera', alpha, beta, radius, target, this.scene);

    this.camera.attachControl(this.canvas, true);

    // Allow full rotation but constrain zoom and vertical angle
    this.camera.lowerRadiusLimit = 3; // Minimum zoom - close over-shoulder
    this.camera.upperRadiusLimit = 30; // Maximum zoom - tactical overview
    this.camera.lowerBetaLimit = Math.PI * 0.15; // Don't go too top-down
    this.camera.upperBetaLimit = Math.PI * 0.48; // Don't go below horizon

    // Smooth, responsive controls
    this.camera.panningSensibility = 0; // Disable panning - camera follows player
    this.camera.wheelPrecision = 50;
    this.camera.wheelDeltaPercentage = 0.02;
    this.camera.inertia = 0.9;
    this.camera.angularSensibilityX = 500;
    this.camera.angularSensibilityY = 500;

    console.log(
      `[SceneManager] Third-person camera: radius=${radius}, alpha=${((alpha * 180) / Math.PI).toFixed(0)}°, beta=${((beta * 180) / Math.PI).toFixed(0)}°`
    );
  }

  private setupLighting(): void {
    // Ambient light (warm western sun)
    const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), this.scene);
    ambient.intensity = 0.5;
    ambient.groundColor = new Color3(0.4, 0.35, 0.3);
    ambient.diffuse = new Color3(1, 0.95, 0.85);

    // Main sun light
    const sun = new DirectionalLight('sun', new Vector3(-0.5, -1, -0.3).normalize(), this.scene);
    sun.intensity = 1.0;
    sun.diffuse = new Color3(1, 0.95, 0.8);

    // Shadow generator
    this.shadowGenerator = new ShadowGenerator(1024, sun);
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.blurKernel = 16;
    this.shadowGenerator.darkness = 0.3;
  }

  // Old sky dome removed - using setupSkyBackdrop() instead for diorama approach

  private setupInput(): void {
    // Ground click detection
    this.scene.onPointerDown = (evt, pickResult) => {
      if (pickResult?.hit && pickResult.pickedPoint && this.onGroundClick) {
        const pos: WorldPosition = {
          x: pickResult.pickedPoint.x,
          y: pickResult.pickedPoint.y,
          z: pickResult.pickedPoint.z,
        };
        this.onGroundClick(pos);
      }
    };
  }

  private async createPlayerMesh(): Promise<void> {
    console.log('[SceneManager] Starting createPlayerMesh...');
    try {
      // Load KayKit Engineer character - simpler, reliable format
      const characterPath = WesternAssets.ENGINEER;
      const lastSlash = characterPath.lastIndexOf('/');
      const rootUrl = lastSlash >= 0 ? characterPath.substring(0, lastSlash + 1) : '';
      const fileName = lastSlash >= 0 ? characterPath.substring(lastSlash + 1) : characterPath;

      const result = await SceneLoader.ImportMeshAsync('', rootUrl, fileName, this.scene);

      console.log(`[SceneManager] Engineer loaded: ${result.meshes.length} meshes`);
      const player = result.meshes[0];

      // KayKit models are small (game units) - scale up to ~1.7m human height
      // KayKit characters are typically around 1 unit tall, so scale 1.7x
      player.scaling.setAll(1.7);
      player.checkCollisions = true;

      // No rotation needed - KayKit models are properly Y-up oriented
      this.playerYOffset = 0;

      console.log(`[SceneManager] Engineer ready, scale: 1.7x`);

      this.playerMesh = player;
      this.playerSkeleton = result.skeletons[0] ?? null;
      this.playerAnimations = result.animationGroups;

      // Start Idle animation if available
      const idleAnim = this.playerAnimations.find((a) => a.name.toLowerCase().includes('idle'));
      if (idleAnim) {
        console.log(`[SceneManager] Playing idle animation: ${idleAnim.name}`);
        idleAnim.play(true);
      }

      // Shadow caster
      if (this.shadowGenerator) {
        this.shadowGenerator.addShadowCaster(player);
        player.getChildMeshes().forEach((m) => this.shadowGenerator?.addShadowCaster(m));
      }

      // Initial position update
      this.setPlayerPosition(this.playerPosition);

      // Log mesh info
      const children = player.getChildMeshes();
      console.log(`[SceneManager] Player has ${children.length} child meshes`);
      children.forEach((child, i) => {
        console.log(`[SceneManager] Child ${i}: ${child.name}, visible: ${child.isVisible}`);
      });
    } catch (err) {
      console.error('[SceneManager] Failed to load player assets:', err);
      // Fallback to primitive if load fails
      this.createPrimitivePlayer();
    }
  }

  // Fallback primitive player
  private createPrimitivePlayer(): void {
    console.log('[SceneManager] Creating primitive player fallback...');
    // Create a simple gunslinger placeholder
    const body = MeshBuilder.CreateCylinder(
      'player_body',
      {
        height: 1.6,
        diameterTop: 0.4,
        diameterBottom: 0.5,
        tessellation: 12,
      },
      this.scene
    );

    // ... (rest of old logic for fallback)
    const bodyMat = new StandardMaterial('playerBodyMat', this.scene);
    bodyMat.diffuseColor = new Color3(0.3, 0.25, 0.2);
    body.material = bodyMat;

    // Position body at ground level
    body.position.y = 0.8;

    this.playerMesh = body;
  }

  private updateLoadedChunks(centerPos: WorldPosition): void {
    console.log(`[SceneManager] updateLoadedChunks center: ${JSON.stringify(centerPos)}`);
    const centerChunk = worldToChunk(centerPos);
    const chunksToLoad = new Set<string>();

    // Determine which chunks should be loaded
    for (let dx = -VIEW_DISTANCE; dx <= VIEW_DISTANCE; dx++) {
      for (let dz = -VIEW_DISTANCE; dz <= VIEW_DISTANCE; dz++) {
        const coord: ChunkCoord = {
          cx: centerChunk.cx + dx,
          cz: centerChunk.cz + dz,
        };
        chunksToLoad.add(chunkKey(coord));
      }
    }

    // Unload chunks that are too far
    for (const [key, chunk] of this.loadedChunks) {
      if (!chunksToLoad.has(key)) {
        chunk.dispose();
        this.loadedChunks.delete(key);
      }
    }

    // Load new chunks
    for (const key of chunksToLoad) {
      if (!this.loadedChunks.has(key)) {
        const [cx, cz] = key.split(',').map(Number);
        const coord: ChunkCoord = { cx, cz };
        const chunk = new TerrainChunk(this.scene, coord, this.terrainGenerator);
        this.loadedChunks.set(key, chunk);
      }
    }
  }

  // Public API

  setPlayerPosition(position: WorldPosition): void {
    this.playerPosition = position;

    // Calculate terrain height at this position
    const height = this.terrainGenerator.getHeightAt(position.x, position.z);

    // Update stored position with correct height
    this.playerPosition.y = height;

    if (this.playerMesh) {
      // Position player mesh on terrain, compensating for model's baked-in vertex offset
      // The gunslinger model has vertices at Y=29.5+, so we subtract the offset
      this.playerMesh.position.set(position.x, height - this.playerYOffset, position.z);
    }

    // Third-person camera follows the player
    // Target player's chest level for good framing
    const targetY = height + 1.0;
    this.camera.target.set(position.x, targetY, position.z);

    console.log(
      `[SceneManager] Player at (${position.x.toFixed(1)}, ${height.toFixed(1)}, ${position.z.toFixed(1)})`
    );

    // Update loaded chunks
    this.updateLoadedChunks(position);
  }

  movePlayerTo(target: WorldPosition): void {
    // Simple immediate move for now
    // TODO: Add smooth movement with animation
    this.setPlayerPosition(target);
  }

  setGroundClickHandler(handler: (position: WorldPosition) => void): void {
    this.onGroundClick = handler;
  }

  getHeightAt(x: number, z: number): number {
    return this.terrainGenerator.getHeightAt(x, z);
  }

  start(): void {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  dispose(): void {
    // Dispose all chunks
    for (const chunk of this.loadedChunks.values()) {
      chunk.dispose();
    }
    this.loadedChunks.clear();

    // Dispose player
    if (this.playerMesh) {
      this.playerMesh.dispose();
    }

    // Dispose diorama elements
    if (this.skyBackdrop) {
      this.skyBackdrop.dispose();
    }
    if (this.platformBase) {
      this.platformBase.dispose();
    }

    // Dispose scene and engine
    this.scene.dispose();
    this.engine.dispose();
  }

  getScene(): Scene {
    return this.scene;
  }

  getEngine(): Engine {
    return this.engine;
  }
}
