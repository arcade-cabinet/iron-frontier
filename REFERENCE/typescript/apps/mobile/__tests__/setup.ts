/**
 * Jest test setup for mobile app
 *
 * Note: @testing-library/react-native v13+ has built-in Jest matchers,
 * no separate import needed.
 */

// Mock window.dispatchEvent for React 19 test renderer compatibility
// React 19's error handling calls window.dispatchEvent which doesn't exist in RN
if (typeof global.window === 'undefined') {
  (global as any).window = {};
}
if (typeof global.window.dispatchEvent === 'undefined') {
  (global.window as any).dispatchEvent = jest.fn();
}

// Mock expo modules
jest.mock('expo-gl', () => ({
  GLView: 'GLView',
}));

jest.mock('expo-three', () => ({
  ExpoWebGLRenderingContext: jest.fn(),
  Renderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    setPixelRatio: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
  })),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({
      downloadAsync: jest.fn(),
      localUri: 'mock-uri',
    })),
    loadAsync: jest.fn(),
  },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock Three.js
jest.mock('three', () => {
  const actualThree = jest.requireActual('three');
  return {
    ...actualThree,
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      setPixelRatio: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn(),
      domElement: {},
    })),
  };
});

// Silence React Native warnings during tests
const originalWarn = console.warn.bind(console);
jest.spyOn(console, 'warn').mockImplementation((message, ...args) => {
  if (
    typeof message === 'string' &&
    (message.includes('Animated') ||
      message.includes('componentWillReceiveProps') ||
      message.includes('componentWillMount') ||
      message.includes('Invalid hook call'))
  ) {
    return;
  }
  originalWarn(message, ...args);
});
