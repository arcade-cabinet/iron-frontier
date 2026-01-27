// Babylon.js Engine wrapper for Cogsworth Station

import {
  ActionManager,
  Animation,
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  ExecuteCodeAction,
  HemisphericLight,
  HighlightLayer,
  type Mesh,
  MeshBuilder,
  PointerEventTypes,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import type { GridPos, NPC, Sector } from '../lib/types';

// Tile size in world units
const TILE_SIZE = 1;
const _PLAYER_HEIGHT = 0.8;

// Steampunk color palette
const COLORS = {
  brass: new Color3(0.71, 0.53, 0.26),
  copper: new Color3(0.72, 0.45, 0.2),
  iron: new Color3(0.3, 0.3, 0.32),
  wood: new Color3(0.4, 0.26, 0.13),
  floor: new Color3(0.25, 0.22, 0.2),
  wall: new Color3(0.15, 0.13, 0.12),
  accent: new Color3(0.85, 0.65, 0.2),
  steam: new Color3(0.9, 0.92, 0.95),
  player: new Color3(0.2, 0.5, 0.7),
  npc: new Color3(0.7, 0.5, 0.2),
  item: new Color3(0.3, 0.7, 0.3),
  door: new Color3(0.6, 0.4, 0.15),
};

export interface EngineCallbacks {
  onTileClick: (position: GridPos) => void;
  onNPCClick: (npcId: string) => void;
  onItemClick: (position: GridPos) => void;
}

export class BabylonEngine {
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;
  private playerMesh: Mesh | null = null;
  private npcMeshes: Map<string, Mesh> = new Map();
  private itemMeshes: Map<string, Mesh> = new Map();
  private tileMeshes: Mesh[] = [];
  private highlightLayer: HighlightLayer;
  private callbacks: EngineCallbacks;
  private shadowGenerator: ShadowGenerator | null = null;
  private isLowPower: boolean = false;
  private resizeHandler?: () => void;

  // Animation state
  private playerTargetPosition: Vector3 | null = null;
  private isPlayerMoving: boolean = false;

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;

    // Create engine with mobile optimizations
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    // Enable hardware scaling for mobile
    this.engine.setHardwareScalingLevel(1 / window.devicePixelRatio);

    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.08, 0.07, 0.1, 1);

    // Isometric camera setup
    this.camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 4, // Alpha (rotation around Y)
      Math.PI / 3, // Beta (angle from top)
      20, // Radius
      Vector3.Zero(),
      this.scene
    );

    // Camera controls for mobile
    this.camera.attachControl(canvas, true);
    this.camera.lowerRadiusLimit = 10;
    this.camera.upperRadiusLimit = 35;
    this.camera.lowerBetaLimit = Math.PI / 6;
    this.camera.upperBetaLimit = Math.PI / 2.5;
    this.camera.panningSensibility = 100;
    this.camera.pinchPrecision = 50;
    this.camera.wheelPrecision = 20;

    // Highlight layer for interactables
    this.highlightLayer = new HighlightLayer('highlights', this.scene);

    this.setupLighting();
    this.setupInput();
  }

  private setupLighting(): void {
    // Ambient light (steampunk warm tone)
    const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), this.scene);
    ambient.intensity = 0.4;
    ambient.groundColor = new Color3(0.2, 0.15, 0.1);
    ambient.diffuse = new Color3(0.9, 0.8, 0.6);

    // Main directional light (creates depth)
    const dirLight = new DirectionalLight('dirLight', new Vector3(-1, -2, -1), this.scene);
    dirLight.intensity = 0.8;
    dirLight.diffuse = new Color3(1, 0.9, 0.7);

    // Shadow generator (simplified for mobile)
    if (!this.isLowPower) {
      this.shadowGenerator = new ShadowGenerator(512, dirLight);
      this.shadowGenerator.useBlurExponentialShadowMap = true;
      this.shadowGenerator.blurKernel = 8;
    }
  }

  private setupInput(): void {
    // Tap-to-move input handling
    this.scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === PointerEventTypes.POINTERTAP) {
        const pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);

        if (pickResult?.hit && pickResult.pickedMesh) {
          const mesh = pickResult.pickedMesh;

          // Check if it's an NPC
          if (mesh.metadata?.type === 'npc') {
            this.callbacks.onNPCClick(mesh.metadata.id);
            return;
          }

          // Check if it's an item
          if (mesh.metadata?.type === 'item') {
            this.callbacks.onItemClick(mesh.metadata.position);
            return;
          }

          // Check if it's a floor tile
          if (mesh.metadata?.type === 'floor' || mesh.metadata?.type === 'door') {
            this.callbacks.onTileClick(mesh.metadata.position);
          }
        }
      }
    });
  }

  public loadSector(sector: Sector): void {
    // Clear existing meshes
    this.clearSector();
    this.currentSector = sector;

    // Create floor and walls
    for (let y = 0; y < sector.height; y++) {
      for (let x = 0; x < sector.width; x++) {
        const tile = sector.grid[y][x];
        const worldPos = this.gridToWorld({ x, y });

        if (tile.type === 'floor' || tile.type === 'door') {
          const floorMesh = MeshBuilder.CreateBox(
            `floor_${x}_${y}`,
            { width: TILE_SIZE * 0.95, height: 0.1, depth: TILE_SIZE * 0.95 },
            this.scene
          );
          floorMesh.position = new Vector3(worldPos.x, -0.05, worldPos.z);

          const floorMat = new StandardMaterial(`floorMat_${x}_${y}`, this.scene);
          floorMat.diffuseColor = tile.type === 'door' ? COLORS.door : COLORS.floor;
          floorMat.specularColor = new Color3(0.1, 0.1, 0.1);
          floorMesh.material = floorMat;

          floorMesh.metadata = { type: tile.type, position: { x, y } };
          floorMesh.receiveShadows = true;

          this.tileMeshes.push(floorMesh);
        } else if (tile.type === 'wall') {
          const wallMesh = MeshBuilder.CreateBox(
            `wall_${x}_${y}`,
            { width: TILE_SIZE, height: 1.5, depth: TILE_SIZE },
            this.scene
          );
          wallMesh.position = new Vector3(worldPos.x, 0.65, worldPos.z);

          const wallMat = new StandardMaterial(`wallMat_${x}_${y}`, this.scene);
          wallMat.diffuseColor = COLORS.wall;
          wallMat.specularColor = new Color3(0.05, 0.05, 0.05);
          wallMesh.material = wallMat;

          wallMesh.metadata = { type: 'wall', position: { x, y } };
          if (this.shadowGenerator) {
            this.shadowGenerator.addShadowCaster(wallMesh);
          }

          this.tileMeshes.push(wallMesh);
        } else if (tile.type === 'prop' && tile.propId) {
          this.createProp(tile.propId, { x, y });
        }
      }
    }

    // Create NPCs
    for (const npc of sector.npcs) {
      this.createNPC(npc);
    }

    // Create items
    for (const item of sector.items) {
      this.createItemMesh(item.item.id, item.position);
    }

    // Center camera on sector
    const centerX = (sector.width * TILE_SIZE) / 2;
    const centerZ = (sector.height * TILE_SIZE) / 2;
    this.camera.target = new Vector3(centerX, 0, centerZ);
  }

  private createProp(propId: string, position: GridPos): void {
    const worldPos = this.gridToWorld(position);
    let mesh: Mesh;

    // Create different prop shapes based on type
    switch (propId) {
      case 'crate':
      case 'barrel':
        mesh = MeshBuilder.CreateBox(
          `prop_${position.x}_${position.y}`,
          { width: 0.6, height: 0.7, depth: 0.6 },
          this.scene
        );
        break;
      case 'workbench':
      case 'table':
        mesh = MeshBuilder.CreateBox(
          `prop_${position.x}_${position.y}`,
          { width: 0.9, height: 0.5, depth: 0.6 },
          this.scene
        );
        break;
      default:
        mesh = MeshBuilder.CreateCylinder(
          `prop_${position.x}_${position.y}`,
          { diameter: 0.5, height: 0.6 },
          this.scene
        );
    }

    mesh.position = new Vector3(worldPos.x, 0.35, worldPos.z);

    const mat = new StandardMaterial(`propMat_${position.x}_${position.y}`, this.scene);
    mat.diffuseColor = COLORS.wood;
    mat.specularColor = new Color3(0.1, 0.08, 0.05);
    mesh.material = mat;

    mesh.metadata = { type: 'prop', propId, position };
    if (this.shadowGenerator) {
      this.shadowGenerator.addShadowCaster(mesh);
    }

    this.tileMeshes.push(mesh);
  }

  private createNPC(npc: NPC): void {
    const worldPos = this.gridToWorld(npc.position);

    // NPC body
    const body = MeshBuilder.CreateCylinder(
      `npc_${npc.id}_body`,
      { diameter: 0.5, height: 0.6, tessellation: 8 },
      this.scene
    );
    body.position = new Vector3(worldPos.x, 0.3, worldPos.z);

    // NPC head
    const head = MeshBuilder.CreateSphere(
      `npc_${npc.id}_head`,
      { diameter: 0.35, segments: 8 },
      this.scene
    );
    head.position = new Vector3(0, 0.5, 0);
    head.parent = body;

    // Hat (steampunk top hat)
    const hat = MeshBuilder.CreateCylinder(
      `npc_${npc.id}_hat`,
      { diameter: 0.25, height: 0.2, tessellation: 8 },
      this.scene
    );
    hat.position = new Vector3(0, 0.75, 0);
    hat.parent = body;

    const mat = new StandardMaterial(`npcMat_${npc.id}`, this.scene);
    mat.diffuseColor = COLORS.npc;
    mat.specularColor = new Color3(0.2, 0.2, 0.2);
    body.material = mat;
    head.material = mat;

    const hatMat = new StandardMaterial(`npcHatMat_${npc.id}`, this.scene);
    hatMat.diffuseColor = COLORS.iron;
    hat.material = hatMat;

    body.metadata = { type: 'npc', id: npc.id };

    // Make NPC clickable
    body.actionManager = new ActionManager(this.scene);
    body.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
        this.highlightLayer.addMesh(body, Color3.White());
      })
    );
    body.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
        this.highlightLayer.removeMesh(body);
      })
    );

    if (this.shadowGenerator) {
      this.shadowGenerator.addShadowCaster(body);
    }

    this.npcMeshes.set(npc.id, body);
  }

  private createItemMesh(itemId: string, position: GridPos): void {
    const worldPos = this.gridToWorld(position);
    const key = `${position.x}_${position.y}`;

    // Glowing item pickup
    const mesh = MeshBuilder.CreateBox(
      `item_${key}`,
      { width: 0.3, height: 0.3, depth: 0.3 },
      this.scene
    );
    mesh.position = new Vector3(worldPos.x, 0.25, worldPos.z);

    const mat = new StandardMaterial(`itemMat_${key}`, this.scene);
    mat.diffuseColor = COLORS.item;
    mat.emissiveColor = new Color3(0.1, 0.3, 0.1);
    mat.specularColor = new Color3(0.5, 0.5, 0.5);
    mesh.material = mat;

    mesh.metadata = { type: 'item', id: itemId, position };

    // Floating animation
    const floatAnim = new Animation(
      'itemFloat',
      'position.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    floatAnim.setKeys([
      { frame: 0, value: 0.25 },
      { frame: 30, value: 0.4 },
      { frame: 60, value: 0.25 },
    ]);
    mesh.animations.push(floatAnim);
    this.scene.beginAnimation(mesh, 0, 60, true);

    // Rotation animation
    const rotateAnim = new Animation(
      'itemRotate',
      'rotation.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    rotateAnim.setKeys([
      { frame: 0, value: 0 },
      { frame: 120, value: Math.PI * 2 },
    ]);
    mesh.animations.push(rotateAnim);
    this.scene.beginAnimation(mesh, 0, 120, true);

    this.itemMeshes.set(key, mesh);
  }

  public createPlayer(position: GridPos): void {
    if (this.playerMesh) {
      this.playerMesh.dispose();
    }

    const worldPos = this.gridToWorld(position);

    // Player body
    this.playerMesh = MeshBuilder.CreateCylinder(
      'player_body',
      { diameter: 0.45, height: 0.55, tessellation: 12 },
      this.scene
    );
    this.playerMesh.position = new Vector3(worldPos.x, 0.275, worldPos.z);

    // Player head
    const head = MeshBuilder.CreateSphere(
      'player_head',
      { diameter: 0.3, segments: 12 },
      this.scene
    );
    head.position = new Vector3(0, 0.45, 0);
    head.parent = this.playerMesh;

    // Goggles (steampunk!)
    const goggleL = MeshBuilder.CreateTorus(
      'goggle_l',
      { diameter: 0.12, thickness: 0.02, tessellation: 12 },
      this.scene
    );
    goggleL.rotation.x = Math.PI / 2;
    goggleL.position = new Vector3(-0.08, 0.47, 0.12);
    goggleL.parent = this.playerMesh;

    const goggleR = MeshBuilder.CreateTorus(
      'goggle_r',
      { diameter: 0.12, thickness: 0.02, tessellation: 12 },
      this.scene
    );
    goggleR.rotation.x = Math.PI / 2;
    goggleR.position = new Vector3(0.08, 0.47, 0.12);
    goggleR.parent = this.playerMesh;

    const playerMat = new StandardMaterial('playerMat', this.scene);
    playerMat.diffuseColor = COLORS.player;
    playerMat.specularColor = new Color3(0.3, 0.3, 0.3);
    this.playerMesh.material = playerMat;
    head.material = playerMat;

    const goggleMat = new StandardMaterial('goggleMat', this.scene);
    goggleMat.diffuseColor = COLORS.brass;
    goggleMat.specularColor = new Color3(0.6, 0.5, 0.3);
    goggleL.material = goggleMat;
    goggleR.material = goggleMat;

    if (this.shadowGenerator) {
      this.shadowGenerator.addShadowCaster(this.playerMesh);
    }
  }

  public movePlayerTo(position: GridPos): void {
    if (!this.playerMesh) return;

    const worldPos = this.gridToWorld(position);
    this.playerTargetPosition = new Vector3(worldPos.x, 0.275, worldPos.z);
    this.isPlayerMoving = true;

    // Face direction of movement
    const dx = worldPos.x - this.playerMesh.position.x;
    const dz = worldPos.z - this.playerMesh.position.z;
    if (dx !== 0 || dz !== 0) {
      this.playerMesh.rotation.y = Math.atan2(dx, dz);
    }
  }

  public removeItem(position: GridPos): void {
    const key = `${position.x}_${position.y}`;
    const mesh = this.itemMeshes.get(key);
    if (mesh) {
      mesh.dispose();
      this.itemMeshes.delete(key);
    }
  }

  private clearSector(): void {
    // Dispose tile meshes
    for (const mesh of this.tileMeshes) {
      mesh.dispose();
    }
    this.tileMeshes = [];

    // Dispose NPC meshes
    for (const mesh of this.npcMeshes.values()) {
      mesh.dispose();
    }
    this.npcMeshes.clear();

    // Dispose item meshes
    for (const mesh of this.itemMeshes.values()) {
      mesh.dispose();
    }
    this.itemMeshes.clear();
  }

  private gridToWorld(gridPos: GridPos): { x: number; z: number } {
    return {
      x: gridPos.x * TILE_SIZE + TILE_SIZE / 2,
      z: gridPos.y * TILE_SIZE + TILE_SIZE / 2,
    };
  }

  public setLowPowerMode(enabled: boolean): void {
    this.isLowPower = enabled;

    if (enabled) {
      // Reduce quality for battery saving
      this.engine.setHardwareScalingLevel(2);
      if (this.shadowGenerator) {
        this.shadowGenerator.dispose();
        this.shadowGenerator = null;
      }
    } else {
      this.engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
    }
  }

  public focusCameraOn(position: GridPos): void {
    const worldPos = this.gridToWorld(position);

    // Smooth camera follow
    Animation.CreateAndStartAnimation(
      'cameraFollow',
      this.camera,
      'target',
      60,
      15,
      this.camera.target,
      new Vector3(worldPos.x, 0, worldPos.z),
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
  }

  public start(): void {
    // Main render loop
    this.engine.runRenderLoop(() => {
      // Update player movement
      if (this.isPlayerMoving && this.playerMesh && this.playerTargetPosition) {
        const speed = 0.15;
        const dx = this.playerTargetPosition.x - this.playerMesh.position.x;
        const dz = this.playerTargetPosition.z - this.playerMesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 0.1) {
          this.playerMesh.position = this.playerTargetPosition;
          this.isPlayerMoving = false;
          this.playerTargetPosition = null;
        } else {
          this.playerMesh.position.x += (dx / dist) * speed;
          this.playerMesh.position.z += (dz / dist) * speed;
        }
      }

      this.scene.render();
    });

    // Handle resize
    this.resizeHandler = () => {
      this.engine.resize();
    };
    window.addEventListener('resize', this.resizeHandler);
  }

  public dispose(): void {
    // Remove resize listener
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }

    this.clearSector();
    if (this.playerMesh) {
      this.playerMesh.dispose();
    }
    if (this.shadowGenerator) {
      this.shadowGenerator.dispose();
    }
    this.scene.dispose();
    this.engine.dispose();
  }

  public getScene(): Scene {
    return this.scene;
  }

  public getEngine(): Engine {
    return this.engine;
  }
}
