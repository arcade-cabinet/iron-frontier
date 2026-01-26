// Inventory tab screen
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InventoryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-steam-950">
      <View className="flex-1 p-4">
        <Text className="text-brass-300 font-bold text-2xl mb-4">Inventory</Text>
        <ScrollView className="flex-1">
          <View className="bg-steam-900 border border-brass-700 rounded p-4">
            <Text className="text-brass-400">
              Inventory screen - will integrate with InventoryPanel component
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
