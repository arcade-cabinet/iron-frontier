// ShopPanel.tsx - Buy/sell interface with NativeWind
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button, Card, Modal } from '../../ui';

interface ShopItem {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string;
  inStock: number;
}

interface ShopPanelProps {
  visible: boolean;
  shopName: string;
  shopItems: ShopItem[];
  playerGold: number;
  playerItems: ShopItem[];
  onClose: () => void;
  onBuyItem: (itemId: string) => void;
  onSellItem: (itemId: string) => void;
}

export function ShopPanel({
  visible,
  shopName,
  shopItems,
  playerGold,
  playerItems,
  onClose,
  onBuyItem,
  onSellItem,
}: ShopPanelProps) {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

  const items = tab === 'buy' ? shopItems : playerItems;

  return (
    <Modal visible={visible} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>{shopName}</ModalTitle>
        <ModalDescription>Your gold: {playerGold}g</ModalDescription>
      </ModalHeader>

      <ModalContent>
        {/* Tabs */}
        <View className="flex-row mb-4 border-b border-brass-700">
          <TouchableOpacity
            onPress={() => {
              setTab('buy');
              setSelectedItem(null);
            }}
            className={`flex-1 py-3 items-center ${
              tab === 'buy' ? 'border-b-2 border-brass-600' : ''
            }`}
          >
            <Text className={tab === 'buy' ? 'text-brass-300 font-bold' : 'text-brass-400'}>
              Buy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setTab('sell');
              setSelectedItem(null);
            }}
            className={`flex-1 py-3 items-center ${
              tab === 'sell' ? 'border-b-2 border-brass-600' : ''
            }`}
          >
            <Text className={tab === 'sell' ? 'text-brass-300 font-bold' : 'text-brass-400'}>
              Sell
            </Text>
          </TouchableOpacity>
        </View>

        {/* Item list */}
        <ScrollView className="flex-1">
          {items.length === 0 ? (
            <View className="items-center justify-center py-8">
              <Text className="text-brass-400 italic">
                {tab === 'buy' ? 'No items for sale' : 'No items to sell'}
              </Text>
            </View>
          ) : (
            items.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedItem(item)}
                className="mb-2"
              >
                <Card className="bg-steam-800 border-brass-700">
                  <View className="p-3 flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className="text-brass-300 font-bold">{item.name}</Text>
                      <Text className="text-brass-400 text-sm" numberOfLines={1}>
                        {item.description}
                      </Text>
                    </View>
                    <View className="items-end ml-4">
                      <Text className="text-brass-400 font-bold">{item.price}g</Text>
                      {tab === 'buy' && item.inStock > 0 && (
                        <Text className="text-brass-400 text-xs">Stock: {item.inStock}</Text>
                      )}
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Item details */}
        {selectedItem && (
          <View className="mt-4 p-4 bg-steam-800 border border-brass-700 rounded">
            <Text className="text-brass-300 font-bold text-lg mb-2">{selectedItem.name}</Text>
            <Text className="text-brass-400 text-sm mb-3">{selectedItem.description}</Text>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-brass-400">Price:</Text>
              <Text className="text-brass-400 font-bold">{selectedItem.price}g</Text>
            </View>

            {tab === 'buy' ? (
              <Button
                onPress={() => onBuyItem(selectedItem.id)}
                variant="primary"
                disabled={playerGold < selectedItem.price || selectedItem.inStock === 0}
              >
                <Text className="text-steam-900 font-bold">
                  {playerGold < selectedItem.price
                    ? 'Not enough gold'
                    : selectedItem.inStock === 0
                    ? 'Out of stock'
                    : 'Buy'}
                </Text>
              </Button>
            ) : (
              <Button onPress={() => onSellItem(selectedItem.id)} variant="primary">
                <Text className="text-steam-900 font-bold">Sell</Text>
              </Button>
            )}
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
