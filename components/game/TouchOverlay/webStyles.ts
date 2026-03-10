// Web CSS style objects for TouchOverlayWeb.

import type * as React from "react";
import { FIRE_BUTTON_SIZE, FRONTIER, JOYSTICK_SIZE, KNOB_SIZE } from "./constants.ts";

export const webContainer: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  zIndex: 15,
  touchAction: "none",
  userSelect: "none",
  WebkitUserSelect: "none",
};

export const webJoystickBase: React.CSSProperties = {
  position: "absolute",
  left: 30,
  bottom: 40,
  width: JOYSTICK_SIZE,
  height: JOYSTICK_SIZE,
  borderRadius: "50%",
  backgroundColor: FRONTIER.baseBg,
  border: `2px solid ${FRONTIER.baseBorder}`,
  touchAction: "none",
  pointerEvents: "auto",
};

export const webJoystickKnob: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  width: KNOB_SIZE,
  height: KNOB_SIZE,
  borderRadius: "50%",
  backgroundColor: FRONTIER.knobBg,
  border: `2px solid ${FRONTIER.knobBorder}`,
  pointerEvents: "none",
  boxShadow: `0 0 8px ${FRONTIER.knobBorder}`,
};

export const webLookZone: React.CSSProperties = {
  position: "absolute",
  right: 0,
  top: 0,
  width: "50%",
  height: "100%",
  touchAction: "none",
  pointerEvents: "auto",
};

const webBtnBase: React.CSSProperties = {
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "2px solid",
  borderRadius: "50%",
  userSelect: "none",
  WebkitUserSelect: "none",
  touchAction: "none",
  pointerEvents: "auto",
  cursor: "default",
};

export const webFireBtn: React.CSSProperties = {
  ...webBtnBase,
  right: 20,
  bottom: 60,
  width: FIRE_BUTTON_SIZE,
  height: FIRE_BUTTON_SIZE,
  backgroundColor: FRONTIER.fireBtn,
  borderColor: FRONTIER.fireBorder,
  boxShadow: "0 0 12px rgba(139,0,0,0.4), inset 0 0 8px rgba(139,0,0,0.3)",
};

export const webSmallBtn: React.CSSProperties = {
  ...webBtnBase,
  width: 44,
  height: 44,
};

export const webTinyBtn: React.CSSProperties = {
  ...webBtnBase,
  width: 34,
  height: 34,
  backgroundColor: FRONTIER.weaponBtn,
  borderColor: FRONTIER.weaponBorder,
  borderRadius: 6,
};

export const webMenuBtn: React.CSSProperties = {
  ...webBtnBase,
  left: 10,
  top: 10,
  width: 44,
  height: 44,
  backgroundColor: FRONTIER.menuBtn,
  borderColor: FRONTIER.menuBorder,
  borderRadius: 8,
};

export const webBtnLabel: React.CSSProperties = {
  color: FRONTIER.text,
  fontSize: 13,
  fontWeight: "bold",
  fontFamily: "'Cabin', sans-serif",
  textTransform: "uppercase",
  letterSpacing: 1,
  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
  pointerEvents: "none",
};

export const webBtnLabelSm: React.CSSProperties = { ...webBtnLabel, fontSize: 11 };
export const webBtnLabelTiny: React.CSSProperties = {
  ...webBtnLabel,
  fontSize: 16,
  letterSpacing: 0,
};
