/**
 * GameCanvas.native.tsx - Native platform canvas using expo-gl
 *
 * This component provides the expo-gl wrapper for iOS/Android rendering.
 * It handles:
 * - GLView setup
 * - Three.js renderer initialization
 * - Scene and camera management
 * - Render loop
 */

import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer } from 'expo-three';
import { useEffect, useRef, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import * as THREE from 'three';

// ============================================================================
// TYPES
// ============================================================================

interface GameCanvasProps {
  children?: ReactNode;
  cameraPosition?: [number, number, number];
  onSceneReady?: (scene: THREE.Scene, camera: THREE.Camera, renderer: Renderer) => void;
}

// ============================================================================
// GAME CANVAS (NATIVE)
// ============================================================================

export function GameCanvas({
  children,
  cameraPosition = [0, 15, 20],
  onSceneReady,
}: GameCanvasProps) {
  const sceneRef = useRef<THREE.Scene | undefined>(undefined);
  const cameraRef = useRef<THREE.PerspectiveCamera | undefined>(undefined);
  const rendererRef = useRef<Renderer | undefined>(undefined);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    // Setup renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0xc4b59d, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // Setup scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xc4b59d, 30, 80);
    sceneRef.current = scene;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      45,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.set(...cameraPosition);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Add basic lighting (scenes can override)
    const ambientLight = new THREE.AmbientLight(0xfff8e7, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048);
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Notify parent that scene is ready
    if (onSceneReady) {
      onSceneReady(scene, camera, renderer);
    }

    // Render loop
    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  return (
    <View style={styles.container}>
      <GLView
        style={styles.canvas}
        onContextCreate={onContextCreate}
      />
      {/* Note: children are not rendered in native canvas */}
      {/* Scene setup must be done via onSceneReady callback */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c4b59d',
  },
  canvas: {
    flex: 1,
  },
});

export default GameCanvas;
