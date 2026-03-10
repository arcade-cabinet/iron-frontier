// TouchOverlayNative — React Native touch controls with PanResponder.

import * as React from "react";
import { useCallback, useEffect } from "react";
import {
  type GestureResponderEvent,
  PanResponder,
  type PanResponderGestureState,
  Pressable,
  View,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { InputManager } from "@/src/game/input/InputManager";
import type { TouchProvider } from "@/src/game/input/providers/TouchProvider";
import { clearOverlayState, overlayTouchState } from "@/src/game/input/TouchOverlayState";
import {
  BUTTON_SIZE,
  FIRE_BUTTON_SIZE,
  FRONTIER,
  JOYSTICK_SIZE,
  KNOB_SIZE,
  MAX_JOYSTICK_RADIUS,
} from "./constants.ts";

// ---------------------------------------------------------------------------
// Native styles
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// NativeButton
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

// ---------------------------------------------------------------------------
// TouchOverlayNative
// ---------------------------------------------------------------------------

export function TouchOverlayNative({ interactionNearby }: { interactionNearby: boolean }) {
  const [knobOffset, setKnobOffset] = React.useState({ x: 0, y: 0 });

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
