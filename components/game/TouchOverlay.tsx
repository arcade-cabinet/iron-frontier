// TouchOverlay — Visual touch controls for mobile/tablet gameplay.
//
// Renders an absolute overlay with:
// - Virtual joystick (bottom-left, 120px base + 50px knob)
// - Look zone (right 50% of screen, invisible drag area)
// - Action buttons (bottom-right): Fire, Reload, Jump, Interact
// - Weapon switch arrows (left/right)
// - Menu button (top-left)
//
// Architecture:
//   Writes to shared state in TouchOverlayState.ts. TouchProvider.poll()
//   reads from that shared state when overlayActive is true, bridging the
//   React visual layer with the input system polling architecture.
//
// On web: uses HTML div elements with onTouchStart/Move/End for proper
//   multi-touch support (React Native's PanResponder only tracks one gesture).
// On native: uses PanResponder for joystick and responder API for look zone.
//
// Frontier-themed styling: amber, leather, brass tones from the project palette.

import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import {
  type GestureResponderEvent,
  PanResponder,
  type PanResponderGestureState,
  Platform,
  Pressable,
  View,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { InputManager } from "@/src/game/input/InputManager";
import type { TouchProvider } from "@/src/game/input/providers/TouchProvider";
import { clearOverlayState, overlayTouchState } from "@/src/game/input/TouchOverlayState";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const JOYSTICK_SIZE = 120;
const KNOB_SIZE = 50;
const MAX_JOYSTICK_RADIUS = JOYSTICK_SIZE / 2;
const JOYSTICK_DEADZONE = 10; // px
const LOOK_SENSITIVITY_BASE = 0.004;
const BUTTON_SIZE = 56;
const FIRE_BUTTON_SIZE = 70;

/** Frontier palette — Old West punk. */
const FRONTIER = {
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

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TouchOverlayProps {
  /** Whether an interaction target is nearby (shows interact button). */
  interactionNearby?: boolean;
}

// ---------------------------------------------------------------------------
// Platform router
// ---------------------------------------------------------------------------

export function TouchOverlay({ interactionNearby = false }: TouchOverlayProps) {
  if (Platform.OS === "web" && typeof document !== "undefined") {
    return <TouchOverlayWeb interactionNearby={interactionNearby} />;
  }
  return <TouchOverlayNative interactionNearby={interactionNearby} />;
}

// ===========================================================================
// WEB IMPLEMENTATION — HTML overlay with raw touch events (multi-touch)
// ===========================================================================

function TouchOverlayWeb({ interactionNearby }: { interactionNearby: boolean }) {
  const joystickTouchId = useRef<number | null>(null);
  const joystickCenter = useRef({ x: 0, y: 0 });
  const joystickKnobRef = useRef<HTMLDivElement | null>(null);
  const lookTouchId = useRef<number | null>(null);
  const lookLastPos = useRef({ x: 0, y: 0 });

  // Activate on mount, deactivate on unmount
  useEffect(() => {
    overlayTouchState.overlayActive = true;
    const manager = InputManager.getInstance();
    const tp = manager.getProvider("touch") as TouchProvider | undefined;
    tp?.disable();
    return () => {
      clearOverlayState();
      tp?.enable();
    };
  }, []);

  // -- Joystick -----------------------------------------------------------------

  const onJoystickStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (joystickTouchId.current !== null) return;
    const t = e.changedTouches[0];
    if (!t) return;
    e.preventDefault();
    joystickTouchId.current = t.identifier;
    const rect = e.currentTarget.getBoundingClientRect();
    joystickCenter.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    overlayTouchState.moveX = 0;
    overlayTouchState.moveZ = 0;
    if (joystickKnobRef.current) joystickKnobRef.current.style.transform = "translate(-50%, -50%)";
  }, []);

  const onJoystickMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (joystickTouchId.current === null) return;
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier !== joystickTouchId.current) continue;
      const dx = t.clientX - joystickCenter.current.x;
      const dy = t.clientY - joystickCenter.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < JOYSTICK_DEADZONE) {
        overlayTouchState.moveX = 0;
        overlayTouchState.moveZ = 0;
        if (joystickKnobRef.current)
          joystickKnobRef.current.style.transform = "translate(-50%, -50%)";
      } else {
        const clamped = Math.min(dist, MAX_JOYSTICK_RADIUS);
        const nX =
          ((dx / dist) * (clamped - JOYSTICK_DEADZONE)) / (MAX_JOYSTICK_RADIUS - JOYSTICK_DEADZONE);
        const nY =
          ((dy / dist) * (clamped - JOYSTICK_DEADZONE)) / (MAX_JOYSTICK_RADIUS - JOYSTICK_DEADZONE);
        overlayTouchState.moveX = Math.max(-1, Math.min(1, nX));
        overlayTouchState.moveZ = Math.max(-1, Math.min(1, -nY));
        if (joystickKnobRef.current) {
          const kx = (dx / dist) * clamped;
          const ky = (dy / dist) * clamped;
          joystickKnobRef.current.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
        }
      }
    }
  }, []);

  const onJoystickEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchId.current) {
        joystickTouchId.current = null;
        overlayTouchState.moveX = 0;
        overlayTouchState.moveZ = 0;
        if (joystickKnobRef.current)
          joystickKnobRef.current.style.transform = "translate(-50%, -50%)";
        break;
      }
    }
  }, []);

  // -- Look zone ----------------------------------------------------------------

  const onLookStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (lookTouchId.current !== null) return;
    const t = e.changedTouches[0];
    if (!t) return;
    e.preventDefault();
    lookTouchId.current = t.identifier;
    lookLastPos.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onLookMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (lookTouchId.current === null) return;
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier !== lookTouchId.current) continue;
      overlayTouchState.lookDeltaX += (t.clientX - lookLastPos.current.x) * LOOK_SENSITIVITY_BASE;
      overlayTouchState.lookDeltaY += (t.clientY - lookLastPos.current.y) * LOOK_SENSITIVITY_BASE;
      lookLastPos.current = { x: t.clientX, y: t.clientY };
    }
  }, []);

  const onLookEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchId.current) {
        lookTouchId.current = null;
        break;
      }
    }
  }, []);

  // -- Button helpers -----------------------------------------------------------

  const onFireStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    overlayTouchState.fire = true;
  }, []);
  const onFireEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    overlayTouchState.fire = false;
  }, []);

  const pulse = useCallback(
    (key: "reload" | "jump" | "interact" | "menu") => (e: React.TouchEvent) => {
      e.preventDefault();
      overlayTouchState[key] = true;
      setTimeout(() => {
        overlayTouchState[key] = false;
      }, 100);
    },
    [],
  );

  const weaponSwitch = useCallback(
    (dir: number) => (e: React.TouchEvent) => {
      e.preventDefault();
      overlayTouchState.weaponSwitch = dir;
      setTimeout(() => {
        overlayTouchState.weaponSwitch = 0;
      }, 100);
    },
    [],
  );

  // -- Render -------------------------------------------------------------------

  return (
    <div style={webContainer}>
      {/* Virtual Joystick (bottom-left) */}
      <div
        onTouchStart={onJoystickStart}
        onTouchMove={onJoystickMove}
        onTouchEnd={onJoystickEnd}
        onTouchCancel={onJoystickEnd}
        style={webJoystickBase}
      >
        <div ref={joystickKnobRef} style={webJoystickKnob} />
      </div>

      {/* Look zone (right half, invisible) */}
      <div
        onTouchStart={onLookStart}
        onTouchMove={onLookMove}
        onTouchEnd={onLookEnd}
        onTouchCancel={onLookEnd}
        style={webLookZone}
      />

      {/* Fire (large, bottom-right) */}
      <div
        onTouchStart={onFireStart}
        onTouchEnd={onFireEnd}
        onTouchCancel={onFireEnd}
        style={webFireBtn}
      >
        <span style={webBtnLabel}>FIRE</span>
      </div>

      {/* Reload (above fire) */}
      <div
        onTouchStart={pulse("reload")}
        style={{
          ...webSmallBtn,
          right: 35,
          bottom: 150,
          backgroundColor: FRONTIER.reloadBtn,
          borderColor: FRONTIER.reloadBorder,
        }}
      >
        <span style={webBtnLabelSm}>RLD</span>
      </div>

      {/* Jump (left of fire) */}
      <div
        onTouchStart={pulse("jump")}
        style={{
          ...webSmallBtn,
          right: 110,
          bottom: 60,
          backgroundColor: FRONTIER.jumpBtn,
          borderColor: FRONTIER.jumpBorder,
        }}
      >
        <span style={webBtnLabelSm}>JMP</span>
      </div>

      {/* Interact (conditional) */}
      {interactionNearby && (
        <div
          onTouchStart={pulse("interact")}
          style={{
            ...webSmallBtn,
            right: 110,
            bottom: 120,
            backgroundColor: FRONTIER.interactBtn,
            borderColor: FRONTIER.interactBorder,
          }}
        >
          <span style={webBtnLabelSm}>USE</span>
        </div>
      )}

      {/* Weapon prev/next */}
      <div onTouchStart={weaponSwitch(-1)} style={{ ...webTinyBtn, right: 105, bottom: 12 }}>
        <span style={webBtnLabelTiny}>&lt;</span>
      </div>
      <div onTouchStart={weaponSwitch(1)} style={{ ...webTinyBtn, right: 25, bottom: 12 }}>
        <span style={webBtnLabelTiny}>&gt;</span>
      </div>

      {/* Menu (top-left) */}
      <div onTouchStart={pulse("menu")} style={webMenuBtn}>
        <span style={{ ...webBtnLabel, fontSize: 18, letterSpacing: 2 }}>| |</span>
      </div>
    </div>
  );
}

