// Menu Panel - Unified game menu with settings (replaces separate SettingsPanel)
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useGameStore } from '../store/webGameStore';

// ============================================================================
// SETTING COMPONENTS
// ============================================================================

function SettingToggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <Label className="text-amber-100 text-sm">{label}</Label>
        {description && <p className="text-xs text-amber-500/70 mt-0.5">{description}</p>}
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-amber-600"
      />
    </div>
  );
}

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
        <Label className="text-amber-100 text-sm">{label}</Label>
        <span className="text-amber-400 text-xs font-mono">{Math.round(value * 100)}%</span>
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

// ============================================================================
// ICONS
// ============================================================================

function VolumeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
    </svg>
  );
}

function ControlsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
      />
    </svg>
  );
}

function DisplayIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MenuPanel() {
  const {
    activePanel,
    togglePanel,
    resetGame,
    playerStats,
    playerName,
    saveGame,
    settings,
    updateSettings,
    setPhase,
  } = useGameStore();

  const menuOpen = activePanel === 'menu';

  const xpPercent = (playerStats.xp / playerStats.xpToNext) * 100;
  const healthPercent = (playerStats.health / playerStats.maxHealth) * 100;

  const handleSave = () => {
    saveGame();
    if (settings.haptics && navigator.vibrate) {
      navigator.vibrate([30, 20, 30]);
    }
  };

  const handleNewGame = () => {
    if (confirm('Start a new journey? Current progress will be saved but you will start fresh.')) {
      resetGame();
    }
  };

  const handleMainMenu = () => {
    if (confirm('Return to main menu? Your progress has been auto-saved.')) {
      saveGame();
      setPhase('title');
      togglePanel('menu');
    }
  };

  return (
    <Sheet open={menuOpen} onOpenChange={() => togglePanel('menu')}>
      <SheetContent side="left" className="w-full sm:w-[320px] bg-amber-950 border-amber-700 p-0">
        <SheetHeader className="p-3 sm:p-4 pb-2 border-b border-amber-800/50">
          <SheetTitle className="text-amber-100 text-base sm:text-lg font-bold tracking-wide">
            Iron Frontier
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="game" className="h-[calc(100%-56px)] sm:h-[calc(100%-60px)]">
          <TabsList className="w-full rounded-none bg-amber-900/30 border-b border-amber-800/50 p-0">
            <TabsTrigger
              value="game"
              className="flex-1 rounded-none py-2 sm:py-2.5 min-h-[44px] data-[state=active]:bg-amber-800/50 data-[state=active]:text-amber-100 text-amber-400"
            >
              Game
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex-1 rounded-none py-2 sm:py-2.5 min-h-[44px] data-[state=active]:bg-amber-800/50 data-[state=active]:text-amber-100 text-amber-400"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          {/* GAME TAB */}
          <TabsContent value="game" className="m-0 h-[calc(100%-44px)]">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {/* Player Info Card */}
                <Card className="bg-amber-900/40 border-amber-700/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-amber-700/80 flex items-center justify-center border-2 border-amber-600/50">
                        <svg
                          className="w-5 h-5 text-amber-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-amber-100 font-bold text-sm truncate">
                          {playerName}
                        </div>
                        <div className="text-amber-400 text-xs">
                          Level {playerStats.level} Outlaw
                        </div>
                      </div>
                    </div>

                    {/* Compact Stats */}
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[10px] text-amber-400/80 mb-0.5">
                          <span>HP</span>
                          <span>
                            {playerStats.health}/{playerStats.maxHealth}
                          </span>
                        </div>
                        <Progress value={healthPercent} className="h-1.5 bg-amber-900/50" />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-amber-400/80 mb-0.5">
                          <span>XP</span>
                          <span>
                            {playerStats.xp}/{playerStats.xpToNext}
                          </span>
                        </div>
                        <Progress value={xpPercent} className="h-1.5 bg-amber-900/50" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-amber-700/30">
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        <span className="text-yellow-400 font-bold text-sm">
                          {playerStats.gold}
                        </span>
                      </div>
                      <div
                        className={cn(
                          'text-xs font-medium',
                          playerStats.reputation >= 0 ? 'text-green-400' : 'text-red-400'
                        )}
                      >
                        Rep: {playerStats.reputation >= 0 ? '+' : ''}
                        {playerStats.reputation}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full border-amber-700 text-amber-200 hover:bg-amber-800/50 justify-start gap-2 h-11 sm:h-10 min-h-[44px]"
                    onClick={handleSave}
                  >
                    <SaveIcon />
                    Save Progress
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-amber-700 text-amber-200 hover:bg-amber-800/50 justify-start gap-2 h-11 sm:h-10 min-h-[44px]"
                    onClick={handleMainMenu}
                  >
                    <HomeIcon />
                    Main Menu
                  </Button>

                  <Separator className="bg-amber-700/30 my-2" />

                  <Button
                    variant="outline"
                    className="w-full border-red-700/50 text-red-400 hover:bg-red-900/30 justify-start gap-2 h-11 sm:h-10 min-h-[44px]"
                    onClick={handleNewGame}
                  >
                    <RefreshIcon />
                    New Game
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="m-0 h-[calc(100%-44px)]">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {/* Audio */}
                <Card className="bg-amber-900/30 border-amber-700/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-amber-300 font-medium text-sm mb-2">
                      <VolumeIcon />
                      Audio
                    </div>
                    <SettingSlider
                      label="Music"
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

                {/* Controls */}
                <Card className="bg-amber-900/30 border-amber-700/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-amber-300 font-medium text-sm mb-2">
                      <ControlsIcon />
                      Controls
                    </div>
                    <div className="py-2">
                      <Label className="text-amber-100 text-sm mb-2 block">Movement</Label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateSettings({ controlMode: 'tap' })}
                          className={cn(
                            'flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors',
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
                            'flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors',
                            settings.controlMode === 'joystick'
                              ? 'bg-amber-600 text-white'
                              : 'bg-amber-900/50 text-amber-300 hover:bg-amber-800/50'
                          )}
                        >
                          Joystick
                        </button>
                      </div>
                    </div>
                    <Separator className="bg-amber-700/30 my-1" />
                    <SettingToggle
                      label="Haptic Feedback"
                      description="Vibration on interactions"
                      enabled={settings.haptics}
                      onChange={(v) => updateSettings({ haptics: v })}
                    />
                  </CardContent>
                </Card>

                {/* Display */}
                <Card className="bg-amber-900/30 border-amber-700/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-amber-300 font-medium text-sm mb-2">
                      <DisplayIcon />
                      Display
                    </div>
                    <SettingToggle
                      label="Show Minimap"
                      enabled={settings.showMinimap}
                      onChange={(v) => updateSettings({ showMinimap: v })}
                    />
                    <Separator className="bg-amber-700/30 my-1" />
                    <SettingToggle
                      label="Low Power Mode"
                      description="Reduce effects for battery"
                      enabled={settings.lowPowerMode}
                      onChange={(v) => updateSettings({ lowPowerMode: v })}
                    />
                    <Separator className="bg-amber-700/30 my-1" />
                    <SettingToggle
                      label="Reduced Motion"
                      description="Minimize animations"
                      enabled={settings.reducedMotion}
                      onChange={(v) => updateSettings({ reducedMotion: v })}
                    />
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Version Footer */}
        <div className="absolute bottom-2 sm:bottom-2 left-0 right-0 text-center pb-safe">
          <p className="text-amber-600/40 text-[9px] sm:text-[10px]">Iron Frontier v0.1</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
