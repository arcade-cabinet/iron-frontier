/**
 * MainMenu - Pause/main menu with cinematic Western polish.
 *
 * Styled to evoke weathered wanted posters and saloon signboards.
 * Ported from legacy/angular-ui/menu-panel.component.ts
 * Wired: save-to-slot, load-from-slot with slot picker, auto-save on quit.
 */

import * as React from "react";
import { Alert, Pressable, View } from "react-native";
import Animated, { FadeInDown, SlideInDown, SlideOutDown } from "react-native-reanimated";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@/components/ui";
import { gameStore } from "@/src/game/store/webGameStore";
import type { SaveSlotMeta } from "@/src/game/systems/SaveSystem";
import { AnimatedTitle } from "./AnimatedTitle.tsx";
import { APP_VERSION, COLORS } from "./constants.ts";
import { MenuButton } from "./MenuButton.tsx";
import { FilmGrainOverlay, VignetteEdge, WesternSeparator } from "./MenuOverlays.tsx";
import { SettingsTab } from "./SettingsTab.tsx";
import { SlotPickerView } from "./SlotPickerView.tsx";

export function MainMenu({ onClose }: { onClose?: () => void } = {}) {
  const saveToSlot = gameStore((s) => s.saveToSlot);
  const loadFromSlot = gameStore((s) => s.loadFromSlot);
  const getSaveSlots = gameStore((s) => s.getSaveSlots);
  const resetGame = gameStore((s) => s.resetGame);
  const setPhase = gameStore((s) => s.setPhase);
  const closePanel = gameStore((s) => s.closePanel);

  const [activeTab, setActiveTab] = React.useState<string>("game");
  const [slots, setSlots] = React.useState<SaveSlotMeta[]>([]);
  const [showSlotPicker, setShowSlotPicker] = React.useState<"save" | "load" | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

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
    setShowSlotPicker("save");
  }, []);

  const handleSaveToSlot = React.useCallback(
    async (slotId: string) => {
      setIsSaving(true);
      try {
        await saveToSlot(slotId);
        setShowSlotPicker(null);
      } finally {
        setIsSaving(false);
      }
    },
    [saveToSlot],
  );

  const handleSaveToNewSlot = React.useCallback(async () => {
    const nextSlotNum = slots.filter((s) => !s.isAutoSave && !s.isQuickSave).length + 1;
    const slotId = `slot-${Math.min(nextSlotNum, 3)}`;
    await handleSaveToSlot(slotId);
  }, [slots, handleSaveToSlot]);

  const handleLoad = React.useCallback(() => {
    setShowSlotPicker("load");
  }, []);

  const handleLoadFromSlot = React.useCallback(
    async (slotId: string) => {
      setIsLoading(true);
      try {
        const success = await loadFromSlot(slotId);
        if (success) {
          setShowSlotPicker(null);
          closePanel();
          onClose?.();
        }
      } finally {
        setIsLoading(false);
      }
    },
    [loadFromSlot, closePanel, onClose],
  );

  const handleQuitToTitle = React.useCallback(() => {
    Alert.alert("Return to Title", "Your progress has been auto-saved. Return to the main menu?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Quit",
        style: "destructive",
        onPress: async () => {
          await saveToSlot("autosave");
          setPhase("title");
          closePanel();
          onClose?.();
        },
      },
    ]);
  }, [saveToSlot, setPhase, closePanel, onClose]);

  const handleNewGame = React.useCallback(() => {
    Alert.alert(
      "New Journey",
      "Start a new journey? Current progress will be saved but you will start fresh.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "New Game",
          style: "destructive",
          onPress: async () => {
            await saveToSlot("autosave");
            resetGame();
          },
        },
      ],
    );
  }, [saveToSlot, resetGame]);

  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}
    >
      <Pressable
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(26, 15, 10, 0.75)",
        }}
        onPress={handleResume}
      />

      <VignetteEdge position="top" />
      <VignetteEdge position="bottom" />
      <VignetteEdge position="left" />
      <VignetteEdge position="right" />

      <View className="flex-1 items-center justify-center" pointerEvents="box-none">
        <Animated.View
          entering={SlideInDown.duration(300).springify().damping(18)}
          exiting={SlideOutDown.duration(200)}
          className="mx-4 w-full max-w-md"
          pointerEvents="auto"
        >
          <Card
            className="border-frontier-leather/40 overflow-hidden"
            style={{ backgroundColor: "rgba(26, 15, 10, 0.95)" }}
          >
            <FilmGrainOverlay />

            <CardHeader
              style={{ borderBottomColor: COLORS.burntSienna, borderBottomWidth: 1 }}
              className="border-b-0"
            >
              {showSlotPicker ? (
                <CardTitle>
                  <Text
                    style={{
                      fontFamily: "Cinzel",
                      fontSize: 18,
                      fontWeight: "700",
                      color: COLORS.amber,
                      letterSpacing: 3,
                      textTransform: "uppercase",
                    }}
                  >
                    {showSlotPicker === "save" ? "Save Game" : "Load Game"}
                  </Text>
                </CardTitle>
              ) : (
                <AnimatedTitle />
              )}
            </CardHeader>

            {showSlotPicker ? (
              <SlotPickerView
                mode={showSlotPicker}
                slots={slots}
                isSaving={isSaving}
                isLoading={isLoading}
                onSaveToNewSlot={handleSaveToNewSlot}
                onSaveToSlot={handleSaveToSlot}
                onLoadFromSlot={handleLoadFromSlot}
                onBack={() => setShowSlotPicker(null)}
              />
            ) : (
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

                <TabsContent value="game">
                  <CardContent className="gap-2">
                    <Animated.View entering={FadeInDown.delay(50).duration(200)}>
                      <MenuButton label="Resume Game" variant="primary" onPress={handleResume} />
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(100).duration(200)}>
                      <MenuButton label="Save Game" onPress={handleSave} />
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(150).duration(200)}>
                      <MenuButton label="Load Game" onPress={handleLoad} />
                    </Animated.View>

                    <WesternSeparator />

                    <Animated.View entering={FadeInDown.delay(200).duration(200)}>
                      <MenuButton label="New Game" variant="ghost" onPress={handleNewGame} />
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(250).duration(200)}>
                      <MenuButton
                        label="Quit to Title"
                        variant="danger"
                        onPress={handleQuitToTitle}
                      />
                    </Animated.View>
                  </CardContent>
                </TabsContent>

                <TabsContent value="settings">
                  <SettingsTab />
                </TabsContent>
              </Tabs>
            )}

            <CardFooter
              style={{ borderTopColor: COLORS.burntSienna, borderTopWidth: 1 }}
              className="flex-col items-center gap-1 border-t-0 py-3"
            >
              <Pressable onPress={handleResume}>
                <Text
                  style={{
                    color: COLORS.dust,
                    opacity: 0.6,
                    fontSize: 12,
                    fontFamily: "Cinzel",
                    letterSpacing: 1,
                  }}
                >
                  Close
                </Text>
              </Pressable>
              <Text
                style={{
                  color: COLORS.burntSienna,
                  opacity: 0.4,
                  fontSize: 10,
                  fontFamily: "JetBrainsMono",
                  letterSpacing: 1,
                }}
              >
                v{APP_VERSION}
              </Text>
            </CardFooter>
          </Card>
        </Animated.View>
      </View>
    </View>
  );
}
