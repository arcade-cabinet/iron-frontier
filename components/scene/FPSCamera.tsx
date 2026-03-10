// FPSCamera — First-person camera controller driven by physics.
//
// Previously applied InputFrame movement directly to the camera position.
// Now delegates all movement to the PlayerController (via PhysicsProvider),
// which resolves collisions against buildings and terrain before updating
// the camera. This component configures the camera projection on mount
// and renders nothing into the scene graph.

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

export function FPSCamera() {
  const { camera } = useThree();

  // Configure camera projection on mount
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 75;
      camera.near = 0.1;
      camera.far = 1000;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  // Camera position and rotation are now driven by PhysicsProvider's useFrame
  // callback, which calls PlayerController.update() and syncs the camera
  // to the resolved physics position each frame.

  return null;
}
