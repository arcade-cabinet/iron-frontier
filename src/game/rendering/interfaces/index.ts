/**
 * Rendering Interfaces - Barrel export
 *
 * Re-exports all rendering interfaces from domain-specific files.
 */

export type { ICameraHandle, ILightHandle, IMeshHandle } from './handles.ts';
export type { IScene } from './scene.ts';
export type { ISceneManager, ISceneManagerFactory } from './manager.ts';
