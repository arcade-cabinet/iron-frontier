import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FilamentRenderer } from '../src/components/FilamentRenderer';
import { useMobileGameStore } from '../src/game/store/mobileGameStore';
import { MobileGameHUD } from '../src/game/ui/MobileGameHUD';

// Test model - a cactus from our western asset pack
const TEST_MODEL = require('../assets/models/cactus1.glb');

export default function HomeScreen() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModel, setShowModel] = useState(true);
  
  const initGame = useMobileGameStore(state => state.initGame);
  const initialized = useMobileGameStore(state => state.initialized);

  useEffect(() => {
      if (!initialized) {
          initGame('Mobile Player');
      }
  }, [initialized]);

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
          <Text style={styles.errorTitle}>Filament Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setShowModel(true);
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
      <View style={styles.sceneContainer}>
        {showModel && (
          <FilamentRenderer
            modelSource={TEST_MODEL}
            cameraPosition={[0, 1.5, 3]}
            cameraTarget={[0, 0.5, 0]}
            onReady={handleReady}
            onError={handleError}
          />
        )}
      </View>

      {/* Game HUD Overlay */}
      {isReady && <MobileGameHUD />}
      
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
  sceneContainer: {
    flex: 1,
    backgroundColor: '#0f0f1a',
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
