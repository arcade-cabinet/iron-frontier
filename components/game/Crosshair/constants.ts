import { Platform } from "react-native";

/** Base gap between center and bracket arms (pixels). */
export const BASE_GAP = 8;
/** Length of each bracket arm (pixels). */
export const ARM_LENGTH = 10;
/** Thickness of bracket arms (pixels). */
export const ARM_THICKNESS = 2;
/** How much spread (in radians) maps to pixel gap expansion. */
export const SPREAD_TO_PIXELS = 200;
/** Hit marker line length (pixels). */
export const HIT_MARKER_SIZE = 10;

export const MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

// Colors
export const COLOR_DEFAULT = "#D4A855"; // Amber
export const COLOR_ENEMY = "#CC4444"; // Red
export const COLOR_INTERACT = "#D4A855"; // Amber (matching HUD)
export const COLOR_HIT = "#FF4444";
export const COLOR_HEADSHOT = "#44FF44";
export const COLOR_KILL = "#FFD700";
