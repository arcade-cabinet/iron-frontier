// Procedural Character Generator - Old West Gunslinger
import Alea from 'alea';
import type {
  CharacterAppearance,
  NPC,
  NPCPersonality,
  NPCRole,
  WorldPosition,
} from '../types/engine';
import {
  BANDANA_COLORS,
  HAT_COLORS,
  PANTS_COLORS,
  SHIRT_COLORS,
  SKIN_TONES,
} from './colorPools';
import {
  FIRST_NAMES_FEMALE,
  FIRST_NAMES_MALE,
  LAST_NAMES,
  NICKNAMES,
} from './namePools';

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
      const nickname = this.pick(NICKNAMES);
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
