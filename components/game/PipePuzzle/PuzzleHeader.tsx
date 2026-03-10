import { Pressable, View } from "react-native";

import { Text } from "@/components/ui";

import {
  AMBER,
  AMBER_BG,
  AMBER_DIM,
  AMBER_GLOW,
  MONO_FONT,
  SOLVED_GREEN,
  TERMINAL_BORDER,
} from "./constants.ts";

export function PuzzleHeader({
  title,
  subtitle,
  solved,
  onClose,
}: {
  title: string;
  subtitle: string | null;
  solved: boolean;
  onClose: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: TERMINAL_BORDER,
        paddingBottom: 10,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: AMBER,
            fontSize: 16,
            fontWeight: "700",
            fontFamily: MONO_FONT,
            textShadowColor: AMBER_GLOW,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 6,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              color: AMBER_DIM,
              fontSize: 11,
              fontFamily: MONO_FONT,
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      <Pressable onPress={onClose}>
        <Text
          style={{
            color: AMBER_DIM,
            fontSize: 12,
            fontFamily: MONO_FONT,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          {solved ? "[DONE]" : "[ESC]"}
        </Text>
      </Pressable>
    </View>
  );
}

export function PuzzleStatusBar({
  solved,
  moveCount,
  formattedTime,
  isLockpick,
  lockpickCount,
}: {
  solved: boolean;
  moveCount: number;
  formattedTime: string;
  isLockpick: boolean;
  lockpickCount: number;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <View
        style={{
          backgroundColor: solved ? "rgba(74, 222, 128, 0.15)" : AMBER_BG,
          borderWidth: 1,
          borderColor: solved ? "rgba(74, 222, 128, 0.4)" : TERMINAL_BORDER,
          borderRadius: 2,
          paddingHorizontal: 8,
          paddingVertical: 3,
        }}
      >
        <Text
          style={{
            color: solved ? SOLVED_GREEN : AMBER,
            fontSize: 10,
            fontWeight: "700",
            fontFamily: MONO_FONT,
          }}
        >
          {solved ? "UNLOCKED" : "LOCKED"}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <Text
          style={{
            color: AMBER_DIM,
            fontSize: 10,
            fontFamily: MONO_FONT,
          }}
        >
          MOVES:{moveCount}
        </Text>
        <Text
          style={{
            color: AMBER_DIM,
            fontSize: 10,
            fontFamily: MONO_FONT,
          }}
        >
          TIME:{formattedTime}
        </Text>
        {isLockpick && (
          <Text
            style={{
              color: lockpickCount > 0 ? AMBER_DIM : "#EF4444",
              fontSize: 10,
              fontFamily: MONO_FONT,
            }}
          >
            PICKS:{lockpickCount}
          </Text>
        )}
      </View>
    </View>
  );
}
