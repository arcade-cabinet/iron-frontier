// SettingsPanel.tsx - Game settings with NativeWind
import React from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import {
    Button,
    Modal,
    ModalContent,
    ModalDescription,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from '../../ui';

interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  reducedMotion: boolean;
  haptics: boolean;
  autoSave: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
}

interface SettingsPanelProps {
  visible: boolean;
  settings: GameSettings;
  onClose: () => void;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onSaveGame: () => void;
  onLoadGame: () => void;
  onQuitToMenu: () => void;
}

export function SettingsPanel({
  visible,
  settings,
  onClose,
  onUpdateSettings,
  onSaveGame,
  onLoadGame,
  onQuitToMenu,
}: SettingsPanelProps) {
  return (
    <Modal visible={visible} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Settings</ModalTitle>
        <ModalDescription>Game options and preferences</ModalDescription>
      </ModalHeader>

      <ModalContent>
        <ScrollView className="flex-1">
          {/* Audio Settings */}
          <View className="mb-6">
            <Text className="text-brass-300 font-bold text-lg mb-3">Audio</Text>

            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-brass-400">Music Volume</Text>
                <Text className="text-brass-400">{Math.round(settings.musicVolume * 100)}%</Text>
              </View>
              {/* Slider would go here - simplified for now */}
              <View className="h-2 bg-steam-800 rounded-full">
                <View
                  className="h-2 bg-brass-600 rounded-full"
                  style={{ width: `${settings.musicVolume * 100}%` }}
                />
              </View>
            </View>

            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-brass-400">SFX Volume</Text>
                <Text className="text-brass-400">{Math.round(settings.sfxVolume * 100)}%</Text>
              </View>
              <View className="h-2 bg-steam-800 rounded-full">
                <View
                  className="h-2 bg-brass-600 rounded-full"
                  style={{ width: `${settings.sfxVolume * 100}%` }}
                />
              </View>
            </View>
          </View>

          {/* Accessibility */}
          <View className="mb-6">
            <Text className="text-brass-300 font-bold text-lg mb-3">Accessibility</Text>

            <View className="flex-row justify-between items-center mb-3 p-3 bg-steam-800 rounded">
              <Text className="text-brass-400">Reduced Motion</Text>
              <Switch
                value={settings.reducedMotion}
                onValueChange={(value) => onUpdateSettings({ reducedMotion: value })}
              />
            </View>

            <View className="flex-row justify-between items-center mb-3 p-3 bg-steam-800 rounded">
              <Text className="text-brass-400">Haptic Feedback</Text>
              <Switch
                value={settings.haptics}
                onValueChange={(value) => onUpdateSettings({ haptics: value })}
              />
            </View>
          </View>

          {/* Gameplay */}
          <View className="mb-6">
            <Text className="text-brass-300 font-bold text-lg mb-3">Gameplay</Text>

            <View className="flex-row justify-between items-center mb-3 p-3 bg-steam-800 rounded">
              <Text className="text-brass-400">Auto-Save</Text>
              <Switch
                value={settings.autoSave}
                onValueChange={(value) => onUpdateSettings({ autoSave: value })}
              />
            </View>

            <View className="mb-3">
              <Text className="text-brass-400 mb-2">Difficulty</Text>
              <View className="flex-row gap-2">
                {(['easy', 'normal', 'hard'] as const).map((diff) => (
                  <TouchableOpacity
                    key={diff}
                    onPress={() => onUpdateSettings({ difficulty: diff })}
                    className={`flex-1 py-3 rounded border ${
                      settings.difficulty === diff
                        ? 'bg-brass-700 border-brass-600'
                        : 'bg-steam-800 border-steam-700'
                    }`}
                  >
                    <Text
                      className={`text-center ${
                        settings.difficulty === diff ? 'text-brass-100 font-bold' : 'text-brass-400'
                      }`}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Game Actions */}
          <View className="mb-6">
            <Text className="text-brass-300 font-bold text-lg mb-3">Game</Text>

            <Button onPress={onSaveGame} variant="default" className="mb-2">
              <Text className="text-steam-900 font-bold">Save Game</Text>
            </Button>

            <Button onPress={onLoadGame} variant="secondary" className="mb-2">
              <Text className="text-brass-300 font-bold">Load Game</Text>
            </Button>

            <Button onPress={onQuitToMenu} variant="secondary">
              <Text className="text-brass-300 font-bold">Quit to Menu</Text>
            </Button>
          </View>
        </ScrollView>
      </ModalContent>

      <ModalFooter>
        <Button onPress={onClose} variant="secondary">
          <Text className="text-brass-300 font-bold">Close</Text>
        </Button>
      </ModalFooter>
    </Modal>
  );
}
