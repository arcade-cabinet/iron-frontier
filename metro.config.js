const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for 3D model file extensions
config.resolver.assetExts.push(
  'glb',
  'gltf',
  'obj',
  'mtl',
  'fbx',
  'dae'
);

// Exclude source map files from assets
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== 'map'
);

module.exports = config;
