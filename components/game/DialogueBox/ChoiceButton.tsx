import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/Text";
import type { DialogueState } from "@/src/game/store/types";
import { AMBER_GOLD, HINT_COLOR, RULE_COLOR } from "./constants.ts";

const TAG_COLORS: Record<string, string> = {
  aggressive: "#f87171",
  kind: "#4ade80",
  main_quest: "#facc15",
};

function ChoiceTag({ tag }: { tag: string }) {
  const color = TAG_COLORS[tag];
  if (!color) return null;
  const label = `[${tag.charAt(0).toUpperCase()}${tag.slice(1).replace("_", " ")}]`;
  return (
    <Text style={{ color }} className="text-[10px] sm:text-xs">
      {label}
    </Text>
  );
}

interface ChoiceButtonProps {
  choice: DialogueState["choices"][number];
  index: number;
  isSelected: boolean;
  disabled: boolean;
  onSelect: (index: number) => void;
}

export function ChoiceButton({ choice, index, isSelected, disabled, onSelect }: ChoiceButtonProps) {
  const numberPrefix = `[${index + 1}]`;

  return (
    <Pressable
      onPress={() => onSelect(index)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Choice ${index + 1}: ${choice.text}`}
      style={({ pressed }) => ({
        minHeight: 44,
        marginLeft: 12,
        borderWidth: 1,
        borderRadius: 6,
        borderColor: isSelected ? AMBER_GOLD : pressed ? "#B8860B" : RULE_COLOR,
        backgroundColor: isSelected
          ? "rgba(212, 160, 73, 0.25)"
          : pressed
            ? "rgba(212, 160, 73, 0.15)"
            : "rgba(38, 30, 20, 0.6)",
        paddingHorizontal: 10,
        paddingVertical: 8,
      })}
    >
      <View className="flex-row items-start gap-2">
        <Text
          style={{
            color: isSelected ? AMBER_GOLD : HINT_COLOR,
            fontVariant: ["tabular-nums"],
            fontSize: 13,
            lineHeight: 20,
            letterSpacing: 0.5,
          }}
        >
          {numberPrefix}
        </Text>
        <View className="flex-1">
          <Text
            className="text-xs sm:text-sm flex-1"
            style={{
              color: isSelected ? "#fef3c7" : "#E8D5B5",
              lineHeight: 20,
              letterSpacing: 0.3,
            }}
          >
            {choice.text}
          </Text>

          {choice.hint ? (
            <Text
              className="text-[10px] sm:text-xs mt-1"
              style={{ color: HINT_COLOR, fontStyle: "italic" }}
            >
              {choice.hint}
            </Text>
          ) : null}

          {choice.tags?.length ? (
            <View className="flex-row flex-wrap gap-1 mt-1">
              {choice.tags.map((tag) => (
                <ChoiceTag key={tag} tag={tag} />
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
