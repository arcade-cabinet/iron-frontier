import * as React from "react";
import { Platform, Pressable, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import { gameAudioBridge } from "@/src/game/services/audio/GameAudioBridge";
import { gameStore } from "@/src/game/store";
import type { DialogueState, GameSettings } from "@/src/game/store/types";

// ---------------------------------------------------------------------------
// Color constants
// ---------------------------------------------------------------------------

/** Amber/gold color for NPC names and accents */
const AMBER_GOLD = "#D4A049";
/** Warm border tint for the dialogue panel */
const WARM_BORDER = "#8B6914";
/** Dark panel background with warm tint */
const PANEL_BG = "rgba(28, 22, 16, 0.92)";
/** Text body background — slightly lighter inset */
const TEXT_AREA_BG = "rgba(38, 30, 20, 0.85)";
/** Dialogue body text color */
const BODY_TEXT_COLOR = "#C4A882";
/** Hint/secondary text */
const HINT_COLOR = "#A08060";
/** Decorative rule color */
const RULE_COLOR = "#6B5030";

// ---------------------------------------------------------------------------
// Expression-to-border-color map (React Native style values)
// ---------------------------------------------------------------------------

const EXPRESSION_BORDER_COLORS: Record<string, string> = {
  angry: "#ef4444", // red-500
  happy: "#22c55e", // green-500
  sad: "#3b82f6", // blue-500
  suspicious: "#eab308", // yellow-500
  worried: "#f97316", // orange-500
  threatening: "#dc2626", // red-600
  curious: "#06b6d4", // cyan-500
  friendly: "#10b981", // emerald-500
  serious: "#64748b", // slate-500
  thoughtful: "#a855f7", // purple-500
  shocked: "#ec4899", // pink-500
  determined: "#f59e0b", // amber-500
  eager: "#84cc16", // lime-500
  bitter: "#f43f5e", // rose-500
};

const DEFAULT_BORDER_COLOR = "#d97706"; // amber-600

function getExpressionColor(expression?: string): string {
  if (!expression) return DEFAULT_BORDER_COLOR;
  return EXPRESSION_BORDER_COLORS[expression] ?? DEFAULT_BORDER_COLOR;
}

// ---------------------------------------------------------------------------
// Typewriter hook
// ---------------------------------------------------------------------------

function useTypewriter(text: string, nodeId: string, settings: GameSettings | null) {
  const [displayText, setDisplayText] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [showChoices, setShowChoices] = React.useState(false);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const prevNodeIdRef = React.useRef<string | null>(null);
  const charCountRef = React.useRef(0);

  // Clear all timers
  const clearTimers = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  // Start typing when node changes
  React.useEffect(() => {
    if (prevNodeIdRef.current === nodeId) return;
    prevNodeIdRef.current = nodeId;

    clearTimers();
    setDisplayText("");
    setIsTyping(true);
    setShowChoices(false);
    charCountRef.current = 0;

    const speed = settings?.reducedMotion ? 5 : 25;
    let index = 0;

    intervalRef.current = setInterval(() => {
      if (index < text.length) {
        index += 1;
        charCountRef.current = index;
        setDisplayText(text.slice(0, index));

        // Play typing cadence sound every 3 characters (skip whitespace)
        if (!settings?.reducedMotion && index % 3 === 0 && text[index - 1] !== " ") {
          gameAudioBridge.playSFX("dialogue_advance");
        }
      } else {
        setIsTyping(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = undefined;
        }
        timeoutRef.current = setTimeout(() => {
          setShowChoices(true);
        }, 200);
      }
    }, speed);

    return clearTimers;
  }, [text, nodeId, settings?.reducedMotion, clearTimers]);

  // Cleanup on unmount
  React.useEffect(() => clearTimers, [clearTimers]);

  // Skip to full text
  const skipTyping = React.useCallback(() => {
    if (!isTyping) return;
    clearTimers();
    setDisplayText(text);
    setIsTyping(false);
    timeoutRef.current = setTimeout(() => {
      setShowChoices(true);
    }, 100);
  }, [isTyping, text, clearTimers]);

  // Reset when dialogue closes
  const reset = React.useCallback(() => {
    clearTimers();
    setDisplayText("");
    setIsTyping(false);
    setShowChoices(false);
    prevNodeIdRef.current = null;
    charCountRef.current = 0;
  }, [clearTimers]);

  return { displayText, isTyping, showChoices, skipTyping, reset };
}

// ---------------------------------------------------------------------------
// Choice tag badge
// ---------------------------------------------------------------------------

const TAG_COLORS: Record<string, string> = {
  aggressive: "#f87171", // red-400
  kind: "#4ade80", // green-400
  main_quest: "#facc15", // yellow-400
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

// ---------------------------------------------------------------------------
// Choice button
// ---------------------------------------------------------------------------

interface ChoiceButtonProps {
  choice: DialogueState["choices"][number];
  index: number;
  isSelected: boolean;
  disabled: boolean;
  onSelect: (index: number) => void;
}

function ChoiceButton({ choice, index, isSelected, disabled, onSelect }: ChoiceButtonProps) {
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
        {/* Number prefix */}
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

// ---------------------------------------------------------------------------
// Decorative rule component
// ---------------------------------------------------------------------------

function DecorativeRule({ color = RULE_COLOR }: { color?: string }) {
  return (
    <View className="flex-row items-center px-3" style={{ height: 12 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: color }} />
      <Text
        style={{
          color,
          fontSize: 10,
          marginHorizontal: 8,
          letterSpacing: 4,
        }}
      >
        {"\u2550\u2550\u2550"}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: color }} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// DialogueBox
// ---------------------------------------------------------------------------

export function DialogueBox() {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [selectedChoiceIndex, setSelectedChoiceIndex] = React.useState<number | null>(null);

  // --- Store selectors ---
  const phase = gameStore((s) => s.phase);
  const dialogueState = gameStore((s) => s.dialogueState);
  const settings = gameStore((s) => s.settings);

  // Stable action references
  const advanceDialogue = gameStore((s) => s.advanceDialogue);
  const selectChoice = gameStore((s) => s.selectChoice);
  const endDialogue = gameStore((s) => s.endDialogue);

  // Derive open state
  const dialogueOpen = phase === "dialogue" && dialogueState != null;

  // Typewriter
  const { displayText, isTyping, showChoices, skipTyping, reset } = useTypewriter(
    dialogueState?.text ?? "",
    dialogueState?.currentNodeId ?? "",
    settings,
  );

  // Reset when dialogue closes
  const prevOpenRef = React.useRef(dialogueOpen);
  React.useEffect(() => {
    if (prevOpenRef.current && !dialogueOpen) {
      reset();
      setSelectedChoiceIndex(null);
    }
    prevOpenRef.current = dialogueOpen;
  }, [dialogueOpen, reset]);

  // --- Derived state ---
  const hasChoices = (dialogueState?.choices?.length ?? 0) > 0;
  const hasAutoAdvance = !!dialogueState?.autoAdvanceNodeId;
  const showChoiceButtons = !isTyping && showChoices && hasChoices;
  const showContinuePrompt = !isTyping && showChoices && !hasChoices && hasAutoAdvance;
  const showClosePrompt = !isTyping && showChoices && !hasChoices && !hasAutoAdvance;

  const expressionColor = getExpressionColor(dialogueState?.npcExpression);

  // --- Handlers ---
  const handleChoiceSelect = React.useCallback(
    (index: number) => {
      setSelectedChoiceIndex(index);
      // Play UI click sound for choice selection
      gameAudioBridge.playSFX("dialogue_advance");
      // Small delay before advancing so the user sees their selection highlight
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
    if (isTyping) {
      skipTyping();
    }
  }, [isTyping, skipTyping]);

  // --- Bail early ---
  if (!dialogueOpen || !dialogueState) return null;

  const maxHeight = screenHeight * 0.45;

  return (
    <View
      className="absolute inset-0 z-50"
      pointerEvents="box-none"
      accessible={true}
      accessibilityLabel={`Dialogue with ${dialogueState.npcName}`}
    >
      {/* Semi-transparent backdrop — lighter so world context is visible */}
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

      {/* Content anchored to bottom */}
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
          {/* Decorative top border element */}
          <DecorativeRule color={WARM_BORDER} />

          {/* Main container */}
          <View
            className="rounded-lg overflow-hidden"
            style={{
              backgroundColor: PANEL_BG,
              borderWidth: 1.5,
              borderColor: WARM_BORDER,
              borderTopWidth: 0,
            }}
          >
            {/* ---- Header: NPC name with decorative rule ---- */}
            <View className="px-4 pt-3 pb-0">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2 flex-1 min-w-0">
                  {/* NPC avatar placeholder */}
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
                          style={{
                            color: HINT_COLOR,
                            fontStyle: "italic",
                          }}
                        >
                          {dialogueState.npcTitle}
                        </Text>
                      ) : null}
                    </View>

                    {/* Decorative line under name */}
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

                {/* Expression badge + close button */}
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
                    onPress={handleClose}
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

            {/* ---- Body: dialogue text in inset panel ---- */}
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

            {/* ---- Choices ---- */}
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

            {/* ---- Continue prompt ---- */}
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

            {/* ---- End conversation prompt ---- */}
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
