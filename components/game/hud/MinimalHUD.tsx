// MinimalHUD.tsx - Portrait phone HUD (minimal UI)
// Shows only essential info: health, level, gold
import React from 'react';
import { Text, View } from 'react-native';
import { Progress } from '../../ui';

interface MinimalHUDProps {
  playerName: string;
  level: number;
  health: number;
  maxHealth: number;
  gold: number;
}

export function MinimalHUD({ playerName, level, health, maxHealth, gold }: MinimalHUDProps) {
  const healthPercent = (health / maxHealth) * 100;

  return (
    <View className="absolute top-0 left-0 right-0 p-2 bg-steam-900/80 border-b-2 border-brass-700">
      {/* Top row: Name and Level */}
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-brass-300 font-bold text-sm">{playerName}</Text>
        <Text className="text-brass-300 text-xs">Lv {level}</Text>
      </View>

      {/* Health bar */}
      <View className="mb-1">
        <Progress value={healthPercent} variant="health" size="sm" />
      </View>

      {/* Gold */}
      <View className="flex-row justify-end">
        <Text className="text-brass-400 text-xs">{gold}g</Text>
      </View>
    </View>
  );
}
