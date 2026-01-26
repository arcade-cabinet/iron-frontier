/**
 * SettingsScreen Component
 *
 * Game settings menu with audio, display, gameplay, and accessibility options.
 *
 * @example
 * ```tsx
 * <SettingsScreen
 *   open={showSettings}
 *   onClose={() => setShowSettings(false)}
 *   settings={gameSettings}
 *   onSettingsChange={(newSettings) => updateSettings(newSettings)}
 * />
 * ```
 */

import * as React from 'react';
import { cn } from '../primitives/utils';
import type { MenuBaseProps, GameSettings } from './types';
import {
  CloseIcon,
  MenuOverlay,
  MenuPanel,
  Select,
  Slider,
  TabGroup,
  Toggle,
  VolumeIcon,
} from './shared';

export interface SettingsScreenProps extends MenuBaseProps {
  /** Current settings */
  settings?: Partial<GameSettings>;
  /** Callback when settings change */
  onSettingsChange?: (settings: Partial<GameSettings>) => void;
  /** Callback to reset settings to defaults */
  onResetDefaults?: () => void;
}

type SettingsTab = 'audio' | 'display' | 'gameplay' | 'accessibility';

const SETTINGS_TABS: { id: SettingsTab; label: string }[] = [
  { id: 'audio', label: 'Audio' },
  { id: 'display', label: 'Display' },
  { id: 'gameplay', label: 'Gameplay' },
  { id: 'accessibility', label: 'Access.' },
];

const TEXT_SPEED_OPTIONS = [
  { value: 'slow', label: 'Slow' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Fast' },
  { value: 'instant', label: 'Instant' },
];

const AUTO_SAVE_OPTIONS = [
  { value: 'off', label: 'Off' },
  { value: '5min', label: 'Every 5 min' },
  { value: '10min', label: 'Every 10 min' },
  { value: '15min', label: 'Every 15 min' },
];

const COLORBLIND_OPTIONS = [
  { value: 'off', label: 'Off' },
  { value: 'protanopia', label: 'Protanopia (Red-blind)' },
  { value: 'deuteranopia', label: 'Deuteranopia (Green-blind)' },
  { value: 'tritanopia', label: 'Tritanopia (Blue-blind)' },
];

const CONTROL_MODE_OPTIONS = [
  { value: 'tap', label: 'Tap to Move' },
  { value: 'joystick', label: 'Virtual Joystick' },
];

// Default settings
const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 70,
  sfxVolume: 80,
  fullscreen: false,
  uiScale: 100,
  textSpeed: 'normal',
  autoSaveFrequency: '10min',
  colorblindMode: 'off',
  largerText: false,
  showMinimap: true,
  haptics: true,
  controlMode: 'tap',
  reducedMotion: false,
};

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-4">
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
      <div className="flex-1">
        <div className="text-sm text-stone-200">{label}</div>
        {description && (
          <div className="text-xs text-stone-500 mt-0.5">{description}</div>
        )}
      </div>
      <div className="sm:w-48 flex-shrink-0">
        {children}
      </div>
    </div>
  );
}

