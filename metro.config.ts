import { getDefaultConfig } from 'expo/metro-config.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

export default config;

