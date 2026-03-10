/**
 * GameOverScreen - Death screen with stats summary and respawn options.
 *
 * Wired:
 *  - Respawn: reset health to 50%, deduct 10% gold, teleport to last town, notify
 *  - Load Save: opens save slot picker, loads selected save
 *  - Return to Title: resets to title phase
 */

import * as React from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Button, Card, CardContent, Text } from "@/components/ui";
import { formatPlayTime, formatTimestamp } from "@/src/game/store/saveManager";
import { gameStore } from "@/src/game/store/webGameStore";
import type { SaveSlotMeta } from "@/src/game/systems/SaveSystem";
import { rngTick, scopedRNG } from "../../src/game/lib/prng.ts";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text variant="small" className="text-red-300/70">
        {label}
      </Text>
      <Text variant="small" className="font-semibold text-red-200">
        {value}
      </Text>
    </View>
  );
}

function DustParticle({
  left,
  delay,
  duration,
}: {
  left: number;
  delay: number;
  duration: number;
}) {
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-400, {
        duration: duration * 1000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [duration, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: 0.15 + scopedRNG("ui", 42, rngTick()) * 0.15,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: `${left}%`,
          bottom: -20,
          width: 2,
          height: 2,
          borderRadius: 1,
          backgroundColor: "#dc2626",
        },
        animatedStyle,
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// Save Slot Row (for load picker)
// ---------------------------------------------------------------------------

function SaveSlotRow({ slot, onPress }: { slot: SaveSlotMeta; onPress: () => void }) {
  const label = slot.isAutoSave
    ? "Auto Save"
    : slot.isQuickSave
      ? "Quick Save"
      : `Slot: ${slot.slotId}`;

  return (
    <Pressable
      className="rounded-lg border border-red-800/40 bg-red-950/40 px-4 py-3 active:bg-red-950/60"
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 gap-0.5">
          <Text variant="small" className="font-semibold text-red-100">
            {label}
          </Text>
          <Text variant="caption" className="text-red-300/70">
            {slot.playerName} - Lv.{slot.playerLevel ?? 1} - {slot.location}
          </Text>
        </View>
        <View className="items-end gap-0.5">
          <Text variant="caption" className="text-red-300/60">
            {formatTimestamp(slot.timestamp)}
          </Text>
          <Text variant="caption" className="text-red-300/60">
            {formatPlayTime(slot.playTime)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Constants for dust effect
// ---------------------------------------------------------------------------

const DUST_PARTICLES = Array.from({ length: 20 }, () => ({
  left: scopedRNG("ui", 42, rngTick()) * 100,
  delay: scopedRNG("ui", 42, rngTick()) * 2,
  duration: 4 + scopedRNG("ui", 42, rngTick()) * 3,
}));

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function GameOverScreen() {
  const phase = gameStore((s) => s.phase);
  const playerName = gameStore((s) => s.playerName);
  const playerStats = gameStore((s) => s.playerStats);
  const playTime = gameStore((s) => s.playTime);
  const completedQuestIds = gameStore((s) => s.completedQuestIds);
  const currentLocationId = gameStore((s) => s.currentLocationId);
  const loadedWorld = gameStore((s) => s.loadedWorld);
  const heal = gameStore((s) => s.heal);
  const addGold = gameStore((s) => s.addGold);
  const setPhase = gameStore((s) => s.setPhase);
  const resetGame = gameStore((s) => s.resetGame);
  const addNotification = gameStore((s) => s.addNotification);
  const loadFromSlot = gameStore((s) => s.loadFromSlot);
  const getSaveSlots = gameStore((s) => s.getSaveSlots);

  const isVisible = phase === "game_over";

  const [showLoadPicker, setShowLoadPicker] = React.useState(false);
  const [slots, setSlots] = React.useState<SaveSlotMeta[]>([]);

  // Load slots when picker is opened
  React.useEffect(() => {
    if (showLoadPicker) {
      getSaveSlots().then(setSlots);
    }
  }, [showLoadPicker, getSaveSlots]);

  // Derive town name for respawn notification
  const townName = React.useMemo(() => {
    if (!currentLocationId || !loadedWorld) return "the last town";
    const loc = (loadedWorld as any)?.locations?.get?.(currentLocationId);
    return loc?.ref?.name ?? currentLocationId.replace(/_/g, " ");
  }, [currentLocationId, loadedWorld]);

  const handleRespawn = React.useCallback(() => {
    // Reset health to 50% max
    const halfHealth = Math.floor(playerStats.maxHealth * 0.5);
    heal(halfHealth);

    // Deduct 10% gold as death penalty (minimum 0)
    const goldPenalty = Math.floor(playerStats.gold * 0.1);
    if (goldPenalty > 0) {
      addGold(-goldPenalty);
    }

    // Set phase back to playing (player stays at currentLocationId which is their last town)
    setPhase("playing");

    // Notify
    addNotification("info", `You have been revived at ${townName}. Lost ${goldPenalty} gold.`);
  }, [heal, playerStats.maxHealth, playerStats.gold, addGold, setPhase, addNotification, townName]);

  const handleLoadSave = React.useCallback(() => {
    setShowLoadPicker(true);
  }, []);

  const handleLoadFromSlot = React.useCallback(
    async (slotId: string) => {
      const success = await loadFromSlot(slotId);
      if (success) {
        setShowLoadPicker(false);
      }
    },
    [loadFromSlot],
  );

  const handleReturnToTitle = React.useCallback(() => {
    resetGame();
  }, [resetGame]);

  // Format play time
  const formattedTime = React.useMemo(() => {
    const totalSeconds = Math.floor(playTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m ${totalSeconds % 60}s`;
  }, [playTime]);

  if (!isVisible) return null;

  return (
    <Modal transparent visible={isVisible} animationType="none">
      <Animated.View
        entering={FadeIn.duration(800)}
        className="absolute inset-0 flex-1 items-center justify-center"
        style={{ backgroundColor: "rgba(127, 29, 29, 0.85)" }}
      >
        {/* Dust particles */}
        {DUST_PARTICLES.map((p, i) => (
          <DustParticle key={i} {...p} />
        ))}

        <View className="mx-6 w-full max-w-sm items-center gap-8">
          {/* Title */}
          <Animated.View entering={FadeInDown.duration(600).delay(300)}>
            <Text
              variant="h1"
              className="text-center text-red-100"
              style={{
                textShadowColor: "rgba(0,0,0,0.8)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 8,
              }}
            >
              You Have Fallen
            </Text>
          </Animated.View>

          {/* Death message */}
          <Animated.View entering={FadeInUp.duration(500).delay(600)}>
            <Text variant="body" className="text-center text-red-200/80">
              The frontier has claimed another soul.{"\n"}
              {playerName ? `Rest in peace, ${playerName}.` : "Rest in peace, stranger."}
            </Text>
          </Animated.View>

          {/* Stats */}
          <Animated.View entering={FadeInUp.duration(500).delay(900)} className="w-full">
            <Card className="border-red-800/50 bg-red-950/60">
              <CardContent className="gap-1 px-5 py-4">
                <Text
                  variant="label"
                  className="mb-2 text-center text-red-300/60 uppercase tracking-widest"
                >
                  Final Record
                </Text>
                <StatRow label="Level Reached" value={playerStats.level} />
                <StatRow label="Gold Earned" value={playerStats.gold} />
                <StatRow label="Quests Completed" value={completedQuestIds.length} />
                <StatRow label="Time Survived" value={formattedTime} />
              </CardContent>
            </Card>
          </Animated.View>

          {/* Actions */}
          <Animated.View entering={FadeInUp.duration(500).delay(1200)} className="w-full gap-3">
            {showLoadPicker ? (
              <>
                <ScrollView style={{ maxHeight: 200 }} className="gap-2">
                  {slots.length === 0 ? (
                    <Text variant="small" className="text-center text-red-300/60 py-4">
                      No save files found.
                    </Text>
                  ) : (
                    <View className="gap-2">
                      {slots.map((slot) => (
                        <SaveSlotRow
                          key={slot.slotId}
                          slot={slot}
                          onPress={() => handleLoadFromSlot(slot.slotId)}
                        />
                      ))}
                    </View>
                  )}
                </ScrollView>
                <Button variant="ghost" onPress={() => setShowLoadPicker(false)}>
                  <Text className="text-red-300">Back</Text>
                </Button>
              </>
            ) : (
              <>
                <Button variant="primary" onPress={handleRespawn}>
                  <Text>Respawn at Last Town</Text>
                </Button>
                <Button variant="secondary" onPress={handleLoadSave}>
                  <Text>Load Last Save</Text>
                </Button>
                <Button variant="ghost" onPress={handleReturnToTitle}>
                  <Text className="text-red-300">Return to Title</Text>
                </Button>
              </>
            )}
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
}