export function SettingsScreen({
  open = false,
  onClose,
  settings: propSettings,
  onSettingsChange,
  onResetDefaults,
  className,
  testID,
}: SettingsScreenProps) {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>('audio');

  // Merge provided settings with defaults
  const settings: GameSettings = { ...DEFAULT_SETTINGS, ...propSettings };

  const updateSetting = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ) => {
    onSettingsChange?.({ [key]: value });
  };

  return (
    <MenuOverlay open={open} onClose={onClose} className={className}>
      <div
        data-testid={testID}
        className="h-full flex flex-col sm:items-center sm:justify-center sm:p-4"
      >
        <MenuPanel maxWidth="lg" className="sm:max-h-[80vh] flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-amber-200 tracking-wide uppercase">
              Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </header>

          {/* Tab Navigation */}
          <div className="mb-4">
            <TabGroup
              tabs={SETTINGS_TABS.map((tab) => ({ id: tab.id, label: tab.label }))}
              activeTab={activeTab}
              onTabChange={(id) => setActiveTab(id as SettingsTab)}
            />
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pr-1">
            {activeTab === 'audio' && (
              <div className="space-y-6">
                <SettingsSection title="Volume">
                  <SettingRow label="Music Volume">
                    <Slider
                      value={settings.musicVolume}
                      onChange={(v) => updateSetting('musicVolume', v)}
                      formatValue={(v) => `${v}%`}
                    />
                  </SettingRow>
                  <SettingRow label="Sound Effects">
                    <Slider
                      value={settings.sfxVolume}
                      onChange={(v) => updateSetting('sfxVolume', v)}
                      formatValue={(v) => `${v}%`}
                    />
                  </SettingRow>
                </SettingsSection>

                <SettingsSection title="Feedback">
                  <SettingRow
                    label="Haptic Feedback"
                    description="Vibration on mobile devices"
                  >
                    <Toggle
                      checked={settings.haptics}
                      onChange={(v) => updateSetting('haptics', v)}
                    />
                  </SettingRow>
                </SettingsSection>
              </div>
            )}

            {activeTab === 'display' && (
              <div className="space-y-6">
                <SettingsSection title="Screen">
                  <SettingRow label="Fullscreen">
                    <Toggle
                      checked={settings.fullscreen}
                      onChange={(v) => updateSetting('fullscreen', v)}
                    />
                  </SettingRow>
                  <SettingRow
                    label="UI Scale"
                    description="Adjust interface size"
                  >
                    <Slider
                      value={settings.uiScale}
                      min={75}
                      max={150}
                      step={5}
                      onChange={(v) => updateSetting('uiScale', v)}
                      formatValue={(v) => `${v}%`}
                    />
                  </SettingRow>
                </SettingsSection>

                <SettingsSection title="HUD">
                  <SettingRow
                    label="Show Minimap"
                    description="Display minimap in corner"
                  >
                    <Toggle
                      checked={settings.showMinimap}
                      onChange={(v) => updateSetting('showMinimap', v)}
                    />
                  </SettingRow>
                </SettingsSection>
              </div>
            )}

            {activeTab === 'gameplay' && (
              <div className="space-y-6">
                <SettingsSection title="Text">
                  <SettingRow
                    label="Text Speed"
                    description="How fast dialogue appears"
                  >
                    <Select
                      value={settings.textSpeed}
                      options={TEXT_SPEED_OPTIONS}
                      onChange={(v) => updateSetting('textSpeed', v as GameSettings['textSpeed'])}
                    />
                  </SettingRow>
                </SettingsSection>

                <SettingsSection title="Saving">
                  <SettingRow
                    label="Auto-Save"
                    description="Automatically save progress"
                  >
                    <Select
                      value={settings.autoSaveFrequency}
                      options={AUTO_SAVE_OPTIONS}
                      onChange={(v) =>
                        updateSetting('autoSaveFrequency', v as GameSettings['autoSaveFrequency'])
                      }
                    />
                  </SettingRow>
                </SettingsSection>

                <SettingsSection title="Controls">
                  <SettingRow
                    label="Control Mode"
                    description="Movement input method"
                  >
                    <Select
                      value={settings.controlMode}
                      options={CONTROL_MODE_OPTIONS}
                      onChange={(v) =>
                        updateSetting('controlMode', v as GameSettings['controlMode'])
                      }
                    />
                  </SettingRow>
                </SettingsSection>
              </div>
            )}

            {activeTab === 'accessibility' && (
              <div className="space-y-6">
                <SettingsSection title="Vision">
                  <SettingRow
                    label="Colorblind Mode"
                    description="Adjust colors for color vision deficiency"
                  >
                    <Select
                      value={settings.colorblindMode}
                      options={COLORBLIND_OPTIONS}
                      onChange={(v) =>
                        updateSetting('colorblindMode', v as GameSettings['colorblindMode'])
                      }
                    />
                  </SettingRow>
                  <SettingRow
                    label="Larger Text"
                    description="Increase text size throughout"
                  >
                    <Toggle
                      checked={settings.largerText}
                      onChange={(v) => updateSetting('largerText', v)}
                    />
                  </SettingRow>
                </SettingsSection>

                <SettingsSection title="Motion">
                  <SettingRow
                    label="Reduced Motion"
                    description="Minimize animations and effects"
                  >
                    <Toggle
                      checked={settings.reducedMotion}
                      onChange={(v) => updateSetting('reducedMotion', v)}
                    />
                  </SettingRow>
                </SettingsSection>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-stone-800/50 flex items-center justify-between">
            {onResetDefaults && (
              <button
                onClick={onResetDefaults}
                className="px-4 py-2 rounded-lg text-sm text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors min-h-[44px]"
              >
                Reset to Defaults
              </button>
            )}
            <p className="text-xs text-stone-600">
              Changes are saved automatically
            </p>
          </div>
        </MenuPanel>
      </div>
    </MenuOverlay>
  );
}

SettingsScreen.displayName = 'SettingsScreen';

export default SettingsScreen;
