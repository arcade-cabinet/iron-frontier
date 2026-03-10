// TouchOverlayWeb — HTML overlay with raw touch events for multi-touch support.

import type * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import { InputManager } from "@/src/game/input/InputManager";
import type { TouchProvider } from "@/src/game/input/providers/TouchProvider";
import { clearOverlayState, overlayTouchState } from "@/src/game/input/TouchOverlayState";
import {
  FRONTIER,
  JOYSTICK_DEADZONE,
  LOOK_SENSITIVITY_BASE,
  MAX_JOYSTICK_RADIUS,
} from "./constants.ts";
import {
  webBtnLabel,
  webBtnLabelSm,
  webBtnLabelTiny,
  webContainer,
  webFireBtn,
  webJoystickBase,
  webJoystickKnob,
  webLookZone,
  webMenuBtn,
  webSmallBtn,
  webTinyBtn,
} from "./webStyles.ts";

export function TouchOverlayWeb({ interactionNearby }: { interactionNearby: boolean }) {
  const joystickTouchId = useRef<number | null>(null);
  const joystickCenter = useRef({ x: 0, y: 0 });
  const joystickKnobRef = useRef<HTMLDivElement | null>(null);
  const lookTouchId = useRef<number | null>(null);
  const lookLastPos = useRef({ x: 0, y: 0 });

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
      {interactionNearby ? (
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
      ) : null}

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
