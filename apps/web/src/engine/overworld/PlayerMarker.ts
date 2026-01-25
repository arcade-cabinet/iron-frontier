/**
 * PlayerMarker - Player representation on the overworld
 *
 * Features:
 * - Player character, wagon, or horse model
 * - Movement controls (WASD/click-to-move)
 * - Collision with terrain features
 * - Animation states (idle, walk, run)
 */

import {
  type AbstractMesh,
  type AnimationGroup,
  type ArcRotateCamera,
  Mesh,
  MeshBuilder,
  type Scene,
  SceneLoader,
  type Skeleton,
  StandardMaterial,
  Vector3,
  Color3,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

import { WesternAssets } from '@iron-frontier/assets';

// ============================================================================
// TYPES
// ============================================================================

export type PlayerRepresentation = 'character' | 'horse' | 'wagon';

export type MovementState = 'idle' | 'walking' | 'running';

export interface PlayerMarkerConfig {
  /** Visual representation type */
  representation: PlayerRepresentation;
  /** Movement speed in units per second */
  walkSpeed: number;
  /** Running speed multiplier */
  runSpeedMultiplier: number;
  /** Rotation speed in radians per second */
  rotationSpeed: number;
  /** Enable keyboard controls */
  enableKeyboard: boolean;
  /** Enable click-to-move */
  enableClickToMove: boolean;
  /** Character model scale */
  modelScale: number;
}

export interface MoveTarget {
  position: Vector3;
  callback?: () => void;
}

const DEFAULT_CONFIG: PlayerMarkerConfig = {
  representation: 'character',
  walkSpeed: 8,
  runSpeedMultiplier: 2,
  rotationSpeed: 5,
  enableKeyboard: true,
  enableClickToMove: true,
  modelScale: 1.5,
};

// Model paths
const PLAYER_MODELS: Record<PlayerRepresentation, string> = {
  character: WesternAssets.ENGINEER,
  horse: 'assets/models/characters/horse.glb', // Placeholder
  wagon: WesternAssets.COVERED_WAGON,
};

// ============================================================================
// PLAYER MARKER
// ============================================================================

export class PlayerMarker {
  private scene: Scene;
  private canvas: HTMLCanvasElement;
  private config: PlayerMarkerConfig;

  // Mesh and animations
  private playerMesh: AbstractMesh | null = null;
  private playerSkeleton: Skeleton | null = null;
  private animations: AnimationGroup[] = [];
  private currentAnimation: AnimationGroup | null = null;

  // Position and movement
  private position: Vector3 = Vector3.Zero();
  private rotation: number = 0; // Y rotation in radians
  private velocity: Vector3 = Vector3.Zero();
  private movementState: MovementState = 'idle';

  // Click-to-move target
  private moveTarget: MoveTarget | null = null;

  // Keyboard state
  private keys: Set<string> = new Set();
  private isRunning: boolean = false;

  // Height callback (terrain height)
  private getTerrainHeight: ((x: number, z: number) => number) | null = null;

  // Callbacks
  private onPositionChanged?: (position: Vector3) => void;
  private onMovementStateChanged?: (state: MovementState) => void;

  // Y offset for model (to compensate for origin not at feet)
  private modelYOffset: number = 0;

  constructor(scene: Scene, canvas: HTMLCanvasElement, config: Partial<PlayerMarkerConfig> = {}) {
    this.scene = scene;
    this.canvas = canvas;
    this.config = { ...DEFAULT_CONFIG, ...config };

    console.log(`[PlayerMarker] Created with representation: ${this.config.representation}`);
  }

  /**
   * Initialize the player marker
   */
  async init(initialPosition: Vector3): Promise<void> {
    console.log('[PlayerMarker] Initializing...');

    this.position = initialPosition.clone();

    // Load player model
    await this.loadPlayerModel();

    // Setup controls
    if (this.config.enableKeyboard) {
      this.setupKeyboardControls();
    }

    // Update initial position
    this.updateMeshPosition();

    console.log('[PlayerMarker] Initialization complete');
  }

  /**
   * Load the player model
   */
  private async loadPlayerModel(): Promise<void> {
    const modelPath = PLAYER_MODELS[this.config.representation];

    try {
      const lastSlash = modelPath.lastIndexOf('/');
      const rootUrl = lastSlash >= 0 ? modelPath.substring(0, lastSlash + 1) : '';
      const fileName = lastSlash >= 0 ? modelPath.substring(lastSlash + 1) : modelPath;

      const result = await SceneLoader.ImportMeshAsync('', rootUrl, fileName, this.scene);

      if (result.meshes.length === 0) {
        throw new Error('No meshes loaded');
      }

      this.playerMesh = result.meshes[0];
      this.playerSkeleton = result.skeletons[0] ?? null;
      this.animations = result.animationGroups;

      // Clear rotation quaternion for Euler rotation
      this.playerMesh.rotationQuaternion = null;

      // Calculate model bounds and scaling
      const boundingInfo = this.playerMesh.getHierarchyBoundingVectors();
      const modelHeight = boundingInfo.max.y - boundingInfo.min.y;

      // Scale to desired height
      const desiredHeight = 1.5 * this.config.modelScale;
      let scale = 1.0;
      if (modelHeight > 0.1) {
        scale = desiredHeight / modelHeight;
      }
      scale = Math.max(0.01, Math.min(10, scale));
      this.playerMesh.scaling.setAll(scale);

      // Calculate Y offset to place feet on ground
      this.modelYOffset = boundingInfo.min.y * scale;

      console.log(
        `[PlayerMarker] Model loaded: height=${modelHeight.toFixed(2)}, scale=${scale.toFixed(4)}, yOffset=${this.modelYOffset.toFixed(4)}`
      );

      // Play idle animation
      this.playAnimation('idle');
    } catch (err) {
      console.warn('[PlayerMarker] Failed to load model, creating placeholder:', err);
      this.createPlaceholderMesh();
    }
  }

  /**
   * Create placeholder mesh if model fails to load
   */
  private createPlaceholderMesh(): void {
    // Create a simple capsule/cylinder for placeholder
    const body = MeshBuilder.CreateCylinder(
      'player_placeholder',
      {
        height: 1.5,
        diameterTop: 0.4,
        diameterBottom: 0.5,
        tessellation: 12,
      },
      this.scene
    );

    body.position.y = 0.75;

    // Add head
    const head = MeshBuilder.CreateSphere(
      'player_head',
      { diameter: 0.5, segments: 12 },
      this.scene
    );
    head.position.y = 1.75;
    head.parent = body;

    // Material
    const material = new StandardMaterial('player_mat', this.scene);
    material.diffuseColor = new Color3(0.3, 0.25, 0.2);
    body.material = material;

    // Create parent transform
    const root = new Mesh('player_root', this.scene);
    body.parent = root;

    this.playerMesh = root;
    this.modelYOffset = 0;
  }

  /**
   * Setup keyboard input
   */
  private setupKeyboardControls(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.key.toLowerCase());

    // Shift for running
    if (event.key === 'Shift') {
      this.isRunning = true;
    }
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.key.toLowerCase());

    if (event.key === 'Shift') {
      this.isRunning = false;
    }
  };

  /**
   * Set terrain height callback
   */
  setTerrainHeightCallback(callback: (x: number, z: number) => number): void {
    this.getTerrainHeight = callback;
  }

  /**
   * Set click-to-move target
   */
  setMoveTarget(position: Vector3, callback?: () => void): void {
    this.moveTarget = { position: position.clone(), callback };
  }

  /**
   * Clear move target
   */
  clearMoveTarget(): void {
    this.moveTarget = null;
  }

  /**
   * Update each frame
   */
  update(deltaTime: number): void {
    // Process keyboard input
    if (this.config.enableKeyboard) {
      this.processKeyboardMovement(deltaTime);
    }

    // Process click-to-move
    if (this.config.enableClickToMove && this.moveTarget) {
      this.processClickToMove(deltaTime);
    }

    // Apply velocity
    if (this.velocity.lengthSquared() > 0.0001) {
      this.position.addInPlace(this.velocity.scale(deltaTime));

      // Get terrain height
      if (this.getTerrainHeight) {
        this.position.y = this.getTerrainHeight(this.position.x, this.position.z);
      }

      this.updateMeshPosition();

      // Notify listeners
      if (this.onPositionChanged) {
        this.onPositionChanged(this.position.clone());
      }
    }

    // Update movement state
    const speed = this.velocity.length();
    const newState: MovementState =
      speed < 0.1 ? 'idle' : speed > this.config.walkSpeed * 1.5 ? 'running' : 'walking';

    if (newState !== this.movementState) {
      this.movementState = newState;
      this.playAnimation(newState === 'idle' ? 'idle' : 'walk');

      if (this.onMovementStateChanged) {
        this.onMovementStateChanged(newState);
      }
    }
  }

  /**
   * Process keyboard movement input
   */
  private processKeyboardMovement(deltaTime: number): void {
    const { walkSpeed, runSpeedMultiplier, rotationSpeed } = this.config;

    // Get camera direction for relative movement
    const camera = this.scene.activeCamera as ArcRotateCamera | null;
    let forward = new Vector3(0, 0, 1);
    let right = new Vector3(1, 0, 0);

    if (camera) {
      // Get camera's forward direction (projected onto XZ plane)
      const cameraForward = camera.target.subtract(camera.position);
      cameraForward.y = 0;
      cameraForward.normalize();

      forward = cameraForward;
      right = Vector3.Cross(Vector3.Up(), forward);
    }

    // Calculate movement direction
    let moveDir = Vector3.Zero();

    if (this.keys.has('w') || this.keys.has('arrowup')) {
      moveDir.addInPlace(forward);
    }
    if (this.keys.has('s') || this.keys.has('arrowdown')) {
      moveDir.subtractInPlace(forward);
    }
    if (this.keys.has('a') || this.keys.has('arrowleft')) {
      moveDir.subtractInPlace(right);
    }
    if (this.keys.has('d') || this.keys.has('arrowright')) {
      moveDir.addInPlace(right);
    }

    // Apply movement
    if (moveDir.lengthSquared() > 0.01) {
      moveDir.normalize();

      const speed = this.isRunning ? walkSpeed * runSpeedMultiplier : walkSpeed;
      this.velocity = moveDir.scale(speed);

      // Rotate to face movement direction
      const targetRotation = Math.atan2(moveDir.x, moveDir.z);
      this.rotation = this.lerpAngle(this.rotation, targetRotation, rotationSpeed * deltaTime);
    } else if (!this.moveTarget) {
      // Decelerate if no keyboard input and no click target
      this.velocity = this.velocity.scale(0.9);
      if (this.velocity.lengthSquared() < 0.01) {
        this.velocity = Vector3.Zero();
      }
    }
  }

  /**
   * Process click-to-move
   */
  private processClickToMove(deltaTime: number): void {
    if (!this.moveTarget) return;

    const { walkSpeed, rotationSpeed } = this.config;

    const toTarget = this.moveTarget.position.subtract(this.position);
    toTarget.y = 0; // Ignore vertical distance

    const distance = toTarget.length();

    // Check if arrived
    if (distance < 0.5) {
      this.velocity = Vector3.Zero();

      // Call callback
      if (this.moveTarget.callback) {
        this.moveTarget.callback();
      }

      this.moveTarget = null;
      return;
    }

    // Move toward target
    const direction = toTarget.normalize();
    this.velocity = direction.scale(walkSpeed);

    // Rotate to face movement direction
    const targetRotation = Math.atan2(direction.x, direction.z);
    this.rotation = this.lerpAngle(this.rotation, targetRotation, rotationSpeed * deltaTime);
  }

  /**
   * Update mesh position and rotation
   */
  private updateMeshPosition(): void {
    if (!this.playerMesh) return;

    this.playerMesh.position = new Vector3(
      this.position.x,
      this.position.y - this.modelYOffset,
      this.position.z
    );
    this.playerMesh.rotation.y = this.rotation;
  }

  /**
   * Lerp between two angles (handling wraparound)
   */
  private lerpAngle(a: number, b: number, t: number): number {
    let diff = b - a;

    // Normalize to [-PI, PI]
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    return a + diff * Math.min(1, t);
  }

  /**
   * Play animation by name
   */
  private playAnimation(name: string): void {
    const anim = this.animations.find(
      (a) => a.name.toLowerCase().includes(name.toLowerCase())
    );

    if (anim && anim !== this.currentAnimation) {
      // Stop current
      if (this.currentAnimation) {
        this.currentAnimation.stop();
      }

      // Play new
      anim.play(true);
      this.currentAnimation = anim;
    }
  }

  /**
   * Get current position
   */
  getPosition(): Vector3 {
    return this.position.clone();
  }

  /**
   * Set position directly (teleport)
   */
  setPosition(position: Vector3): void {
    this.position = position.clone();

    // Get terrain height if available
    if (this.getTerrainHeight) {
      this.position.y = this.getTerrainHeight(this.position.x, this.position.z);
    }

    this.updateMeshPosition();

    if (this.onPositionChanged) {
      this.onPositionChanged(this.position.clone());
    }
  }

  /**
   * Get current rotation (Y axis)
   */
  getRotation(): number {
    return this.rotation;
  }

  /**
   * Set rotation directly
   */
  setRotation(rotation: number): void {
    this.rotation = rotation;
    if (this.playerMesh) {
      this.playerMesh.rotation.y = rotation;
    }
  }

  /**
   * Get movement state
   */
  getMovementState(): MovementState {
    return this.movementState;
  }

  /**
   * Get the player mesh
   */
  getMesh(): AbstractMesh | null {
    return this.playerMesh;
  }

  /**
   * Set position changed callback
   */
  onPositionChange(callback: (position: Vector3) => void): void {
    this.onPositionChanged = callback;
  }

  /**
   * Set movement state changed callback
   */
  onMovementStateChange(callback: (state: MovementState) => void): void {
    this.onMovementStateChanged = callback;
  }

  /**
   * Add player as shadow caster
   */
  addToShadowGenerator(shadowGenerator: import('@babylonjs/core').ShadowGenerator): void {
    if (this.playerMesh) {
      shadowGenerator.addShadowCaster(this.playerMesh);
      this.playerMesh.getChildMeshes().forEach((m) => shadowGenerator.addShadowCaster(m));
    }
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    console.log('[PlayerMarker] Disposing...');

    // Remove keyboard listeners
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);

    // Dispose animations
    for (const anim of this.animations) {
      anim.dispose();
    }
    this.animations = [];

    // Dispose mesh
    if (this.playerMesh) {
      this.playerMesh.dispose();
      this.playerMesh = null;
    }

    console.log('[PlayerMarker] Disposed');
  }
}

export default PlayerMarker;
