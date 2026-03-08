/**
 * InteractionPrompt - Bottom-center overlay showing available interactions
 *
 * Displays a context-sensitive prompt when the player is near an interactable
 * entity (NPC, building door, item). Uses Reanimated for fade in/out animation
 * and frontier-themed styling consistent with DialogueBox and GameHUD.
 *
 * @module components/game/InteractionPrompt
 */

import * as React from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import type { InteractionTarget, InteractionType } from '@/src/game/systems/InteractionSystem';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Map interaction type to a verb for the prompt text. */
const ACTION_VERBS: Record<InteractionType, string> = {
  talk: 'talk to',
  shop: 'trade with',
  enter: 'enter',
  pickup: 'pick up',
};

/** Map interaction type to a key icon/label for the prompt. */
const ACTION_KEYS: Record<InteractionType, string> = {
  talk: 'E',
  shop: 'E',
  enter: 'E',
  pickup: 'E',
};

/** Map interaction type to a subtle indicator icon. */
const ACTION_ICONS: Record<InteractionType, string> = {
  talk: '\u2767', // Rotated floral heart (decorative)
  shop: '\u2696', // Scales (trade)
  enter: '\u25B6', // Right-pointing triangle (enter)
  pickup: '\u2B06', // Upwards arrow (pick up)
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Pulsing key badge (E key indicator). */
function KeyBadge({ keyLabel }: { keyLabel: string }) {
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1, // infinite
      true,
    );
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 28,
          height: 28,
          borderRadius: 6,
          borderWidth: 1.5,
          borderColor: '#f59e0b', // amber-500
          backgroundColor: 'rgba(120, 53, 15, 0.6)', // amber-900/60
          alignItems: 'center',
          justifyContent: 'center',
        },
        animatedStyle,
      ]}
    >
      <Text
        style={{
          color: '#fbbf24', // amber-400
          fontSize: 13,
          fontWeight: '700',
          fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
        }}
      >
        {keyLabel}
      </Text>
    </Animated.View>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface InteractionPromptProps {
  /** The current interaction target, or null when nothing is in range. */
  target: InteractionTarget | null;
}

export function InteractionPrompt({ target }: InteractionPromptProps) {
  const insets = useSafeAreaInsets();

  if (!target) return null;

  const verb = ACTION_VERBS[target.type];
  const keyLabel = ACTION_KEYS[target.type];
  const icon = ACTION_ICONS[target.type];

  return (
    <View
      className="absolute inset-x-0 z-40 items-center"
      style={{ bottom: Math.max(insets.bottom, 16) + 16 }}
      pointerEvents="none"
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: 'rgba(217, 119, 6, 0.4)', // amber-600/40
          backgroundColor: 'rgba(30, 20, 15, 0.85)', // dark brown/85
        }}
      >
        {/* Key badge */}
        <KeyBadge keyLabel={keyLabel} />

        {/* Prompt text */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text
            style={{
              color: '#d97706', // amber-600
              fontSize: 12,
            }}
          >
            {icon}
          </Text>
          <Text
            style={{
              color: '#fbbf24', // amber-400
              fontSize: 13,
              fontWeight: '500',
            }}
          >
            Press{' '}
            <Text
              style={{
                color: '#f59e0b', // amber-500
                fontWeight: '700',
                fontFamily: Platform.select({
                  ios: 'Menlo',
                  android: 'monospace',
                  default: 'monospace',
                }),
              }}
            >
              {keyLabel}
            </Text>
            {' '}to {verb}{' '}
            <Text
              style={{
                color: '#fef3c7', // amber-50
                fontWeight: '600',
              }}
            >
              {target.name}
            </Text>
          </Text>
        </View>

        {/* Distance indicator (subtle) */}
        <Text
          style={{
            color: 'rgba(217, 119, 6, 0.4)', // amber-600/40
            fontSize: 10,
            fontFamily: Platform.select({
              ios: 'Menlo',
              android: 'monospace',
              default: 'monospace',
            }),
          }}
        >
          {target.distance.toFixed(1)}m
        </Text>
      </Animated.View>
    </View>
  );
}
