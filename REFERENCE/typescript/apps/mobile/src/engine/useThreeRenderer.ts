/**
 * useThreeRenderer - Hook to initialize Three.js renderer for React Native
 *
 * This hook bridges expo-gl with Three.js, creating a WebGLRenderer that
 * works within React Native's GL context.
 */

import { useCallback, useRef, useState } from 'react';
import { ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';

export interface ThreeRendererState {
  renderer: THREE.WebGLRenderer | null;
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  isReady: boolean;
}

export interface UseThreeRendererOptions {
  /**
   * Field of view for the camera
   * @default 75
   */
  fov?: number;

  /**
   * Near clipping plane
   * @default 0.1
   */
  near?: number;

  /**
   * Far clipping plane
   * @default 1000
   */
  far?: number;

  /**
   * Initial camera position [x, y, z]
   * @default [0, 5, 10]
   */
  cameraPosition?: [number, number, number];

  /**
   * Clear color for the renderer
   * @default '#1a1a2e'
   */
  clearColor?: string;

  /**
   * Called when the renderer is ready
   */
  onReady?: (state: ThreeRendererState) => void;
}

export interface UseThreeRendererResult extends ThreeRendererState {
  /**
   * Initialize the renderer with the GL context
   */
  initializeRenderer: (gl: ExpoWebGLRenderingContext, width: number, height: number) => void;

  /**
   * Update the renderer size (call on resize)
   */
  updateSize: (width: number, height: number) => void;

  /**
   * Render a single frame
   */
  render: () => void;

  /**
   * Clean up all Three.js resources
   */
  dispose: () => void;
}

/**
 * Hook to initialize and manage a Three.js renderer for React Native
 *
 * @example
 * ```tsx
 * const { initializeRenderer, render, scene, camera } = useThreeRenderer({
 *   cameraPosition: [0, 10, 20],
 *   clearColor: '#2d1f1f',
 * });
 *
 * // In GLView onContextCreate:
 * initializeRenderer(gl, width, height);
 *
 * // In animation loop:
 * render();
 * ```
 */
export function useThreeRenderer(
  options: UseThreeRendererOptions = {}
): UseThreeRendererResult {
  const {
    fov = 75,
    near = 0.1,
    far = 1000,
    cameraPosition = [0, 5, 10],
    clearColor = '#1a1a2e',
    onReady,
  } = options;

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const glRef = useRef<ExpoWebGLRenderingContext | null>(null);

  const [isReady, setIsReady] = useState(false);

  const initializeRenderer = useCallback(
    (gl: ExpoWebGLRenderingContext, width: number, height: number) => {
      // Store GL context reference
      glRef.current = gl;

      // Create the Three.js renderer using expo-three's Renderer
      const renderer = new Renderer({ gl }) as unknown as THREE.WebGLRenderer;
      renderer.setSize(width, height);
      renderer.setPixelRatio(1); // React Native handles pixel ratio
      renderer.setClearColor(new THREE.Color(clearColor));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // Create the scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(clearColor);
      sceneRef.current = scene;

      // Create the camera
      const aspect = width / height;
      const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      camera.position.set(...cameraPosition);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      setIsReady(true);

      // Notify that renderer is ready
      const state: ThreeRendererState = {
        renderer,
        scene,
        camera,
        isReady: true,
      };
      onReady?.(state);
    },
    [fov, near, far, cameraPosition, clearColor, onReady]
  );

  const updateSize = useCallback((width: number, height: number) => {
    if (rendererRef.current && cameraRef.current) {
      rendererRef.current.setSize(width, height);
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
    }
  }, []);

  const render = useCallback(() => {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);

      // Important: flush the GL context for expo-gl
      if (glRef.current) {
        glRef.current.endFrameEXP();
      }
    }
  }, []);

  const dispose = useCallback(() => {
    // Dispose of renderer
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }

    // Traverse and dispose scene objects
    if (sceneRef.current) {
      sceneRef.current.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      sceneRef.current.clear();
      sceneRef.current = null;
    }

    cameraRef.current = null;
    glRef.current = null;
    setIsReady(false);
  }, []);

  return {
    renderer: rendererRef.current,
    scene: sceneRef.current,
    camera: cameraRef.current,
    isReady,
    initializeRenderer,
    updateSize,
    render,
    dispose,
  };
}

export default useThreeRenderer;
