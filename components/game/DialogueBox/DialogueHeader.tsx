import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/Text";
import type { DialogueState } from "@/src/game/store/types";
import { AMBER_GOLD, getExpressionColor, HINT_COLOR } from "./constants.ts";

interface DialogueHeaderProps {
  dialogueState: DialogueState;
  onClose: () => void;
}

export function DialogueHeader({ dialogueState, onClose }: DialogueHeaderProps) {
  const expressionColor = getExpressionColor(dialogueState.npcExpression);

  return (
    <View className="px-4 pt-3 pb-0">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2 flex-1 min-w-0">
          <View
            className="w-10 h-10 rounded-full items-center justify-center overflow-hidden"
            style={{
              backgroundColor: "rgba(60, 40, 20, 0.7)",
              borderWidth: 2,
              borderColor: expressionColor,
            }}
          >
            <Text style={{ color: AMBER_GOLD, fontSize: 18 }}>{"\u263A"}</Text>
          </View>

          <View className="flex-col min-w-0 flex-1">
            <View className="flex-row items-baseline gap-2">
              <Text
                className="text-sm sm:text-base font-bold font-heading"
                style={{
                  color: AMBER_GOLD,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
                numberOfLines={1}
              >
                {dialogueState.npcName}
              </Text>
              {dialogueState.npcTitle ? (
                <Text
                  className="text-[10px] sm:text-xs font-heading"
                  style={{ color: HINT_COLOR, fontStyle: "italic" }}
                >
                  {dialogueState.npcTitle}
                </Text>
              ) : null}
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: AMBER_GOLD,
                opacity: 0.4,
                marginTop: 3,
                width: "80%",
              }}
            />

            {dialogueState.speaker && dialogueState.speaker !== dialogueState.npcName ? (
              <Text
                className="text-[10px] sm:text-xs mt-1"
                style={{ color: HINT_COLOR }}
                numberOfLines={1}
              >
                Speaking: {dialogueState.speaker}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="flex-row items-center gap-2 flex-shrink-0">
          {dialogueState.npcExpression ? (
            <View
              className="rounded px-2 py-0.5"
              style={{
                borderWidth: 1,
                borderColor: expressionColor,
                backgroundColor: "rgba(0,0,0,0.3)",
              }}
            >
              <Text
                className="text-[10px] sm:text-xs capitalize"
                style={{ color: expressionColor }}
              >
                {dialogueState.npcExpression}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Close dialogue"
            className="w-8 h-8 items-center justify-center rounded"
            style={({ pressed }) => ({
              backgroundColor: pressed ? "rgba(212,160,73,0.2)" : "transparent",
            })}
          >
            <Text style={{ color: HINT_COLOR, fontSize: 16 }}>{"\u2715"}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
