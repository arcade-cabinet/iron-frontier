/// <reference types="expo/types" />

// NOTE: This file should not be edited and should be in your git ignore

// GLB/GLTF model asset declarations for Metro bundler
declare module "*.glb" {
  const content: number;
  export default content;
}

declare module "*.gltf" {
  const content: number;
  export default content;
}
