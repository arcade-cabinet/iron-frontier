/**
 * MobileGameView - Main game view component for mobile
 *
 * This component composes ThreeCanvas with game scenes and connects to
 * the shared game store. It handles touch input and game-specific rendering.
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  PanResponder,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import * as THREE from 'three';
import { ThreeCanvas, ThreeCanvasRef } from './ThreeCanvas';
import { useMobileGameStore } from '../game/store/mobileGameStore';
import { MobileGameHUD } from '../game/ui/MobileGameHUD';

export interface MobileGameViewProps {
  /**
   * Custom styles for the container
   */
  style?: ViewStyle;

  /**
   * Called when the game view is ready
   */
  onReady?: () => void;

  /**
   * Called when an error occurs
   */
  onError?: (error: Error) => void;

  /**
   * Whether to show the HUD
   * @default true
   */
  showHUD?: boolean;

  /**
   * Whether touch controls are enabled
   * @default true
   */
  enableTouch?: boolean;
}

// Camera orbit state
interface CameraOrbitState {
  alpha: number; // Horizontal angle
  beta: number; // Vertical angle
  radius: number; // Distance from target
  target: THREE.Vector3;
}

/**
 * MobileGameView - Main game rendering component
 *
 * Provides a complete game view with:
 * - Three.js 3D rendering via expo-three
 * - Touch-based camera controls (orbit, pan, zoom)
 * - Connection to shared game store
 * - Mobile-optimized HUD overlay
 *
 * @example
 * ```tsx
 * <MobileGameView
 *   showHUD={true}
 *   onReady={() => console.log('Game ready!')}
 * />
 * ```
 */
