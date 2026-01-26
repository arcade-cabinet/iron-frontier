import { Tabs } from 'expo-router';
import { View } from 'react-native';

// Simple icon placeholders (replace with actual icons later)
function GameIcon({ color }: { color: string }) {
  return <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 4 }} />;
}

function InventoryIcon({ color }: { color: string }) {
  return <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 12 }} />;
}

function SettingsIcon({ color }: { color: string }) {
  return <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 2 }} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1c1917', // steam-900
          borderTopColor: '#a16207', // brass-700
          borderTopWidth: 2,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#fde047', // brass-300
        tabBarInactiveTintColor: '#78716c', // steam-500
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Game',
          tabBarIcon: ({ color }) => <GameIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color }) => <InventoryIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="ui-test"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}

