/**
 * NotificationFeed - Toast-style notifications rendered at the top of the screen.
 *
 * Ported from legacy/angular-ui/notification-feed.component.ts
 *
 * Uses react-native-reanimated for enter/exit animations and connects
 * to the uiSlice notifications array via the game store.
 */

import * as React from "react";
import { Pressable, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp, Layout } from "react-native-reanimated";
import { Text } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Notification } from "@/src/game/store/types";
import { gameStore } from "@/src/game/store/webGameStore";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum visible toasts at once (rest are queued in store). */
const MAX_VISIBLE = 3;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type NotificationType = Notification["type"];

interface NotificationStyle {
  bg: string;
  border: string;
  textColor: string;
  icon: string;
}

function getNotificationStyle(type: NotificationType): NotificationStyle {
  switch (type) {
    case "item":
      return {
        bg: "bg-amber-900/90",
        border: "border-amber-600/50",
        textColor: "text-amber-200",
        icon: "\u{1F4E6}", // package
      };
    case "xp":
      return {
        bg: "bg-purple-900/90",
        border: "border-purple-600/50",
        textColor: "text-purple-200",
        icon: "\u{2B50}", // star
      };
    case "quest":
      return {
        bg: "bg-yellow-900/90",
        border: "border-yellow-600/50",
        textColor: "text-yellow-200",
        icon: "\u{1F4DC}", // scroll
      };
    case "level":
      return {
        bg: "bg-green-900/90",
        border: "border-green-600/50",
        textColor: "text-green-200",
        icon: "\u{2B06}", // up arrow
      };
    case "warning":
      return {
        bg: "bg-red-900/90",
        border: "border-red-600/50",
        textColor: "text-red-200",
        icon: "\u{26A0}", // warning
      };
    case "info":
    default:
      return {
        bg: "bg-slate-800/90",
        border: "border-slate-600/50",
        textColor: "text-slate-200",
        icon: "\u{2139}", // info
      };
  }
}

// ---------------------------------------------------------------------------
// Toast Item
// ---------------------------------------------------------------------------

function Toast({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: (id: string) => void;
}) {
  const style = getNotificationStyle(notification.type);

  return (
    <Animated.View
      entering={FadeInUp.duration(200).springify()}
      exiting={FadeOutUp.duration(180)}
      layout={Layout.springify()}
    >
      <Pressable
        className={cn(
          "flex-row items-center gap-2.5 rounded-lg border px-4 py-2.5 shadow-lg",
          style.bg,
          style.border,
        )}
        onPress={() => onDismiss(notification.id)}
      >
        <Text className="text-base">{style.icon}</Text>
        <Text variant="small" className={cn("flex-1", style.textColor)}>
          {notification.message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function NotificationFeed() {
  const notifications = gameStore((s) => s.notifications);
  const removeNotification = gameStore((s) => s.removeNotification);

  // Only show the most recent MAX_VISIBLE notifications
  const visible = notifications.slice(0, MAX_VISIBLE);

  if (visible.length === 0) return null;

  return (
    <View
      className="absolute left-4 right-4 top-14 z-50 items-center gap-2"
      pointerEvents="box-none"
    >
      {visible.map((n) => (
        <Toast key={n.id} notification={n} onDismiss={removeNotification} />
      ))}
    </View>
  );
}
