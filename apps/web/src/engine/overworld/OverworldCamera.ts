/**
 * OverworldCamera - Top-down camera for seamless overworld exploration
 *
 * Features:
 * - Top-down or slight angle view (configurable)
 * - Smooth follow of player position
 * - Zoom controls with min/max limits
 * - Keep towns in view when nearby
 * - Touch/mouse input support
 */

import {
  ArcRotateCamera,
  type Camera,
  FreeCamera,
  type Scene,
  Vector3,
} from '@babylonjs/core';

// ============================================================================
// TYPES
// ============================================================================

export type CameraMode = 'top_down' | 'isometric' | 'third_person';

export interface OverworldCameraConfig {
  /** Camera mode */
  mode: CameraMode;
  /** Default zoom distance */
  defaultZoom: number;
  /** Minimum zoom distance */
  minZoom: number;
  /** Maximum zoom distance */
  maxZoom: number;
  /** Camera angle in degrees (for isometric/third_person) */
  cameraAngle: number;
  /** Follow lag (0 = instant, 1 = never catches up) */
  followLag: number;
  /** Enable user camera controls */
  enableControls: boolean;
  /** Height offset above target */
  heightOffset: number;
}

export interface CameraTarget {
  position: Vector3;
  /** Optional focus point offset */
  offset?: Vector3;
}

const DEFAULT_CONFIG: OverworldCameraConfig = {
  mode: 'isometric',
  defaultZoom: 40,
  minZoom: 20,
  maxZoom: 100,
  cameraAngle: 60, // 60 degrees from horizontal (30 from vertical)
  followLag: 0.1,
  enableControls: true,
  heightOffset: 2,
};

// ============================================================================
// OVERWORLD CAMERA
// ============================================================================

export class OverworldCamera {
  private scene: Scene;
  private canvas: HTMLCanvasElement;
  private config: OverworldCameraConfig;

  // Camera instance
  private camera: ArcRotateCamera | null = null;

  // Target tracking
  private targetPosition: Vector3 = Vector3.Zero();
  private currentPosition: Vector3 = Vector3.Zero();
  private currentZoom: number;

  // Points of interest (towns) to keep in view
  private pointsOfInterest: Map<string, Vector3> = new Map();
  private nearbyPOIRadius: number = 100;

  constructor(scene: Scene, canvas: HTMLCanvasElement, config: Partial<OverworldCameraConfig> = {}) {
    this.scene = scene;
    this.canvas = canvas;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentZoom = this.config.defaultZoom;

    console.log(`[OverworldCamera] Created with mode: ${this.config.mode}`);
  }

  /**
   * Initialize the camera
   */
  init(initialTarget?: Vector3): void {
    console.log('[OverworldCamera] Initializing...');

    const target = initialTarget ?? Vector3.Zero();
    this.targetPosition = target.clone();
    this.currentPosition = target.clone();

    this.createCamera(target);

    console.log('[OverworldCamera] Initialization complete');
  }

  /**
   * Create camera based on mode
   */
  private createCamera(target: Vector3): void {
    const { mode, cameraAngle, defaultZoom, minZoom, maxZoom, enableControls } = this.config;

    // Calculate camera parameters based on mode
    let alpha: number; // Horizontal angle
    let beta: number; // Vertical angle (from top)
    let radius: number; // Distance from target

    switch (mode) {
      case 'top_down':
        alpha = 0;
        beta = 0.01; // Nearly straight down (can't be exactly 0)
        radius = defaultZoom;
        break;
      case 'isometric':
        alpha = Math.PI * 0.75; // 135 degrees - top-right viewing angle
        beta = (Math.PI / 180) * (90 - cameraAngle); // Convert angle to beta
        radius = defaultZoom;
        break;
      case 'third_person':
        alpha = Math.PI; // Behind the player
        beta = (Math.PI / 180) * (90 - cameraAngle);
        radius = defaultZoom * 0.5; // Closer for third person
        break;
    }

    // Create ArcRotateCamera
    this.camera = new ArcRotateCamera(
      'overworld_camera',
      alpha,
      beta,
      radius,
      target,
      this.scene
    );

    // Configure zoom limits
    this.camera.lowerRadiusLimit = minZoom;
    this.camera.upperRadiusLimit = maxZoom;

    // Configure rotation limits based on mode
    if (mode === 'top_down') {
      // Lock top-down view
      this.camera.lowerBetaLimit = 0.01;
      this.camera.upperBetaLimit = 0.01;
      this.camera.lowerAlphaLimit = 0;
      this.camera.upperAlphaLimit = 0;
    } else if (mode === 'isometric') {
      // Allow some rotation in isometric
      this.camera.lowerBetaLimit = Math.PI * 0.15; // Min 27 degrees from vertical
      this.camera.upperBetaLimit = Math.PI * 0.45; // Max 81 degrees from vertical
    }
    // Third person allows free rotation

    // Configure controls
    if (enableControls) {
      this.camera.attachControl(this.canvas, true);

      // Smooth controls
      this.camera.inertia = 0.9;
      this.camera.wheelPrecision = 20;
      this.camera.wheelDeltaPercentage = 0.02;
      this.camera.panningSensibility = 0; // Disable panning - camera follows target

      // Touch controls
      this.camera.pinchPrecision = 50;
      this.camera.angularSensibilityX = 500;
      this.camera.angularSensibilityY = 500;
    }

    console.log(
      `[OverworldCamera] Camera created: alpha=${(alpha * 180 / Math.PI).toFixed(1)}deg, beta=${(beta * 180 / Math.PI).toFixed(1)}deg, radius=${radius}`
    );
  }

