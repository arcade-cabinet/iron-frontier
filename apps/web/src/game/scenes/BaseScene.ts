/**
 * BaseScene.ts - Abstract base class for game scenes
 *
 * Provides common functionality for all scene types.
 */

import type { Scene as BabylonScene, Engine } from '@babylonjs/core';
import type { GameScene, SceneType } from './SceneManager';

export abstract class BaseScene implements GameScene {
  abstract readonly type: SceneType;

  protected engine: Engine | null = null;
  protected babylonScene: BabylonScene | null = null;
  protected isActive = false;

  constructor(engine?: Engine) {
    this.engine = engine ?? null;
  }

  /**
   * Called when entering this scene.
   * Override in subclass to initialize scene-specific resources.
   */
  async onEnter(data?: unknown): Promise<void> {
    this.isActive = true;
    console.log(`[${this.type}] Entered`);
  }

  /**
   * Called each frame while scene is active.
   * Override in subclass for scene updates.
   */
  onUpdate(deltaTime: number): void {
    // Override in subclass
  }

  /**
   * Called when exiting this scene.
   * Override in subclass to cleanup resources.
   */
  async onExit(): Promise<void> {
    this.isActive = false;
    console.log(`[${this.type}] Exited`);
  }

  /**
   * Get the Babylon.js scene instance.
   */
  getBabylonScene(): BabylonScene | null {
    return this.babylonScene;
  }

  /**
   * Check if scene is currently active.
   */
  getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Set the Babylon engine reference.
   */
  setEngine(engine: Engine): void {
    this.engine = engine;
  }
}

/**
 * Base class for 3D scenes (overworld, towns).
 * Manages Babylon.js scene lifecycle.
 */
export abstract class Base3DScene extends BaseScene {
  protected createBabylonScene(): void {
    if (!this.engine) {
      console.error(`[${this.type}] No engine available`);
      return;
    }

    // Import dynamically to avoid circular deps
    import('@babylonjs/core').then(({ Scene }) => {
      this.babylonScene = new Scene(this.engine!);
      this.setupScene();
    });
  }

  /**
   * Override to setup the 3D scene (lights, camera, etc.)
   */
  protected abstract setupScene(): void;

  async onExit(): Promise<void> {
    if (this.babylonScene) {
      this.babylonScene.dispose();
      this.babylonScene = null;
    }
    await super.onExit();
  }
}

/**
 * Base class for UI-only scenes (combat, menus).
 * No Babylon.js scene, just React UI overlay.
 */
export abstract class BaseUIScene extends BaseScene {
  // UI scenes don't have a Babylon scene
  getBabylonScene(): null {
    return null;
  }
}