// ===========================================================================
// NATIVE IMPLEMENTATION — React Native Pressable + PanResponder
// ===========================================================================

function TouchOverlayNative({ interactionNearby }: { interactionNearby: boolean }) {
  const [knobOffset, setKnobOffset] = React.useState({ x: 0, y: 0 });

  // Activate on mount, deactivate on unmount
  useEffect(() => {
    overlayTouchState.overlayActive = true;
    const manager = InputManager.getInstance();
    const tp = manager.getProvider("touch") as TouchProvider | undefined;
    tp?.disable();
    return () => {
      clearOverlayState();
      tp?.enable();
    };
  }, []);

  // -- Joystick PanResponder ---------------------------------------------------

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_e: GestureResponderEvent, gs: PanResponderGestureState) => {
        const dx = Math.max(-MAX_JOYSTICK_RADIUS, Math.min(MAX_JOYSTICK_RADIUS, gs.dx));
        const dy = Math.max(-MAX_JOYSTICK_RADIUS, Math.min(MAX_JOYSTICK_RADIUS, gs.dy));
        setKnobOffset({ x: dx, y: dy });
        overlayTouchState.moveX = dx / MAX_JOYSTICK_RADIUS;
        overlayTouchState.moveZ = -dy / MAX_JOYSTICK_RADIUS;
      },
      onPanResponderRelease: () => {
        setKnobOffset({ x: 0, y: 0 });
        overlayTouchState.moveX = 0;
        overlayTouchState.moveZ = 0;
      },
      onPanResponderTerminate: () => {
        setKnobOffset({ x: 0, y: 0 });
        overlayTouchState.moveX = 0;
        overlayTouchState.moveZ = 0;
      },
    }),
  ).current;

  // -- Look zone PanResponder --------------------------------------------------

  const lookResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_e: GestureResponderEvent, gs: PanResponderGestureState) => {
        overlayTouchState.lookDeltaX += gs.vx * 0.01;
        overlayTouchState.lookDeltaY += gs.vy * 0.01;
      },
    }),
  ).current;

  // -- Action callback ---------------------------------------------------------

  const setAction = useCallback(
    (key: "fire" | "interact" | "jump" | "reload" | "menu", value: boolean) => {
      overlayTouchState[key] = value;
      if (value && key !== "fire") {
        setTimeout(() => {
          overlayTouchState[key] = false;
        }, 100);
      }
    },
    [],
  );

  // -- Render ------------------------------------------------------------------

  return (
    <View
      style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 0 }}
      pointerEvents="box-none"
    >
      {/* Joystick */}
      <View style={{ position: "absolute", left: 30, bottom: 40 }} pointerEvents="box-none">
        <View style={rnJoystickBase}>
          <View
            {...panResponder.panHandlers}
            style={[
              rnJoystickKnob,
              { transform: [{ translateX: knobOffset.x }, { translateY: knobOffset.y }] },
            ]}
          />
        </View>
      </View>

      {/* Look zone */}
      <View
        style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "50%" }}
        pointerEvents="box-none"
      >
        <View {...lookResponder.panHandlers} style={{ flex: 1, backgroundColor: "transparent" }} />
      </View>

      {/* Buttons (bottom-right) */}
      <View
        style={{ position: "absolute", right: 20, bottom: 40, gap: 12, alignItems: "center" }}
        pointerEvents="box-none"
      >
        <NativeButton
          label="Fire"
          size={FIRE_BUTTON_SIZE}
          bg={FRONTIER.fireBtn}
          border={FRONTIER.fireBorder}
          onPressIn={() => setAction("fire", true)}
          onPressOut={() => setAction("fire", false)}
        />
        <View style={{ flexDirection: "row", gap: 12 }}>
          {interactionNearby && (
            <NativeButton
              label="Use"
              bg={FRONTIER.interactBtn}
              border={FRONTIER.interactBorder}
              onPressIn={() => setAction("interact", true)}
            />
          )}
          <NativeButton
            label="Jump"
            bg={FRONTIER.jumpBtn}
            border={FRONTIER.jumpBorder}
            onPressIn={() => setAction("jump", true)}
          />
        </View>
        <NativeButton
          label="Rld"
          bg={FRONTIER.reloadBtn}
          border={FRONTIER.reloadBorder}
          onPressIn={() => setAction("reload", true)}
        />
      </View>

      {/* Menu (top-left) */}
      <View style={{ position: "absolute", left: 10, top: 10 }} pointerEvents="box-none">
        <NativeButton
          label="| |"
          bg={FRONTIER.menuBtn}
          border={FRONTIER.menuBorder}
          onPressIn={() => setAction("menu", true)}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Native button helper
