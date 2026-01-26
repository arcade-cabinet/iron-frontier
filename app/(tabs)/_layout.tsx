import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1c1917', // steam-900
          borderTopColor: '#a16207', // brass-700
          borderTopWidth: 2,
        },
        tabBarActiveTintColor: '#fde047', // brass-300
        tabBarInactiveTintColor: '#78716c', // steam-500
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Game',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, backgroundColor: color }} />
          ),
        }}
      />
    </Tabs>
  );
}
