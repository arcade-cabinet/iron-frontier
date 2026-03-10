const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Exclude packages that break Metro's TreeFS (e.g. @playwright/test has a
// file structure that collides with Metro's expectations in hoisted mode).
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : []),
  /node_modules\/@playwright\/.*/,
  /node_modules\/playwright\/.*/,
  /node_modules\/playwright-core\/.*/,
];

// expo-sqlite web support: treat .wasm as an asset (not source)
config.resolver.assetExts = [...(config.resolver.assetExts || []), 'wasm'];
// Remove wasm from sourceExts if present (default config may add it)
config.resolver.sourceExts = (config.resolver.sourceExts || []).filter(ext => ext !== 'wasm');

// Apply NativeWind FIRST so its resolveRequest wrapper is set, then wrap it.
// Fix: tslib ESM build imports tslib via 'tslib' package which Metro resolves
// to tslib/modules/index.js (an ESM wrapper). Metro's CJS runner can't destructure
// tslib.default from that wrapper. Redirect all tslib resolution to the CJS build.
const finalConfig = withNativeWind(config, { input: './global.css', inlineRem: 16 });

const tslibCJS = path.resolve(__dirname, 'node_modules/tslib/tslib.js');

// On web, @react-three/fiber's package.json "react-native" field causes Metro
// to load the native entry (which imports expo-gl). Force the web ESM entry instead.
const r3fWebEntry = path.resolve(
  __dirname,
  'node_modules/@react-three/fiber/dist/react-three-fiber.esm.js',
);

const _nativeWindResolveRequest = finalConfig.resolver.resolveRequest;
finalConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'tslib') {
    return { filePath: tslibCJS, type: 'sourceFile' };
  }
  // Redirect @react-three/fiber to its web entry on web platform
  if (moduleName === '@react-three/fiber' && platform === 'web') {
    return { filePath: r3fWebEntry, type: 'sourceFile' };
  }
  if (_nativeWindResolveRequest) {
    return _nativeWindResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = finalConfig;
