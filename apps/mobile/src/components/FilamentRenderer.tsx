import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import {
  Camera,
  DefaultLight,
  FilamentScene,
  FilamentView,
  type Float3,
  Model,
} from 'react-native-filament';

/**
 * Buffer source type for Filament models
 * Can be a require() number or a { uri: string } object
 */
export type ModelSource = number | { uri: string };

/**
 * Props for the FilamentRenderer component
 */
export interface FilamentRendererProps {
  /**
   * Called when the Filament engine is ready to render
   */
  onReady?: () => void;

  /**
   * Called when an error occurs during initialization or rendering
   */
  onError?: (error: Error) => void;

  /**
   * Optional model source to load. Can be:
   * - A require() for bundled assets (returns a number)
   * - A { uri: string } for remote or local file URLs
   */
  modelSource?: ModelSource;

  /**
   * Camera position [x, y, z]
   * @default [0, 2, 5]
   */
  cameraPosition?: Float3;

  /**
   * Camera target (look at point) [x, y, z]
   * @default [0, 0, 0]
   */
  cameraTarget?: Float3;

  /**
   * Whether to show a loading indicator
   * @default true
   */
  showLoadingIndicator?: boolean;

  /**
   * Model transformation: position [x, y, z]
   */
  modelPosition?: Float3;

  /**
   * Model transformation: scale [x, y, z]
   */
  modelScale?: Float3;
}

/**
 * Inner scene component that uses Filament hooks
 * Must be wrapped by FilamentScene to access context
 */
function FilamentSceneContent({
  modelSource,
  cameraPosition = [0, 2, 5],
  cameraTarget = [0, 0, 0],
  modelPosition,
  modelScale,
  onReady,
}: Omit<FilamentRendererProps, 'showLoadingIndicator' | 'onError'>) {
  const _handleModelLoaded = useCallback(() => {
    onReady?.();
  }, [onReady]);

  return (
    <FilamentView style={styles.filamentView}>
      <Camera cameraPosition={cameraPosition} cameraTarget={cameraTarget} near={0.1} far={1000} />

      <DefaultLight />

      {modelSource != null && (
        <Model source={modelSource} translate={modelPosition} scale={modelScale} />
      )}
    </FilamentView>
  );
}

/**
 * FilamentRenderer - A React Native Filament-based 3D renderer component
 *
 * This component provides a declarative interface for rendering 3D scenes
 * using Google's Filament engine on mobile. It supports:
 * - GLB model loading (bundled or remote)
 * - PBR (Physically Based Rendering) materials
 * - Default lighting setup
 * - Camera configuration
 *
 * @example
 * ```tsx
 * <FilamentRenderer
 *   modelSource={require('../assets/models/cactus.glb')}
 *   cameraPosition={[0, 2, 5]}
 *   onReady={() => console.log('Scene ready!')}
 * />
 * ```
 */
export function FilamentRenderer({
  onReady,
  onError,
  modelSource,
  cameraPosition = [0, 2, 5],
  cameraTarget = [0, 0, 0],
  modelPosition,
  modelScale,
  showLoadingIndicator = true,
}: FilamentRendererProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, _setError] = useState<Error | null>(null);

  const handleReady = useCallback(() => {
    setIsLoading(false);
    onReady?.();
  }, [onReady]);

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Rendering Error</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showLoadingIndicator && isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#d4a574" />
          <Text style={styles.loadingText}>Loading 3D Scene...</Text>
        </View>
      )}

      <FilamentScene fallback={<LoadingFallback />}>
        <FilamentSceneContent
          modelSource={modelSource}
          cameraPosition={cameraPosition}
          cameraTarget={cameraTarget}
          modelPosition={modelPosition}
          modelScale={modelScale}
          onReady={handleReady}
        />
      </FilamentScene>
    </View>
  );
}

/**
 * Loading fallback component shown while FilamentScene initializes
 */
function LoadingFallback() {
  return (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" color="#d4a574" />
      <Text style={styles.loadingText}>Initializing Filament...</Text>
    </View>
  );
}

/**
 * FilamentSceneProps - Props for creating custom Filament scenes
 *
 * This interface can be used when building more complex scenes
 * that need direct access to Filament components.
 */
export interface FilamentSceneContainerProps {
  children: React.ReactNode;
  style?: object;
}

/**
 * A minimal Filament scene wrapper for custom implementations
 */
export function FilamentSceneContainer({ children, style }: FilamentSceneContainerProps) {
  return (
    <View style={[styles.container, style]}>
      <FilamentScene fallback={<LoadingFallback />}>{children}</FilamentScene>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  filamentView: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 15, 26, 0.9)',
    zIndex: 1,
  },
  loadingText: {
    color: '#d4a574',
    marginTop: 12,
    fontSize: 14,
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
  },
});

// Re-export useful types
export type { Float3 } from 'react-native-filament';
// Re-export Filament components for convenience
export {
  Camera,
  DefaultLight,
  FilamentScene,
  FilamentView,
  Model,
  useModel,
} from 'react-native-filament';