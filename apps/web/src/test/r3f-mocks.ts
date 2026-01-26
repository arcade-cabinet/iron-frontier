/**
 * R3F Test Mocks - Comprehensive mocks for React Three Fiber testing
 *
 * Import this file at the top of any test that needs to render R3F components.
 * These mocks allow R3F components to be rendered in a JSDOM environment.
 */

import React from 'react';
import { vi } from 'vitest';

// ============================================================================
// THREE.JS MOCKS
// ============================================================================

vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three');

  // Mock WebGLRenderer since JSDOM doesn't support WebGL
  const MockWebGLRenderer = vi.fn().mockImplementation(() => ({
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
    setClearColor: vi.fn(),
    clear: vi.fn(),
    domElement: document.createElement('canvas'),
    shadowMap: { enabled: false, type: 0 },
    toneMapping: 0,
    toneMappingExposure: 1,
    outputColorSpace: 'srgb',
    info: {
      memory: { geometries: 0, textures: 0 },
      render: { calls: 0, triangles: 0, points: 0, lines: 0 },
      programs: [],
    },
    getContext: vi.fn(() => ({
      getExtension: vi.fn(),
      getParameter: vi.fn(() => 4096),
    })),
    capabilities: {
      isWebGL2: true,
      maxTextureSize: 4096,
    },
    extensions: {
      get: vi.fn(),
    },
  }));

  return {
    ...actual,
    WebGLRenderer: MockWebGLRenderer,
  };
});

// ============================================================================
// @REACT-THREE/FIBER MOCKS
// ============================================================================

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement(
      'div',
      {
        'data-testid': 'r3f-canvas',
        ...props,
      },
      children
    ),
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    camera: {
      position: { x: 0, y: 10, z: 20, set: vi.fn(), copy: vi.fn() },
      rotation: { x: 0, y: 0, z: 0, set: vi.fn() },
      lookAt: vi.fn(),
      updateProjectionMatrix: vi.fn(),
    },
    gl: {
      domElement: document.createElement('canvas'),
      setSize: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
      info: { render: { calls: 0 } },
      getContext: vi.fn(() => ({
        getExtension: vi.fn(),
        getParameter: vi.fn(() => 4096),
      })),
    },
    scene: {
      add: vi.fn(),
      remove: vi.fn(),
      children: [],
      background: null,
      fog: null,
    },
    size: { width: 800, height: 600 },
    viewport: { width: 800, height: 600 },
    clock: { getElapsedTime: () => 0 },
    raycaster: {
      setFromCamera: vi.fn(),
      intersectObjects: vi.fn(() => []),
    },
    mouse: { x: 0, y: 0 },
    invalidate: vi.fn(),
    advance: vi.fn(),
  })),
  extend: vi.fn(),
  createPortal: vi.fn(),
  useLoader: vi.fn(() => ({})),
  addEffect: vi.fn(),
  addAfterEffect: vi.fn(),
  invalidate: vi.fn(),
}));

// ============================================================================
// @REACT-THREE/DREI MOCKS
// ============================================================================

vi.mock('@react-three/drei', () => ({
  // Environment
  Sky: () => null,
  Stars: () => null,
  Cloud: () => null,
  Environment: () => null,
  Clouds: ({ children }: { children?: React.ReactNode }) => children || null,

  // Camera controls
  OrbitControls: () => null,
  MapControls: () => null,
  FlyControls: () => null,
  FirstPersonControls: () => null,
  PerspectiveCamera: () => null,
  OrthographicCamera: () => null,

  // Loaders and assets
  useTexture: vi.fn(() => null),
  useGLTF: vi.fn(() => ({
    scene: { clone: vi.fn(() => ({})) },
    nodes: {},
    materials: {},
  })),
  useFBX: vi.fn(() => ({ clone: vi.fn(() => ({})) })),
  useAnimations: vi.fn(() => ({
    actions: {},
    mixer: { clipAction: vi.fn() },
  })),
  Preload: () => null,

  // HTML/DOM integration
  Html: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('div', { 'data-testid': 'drei-html', ...props }, children),
  Billboard: ({ children }: { children: React.ReactNode }) => children,

  // Instancing
  Instances: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  Instance: () => null,
  Merged: ({ children }: { children: (instances: Record<string, unknown>) => React.ReactNode }) =>
    children({}),

  // Performance
  Stats: () => null,
  AdaptiveDpr: () => null,
  AdaptiveEvents: () => null,
  PerformanceMonitor: () => null,
  Bvh: ({ children }: { children: React.ReactNode }) => children,

  // Effects
  Effects: ({ children }: { children: React.ReactNode }) => children,
  EffectComposer: ({ children }: { children: React.ReactNode }) => children,

  // Helpers
  Plane: () => null,
  Box: () => null,
  Sphere: () => null,
  Cylinder: () => null,
  Cone: () => null,
  Torus: () => null,
  Circle: () => null,
  Ring: () => null,
  Text: () => null,
  Text3D: () => null,
  Center: ({ children }: { children: React.ReactNode }) => children,
  Float: ({ children }: { children: React.ReactNode }) => children,
  Line: () => null,
  QuadraticBezierLine: () => null,
  CubicBezierLine: () => null,
  Sparkles: () => null,
  Trail: () => null,

  // Shaders
  shaderMaterial: vi.fn(() => vi.fn()),
  MeshReflectorMaterial: () => null,
  MeshTransmissionMaterial: () => null,
  MeshDistortMaterial: () => null,
  MeshWobbleMaterial: () => null,
  GradientTexture: () => null,
  useSurfaceSampler: vi.fn(() => ({ count: 0, samplePoints: [] })),

  // Stage/Lighting
  Stage: ({ children }: { children: React.ReactNode }) => children,
  ContactShadows: () => null,
  AccumulativeShadows: () => null,
  RandomizedLight: () => null,
  Lightformer: () => null,
  SoftShadows: () => null,

  // Hooks
  useCursor: vi.fn(),
  useDetectGPU: vi.fn(() => ({ tier: 3, isMobile: false })),
  useProgress: vi.fn(() => ({ progress: 100, loaded: true })),
  useBounds: vi.fn(() => ({
    refresh: vi.fn(),
    clip: vi.fn(),
    fit: vi.fn(),
  })),
  Bounds: ({ children }: { children: React.ReactNode }) => children,
}));

// ============================================================================
// @REACT-THREE/POSTPROCESSING MOCKS
// ============================================================================

vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }: { children: React.ReactNode }) => children,
  Bloom: () => null,
  Noise: () => null,
  Vignette: () => null,
  DepthOfField: () => null,
  ChromaticAberration: () => null,
  HueSaturation: () => null,
  SMAA: () => null,
  SSAO: () => null,
  ToneMapping: () => null,
  Glitch: () => null,
  Scanline: () => null,
  DotScreen: () => null,
  MotionBlur: () => null,
}));

// ============================================================================
// HELPER EXPORTS
// ============================================================================

export {};
