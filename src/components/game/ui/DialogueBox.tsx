// DialogueBox.tsx - FF7-style branching dialogue with NativeWind
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button, Card } from '../../ui';

interface DialogueChoice {
  id: string;
  text: string;
  condition?: boolean;
}

interface DialogueBoxProps {
  npcName: string;
  npcRole?: string;
  text: string;
  choices: DialogueChoice[];
  onSelectChoice: (choiceId: string) => void;
  onClose: () => void;
  typewriterSpeed?: number;
}

export function DialogueBox({
  npcName,
  npcRole,
  text,
  choices,
  onSelectChoice,
  onClose,
  typewriterSpeed = 30,
}: DialogueBoxProps) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showChoices, setShowChoices] = useState(false);

  // Typewriter effect
  useEffect(() => {
    if (!text) return;

    setDisplayText('');
    setIsTyping(true);
    setShowChoices(false);

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        setShowChoices(true);
        clearInterval(interval);
      }
    }, typewriterSpeed);

    return () => clearInterval(interval);
  }, [text, typewriterSpeed]);

  const handleSkipTyping = () => {
    if (isTyping) {
      setDisplayText(text);
      setIsTyping(false);
      setShowChoices(true);
    }
  };

  return (
    <View className="absolute bottom-20 left-0 right-0 p-4">
      <Card className="bg-steam-900/95 border-brass-700">
        {/* NPC Header */}
        <View className="border-b border-brass-700 p-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-brass-300 font-bold text-lg">{npcName}</Text>
              {npcRole && <Text className="text-brass-400 text-sm">{npcRole}</Text>}
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Text className="text-brass-400 text-xl">×</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dialogue Text */}
        <TouchableOpacity onPress={handleSkipTyping} activeOpacity={0.9}>
          <View className="p-4 min-h-[120px]">
            <Text className="text-brass-100 text-base leading-6">
              {displayText}
              {isTyping && <Text className="text-brass-400">▊</Text>}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Choices */}
        {showChoices && choices.length > 0 && (
          <View className="border-t border-brass-700 p-3">
            <ScrollView className="max-h-48">
              {choices.map((choice, index) => (
                <TouchableOpacity
                  key={choice.id}
                  onPress={() => onSelectChoice(choice.id)}
                  className="mb-2"
                  disabled={choice.condition === false}
                >
                  <View
                    className={`p-3 rounded border ${
                      choice.condition === false
                        ? 'bg-steam-800/50 border-steam-700'
                        : 'bg-steam-800 border-brass-700'
                    }`}
                  >
                    <Text
                      className={`text-base ${
                        choice.condition === false ? 'text-brass-400/50' : 'text-brass-300'
                      }`}
                    >
                      {index + 1}. {choice.text}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Continue indicator (no choices) */}
        {showChoices && choices.length === 0 && (
          <View className="border-t border-brass-700 p-3">
            <Button onPress={onClose} variant="primary">
              <Text className="text-steam-900 font-bold">Continue</Text>
            </Button>
          </View>
        )}
      </Card>
    </View>
  );
}
