// Procedural Character Generator - Old West Gunslinger
import Alea from 'alea';
import type {
  CharacterAppearance,
  NPC,
  NPCPersonality,
  NPCRole,
  WorldPosition,
} from '../types/engine';

// Name pools for procedural generation
const FIRST_NAMES_MALE = [
  'Wyatt',
  'Jesse',
  'Billy',
  'Doc',
  'Wild Bill',
  'Butch',
  'Sundance',
  'Cole',
  'Frank',
  'John',
  'James',
  'Henry',
  'William',
  'Thomas',
  'Samuel',
  'Robert',
  'Amos',
  'Ezekiel',
  'Silas',
  'Caleb',
  'Josiah',
  'Elijah',
  'Nathaniel',
  'Isaiah',
  'Rufus',
  'Cornelius',
  'Jebediah',
  'Obadiah',
  'Zachariah',
  'Bartholomew',
  'Colt',
  'Maverick',
  'Dusty',
  'Tex',
  'Buck',
  'Hank',
  'Slim',
  'Red',
];

const FIRST_NAMES_FEMALE = [
  'Annie',
  'Calamity Jane',
  'Belle',
  'Pearl',
  'Ruby',
  'Sadie',
  'Clara',
  'Rose',
  'Abigail',
  'Martha',
  'Sarah',
  'Elizabeth',
  'Mary',
  'Catherine',
  'Margaret',
  'Josephine',
  'Henrietta',
  'Cordelia',
  'Evangeline',
  'Prudence',
  'Patience',
];

const LAST_NAMES = [
  'Earp',
  'James',
  'Cassidy',
  'Holiday',
  'Hickok',
  'Garrett',
  'Masterson',
  'Cody',
  'Carson',
  'Crockett',
  'Boone',
  'Bridger',
  'Houston',
  'Travis',
  'Smith',
  'Johnson',
  'Brown',
  'Miller',
  'Wilson',
  'Davis',
  'Jones',
  'Taylor',
  'Blackwood',
  'Ironside',
  'Copperfield',
  'Steele',
  'Stone',
  'Rivers',
  'Wells',
  'McAllister',
  "O'Brien",
  'McGraw',
  'Sullivan',
  'Murphy',
  'Kelly',
  'Walsh',
  'Hawkins',
  'Thornton',
  'Callahan',
  'Brennan',
  'Fletcher',
  'Crawford',
  'Barrett',
];

const SKIN_TONES = [
  '#F5DEB3',
  '#DEB887',
  '#D2B48C',
  '#C4A574',
  '#B8860B',
  '#A0522D',
  '#8B4513',
  '#6B4423',
  '#5D4037',
  '#4E342E',
];

const HAT_COLORS = [
  '#2F1810',
  '#3D2314',
  '#4A2C17',
  '#5C3A21',
  '#6B4423',
  '#8B7355',
  '#A89078',
  '#C4A882',
  '#D4B896',
  '#E8D4B8',
  '#1A1A1A',
  '#2D2D2D',
  '#404040',
  '#595959',
];

const SHIRT_COLORS = [
  '#F5F5DC',
  '#FAF0E6',
  '#FFFAF0',
  '#FFF8DC',
  '#FAEBD7', // Light
  '#8B0000',
  '#A52A2A',
  '#B22222',
  '#CD5C5C', // Red
  '#191970',
  '#000080',
  '#00008B',
  '#4169E1', // Blue
  '#2F4F4F',
  '#556B2F',
  '#6B8E23',
  '#808000', // Green/Olive
  '#1A1A1A',
  '#2D2D2D',
  '#404040',
  '#595959', // Dark
];

const PANTS_COLORS = [
  '#1A1A1A',
  '#2D2D2D',
  '#404040', // Black/Dark
  '#2F4F4F',
  '#556B2F',
  '#4A4A3A', // Dark earth
  '#6B4423',
  '#8B4513',
  '#A0522D', // Brown
  '#4169E1',
  '#000080',
  '#191970', // Blue (denim)
];

const BANDANA_COLORS = [
  '#8B0000',
  '#B22222',
  '#DC143C', // Red
  '#191970',
  '#4169E1',
  '#6495ED', // Blue
  '#2F4F4F',
  '#228B22',
  '#006400', // Green
  '#1A1A1A',
  '#FFD700',
  '#FF8C00', // Black/Gold/Orange
];

