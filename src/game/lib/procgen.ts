// Procedural Generation - Steampunk American Frontier Theme
import { hashString, PRNG, SimplexNoise } from './prng';

export const GENERATOR_VERSION = 1;
export const CELL_SIZE = 2;
export const SECTOR_SIZE = 24;

export type CellType = 'dirt' | 'wood' | 'stone' | 'water' | 'rail' | 'sand' | 'grass' | 'wall';
export type PropType =
  | 'crate'
  | 'barrel'
  | 'wagon'
  | 'lamp'
  | 'cactus'
  | 'rock'
  | 'post'
  | 'trough'
  | 'gear'
  | 'pipe'
  | 'anvil'
  | 'windmill';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface GridCell {
  x: number;
  y: number;
  type: CellType;
  height: number;
  walkable: boolean;
}

export interface PropPlacement {
  id: string;
  type: PropType;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  variant: number;
}

export interface NPCSpawn {
  id: string;
  npcType: string;
  name: string;
  x: number;
  y: number;
  facing: number;
  dialogueKey: string;
  questGiver: boolean;
  personality: string;
}

export interface ItemSpawn {
  id: string;
  itemId: string;
  name: string;
  x: number;
  y: number;
  rarity: ItemRarity;
}

export interface EncounterSpawn {
  id: string;
  encounterType: string;
  x: number;
  y: number;
  difficulty: number;
  rewards: string[];
}

