/**
 * Babylon.js Scene Adapter
 *
 * Implements the IScene and ISceneManager interfaces from @iron-frontier/shared/rendering
 * using Babylon.js as the underlying rendering engine.
 *
 * This adapter bridges the platform-agnostic rendering abstraction layer with
 * the Babylon.js-specific implementation in the web app.
 */

import {
  type AbstractMesh,
  ArcRotateCamera,
  Ray as BabylonRay,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PointLight,
  Scene,
  SceneLoader,
  ShadowGenerator,
  SpotLight,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

import type {
  AnimationConfig,
  BabylonAdapterOptions,
  CameraConfig,
  EnvironmentConfig,
  IBabylonSceneManager,
  ICameraHandle,
  ILightHandle,
  IMeshHandle,
  IScene,
  ISceneManager,
  LightConfig,
  MeshConfig,
  PartialTransform,
  PickResult,
  Ray,
  RenderQuality,
  SceneConfig,
  SceneEvent,
  SceneEventHandler,
  SceneEventType,
  Transform,
  Vector3Tuple,
} from '@iron-frontier/shared/rendering';
import {
  createTransform,
  DEFAULT_BABYLON_OPTIONS,
  DEFAULT_CAMERA_CONFIG,
  IDENTITY_TRANSFORM,
  SceneManagerBase,
} from '@iron-frontier/shared/rendering';

// ============================================================================
// BABYLON MESH HANDLE
// ============================================================================

/**
 * Babylon.js implementation of IMeshHandle
 */
class BabylonMeshHandle implements IMeshHandle {
  constructor(
    public readonly id: string,
    private mesh: AbstractMesh,
    private scene: Scene,
    private userData: Record<string, unknown> = {}
  ) {}

  getTransform(): Transform {
    const pos = this.mesh.position;
    const rot = this.mesh.rotation;
    const scale = this.mesh.scaling;
    return {
      position: [pos.x, pos.y, pos.z],
      rotation: [rot.x, rot.y, rot.z],
      scale: [scale.x, scale.y, scale.z],
    };
  }

  setTransform(transform: Transform): void {
    this.mesh.position.set(transform.position[0], transform.position[1], transform.position[2]);
    this.mesh.rotation.set(transform.rotation[0], transform.rotation[1], transform.rotation[2]);
    this.mesh.scaling.set(transform.scale[0], transform.scale[1], transform.scale[2]);
  }

  updateTransform(partial: PartialTransform): void {
    if (partial.position) {
      this.mesh.position.set(partial.position[0], partial.position[1], partial.position[2]);
    }
    if (partial.rotation) {
      this.mesh.rotation.set(partial.rotation[0], partial.rotation[1], partial.rotation[2]);
    }
    if (partial.scale) {
      this.mesh.scaling.set(partial.scale[0], partial.scale[1], partial.scale[2]);
    }
  }

  setPosition(position: Vector3Tuple): void {
    this.mesh.position.set(position[0], position[1], position[2]);
  }

  setRotation(rotation: Vector3Tuple): void {
    this.mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
  }

  setScale(scale: number | Vector3Tuple): void {
    if (typeof scale === 'number') {
      this.mesh.scaling.setAll(scale);
    } else {
      this.mesh.scaling.set(scale[0], scale[1], scale[2]);
    }
  }

  isVisible(): boolean {
    return this.mesh.isVisible;
  }

  setVisible(visible: boolean): void {
    this.mesh.isVisible = visible;
    // Also set visibility on child meshes
    this.mesh.getChildMeshes().forEach((child) => {
      child.isVisible = visible;
    });
  }

  isEnabled(): boolean {
    return this.mesh.isEnabled();
  }

  setEnabled(enabled: boolean): void {
    this.mesh.setEnabled(enabled);
  }

  playAnimation(config: AnimationConfig): void {
    const animGroups = this.scene.animationGroups.filter((ag) =>
      ag.targetedAnimations.some((ta) => ta.target === this.mesh)
    );
    const anim = animGroups.find((ag) => ag.name.toLowerCase().includes(config.name.toLowerCase()));
    if (anim) {
      anim.play(config.loop ?? true);
      if (config.speed !== undefined) {
        anim.speedRatio = config.speed;
      }
    }
  }

  stopAnimation(name: string): void {
    const animGroups = this.scene.animationGroups.filter((ag) =>
      ag.targetedAnimations.some((ta) => ta.target === this.mesh)
    );
    const anim = animGroups.find((ag) => ag.name.toLowerCase().includes(name.toLowerCase()));
    if (anim) {
      anim.stop();
    }
  }

  stopAllAnimations(): void {
    const animGroups = this.scene.animationGroups.filter((ag) =>
      ag.targetedAnimations.some((ta) => ta.target === this.mesh)
    );
    animGroups.forEach((ag) => ag.stop());
  }

  getAnimationNames(): string[] {
    const animGroups = this.scene.animationGroups.filter((ag) =>
      ag.targetedAnimations.some((ta) => ta.target === this.mesh)
    );
    return animGroups.map((ag) => ag.name);
  }

  getUserData(): Record<string, unknown> {
    return this.userData;
  }

  setUserData(data: Record<string, unknown>): void {
    this.userData = { ...this.userData, ...data };
  }

  dispose(): void {
    this.mesh.dispose();
  }

  /** Get the underlying Babylon.js mesh */
  getBabylonMesh(): AbstractMesh {
    return this.mesh;
  }
}

// ============================================================================
// BABYLON LIGHT HANDLE
// ============================================================================

/**
 * Babylon.js implementation of ILightHandle
 */
class BabylonLightHandle implements ILightHandle {
  constructor(
    public readonly id: string,
    private light: DirectionalLight | HemisphericLight | PointLight | SpotLight,
    private config: LightConfig
  ) {}

  getConfig(): LightConfig {
    return this.config;
  }

  updateConfig(config: Partial<LightConfig>): void {
    if (config.intensity !== undefined) {
      this.light.intensity = config.intensity;
    }
    if (config.color) {
      this.light.diffuse = new Color3(...config.color);
    }
    Object.assign(this.config, config);
  }

  getIntensity(): number {
    return this.light.intensity;
  }

  setIntensity(intensity: number): void {
    this.light.intensity = intensity;
  }

  isEnabled(): boolean {
    return this.light.isEnabled();
  }

  setEnabled(enabled: boolean): void {
    this.light.setEnabled(enabled);
  }

  dispose(): void {
    this.light.dispose();
  }
}

// ============================================================================
// BABYLON CAMERA HANDLE
// ============================================================================

/**
 * Babylon.js implementation of ICameraHandle
 */
class BabylonCameraHandle implements ICameraHandle {
  constructor(
    private camera: ArcRotateCamera,
    private config: CameraConfig
  ) {}

  getConfig(): CameraConfig {
    return {
      position: [this.camera.position.x, this.camera.position.y, this.camera.position.z],
      target: [this.camera.target.x, this.camera.target.y, this.camera.target.z],
      fov: (this.camera.fov * 180) / Math.PI,
      near: this.camera.minZ,
      far: this.camera.maxZ,
    };
  }

  setConfig(config: CameraConfig): void {
    this.camera.setPosition(new Vector3(...config.position));
    this.camera.setTarget(new Vector3(...config.target));
    if (config.fov !== undefined) {
      this.camera.fov = (config.fov * Math.PI) / 180;
    }
    if (config.near !== undefined) {
      this.camera.minZ = config.near;
    }
    if (config.far !== undefined) {
      this.camera.maxZ = config.far;
    }
    this.config = config;
  }

  setPosition(position: Vector3Tuple): void {
    this.camera.setPosition(new Vector3(...position));
  }

  setTarget(target: Vector3Tuple): void {
    this.camera.setTarget(new Vector3(...target));
  }

  setFOV(fov: number): void {
    this.camera.fov = (fov * Math.PI) / 180;
  }

  async animateTo(config: Partial<CameraConfig>, duration: number): Promise<void> {
    // Simple immediate set for now - could implement smooth animation
    if (config.position) {
      this.camera.setPosition(new Vector3(...config.position));
    }
    if (config.target) {
      this.camera.setTarget(new Vector3(...config.target));
    }
    if (config.fov !== undefined) {
      this.camera.fov = (config.fov * Math.PI) / 180;
    }
  }

  attachControls(canvas: unknown): void {
    if (canvas instanceof HTMLCanvasElement) {
      this.camera.attachControl(canvas, true);
    }
  }

  detachControls(): void {
    this.camera.detachControl();
  }
}

// ============================================================================
// BABYLON SCENE
// ============================================================================

/**
 * Babylon.js implementation of IScene
 */
class BabylonScene implements IScene {
  public readonly id: string;

  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;
  private cameraHandle: BabylonCameraHandle;
  private shadowGenerator: ShadowGenerator | null = null;

  private meshes: Map<string, BabylonMeshHandle> = new Map();
  private lights: Map<string, BabylonLightHandle> = new Map();
  private eventHandlers: Map<SceneEventType, Set<SceneEventHandler>> = new Map();

  constructor(
    canvas: HTMLCanvasElement,
    options: BabylonAdapterOptions = {},
    config?: SceneConfig
  ) {
    this.id = config?.id ?? `scene-${Date.now()}`;

    // Create engine
    const opts = { ...DEFAULT_BABYLON_OPTIONS, ...options };
    this.engine = new Engine(canvas, opts.antialias, {
      preserveDrawingBuffer: opts.preserveDrawingBuffer,
      stencil: opts.stencil,
      powerPreference: opts.powerPreference,
      ...opts.engineOptions,
    });

    // Create scene
    this.scene = new Scene(this.engine);

    // Set background color
    const bgColor = config?.environment?.backgroundColor ?? [0.4, 0.6, 0.9, 1];
    this.scene.clearColor = new Color4(...bgColor);

    // Create camera
    const camConfig = config?.camera ?? DEFAULT_CAMERA_CONFIG;
    this.camera = new ArcRotateCamera(
      'mainCamera',
      Math.PI,
      Math.PI * 0.4,
      10,
      new Vector3(...camConfig.target),
      this.scene
    );
    this.camera.setPosition(new Vector3(...camConfig.position));
    this.camera.attachControl(canvas, true);
    this.cameraHandle = new BabylonCameraHandle(this.camera, camConfig);

    // Setup default lighting
    this.setupDefaultLighting();

    // Setup pointer events
    this.setupPointerEvents();

    // Setup initial lights from config
    if (config?.lights) {
      for (const { id, config: lightConfig } of config.lights) {
        this.addLight(id, lightConfig);
      }
    }

    console.log(`[BabylonScene] Created scene: ${this.id}`);
  }

  private setupDefaultLighting(): void {
    // Ambient light
    const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), this.scene);
    ambient.intensity = 0.5;
    ambient.groundColor = new Color3(0.4, 0.35, 0.3);
    ambient.diffuse = new Color3(1, 0.95, 0.85);

    // Main sun light with shadows
    const sun = new DirectionalLight('sun', new Vector3(-0.5, -1, -0.3).normalize(), this.scene);
    sun.intensity = 1.0;
    sun.diffuse = new Color3(1, 0.95, 0.8);

    this.shadowGenerator = new ShadowGenerator(1024, sun);
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.blurKernel = 16;
    this.shadowGenerator.darkness = 0.3;
  }

  private setupPointerEvents(): void {
    this.scene.onPointerDown = (evt, pickResult) => {
      if (pickResult?.hit && pickResult.pickedPoint) {
        const pos = pickResult.pickedPoint;
        const event: SceneEvent = {
          type: 'pointerDown',
          position: [pos.x, pos.y, pos.z],
          pickResult: {
            hit: true,
            position: [pos.x, pos.y, pos.z],
            meshId: pickResult.pickedMesh?.name,
            normal: pickResult.getNormal()
              ? [pickResult.getNormal()!.x, pickResult.getNormal()!.y, pickResult.getNormal()!.z]
              : undefined,
            distance: pickResult.distance,
          },
        };
        this.emit(event);
      }
    };
  }

  // --- Mesh Management ---

  async addMesh(id: string, config: MeshConfig): Promise<IMeshHandle> {
    // Parse the model path
    const lastSlash = config.modelPath.lastIndexOf('/');
    const rootUrl = lastSlash >= 0 ? config.modelPath.substring(0, lastSlash + 1) : '';
    const fileName = lastSlash >= 0 ? config.modelPath.substring(lastSlash + 1) : config.modelPath;

    // Load the mesh
    const result = await SceneLoader.ImportMeshAsync('', rootUrl, fileName, this.scene);
    const mesh = result.meshes[0];

    // Apply transform
    const transform = config.transform ?? IDENTITY_TRANSFORM;
    mesh.position.set(transform.position[0], transform.position[1], transform.position[2]);
    mesh.rotation.set(transform.rotation[0], transform.rotation[1], transform.rotation[2]);
    mesh.scaling.set(transform.scale[0], transform.scale[1], transform.scale[2]);

    // Apply material settings
    if (config.material) {
      if (config.material.receiveShadows !== undefined) {
        mesh.receiveShadows = config.material.receiveShadows;
        mesh.getChildMeshes().forEach((child) => {
          child.receiveShadows = config.material!.receiveShadows!;
        });
      }
      if (config.material.castShadows && this.shadowGenerator) {
        this.shadowGenerator.addShadowCaster(mesh);
        mesh.getChildMeshes().forEach((child) => {
          this.shadowGenerator?.addShadowCaster(child);
        });
      }
    }

    // Apply visibility
    if (config.visible !== undefined) {
      mesh.isVisible = config.visible;
    }

    // Apply pickable
    if (config.pickable !== undefined) {
      mesh.isPickable = config.pickable;
    }

    // Create handle
    const handle = new BabylonMeshHandle(id, mesh, this.scene, config.userData);
    this.meshes.set(id, handle);

    // Play initial animations
    if (config.animations) {
      for (const animConfig of config.animations) {
        handle.playAnimation(animConfig);
      }
    }

    this.emit({ type: 'meshAdded', meshId: id });
    return handle;
  }

  getMesh(id: string): IMeshHandle | undefined {
    return this.meshes.get(id);
  }

  hasMesh(id: string): boolean {
    return this.meshes.has(id);
  }

  removeMesh(id: string): void {
    const handle = this.meshes.get(id);
    if (handle) {
      handle.dispose();
      this.meshes.delete(id);
      this.emit({ type: 'meshRemoved', meshId: id });
    }
  }

  updateMesh(id: string, transform: PartialTransform): void {
    const handle = this.meshes.get(id);
    if (handle) {
      handle.updateTransform(transform);
      this.emit({ type: 'meshUpdated', meshId: id });
    }
  }

  getMeshIds(): string[] {
    return Array.from(this.meshes.keys());
  }

  // --- Light Management ---

  addLight(id: string, config: LightConfig): ILightHandle {
    let light: DirectionalLight | HemisphericLight | PointLight | SpotLight;

    switch (config.type) {
      case 'directional':
        light = new DirectionalLight(id, new Vector3(...(config as any).direction), this.scene);
        break;
      case 'hemisphere':
        light = new HemisphericLight(
          id,
          new Vector3(...((config as any).direction ?? [0, 1, 0])),
          this.scene
        );
        (light as HemisphericLight).groundColor = new Color3(...(config as any).groundColor);
        break;
      case 'point':
        light = new PointLight(id, new Vector3(...(config as any).position), this.scene);
        break;
      case 'spot':
        light = new SpotLight(
          id,
          new Vector3(...(config as any).position),
          new Vector3(...(config as any).direction),
          (config as any).outerAngle ?? Math.PI / 4,
          (config as any).innerAngle ?? 2,
          this.scene
        );
        break;
      default:
        // Ambient treated as hemisphere
        light = new HemisphericLight(id, new Vector3(0, 1, 0), this.scene);
    }

    light.intensity = config.intensity;
    light.diffuse = new Color3(...config.color);

    const handle = new BabylonLightHandle(id, light, config);
    this.lights.set(id, handle);

    this.emit({ type: 'lightAdded', lightId: id });
    return handle;
  }

  getLight(id: string): ILightHandle | undefined {
    return this.lights.get(id);
  }

  removeLight(id: string): void {
    const handle = this.lights.get(id);
    if (handle) {
      handle.dispose();
      this.lights.delete(id);
      this.emit({ type: 'lightRemoved', lightId: id });
    }
  }

  getLightIds(): string[] {
    return Array.from(this.lights.keys());
  }

  // --- Camera ---

  getCamera(): ICameraHandle {
    return this.cameraHandle;
  }

  setCamera(config: CameraConfig): void {
    this.cameraHandle.setConfig(config);
    this.emit({ type: 'cameraUpdated' });
  }

  // --- Environment ---

  setEnvironment(config: EnvironmentConfig): void {
    if (config.backgroundColor) {
      this.scene.clearColor = new Color4(...config.backgroundColor);
    }
    // TODO: Implement skybox, fog, etc.
  }

  // --- Quality ---

  setQuality(quality: RenderQuality): void {
    if (this.shadowGenerator && quality.shadowMapSize) {
      // Would need to recreate shadow generator for new size
    }
    // TODO: Implement other quality settings
  }

  // --- Picking/Raycasting ---

  pick(x: number, y: number): PickResult {
    const pickResult = this.scene.pick(x, y);
    if (pickResult?.hit && pickResult.pickedPoint) {
      return {
        hit: true,
        meshId: pickResult.pickedMesh?.name,
        position: [pickResult.pickedPoint.x, pickResult.pickedPoint.y, pickResult.pickedPoint.z],
        distance: pickResult.distance,
      };
    }
    return { hit: false };
  }

  raycast(ray: Ray): PickResult {
    const babylonRay = new BabylonRay(new Vector3(...ray.origin), new Vector3(...ray.direction));
    const pickResult = this.scene.pickWithRay(babylonRay);
    if (pickResult?.hit && pickResult.pickedPoint) {
      return {
        hit: true,
        meshId: pickResult.pickedMesh?.name,
        position: [pickResult.pickedPoint.x, pickResult.pickedPoint.y, pickResult.pickedPoint.z],
        distance: pickResult.distance,
      };
    }
    return { hit: false };
  }

  // --- Events ---

  on(type: SceneEventType, handler: SceneEventHandler): () => void {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, new Set());
    }
    this.eventHandlers.get(type)!.add(handler);
    return () => {
      this.eventHandlers.get(type)?.delete(handler);
    };
  }

  emit(event: SceneEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }
  }

  // --- Lifecycle ---

  render(): void {
    this.scene.render();
  }

  resize(width: number, height: number): void {
    this.engine.resize();
  }

  dispose(): void {
    for (const handle of this.meshes.values()) {
      handle.dispose();
    }
    this.meshes.clear();

    for (const handle of this.lights.values()) {
      handle.dispose();
    }
    this.lights.clear();

    this.scene.dispose();
    this.engine.dispose();
    console.log(`[BabylonScene] Disposed scene: ${this.id}`);
  }

  // --- Babylon-specific ---

  getBabylonScene(): Scene {
    return this.scene;
  }

  getBabylonEngine(): Engine {
    return this.engine;
  }
}

