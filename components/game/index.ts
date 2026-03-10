/**
 * Game Components - Barrel export
 *
 * Re-exports all game UI components. Components ported from legacy Angular UI
 * into React Native with Zustand store bindings.
 */

// ---------------------------------------------------------------------------
// Audio
// ---------------------------------------------------------------------------

export { AudioProvider, useAudioSettings } from "./AudioProvider.tsx";

// ---------------------------------------------------------------------------
// HUD & Overlays (always-visible ambient HUD)
// ---------------------------------------------------------------------------

export { AmmoDisplay } from "./AmmoDisplay.tsx";
export { CompassBar } from "./CompassBar/index.ts";
export { Crosshair } from "./Crosshair.tsx";
export { DamageFlash } from "./DamageFlash.tsx";
export { DamageIndicator } from "./DamageIndicator.tsx";
export { GameHUD } from "./GameHUD/index.ts";
export { GameOverScreen } from "./GameOverScreen.tsx";
export { NotificationFeed } from "./NotificationFeed.tsx";
export { PlayerVitals } from "./PlayerVitals/index.ts";
export { QuestNotification } from "./QuestNotification.tsx";
export { StealthIndicator } from "./StealthIndicator.tsx";

// ---------------------------------------------------------------------------
// Panels (full-screen / modal)
// ---------------------------------------------------------------------------

export { CharacterPanel } from "./CharacterPanel/index.ts";
export { InventoryPanel } from "./InventoryPanel/index.ts";
export { MainMenu } from "./MainMenu/index.ts";
export { QuestLog } from "./QuestLog/index.ts";
export { ShopPanel } from "./ShopPanel/index.ts";

// ---------------------------------------------------------------------------
// Dialogue
// ---------------------------------------------------------------------------

export { DialogueBox } from "./DialogueBox/index.ts";

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

export { InteractionPrompt } from "./InteractionPrompt.tsx";

// ---------------------------------------------------------------------------
// Map & Travel
// ---------------------------------------------------------------------------

export { TravelPanel } from "./TravelPanel/index.ts";
export { TravelTransition } from "./TravelTransition/index.ts";
export { WorldMap } from "./WorldMap/index.ts";

// ---------------------------------------------------------------------------
// Minigames
// ---------------------------------------------------------------------------

export { PipePuzzle } from "./PipePuzzle/index.ts";