export interface LandmarkAnchor {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SectorExit {
  targetSector: string;
  x: number;
  y: number;
  direction: 'north' | 'south' | 'east' | 'west';
}

export interface SectorData {
  id: string;
  seed: number;
  generatorVersion: number;
  name: string;
  theme: string;
  description: string;
  grid: GridCell[][];
  props: PropPlacement[];
  npcs: NPCSpawn[];
  items: ItemSpawn[];
  encounters: EncounterSpawn[];
  landmarks: LandmarkAnchor[];
  playerSpawn: { x: number; y: number };
  exits: SectorExit[];
  ambientColor: string;
  groundColor: string;
}

// Steampunk Frontier Themes
const SECTOR_THEMES = {
  town: {
    names: ['Rustwater', 'Cogsville', 'Brass Gulch', 'Steamhaven', 'Iron Springs'],
    descriptions: [
      'A frontier boomtown powered by steam and ambition',
      'Where progress meets the wild west',
    ],
    groundColor: '#8B7355',
    ambientColor: '#FFE4B5',
    propWeights: { crate: 2, barrel: 3, wagon: 1, lamp: 3, post: 2, trough: 2, gear: 1 },
    npcTypes: ['sheriff', 'merchant', 'prospector', 'inventor', 'saloon_keeper'],
    encounterTypes: ['bandit_standoff', 'mechanical_malfunction'],
  },
  desert: {
    names: ['Scorched Flats', 'Copper Canyon', 'The Dustbowl', 'Mesa Mechanica'],
    descriptions: [
      'Sun-baked earth scarred by mining operations',
      'Where steam engines brave the endless sand',
    ],
    groundColor: '#C19A6B',
    ambientColor: '#FFDAB9',
    propWeights: { cactus: 4, rock: 3, pipe: 2, gear: 2, windmill: 1 },
    npcTypes: ['prospector', 'hermit', 'bandit', 'railroad_worker'],
    encounterTypes: ['sandstorm_shelter', 'claim_jumper'],
  },
  railyard: {
    names: ['Junction 47', 'Ironhorse Station', 'The Terminus', 'Boiler Yard'],
    descriptions: ['The iron arteries of the frontier', 'Steam and steel converge here'],
    groundColor: '#696969',
    ambientColor: '#B8B8B8',
    propWeights: { crate: 4, barrel: 2, gear: 4, pipe: 3, anvil: 2, lamp: 2 },
    npcTypes: ['engineer', 'conductor', 'mechanic', 'union_boss'],
    encounterTypes: ['train_heist', 'boiler_puzzle'],
  },
  mine: {
    names: ['Deepvein Shaft', 'The Brass Mine', 'Cogwheel Caverns', 'Steamvent Hollow'],
    descriptions: ['Dark tunnels lit by brass lanterns', 'Where fortune and danger lie buried'],
    groundColor: '#3D3D3D',
    ambientColor: '#8B4513',
    propWeights: { crate: 3, barrel: 2, lamp: 4, rock: 3, pipe: 2, gear: 2 },
    npcTypes: ['miner', 'foreman', 'geologist', 'dynamite_expert'],
    encounterTypes: ['cave_in', 'gas_leak'],
  },
};

const LANDMARK_TEMPLATES = {
  saloon: { width: 6, height: 5, name: 'Saloon' },
  general_store: { width: 5, height: 4, name: 'General Store' },
  workshop: { width: 5, height: 5, name: 'Workshop' },
  station: { width: 7, height: 4, name: 'Station' },
  plaza: { width: 6, height: 6, name: 'Town Square' },
  camp: { width: 4, height: 4, name: 'Camp' },
};

const NPC_NAMES = {
  sheriff: ['Marshal Cogburn', 'Sheriff Ironside', 'Deputy Brass'],
  merchant: ['Cornelius Gearwright', 'Madame Steele', 'Old Coppernick'],
  prospector: ['Dusty McBolt', 'Pickaxe Pete', 'Goldgear Jenkins'],
  inventor: ['Dr. Steamsworth', 'Ada Clockwork', 'Professor Piston'],
  saloon_keeper: ['Big Sal', 'Whiskey Jack', 'Ruby Cogswell'],
  engineer: ['Chief Ironwhistle', 'Boiler Bob', 'Steamhand Sally'],
  conductor: ['Ticket Tom', 'Iron Mary', 'The Timekeeper'],
  mechanic: ['Wrench', 'Gearhead Gus', 'Oilcan Annie'],
  miner: ['Tunnel Tim', 'Coalface Charlie', 'Pickaxe Molly'],
  bandit: ['Black Bart Brass', 'The Copper Kid', 'Rustler Red'],
  prospector_desert: ['Sunstroke Sam', 'Mirage Mike'],
  hermit: ['Old Cogs', 'The Wanderer'],
  railroad_worker: ['Spike', 'Rail-tie Randy'],
  union_boss: ['Big Iron Bill'],
  foreman: ['Boss Steele'],
  geologist: ['Dr. Strata'],
  dynamite_expert: ['Boom-Boom Betty'],
};

const NPC_PERSONALITIES = [
  'gruff but kind-hearted',
  'suspicious of strangers',
  'eager to share tall tales',
  'haunted by the past',
  'optimistic dreamer',
  'shrewd businessperson',
  'weary traveler',
  'eccentric genius',
];

const ITEM_TYPES = {
  common: ['brass_screws', 'coal_chunk', 'copper_wire', 'bandage', 'hardtack'],
  uncommon: ['steam_core', 'precision_gear', 'oil_can', 'revolver_rounds', 'medicinal_tonic'],
  rare: ['aether_crystal', 'clockwork_heart', 'golden_cog', 'ancient_map'],
  legendary: ['tesla_coil', 'philosophers_brass', 'automaton_eye', 'thunderstone'],
};

export class SectorGenerator {
  private prng: PRNG;
  private noise: SimplexNoise;
  private sectorId: string;
  private theme: keyof typeof SECTOR_THEMES;

  constructor(sectorId: string, seed?: number) {
    this.sectorId = sectorId;
    const baseSeed = seed ?? hashString(sectorId);
    this.prng = new PRNG(baseSeed);
    this.noise = new SimplexNoise(this.prng.fork());
    this.theme = this.prng.pick(Object.keys(SECTOR_THEMES) as (keyof typeof SECTOR_THEMES)[]);
  }

