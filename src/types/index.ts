/**
 * Shared Type Definitions
 *
 * Re-exports types from various modules plus schema-derived types.
 * Note: Declaration files (.d.ts) provide ambient declarations.
 */

// Re-export engine types
export * from './engine';

// Re-export schema-derived types (Zod-inferred)
export type {
    Assemblage,
    AssemblageRef,
    EntryPoint,
    FeatureTypeSchema,
    HexCoord,
    Location,
    Marker,
    MarkerType,
    Region,
    SlotInstance,
    SlotType,
    StructureTypeSchema,
    TerrainTypeSchema,
    TileDef,
    World,
    WorldLocation,
    WorldPos,
    Zone,
    ZoneType
} from '../game/data/schemas/spatial';

// Re-export engine runtime values (constants, functions)
export {
    CHUNK_SIZE, STRUCTURE_TEMPLATES, VIEW_DISTANCE, chunkKey, chunkToWorld, worldToChunk
} from './engine';