export function MobileGameView({
  style,
  onReady,
  onError,
  showHUD = true,
  enableTouch = true,
}: MobileGameViewProps) {
  const canvasRef = useRef<ThreeCanvasRef>(null);
  const [isReady, setIsReady] = useState(false);

  // Game store state
  const phase = useMobileGameStore((state) => state.phase);
  const currentLocationId = useMobileGameStore((state) => state.currentLocationId);
  const time = useMobileGameStore((state) => state.time);

  // Camera orbit state
  const orbitRef = useRef<CameraOrbitState>({
    alpha: -Math.PI / 4,
    beta: Math.PI / 3,
    radius: 25,
    target: new THREE.Vector3(0, 0, 0),
  });

  // Touch state for gestures
  const touchStateRef = useRef({
    lastX: 0,
    lastY: 0,
    lastDistance: 0,
    isPinching: false,
  });

  // Update camera from orbit state
  const updateCameraFromOrbit = useCallback((camera: THREE.PerspectiveCamera) => {
    const { alpha, beta, radius, target } = orbitRef.current;

    // Calculate camera position from spherical coordinates
    const x = target.x + radius * Math.sin(beta) * Math.cos(alpha);
    const y = target.y + radius * Math.cos(beta);
    const z = target.z + radius * Math.sin(beta) * Math.sin(alpha);

    camera.position.set(x, y, z);
    camera.lookAt(target);
  }, []);

  // Handle pan gestures (single finger drag)
  const handlePan = useCallback(
    (dx: number, dy: number) => {
      const sensitivity = 0.01;
      orbitRef.current.alpha += dx * sensitivity;
      orbitRef.current.beta = Math.max(
        0.3,
        Math.min(Math.PI / 2.2, orbitRef.current.beta + dy * sensitivity)
      );

      if (canvasRef.current?.camera) {
        updateCameraFromOrbit(canvasRef.current.camera);
      }
    },
    [updateCameraFromOrbit]
  );

  // Handle pinch zoom
  const handleZoom = useCallback(
    (scaleFactor: number) => {
      orbitRef.current.radius = Math.max(
        15,
        Math.min(40, orbitRef.current.radius / scaleFactor)
      );

      if (canvasRef.current?.camera) {
        updateCameraFromOrbit(canvasRef.current.camera);
      }
    },
    [updateCameraFromOrbit]
  );

  // Calculate distance between two touch points
  const getTouchDistance = (touches: GestureResponderEvent['nativeEvent']['touches']) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Pan responder for touch gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enableTouch,
      onMoveShouldSetPanResponder: () => enableTouch,

      onPanResponderGrant: (evt) => {
        const { touches } = evt.nativeEvent;
        if (touches.length === 1) {
          touchStateRef.current.lastX = touches[0].pageX;
          touchStateRef.current.lastY = touches[0].pageY;
          touchStateRef.current.isPinching = false;
        } else if (touches.length === 2) {
          touchStateRef.current.lastDistance = getTouchDistance(touches);
          touchStateRef.current.isPinching = true;
        }
      },

      onPanResponderMove: (evt) => {
        const { touches } = evt.nativeEvent;

        if (touches.length === 1 && !touchStateRef.current.isPinching) {
          // Single finger pan (orbit camera)
          const dx = touches[0].pageX - touchStateRef.current.lastX;
          const dy = touches[0].pageY - touchStateRef.current.lastY;
          handlePan(dx, dy);
          touchStateRef.current.lastX = touches[0].pageX;
          touchStateRef.current.lastY = touches[0].pageY;
        } else if (touches.length === 2) {
          // Two finger pinch (zoom)
          const distance = getTouchDistance(touches);
          if (touchStateRef.current.lastDistance > 0) {
            const scaleFactor = distance / touchStateRef.current.lastDistance;
            handleZoom(scaleFactor);
          }
          touchStateRef.current.lastDistance = distance;
          touchStateRef.current.isPinching = true;
        }
      },

      onPanResponderRelease: () => {
        touchStateRef.current.isPinching = false;
        touchStateRef.current.lastDistance = 0;
      },
    })
  ).current;

  // Scene setup
  const handleSetup = useCallback(
    (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
      try {
        // Set background color (western theme)
        scene.background = new THREE.Color('#665544');

        // Add fog for atmosphere
        scene.fog = new THREE.Fog('#665544', 30, 80);

        // Set up camera with orbit state
        updateCameraFromOrbit(camera);

        // Ambient light (hemisphere)
        const ambientLight = new THREE.HemisphereLight(
          '#ffd699', // Sky color
          '#4d3d2d', // Ground color
          0.6
        );
        scene.add(ambientLight);

        // Directional sun light
        const sunLight = new THREE.DirectionalLight('#fff5e6', 0.8);
        sunLight.position.set(-10, 20, -10);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 50;
        scene.add(sunLight);

        // Create ground plane
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({
          color: '#c4a574',
          roughness: 0.9,
          metalness: 0.0,
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Add some placeholder terrain elements
        createPlaceholderScene(scene);

        setIsReady(true);
        onReady?.();
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
      }
    },
    [onReady, onError, updateCameraFromOrbit]
  );

  // Frame update
  const handleFrame = useCallback(
    (scene: THREE.Scene, camera: THREE.PerspectiveCamera, delta: number) => {
      // Update game logic here based on store state
      // For now, just animate any existing objects

      scene.traverse((object) => {
        // Animate placeholder objects (optional gentle sway)
        if (object.userData.animate && object instanceof THREE.Mesh) {
          object.rotation.y += delta * 0.1;
        }
      });
    },
    []
  );

  return (
    <View style={[styles.container, style]} {...panResponder.panHandlers}>
      <ThreeCanvas
        ref={canvasRef}
        cameraPosition={[15, 15, 15]}
        clearColor="#665544"
        onSetup={handleSetup}
        onFrame={handleFrame}
        fps={60}
      />
      {showHUD && isReady && <MobileGameHUD />}
    </View>
  );
}

/**
 * Create placeholder scene elements for testing
 */
function createPlaceholderScene(scene: THREE.Scene) {
  // Create some cacti
  const cactusPositions = [
    [5, 0, 3],
    [-8, 0, 7],
    [12, 0, -5],
    [-3, 0, -10],
    [8, 0, 10],
  ];

  cactusPositions.forEach(([x, y, z], i) => {
    const cactus = createCactus();
    cactus.position.set(x, y, z);
    cactus.scale.setScalar(0.8 + Math.random() * 0.4);
    scene.add(cactus);
  });

  // Create some rocks
  const rockPositions = [
    [10, 0, 8],
    [-12, 0, -8],
    [0, 0, 15],
    [-15, 0, 3],
  ];

  rockPositions.forEach(([x, y, z]) => {
    const rock = createRock();
    rock.position.set(x, y, z);
    rock.rotation.y = Math.random() * Math.PI * 2;
    scene.add(rock);
  });

  // Create a building placeholder (saloon)
  const building = createBuilding();
  building.position.set(0, 0, -5);
  scene.add(building);
}

/**
 * Create a simple cactus mesh
 */
function createCactus(): THREE.Group {
  const cactus = new THREE.Group();

  const material = new THREE.MeshStandardMaterial({
    color: '#2d5a27',
    roughness: 0.8,
  });

  // Main trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.25, 2, 8),
    material
  );
  trunk.position.y = 1;
  trunk.castShadow = true;
  cactus.add(trunk);

  // Left arm
  const armLeft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.15, 0.8, 6),
    material
  );
  armLeft.position.set(-0.35, 1.3, 0);
  armLeft.rotation.z = Math.PI / 4;
  armLeft.castShadow = true;
  cactus.add(armLeft);

  // Right arm
  const armRight = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.15, 0.6, 6),
    material
  );
  armRight.position.set(0.3, 0.9, 0);
  armRight.rotation.z = -Math.PI / 4;
  armRight.castShadow = true;
  cactus.add(armRight);

  return cactus;
}

