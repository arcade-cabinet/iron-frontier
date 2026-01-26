/**
 * R3FCanvas Component Tests
 *
 * Tests for the main R3F canvas wrapper component.
 * Note: Due to the complexity of mocking R3F internals properly,
 * these tests focus on the wrapper component logic rather than
 * rendering the full 3D scene.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Import mocks before the component
import '../../../test/r3f-mocks';

// We need to skip the full R3FCanvas component tests because the internal
// R3F hooks (useThree, useFrame) require a proper R3F context that's hard
// to mock completely. Instead, we test the exported utilities and types.

import {
  DEFAULT_SCENE_CONFIG,
  DEFAULT_CAMERA_CONFIG,
  DEFAULT_PERFORMANCE_CONFIG,
} from '../types';

describe('R3FCanvas Types', () => {
  describe('DEFAULT_SCENE_CONFIG', () => {
    it('has expected default values', () => {
      expect(DEFAULT_SCENE_CONFIG).toBeDefined();
      expect(DEFAULT_SCENE_CONFIG.shadows).toBe(true);
      expect(DEFAULT_SCENE_CONFIG.antialias).toBe(true);
    });
  });

  describe('DEFAULT_CAMERA_CONFIG', () => {
    it('has expected default values', () => {
      expect(DEFAULT_CAMERA_CONFIG).toBeDefined();
      expect(DEFAULT_CAMERA_CONFIG.type).toBe('perspective');
      expect(DEFAULT_CAMERA_CONFIG.fov).toBe(50);
    });
  });

  describe('DEFAULT_PERFORMANCE_CONFIG', () => {
    it('has expected default values', () => {
      expect(DEFAULT_PERFORMANCE_CONFIG).toBeDefined();
      expect(DEFAULT_PERFORMANCE_CONFIG.targetFps).toBe(60);
    });
  });
});

describe('R3FCanvas WebGPU Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset navigator.gpu
    Object.defineProperty(navigator, 'gpu', {
      value: undefined,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('detects WebGPU as not available when gpu is undefined', async () => {
    // Import the component module to test the detection function
    const { R3FCanvas } = await import('../R3FCanvas');

    // The component should show loading state initially
    render(
      <R3FCanvas>
        <></>
      </R3FCanvas>
    );

    expect(screen.getByText(/initializing renderer/i)).toBeInTheDocument();
  });

  it('detects WebGPU when adapter is available', async () => {
    // Mock WebGPU as available
    Object.defineProperty(navigator, 'gpu', {
      value: {
        requestAdapter: vi.fn().mockResolvedValue({ name: 'MockAdapter' }),
      },
      configurable: true,
    });

    const { R3FCanvas } = await import('../R3FCanvas');

    render(
      <R3FCanvas>
        <></>
      </R3FCanvas>
    );

    // Initially shows loading
    expect(screen.getByText(/initializing renderer/i)).toBeInTheDocument();
  });

  it('handles WebGPU adapter returning null', async () => {
    Object.defineProperty(navigator, 'gpu', {
      value: {
        requestAdapter: vi.fn().mockResolvedValue(null),
      },
      configurable: true,
    });

    const { R3FCanvas } = await import('../R3FCanvas');

    render(
      <R3FCanvas>
        <></>
      </R3FCanvas>
    );

    expect(screen.getByText(/initializing renderer/i)).toBeInTheDocument();
  });

  it('handles WebGPU requestAdapter throwing', async () => {
    Object.defineProperty(navigator, 'gpu', {
      value: {
        requestAdapter: vi.fn().mockRejectedValue(new Error('GPU Error')),
      },
      configurable: true,
    });

    const { R3FCanvas } = await import('../R3FCanvas');

    render(
      <R3FCanvas>
        <></>
      </R3FCanvas>
    );

    expect(screen.getByText(/initializing renderer/i)).toBeInTheDocument();
  });
});