  generate(): SectorData {
    const themeData = SECTOR_THEMES[this.theme];
    const name = this.prng.pick(themeData.names);
    const description = this.prng.pick(themeData.descriptions);

    const grid = this.generateGrid();
    const landmarks = this.placeLandmarks(grid);
    this.carvePaths(grid, landmarks);
    const props = this.generateProps(grid, themeData);
    const npcs = this.spawnNPCs(landmarks, themeData);
    const items = this.spawnItems(grid, landmarks);
    const encounters = this.spawnEncounters(landmarks, themeData);
    const playerSpawn = this.findPlayerSpawn(grid, landmarks);
    const exits = this.generateExits(grid);

    return {
      id: this.sectorId,
      seed: this.prng.nextInt(0, 2147483647),
      generatorVersion: GENERATOR_VERSION,
      name,
      theme: this.theme,
      description,
      grid,
      props,
      npcs,
      items,
      encounters,
      landmarks,
      playerSpawn,
      exits,
      ambientColor: themeData.ambientColor,
      groundColor: themeData.groundColor,
    };
  }

  private generateGrid(): GridCell[][] {
    const grid: GridCell[][] = [];

    for (let y = 0; y < SECTOR_SIZE; y++) {
      grid[y] = [];
      for (let x = 0; x < SECTOR_SIZE; x++) {
        const noise = this.noise.fbm(x * 0.12, y * 0.12, 3);
        const edge = Math.min(x, y, SECTOR_SIZE - 1 - x, SECTOR_SIZE - 1 - y);

        let type: CellType = 'dirt';
        let walkable = true;
        let height = 0;

        if (this.theme === 'railyard' && y >= SECTOR_SIZE / 2 - 1 && y <= SECTOR_SIZE / 2 + 1) {
          type = 'rail';
        } else if (edge < 2 && this.prng.chance(0.5)) {
          type = this.theme === 'mine' ? 'stone' : ('rock' as CellType);
          type = 'wall';
          walkable = false;
          height = 1.5;
        } else if (noise > 0.7 && this.prng.chance(0.3)) {
          type = 'wall';
          walkable = false;
          height = 1;
        } else if (noise < 0.3 && this.prng.chance(0.15)) {
          type = this.theme === 'desert' ? 'sand' : 'water';
          walkable = type === 'sand';
        } else if (this.theme === 'town' && this.prng.chance(0.3)) {
          type = 'wood';
        }

        grid[y][x] = { x, y, type, height, walkable };
      }
    }

    return grid;
  }

  private placeLandmarks(grid: GridCell[][]): LandmarkAnchor[] {
    const landmarks: LandmarkAnchor[] = [];
    const numLandmarks = this.prng.nextInt(2, 5);
    const templates = Object.entries(LANDMARK_TEMPLATES);

    for (let i = 0; i < numLandmarks; i++) {
      const [type, template] = this.prng.pick(templates);
      let placed = false;

      for (let attempt = 0; attempt < 30 && !placed; attempt++) {
        const x = this.prng.nextInt(3, SECTOR_SIZE - template.width - 3);
        const y = this.prng.nextInt(3, SECTOR_SIZE - template.height - 3);

        const overlaps = landmarks.some(
          (l) =>
            x < l.x + l.width + 2 &&
            x + template.width + 2 > l.x &&
            y < l.y + l.height + 2 &&
            y + template.height + 2 > l.y
        );

        if (!overlaps) {
          for (let ly = y; ly < y + template.height; ly++) {
            for (let lx = x; lx < x + template.width; lx++) {
              if (ly < SECTOR_SIZE && lx < SECTOR_SIZE) {
                grid[ly][lx] = { x: lx, y: ly, type: 'wood', height: 0, walkable: true };
              }
            }
          }

          landmarks.push({
            id: `landmark_${i}`,
            type,
            name: template.name,
            x,
            y,
            width: template.width,
            height: template.height,
          });
          placed = true;
        }
      }
    }

    return landmarks;
  }

  private carvePaths(grid: GridCell[][], landmarks: LandmarkAnchor[]): void {
    for (let i = 0; i < landmarks.length - 1; i++) {
      const a = landmarks[i];
      const b = landmarks[i + 1];

      let cx = Math.floor(a.x + a.width / 2);
      let cy = Math.floor(a.y + a.height / 2);
      const tx = Math.floor(b.x + b.width / 2);
      const ty = Math.floor(b.y + b.height / 2);

      while (cx !== tx) {
        cx += cx < tx ? 1 : -1;
        this.carvePath(grid, cx, cy);
      }
      while (cy !== ty) {
        cy += cy < ty ? 1 : -1;
        this.carvePath(grid, cx, cy);
      }
    }
  }