/**
 * Create a simple rock mesh
 */
function createRock(): THREE.Mesh {
  const geometry = new THREE.DodecahedronGeometry(0.8, 0);
  geometry.scale(1.2, 0.6, 1);

  const material = new THREE.MeshStandardMaterial({
    color: '#8b7355',
    roughness: 0.95,
    metalness: 0.0,
  });

  const rock = new THREE.Mesh(geometry, material);
  rock.position.y = 0.3;
  rock.castShadow = true;
  rock.receiveShadow = true;

  return rock;
}

/**
 * Create a simple building placeholder
 */
function createBuilding(): THREE.Group {
  const building = new THREE.Group();

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: '#8b6914',
    roughness: 0.9,
  });

  const roofMaterial = new THREE.MeshStandardMaterial({
    color: '#5c4d3c',
    roughness: 0.85,
  });

  // Main structure
  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(6, 4, 5),
    wallMaterial
  );
  walls.position.y = 2;
  walls.castShadow = true;
  walls.receiveShadow = true;
  building.add(walls);

  // Roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(7, 0.3, 6),
    roofMaterial
  );
  roof.position.y = 4.15;
  roof.castShadow = true;
  building.add(roof);

  // Front porch
  const porch = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.2, 2),
    wallMaterial
  );
  porch.position.set(0, 0.1, 3.5);
  porch.receiveShadow = true;
  building.add(porch);

  // Porch roof
  const porchRoof = new THREE.Mesh(
    new THREE.BoxGeometry(6.5, 0.15, 2.5),
    roofMaterial
  );
  porchRoof.position.set(0, 3.5, 3.5);
  porchRoof.castShadow = true;
  building.add(porchRoof);

  // Porch posts
  const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3.4, 6);
  const postPositions = [
    [-2.5, 1.7, 4.5],
    [2.5, 1.7, 4.5],
  ];

  postPositions.forEach(([x, y, z]) => {
    const post = new THREE.Mesh(postGeometry, wallMaterial);
    post.position.set(x, y, z);
    post.castShadow = true;
    building.add(post);
  });

  return building;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
});

export default MobileGameView;
