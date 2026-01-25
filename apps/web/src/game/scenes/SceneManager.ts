/**
 * SceneManager.ts - Manages game scene transitions
 *
 * Coordinates between different game modes:
 * - Overworld: Free movement on the map
 * - Town: Inside a town location
 * - Combat: Turn-based combat screen
 * - Camp: Rest and hunting screen
 * - Menu: Pause menu, inventory, etc.
 *
 * Each scene has its own lifecycle (enter, update, exit).
 */

import type { Scene as BabylonScene } from '@babylonjs/core';

export type SceneType = 'loading' | 'title' | 'overworld' | 'town' | 'combat' | 'camp' | 'dialogue';

export interface GameScene {
  /** Scene type identifier */
  type: SceneType;

  /** Called when entering this scene */
  onEnter(data?: unknown): Promise<void>;

  /** Called each frame while scene is active */
  onUpdate(deltaTime: number): void;

  /** Called when exiting this scene */
  onExit(): Promise<void>;

  /** Get the Babylon scene (if 3D) */
  getBabylonScene?(): BabylonScene | null;
}

export interface SceneTransition {
  from: SceneType;
  to: SceneType;
  data?: unknown;
}

type TransitionCallback = (transition: SceneTransition) => void;

export class SceneManager {
  private scenes: Map<SceneType, GameScene> = new Map();
  private currentScene: GameScene | null = null;
  private currentType: SceneType = 'loading';
  private isTransitioning = false;
  private transitionCallbacks: TransitionCallback[] = [];

  // Scene stack for returning to previous scene (e.g., combat -> overworld)
  private sceneStack: Array<{ type: SceneType; data?: unknown }> = [];

  constructor() {
    console.log('[SceneManager] Initialized');
  }

  /**
   * Register a scene implementation
   */
  public registerScene(type: SceneType, scene: GameScene): void {
    this.scenes.set(type, scene);
    console.log(`[SceneManager] Registered scene: ${type}`);
  }

  /**
   * Get current scene type
   */
  public getCurrentSceneType(): SceneType {
    return this.currentType;
  }

  /**
   * Get current scene instance
   */
  public getCurrentScene(): GameScene | null {
    return this.currentScene;
  }

  /**
   * Check if currently transitioning
   */
  public isInTransition(): boolean {
    return this.isTransitioning;
  }

  /**
   * Transition to a new scene
   */
  public async goTo(type: SceneType, data?: unknown): Promise<void> {
    if (this.isTransitioning) {
      console.warn(`[SceneManager] Already transitioning, ignoring goTo(${type})`);
      return;
    }

    const newScene = this.scenes.get(type);
    if (!newScene) {
      console.error(`[SceneManager] Scene not registered: ${type}`);
      return;
    }

    this.isTransitioning = true;
    const previousType = this.currentType;

    try {
      // Exit current scene
      if (this.currentScene) {
        await this.currentScene.onExit();
      }

      // Enter new scene
      this.currentScene = newScene;
      this.currentType = type;
      await newScene.onEnter(data);

      // Notify listeners
      const transition: SceneTransition = { from: previousType, to: type, data };
      this.transitionCallbacks.forEach((cb) => cb(transition));

      console.log(`[SceneManager] Transitioned: ${previousType} -> ${type}`);
    } catch (err) {
      console.error(`[SceneManager] Transition failed:`, err);
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Push current scene to stack and go to new scene
   * Use for scenes you'll return from (e.g., overworld -> combat -> overworld)
   */
  public async pushTo(type: SceneType, data?: unknown): Promise<void> {
    // Save current scene to stack
    this.sceneStack.push({ type: this.currentType, data: undefined });
    await this.goTo(type, data);
  }

  /**
   * Return to previous scene from stack
   */
  public async popScene(): Promise<void> {
    const previous = this.sceneStack.pop();
    if (previous) {
      await this.goTo(previous.type, previous.data);
    } else {
      console.warn('[SceneManager] No scene in stack to pop');
    }
  }

  /**
   * Clear scene stack (e.g., when returning to title)
   */
  public clearStack(): void {
    this.sceneStack = [];
  }

  /**
   * Update current scene (call each frame)
   */
  public update(deltaTime: number): void {
    if (this.currentScene && !this.isTransitioning) {
      this.currentScene.onUpdate(deltaTime);
    }
  }

  /**
   * Subscribe to scene transitions
   */
  public onTransition(callback: TransitionCallback): () => void {
    this.transitionCallbacks.push(callback);
    return () => {
      const index = this.transitionCallbacks.indexOf(callback);
      if (index >= 0) {
        this.transitionCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get a registered scene
   */
  public getScene<T extends GameScene>(type: SceneType): T | undefined {
    return this.scenes.get(type) as T | undefined;
  }

  /**
   * Check if a scene is registered
   */
  public hasScene(type: SceneType): boolean {
    return this.scenes.has(type);
  }

  /**
   * Dispose all scenes
   */
  public async dispose(): Promise<void> {
    if (this.currentScene) {
      await this.currentScene.onExit();
    }
    this.scenes.clear();
    this.sceneStack = [];
    this.transitionCallbacks = [];
    this.currentScene = null;
    console.log('[SceneManager] Disposed');
  }
}

// Singleton instance
let sceneManagerInstance: SceneManager | null = null;

export function getSceneManager(): SceneManager {
  if (!sceneManagerInstance) {
    sceneManagerInstance = new SceneManager();
  }
  return sceneManagerInstance;
}