  private carvePath(grid: GridCell[][], x: number, y: number): void {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < SECTOR_SIZE && ny >= 0 && ny < SECTOR_SIZE) {
          grid[ny][nx] = { x: nx, y: ny, type: 'dirt', height: 0, walkable: true };
        }
      }
    }
  }

  private generateProps(
    grid: GridCell[][],
    themeData: (typeof SECTOR_THEMES)[keyof typeof SECTOR_THEMES]
  ): PropPlacement[] {
    const props: PropPlacement[] = [];
    const weights = Object.entries(themeData.propWeights);
    const totalWeight = weights.reduce((s, [, w]) => s + w, 0);

    for (let y = 0; y < SECTOR_SIZE; y++) {
      for (let x = 0; x < SECTOR_SIZE; x++) {
        if (!grid[y][x].walkable || grid[y][x].type === 'water') continue;

        const nearWall = this.isNearType(grid, x, y, 'wall');
        if (!this.prng.chance(nearWall ? 0.25 : 0.06)) continue;

        let roll = this.prng.next() * totalWeight;
        let propType: PropType = 'crate';
        for (const [type, weight] of weights) {
          roll -= weight;
          if (roll <= 0) {
            propType = type as PropType;
            break;
          }
        }

        props.push({
          id: `prop_${x}_${y}`,
          type: propType,
          x: x * CELL_SIZE + this.prng.nextFloat(-0.3, 0.3),
          y: y * CELL_SIZE + this.prng.nextFloat(-0.3, 0.3),
          rotation: this.prng.nextFloat(0, Math.PI * 2),
          scale: this.prng.nextFloat(0.8, 1.2),
          variant: this.prng.nextInt(0, 3),
        });
      }
    }

    return props;
  }

  private isNearType(grid: GridCell[][], x: number, y: number, type: CellType): boolean {
    for (const [dx, dy] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      const nx = x + dx,
        ny = y + dy;
      if (nx < 0 || nx >= SECTOR_SIZE || ny < 0 || ny >= SECTOR_SIZE) return true;
      if (grid[ny][nx].type === type) return true;
    }
    return false;
  }

  private spawnNPCs(
    landmarks: LandmarkAnchor[],
    themeData: (typeof SECTOR_THEMES)[keyof typeof SECTOR_THEMES]
  ): NPCSpawn[] {
    const npcs: NPCSpawn[] = [];

    for (const landmark of landmarks) {
      const count = this.prng.nextInt(1, 3);
      for (let i = 0; i < count; i++) {
        const npcType = this.prng.pick(themeData.npcTypes);
        const names = NPC_NAMES[npcType as keyof typeof NPC_NAMES] || ['Stranger'];
        const name = this.prng.pick(names);

        npcs.push({
          id: `npc_${landmark.id}_${i}`,
          npcType,
          name,
          x: (landmark.x + this.prng.nextInt(1, landmark.width - 1)) * CELL_SIZE,
          y: (landmark.y + this.prng.nextInt(1, landmark.height - 1)) * CELL_SIZE,
          facing: this.prng.nextFloat(0, Math.PI * 2),
          dialogueKey: `${npcType}_intro`,
          questGiver: this.prng.chance(0.25),
          personality: this.prng.pick(NPC_PERSONALITIES),
        });
      }
    }

    return npcs;
  }

  private spawnItems(grid: GridCell[][], landmarks: LandmarkAnchor[]): ItemSpawn[] {
    const items: ItemSpawn[] = [];
    const rarityRolls: [ItemRarity, number][] = [
      ['common', 55],
      ['uncommon', 30],
      ['rare', 12],
      ['legendary', 3],
    ];

    for (const landmark of landmarks) {
      const count = this.prng.nextInt(2, 5);
      for (let i = 0; i < count; i++) {
        const gx = landmark.x + this.prng.nextInt(0, landmark.width);
        const gy = landmark.y + this.prng.nextInt(0, landmark.height);
        if (gx >= SECTOR_SIZE || gy >= SECTOR_SIZE || !grid[gy][gx].walkable) continue;

        let roll = this.prng.nextInt(0, 100);
        let rarity: ItemRarity = 'common';
        for (const [r, w] of rarityRolls) {
          roll -= w;
          if (roll <= 0) {
            rarity = r;
            break;
          }
        }

        const itemPool = ITEM_TYPES[rarity];
        const itemId = this.prng.pick(itemPool);

        items.push({
          id: `item_${landmark.id}_${i}`,
          itemId,
          name: itemId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          x: gx * CELL_SIZE,
          y: gy * CELL_SIZE,
          rarity,
        });
      }
    }

    return items;
  }

  private spawnEncounters(
    landmarks: LandmarkAnchor[],
    themeData: (typeof SECTOR_THEMES)[keyof typeof SECTOR_THEMES]
  ): EncounterSpawn[] {
    const encounters: EncounterSpawn[] = [];
    const count = Math.min(this.prng.nextInt(1, 3), landmarks.length);

    for (let i = 0; i < count; i++) {
      const landmark = landmarks[i];
      encounters.push({
        id: `enc_${landmark.id}`,
        encounterType: this.prng.pick(themeData.encounterTypes),
        x: (landmark.x + landmark.width / 2) * CELL_SIZE,
        y: (landmark.y + landmark.height / 2) * CELL_SIZE,
        difficulty: this.prng.nextInt(1, 4),
        rewards: ['xp_50', this.prng.pick(['brass_screws', 'steam_core', 'copper_wire'])],
      });
    }

    return encounters;
  }

  private findPlayerSpawn(
    grid: GridCell[][],
    landmarks: LandmarkAnchor[]
  ): { x: number; y: number } {
    if (landmarks.length > 0) {
      const l = landmarks[0];
      return { x: (l.x + l.width / 2) * CELL_SIZE, y: (l.y + l.height / 2) * CELL_SIZE };
    }
    for (let r = 0; r < SECTOR_SIZE; r++) {
      for (let d = -r; d <= r; d++) {
        const cx = SECTOR_SIZE / 2 + d,
          cy = SECTOR_SIZE / 2 + (r - Math.abs(d));
        if (cx >= 0 && cx < SECTOR_SIZE && cy >= 0 && cy < SECTOR_SIZE && grid[cy][cx].walkable) {
          return { x: cx * CELL_SIZE, y: cy * CELL_SIZE };
        }
      }
    }
    return { x: (SECTOR_SIZE * CELL_SIZE) / 2, y: (SECTOR_SIZE * CELL_SIZE) / 2 };
  }

  private generateExits(grid: GridCell[][]): SectorExit[] {
    const exits: SectorExit[] = [];
    const dirs: ('north' | 'south' | 'east' | 'west')[] = ['north', 'south', 'east', 'west'];

    for (const dir of this.prng.shuffle(dirs).slice(0, this.prng.nextInt(2, 4))) {
      let x: number, y: number;
      const pos = this.prng.nextInt(4, SECTOR_SIZE - 4);

      switch (dir) {
        case 'north':
          x = pos * CELL_SIZE;
          y = 0;
          break;
        case 'south':
          x = pos * CELL_SIZE;
          y = (SECTOR_SIZE - 1) * CELL_SIZE;
          break;
        case 'east':
          x = (SECTOR_SIZE - 1) * CELL_SIZE;
          y = pos * CELL_SIZE;
          break;
        case 'west':
          x = 0;
          y = pos * CELL_SIZE;
          break;
      }

      exits.push({ targetSector: `${this.sectorId}_${dir}`, x, y, direction: dir });
    }

    return exits;
  }
}

const sectorCache = new Map<string, SectorData>();

export function generateSector(sectorId: string, seed?: number): SectorData {
  const key = `${sectorId}_${seed ?? 'def'}`;
  if (!sectorCache.has(key)) {
    sectorCache.set(key, new SectorGenerator(sectorId, seed).generate());
  }
  return sectorCache.get(key)!;
}

export function clearSectorCache(): void {
  sectorCache.clear();
}
