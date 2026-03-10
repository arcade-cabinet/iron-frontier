// IInputProvider — Interface that every input source must implement

import type { InputFrame } from './InputFrame';

export interface IInputProvider {
  /** Human-readable name used for registration and debugging */
  readonly name: string;

  /** Higher priority providers override lower for boolean fields */
  readonly priority: number;

  /** Sample current state and return the fields this provider cares about */
  poll(): Partial<InputFrame>;

  /** Start listening for input events */
  enable(): void;

  /** Stop listening but keep the provider registered */
  disable(): void;

  /** Permanently tear down event listeners and resources */
  dispose(): void;
}
