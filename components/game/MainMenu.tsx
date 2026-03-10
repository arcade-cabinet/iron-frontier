/**
 * MainMenu - Pause/main menu with cinematic Western polish.
 *
 * Styled to evoke weathered wanted posters and saloon signboards.
 * Ported from legacy/angular-ui/menu-panel.component.ts
 * Wired: save-to-slot, load-from-slot with slot picker, auto-save on quit.
 */

import * as React from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
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
import { cn } from "@/lib/utils";
import { formatPlayTime, formatTimestamp } from "@/src/game/store/saveManager";
import { gameStore } from "@/src/game/store/webGameStore";
import type { SaveSlotMeta } from "@/src/game/systems/SaveSystem";

const APP_VERSION = "0.2.0";

// ---------------------------------------------------------------------------
// Western-themed constants
// ---------------------------------------------------------------------------

const COLORS = {
  amber: "#D4A049",
  amberGlow: "rgba(212, 160, 73, 0.25)",
  burntSienna: "#8B4513",
  leather: "#654321",
  night: "#1a0f0a",
  dust: "#C4A882",
  parchment: "rgba(196, 168, 130, 0.08)",
} as const;

// ---------------------------------------------------------------------------
// Animated Title — fades in with expanding letter-spacing
// ---------------------------------------------------------------------------

function AnimatedTitle() {
  const opacity = useSharedValue(0);
  const letterSpacing = useSharedValue(2);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    letterSpacing.value = withTiming(6, { duration: 1000, easing: Easing.out(Easing.cubic) });
  }, [opacity, letterSpacing]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    letterSpacing: letterSpacing.value,
  }));

  const subtitleOpacity = useSharedValue(0);
  React.useEffect(() => {
    subtitleOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );
  }, [subtitleOpacity]);

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <View className="items-center gap-1">
      <Animated.Text
        style={[
          {
            fontFamily: "CinzelDecorative",
            fontSize: 28,
            fontWeight: "800",
            color: COLORS.amber,
            textAlign: "center",
            textShadowColor: "rgba(0,0,0,0.6)",
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          },
          titleStyle,
        ]}
      >
        IRON FRONTIER
      </Animated.Text>
      <Animated.Text
        style={[
          {
            fontFamily: "Cinzel",
            fontSize: 11,
            fontWeight: "600",
            color: COLORS.dust,
            textAlign: "center",
            letterSpacing: 4,
          },
          subtitleStyle,
        ]}
      >
        AN OLD WEST TALE
      </Animated.Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Film Grain Overlay — subtle flickering opacity layer
// ---------------------------------------------------------------------------

