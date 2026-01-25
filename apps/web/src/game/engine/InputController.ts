// Mobile-first input controller for Cogsworth Station
// Supports tap-to-move, virtual joystick, and gesture controls

import type { GridPos, SectorTile } from '../lib/types';
import { findPath, findNearestWalkable } from './pathfinding';

export type ControlMode = 'tap' | 'joystick';

export interface InputCallbacks {
  onMove: (position: GridPos) => void;
  onInteract: (targetId: string) => void;
  onOpenMenu: () => void;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
  isLongPress: boolean;
}

export class InputController {
  private canvas: HTMLCanvasElement;
  private callbacks: InputCallbacks;
  private controlMode: ControlMode = 'tap';
  private touchState: TouchState | null = null;
  private longPressTimeout: number | null = null;
  private joystickActive: boolean = false;
  private joystickOrigin: { x: number; y: number } | null = null;
  private joystickDirection: { x: number; y: number } = { x: 0, y: 0 };
  private moveInterval: number | null = null;
  
  // Grid reference for pathfinding
  private grid: SectorTile[][] | null = null;
  private gridWidth: number = 0;
  private gridHeight: number = 0;
  private playerPosition: GridPos = { x: 0, y: 0 };
  private currentPath: GridPos[] = [];
  private pathIndex: number = 0;
  
  // Haptic feedback
  private hapticsEnabled: boolean = true;
  
  // Constants
  private readonly LONG_PRESS_DURATION = 500; // ms
  private readonly TAP_THRESHOLD = 10; // pixels
  private readonly JOYSTICK_THRESHOLD = 30; // pixels
  private readonly MOVE_INTERVAL = 200; // ms between moves in joystick mode
  
  constructor(canvas: HTMLCanvasElement, callbacks: InputCallbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.canvas.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
    
    // Mouse events (for desktop testing)
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }
  
  private handleTouchStart(e: TouchEvent): void {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.touchState = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        currentX: touch.clientX,
        currentY: touch.clientY,
        isLongPress: false,
      };
      
