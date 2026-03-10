import { Pressable, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Text } from "@/components/ui";

import {
  AMBER,
  AMBER_BG,
  AMBER_DIM,
  MONO_FONT,
  SOLVED_GREEN,
  TERMINAL_BORDER,
} from "./constants.ts";

export function PuzzleSolvedBanner({
  isLockpick,
  onSuccess,
}: {
  isLockpick: boolean;
  onSuccess: () => void;
}) {
  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <View
        style={{
          backgroundColor: "rgba(74, 222, 128, 0.1)",
          borderWidth: 1,
          borderColor: "rgba(74, 222, 128, 0.3)",
          borderRadius: 2,
          padding: 10,
          marginBottom: 8,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: SOLVED_GREEN,
            fontSize: 12,
            fontWeight: "700",
            fontFamily: MONO_FONT,
            textAlign: "center",
          }}
        >
          {isLockpick ? "LOCK MECHANISM BYPASSED" : "PIPE SYSTEM CONNECTED"}
        </Text>
      </View>
      <Pressable onPress={onSuccess}>
        <View
          style={{
            backgroundColor: "rgba(74, 222, 128, 0.15)",
            borderWidth: 1,
            borderColor: "rgba(74, 222, 128, 0.4)",
            borderRadius: 2,
            paddingVertical: 10,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: SOLVED_GREEN,
              fontSize: 13,
              fontWeight: "700",
              fontFamily: MONO_FONT,
            }}
          >
            {isLockpick ? "[OPEN]" : "[DONE]"}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function PuzzleBottomActions({
  isLockpick,
  canForce,
  forceCost,
  onForceLock,
  onAbandon,
}: {
  isLockpick: boolean;
  canForce: boolean;
  forceCost: number;
  onForceLock: () => void;
  onAbandon: () => void;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          color: AMBER_DIM,
          fontSize: 10,
          fontFamily: MONO_FONT,
          textAlign: "center",
        }}
      >
        TAP PIPES TO ROTATE. CONNECT [IN] TO [OUT].
      </Text>

      {isLockpick && (
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginTop: 4,
          }}
        >
          <Pressable onPress={onForceLock} disabled={!canForce} style={{ flex: 1 }}>
            <View
              style={{
                backgroundColor: canForce ? AMBER_BG : "rgba(100, 80, 50, 0.1)",
                borderWidth: 1,
                borderColor: canForce ? TERMINAL_BORDER : "rgba(100, 80, 50, 0.15)",
                borderRadius: 2,
                paddingVertical: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: canForce ? AMBER : "rgba(139, 115, 53, 0.4)",
                  fontSize: 11,
                  fontWeight: "600",
                  fontFamily: MONO_FONT,
                }}
              >
                FORCE [{forceCost} PICKS]
              </Text>
            </View>
          </Pressable>

          <Pressable onPress={onAbandon} style={{ flex: 1 }}>
            <View
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                borderWidth: 1,
                borderColor: "rgba(239, 68, 68, 0.25)",
                borderRadius: 2,
                paddingVertical: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#EF4444",
                  fontSize: 11,
                  fontWeight: "600",
                  fontFamily: MONO_FONT,
                }}
              >
                GIVE UP [-1 PICK]
              </Text>
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
}