export class CharacterGenerator {
  private prng: () => number;
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
    this.prng = Alea(seed);
  }

  // Reset with new seed
  reseed(seed: number): void {
    this.seed = seed;
    this.prng = Alea(seed);
  }

  // Generate random number in range
  private random(min: number = 0, max: number = 1): number {
    return min + this.prng() * (max - min);
  }

  // Pick random item from array
  private pick<T>(arr: T[]): T {
    return arr[Math.floor(this.prng() * arr.length)];
  }

  // Generate a unique ID
  private generateId(prefix: string): string {
    return `${prefix}_${this.seed}_${Math.floor(this.prng() * 1000000)}`;
  }

  // Generate character appearance
  generateAppearance(isMale: boolean = true): CharacterAppearance {
    const hasBeard = isMale && this.prng() > 0.3;
    const hasScar = this.prng() > 0.7;
    const hasBandana = this.prng() > 0.6;
    const hasGunbelt = this.prng() > 0.3;
    const hasPoncho = this.prng() > 0.85;

    return {
      bodyType: this.pick(['slim', 'average', 'stocky']),
      height: this.random(0.9, 1.1),
      skinTone: this.pick(SKIN_TONES),

      faceShape: this.random(0, 1),
      hasBeard,
      beardStyle: hasBeard ? this.pick(['stubble', 'full', 'mustache', 'goatee']) : undefined,
      hasScar,
      scarPosition: hasScar ? this.pick(['cheek', 'eye', 'chin']) : undefined,

      hatStyle: this.pick(['cowboy', 'bowler', 'flat_cap', 'none']),
      hatColor: this.pick(HAT_COLORS),
      shirtStyle: this.pick(['work', 'fancy', 'vest']),
      shirtColor: this.pick(SHIRT_COLORS),
      pantsStyle: this.pick(['jeans', 'chaps', 'slacks']),
      pantsColor: this.pick(PANTS_COLORS),
      bootsStyle: this.pick(['work', 'fancy', 'spurs']),

      hasBandana,
      bandanaColor: hasBandana ? this.pick(BANDANA_COLORS) : undefined,
      hasGunbelt,
      hasPoncho,
      ponchoColor: hasPoncho ? this.pick(BANDANA_COLORS) : undefined,
    };
  }

  // Generate personality traits
  generatePersonality(role?: NPCRole): NPCPersonality {
    // Base random personality
    const personality: NPCPersonality = {
      aggression: this.random(0, 1),
      friendliness: this.random(0, 1),
      curiosity: this.random(0, 1),
      greed: this.random(0, 1),
      honesty: this.random(0, 1),
    };

    // Modify based on role
    if (role) {
      switch (role) {
        case 'sheriff':
        case 'deputy':
          personality.aggression *= 0.6;
          personality.honesty = Math.min(1, personality.honesty + 0.3);
          personality.friendliness = Math.min(1, personality.friendliness + 0.2);
          break;
        case 'outlaw':
          personality.aggression = Math.min(1, personality.aggression + 0.4);
          personality.honesty *= 0.3;
          personality.greed = Math.min(1, personality.greed + 0.3);
          break;
        case 'merchant':
        case 'banker':
          personality.greed = Math.min(1, personality.greed + 0.2);
          personality.friendliness = Math.min(1, personality.friendliness + 0.1);
          break;
        case 'doctor':
        case 'preacher':
          personality.friendliness = Math.min(1, personality.friendliness + 0.3);
          personality.honesty = Math.min(1, personality.honesty + 0.2);
          personality.aggression *= 0.3;
          break;
        case 'gambler':
          personality.greed = Math.min(1, personality.greed + 0.3);
          personality.honesty *= 0.5;
          personality.curiosity = Math.min(1, personality.curiosity + 0.2);
          break;
        case 'drifter':
          personality.curiosity = Math.min(1, personality.curiosity + 0.3);
          break;
      }
    }

    return personality;
  }

  // Generate a full name
  generateName(isMale: boolean = true): string {
    const firstNames = isMale ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE;
    const firstName = this.pick(firstNames);
    const lastName = this.pick(LAST_NAMES);

    // Sometimes add a nickname
    if (this.prng() > 0.8) {
      const nicknames = [
        'Lucky',
        'Quick',
        'Dead-Eye',
        'One-Shot',
        'Iron',
        'Copper',
        'Gold',
        'Silver',
      ];
      const nickname = this.pick(nicknames);
      return `${firstName} "${nickname}" ${lastName}`;
    }

    return `${firstName} ${lastName}`;
  }

  // Generate complete NPC
  generateNPC(
    role: NPCRole,
    position: WorldPosition,
    options: {
      isMale?: boolean;
      questGiver?: boolean;
      homeStructureId?: string;
    } = {}
  ): NPC {
    const isMale = options.isMale ?? this.prng() > 0.3;

    return {
      id: this.generateId('npc'),
      name: this.generateName(isMale),
      role,
      appearance: this.generateAppearance(isMale),
      personality: this.generatePersonality(role),
      position,
      rotation: this.random(0, Math.PI * 2),
      homeStructureId: options.homeStructureId,
      disposition: 0, // Neutral to start
      isAlive: true,
      questGiver: options.questGiver ?? this.prng() > 0.7,
      questIds: [],
    };
  }

  // Generate player character
  generatePlayerCharacter(_name: string): {
    appearance: CharacterAppearance;
    personality: NPCPersonality;
  } {
    return {
      appearance: this.generateAppearance(true),
      personality: {
        aggression: 0.5,
        friendliness: 0.5,
        curiosity: 0.7,
        greed: 0.4,
        honesty: 0.6,
      },
    };
  }
}

// Default generator instance
let defaultGenerator: CharacterGenerator | null = null;

export function getCharacterGenerator(seed?: number): CharacterGenerator {
  if (!defaultGenerator || seed !== undefined) {
    defaultGenerator = new CharacterGenerator(seed ?? Date.now());
  }
  return defaultGenerator;
}
