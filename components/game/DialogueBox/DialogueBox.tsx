import * as React from "react";
import { Platform, Pressable, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import { gameAudioBridge } from "@/src/game/services/audio/GameAudioBridge";
import { gameStore } from "@/src/game/store";
import { ChoiceButton } from "./ChoiceButton.tsx";
import {
  AMBER_GOLD,
  BODY_TEXT_COLOR,
  HINT_COLOR,
  PANEL_BG,
  RULE_COLOR,
  TEXT_AREA_BG,
  WARM_BORDER,
} from "./constants.ts";
import { DialogueHeader } from "./DialogueHeader.tsx";
import { useTypewriter } from "./useTypewriter.ts";

function DecorativeRule({ color = RULE_COLOR }: { color?: string }) {
  return (
    <View className="flex-row items-center px-3" style={{ height: 12 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: color }} />
      <Text style={{ color, fontSize: 10, marginHorizontal: 8, letterSpacing: 4 }}>
        {"\u2550\u2550\u2550"}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: color }} />
    </View>
  );
}

export function DialogueBox() {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [selectedChoiceIndex, setSelectedChoiceIndex] = React.useState<number | null>(null);

  const phase = gameStore((s) => s.phase);
  const dialogueState = gameStore((s) => s.dialogueState);
  const settings = gameStore((s) => s.settings);

  const advanceDialogue = gameStore((s) => s.advanceDialogue);
  const selectChoice = gameStore((s) => s.selectChoice);
  const endDialogue = gameStore((s) => s.endDialogue);

  const dialogueOpen = phase === "dialogue" && dialogueState != null;

  const { displayText, isTyping, showChoices, skipTyping, reset } = useTypewriter(
    dialogueState?.text ?? "",
    dialogueState?.currentNodeId ?? "",
    settings,
  );

  const prevOpenRef = React.useRef(dialogueOpen);
  React.useEffect(() => {
    if (prevOpenRef.current && !dialogueOpen) {
      reset();
      setSelectedChoiceIndex(null);
    }
    prevOpenRef.current = dialogueOpen;
  }, [dialogueOpen, reset]);

  const hasChoices = (dialogueState?.choices?.length ?? 0) > 0;
  const hasAutoAdvance = !!dialogueState?.autoAdvanceNodeId;
  const showChoiceButtons = !isTyping && showChoices && hasChoices;
  const showContinuePrompt = !isTyping && showChoices && !hasChoices && hasAutoAdvance;
  const showClosePrompt = !isTyping && showChoices && !hasChoices && !hasAutoAdvance;

  const handleChoiceSelect = React.useCallback(
    (index: number) => {
      setSelectedChoiceIndex(index);
      gameAudioBridge.playSFX("dialogue_advance");
      setTimeout(() => {
        selectChoice(index);
        setSelectedChoiceIndex(null);
      }, 150);
    },
    [selectChoice],
  );

  const handleAdvance = React.useCallback(() => {
    if (dialogueState?.autoAdvanceNodeId) {
      advanceDialogue();
    } else {
      endDialogue();
    }
  }, [dialogueState?.autoAdvanceNodeId, advanceDialogue, endDialogue]);

  const handleClose = React.useCallback(() => {
    endDialogue();
  }, [endDialogue]);

  const handleTextPress = React.useCallback(() => {
    if (isTyping) skipTyping();
  }, [isTyping, skipTyping]);

  if (!dialogueOpen || !dialogueState) return null;

  const maxHeight = screenHeight * 0.45;

  return (
    <View
      className="absolute inset-0 z-50"
      pointerEvents="box-none"
      accessible={true}
      accessibilityLabel={`Dialogue with ${dialogueState.npcName}`}
    >
      <Pressable
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
        }}
        onPress={handleTextPress}
        accessibilityRole="none"
      />

      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }} pointerEvents="box-none">
        <Animated.View
          entering={
            Platform.OS !== "web"
              ? SlideInDown.duration(200).springify().damping(18)
              : FadeIn.duration(200)
          }
          exiting={Platform.OS !== "web" ? SlideOutDown.duration(180) : FadeOut.duration(150)}
          style={{ maxHeight, marginBottom: Math.max(insets.bottom, 16) }}
          className="mx-2 sm:mx-3"
        >
          <DecorativeRule color={WARM_BORDER} />

          <View
            className="rounded-lg overflow-hidden"
            style={{
              backgroundColor: PANEL_BG,
              borderWidth: 1.5,
              borderColor: WARM_BORDER,
              borderTopWidth: 0,
            }}
          >
            <DialogueHeader dialogueState={dialogueState} onClose={handleClose} />

            {/* Body */}
            <Pressable
              onPress={handleTextPress}
              className="mx-3 mt-2 mb-2 sm:mt-3 sm:mb-3"
              style={{
                backgroundColor: TEXT_AREA_BG,
                borderWidth: 1,
                borderColor: RULE_COLOR,
                borderRadius: 6,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            >
              <Text
                className="text-xs sm:text-sm font-body"
                style={{
                  color: BODY_TEXT_COLOR,
                  minHeight: 50,
                  lineHeight: 22,
                  letterSpacing: 0.4,
                }}
              >
                {displayText}
                {isTyping ? (
                  <Text className="text-sm" style={{ color: AMBER_GOLD, opacity: 0.8 }}>
                    {"\u2588"}
                  </Text>
                ) : null}
              </Text>
              {isTyping ? (
                <Text
                  className="text-[10px] sm:text-xs mt-2 text-right"
                  style={{ color: HINT_COLOR }}
                >
                  Tap to skip...
                </Text>
              ) : null}
            </Pressable>

            {/* Choices */}
            {showChoiceButtons ? (
              <View className="px-3 pb-3 gap-1.5 sm:gap-2">
                {dialogueState.choices.map((choice, i) => (
                  <ChoiceButton
                    key={`${dialogueState.currentNodeId}-choice-${i}`}
                    choice={choice}
                    index={i}
                    isSelected={selectedChoiceIndex === i}
                    disabled={selectedChoiceIndex !== null}
                    onSelect={handleChoiceSelect}
                  />
                ))}
              </View>
            ) : null}

            {/* Continue */}
            {showContinuePrompt ? (
              <View className="px-3 pb-3">
                <Pressable
                  onPress={handleAdvance}
                  accessibilityRole="button"
                  accessibilityLabel="Continue dialogue"
                  style={({ pressed }) => ({
                    minHeight: 44,
                    borderWidth: 1,
                    borderColor: pressed ? AMBER_GOLD : WARM_BORDER,
                    backgroundColor: pressed ? "rgba(212, 160, 73, 0.2)" : "rgba(38, 30, 20, 0.6)",
                    borderRadius: 6,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                  })}
                >
                  <Text
                    className="text-sm font-body"
                    style={{ color: AMBER_GOLD, letterSpacing: 0.5 }}
                  >
                    Continue {"\u203A"}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {/* End conversation */}
            {showClosePrompt ? (
              <View className="px-3 pb-3">
                <Pressable
                  onPress={handleClose}
                  accessibilityRole="button"
                  accessibilityLabel="End conversation"
                  style={({ pressed }) => ({
                    minHeight: 44,
                    borderWidth: 1,
                    borderColor: pressed ? AMBER_GOLD : RULE_COLOR,
                    backgroundColor: pressed ? "rgba(212, 160, 73, 0.15)" : "transparent",
                    borderRadius: 6,
                    alignItems: "center",
                    justifyContent: "center",
                  })}
                >
                  <Text
                    className="text-sm font-body"
                    style={{ color: HINT_COLOR, letterSpacing: 0.5 }}
                  >
                    End Conversation
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
