// ActionBar.tsx - Bottom navigation with NativeWind
// Responsive: larger touch targets on mobile, adaptive layout
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Card } from '../../ui';

// Simple icon components using View (replace with actual icons later)
function MenuIcon() {
  return <View className="w-6 h-6 bg-brass-300 rounded" />;
}

function SaddlebagIcon() {
  return <View className="w-6 h-6 bg-brass-300 rounded" />;
}

function JournalIcon() {
  return <View className="w-6 h-6 bg-brass-300 rounded" />;
}

function MapIcon() {
  return <View className="w-6 h-6 bg-brass-300 rounded" />;
}

function WantedPosterIcon() {
  return <View className="w-6 h-6 bg-brass-300 rounded" />;
}

interface ActionBarProps {
  activePanel?: string;
  inventoryCount: number;
  activeQuestCount: number;
  onTogglePanel: (panel: string) => void;
  onOpenMap?: () => void;
}

export function ActionBar({
  activePanel,
  inventoryCount,
  activeQuestCount,
  onTogglePanel,
  onOpenMap,
}: ActionBarProps) {
  const isActive = (panel: string) => activePanel === panel;

  const ActionButton = ({
    icon: Icon,
    label,
    panel,
    badge,
    onPress,
  }: {
    icon: React.ComponentType;
    label: string;
    panel?: string;
    badge?: number;
    onPress?: () => void;
  }) => {
    const active = panel && isActive(panel);
    return (
      <TouchableOpacity
        onPress={onPress || (() => panel && onTogglePanel(panel))}
        className={`flex-1 items-center justify-center py-3 px-2 rounded-lg min-h-[56px] ${
          active ? 'bg-brass-700/60' : 'bg-transparent'
        }`}
        activeOpacity={0.7}
      >
        <View className="relative">
          <Icon />
          {badge !== undefined && badge > 0 && (
            <View className="absolute -top-1 -right-1 bg-brass-600 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
              <Text className="text-white text-[9px] font-bold">{badge}</Text>
            </View>
          )}
        </View>
        <Text className={`text-[10px] font-medium mt-1 ${active ? 'text-brass-100' : 'text-brass-300/80'}`}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="absolute bottom-0 left-0 right-0 p-2">
      <Card className="bg-steam-950/95 border-brass-800/60">
        <View className="flex-row justify-around items-center p-1">
          <ActionButton icon={WantedPosterIcon} label="Outlaw" panel="character" />
          <ActionButton icon={MapIcon} label="Territory" onPress={onOpenMap} />
          <ActionButton icon={SaddlebagIcon} label="Saddlebag" panel="inventory" badge={inventoryCount} />
          <ActionButton icon={JournalIcon} label="Journal" panel="quests" badge={activeQuestCount} />
          <ActionButton icon={MenuIcon} label="Menu" panel="menu" />
        </View>
      </Card>
    </View>
  );
}
