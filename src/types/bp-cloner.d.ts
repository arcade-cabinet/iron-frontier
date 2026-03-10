declare module 'bp-cloner' {
  export class RandomEffector {
    strength: number;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  }

  export class MatrixCloner {
    root?: { position: { x: number; y: number; z: number } } | null;
    constructor(meshes: any[], scene: any, options: any);
    addEffector(effector: any, sensitivity: number): void;
  }
}
