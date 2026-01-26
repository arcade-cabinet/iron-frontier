/**
 * React Three Fiber JSX Type Declarations
 *
 * This file extends the JSX intrinsic elements to include Three.js objects
 * when using React Three Fiber. Without this, TypeScript won't recognize
 * <mesh>, <boxGeometry>, etc. as valid JSX elements.
 */

/// <reference types="@react-three/fiber" />

import type { ThreeElements } from '@react-three/fiber';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

// Empty export to make this a module
export {};
