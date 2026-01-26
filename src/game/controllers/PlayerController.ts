/**
 * PlayerController.ts - Player character control for Iron Frontier v2
 *
 * Handles:
 * - Movement translation from input to world position
 * - Sprint/stamina management
 * - Collision detection integration
 * - Encounter zone tracking
 * - Interaction triggering
 */

import type { MovementVector } from '../input/types';
import type { WorldPosition } from '../store/gameStateSlice';

/**
 * Player movement configuration
 */
export interface PlayerMovementConfig {
  /** Base movement speed (units per second) */
  baseSpeed: number;
  /** Sprint speed multiplier */
  sprintMultiplier: number;
  /** Acceleration rate */
  acceleration: number;
  /** Deceleration rate when no input */
  deceleration: number;
  /** Maximum stamina for sprinting */
  maxStamina: number;
  /** Stamina drain rate while sprinting (per second) */
  staminaDrain: number;
  /** Stamina recovery rate while not sprinting (per second) */
  staminaRecovery: number;
  /** Minimum stamina to start sprinting */
  minStaminaToSprint: number;
}

const DEFAULT_CONFIG: PlayerMovementConfig = {
  baseSpeed: 5.0,
  sprintMultiplier: 1.6,
  acceleration: 20.0,
  deceleration: 15.0,
  maxStamina: 100,
  staminaDrain: 20,
  staminaRecovery: 15,
  minStaminaToSprint: 20,
};

/**
 * Player controller state
 */
export interface PlayerControllerState {
  position: WorldPosition;
  velocity: { x: number; z: number };
  facing: 'north' | 'south' | 'east' | 'west';
  isMoving: boolean;
  isSprinting: boolean;
  stamina: number;
  currentZoneId: string | null;
}

/**
 * Collision check callback
 */
export type CollisionCallback = (
  from: WorldPosition,
  to: WorldPosition
) => { blocked: boolean; correctedPosition?: WorldPosition };

/**
 * Zone enter/exit callback
 */
export type ZoneCallback = (zoneId: string | null) => void;

/**
 * Interaction check callback
 */
export type InteractionCallback = (position: WorldPosition, facing: string) => string | null;

export class PlayerController {
  private config: PlayerMovementConfig;
  private state: PlayerControllerState;

  // Callbacks
  private collisionCheck: CollisionCallback | null = null;
  private onZoneChange: ZoneCallback | null = null;
  private onInteractionCheck: InteractionCallback | null = null;

  // Movement state
  private inputMovement: MovementVector = { x: 0, z: 0 };
  private wantsSprint = false;

  constructor(
    initialPosition: WorldPosition = { x: 0, z: 0 },
    config: Partial<PlayerMovementConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      position: initialPosition,
      velocity: { x: 0, z: 0 },
      facing: 'south',
      isMoving: false,
      isSprinting: false,
      stamina: this.config.maxStamina,
      currentZoneId: null,
    };

