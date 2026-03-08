import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { gameOrchestrator } from '@/src/game/GameOrchestrator';

export default function TitleScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasSave, setHasSave] = useState(false);

  // Check for existing save on mount
  useEffect(() => {
    gameOrchestrator.hasSavedGame().then(setHasSave);
  }, []);

  const handleNewGame = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await gameOrchestrator.initGame({ playerName: 'Stranger' });
      router.push('/game');
    } catch (error) {
      console.error('[TitleScreen] Failed to start new game:', error);
      setIsLoading(false);
    }
  }, [isLoading, router]);

  const handleContinue = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const loaded = await gameOrchestrator.continueGame();
      if (loaded) {
        router.push('/game');
      } else {
        // No save found — fall back to new game
        await gameOrchestrator.initGame({ playerName: 'Stranger' });
        router.push('/game');
      }
    } catch (error) {
      console.error('[TitleScreen] Failed to continue game:', error);
      setIsLoading(false);
    }
  }, [isLoading, router]);

  return (
    <View className="flex-1 bg-frontier-night items-center justify-center px-8">
      {/* Decorative top border */}
      <View className="absolute top-0 left-0 right-0 h-1 bg-frontier-brass opacity-40" />

      {/* Title block */}
      <View className="items-center mb-16">
        <Text className="font-display text-5xl text-frontier-dust tracking-widest mb-2">
          IRON
        </Text>
        <View className="w-48 h-px bg-frontier-brass opacity-60 mb-2" />
        <Text className="font-display text-5xl text-frontier-brass tracking-widest">
          FRONTIER
        </Text>
        <Text className="font-body text-sm text-frontier-dust opacity-50 mt-4 tracking-[0.3em] uppercase">
          An Old West Tale
        </Text>
      </View>

      {/* Menu buttons */}
      <View className="w-64 gap-4">
        {isLoading ? (
          <View className="py-6 items-center">
            <ActivityIndicator color="#c4a875" size="large" />
            <Text className="font-body text-sm text-frontier-dust opacity-60 mt-3">
              Loading...
            </Text>
          </View>
        ) : (
          <>
            <MenuButton
              label="New Game"
              onPress={handleNewGame}
            />
            <MenuButton
              label="Continue"
              onPress={handleContinue}
              variant="secondary"
              disabled={!hasSave}
            />
            <MenuButton
              label="Settings"
              onPress={() => {
                // TODO: open settings modal
              }}
              variant="secondary"
            />
          </>
        )}
      </View>

      {/* Decorative bottom border */}
      <View className="absolute bottom-0 left-0 right-0 h-1 bg-frontier-brass opacity-40" />

      {/* Version stamp */}
      <Text className="absolute bottom-6 font-data text-xs text-frontier-iron opacity-40">
        v0.3.0
      </Text>
    </View>
  );
}

function MenuButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`
        py-3 px-6 rounded-sm border items-center
        ${isPrimary
          ? 'bg-frontier-rust border-frontier-copper'
          : 'bg-transparent border-frontier-leather'
        }
        ${disabled ? 'opacity-30' : 'active:opacity-70'}
      `}
    >
      <Text
        className={`
          font-heading text-lg tracking-widest uppercase
          ${isPrimary ? 'text-frontier-dust' : 'text-frontier-dust opacity-70'}
        `}
      >
        {label}
      </Text>
    </Pressable>
  );
}
