import * as React from 'react';
import { Platform, Pressable, useWindowDimensions, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { gameStore } from '@/src/game/store';
import type { DialogueState, GameSettings } from '@/src/game/store/types';

// ---------------------------------------------------------------------------
// Expression-to-border-color map (React Native style values)
// ---------------------------------------------------------------------------

const EXPRESSION_BORDER_COLORS: Record<string, string> = {
  angry: '#ef4444', // red-500
  happy: '#22c55e', // green-500
  sad: '#3b82f6', // blue-500
  suspicious: '#eab308', // yellow-500
  worried: '#f97316', // orange-500
  threatening: '#dc2626', // red-600
  curious: '#06b6d4', // cyan-500
  friendly: '#10b981', // emerald-500
  serious: '#64748b', // slate-500
  thoughtful: '#a855f7', // purple-500
  shocked: '#ec4899', // pink-500
  determined: '#f59e0b', // amber-500
  eager: '#84cc16', // lime-500
  bitter: '#f43f5e', // rose-500
};

const DEFAULT_BORDER_COLOR = '#d97706'; // amber-600

function getExpressionColor(expression?: string): string {
  if (!expression) return DEFAULT_BORDER_COLOR;
  return EXPRESSION_BORDER_COLORS[expression] ?? DEFAULT_BORDER_COLOR;
}

// ---------------------------------------------------------------------------
// Typewriter hook
// ---------------------------------------------------------------------------

function useTypewriter(
  text: string,
  nodeId: string,
  settings: GameSettings | null,
) {
  const [displayText, setDisplayText] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [showChoices, setShowChoices] = React.useState(false);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const prevNodeIdRef = React.useRef<string | null>(null);

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
    setDisplayText('');
    setIsTyping(true);
    setShowChoices(false);

    const speed = settings?.reducedMotion ? 5 : 25;
    let index = 0;

    intervalRef.current = setInterval(() => {
      if (index < text.length) {
        index += 1;
        setDisplayText(text.slice(0, index));
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
    setDisplayText('');
    setIsTyping(false);
    setShowChoices(false);
    prevNodeIdRef.current = null;
  }, [clearTimers]);

  return { displayText, isTyping, showChoices, skipTyping, reset };
}

// ---------------------------------------------------------------------------
// Choice tag badge
// ---------------------------------------------------------------------------

const TAG_COLORS: Record<string, string> = {
  aggressive: '#f87171', // red-400
  kind: '#4ade80', // green-400
  main_quest: '#facc15', // yellow-400
};

function ChoiceTag({ tag }: { tag: string }) {
  const color = TAG_COLORS[tag];
  if (!color) return null;
  const label = `[${tag.charAt(0).toUpperCase()}${tag.slice(1).replace('_', ' ')}]`;
  return (
    <Text
      style={{ color }}
      className="text-[10px] sm:text-xs"
    >
      {label}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Choice button
// ---------------------------------------------------------------------------

interface ChoiceButtonProps {
  choice: DialogueState['choices'][number];
  index: number;
  isSelected: boolean;
  disabled: boolean;
  onSelect: (index: number) => void;
}

function ChoiceButton({
  choice,
  index,
  isSelected,
  disabled,
  onSelect,
}: ChoiceButtonProps) {
  return (
    <Pressable
      onPress={() => onSelect(index)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={choice.text}
      className={[
        'w-full rounded-lg border p-2 sm:p-2.5',
        isSelected
          ? 'border-amber-500 bg-amber-700/50'
          : 'border-amber-700/50 bg-amber-900/30 active:bg-amber-800/40',
      ].join(' ')}
      style={{ minHeight: 44 }}
    >
      <View className="flex-row items-center gap-2">
        {/* Chevron icon */}
        <Text
          style={{ color: isSelected ? '#fbbf24' : '#d97706' }}
          className="text-sm"
        >
          {'\u203A'}
        </Text>
        <Text
          className="text-xs sm:text-sm flex-1"
          style={{ color: isSelected ? '#fef3c7' : '#fde68a' }}
        >
          {choice.text}
        </Text>
      </View>

      {choice.hint ? (
        <Text className="text-[10px] sm:text-xs mt-1 ml-6" style={{ color: '#f59e0b' }}>
          {choice.hint}
        </Text>
      ) : null}

      {choice.tags?.length ? (
        <View className="flex-row flex-wrap gap-1 mt-1 ml-6">
          {choice.tags.map((tag) => (
            <ChoiceTag key={tag} tag={tag} />
          ))}
        </View>
      ) : null}
    </Pressable>
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
  const dialogueOpen = phase === 'dialogue' && dialogueState != null;

  // Typewriter
  const {
    displayText,
    isTyping,
    showChoices,
    skipTyping,
    reset,
  } = useTypewriter(
    dialogueState?.text ?? '',
    dialogueState?.currentNodeId ?? '',
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

  const maxHeight = screenHeight * 0.4;

  return (
    <View
      className="absolute inset-x-0 bottom-0 z-50"
      pointerEvents="box-none"
      accessible={true}
      accessibilityLabel={`Dialogue with ${dialogueState.npcName}`}
    >
      <Animated.View
        entering={
          Platform.OS !== 'web'
            ? SlideInDown.duration(200).springify().damping(18)
            : FadeIn.duration(200)
        }
        exiting={
          Platform.OS !== 'web'
            ? SlideOutDown.duration(180)
            : FadeOut.duration(150)
        }
        style={{ maxHeight, marginBottom: Math.max(insets.bottom, 16) }}
        className="mx-2 sm:mx-3"
      >
        {/* Main container */}
        <View
          className="rounded-lg overflow-hidden"
          style={{
            backgroundColor: 'rgba(44, 53, 57, 0.95)', // frontier.gunmetal @ 95%
            borderWidth: 2,
            borderColor: expressionColor,
          }}
        >
          {/* ---- Header: NPC name, expression, close button ---- */}
          <View className="px-3 pt-3 pb-1 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2 flex-1 min-w-0">
              {/* NPC avatar placeholder */}
              <View
                className="w-10 h-10 rounded-full items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: 'rgba(120, 53, 15, 0.5)', // amber-900/50
                  borderWidth: 2,
                  borderColor: expressionColor,
                }}
              >
                <Text style={{ color: '#fbbf24', fontSize: 18 }}>{'\u263A'}</Text>
              </View>

              <View className="flex-col min-w-0 flex-1">
                <View className="flex-row items-center gap-1">
                  {dialogueState.npcTitle ? (
                    <Text
                      className="text-xs sm:text-sm font-heading"
                      style={{ color: '#f59e0b' }}
                    >
                      {dialogueState.npcTitle}
                    </Text>
                  ) : null}
                  <Text
                    className="text-sm sm:text-base font-semibold font-heading"
                    style={{ color: '#fbbf24' }}
                    numberOfLines={1}
                  >
                    {dialogueState.npcName}
                  </Text>
                </View>

                {dialogueState.speaker &&
                dialogueState.speaker !== dialogueState.npcName ? (
                  <Text
                    className="text-[10px] sm:text-xs"
                    style={{ color: '#f59e0b' }}
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
                  style={{ borderWidth: 1, borderColor: expressionColor }}
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
              >
                <Text style={{ color: '#f59e0b', fontSize: 18 }}>{'\u2715'}</Text>
              </Pressable>
            </View>
          </View>

          {/* ---- Body: dialogue text ---- */}
          <Pressable
            onPress={handleTextPress}
            className="px-3 pt-1 pb-2 sm:pt-2 sm:pb-3"
          >
            <Text
              className="text-xs sm:text-sm font-body leading-relaxed"
              style={{ color: '#C4A882', minHeight: 50 }} // frontier.dust
            >
              {displayText}
              {isTyping ? (
                <Text
                  className="text-sm"
                  style={{ color: '#fbbf24', opacity: 0.7 }}
                >
                  |
                </Text>
              ) : null}
            </Text>

            {isTyping ? (
              <Text
                className="text-[10px] sm:text-xs mt-1.5 text-right"
                style={{ color: '#f59e0b' }}
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
                className="w-full rounded-lg border border-amber-600 bg-amber-700/50 active:bg-amber-600/50 items-center justify-center flex-row"
                style={{ minHeight: 44 }}
              >
                <Text
                  className="text-sm font-body"
                  style={{ color: '#fef3c7' }}
                >
                  Continue {'\u203A'}
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
                className="w-full rounded-lg border border-amber-600 active:bg-amber-900/30 items-center justify-center"
                style={{ minHeight: 44 }}
              >
                <Text
                  className="text-sm font-body"
                  style={{ color: '#fbbf24' }}
                >
                  End Conversation
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}
