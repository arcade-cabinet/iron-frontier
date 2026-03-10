// TouchOverlay shared constants and frontier palette.

export const JOYSTICK_SIZE = 120;
export const KNOB_SIZE = 50;
export const MAX_JOYSTICK_RADIUS = JOYSTICK_SIZE / 2;
export const JOYSTICK_DEADZONE = 10; // px
export const LOOK_SENSITIVITY_BASE = 0.004;
export const BUTTON_SIZE = 56;
export const FIRE_BUTTON_SIZE = 70;

/** Frontier palette — Old West punk. */
export const FRONTIER = {
  baseBg: "rgba(26, 15, 10, 0.35)", // night
  baseBorder: "rgba(196, 168, 130, 0.45)", // dust
  knobBg: "rgba(181, 166, 66, 0.55)", // brass
  knobBorder: "rgba(212, 160, 23, 0.8)", // whiskey
  fireBtn: "rgba(139, 0, 0, 0.55)", // blood
  fireBorder: "rgba(139, 0, 0, 0.85)",
  reloadBtn: "rgba(212, 160, 23, 0.45)", // whiskey
  reloadBorder: "rgba(212, 160, 23, 0.7)",
  jumpBtn: "rgba(135, 206, 235, 0.35)", // sky
  jumpBorder: "rgba(135, 206, 235, 0.6)",
  interactBtn: "rgba(157, 193, 131, 0.4)", // sage
  interactBorder: "rgba(157, 193, 131, 0.65)",
  menuBtn: "rgba(67, 67, 67, 0.45)", // iron
  menuBorder: "rgba(196, 168, 130, 0.5)",
  weaponBtn: "rgba(92, 64, 51, 0.45)", // leather
  weaponBorder: "rgba(184, 115, 51, 0.55)", // copper
  text: "rgba(196, 168, 130, 0.9)", // dust
};

export interface TouchOverlayProps {
  /** Whether an interaction target is nearby (shows interact button). */
  interactionNearby?: boolean;
}
