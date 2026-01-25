/**
 * Unit tests for HexMapGenerator
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  generateHexMap,
  type HexCoord,
  type HexMapConfig,
  HexMapGenerator,
  type HexTileData,
  hexDistance,
  hexKey,
  hexNeighbors,
  hexRound,
  hexToWorld,
  parseHexKey,
  worldToHex,
} from '../engine/hex/HexMapGenerator';

describe('HexMapGenerator', () => {
  describe('Hex Coordinate Utilities', () => {
    it('should convert hex coordinates to string key and back', () => {
      const coord: HexCoord = { q: 5, r: -3 };
      const key = hexKey(coord);
      expect(key).toBe('5,-3');

      const parsed = parseHexKey(key);
      expect(parsed.q).toBe(5);
      expect(parsed.r).toBe(-3);
    });

    it('should calculate correct hex distance', () => {
      // Same hex
      expect(hexDistance({ q: 0, r: 0 }, { q: 0, r: 0 })).toBe(0);

      // Adjacent hexes
      expect(hexDistance({ q: 0, r: 0 }, { q: 1, r: 0 })).toBe(1);
      expect(hexDistance({ q: 0, r: 0 }, { q: 0, r: 1 })).toBe(1);

      // Farther hexes
      expect(hexDistance({ q: 0, r: 0 }, { q: 3, r: 0 })).toBe(3);
      expect(hexDistance({ q: -2, r: 2 }, { q: 2, r: -2 })).toBe(4);
    });

    it('should return 6 neighbors for any hex', () => {
      const neighbors = hexNeighbors({ q: 0, r: 0 });
      expect(neighbors).toHaveLength(6);

      // All neighbors should be distance 1 from origin
      for (const neighbor of neighbors) {
        expect(hexDistance({ q: 0, r: 0 }, neighbor)).toBe(1);
      }
    });

    it('should convert hex to world coordinates and back', () => {
      const hex: HexCoord = { q: 5, r: 3 };
      const world = hexToWorld(hex, 1);
      const backToHex = worldToHex(world.x, world.z, 1);

      expect(backToHex.q).toBe(hex.q);
      expect(backToHex.r).toBe(hex.r);
    });

    it('should round fractional hex coordinates correctly', () => {
      // Exact coordinates should stay the same
      expect(hexRound({ q: 5, r: 3 })).toEqual({ q: 5, r: 3 });

      // Fractional coordinates should round to nearest
      const rounded = hexRound({ q: 2.3, r: 1.1 });
      expect(Number.isInteger(rounded.q)).toBe(true);
      expect(Number.isInteger(rounded.r)).toBe(true);
    });
  });

  describe('Map Generation', () => {
    let generator: HexMapGenerator;

    beforeEach(() => {
      generator = new HexMapGenerator({
        seed: 12345,
        width: 16,
        height: 16,
      });
    });

    it('should generate a map with the expected number of tiles', () => {
      const tiles = generator.generate();

      // Should have approximately width * height tiles
      // (some variation due to hex offset)
      expect(tiles.size).toBeGreaterThan(200);
      expect(tiles.size).toBeLessThan(300);
    });

    it('should produce deterministic results with same seed', () => {
      const tiles1 = generator.generate();
      generator.reseed(12345);
      const tiles2 = generator.generate();

      // Compare a sample of tiles
      const sampleKeys = Array.from(tiles1.keys()).slice(0, 10);
      for (const key of sampleKeys) {
        const tile1 = tiles1.get(key)!;
        const tile2 = tiles2.get(key)!;
        expect(tile1.biome).toBe(tile2.biome);
        expect(tile1.baseTile).toBe(tile2.baseTile);
      }
    });

    it('should produce different results with different seeds', () => {
      const tiles1 = generator.generate();
      generator.reseed(99999);
      const tiles2 = generator.generate();

      // At least some tiles should be different
      let differences = 0;
      const keys1 = Array.from(tiles1.keys());
      for (const key of keys1) {
        const tile1 = tiles1.get(key);
        const tile2 = tiles2.get(key);
        if (tile1 && tile2 && tile1.biome !== tile2.biome) {
          differences++;
        }
      }
      expect(differences).toBeGreaterThan(0);
    });

    it('should include all expected biome types', () => {
      const tiles = generator.generate();
      const biomes = new Set<string>();

      tiles.forEach((tile) => {
        biomes.add(tile.biome);
      });

      // Should have at least some variety of biomes
      expect(biomes.size).toBeGreaterThanOrEqual(2);
    });

    it('should place building sites', () => {
      const tiles = generator.generate();
      let buildingSiteCount = 0;

      tiles.forEach((tile) => {
        if (tile.buildingSite) {
          buildingSiteCount++;
        }
      });

      expect(buildingSiteCount).toBeGreaterThan(0);
    });

    it('should generate rivers', () => {
      const tiles = generator.generate();
      let riverTileCount = 0;

      tiles.forEach((tile) => {
        if (tile.riverTile) {
          riverTileCount++;
        }
      });

      expect(riverTileCount).toBeGreaterThan(0);
    });

    it('should generate paths', () => {
      const tiles = generator.generate();
      let pathTileCount = 0;

      tiles.forEach((tile) => {
        if (tile.pathTile) {
          pathTileCount++;
        }
      });

      expect(pathTileCount).toBeGreaterThan(0);
    });

    it('should place buildings at designated sites', () => {
      const tiles = generator.generate();
      let buildingCount = 0;

      tiles.forEach((tile) => {
        if (tile.building) {
          buildingCount++;
          // Buildings should only be at building sites
          expect(tile.buildingSite).toBeDefined();
        }
      });

      expect(buildingCount).toBeGreaterThan(0);
    });
  });

  describe('generateHexMap factory function', () => {
    it('should create a map with default config', () => {
      const tiles = generateHexMap();
      expect(tiles.size).toBeGreaterThan(0);
    });

    it('should accept custom configuration', () => {
      const config: Partial<HexMapConfig> = {
        seed: 42,
        width: 8,
        height: 8,
      };
      const tiles = generateHexMap(config);
      expect(tiles.size).toBeGreaterThan(0);
      expect(tiles.size).toBeLessThan(100); // Smaller map
    });
  });

  describe('Tile Data Integrity', () => {
    it('should have valid biome for all tiles', () => {
      const tiles = generateHexMap({ seed: 100, width: 10, height: 10 });
      const validBiomes = ['desert', 'grassland', 'badlands', 'riverside'];

      tiles.forEach((tile) => {
        expect(validBiomes).toContain(tile.biome);
      });
    });

    it('should have rotation between 0 and 5', () => {
      const tiles = generateHexMap({ seed: 200, width: 10, height: 10 });

      tiles.forEach((tile) => {
        expect(tile.rotation).toBeGreaterThanOrEqual(0);
        expect(tile.rotation).toBeLessThanOrEqual(5);
      });
    });

    it('should have moisture and elevation normalized between 0 and 1', () => {
      const tiles = generateHexMap({ seed: 300, width: 10, height: 10 });

      tiles.forEach((tile) => {
        expect(tile.moisture).toBeGreaterThanOrEqual(0);
        expect(tile.moisture).toBeLessThanOrEqual(1);
        expect(tile.elevation).toBeGreaterThanOrEqual(0);
        expect(tile.elevation).toBeLessThanOrEqual(1);
      });
    });
  });
});