    console.log('[PlayerController] Initialized');
  }

  /**
   * Set movement input (call from input system)
   */
  public setMovementInput(movement: MovementVector): void {
    this.inputMovement = movement;
  }

  /**
   * Set sprint input
   */
  public setSprintInput(sprinting: boolean): void {
    this.wantsSprint = sprinting;
  }

  /**
   * Update player state (call every frame)
   */
  public update(deltaTime: number): void {
    this.updateStamina(deltaTime);
    this.updateVelocity(deltaTime);
    this.updatePosition(deltaTime);
    this.updateFacing();
    this.checkZone();
  }

  /**
   * Update stamina
   */
  private updateStamina(deltaTime: number): void {
    const canSprint = this.state.stamina >= this.config.minStaminaToSprint;
    const shouldSprint = this.wantsSprint && canSprint && this.state.isMoving;

    if (shouldSprint) {
      this.state.isSprinting = true;
      this.state.stamina = Math.max(0, this.state.stamina - this.config.staminaDrain * deltaTime);
    } else {
      this.state.isSprinting = false;
      this.state.stamina = Math.min(
        this.config.maxStamina,
        this.state.stamina + this.config.staminaRecovery * deltaTime
      );
    }
  }

  /**
   * Update velocity based on input
   */
  private updateVelocity(deltaTime: number): void {
    const hasInput = Math.abs(this.inputMovement.x) > 0.01 || Math.abs(this.inputMovement.z) > 0.01;

    if (hasInput) {
      // Accelerate towards input direction
      const targetSpeed = this.state.isSprinting
        ? this.config.baseSpeed * this.config.sprintMultiplier
        : this.config.baseSpeed;

      const targetVelocity = {
        x: this.inputMovement.x * targetSpeed,
        z: this.inputMovement.z * targetSpeed,
      };

      const accel = this.config.acceleration * deltaTime;
      this.state.velocity.x = this.lerp(this.state.velocity.x, targetVelocity.x, accel);
      this.state.velocity.z = this.lerp(this.state.velocity.z, targetVelocity.z, accel);
    } else {
      // Decelerate to stop
      const decel = this.config.deceleration * deltaTime;
      this.state.velocity.x = this.approach(this.state.velocity.x, 0, decel);
      this.state.velocity.z = this.approach(this.state.velocity.z, 0, decel);
    }

    // Update moving state
    const speed = Math.sqrt(
      this.state.velocity.x * this.state.velocity.x +
      this.state.velocity.z * this.state.velocity.z
    );
    this.state.isMoving = speed > 0.1;
  }

  /**
   * Update position based on velocity
   */
  private updatePosition(deltaTime: number): void {
    if (!this.state.isMoving) return;

    const newPosition: WorldPosition = {
      x: this.state.position.x + this.state.velocity.x * deltaTime,
      z: this.state.position.z + this.state.velocity.z * deltaTime,
    };

    // Check collision
    if (this.collisionCheck) {
      const result = this.collisionCheck(this.state.position, newPosition);
      if (result.blocked) {
        if (result.correctedPosition) {
          this.state.position = result.correctedPosition;
        }
        // Stop velocity in blocked direction
        this.state.velocity = { x: 0, z: 0 };
        return;
      }
    }

    this.state.position = newPosition;
  }

  /**
   * Update facing direction based on velocity
   */
  private updateFacing(): void {
    if (!this.state.isMoving) return;

    const absX = Math.abs(this.state.velocity.x);
    const absZ = Math.abs(this.state.velocity.z);

    if (absX > absZ) {
      this.state.facing = this.state.velocity.x > 0 ? 'east' : 'west';
    } else if (absZ > 0.1) {
      this.state.facing = this.state.velocity.z > 0 ? 'south' : 'north';
    }
  }

  /**
   * Check for zone changes
   */
  private checkZone(): void {
    // Zone checking would be implemented by the world system
    // This is a hook for integration
  }

  /**
   * Try to interact with something in front of the player
   */
  public tryInteract(): string | null {
    if (this.onInteractionCheck) {
      return this.onInteractionCheck(this.state.position, this.state.facing);
    }
    return null;
  }

  /**
   * Teleport player to position
   */
  public teleport(position: WorldPosition): void {
    this.state.position = position;
    this.state.velocity = { x: 0, z: 0 };
    this.state.isMoving = false;
    console.log(`[PlayerController] Teleported to (${position.x}, ${position.z})`);
  }

  /**
   * Get current state
   */
  public getState(): PlayerControllerState {
    return { ...this.state };
  }

  /**
   * Get current position
   */
  public getPosition(): WorldPosition {
    return { ...this.state.position };
  }

  /**
   * Get current facing direction
   */
  public getFacing(): string {
    return this.state.facing;
  }

  /**
   * Get stamina percentage (0-1)
   */
  public getStaminaPercent(): number {
    return this.state.stamina / this.config.maxStamina;
  }

  /**
   * Check if player is moving
   */
  public isMoving(): boolean {
    return this.state.isMoving;
  }

  /**
   * Check if player is sprinting
   */
  public isSprinting(): boolean {
    return this.state.isSprinting;
  }

  /**
   * Set collision check callback
   */
  public setCollisionCheck(callback: CollisionCallback): void {
    this.collisionCheck = callback;
  }

  /**
   * Set zone change callback
   */
  public setZoneChangeCallback(callback: ZoneCallback): void {
    this.onZoneChange = callback;
  }

  /**
   * Set interaction check callback
   */
  public setInteractionCheck(callback: InteractionCallback): void {
    this.onInteractionCheck = callback;
  }

  /**
   * Update current zone (called by world system)
   */
  public setCurrentZone(zoneId: string | null): void {
    if (zoneId !== this.state.currentZoneId) {
      const previousZone = this.state.currentZoneId;
      this.state.currentZoneId = zoneId;
      if (this.onZoneChange) {
        this.onZoneChange(zoneId);
      }
      console.log(`[PlayerController] Zone: ${previousZone} -> ${zoneId}`);
    }
  }

  /**
   * Restore stamina (e.g., from items or resting)
   */
  public restoreStamina(amount: number): void {
    this.state.stamina = Math.min(this.config.maxStamina, this.state.stamina + amount);
  }

  /**
   * Set stamina (for loading saves)
   */
  public setStamina(value: number): void {
    this.state.stamina = Math.max(0, Math.min(this.config.maxStamina, value));
  }

  // Utility functions
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * Math.min(1, t);
  }

  private approach(current: number, target: number, step: number): number {
    if (current < target) {
      return Math.min(current + step, target);
    } else {
      return Math.max(current - step, target);
    }
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    this.collisionCheck = null;
    this.onZoneChange = null;
    this.onInteractionCheck = null;
    console.log('[PlayerController] Disposed');
  }
}

// Factory function
export function createPlayerController(
  initialPosition?: WorldPosition,
  config?: Partial<PlayerMovementConfig>
): PlayerController {
  return new PlayerController(initialPosition, config);
}
