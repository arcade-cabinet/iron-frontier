import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FilamentRenderer } from '../src/components/FilamentRenderer';

// Test model - a cactus from our western asset pack
const TEST_MODEL = require('../assets/models/cactus1.glb');

export default function HomeScreen() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModel, setShowModel] = useState(true);

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Iron Frontier</Text>
        <Text style={styles.subtitle}>Steampunk Western RPG</Text>
      </View>

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

      <View style={styles.footer}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: isReady ? '#4ade80' : '#f59e0b' }]} />
          <Text style={styles.footerText}>{isReady ? 'Filament Ready' : 'Initializing...'}</Text>
        </View>
        <Text style={styles.versionText}>v0.1.0 - Filament</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#d4a574',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8b7355',
    marginTop: 4,
  },
  sceneContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0f0f1a',
    borderWidth: 2,
    borderColor: '#2a2a4e',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footerText: {
    color: '#6b6b8d',
    fontSize: 12,
  },
  versionText: {
    color: '#4a4a6a',
    fontSize: 11,
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
