// TouchProvider — Mobile touch input (virtual joystick + look zone + action buttons)
//
// Left half (x < 50%): virtual joystick — first touch anchors, drag for movement
// Right half (x > 50%): look zone — touch delta drives yaw/pitch
// Bottom-right quadrant: action button hit zones (fire, reload, interact, jump)
//
// When the TouchOverlay React component is mounted, this provider switches
// to reading from the overlay's shared state instead of its own document-level
// touch handlers. The overlay provides visual feedback (joystick knob, buttons)
// and writes to overlayTouchState which this provider reads in poll().

import type { IInputProvider } from '../IInputProvider';
import type { InputFrame } from '../InputFrame';
import {
  overlayTouchState,
  consumeOverlayLookDeltas,
  consumeOverlayWeaponSwitch,
} from '../TouchOverlayState';

export interface TouchConfig {
  /** Look sensitivity multiplier (default 0.004) */
  sensitivity: number;
  /** Invert Y axis (default false) */
  invertY: boolean;
  /** Joystick deadzone in pixels (default 10) */
  deadzone: number;
  /** Max joystick drag radius in pixels for full-scale input (default 80) */
  maxDrag: number;
}

const DEFAULT_CONFIG: TouchConfig = {
  sensitivity: 0.004,
  invertY: false,
  deadzone: 10,
  maxDrag: 80,
};

interface TrackedTouch {
  zone: 'joystick' | 'look' | 'action';
  anchorX: number;
  anchorY: number;
  currentX: number;
  currentY: number;
  prevX: number;
  prevY: number;
}

type ActionButton = 'fire' | 'reload' | 'interact' | 'jump';

function makeTracked(zone: TrackedTouch['zone'], x: number, y: number): TrackedTouch {
  return { zone, anchorX: x, anchorY: y, currentX: x, currentY: y, prevX: x, prevY: y };
}

function screenW(): number {
  return typeof globalThis.innerWidth === 'number' ? globalThis.innerWidth : 800;
}

function screenH(): number {
  return typeof globalThis.innerHeight === 'number' ? globalThis.innerHeight : 600;
}

export class TouchProvider implements IInputProvider {
  readonly name = 'touch';
  readonly priority = 5;

  private config: TouchConfig;
  private touches = new Map<number, TrackedTouch>();
  private isEnabled = false;
  private lookDeltaX = 0;
  private lookDeltaY = 0;
  private activeActions = new Set<ActionButton>();
  private moveX = 0;
  private moveZ = 0;

  private readonly onTouchStart: (e: TouchEvent) => void;
  private readonly onTouchMove: (e: TouchEvent) => void;
  private readonly onTouchEnd: (e: TouchEvent) => void;

  constructor(config: Partial<TouchConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.onTouchStart = this.handleTouchStart.bind(this);
    this.onTouchMove = this.handleTouchMove.bind(this);
    this.onTouchEnd = this.handleTouchEnd.bind(this);
  }

  poll(): Partial<InputFrame> {
    // When the TouchOverlay component is mounted, it writes to shared state
    // and disables our document-level handlers. Read from overlay state instead.
    if (overlayTouchState.overlayActive) {
      return this.pollFromOverlay();
    }

    if (!this.isEnabled) return {};

    const pitchSign = this.config.invertY ? -1 : 1;
    const look = {
      yaw: this.lookDeltaX * this.config.sensitivity,
      pitch: this.lookDeltaY * this.config.sensitivity * pitchSign,
    };

    // Reset look deltas after reading (same pattern as mouse)
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;

    return {
      move: { x: this.moveX, z: this.moveZ },
      look,
      fire: this.activeActions.has('fire'),
      reload: this.activeActions.has('reload'),
      interact: this.activeActions.has('interact'),
      jump: this.activeActions.has('jump'),
    };
  }

  /**
   * Read input from the TouchOverlay's shared state.
   * The overlay handles touch event routing via its visual elements.
   */
  private pollFromOverlay(): Partial<InputFrame> {
    const lookDeltas = consumeOverlayLookDeltas();
    const pitchSign = this.config.invertY ? -1 : 1;
    const weaponSwitch = consumeOverlayWeaponSwitch();

    return {
      move: { x: overlayTouchState.moveX, z: overlayTouchState.moveZ },
      look: {
        yaw: lookDeltas.x,
        pitch: lookDeltas.y * pitchSign,
      },
      fire: overlayTouchState.fire,
      reload: overlayTouchState.reload,
      interact: overlayTouchState.interact,
      jump: overlayTouchState.jump,
      sprint: overlayTouchState.sprint,
      menu: overlayTouchState.menu,
      weaponSwitch,
    };
  }

