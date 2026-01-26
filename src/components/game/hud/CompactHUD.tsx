// CompactHUD.tsx - Landscape phone HUD (compact UI)
// Shows health, XP, gold, and current quest in a compact layout
import React from 'react';
import { Text, View } from 'react-native';
import { Progress } from '../../ui';

interface CompactHUDProps {
  playerName: string;
  level: number;
  health: number;
  maxHealth: number;
  xp: number;
  xpToNextLevel: number;
  gold: number;
  currentQuest?: string;
}

export function CompactHUD({
  playerName,
  level,
  health,
  maxHealth,
  xp,
  xpToNextLevel,
  gold,
  currentQuest,
}: CompactHUDProps) {
  const healthPercent = (health / maxHealth) * 100;
  const xpPercent = (xp / xpToNextLevel) * 100;

  return (
    <View className="absolute top-0 left-0 right-0 p-3 bg-steam-900/90 border-b-2 border-brass-700">
      <View className="flex-row justify-between items-start">
        {/* Left side: Player info */}
        <View className="flex-1 mr-4">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-brass-300 font-bold">{playerName}</Text>
            <Text className="text-brass-300 text-sm">Lv {level}</Text>
          </View>

          {/* Health bar */}
          <View className="mb-1">
            <Progress value={healthPercent} variant="health" size="sm" />
            <Text className="text-brass-400 text-xs mt-0.5">
              {health}/{maxHealth} HP
            </Text>
          </View>

          {/* XP bar */}
          <View>
            <Progress value={xpPercent} variant="experience" size="sm" />
            <Text className="text-brass-400 text-xs mt-0.5">
              {xp}/{xpToNextLevel} XP
            </Text>
          </View>
        </View>

        {/* Right side: Gold and quest */}
        <View className="items-end">
          <Text className="text-brass-400 font-bold mb-2">{gold}g</Text>
          {currentQuest && (
            <View className="bg-steam-800 px-2 py-1 rounded border border-brass-700">
              <Text className="text-brass-300 text-xs" numberOfLines={2}>
                {currentQuest}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
