/**
 * Game Components - Barrel export
 *
 * Re-exports all game UI components. Components ported from legacy Angular UI
 * into React Native with Zustand store bindings.
 */

// ---------------------------------------------------------------------------
// Audio
// ---------------------------------------------------------------------------

export { AudioProvider, useAudioSettings } from './AudioProvider';

// ---------------------------------------------------------------------------
// HUD & Overlays
// ---------------------------------------------------------------------------

export { GameHUD } from './GameHUD';
export { NotificationFeed } from './NotificationFeed';
export { GameOverScreen } from './GameOverScreen';
export { DamageFlash } from './DamageFlash';
export { Crosshair } from './Crosshair';

// ---------------------------------------------------------------------------
// Panels (full-screen / modal)
// ---------------------------------------------------------------------------

export { CharacterPanel } from './CharacterPanel';
export { MainMenu } from './MainMenu';
export { InventoryPanel } from './InventoryPanel';
export { ShopPanel } from './ShopPanel';
export { QuestLog } from './QuestLog';

// ---------------------------------------------------------------------------
// Dialogue
// ---------------------------------------------------------------------------

export { DialogueBox } from './DialogueBox';

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

export { InteractionPrompt } from './InteractionPrompt';

// ---------------------------------------------------------------------------
// Map & Travel
// ---------------------------------------------------------------------------

export { WorldMap } from './WorldMap';
export { TravelPanel } from './TravelPanel';
export { TravelTransition } from './TravelTransition';

// ---------------------------------------------------------------------------
// Minigames
// ---------------------------------------------------------------------------

export { PipePuzzle } from './PipePuzzle';
