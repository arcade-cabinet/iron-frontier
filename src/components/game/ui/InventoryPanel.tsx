// InventoryPanel.tsx - Grid-based inventory with NativeWind
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
    Button,
    Modal,
    ModalContent,
    ModalDescription,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from '../../ui';

interface InventoryItem {
  id: string;
  name: string;
  type: string;
  quantity: number;
  icon?: string;
  description?: string;
}

interface InventoryPanelProps {
  visible: boolean;
  items: InventoryItem[];
  onClose: () => void;
  onUseItem: (itemId: string) => void;
  onDropItem: (itemId: string) => void;
}

export function InventoryPanel({ visible, items, onClose, onUseItem, onDropItem }: InventoryPanelProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const categories = ['all', 'weapons', 'armor', 'consumables', 'materials', 'quest'];

  const filteredItems = filter === 'all' ? items : items.filter((item) => item.type === filter);

  return (
    <Modal visible={visible} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Saddlebag</ModalTitle>
        <ModalDescription>
          {items.length} items • Weight: {items.reduce((sum, item) => sum + item.quantity, 0)} lbs
        </ModalDescription>
      </ModalHeader>

      <ModalContent>
        {/* Category filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setFilter(cat)}
                className={`px-4 py-2 rounded border ${
                  filter === cat
                    ? 'bg-brass-700 border-brass-600'
                    : 'bg-steam-800 border-steam-700'
                }`}
              >
                <Text className={filter === cat ? 'text-brass-100 font-bold' : 'text-brass-400'}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Item grid */}
        <ScrollView className="flex-1">
          <View className="flex-row flex-wrap gap-2">
            {filteredItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedItem(item)}
                className="w-[30%] aspect-square bg-steam-800 border border-brass-700 rounded p-2 items-center justify-center"
              >
                {item.icon ? (
                  <Image source={{ uri: item.icon }} className="w-12 h-12" />
                ) : (
                  <View className="w-12 h-12 bg-brass-700 rounded" />
                )}
                <Text className="text-brass-300 text-xs mt-1 text-center" numberOfLines={1}>
                  {item.name}
                </Text>
                {item.quantity > 1 && (
                  <View className="absolute top-1 right-1 bg-brass-600 rounded-full w-5 h-5 items-center justify-center">
                    <Text className="text-white text-[10px] font-bold">{item.quantity}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Item details */}
        {selectedItem && (
          <View className="mt-4 p-4 bg-steam-800 border border-brass-700 rounded">
            <Text className="text-brass-300 font-bold text-lg mb-2">{selectedItem.name}</Text>
            <Text className="text-brass-400 text-sm mb-3">{selectedItem.description}</Text>
            <View className="flex-row gap-2">
              <Button onPress={() => onUseItem(selectedItem.id)} variant="default" className="flex-1">
                <Text className="text-steam-900 font-bold">Use</Text>
              </Button>
              <Button onPress={() => onDropItem(selectedItem.id)} variant="secondary" className="flex-1">
                <Text className="text-brass-300 font-bold">Drop</Text>
              </Button>
            </View>
          </View>
        )}
      </ModalContent>

      <ModalFooter>
        <Button onPress={onClose} variant="secondary">
          <Text className="text-brass-300 font-bold">Close</Text>
        </Button>
      </ModalFooter>
    </Modal>
  );
}
