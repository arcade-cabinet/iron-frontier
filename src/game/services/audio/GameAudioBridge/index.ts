/**
 * GameAudioBridge barrel export.
 *
 * @module services/audio/GameAudioBridge
 */

export type { AudioBridgeStoreShape, GameAudioBridgeOptions } from './types';
export { GameAudioBridge } from './GameAudioBridge';

/** Singleton instance for app-wide access. */
import { GameAudioBridge } from './GameAudioBridge';
export const gameAudioBridge = new GameAudioBridge();