function FilmGrainOverlay() {
  const grainOpacity = useSharedValue(0.03);

  React.useEffect(() => {
    grainOpacity.value = withRepeat(
      withSequence(
        withTiming(0.07, { duration: 150, easing: Easing.linear }),
        withTiming(0.02, { duration: 200, easing: Easing.linear }),
        withTiming(0.05, { duration: 100, easing: Easing.linear }),
        withTiming(0.03, { duration: 180, easing: Easing.linear }),
      ),
      -1,
      false,
    );
  }, [grainOpacity]);

  const grainStyle = useAnimatedStyle(() => ({
    opacity: grainOpacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.dust,
        },
        grainStyle,
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// Vignette Edge — gradient darkening around edges
// ---------------------------------------------------------------------------

function VignetteEdge({ position }: { position: "top" | "bottom" | "left" | "right" }) {
  const isVertical = position === "top" || position === "bottom";
  const size = isVertical ? 60 : 40;

  const positionStyle = {
    top: position === "top" ? 0 : position === "bottom" ? undefined : 0,
    bottom: position === "bottom" ? 0 : position === "top" ? undefined : 0,
    left: position === "left" ? 0 : position === "right" ? undefined : 0,
    right: position === "right" ? 0 : position === "left" ? undefined : 0,
    width: isVertical ? ("100%" as const) : size,
    height: isVertical ? size : ("100%" as const),
  };

  // Use a solid dark overlay that fades from edge - simulated with layered Views
  const opacity = position === "top" || position === "bottom" ? 0.5 : 0.3;

  return (
    <View
      pointerEvents="none"
      style={[{ position: "absolute", backgroundColor: COLORS.night, opacity }, positionStyle]}
    />
  );
}

// ---------------------------------------------------------------------------
// Western Menu Button — aged border, amber press glow, scale feedback
// ---------------------------------------------------------------------------

function MenuButton({
  label,
  onPress,
  variant = "default",
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "default" | "danger" | "ghost";
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePressIn = React.useCallback(() => {
    scale.value = withTiming(0.97, { duration: 100 });
    glowOpacity.value = withTiming(1, { duration: 100 });
  }, [scale, glowOpacity]);

  const handlePressOut = React.useCallback(() => {
    scale.value = withTiming(1, { duration: 150 });
    glowOpacity.value = withTiming(0, { duration: 200 });
  }, [scale, glowOpacity]);

  const borderColor =
    variant === "primary"
      ? COLORS.amber
      : variant === "danger"
        ? "#8B0000"
        : variant === "ghost"
          ? "transparent"
          : COLORS.burntSienna;

  const textColor =
    variant === "primary"
      ? COLORS.amber
      : variant === "danger"
        ? "#cc4444"
        : variant === "ghost"
          ? COLORS.dust
          : COLORS.dust;

  return (
    <Animated.View style={animatedContainerStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          {
            borderWidth: variant === "ghost" ? 0 : 1,
            borderColor,
            borderRadius: 4,
            paddingVertical: 12,
            paddingHorizontal: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            opacity: disabled ? 0.4 : 1,
            overflow: "hidden",
          },
          variant === "primary" && {
            borderWidth: 2,
            borderStyle: "solid",
          },
        ]}
      >
        {/* Amber glow backdrop on press */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: COLORS.amberGlow,
              borderRadius: 3,
            },
            animatedGlowStyle,
          ]}
        />
        <Text
          style={{
            color: textColor,
            fontSize: 14,
            fontWeight: "600",
            fontFamily: "Cinzel",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Western Separator — decorative line with dots
// ---------------------------------------------------------------------------

function WesternSeparator() {
  return (
    <View className="flex-row items-center gap-2 py-2">
      <View style={{ flex: 1, height: 1, backgroundColor: COLORS.burntSienna, opacity: 0.4 }} />
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: COLORS.amber,
          opacity: 0.5,
        }}
      />
      <View style={{ flex: 1, height: 1, backgroundColor: COLORS.burntSienna, opacity: 0.4 }} />
    </View>
  );
}

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
          <View className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
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
          "h-6 w-11 rounded-full border",
          value ? "border-primary bg-primary" : "border-border bg-muted",
        )}
      >
        <View
          className={cn(
            "h-5 w-5 rounded-full bg-white shadow-sm",
            value ? "ml-[20px]" : "ml-[1px]",
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
  mode: "save" | "load";
}) {
  const label = slot.isAutoSave
    ? "Auto Save"
    : slot.isQuickSave
      ? "Quick Save"
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
  const resetGame = gameStore((s) => s.resetGame);
  const setPhase = gameStore((s) => s.setPhase);
  const closePanel = gameStore((s) => s.closePanel);

  const [activeTab, setActiveTab] = React.useState<string>("game");
  const [slots, setSlots] = React.useState<SaveSlotMeta[]>([]);
  const [showSlotPicker, setShowSlotPicker] = React.useState<"save" | "load" | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

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
      {/* Semi-transparent backdrop with warm tint — tap to resume */}
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

      {/* Vignette edges */}
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
            {/* Film grain overlay across entire card */}
            <FilmGrainOverlay />

            {/* ---- Header with animated title ---- */}
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

            {/* ---- Slot Picker View ---- */}
            {showSlotPicker ? (
              <CardContent className="gap-3">
                {isSaving || isLoading ? (
                  <View className="py-8 items-center gap-3">
                    <ActivityIndicator color={COLORS.amber} size="large" />
                    <Text
                      variant="small"
                      style={{ color: COLORS.dust, fontFamily: "Cinzel", letterSpacing: 1 }}
                    >
                      {isSaving ? "Saving..." : "Loading..."}
                    </Text>
                  </View>
                ) : (
                  <ScrollView style={{ maxHeight: 300 }} className="gap-2">
                    {showSlotPicker === "save" && (
                      <MenuButton
                        label="Save to New Slot"
                        variant="primary"
                        onPress={handleSaveToNewSlot}
                        disabled={isSaving || isLoading}
                      />
                    )}

                    <View className="gap-2 mt-2">
                      {slots.length === 0 && showSlotPicker === "load" && (
                        <Text
                          variant="small"
                          className="text-center py-4"
                          style={{ color: COLORS.dust, opacity: 0.6 }}
                        >
                          No save files found.
                        </Text>
                      )}

                      {slots.map((slot) => (
                        <SaveSlotRow
                          key={slot.slotId}
                          slot={slot}
                          mode={showSlotPicker}
                          onPress={() =>
                            showSlotPicker === "save"
                              ? handleSaveToSlot(slot.slotId)
                              : handleLoadFromSlot(slot.slotId)
                          }
                        />
                      ))}
                    </View>
                  </ScrollView>
                )}

                <WesternSeparator />

                <MenuButton
                  label="Back"
                  variant="ghost"
                  onPress={() => setShowSlotPicker(null)}
                  disabled={isSaving || isLoading}
                />
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

                    <WesternSeparator />

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

            {/* ---- Footer ---- */}
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
