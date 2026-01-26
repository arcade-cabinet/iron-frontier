import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MobileGameView } from '../src/engine';
import { useMobileGameStore } from '../src/game/store/mobileGameStore';

export default function HomeScreen() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initGame = useMobileGameStore((state) => state.initGame);
  const initialized = useMobileGameStore((state) => state.initialized);

  useEffect(() => {
    if (!initialized) {
      initGame('Mobile Player');
    }
  }, [initialized, initGame]);

  const handleReady = () => {
    setIsReady(true);
  };

  const handleError = (err: Error) => {
    setError(err.message);
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Rendering Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <MobileGameView
        onReady={handleReady}
        onError={handleError}
        showHUD={true}
        enableTouch={true}
      />

      {!isReady && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading Frontier...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    color: '#d4a574',
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: '#8b7355',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#d4a574',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#1a1a2e',
    fontWeight: '600',
    fontSize: 16,
  },
});
