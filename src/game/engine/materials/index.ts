// engine/materials — Canvas-painted procedural material system
// Re-exports every public texture factory function and the cache.

export {
  createFabricTexture,
  createMetalTexture,
  createSandTexture,
  createStoneTexture,
  createWoodTexture,
} from './CanvasTextureFactory';

export {
  createDirtTexture,
  createGlassTexture,
  createLeatherTexture,
  createRustTexture,
  createSkinTexture,
} from './CanvasTextureFactory.organic';

export { TextureCache, globalTextureCache } from './TextureCache';
