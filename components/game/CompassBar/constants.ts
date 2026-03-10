export const HUD_AMBER = "#D4A855";
export const HUD_AMBER_DIM = "#C4963F";
export const HUD_TEXT = "#E8D5A8";
export const HUD_BG = "rgba(20, 15, 10, 0.6)";
export const HUD_RED = "#CC4444";

export const DIRECTIONS: { label: string; bearing: number; major: boolean }[] = [
  { label: "N", bearing: 0, major: true },
  { label: "NE", bearing: 45, major: false },
  { label: "E", bearing: 90, major: true },
  { label: "SE", bearing: 135, major: false },
  { label: "S", bearing: 180, major: true },
  { label: "SW", bearing: 225, major: false },
  { label: "W", bearing: 270, major: true },
  { label: "NW", bearing: 315, major: false },
];

export const TICK_INTERVAL = 15;
export const COMPASS_FOV = 180;
export const COMPASS_WIDTH_RATIO = 0.6;
export const LOCATION_LABEL_DISTANCE = 100;
