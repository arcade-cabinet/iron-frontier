import { Platform } from "react-native";

/** Size of each tile in pixels */
export const TILE_SIZE = 52;

/** Visual pipe widths */
export const PIPE_WIDTH = 8;
export const HALF_TILE = TILE_SIZE / 2;

/** Fallout HUD colors */
export const AMBER = "#D4A855";
export const AMBER_DIM = "#8B7335";
export const AMBER_GLOW = "rgba(212, 168, 85, 0.4)";
export const AMBER_BG = "rgba(212, 168, 85, 0.08)";
export const TERMINAL_BG = "rgba(10, 8, 5, 0.95)";
export const TERMINAL_BORDER = "rgba(212, 168, 85, 0.3)";
export const CELL_BG = "rgba(212, 168, 85, 0.04)";
export const CELL_BORDER = "rgba(212, 168, 85, 0.15)";
export const CELL_FIXED_BG = "rgba(212, 168, 85, 0.12)";
export const CELL_FIXED_BORDER = "rgba(212, 168, 85, 0.25)";
export const SOLVED_GREEN = "#4ADE80";
export const FLOW_AMBER = "#E8C460";
export const INACTIVE_PIPE = "rgba(212, 168, 85, 0.25)";

export const MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});
