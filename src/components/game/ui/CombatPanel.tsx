// CombatPanel.tsx - Turn-based combat UI with NativeWind
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button, Card, Progress } from '../../ui';

interface CombatAction {
  id: string;
  name: string;
  apCost: number;
  description: string;
  disabled?: boolean;
}

interface Combatant {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  ap: number;
  maxAP: number;
  isPlayer: boolean;
}

interface CombatPanelProps {
  player: Combatant;
  enemies: Combatant[];
  actions: CombatAction[];
  currentTurn: string;
  combatLog: string[];
  onSelectAction: (actionId: string, targetId: string) => void;
  onEndTurn: () => void;
  onFlee: () => void;
}

export function CombatPanel({
  player,
  enemies,
  actions,
  currentTurn,
  combatLog,
  onSelectAction,
  onEndTurn,
  onFlee,
}: CombatPanelProps) {
  const [selectedAction, setSelectedAction] = React.useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = React.useState<string | null>(null);

  const isPlayerTurn = currentTurn === player.id;

  const handleActionSelect = (actionId: string) => {
    setSelectedAction(actionId);
    setSelectedTarget(null);
  };

  const handleTargetSelect = (targetId: string) => {
    if (selectedAction) {
      onSelectAction(selectedAction, targetId);
      setSelectedAction(null);
      setSelectedTarget(null);
    }
  };

  return (
    <View className="flex-1 bg-steam-950 p-4">
      {/* Player status */}
      <Card className="mb-4 bg-steam-900 border-brass-700">
        <View className="p-4">
          <Text className="text-brass-300 font-bold text-lg mb-2">{player.name}</Text>
          <View className="mb-2">
            <Text className="text-brass-400 text-xs mb-1">Health</Text>
            <Progress value={(player.health / player.maxHealth) * 100} variant="health" size="default" />
            <Text className="text-brass-400 text-xs mt-1">
              {player.health}/{player.maxHealth}
            </Text>
          </View>
          <View>
            <Text className="text-brass-400 text-xs mb-1">Action Points</Text>
            <Progress value={(player.ap / player.maxAP) * 100} variant="mana" size="default" />
            <Text className="text-brass-400 text-xs mt-1">
              {player.ap}/{player.maxAP} AP
            </Text>
          </View>
        </View>
      </Card>

      {/* Enemies */}
      <View className="mb-4">
        <Text className="text-brass-300 font-bold mb-2">Enemies</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {enemies.map((enemy) => (
              <TouchableOpacity
                key={enemy.id}
                onPress={() => handleTargetSelect(enemy.id)}
                disabled={!selectedAction}
                className={`w-32 p-3 rounded border ${
                  selectedTarget === enemy.id
                    ? 'bg-brass-700 border-brass-600'
                    : 'bg-steam-800 border-steam-700'
                }`}
              >
                <Text className="text-brass-300 font-bold text-sm mb-2" numberOfLines={1}>
                  {enemy.name}
                </Text>
                <Progress value={(enemy.health / enemy.maxHealth) * 100} variant="health" size="sm" />
                <Text className="text-brass-400 text-xs mt-1">
                  {enemy.health}/{enemy.maxHealth}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Actions */}
      {isPlayerTurn && (
        <View className="mb-4">
          <Text className="text-brass-300 font-bold mb-2">Actions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {actions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  onPress={() => handleActionSelect(action.id)}
                  disabled={action.disabled}
                  className={`w-32 p-3 rounded border ${
                    selectedAction === action.id
                      ? 'bg-brass-700 border-brass-600'
                      : action.disabled
                      ? 'bg-steam-800/50 border-steam-700'
                      : 'bg-steam-800 border-steam-700'
                  }`}
                >
                  <Text
                    className={`font-bold text-sm mb-1 ${
                      action.disabled ? 'text-brass-400/50' : 'text-brass-300'
                    }`}
                  >
                    {action.name}
                  </Text>
                  <Text className="text-brass-400 text-xs mb-2">{action.apCost} AP</Text>
                  <Text className="text-brass-400 text-xs" numberOfLines={2}>
                    {action.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Combat log */}
      <View className="flex-1 mb-4">
        <Text className="text-brass-300 font-bold mb-2">Combat Log</Text>
        <ScrollView className="flex-1 bg-steam-900 border border-brass-700 rounded p-3">
          {combatLog.map((entry, index) => (
            <Text key={index} className="text-brass-400 text-sm mb-1">
              {entry}
            </Text>
          ))}
        </ScrollView>
      </View>

      {/* Control buttons */}
      <View className="flex-row gap-2">
        <Button onPress={onEndTurn} variant="default" className="flex-1" disabled={!isPlayerTurn}>
          <Text className="text-steam-900 font-bold">End Turn</Text>
        </Button>
        <Button onPress={onFlee} variant="secondary" className="flex-1">
          <Text className="text-brass-300 font-bold">Flee</Text>
        </Button>
      </View>
    </View>
  );
}