  /**
   * Update camera each frame
   */
  update(deltaTime: number): void {
    if (!this.camera) return;

    const { followLag, heightOffset } = this.config;

    // Smooth follow target position
    const lerpFactor = 1 - Math.pow(followLag, deltaTime * 60);
    this.currentPosition = Vector3.Lerp(this.currentPosition, this.targetPosition, lerpFactor);

    // Check for nearby points of interest
    const adjustedTarget = this.calculateAdjustedTarget();

    // Update camera target
    this.camera.target = new Vector3(
      adjustedTarget.x,
      adjustedTarget.y + heightOffset,
      adjustedTarget.z
    );
  }

  /**
   * Calculate target position adjusted for nearby POIs
   */
  private calculateAdjustedTarget(): Vector3 {
    if (this.pointsOfInterest.size === 0) {
      return this.currentPosition;
    }

    // Find nearby POIs
    const nearbyPOIs: Vector3[] = [];
    for (const poi of this.pointsOfInterest.values()) {
      const distance = Vector3.Distance(this.currentPosition, poi);
      if (distance < this.nearbyPOIRadius) {
        nearbyPOIs.push(poi);
      }
    }

    if (nearbyPOIs.length === 0) {
      return this.currentPosition;
    }

    // Calculate centroid of player + nearby POIs
    let sumX = this.currentPosition.x;
    let sumY = this.currentPosition.y;
    let sumZ = this.currentPosition.z;

    for (const poi of nearbyPOIs) {
      sumX += poi.x;
      sumY += poi.y;
      sumZ += poi.z;
    }

    const count = nearbyPOIs.length + 1;
    const centroid = new Vector3(sumX / count, sumY / count, sumZ / count);

    // Blend between player position and centroid based on distance to nearest POI
    const nearestDistance = Math.min(
      ...nearbyPOIs.map((poi) => Vector3.Distance(this.currentPosition, poi))
    );
    const blendFactor = 1 - nearestDistance / this.nearbyPOIRadius;

    return Vector3.Lerp(this.currentPosition, centroid, blendFactor * 0.3);
  }

  /**
   * Set camera target (player position)
   */
  setTarget(position: Vector3): void {
    this.targetPosition = position.clone();
  }

  /**
   * Instantly move camera to target (no smoothing)
   */
  snapToTarget(position: Vector3): void {
    this.targetPosition = position.clone();
    this.currentPosition = position.clone();
    if (this.camera) {
      this.camera.target = position.clone();
    }
  }

  /**
   * Set zoom level
   */
  setZoom(zoom: number): void {
    const { minZoom, maxZoom } = this.config;
    this.currentZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
    if (this.camera) {
      this.camera.radius = this.currentZoom;
    }
  }

  /**
   * Get current zoom level
   */
  getZoom(): number {
    return this.camera?.radius ?? this.currentZoom;
  }

  /**
   * Zoom in by delta amount
   */
  zoomIn(delta: number = 5): void {
    this.setZoom(this.getZoom() - delta);
  }

  /**
   * Zoom out by delta amount
   */
  zoomOut(delta: number = 5): void {
    this.setZoom(this.getZoom() + delta);
  }

  /**
   * Add point of interest (town location)
   */
  addPointOfInterest(id: string, position: Vector3): void {
    this.pointsOfInterest.set(id, position.clone());
  }

  /**
   * Remove point of interest
   */
  removePointOfInterest(id: string): void {
    this.pointsOfInterest.delete(id);
  }

  /**
   * Clear all points of interest
   */
  clearPointsOfInterest(): void {
    this.pointsOfInterest.clear();
  }

  /**
   * Set the radius within which POIs affect camera
   */
  setNearbyPOIRadius(radius: number): void {
    this.nearbyPOIRadius = radius;
  }

  /**
   * Set camera mode
   */
  setMode(mode: CameraMode): void {
    if (this.config.mode === mode) return;

    this.config.mode = mode;

    // Recreate camera with new mode
    if (this.camera) {
      const currentTarget = this.camera.target.clone();
      this.camera.dispose();
      this.createCamera(currentTarget);
    }
  }

  /**
   * Get camera mode
   */
  getMode(): CameraMode {
    return this.config.mode;
  }

  /**
   * Get the Babylon camera
   */
  getCamera(): Camera | null {
    return this.camera;
  }

  /**
   * Enable/disable user controls
   */
  setControlsEnabled(enabled: boolean): void {
    if (!this.camera) return;

    if (enabled) {
      this.camera.attachControl(this.canvas, true);
    } else {
      this.camera.detachControl();
    }
  }

  /**
   * Get current camera position in world space
   */
  getPosition(): Vector3 {
    return this.camera?.position.clone() ?? Vector3.Zero();
  }

  /**
   * Get forward direction (where camera is looking)
   */
  getForwardDirection(): Vector3 {
    if (!this.camera) return new Vector3(0, -1, 0);

    return this.camera.target.subtract(this.camera.position).normalize();
  }

  /**
   * Screen to world ray for picking
   */
  screenToWorldRay(screenX: number, screenY: number): import('@babylonjs/core').Ray | null {
    if (!this.camera) return null;

    return this.scene.createPickingRay(screenX, screenY, null, this.camera);
  }

  /**
   * Dispose camera resources
   */
  dispose(): void {
    console.log('[OverworldCamera] Disposing...');

    if (this.camera) {
      this.camera.dispose();
      this.camera = null;
    }

    this.pointsOfInterest.clear();

    console.log('[OverworldCamera] Disposed');
  }
}

export default OverworldCamera;