      // Start long press detection
      this.longPressTimeout = window.setTimeout(() => {
        if (this.touchState) {
          this.touchState.isLongPress = true;
          this.hapticFeedback('light');
          this.callbacks.onOpenMenu();
        }
      }, this.LONG_PRESS_DURATION);
    }
  }
  
  private handleTouchMove(e: TouchEvent): void {
    if (!this.touchState || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    this.touchState.currentX = touch.clientX;
    this.touchState.currentY = touch.clientY;
    
    const dx = touch.clientX - this.touchState.startX;
    const dy = touch.clientY - this.touchState.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Cancel long press if moved too much
    if (distance > this.TAP_THRESHOLD && this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }
    
    // Activate joystick mode if moved enough and mode is joystick
    if (this.controlMode === 'joystick' && distance > this.JOYSTICK_THRESHOLD && !this.joystickActive) {
      this.joystickActive = true;
      this.joystickOrigin = { x: this.touchState.startX, y: this.touchState.startY };
      this.startJoystickMovement();
    }
    
    if (this.joystickActive && this.joystickOrigin) {
      // Update joystick direction
      const maxDist = 80;
      const clampedDist = Math.min(distance, maxDist);
      this.joystickDirection = {
        x: (dx / distance) * (clampedDist / maxDist),
        y: (dy / distance) * (clampedDist / maxDist),
      };
    }
  }
  
  private handleTouchEnd(e: TouchEvent): void {
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }
    
    if (this.joystickActive) {
      this.stopJoystickMovement();
      this.joystickActive = false;
      this.joystickOrigin = null;
      this.joystickDirection = { x: 0, y: 0 };
    }
    
    if (this.touchState && !this.touchState.isLongPress) {
      const dx = this.touchState.currentX - this.touchState.startX;
      const dy = this.touchState.currentY - this.touchState.startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const duration = Date.now() - this.touchState.startTime;
      
      // Quick tap for tap-to-move
      if (distance < this.TAP_THRESHOLD && duration < this.LONG_PRESS_DURATION) {
        this.hapticFeedback('light');
        // The actual tile click is handled by Babylon's pointer observable
      }
    }
    
    this.touchState = null;
  }
  
  private handleTouchCancel(): void {
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }
    this.stopJoystickMovement();
    this.touchState = null;
    this.joystickActive = false;
  }
  
  private handleMouseDown(e: MouseEvent): void {
    this.touchState = {
      startX: e.clientX,
      startY: e.clientY,
      startTime: Date.now(),
      currentX: e.clientX,
      currentY: e.clientY,
      isLongPress: false,
    };
  }
  
  private handleMouseMove(e: MouseEvent): void {
    if (!this.touchState) return;
    this.touchState.currentX = e.clientX;
    this.touchState.currentY = e.clientY;
  }
  
  private handleMouseUp(): void {
    this.touchState = null;
  }
  
  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.grid) return;
    
    let dx = 0;
    let dy = 0;
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        dy = -1;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        dy = 1;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        dx = -1;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        dx = 1;
        break;
      case ' ':
      case 'Enter':
        // Interact with nearest NPC/item
        e.preventDefault();
        return;
      case 'Escape':
        this.callbacks.onOpenMenu();
        return;
      default:
        return;
    }
    
    e.preventDefault();
    
    const newPos = {
      x: this.playerPosition.x + dx,
      y: this.playerPosition.y + dy,
    };
    
    if (this.grid[newPos.y]?.[newPos.x]?.walkable) {
      this.callbacks.onMove(newPos);
    }
  }
  
  private startJoystickMovement(): void {
    if (this.moveInterval) return;
    
    this.moveInterval = window.setInterval(() => {
      if (!this.grid || !this.joystickActive) return;
      
      const { x: jx, y: jy } = this.joystickDirection;
      if (Math.abs(jx) < 0.3 && Math.abs(jy) < 0.3) return;
      
      // Determine primary direction
      let dx = 0;
      let dy = 0;
      
      if (Math.abs(jx) > Math.abs(jy)) {
        dx = jx > 0 ? 1 : -1;
      } else {
        dy = jy > 0 ? 1 : -1;
      }
      
      const newPos = {
        x: this.playerPosition.x + dx,
        y: this.playerPosition.y + dy,
      };
      
      if (this.grid[newPos.y]?.[newPos.x]?.walkable) {
        this.hapticFeedback('light');
        this.callbacks.onMove(newPos);
      }
    }, this.MOVE_INTERVAL);
  }
  
  private stopJoystickMovement(): void {
    if (this.moveInterval) {
      clearInterval(this.moveInterval);
      this.moveInterval = null;
    }
    this.currentPath = [];
    this.pathIndex = 0;
  }
  
  // Called when player taps on a tile
  public handleTileClick(targetPos: GridPos): void {
    if (!this.grid) return;
    
    // Find path to target
    const path = findPath(
      this.playerPosition,
      targetPos,
      this.grid,
      this.gridWidth,
      this.gridHeight
    );
    
    if (path.length > 1) {
      this.currentPath = path;
      this.pathIndex = 1; // Skip current position
      this.moveAlongPath();
    }
  }
  
  private moveAlongPath(): void {
    if (this.pathIndex >= this.currentPath.length) {
      this.currentPath = [];
      this.pathIndex = 0;
      return;
    }
    
    const nextPos = this.currentPath[this.pathIndex];
    this.callbacks.onMove(nextPos);
    this.pathIndex++;
    
    // Continue moving after a delay
    if (this.pathIndex < this.currentPath.length) {
      setTimeout(() => this.moveAlongPath(), 200);
    }
  }
  
  public updateGrid(grid: SectorTile[][], width: number, height: number): void {
    this.grid = grid;
    this.gridWidth = width;
    this.gridHeight = height;
  }
  
  public updatePlayerPosition(position: GridPos): void {
    this.playerPosition = position;
  }
  
  public setControlMode(mode: ControlMode): void {
    this.controlMode = mode;
  }
  
  public setHapticsEnabled(enabled: boolean): void {
    this.hapticsEnabled = enabled;
  }
  
  private hapticFeedback(type: 'light' | 'medium' | 'heavy'): void {
    if (!this.hapticsEnabled || !navigator.vibrate) return;
    
    const durations = {
      light: 10,
      medium: 20,
      heavy: 30,
    };
    
    navigator.vibrate(durations[type]);
  }
  
  public dispose(): void {
    this.stopJoystickMovement();
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
    }
  }
}

// Virtual joystick overlay component helper
export function createJoystickOverlay(): {
  element: HTMLDivElement;
  update: (active: boolean, x: number, y: number, dx: number, dy: number) => void;
} {
  const container = document.createElement('div');
  container.className = 'fixed pointer-events-none z-50';
  container.style.display = 'none';
  
  const base = document.createElement('div');
  base.className = 'w-24 h-24 rounded-full bg-black/30 border-2 border-white/40';
  
  const stick = document.createElement('div');
  stick.className = 'absolute w-12 h-12 rounded-full bg-white/60 transform -translate-x-1/2 -translate-y-1/2';
  stick.style.left = '50%';
  stick.style.top = '50%';
  
  container.appendChild(base);
  container.appendChild(stick);
  
  return {
    element: container,
    update: (active, x, y, dx, dy) => {
      if (active) {
        container.style.display = 'block';
        container.style.left = `${x - 48}px`;
        container.style.top = `${y - 48}px`;
        
        const maxOffset = 24;
        stick.style.left = `${50 + dx * maxOffset}%`;
        stick.style.top = `${50 + dy * maxOffset}%`;
      } else {
        container.style.display = 'none';
      }
    },
  };
}
