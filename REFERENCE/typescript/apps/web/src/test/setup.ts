import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// Mock Tone.js for testing - must be before any imports that use it
vi.mock('tone', () => {
  const createMockVolume = () => ({
    value: 0,
    rampTo: vi.fn(),
  });

  // Create mock synth class
  class MockSynth {
    volume = createMockVolume();
    toDestination = vi.fn().mockReturnThis();
    connect = vi.fn().mockReturnThis();
    disconnect = vi.fn().mockReturnThis();
    triggerAttackRelease = vi.fn();
    triggerAttack = vi.fn();
    triggerRelease = vi.fn();
    dispose = vi.fn();
    set = vi.fn();
  }

  // Create mock volume class
  class MockVolume {
    volume = createMockVolume();
    toDestination = vi.fn().mockReturnThis();
    connect = vi.fn().mockReturnThis();
    dispose = vi.fn();
    constructor(_db?: number) {}
  }

  // Create mock noise class
  class MockNoise {
    volume = createMockVolume();
    start = vi.fn().mockReturnThis();
    stop = vi.fn().mockReturnThis();
    connect = vi.fn().mockReturnThis();
    dispose = vi.fn();
  }

  // Create mock loop class
  class MockLoop {
    start = vi.fn().mockReturnThis();
    stop = vi.fn().mockReturnThis();
    dispose = vi.fn();
    constructor(_callback?: (time: number) => void, _interval?: string) {}
  }

  // Create mock filter class
  class MockAutoFilter {
    toDestination = vi.fn().mockReturnThis();
    start = vi.fn().mockReturnThis();
    stop = vi.fn().mockReturnThis();
    connect = vi.fn().mockReturnThis();
    dispose = vi.fn();
  }

  const MockTransport = {
    start: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    bpm: { value: 120 },
    state: 'stopped',
  };

  const MockDestination = {
    volume: createMockVolume(),
  };

  return {
    start: vi.fn().mockResolvedValue(undefined),
    context: { state: 'running' },
    Transport: MockTransport,
    Destination: MockDestination,
    gainToDb: vi.fn((val) => val * 60 - 60),
    Frequency: vi.fn().mockReturnValue({
      toFrequency: vi.fn().mockReturnValue(440),
    }),
    now: vi.fn().mockReturnValue(0),
    // Synth classes
    Synth: MockSynth,
    PolySynth: MockSynth,
    PluckSynth: MockSynth,
    MetalSynth: MockSynth,
    MembraneSynth: MockSynth,
    NoiseSynth: MockSynth,
    AMSynth: MockSynth,
    FMSynth: MockSynth,
    // Effects
    Volume: MockVolume,
    Noise: MockNoise,
    AutoFilter: MockAutoFilter,
    Loop: MockLoop,
    Filter: MockAutoFilter,
    Reverb: MockAutoFilter,
    Delay: MockAutoFilter,
  };
});

// Declare global for Node.js environment in tests
declare const global: typeof globalThis;

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver as a class
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: vi.fn().mockReturnValue([]),
}));

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  writable: true,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(callback, 0) as unknown as number;
});

global.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
});

// Mock canvas for Babylon.js
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Array(4),
  })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => []),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
});

// Mock sql.js and DatabaseManager
vi.mock('sql.js', () => ({
  default: vi.fn().mockResolvedValue({
    Database: class {
      run = vi.fn();
      exec = vi.fn().mockReturnValue([]);
      export = vi.fn().mockReturnValue(new Uint8Array());
      close = vi.fn();
    },
  }),
}));

vi.mock('@/game/store/DatabaseManager', () => ({
  dbManager: {
    init: vi.fn().mockResolvedValue(undefined),
    savePlayer: vi.fn(),
    saveInventory: vi.fn(),
    loadGameState: vi.fn().mockReturnValue(null),
    export: vi.fn().mockReturnValue(new Uint8Array()),
    dispose: vi.fn(),
  },
}));

// Reset game store before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
});
