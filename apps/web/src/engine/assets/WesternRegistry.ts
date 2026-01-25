// Path to AmbientCG textures - symlink or copy to public/assets/textures
// Use absolute path for Babylon.js Texture loading
const TEXTURE_BASE = '/assets/textures';

// Terrain/Ground textures from AmbientCG
export const TerrainTextures = {
    // Desert/Sand biome
    DESERT: {
        color: `${TEXTURE_BASE}/Ground037_1K-JPG_Color.jpg`,
        normal: `${TEXTURE_BASE}/Ground037_1K-JPG_NormalGL.jpg`,
        roughness: `${TEXTURE_BASE}/Ground037_1K-JPG_Roughness.jpg`,
    },
    // Grassland biome
    GRASSLAND: {
        color: `${TEXTURE_BASE}/Grass004_1K-JPG_Color.jpg`,
        normal: `${TEXTURE_BASE}/Grass004_1K-JPG_NormalGL.jpg`,
        roughness: `${TEXTURE_BASE}/Grass004_1K-JPG_Roughness.jpg`,
    },
    // Badlands/Rocky biome
    BADLANDS: {
        color: `${TEXTURE_BASE}/Ground033_1K-JPG_Color.jpg`,
        normal: `${TEXTURE_BASE}/Ground033_1K-JPG_NormalGL.jpg`,
        roughness: `${TEXTURE_BASE}/Ground033_1K-JPG_Roughness.jpg`,
    },
    // Riverside biome
    RIVERSIDE: {
        color: `${TEXTURE_BASE}/Ground003_1K-JPG_Color.jpg`,
        normal: `${TEXTURE_BASE}/Ground003_1K-JPG_NormalGL.jpg`,
        roughness: `${TEXTURE_BASE}/Ground003_1K-JPG_Roughness.jpg`,
    },
    // Rock texture for cliffs/platforms
    ROCK: {
        color: `${TEXTURE_BASE}/Rock020_1K-JPG_Color.jpg`,
        normal: `${TEXTURE_BASE}/Rock020_1K-JPG_NormalGL.jpg`,
        roughness: `${TEXTURE_BASE}/Rock020_1K-JPG_Roughness.jpg`,
    },
} as const;

export enum WesternAssets {
    // Characters
    ENGINEER = 'assets/models/characters/engineer.glb',  // KayKit character - works reliably

    // Weapons
    REVOLVER_FIXED = 'assets/models/weapons/revolver-fixed.glb',
    REVOLVER_ANIMATED = 'assets/models/weapons/revolver-animated.glb',

    // Structures
    BARRIER = 'assets/models/structures/barrier.glb',
    FENCE = 'assets/models/structures/fence.glb',
    POST_SIGN = 'assets/models/structures/postsign.glb',
    RAIL = 'assets/models/structures/rail.glb',
    WATER_TOWER = 'assets/models/structures/watertower.glb',
    WELL = 'assets/models/structures/well.glb',

    // Furniture
    OLD_BENCH = 'assets/models/furniture/oldbench.glb',
    OLD_CARPET = 'assets/models/furniture/oldcarpet.glb',
    PIANO = 'assets/models/furniture/piano.glb',
    POOL_TABLE = 'assets/models/furniture/pooltable.glb',
    WESTERN_BED = 'assets/models/furniture/westernbed.glb',
    WESTERN_CHAIR = 'assets/models/furniture/westernchair.glb',
    WESTERN_LOCKER = 'assets/models/furniture/westernlocker.glb',
    WESTERN_PLAY_TABLE = 'assets/models/furniture/westernplaytable.glb',
    WESTERN_TABLE = 'assets/models/furniture/westerntable.glb',

    // Containers
    CHEST_BASE = 'assets/models/containers/chest-base.glb',
    CHEST_TOP = 'assets/models/containers/chest-top.glb',
    CRATE = 'assets/models/containers/crate.glb',
    WESTERN_BARREL = 'assets/models/containers/westernbarrel.glb',
    WESTERN_BARREL_HAY = 'assets/models/containers/westernbarrel-hay.glb',
    WESTERN_BARREL_WATER = 'assets/models/containers/westernbarrel-water.glb',

    // Nature
    BUSHES = 'assets/models/nature/bushes.glb',
    CACTUS_1 = 'assets/models/nature/cactus1.glb',
    CACTUS_2 = 'assets/models/nature/cactus2.glb',
    DEAD_TREE = 'assets/models/nature/deadtree.glb',
    LOG = 'assets/models/nature/log.glb',
    STUMP = 'assets/models/nature/stump.glb',

    // Vehicles
    WESTERN_CART = 'assets/models/vehicles/westerncart.glb',
    COVERED_WAGON = 'assets/models/vehicles/westerncart-001.glb',
    WOOD_WHEEL = 'assets/models/vehicles/woodwheel.glb',

    // Decor
    BEER = 'assets/models/decor/beer.glb',
    LIGHT_BULB = 'assets/models/decor/lightbulb.glb',
    WANTED_POSTER = 'assets/models/decor/wantedposter.glb',

    // Tools
    COWBOY_HAT = 'assets/models/tools/cowboyhat.glb',
    PICKAXE = 'assets/models/tools/pickaxe.glb',
}

export const EngineerAnimations = {
    IDLE: 'Idle',
    WALK: 'Walk',
} as const;
