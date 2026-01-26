// FullHUD.tsx - Tablet/foldable HUD (full UI)
// Shows all info: health, XP, stamina, gold, quest tracker, minimap placeholder
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Progress } from '../../ui';

interface Quest {
  id: string;
  title: string;
  progress: string;
}

interface FullHUDProps {
  playerName: string;
  level: number;
  health: number;
  maxHealth: number;
  xp: number;
  xpToNextLevel: number;
  stamina: number;
  maxStamina: number;
  gold: number;
  location: string;
  activeQuests: Quest[];
}

export function FullHUD({
  playerName,
  level,
  health,
  maxHealth,
  xp,
  xpToNextLevel,
  stamina,
  maxStamina,
  gold,
  location,
  activeQuests,
}: FullHUDProps) {
  const healthPercent = (health / maxHealth) * 100;
  const xpPercent = (xp / xpToNextLevel) * 100;
  const staminaPercent = (stamina / maxStamina) * 100;

  return (
    <View className="absolute top-0 left-0 right-0 p-4 bg-steam-900/95 border-b-2 border-brass-700">
      <View className="flex-row justify-between">
        {/* Left panel: Player stats */}
        <View className="flex-1 mr-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-brass-300 font-bold text-lg">{playerName}</Text>
            <Text className="text-brass-300">Level {level}</Text>
          </View>

          {/* Health */}
          <View className="mb-2">
            <Text className="text-brass-400 text-xs mb-1">Health</Text>
            <Progress value={healthPercent} variant="health" size="default" />
            <Text className="text-brass-400 text-xs mt-0.5">
              {health}/{maxHealth}
            </Text>
          </View>

          {/* XP */}
          <View className="mb-2">
            <Text className="text-brass-400 text-xs mb-1">Experience</Text>
            <Progress value={xpPercent} variant="experience" size="default" />
            <Text className="text-brass-400 text-xs mt-0.5">
              {xp}/{xpToNextLevel}
            </Text>
          </View>

          {/* Stamina */}
          <View className="mb-2">
            <Text className="text-brass-400 text-xs mb-1">Stamina</Text>
            <Progress value={staminaPercent} variant="mana" size="default" />
            <Text className="text-brass-400 text-xs mt-0.5">
              {stamina}/{maxStamina}
            </Text>
          </View>

          {/* Gold and Location */}
          <View className="flex-row justify-between mt-2">
            <Text className="text-brass-400 font-bold">{gold} Gold</Text>
            <Text className="text-brass-400 text-sm">{location}</Text>
          </View>
        </View>

        {/* Right panel: Quest tracker */}
        <View className="w-64 bg-steam-800 rounded border border-brass-700 p-3">
          <Text className="text-brass-300 font-bold mb-2">Active Quests</Text>
          <ScrollView className="max-h-32">
            {activeQuests.length === 0 ? (
              <Text className="text-brass-400 text-sm italic">No active quests</Text>
            ) : (
              activeQuests.map((quest) => (
                <View key={quest.id} className="mb-2 pb-2 border-b border-steam-700">
                  <Text className="text-brass-300 text-sm font-semibold" numberOfLines={1}>
                    {quest.title}
                  </Text>
                  <Text className="text-brass-400 text-xs mt-0.5" numberOfLines={2}>
                    {quest.progress}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
