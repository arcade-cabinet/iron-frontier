// Settings Panel - Game options and accessibility
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useGameStore } from '../store/gameStore';

// Toggle component for settings
function SettingToggle({
  label,
  description,
  enabled,
  onChange
}: {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <Label className="text-amber-100">{label}</Label>
        {description && (
          <p className="text-xs text-amber-500/70 mt-0.5">{description}</p>
        )}
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-amber-600"
      />
    </div>
  );
}

// Slider component for settings
function SettingSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-amber-100">{label}</Label>
        <span className="text-amber-400 text-sm font-mono">
          {Math.round(value * 100)}%
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="[&_[role=slider]]:bg-amber-500 [&_[role=slider]]:border-amber-600"
      />
    </div>
  );
}

export function SettingsPanel() {
  const { activePanel, togglePanel, settings, updateSettings, saveGame, playerName, playerStats } = useGameStore();

  const settingsOpen = activePanel === 'settings';

  const handleSave = () => {
    saveGame();
    if (settings.haptics && navigator.vibrate) {
      navigator.vibrate([30, 20, 30]);
    }
  };

  return (
    <Sheet open={settingsOpen} onOpenChange={() => togglePanel('settings')}>
      <SheetContent side="bottom" className="h-[80vh] bg-amber-950 border-amber-700">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-amber-100">Settings</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100%-60px)] pr-2">
          <div className="space-y-4">
            {/* Audio Section */}
            <Card className="bg-amber-900/30 border-amber-700/50">
              <CardContent className="p-4">
                <h3 className="text-amber-300 font-medium mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  Audio
                </h3>

                <SettingSlider
                  label="Music Volume"
                  value={settings.musicVolume}
                  onChange={(v) => updateSettings({ musicVolume: v })}
                />

                <SettingSlider
                  label="Sound Effects"
                  value={settings.sfxVolume}
                  onChange={(v) => updateSettings({ sfxVolume: v })}
                />
              </CardContent>
            </Card>

            {/* Controls Section */}
            <Card className="bg-amber-900/30 border-amber-700/50">
              <CardContent className="p-4">
                <h3 className="text-amber-300 font-medium mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                  </svg>
                  Controls
                </h3>

                <div className="py-2">
                  <Label className="text-amber-100 mb-3 block">Control Mode</Label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateSettings({ controlMode: 'tap' })}
                      className={cn(
                        'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                        settings.controlMode === 'tap'
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-900/50 text-amber-300 hover:bg-amber-800/50'
                      )}
                    >
                      Tap to Move
                    </button>
                    <button
                      onClick={() => updateSettings({ controlMode: 'joystick' })}
                      className={cn(
                        'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                        settings.controlMode === 'joystick'
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-900/50 text-amber-300 hover:bg-amber-800/50'
                      )}
                    >
                      Virtual Joystick
                    </button>
                  </div>
                </div>

                <Separator className="bg-amber-700/30 my-2" />

                <SettingToggle
                  label="Haptic Feedback"
                  description="Vibration on interactions"
                  enabled={settings.haptics}
                  onChange={(v) => updateSettings({ haptics: v })}
                />
              </CardContent>
            </Card>

            {/* Display Section */}
            <Card className="bg-amber-900/30 border-amber-700/50">
              <CardContent className="p-4">
                <h3 className="text-amber-300 font-medium mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Display
                </h3>

                <SettingToggle
                  label="Show Minimap"
                  description="Display minimap in corner"
                  enabled={settings.showMinimap}
                  onChange={(v) => updateSettings({ showMinimap: v })}
                />

                <Separator className="bg-amber-700/30 my-2" />

                <SettingToggle
                  label="Low Power Mode"
                  description="Reduce effects for battery"
                  enabled={settings.lowPowerMode}
                  onChange={(v) => updateSettings({ lowPowerMode: v })}
                />
              </CardContent>
            </Card>

            {/* Accessibility Section */}
            <Card className="bg-amber-900/30 border-amber-700/50">
              <CardContent className="p-4">
                <h3 className="text-amber-300 font-medium mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Accessibility
                </h3>

                <SettingToggle
                  label="Reduced Motion"
                  description="Minimize animations"
                  enabled={settings.reducedMotion}
                  onChange={(v) => updateSettings({ reducedMotion: v })}
                />
              </CardContent>
            </Card>

            {/* Save Section */}
            <Card className="bg-amber-900/30 border-amber-700/50">
              <CardContent className="p-4">
                <h3 className="text-amber-300 font-medium mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Data
                </h3>

                <div className="text-sm text-amber-400/70 mb-3">
                  <p>Player: {playerName}</p>
                  <p>Level: {playerStats.level}</p>
                </div>

                <button
                  onClick={handleSave}
                  className={cn(
                    'w-full py-3 px-4 rounded-lg font-medium',
                    'bg-amber-700 hover:bg-amber-600 text-white',
                    'transition-colors'
                  )}
                >
                  Save Game
                </button>

                <p className="text-xs text-amber-500/50 mt-2 text-center">
                  Game auto-saves periodically
                </p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
