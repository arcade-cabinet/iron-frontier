// Scene Manager - Main Babylon.js scene orchestration
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  DirectionalLight,
  Color3,
  Color4,
  ShadowGenerator,
  CubeTexture,
  MeshBuilder,
  StandardMaterial,
  Mesh,
} from '@babylonjs/core';
import { 
  ChunkCoord, 
  WorldPosition, 
  CHUNK_SIZE, 
  VIEW_DISTANCE,
  worldToChunk,
  chunkKey,
  CameraState,
  DEFAULT_CAMERA_STATE,
} from '../types';
import { TerrainChunk } from '../terrain/TerrainChunk';
import { HeightmapGenerator, getHeightmapGenerator } from '../terrain/HeightmapGenerator';

export class SceneManager {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;
  private shadowGenerator: ShadowGenerator | null = null;
  
  // Terrain chunks
  private terrainGenerator: HeightmapGenerator;
  private loadedChunks: Map<string, TerrainChunk> = new Map();
  
  // Sky
  private skyDome: Mesh | null = null;
  
  // Player
  private playerMesh: Mesh | null = null;
  private playerPosition: WorldPosition = { x: 0, y: 0, z: 0 };
  
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
    
    // Create scene
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.6, 0.75, 0.9, 1); // Sky blue
    
    // Initialize terrain generator
    this.terrainGenerator = getHeightmapGenerator(seed);
    
    // Setup scene components
    this.setupCamera();
    this.setupLighting();
    this.setupSkyDome();
    this.setupInput();
    
    // Create player mesh
    this.createPlayerMesh();
    
    // Load initial chunks
    this.updateLoadedChunks(this.playerPosition);
  }

  private setupCamera(): void {
    this.camera = new ArcRotateCamera(
      'camera',
      this.cameraState.azimuth,
      this.cameraState.elevation,
      this.cameraState.distance,
      this.cameraState.focusPoint,
      this.scene
    );
    
    this.camera.attachControl(this.canvas, true);
    this.camera.lowerRadiusLimit = this.cameraState.minDistance;
    this.camera.upperRadiusLimit = this.cameraState.maxDistance;
    this.camera.lowerBetaLimit = this.cameraState.minElevation;
    this.camera.upperBetaLimit = this.cameraState.maxElevation;
    
    // Mobile-friendly controls
    this.camera.panningSensibility = 100;
    this.camera.pinchPrecision = 50;
    this.camera.wheelPrecision = 20;
    
    // Smooth camera movement
    this.camera.inertia = 0.9;
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

  private setupSkyDome(): void {
    // Simple gradient sky dome
    this.skyDome = MeshBuilder.CreateSphere('skyDome', { diameter: 1000, segments: 16 }, this.scene);
    this.skyDome.infiniteDistance = true;
    
    const skyMat = new StandardMaterial('skyMat', this.scene);
    skyMat.backFaceCulling = false;
    skyMat.disableLighting = true;
    
    // Gradient from horizon to zenith
    skyMat.emissiveColor = new Color3(0.6, 0.75, 0.9);
    
    this.skyDome.material = skyMat;
  }

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

  private createPlayerMesh(): void {
    // Create a simple gunslinger placeholder
    const body = MeshBuilder.CreateCylinder('player_body', {
      height: 1.6,
      diameterTop: 0.4,
      diameterBottom: 0.5,
      tessellation: 12,
    }, this.scene);
    
    const head = MeshBuilder.CreateSphere('player_head', {
      diameter: 0.4,
      segments: 12,
    }, this.scene);
    head.position.y = 1.0;
    head.parent = body;
    
    const hat = MeshBuilder.CreateCylinder('player_hat', {
      height: 0.3,
      diameterTop: 0.55,
      diameterBottom: 0.5,
      tessellation: 12,
    }, this.scene);
    hat.position.y = 1.35;
    hat.parent = body;
    
    // Hat brim
    const brim = MeshBuilder.CreateCylinder('player_brim', {
      height: 0.05,
      diameter: 0.7,
      tessellation: 12,
    }, this.scene);
    brim.position.y = 1.2;
    brim.parent = body;
    
    // Materials
    const bodyMat = new StandardMaterial('playerBodyMat', this.scene);
    bodyMat.diffuseColor = new Color3(0.3, 0.25, 0.2);
    body.material = bodyMat;
    
    const headMat = new StandardMaterial('playerHeadMat', this.scene);
    headMat.diffuseColor = new Color3(0.85, 0.7, 0.55);
    head.material = headMat;
    
    const hatMat = new StandardMaterial('playerHatMat', this.scene);
    hatMat.diffuseColor = new Color3(0.25, 0.18, 0.12);
    hat.material = hatMat;
    brim.material = hatMat;
    
    // Position body at ground level
    body.position.y = 0.8;
    
    // Add to shadow caster
    if (this.shadowGenerator) {
      this.shadowGenerator.addShadowCaster(body);
    }
    
    this.playerMesh = body;
  }

  private updateLoadedChunks(centerPos: WorldPosition): void {
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
    
    if (this.playerMesh) {
      // Get height at position
      const height = this.terrainGenerator.getHeightAt(position.x, position.z);
      this.playerMesh.position.set(position.x, height + 0.8, position.z);
    }
    
    // Update camera target
    this.camera.target = new Vector3(position.x, position.y + 1, position.z);
    
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
    
    // Dispose sky
    if (this.skyDome) {
      this.skyDome.dispose();
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
