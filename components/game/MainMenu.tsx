/**
 * MainMenu - Pause/main menu with resume, save, load, settings, and quit.
 *
 * Ported from legacy/angular-ui/menu-panel.component.ts
 * Wired: save-to-slot, load-from-slot with slot picker, auto-save on quit.
 */

import * as React from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { cn } from '@/lib/utils';
import {
  Text,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { gameStore } from '@/src/game/store/webGameStore';
import type { SaveSlotMeta } from '@/src/game/systems/SaveSystem';
import { formatPlayTime, formatTimestamp } from '@/src/game/store/saveManager';

// ---------------------------------------------------------------------------
// Settings Controls
// ---------------------------------------------------------------------------

function SliderRow({
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
        <Text variant="small" className="text-foreground">
          {label}
        </Text>
        <Text variant="caption" className="text-muted-foreground">
          {pct}%
        </Text>
      </View>
      <View className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <Pressable
          className="absolute inset-0"
          onPress={(e) => {
            const newVal = Math.min(1, Math.max(0, Math.round((value + 0.1) * 10) / 10));
            if (newVal > 1) {
              onValueChange(0);
            } else {
              onValueChange(newVal);
            }
          }}
        >
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${pct}%` }}
          />
        </Pressable>
      </View>
    </View>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onToggle,
}: {
  label: string;
  description?: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      className="flex-row items-center justify-between rounded-md px-1 py-2 active:bg-muted/30"
      onPress={onToggle}
    >
      <View className="flex-1">
        <Text variant="small" className="text-foreground">
          {label}
        </Text>
        {description && (
          <Text variant="caption" className="text-muted-foreground">
            {description}
          </Text>
        )}
      </View>
      <View
        className={cn(
          'h-6 w-11 rounded-full border',
          value
            ? 'border-primary bg-primary'
            : 'border-border bg-muted',
        )}
      >
        <View
          className={cn(
            'h-5 w-5 rounded-full bg-white shadow-sm',
            value ? 'ml-[20px]' : 'ml-[1px]',
          )}
          style={{ marginTop: 1 }}
        />
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Save Slot Row
// ---------------------------------------------------------------------------

function SaveSlotRow({
  slot,
  onPress,
  mode,
}: {
  slot: SaveSlotMeta;
  onPress: () => void;
  mode: 'save' | 'load';
}) {
  const label = slot.isAutoSave
    ? 'Auto Save'
    : slot.isQuickSave
      ? 'Quick Save'
      : `Slot: ${slot.slotId}`;

  return (
    <Pressable
      className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3 active:bg-muted/60"
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 gap-0.5">
          <Text variant="small" className="font-semibold text-foreground">
            {label}
          </Text>
          <Text variant="caption" className="text-muted-foreground">
            {slot.playerName} - Lv.{slot.playerLevel ?? 1} - {slot.location}
          </Text>
        </View>
        <View className="items-end gap-0.5">
          <Text variant="caption" className="text-muted-foreground">
            {formatTimestamp(slot.timestamp)}
          </Text>
          <Text variant="caption" className="text-muted-foreground">
            {formatPlayTime(slot.playTime)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function MainMenu({ onClose }: { onClose?: () => void } = {}) {
  const settings = gameStore((s) => s.settings);
  const updateSettings = gameStore((s) => s.updateSettings);
  const saveToSlot = gameStore((s) => s.saveToSlot);
  const loadFromSlot = gameStore((s) => s.loadFromSlot);
  const getSaveSlots = gameStore((s) => s.getSaveSlots);
  const saveGame = gameStore((s) => s.saveGame);
  const resetGame = gameStore((s) => s.resetGame);
  const setPhase = gameStore((s) => s.setPhase);
  const closePanel = gameStore((s) => s.closePanel);

  const [activeTab, setActiveTab] = React.useState<string>('game');
  const [slots, setSlots] = React.useState<SaveSlotMeta[]>([]);
  const [showSlotPicker, setShowSlotPicker] = React.useState<'save' | 'load' | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  // Load slots when slot picker is opened
  React.useEffect(() => {
    if (showSlotPicker) {
      getSaveSlots().then(setSlots);
    }
  }, [showSlotPicker, getSaveSlots]);

  const handleResume = React.useCallback(() => {
    closePanel();
    onClose?.();
  }, [closePanel, onClose]);

  const handleSave = React.useCallback(async () => {
    setShowSlotPicker('save');
  }, []);

  const handleSaveToSlot = React.useCallback(async (slotId: string) => {
    setIsSaving(true);
    try {
      await saveToSlot(slotId);
      setShowSlotPicker(null);
    } finally {
      setIsSaving(false);
    }
  }, [saveToSlot]);

  const handleSaveToNewSlot = React.useCallback(async () => {
    const nextSlotNum = slots.filter((s) => !s.isAutoSave && !s.isQuickSave).length + 1;
    const slotId = `slot-${Math.min(nextSlotNum, 10)}`;
    await handleSaveToSlot(slotId);
  }, [slots, handleSaveToSlot]);

  const handleLoad = React.useCallback(() => {
    setShowSlotPicker('load');
  }, []);

  const handleLoadFromSlot = React.useCallback(async (slotId: string) => {
    const success = await loadFromSlot(slotId);
    if (success) {
      setShowSlotPicker(null);
      closePanel();
      onClose?.();
    }
  }, [loadFromSlot, closePanel, onClose]);

  const handleQuitToTitle = React.useCallback(() => {
    Alert.alert(
      'Return to Title',
      'Your progress has been auto-saved. Return to the main menu?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: async () => {
            await saveToSlot('autosave');
            setPhase('title');
            closePanel();
            onClose?.();
          },
        },
      ],
    );
  }, [saveToSlot, setPhase, closePanel, onClose]);

  const handleNewGame = React.useCallback(() => {
    Alert.alert(
      'New Journey',
      'Start a new journey? Current progress will be saved but you will start fresh.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'New Game',
          style: 'destructive',
          onPress: async () => {
            await saveToSlot('autosave');
            resetGame();
          },
        },
      ],
    );
  }, [saveToSlot, resetGame]);

  return (
    <Modal transparent visible onRequestClose={handleResume}>
      <View className="absolute inset-0 flex-1 items-center justify-center bg-black/60">
        {/* Dismiss backdrop */}
        <Pressable className="absolute inset-0" onPress={handleResume} />

        <Animated.View
          entering={SlideInDown.duration(250)}
          exiting={SlideOutDown.duration(200)}
          className="mx-4 w-full max-w-md"
        >
          <Card className="border-frontier-leather/40">
            <CardHeader>
              <CardTitle>
                <Text variant="subheading">
                  {showSlotPicker === 'save'
                    ? 'Save Game'
                    : showSlotPicker === 'load'
                      ? 'Load Game'
                      : 'Menu'}
                </Text>
              </CardTitle>
            </CardHeader>

            {/* ---- Slot Picker View ---- */}
            {showSlotPicker ? (
              <CardContent className="gap-3">
                <ScrollView style={{ maxHeight: 300 }} className="gap-2">
                  {showSlotPicker === 'save' && (
                    <Button
                      variant="primary"
                      onPress={handleSaveToNewSlot}
                      disabled={isSaving}
                    >
                      <Text>{isSaving ? 'Saving...' : 'Save to New Slot'}</Text>
                    </Button>
                  )}

                  <View className="gap-2 mt-2">
                    {slots.length === 0 && showSlotPicker === 'load' && (
                      <Text variant="small" className="text-center text-muted-foreground py-4">
                        No save files found.
                      </Text>
                    )}

                    {slots.map((slot) => (
                      <SaveSlotRow
                        key={slot.slotId}
                        slot={slot}
                        mode={showSlotPicker}
                        onPress={() =>
                          showSlotPicker === 'save'
                            ? handleSaveToSlot(slot.slotId)
                            : handleLoadFromSlot(slot.slotId)
                        }
                      />
                    ))}
                  </View>
                </ScrollView>

                <Button
                  variant="ghost"
                  onPress={() => setShowSlotPicker(null)}
                >
                  <Text>Back</Text>
                </Button>
              </CardContent>
            ) : (
              /* ---- Normal Menu View ---- */
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <View className="px-6">
                  <TabsList>
                    <TabsTrigger value="game">
                      <Text>Game</Text>
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                      <Text>Settings</Text>
                    </TabsTrigger>
                  </TabsList>
                </View>

                {/* ---- Game Tab ---- */}
                <TabsContent value="game">
                  <CardContent className="gap-3">
                    <Button variant="primary" onPress={handleResume}>
                      <Text>Resume Game</Text>
                    </Button>

                    <Button variant="secondary" onPress={handleSave}>
                      <Text>Save Game</Text>
                    </Button>

                    <Button variant="outline" onPress={handleLoad}>
                      <Text>Load Game</Text>
                    </Button>

                    <Separator className="my-1" />

                    <Button variant="ghost" onPress={handleNewGame}>
                      <Text>New Game</Text>
                    </Button>

                    <Button variant="destructive" onPress={handleQuitToTitle}>
                      <Text>Quit to Title</Text>
                    </Button>
                  </CardContent>
                </TabsContent>

                {/* ---- Settings Tab ---- */}
                <TabsContent value="settings">
                  <CardContent className="gap-4">
                    <SliderRow
                      label="Music Volume"
                      value={settings.musicVolume}
                      onValueChange={(v) => updateSettings({ musicVolume: v })}
                    />
                    <SliderRow
                      label="SFX Volume"
                      value={settings.sfxVolume}
                      onValueChange={(v) => updateSettings({ sfxVolume: v })}
                    />

                    <Separator />

                    <ToggleRow
                      label="Haptic Feedback"
                      description="Vibration on interactions"
                      value={settings.haptics}
                      onToggle={() => updateSettings({ haptics: !settings.haptics })}
                    />
                    <ToggleRow
                      label="Reduced Motion"
                      description="Minimise animations"
                      value={settings.reducedMotion}
                      onToggle={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
                    />
                    <ToggleRow
                      label="Show Minimap"
                      value={settings.showMinimap}
                      onToggle={() => updateSettings({ showMinimap: !settings.showMinimap })}
                    />
                    <ToggleRow
                      label="Low Power Mode"
                      description="Reduce visual effects"
                      value={settings.lowPowerMode}
                      onToggle={() => updateSettings({ lowPowerMode: !settings.lowPowerMode })}
                    />
                  </CardContent>
                </TabsContent>
              </Tabs>
            )}

            <CardFooter>
              <Button variant="ghost" size="sm" onPress={handleResume}>
                <Text variant="muted">Close</Text>
              </Button>
            </CardFooter>
          </Card>
        </Animated.View>
      </View>
    </Modal>
  );
}
