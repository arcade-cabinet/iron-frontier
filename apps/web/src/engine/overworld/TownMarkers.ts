/**
 * TownMarkers - Render town buildings and props on the overworld
 *
 * Features:
 * - Load and place western town buildings from GLB models
 * - CC0 western props from public/assets/models/
 * - Collision zones for "entering" towns
 * - LOD system: billboards for distant towns, full 3D when close
 */

import {
  type AbstractMesh,
  Color3,
  Mesh,
  MeshBuilder,
  type Scene,
  SceneLoader,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

// ============================================================================
// TYPES
// ============================================================================

export interface TownDefinition {
  /** Unique town ID */
  id: string;
  /** Display name */
  name: string;
  /** World position (X, Y, Z) */
  position: Vector3;
  /** Town size category */
  size: 'tiny' | 'small' | 'medium' | 'large';
  /** Optional icon type */
  icon?: 'town' | 'city' | 'mine' | 'camp' | 'outpost';
  /** Collision radius for entering */
  entryRadius?: number;
  /** Buildings to place */
  buildings?: BuildingPlacement[];
  /** Props to place */
  props?: PropPlacement[];
}

export interface BuildingPlacement {
  /** Building type */
  type: BuildingType;
  /** Position relative to town center */
  offset: { x: number; z: number };
  /** Rotation in degrees */
  rotation?: number;
  /** Scale multiplier */
  scale?: number;
}

export interface PropPlacement {
  /** Prop type */
  type: PropType;
  /** Position relative to town center */
  offset: { x: number; z: number };
  /** Rotation in degrees */
  rotation?: number;
  /** Scale multiplier */
  scale?: number;
}

export type BuildingType =
  | 'saloon'
  | 'general_store'
  | 'sheriff_office'
  | 'bank'
  | 'hotel'
  | 'stable'
  | 'church'
  | 'house_small'
  | 'house_large'
  | 'water_tower'
  | 'windmill'
  | 'mine_entrance';

export type PropType =
  | 'barrel'
  | 'barrel_water'
  | 'barrel_hay'
  | 'crate'
  | 'fence'
  | 'hitching_post'
  | 'bench'
  | 'cart'
  | 'wagon'
  | 'well'
  | 'signpost'
  | 'wanted_poster'
  | 'cactus'
  | 'dead_tree';

// Model paths for buildings and props
const BUILDING_MODELS: Record<BuildingType, { path: string; scale: number }> = {
  saloon: { path: 'assets/models/structures/saloon.glb', scale: 1.0 },
  general_store: { path: 'assets/models/structures/store.glb', scale: 1.0 },
  sheriff_office: { path: 'assets/models/structures/office.glb', scale: 1.0 },
  bank: { path: 'assets/models/structures/bank.glb', scale: 1.0 },
  hotel: { path: 'assets/models/structures/hotel.glb', scale: 1.0 },
  stable: { path: 'assets/models/structures/stable.glb', scale: 1.0 },
  church: { path: 'assets/models/structures/church.glb', scale: 1.0 },
  house_small: { path: 'assets/models/structures/house_small.glb', scale: 1.0 },
  house_large: { path: 'assets/models/structures/house_large.glb', scale: 1.0 },
  water_tower: { path: 'assets/models/structures/watertower.glb', scale: 1.5 },
  windmill: { path: 'assets/models/structures/windmill.glb', scale: 1.5 },
  mine_entrance: { path: 'assets/models/structures/mine.glb', scale: 1.0 },
};

const PROP_MODELS: Record<PropType, { path: string; scale: number }> = {
  barrel: { path: 'assets/models/containers/westernbarrel.glb', scale: 1.0 },
  barrel_water: { path: 'assets/models/containers/westernbarrel-water.glb', scale: 1.0 },
  barrel_hay: { path: 'assets/models/containers/westernbarrel-hay.glb', scale: 1.0 },
  crate: { path: 'assets/models/containers/crate.glb', scale: 0.8 },
  fence: { path: 'assets/models/structures/fence.glb', scale: 1.0 },
  hitching_post: { path: 'assets/models/structures/rail.glb', scale: 1.0 },
  bench: { path: 'assets/models/furniture/oldbench.glb', scale: 1.0 },
  cart: { path: 'assets/models/vehicles/westerncart.glb', scale: 1.0 },
  wagon: { path: 'assets/models/vehicles/westerncart-001.glb', scale: 1.0 },
  well: { path: 'assets/models/structures/well.glb', scale: 1.2 },
  signpost: { path: 'assets/models/structures/postsign.glb', scale: 1.0 },
  wanted_poster: { path: 'assets/models/decor/wantedposter.glb', scale: 0.8 },
  cactus: { path: 'assets/models/nature/cactus1.glb', scale: 1.5 },
  dead_tree: { path: 'assets/models/nature/deadtree.glb', scale: 2.0 },
};

// Default entry radius by town size
const DEFAULT_ENTRY_RADIUS: Record<string, number> = {
  tiny: 15,
  small: 25,
  medium: 40,
  large: 60,
};

// LOD distance thresholds
const LOD_DISTANCE_BILLBOARD = 200; // Use billboard beyond this distance
const LOD_DISTANCE_SIMPLIFIED = 100; // Use simplified models beyond this

// ============================================================================
// TOWN MARKERS MANAGER
// ============================================================================

export class TownMarkers {
  private scene: Scene;

  // Registered towns
  private towns: Map<string, TownDefinition> = new Map();

  // Loaded town meshes
  private townMeshes: Map<string, TransformNode> = new Map();
  private townBillboards: Map<string, Mesh> = new Map();

  // Collision zones
  private collisionZones: Map<string, { center: Vector3; radius: number }> = new Map();

  // LOD state
  private currentPlayerPosition: Vector3 = Vector3.Zero();

  // Callbacks
  private onTownEnter?: (townId: string) => void;
  private onTownExit?: (townId: string) => void;
  private currentTown: string | null = null;

  // Model cache for reuse
  private modelCache: Map<string, AbstractMesh> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
    console.log('[TownMarkers] Created');
  }

  /**
   * Initialize the town markers system
   */
  async init(): Promise<void> {
    console.log('[TownMarkers] Initializing...');
    // Pre-warm model cache could go here
    console.log('[TownMarkers] Initialization complete');
  }

  /**
   * Register a town
   */
  async registerTown(town: TownDefinition): Promise<void> {
    this.towns.set(town.id, town);

    // Create collision zone
    const radius = town.entryRadius ?? DEFAULT_ENTRY_RADIUS[town.size];
    this.collisionZones.set(town.id, {
      center: town.position.clone(),
      radius,
    });

    // Create town visuals
    await this.createTownVisuals(town);

    console.log(`[TownMarkers] Registered town: ${town.name} (${town.size})`);
  }

  /**
   * Create visual representation of a town
   */
  private async createTownVisuals(town: TownDefinition): Promise<void> {
    // Create parent transform node
    const townRoot = new TransformNode(`town_${town.id}`, this.scene);
    townRoot.position = town.position.clone();
    this.townMeshes.set(town.id, townRoot);

    // Create billboard for LOD
    const billboard = this.createTownBillboard(town);
    billboard.parent = townRoot;
    billboard.setEnabled(false); // Start with 3D model visible
    this.townBillboards.set(town.id, billboard);

    // Load buildings if specified
    if (town.buildings && town.buildings.length > 0) {
      await this.loadTownBuildings(town, townRoot);
    } else {
      // Generate default layout based on size
      await this.generateDefaultLayout(town, townRoot);
    }

    // Load props if specified
    if (town.props && town.props.length > 0) {
      await this.loadTownProps(town, townRoot);
    }
  }

  /**
   * Create billboard sprite for distant LOD
   */
  private createTownBillboard(town: TownDefinition): Mesh {
    // Billboard size based on town size
    const sizes = { tiny: 8, small: 12, medium: 18, large: 25 };
    const size = sizes[town.size];

    const billboard = MeshBuilder.CreatePlane(
      `town_billboard_${town.id}`,
      { width: size, height: size },
      this.scene
    );

    // Position above town center
    billboard.position = new Vector3(0, size / 2 + 5, 0);
    billboard.billboardMode = Mesh.BILLBOARDMODE_Y;

    // Create material with town icon
    const material = new StandardMaterial(`town_billboard_mat_${town.id}`, this.scene);
    material.diffuseColor = this.getTownColor(town);
    material.emissiveColor = this.getTownColor(town).scale(0.3);
    material.alpha = 0.9;
    material.backFaceCulling = false;

    billboard.material = material;
    billboard.isPickable = true;
    billboard.metadata = { townId: town.id, townName: town.name };

    return billboard;
  }

  /**
   * Get town color based on type
   */
  private getTownColor(town: TownDefinition): Color3 {
    switch (town.icon) {
      case 'city':
        return new Color3(0.9, 0.8, 0.5); // Gold
      case 'mine':
        return new Color3(0.6, 0.4, 0.3); // Brown
      case 'camp':
        return new Color3(0.5, 0.7, 0.4); // Green
      case 'outpost':
        return new Color3(0.7, 0.5, 0.4); // Rust
      default:
        return new Color3(0.8, 0.7, 0.5); // Tan
    }
  }

  /**
   * Load specified buildings for a town
   */
  private async loadTownBuildings(town: TownDefinition, parent: TransformNode): Promise<void> {
    if (!town.buildings) return;

    for (const building of town.buildings) {
      try {
        const modelInfo = BUILDING_MODELS[building.type];
        if (!modelInfo) {
          console.warn(`[TownMarkers] Unknown building type: ${building.type}`);
          continue;
        }

        const mesh = await this.loadModel(modelInfo.path);
        if (!mesh) continue;

        // Clone if from cache
        const instance = mesh.clone(`${town.id}_${building.type}`, parent);
        if (!instance) continue;

        // Position and rotate
        instance.position = new Vector3(building.offset.x, 0, building.offset.z);
        instance.rotation.y = ((building.rotation ?? 0) * Math.PI) / 180;
        instance.scaling.setAll(modelInfo.scale * (building.scale ?? 1));

        // Clear quaternion for Euler rotation
        instance.rotationQuaternion = null;
      } catch (err) {
        console.warn(`[TownMarkers] Failed to load building ${building.type}:`, err);
      }
    }
  }

  /**
   * Generate default town layout based on size
   */
  private async generateDefaultLayout(town: TownDefinition, parent: TransformNode): Promise<void> {
    // Create a simple placeholder building group based on town size
    const buildingCount = { tiny: 2, small: 4, medium: 8, large: 12 };
    const count = buildingCount[town.size];
    const radius = DEFAULT_ENTRY_RADIUS[town.size] * 0.6;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const distance = radius * (0.5 + Math.random() * 0.5);

      // Create placeholder building (box)
      const height = 3 + Math.random() * 4;
      const width = 4 + Math.random() * 3;

      const building = MeshBuilder.CreateBox(
        `town_${town.id}_building_${i}`,
        { width, height, depth: width * 0.8 },
        this.scene
      );

      building.position = new Vector3(
        Math.cos(angle) * distance,
        height / 2,
        Math.sin(angle) * distance
      );
      building.rotation.y = angle + Math.PI;
      building.parent = parent;

      // Simple material
      const material = new StandardMaterial(`building_mat_${town.id}_${i}`, this.scene);
      material.diffuseColor = new Color3(0.6 + Math.random() * 0.2, 0.5 + Math.random() * 0.15, 0.4);
      building.material = material;
    }

    // Add water tower for medium+ towns
    if (town.size === 'medium' || town.size === 'large') {
      try {
        const waterTower = await this.loadModel('assets/models/structures/watertower.glb');
        if (waterTower) {
          const instance = waterTower.clone(`${town.id}_water_tower`, parent);
          if (instance) {
            instance.position = new Vector3(0, 0, -radius * 0.3);
            instance.scaling.setAll(1.5);
          }
        }
      } catch (err) {
        console.warn('[TownMarkers] Failed to load water tower:', err);
      }
    }
  }

  /**
   * Load specified props for a town
   */
  private async loadTownProps(town: TownDefinition, parent: TransformNode): Promise<void> {
    if (!town.props) return;

    for (const prop of town.props) {
      try {
        const modelInfo = PROP_MODELS[prop.type];
        if (!modelInfo) {
          console.warn(`[TownMarkers] Unknown prop type: ${prop.type}`);
          continue;
        }

        const mesh = await this.loadModel(modelInfo.path);
        if (!mesh) continue;

        const instance = mesh.clone(`${town.id}_${prop.type}`, parent);
        if (!instance) continue;

        instance.position = new Vector3(prop.offset.x, 0, prop.offset.z);
        instance.rotation.y = ((prop.rotation ?? 0) * Math.PI) / 180;
        instance.scaling.setAll(modelInfo.scale * (prop.scale ?? 1));
        instance.rotationQuaternion = null;
      } catch (err) {
        console.warn(`[TownMarkers] Failed to load prop ${prop.type}:`, err);
      }
    }
  }

  /**
   * Load and cache model
   */
  private async loadModel(path: string): Promise<AbstractMesh | null> {
    // Check cache
    const cached = this.modelCache.get(path);
    if (cached) {
      return cached;
    }

    try {
      const lastSlash = path.lastIndexOf('/');
      const rootUrl = lastSlash >= 0 ? path.substring(0, lastSlash + 1) : '';
      const fileName = lastSlash >= 0 ? path.substring(lastSlash + 1) : path;

      const result = await SceneLoader.ImportMeshAsync('', rootUrl, fileName, this.scene);

      if (result.meshes.length > 0) {
        const mesh = result.meshes[0];
        mesh.setEnabled(false); // Hide the original, we'll use clones
        this.modelCache.set(path, mesh);
        return mesh;
      }
    } catch (err) {
      console.warn(`[TownMarkers] Failed to load model ${path}:`, err);
    }

    return null;
  }

  /**
   * Update LOD based on player position
   */
  update(playerPosition: Vector3): void {
    this.currentPlayerPosition = playerPosition.clone();

    // Check town entry/exit
    this.checkTownCollisions(playerPosition);

    // Update LOD for each town
    for (const [townId, townRoot] of this.townMeshes) {
      const distance = Vector3.Distance(playerPosition, townRoot.position);
      const billboard = this.townBillboards.get(townId);

      if (distance > LOD_DISTANCE_BILLBOARD) {
        // Use billboard
        townRoot.getChildMeshes().forEach((m) => m.setEnabled(false));
        if (billboard) billboard.setEnabled(true);
      } else {
        // Use 3D models
        townRoot.getChildMeshes().forEach((m) => {
          if (m !== billboard) m.setEnabled(true);
        });
        if (billboard) billboard.setEnabled(false);
      }
    }
  }

  /**
   * Check for town entry/exit collisions
   */
  private checkTownCollisions(playerPosition: Vector3): void {
    let enteredTown: string | null = null;

    for (const [townId, zone] of this.collisionZones) {
      const distance = Vector3.Distance(playerPosition, zone.center);
      if (distance <= zone.radius) {
        enteredTown = townId;
        break;
      }
    }

    // Handle state changes
    if (enteredTown !== this.currentTown) {
      if (this.currentTown && this.onTownExit) {
        this.onTownExit(this.currentTown);
      }

      this.currentTown = enteredTown;

      if (enteredTown && this.onTownEnter) {
        this.onTownEnter(enteredTown);
      }
    }
  }

  /**
   * Set town enter callback
   */
  setOnTownEnter(callback: (townId: string) => void): void {
    this.onTownEnter = callback;
  }

  /**
   * Set town exit callback
   */
  setOnTownExit(callback: (townId: string) => void): void {
    this.onTownExit = callback;
  }

  /**
   * Get currently entered town (if any)
   */
  getCurrentTown(): string | null {
    return this.currentTown;
  }

  /**
   * Get town definition by ID
   */
  getTown(townId: string): TownDefinition | undefined {
    return this.towns.get(townId);
  }

  /**
   * Get all registered towns
   */
  getAllTowns(): TownDefinition[] {
    return Array.from(this.towns.values());
  }

  /**
   * Remove a town
   */
  removeTown(townId: string): void {
    // Dispose meshes
    const townRoot = this.townMeshes.get(townId);
    if (townRoot) {
      townRoot.dispose();
      this.townMeshes.delete(townId);
    }

    const billboard = this.townBillboards.get(townId);
    if (billboard) {
      billboard.dispose();
      this.townBillboards.delete(townId);
    }

    // Remove data
    this.towns.delete(townId);
    this.collisionZones.delete(townId);

    console.log(`[TownMarkers] Removed town: ${townId}`);
  }

  /**
   * Check if a mesh is a town marker
   */
  getTownFromMesh(mesh: AbstractMesh): string | null {
    if (mesh.metadata && mesh.metadata.townId) {
      return mesh.metadata.townId;
    }

    // Check parent chain
    let current = mesh.parent;
    while (current) {
      const name = current.name;
      if (name.startsWith('town_')) {
        const townId = name.substring(5);
        if (this.towns.has(townId)) {
          return townId;
        }
      }
      current = current.parent;
    }

    return null;
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    console.log('[TownMarkers] Disposing...');

    // Dispose all town meshes
    for (const townRoot of this.townMeshes.values()) {
      townRoot.dispose();
    }
    this.townMeshes.clear();

    for (const billboard of this.townBillboards.values()) {
      billboard.dispose();
    }
    this.townBillboards.clear();

    // Dispose cached models
    for (const model of this.modelCache.values()) {
      model.dispose();
    }
    this.modelCache.clear();

    // Clear data
    this.towns.clear();
    this.collisionZones.clear();

    console.log('[TownMarkers] Disposed');
  }
}

export default TownMarkers;
