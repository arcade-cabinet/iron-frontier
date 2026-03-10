/**
 * QuestNotification — Slide-in quest update toasts in the upper-RIGHT corner.
 *
 * Shows quest updates like:
 *   "Quest Updated: The Inheritance"
 *   "Objective Complete: Find the burned building"
 *
 * Slides in from the right, stays 4 seconds, fades out. Queue system handles
 * multiple simultaneous notifications without overlap.
 *
 * Uses an imperative API (QuestNotification.show) for the quest system to
 * push updates without coupling to React render cycles.
 *
 * @module components/game/QuestNotification
 */

import * as React from "react";
import { Platform, View } from "react-native";
import Animated, { FadeOut, LinearTransition, SlideInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";

// ============================================================================
// CONSTANTS
// ============================================================================

const HUD_AMBER = "#D4A855";
const HUD_AMBER_DIM = "#C4963F";
const HUD_TEXT = "#E8D5A8";
const HUD_BG = "rgba(20, 15, 10, 0.8)";

const DISPLAY_DURATION_MS = 4000;
const MAX_VISIBLE = 3;

const MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

// ============================================================================
// TYPES
// ============================================================================

export type QuestNotificationType =
  | "quest_started"
  | "quest_updated"
  | "quest_completed"
  | "quest_failed"
  | "objective_complete";

interface QuestToast {
  id: number;
  type: QuestNotificationType;
  title: string;
  detail?: string;
  createdAt: number;
}

// ============================================================================
// STYLE MAP
// ============================================================================

const TYPE_LABELS: Record<QuestNotificationType, { label: string; color: string }> = {
  quest_started: { label: "Quest Started", color: HUD_AMBER },
  quest_updated: { label: "Quest Updated", color: HUD_AMBER },
  quest_completed: { label: "Quest Completed", color: "#9DC183" }, // sage
  quest_failed: { label: "Quest Failed", color: "#CC4444" },
  objective_complete: { label: "Objective Complete", color: HUD_AMBER_DIM },
};

// ============================================================================
// TOAST ITEM
// ============================================================================

interface ToastItemProps {
  toast: QuestToast;
}

const ToastItem = React.memo(function ToastItem({ toast }: ToastItemProps) {
  const typeStyle = TYPE_LABELS[toast.type];

  return (
    <Animated.View
      entering={SlideInRight.duration(300).springify()}
      exiting={FadeOut.duration(400)}
      layout={LinearTransition.springify()}
      style={{
        flexDirection: "column",
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: HUD_BG,
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: typeStyle.color,
        maxWidth: 260,
        marginBottom: 6,
      }}
    >
      {/* Type label */}
      <Text
        style={{
          color: typeStyle.color,
          fontSize: 9,
          fontWeight: "700",
          fontFamily: MONO_FONT,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {typeStyle.label}
      </Text>

      {/* Quest title */}
      <Text
        style={{
          color: HUD_TEXT,
          fontSize: 12,
          fontWeight: "600",
          marginTop: 2,
        }}
        numberOfLines={1}
      >
        {toast.title}
      </Text>

      {/* Detail text */}
      {toast.detail ? (
        <Text
          style={{
            color: HUD_AMBER_DIM,
            fontSize: 10,
            marginTop: 2,
            opacity: 0.8,
          }}
          numberOfLines={2}
        >
          {toast.detail}
        </Text>
      ) : null}
    </Animated.View>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

let _nextId = 0;
type ShowFn = (type: QuestNotificationType, title: string, detail?: string) => void;
let _showFn: ShowFn | null = null;

export function QuestNotification() {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = React.useState<QuestToast[]>([]);

  // Auto-remove toasts after duration
  React.useEffect(() => {
    if (toasts.length === 0) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      setToasts((prev) => prev.filter((t) => now - t.createdAt < DISPLAY_DURATION_MS));
    }, 500);

    return () => clearInterval(intervalId);
  }, [toasts.length]);

  const show = React.useCallback((type: QuestNotificationType, title: string, detail?: string) => {
    const id = _nextId++;
    setToasts((prev) => {
      const next = [...prev, { id, type, title, detail, createdAt: Date.now() }];
      return next.length > MAX_VISIBLE ? next.slice(-MAX_VISIBLE) : next;
    });
  }, []);

  // Register imperative API
  React.useEffect(() => {
    _showFn = show;
    return () => {
      _showFn = null;
    };
  }, [show]);

  if (toasts.length === 0) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: Math.max(insets.top, 8) + 44,
        right: Math.max(insets.right, 8) + 8,
        alignItems: "flex-end",
      }}
      pointerEvents="none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </View>
  );
}

/**
 * Imperative API: show a quest notification toast.
 *
 * @param type - The notification type
 * @param title - Quest/objective title
 * @param detail - Optional detail text
 */
QuestNotification.show = (type: QuestNotificationType, title: string, detail?: string) => {
  _showFn?.(type, title, detail);
};
