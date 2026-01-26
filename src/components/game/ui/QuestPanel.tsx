// QuestPanel.tsx - Quest log with active/completed tabs
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button, Card, Modal } from '../../ui';

interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  reward?: string;
  completed: boolean;
}

interface QuestPanelProps {
  visible: boolean;
  activeQuests: Quest[];
  completedQuests: Quest[];
  onClose: () => void;
  onTrackQuest: (questId: string) => void;
}

export function QuestPanel({
  visible,
  activeQuests,
  completedQuests,
  onClose,
  onTrackQuest,
}: QuestPanelProps) {
  const [tab, setTab] = useState<'active' | 'completed'>('active');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  const quests = tab === 'active' ? activeQuests : completedQuests;

  return (
    <Modal visible={visible} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Quest Journal</ModalTitle>
        <ModalDescription>
          {activeQuests.length} active • {completedQuests.length} completed
        </ModalDescription>
      </ModalHeader>

      <ModalContent>
        {/* Tabs */}
        <View className="flex-row mb-4 border-b border-brass-700">
          <TouchableOpacity
            onPress={() => setTab('active')}
            className={`flex-1 py-3 items-center ${
              tab === 'active' ? 'border-b-2 border-brass-600' : ''
            }`}
          >
            <Text className={tab === 'active' ? 'text-brass-300 font-bold' : 'text-brass-400'}>
              Active ({activeQuests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab('completed')}
            className={`flex-1 py-3 items-center ${
              tab === 'completed' ? 'border-b-2 border-brass-600' : ''
            }`}
          >
            <Text className={tab === 'completed' ? 'text-brass-300 font-bold' : 'text-brass-400'}>
              Completed ({completedQuests.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quest list */}
        <ScrollView className="flex-1">
          {quests.length === 0 ? (
            <View className="items-center justify-center py-8">
              <Text className="text-brass-400 italic">
                {tab === 'active' ? 'No active quests' : 'No completed quests'}
              </Text>
            </View>
          ) : (
            quests.map((quest) => (
              <TouchableOpacity
                key={quest.id}
                onPress={() => setSelectedQuest(quest)}
                className="mb-3"
              >
                <Card className="bg-steam-800 border-brass-700">
                  <View className="p-4">
                    <Text className="text-brass-300 font-bold text-lg mb-2">{quest.title}</Text>
                    <Text className="text-brass-400 text-sm mb-2" numberOfLines={2}>
                      {quest.description}
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-brass-400 text-xs">
                        {quest.objectives.filter((obj) => obj.completed).length}/
                        {quest.objectives.length} objectives
                      </Text>
                      {quest.reward && (
                        <Text className="text-brass-400 text-xs ml-4">Reward: {quest.reward}</Text>
                      )}
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Quest details */}
        {selectedQuest && (
          <View className="mt-4 p-4 bg-steam-800 border border-brass-700 rounded">
            <Text className="text-brass-300 font-bold text-lg mb-2">{selectedQuest.title}</Text>
            <Text className="text-brass-400 text-sm mb-3">{selectedQuest.description}</Text>

            <Text className="text-brass-300 font-bold mb-2">Objectives:</Text>
            {selectedQuest.objectives.map((obj) => (
              <View key={obj.id} className="flex-row items-start mb-2">
                <Text className={obj.completed ? 'text-brass-400' : 'text-brass-300'}>
                  {obj.completed ? '✓' : '○'} {obj.description}
                </Text>
              </View>
            ))}

            {selectedQuest.reward && (
              <View className="mt-3 pt-3 border-t border-steam-700">
                <Text className="text-brass-400 text-sm">Reward: {selectedQuest.reward}</Text>
              </View>
            )}

            {tab === 'active' && (
              <Button
                onPress={() => onTrackQuest(selectedQuest.id)}
                variant="primary"
                className="mt-3"
              >
                <Text className="text-steam-900 font-bold">Track Quest</Text>
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
