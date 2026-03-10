import type { TileDef } from '../../schemas/spatial.ts';

export function generateFloorTiles(
  startQ: number,
  startR: number,
  width: number,
  height: number,
  terrain: 'stone' | 'dirt' | 'stone_rocks' = 'stone',
  elevation: number = 0
): TileDef[] {
  const tiles: TileDef[] = [];
  for (let dq = 0; dq < width; dq++) {
    for (let dr = 0; dr < height; dr++) {
      tiles.push({
        coord: { q: startQ + dq, r: startR + dr },
        terrain,
        elevation,
        feature: 'none',
      });
    }
  }
  return tiles;
}