// ============================================================================
// BABYLON SCENE MANAGER
// ============================================================================

/**
 * Babylon.js implementation of ISceneManager
 */
export class BabylonSceneManager extends SceneManagerBase implements IBabylonSceneManager {
  private options: BabylonAdapterOptions;
  private babylonScene: BabylonScene | null = null;
  private canvas: HTMLCanvasElement | null = null;

  constructor(options: BabylonAdapterOptions = {}) {
    super();
    this.options = { ...DEFAULT_BABYLON_OPTIONS, ...options };
  }

  protected async createScene(surface: unknown, config?: SceneConfig): Promise<IScene> {
    if (!(surface instanceof HTMLCanvasElement)) {
      throw new Error('BabylonSceneManager requires an HTMLCanvasElement');
    }
    this.canvas = surface;
    this.babylonScene = new BabylonScene(surface, this.options, config);
    return this.babylonScene;
  }

  protected async loadModelInternal(modelPath: string): Promise<void> {
    // Models are loaded on-demand when added to scene
    // This could pre-cache models if needed
    console.log(`[BabylonSceneManager] Preload model: ${modelPath}`);
  }

  protected unloadModelInternal(modelPath: string): void {
    // Clear from cache if implemented
    console.log(`[BabylonSceneManager] Unload model: ${modelPath}`);
  }

  protected requestFrame(callback: () => void): number {
    return requestAnimationFrame(callback);
  }

  protected cancelFrame(id: number): void {
    cancelAnimationFrame(id);
  }

  // --- IBabylonSceneManager ---

  getBabylonScene(): unknown {
    return this.babylonScene?.getBabylonScene();
  }

  getBabylonEngine(): unknown {
    return this.babylonScene?.getBabylonEngine();
  }

  toggleInspector(show?: boolean): void {
    if (this.babylonScene) {
      const scene = this.babylonScene.getBabylonScene();
      if (show ?? !scene.debugLayer.isVisible()) {
        scene.debugLayer.show();
      } else {
        scene.debugLayer.hide();
      }
    }
  }

  async screenshot(width?: number, height?: number): Promise<string> {
    if (!this.babylonScene) {
      throw new Error('Scene not initialized');
    }
    // TODO: Implement screenshot
    return '';
  }
}

// ============================================================================
// FACTORY
// ============================================================================

/**
 * Factory for creating BabylonSceneManager instances
 */
export const BabylonSceneManagerFactory = {
  create(options?: BabylonAdapterOptions): BabylonSceneManager {
    return new BabylonSceneManager(options);
  },
};

export default BabylonSceneManager;