// ---------------------------------------------------------------------------

interface NativeButtonProps {
  label: string;
  size?: number;
  bg: string;
  border: string;
  onPressIn: () => void;
  onPressOut?: () => void;
}

function NativeButton({
  label,
  size = BUTTON_SIZE,
  bg,
  border,
  onPressIn,
  onPressOut,
}: NativeButtonProps) {
  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        borderWidth: 2,
        borderColor: border,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: FRONTIER.text, fontSize: size > 60 ? 14 : 11, fontWeight: "700" }}>
        {label}
      </Text>
    </Pressable>
  );
}

// ===========================================================================
// WEB STYLES (React.CSSProperties objects)
// ===========================================================================

const webContainer: React.CSSProperties = {
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

const webJoystickBase: React.CSSProperties = {
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

const webJoystickKnob: React.CSSProperties = {
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

const webLookZone: React.CSSProperties = {
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

const webFireBtn: React.CSSProperties = {
  ...webBtnBase,
  right: 20,
  bottom: 60,
  width: FIRE_BUTTON_SIZE,
  height: FIRE_BUTTON_SIZE,
  backgroundColor: FRONTIER.fireBtn,
  borderColor: FRONTIER.fireBorder,
  boxShadow: "0 0 12px rgba(139,0,0,0.4), inset 0 0 8px rgba(139,0,0,0.3)",
};

const webSmallBtn: React.CSSProperties = {
  ...webBtnBase,
  width: 44,
  height: 44,
};

const webTinyBtn: React.CSSProperties = {
  ...webBtnBase,
  width: 34,
  height: 34,
  backgroundColor: FRONTIER.weaponBtn,
  borderColor: FRONTIER.weaponBorder,
  borderRadius: 6,
};

const webMenuBtn: React.CSSProperties = {
  ...webBtnBase,
  left: 10,
  top: 10,
  width: 44,
  height: 44,
  backgroundColor: FRONTIER.menuBtn,
  borderColor: FRONTIER.menuBorder,
  borderRadius: 8,
};

const webBtnLabel: React.CSSProperties = {
  color: FRONTIER.text,
  fontSize: 13,
  fontWeight: "bold",
  fontFamily: "'Cabin', sans-serif",
  textTransform: "uppercase",
  letterSpacing: 1,
  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
  pointerEvents: "none",
};

const webBtnLabelSm: React.CSSProperties = { ...webBtnLabel, fontSize: 11 };
const webBtnLabelTiny: React.CSSProperties = { ...webBtnLabel, fontSize: 16, letterSpacing: 0 };

// ===========================================================================
// NATIVE STYLES (React Native ViewStyle)
// ===========================================================================

const rnJoystickBase = {
  width: JOYSTICK_SIZE,
  height: JOYSTICK_SIZE,
  borderRadius: JOYSTICK_SIZE / 2,
  backgroundColor: FRONTIER.baseBg,
  borderWidth: 2,
  borderColor: FRONTIER.baseBorder,
  justifyContent: "center" as const,
  alignItems: "center" as const,
};

const rnJoystickKnob = {
  width: KNOB_SIZE,
  height: KNOB_SIZE,
  borderRadius: KNOB_SIZE / 2,
  backgroundColor: FRONTIER.knobBg,
  borderWidth: 2,
  borderColor: FRONTIER.knobBorder,
};
