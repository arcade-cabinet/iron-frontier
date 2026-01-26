/**
 * ThreeCanvas - Main Three.js canvas component for React Native
 *
 * This component provides the GL rendering surface and bridges expo-gl
 * with Three.js. It handles context creation, resize events, and cleanup.
 */

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native';
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import * as THREE from 'three';
import { useThreeRenderer, UseThreeRendererOptions } from './useThreeRenderer';

export interface ThreeCanvasProps extends UseThreeRendererOptions {
  /**
   * Custom styles for the container
   */
  style?: ViewStyle;

  /**
   * Called when GL context is created (before Three.js init)
   */
  onContextCreate?: (gl: ExpoWebGLRenderingContext) => void;

  /**
   * Setup function called with scene and camera after initialization
   * Use this to add objects to the scene
   */
  onSetup?: (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => void;

  /**
   * Called every frame before render
   * Use this for animations and updates
   */
  onFrame?: (
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    delta: number
  ) => void;

  /**
   * Target frames per second
   * @default 60
   */
  fps?: number;

  /**
   * Whether the canvas is paused
   * @default false
   */
  paused?: boolean;

  /**
   * Children to render over the canvas (HUD, etc.)
   */
  children?: React.ReactNode;
}

export interface ThreeCanvasRef {
  /**
   * The Three.js scene
   */
  scene: THREE.Scene | null;

  /**
   * The Three.js camera
   */
  camera: THREE.PerspectiveCamera | null;

  /**
   * The Three.js renderer
   */
  renderer: THREE.WebGLRenderer | null;

  /**
   * Force a render frame
   */
  render: () => void;

  /**
   * Pause the render loop
   */
  pause: () => void;

  /**
   * Resume the render loop
   */
  resume: () => void;
}

/**
 * ThreeCanvas - Main 3D rendering canvas for mobile
 *
 * This component wraps expo-gl's GLView and initializes Three.js,
 * providing a simple interface for 3D rendering in React Native.
 *
 * @example
 * ```tsx
 * <ThreeCanvas
 *   cameraPosition={[0, 10, 20]}
 *   onSetup={(scene) => {
 *     const cube = new THREE.Mesh(
 *       new THREE.BoxGeometry(),
 *       new THREE.MeshStandardMaterial({ color: 'orange' })
 *     );
 *     scene.add(cube);
 *   }}
 *   onFrame={(scene, camera, delta) => {
 *     // Animation logic
 *   }}
 * >
 *   <GameHUD />
 * </ThreeCanvas>
 * ```
 */
export const ThreeCanvas = forwardRef<ThreeCanvasRef, ThreeCanvasProps>(
  (props, ref) => {
    const {
      style,
      onContextCreate,
      onSetup,
      onFrame,
      fps = 60,
      paused = false,
      children,
      ...rendererOptions
    } = props;

    const sizeRef = useRef({ width: 0, height: 0 });
    const animationFrameRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const isPausedRef = useRef(paused);

    const {
      scene,
      camera,
      renderer,
      isReady,
      initializeRenderer,
      updateSize,
      render,
      dispose,
    } = useThreeRenderer(rendererOptions);

    // Keep paused ref in sync
    useEffect(() => {
      isPausedRef.current = paused;
    }, [paused]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        scene,
        camera,
        renderer,
        render,
        pause: () => {
          isPausedRef.current = true;
        },
        resume: () => {
          isPausedRef.current = false;
        },
      }),
      [scene, camera, renderer, render]
    );

    // Animation loop
    useEffect(() => {
      if (!isReady || !scene || !camera) return;

      // Call setup once when ready
      onSetup?.(scene, camera);

      const frameInterval = 1000 / fps;

      const animate = (time: number) => {
        animationFrameRef.current = requestAnimationFrame(animate);

        if (isPausedRef.current) return;

        const delta = time - lastTimeRef.current;

        if (delta >= frameInterval) {
          lastTimeRef.current = time - (delta % frameInterval);

          // Call frame callback
          onFrame?.(scene, camera, delta / 1000);

          // Render the scene
          render();
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
    }, [isReady, scene, camera, fps, onSetup, onFrame, render]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        dispose();
      };
    }, [dispose]);

    const handleContextCreate = useCallback(
      (gl: ExpoWebGLRenderingContext) => {
        // Notify before Three.js init
        onContextCreate?.(gl);

        // Initialize Three.js with the GL context
        const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
        sizeRef.current = { width, height };
        initializeRenderer(gl, width, height);
      },
      [onContextCreate, initializeRenderer]
    );

    const handleLayout = useCallback(
      (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;

        if (
          width !== sizeRef.current.width ||
          height !== sizeRef.current.height
        ) {
          sizeRef.current = { width, height };
          updateSize(width, height);
        }
      },
      [updateSize]
    );

    return (
      <View style={[styles.container, style]} onLayout={handleLayout}>
        <GLView
          style={styles.glView}
          onContextCreate={handleContextCreate}
        />
        {children}
      </View>
    );
  }
);

ThreeCanvas.displayName = 'ThreeCanvas';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  glView: {
    flex: 1,
  },
});

export default ThreeCanvas;
