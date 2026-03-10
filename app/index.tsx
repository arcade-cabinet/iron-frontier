/**
 * TitleScreen — Main menu with New Game, Continue, Load Game, and Settings.
 *
 * Fallout-style aesthetic: dark background, amber text, atmospheric elements.
 *
 * Flow:
 *   New Game    -> gameOrchestrator.initGame() -> router.push('/game')
 *   Continue    -> gameOrchestrator.continueGame() -> router.push('/game')
 *   Load Game   -> save slot picker -> loadFromSlot() -> router.push('/game')
 *   Settings    -> inline settings modal (volume, haptics, etc.)
 */

import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { gameOrchestrator } from "@/src/game/GameOrchestrator";
import { formatPlayTime, formatTimestamp } from "@/src/game/store/saveManager";
import { gameStore } from "@/src/game/store/webGameStore";
import type { SaveSlotMeta } from "@/src/game/systems/SaveSystem";

// ============================================================================
// TITLE SCREEN
// ============================================================================

export default function TitleScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Loading...");
  const [hasSave, setHasSave] = useState(false);
  const [showLoadPicker, setShowLoadPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [slots, setSlots] = useState<SaveSlotMeta[]>([]);

  // Check for existing save on mount
  useEffect(() => {
    gameOrchestrator.hasSavedGame().then(setHasSave);
  }, []);

  // Load save slots when picker opens
  useEffect(() => {
    if (showLoadPicker) {
      gameStore.getState().getSaveSlots().then(setSlots);
    }
  }, [showLoadPicker]);

  // --- New Game ---
  const handleNewGame = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setLoadingLabel("Starting new game...");
    try {
      await gameOrchestrator.initGame({ playerName: "Stranger" });
      router.push("/game");
    } catch (error) {
      console.error("[TitleScreen] Failed to start new game:", error);
      setIsLoading(false);
    }
  }, [isLoading, router]);

  // --- Continue (most recent save) ---
  const handleContinue = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setLoadingLabel("Loading saved game...");
    try {
      const loaded = await gameOrchestrator.continueGame();
      if (loaded) {
        router.push("/game");
      } else {
        // No save found -- fall back to new game
        setLoadingLabel("Starting new game...");
        await gameOrchestrator.initGame({ playerName: "Stranger" });
        router.push("/game");
      }
    } catch (error) {
      console.error("[TitleScreen] Failed to continue game:", error);
      setIsLoading(false);
    }
  }, [isLoading, router]);

  // --- Load from specific slot ---
  const handleLoadFromSlot = useCallback(
    async (slotId: string) => {
      if (isLoading) return;
      setIsLoading(true);
      setShowLoadPicker(false);
      setLoadingLabel("Loading saved game...");
      try {
        const state = gameStore.getState();
        const success = await state.loadFromSlot(slotId);
        if (success) {
          // hydrateFromSave (called by loadFromSlot) already sets phase to
          // 'playing' and restarts the clock, so just navigate to game.
          router.push("/game");
        } else {
          console.error("[TitleScreen] Failed to load slot:", slotId);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("[TitleScreen] Failed to load game:", error);
        setIsLoading(false);
      }
    },
    [isLoading, router],
  );

  return (
    <View className="flex-1 bg-frontier-night items-center justify-center px-8">
      {/* Decorative top border */}
      <View className="absolute top-0 left-0 right-0 h-1 bg-frontier-brass opacity-40" />

      {/* Title block */}
      <View className="items-center mb-16">
        <Text className="font-display text-5xl text-frontier-dust tracking-widest mb-2">IRON</Text>
        <View className="w-48 h-px bg-frontier-brass opacity-60 mb-2" />
        <Text className="font-display text-5xl text-frontier-brass tracking-widest">FRONTIER</Text>
        <Text className="font-body text-sm text-frontier-dust opacity-50 mt-4 tracking-[0.3em] uppercase">
          An Old West Tale
        </Text>
      </View>

      {/* Menu buttons */}
      <View className="w-64 gap-4">
        {isLoading ? (
          <View className="py-6 items-center">
            <ActivityIndicator color="#c4a875" size="large" />
            <Text className="font-body text-sm text-frontier-dust opacity-60 mt-3">
              {loadingLabel}
            </Text>
          </View>
        ) : (
          <>
            <MenuButton label="New Game" onPress={handleNewGame} />
            <MenuButton
              label="Continue"
              onPress={handleContinue}
              variant="secondary"
              disabled={!hasSave}
            />
            <MenuButton
              label="Load Game"
              onPress={() => setShowLoadPicker(true)}
              variant="secondary"
              disabled={!hasSave}
            />
            <MenuButton
              label="Settings"
              onPress={() => setShowSettings(true)}
              variant="secondary"
            />
          </>
        )}
      </View>

      {/* Decorative bottom border */}
      <View className="absolute bottom-0 left-0 right-0 h-1 bg-frontier-brass opacity-40" />

      {/* Version stamp */}
      <Text className="absolute bottom-6 font-data text-xs text-frontier-iron opacity-40">
        v0.3.0
      </Text>

      {/* Load Game slot picker modal */}
      {showLoadPicker && (
        <LoadGameModal
          slots={slots}
          onLoadSlot={handleLoadFromSlot}
          onClose={() => setShowLoadPicker(false)}
        />
      )}

      {/* Settings modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </View>
  );
}

// ============================================================================
// LOAD GAME MODAL
// ============================================================================

function LoadGameModal({
  slots,
  onLoadSlot,
  onClose,
}: {
  slots: SaveSlotMeta[];
  onLoadSlot: (slotId: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal transparent visible onRequestClose={onClose}>
      <View
        className="absolute inset-0 flex-1 items-center justify-center"
        style={{ backgroundColor: "rgba(26, 15, 10, 0.9)" }}
      >
        {/* Dismiss backdrop */}
        <Pressable className="absolute inset-0" onPress={onClose} />

        <View
          className="mx-6 w-full max-w-md rounded-sm border border-frontier-leather"
          style={{ backgroundColor: "#1a0f0a" }}
        >
          {/* Header */}
          <View className="px-6 pt-5 pb-3 border-b border-frontier-leather">
            <Text className="font-heading text-lg text-frontier-brass tracking-widest uppercase text-center">
              Load Game
            </Text>
          </View>

          {/* Slot list */}
          <ScrollView style={{ maxHeight: 320 }} className="px-4 py-3">
            {slots.length === 0 ? (
              <Text className="font-body text-sm text-frontier-dust opacity-50 text-center py-8">
                No save files found.
              </Text>
            ) : (
              <View className="gap-2">
                {slots.map((slot) => (
                  <SaveSlotRow
                    key={slot.slotId}
                    slot={slot}
                    onPress={() => onLoadSlot(slot.slotId)}
                  />
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View className="px-6 pb-5 pt-3 border-t border-frontier-leather">
            <MenuButton label="Back" onPress={onClose} variant="secondary" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// SAVE SLOT ROW
// ============================================================================

function SaveSlotRow({ slot, onPress }: { slot: SaveSlotMeta; onPress: () => void }) {
  const label = slot.isAutoSave
    ? "Auto Save"
    : slot.isQuickSave
      ? "Quick Save"
      : `Save: ${slot.slotId}`;

  return (
    <Pressable
      className="rounded-sm border border-frontier-leather px-4 py-3 active:opacity-70"
      style={{ backgroundColor: "rgba(92, 64, 51, 0.15)" }}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 gap-0.5">
          <Text className="font-heading text-sm text-frontier-dust tracking-wide">{label}</Text>
          <Text className="font-body text-xs text-frontier-dust opacity-50">
            {slot.playerName} - Lv.{slot.playerLevel ?? 1} - {slot.location}
          </Text>
        </View>
        <View className="items-end gap-0.5">
          <Text className="font-data text-xs text-frontier-dust opacity-40">
            {formatTimestamp(slot.timestamp)}
          </Text>
          <Text className="font-data text-xs text-frontier-dust opacity-40">
            {formatPlayTime(slot.playTime)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ============================================================================
// SETTINGS MODAL
// ============================================================================

function SettingsModal({ onClose }: { onClose: () => void }) {
  const settings = gameStore((s) => s.settings);
  const updateSettings = gameStore((s) => s.updateSettings);

  return (
    <Modal transparent visible onRequestClose={onClose}>
      <View
        className="absolute inset-0 flex-1 items-center justify-center"
        style={{ backgroundColor: "rgba(26, 15, 10, 0.9)" }}
      >
        {/* Dismiss backdrop */}
        <Pressable className="absolute inset-0" onPress={onClose} />

        <View
          className="mx-6 w-full max-w-md rounded-sm border border-frontier-leather"
          style={{ backgroundColor: "#1a0f0a" }}
        >
          {/* Header */}
          <View className="px-6 pt-5 pb-3 border-b border-frontier-leather">
            <Text className="font-heading text-lg text-frontier-brass tracking-widest uppercase text-center">
              Settings
            </Text>
          </View>

          {/* Settings content */}
          <View className="px-6 py-4 gap-5">
            <SettingsSlider
              label="Music Volume"
              value={settings.musicVolume}
              onValueChange={(v) => updateSettings({ musicVolume: v })}
            />
            <SettingsSlider
              label="SFX Volume"
              value={settings.sfxVolume}
              onValueChange={(v) => updateSettings({ sfxVolume: v })}
            />

            <View className="h-px bg-frontier-leather opacity-40" />

            <SettingsToggle
              label="Haptic Feedback"
              value={settings.haptics}
              onToggle={() => updateSettings({ haptics: !settings.haptics })}
            />
            <SettingsToggle
              label="Reduced Motion"
              value={settings.reducedMotion}
              onToggle={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
            />
            <SettingsToggle
              label="Show Minimap"
              value={settings.showMinimap}
              onToggle={() => updateSettings({ showMinimap: !settings.showMinimap })}
            />
            <SettingsToggle
              label="Low Power Mode"
              value={settings.lowPowerMode}
              onToggle={() => updateSettings({ lowPowerMode: !settings.lowPowerMode })}
            />
          </View>

          {/* Footer */}
          <View className="px-6 pb-5 pt-3 border-t border-frontier-leather">
            <MenuButton label="Done" onPress={onClose} variant="secondary" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SettingsSlider({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: number;
  onValueChange: (v: number) => void;
}) {
  const pct = Math.round(value * 100);

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="font-body text-sm text-frontier-dust">{label}</Text>
        <Text className="font-data text-xs text-frontier-dust opacity-50">{pct}%</Text>
      </View>
      <View
        className="h-3 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "rgba(92, 64, 51, 0.3)" }}
      >
        <Pressable
          className="absolute inset-0"
          onPress={() => {
            const newVal = Math.min(1, Math.max(0, Math.round((value + 0.1) * 10) / 10));
            if (newVal > 1) {
              onValueChange(0);
            } else {
              onValueChange(newVal);
            }
          }}
        >
          <View className="h-full rounded-full bg-frontier-brass" style={{ width: `${pct}%` }} />
        </Pressable>
      </View>
    </View>
  );
}

function SettingsToggle({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      className="flex-row items-center justify-between py-1 active:opacity-70"
      onPress={onToggle}
    >
      <Text className="font-body text-sm text-frontier-dust">{label}</Text>
      <View
        className="h-6 w-11 rounded-full border"
        style={{
          borderColor: value ? "#B5A642" : "#5C4033",
          backgroundColor: value ? "#B5A642" : "rgba(92, 64, 51, 0.3)",
        }}
      >
        <View
          className="h-5 w-5 rounded-full bg-white shadow-sm"
          style={{
            marginLeft: value ? 20 : 1,
            marginTop: 1,
          }}
        />
      </View>
    </Pressable>
  );
}

// ============================================================================
// MENU BUTTON
// ============================================================================

function MenuButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`
        py-3 px-6 rounded-sm border items-center
        ${
          isPrimary
            ? "bg-frontier-rust border-frontier-copper"
            : "bg-transparent border-frontier-leather"
        }
        ${disabled ? "opacity-30" : "active:opacity-70"}
      `}
    >
      <Text
        className={`
          font-heading text-lg tracking-widest uppercase
          ${isPrimary ? "text-frontier-dust" : "text-frontier-dust opacity-70"}
        `}
      >
        {label}
      </Text>
    </Pressable>
  );
}