  enable(): void {
    if (this.isEnabled) return;
    this.isEnabled = true;
    document.addEventListener('touchstart', this.onTouchStart, { passive: false });
    document.addEventListener('touchmove', this.onTouchMove, { passive: false });
    document.addEventListener('touchend', this.onTouchEnd);
    document.addEventListener('touchcancel', this.onTouchEnd);
  }

  disable(): void {
    if (!this.isEnabled) return;
    this.isEnabled = false;
    document.removeEventListener('touchstart', this.onTouchStart);
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);
    document.removeEventListener('touchcancel', this.onTouchEnd);
    this.clearState();
  }

  dispose(): void {
    this.disable();
  }

  setSensitivity(value: number): void {
    this.config.sensitivity = value;
  }

  setInvertY(value: boolean): void {
    this.config.invertY = value;
  }

  setDeadzone(value: number): void {
    this.config.deadzone = value;
  }

  // -- Event handlers --------------------------------------------------------

  private handleTouchStart(e: TouchEvent): void {
    e.preventDefault();
    const sw = screenW();
    const sh = screenH();
    const halfW = sw * 0.5;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const { identifier: id, clientX: x, clientY: y } = touch;

      if (x < halfW) {
        // Left half: virtual joystick (only one joystick touch at a time)
        if (!this.hasZoneTouch('joystick')) {
          this.touches.set(id, makeTracked('joystick', x, y));
        }
      } else {
        // Right half: action zone check first, then look zone
        const action = this.hitTestAction(x, y, sw, sh);
        if (action !== null) {
          this.touches.set(id, makeTracked('action', x, y));
          this.activeActions.add(action);
        } else {
          this.touches.set(id, makeTracked('look', x, y));
        }
      }
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const tracked = this.touches.get(touch.identifier);
      if (!tracked) continue;

      const x = touch.clientX;
      const y = touch.clientY;
      tracked.prevX = tracked.currentX;
      tracked.prevY = tracked.currentY;
      tracked.currentX = x;
      tracked.currentY = y;

      if (tracked.zone === 'joystick') {
        this.updateJoystick(tracked);
      } else if (tracked.zone === 'look') {
        this.lookDeltaX += x - tracked.prevX;
        this.lookDeltaY += y - tracked.prevY;
      }
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const tracked = this.touches.get(touch.identifier);
      if (!tracked) continue;

      if (tracked.zone === 'joystick') {
        this.moveX = 0;
        this.moveZ = 0;
      } else if (tracked.zone === 'action') {
        const action = this.hitTestAction(tracked.anchorX, tracked.anchorY, screenW(), screenH());
        if (action !== null) this.activeActions.delete(action);
      }

      this.touches.delete(touch.identifier);
    }
  }

  // -- Joystick math ---------------------------------------------------------

  private updateJoystick(tracked: TrackedTouch): void {
    const dx = tracked.currentX - tracked.anchorX;
    const dy = tracked.currentY - tracked.anchorY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.config.deadzone) {
      this.moveX = 0;
      this.moveZ = 0;
      return;
    }

    const scale = Math.min(dist, this.config.maxDrag) / this.config.maxDrag;
    const nx = dx / dist;
    const ny = dy / dist;

    // Screen X -> strafe, Screen Y (inverted) -> forward/back
    this.moveX = nx * scale;
    this.moveZ = -ny * scale;
  }

  // -- Action button hit testing ---------------------------------------------

  /**
   * Hit-test action zones in the bottom-right quadrant:
   *   +----------+----------+
   *   | interact |  reload  |   upper half
   *   +----------+----------+
   *   |   jump   |   fire   |   lower half
   *   +----------+----------+
   */
  private hitTestAction(x: number, y: number, sw: number, sh: number): ActionButton | null {
    const halfW = sw * 0.5;
    const halfH = sh * 0.5;
    if (x < halfW || y < halfH) return null;

    const midX = (sw + halfW) * 0.5; // 75% of screen width
    const midY = (sh + halfH) * 0.5; // 75% of screen height

    if (y < midY) return x < midX ? 'interact' : 'reload';
    return x < midX ? 'jump' : 'fire';
  }

  // -- Helpers ---------------------------------------------------------------

  private hasZoneTouch(zone: TrackedTouch['zone']): boolean {
    for (const tracked of this.touches.values()) {
      if (tracked.zone === zone) return true;
    }
    return false;
  }

  private clearState(): void {
    this.touches.clear();
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;
    this.moveX = 0;
    this.moveZ = 0;
    this.activeActions.clear();
  }
}
