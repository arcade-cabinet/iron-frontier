import { CardContent } from "@/components/ui";
import { gameStore } from "@/src/game/store/webGameStore";
import { WesternSeparator } from "./MenuOverlays.tsx";
import { SliderRow, ToggleRow } from "./SettingsControls.tsx";

export function SettingsTab() {
  const settings = gameStore((s) => s.settings);
  const updateSettings = gameStore((s) => s.updateSettings);

  return (
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
  );
}
