import { scopedRNG, rngTick } from '../../lib/prng';
import type { FatigueSystem } from '../fatigue';
import type { ProvisionsSystem, TerrainType } from '../provisions';
import type { GameClock } from '../time';
import type {
  CampEncounter,
  CampingConfig,
  CampingResult,
  CampingState,
  RestDuration,
} from './types';
import { DEFAULT_CAMPING_CONFIG, DEFAULT_CAMPING_STATE } from './config';
import { rollEncounterType, generateEncounter } from './encounters';

export class CampingSystem {
  private config: CampingConfig;
  private state: CampingState;

  constructor(
    config: Partial<CampingConfig> = {},
    initialState: Partial<CampingState> = {}
  ) {
    this.config = { ...DEFAULT_CAMPING_CONFIG, ...config };
    this.state = { ...DEFAULT_CAMPING_STATE, ...initialState };
  }

  isCamping(): boolean { return this.state.isCamping; }
  getFireState(): string { return this.state.fireState; }
  hasFire(): boolean { return this.state.fireState !== 'none'; }
  getFuelRemaining(): number { return this.state.fuelRemaining; }
  getHoursCamped(): number { return this.state.hoursCamped; }
  getRestDurations(): RestDuration[] { return this.config.restDurations; }
  canCamp(terrain: TerrainType): boolean { return terrain !== 'town'; }

  estimateRecovery(hours: RestDuration, hasFire: boolean, isDay: boolean): number {
    const { recoveryRates } = this.config;
    let rate = hasFire ? recoveryRates.withFire : recoveryRates.noFire;
    if (isDay) rate += recoveryRates.dayBonus;
    return hours * rate;
  }

  getEncounterChance(terrain: TerrainType, isNight: boolean, hasFire: boolean): number {
    const { encounterChances, fire } = this.config;
    let chance = encounterChances.base * encounterChances.terrainModifiers[terrain];
    if (isNight) chance *= encounterChances.nightMultiplier;
    if (hasFire) chance *= 1 - fire.safetyBonus * 0.3;
    return Math.min(1, Math.max(0, chance));
  }

  setupCamp(withFire: boolean, fuelAmount = 0, currentTime = 0): void {
    this.state.isCamping = true;
    this.state.campStartTime = currentTime;
    this.state.hoursCamped = 0;
    this.state.encounters = [];

    if (withFire && fuelAmount > 0) {
      this.state.fireState = 'burning';
      this.state.fuelRemaining = fuelAmount;
    } else {
      this.state.fireState = 'none';
      this.state.fuelRemaining = 0;
    }
  }

  addFuel(amount: number): void {
    this.state.fuelRemaining += amount;
    if (this.state.fireState === 'none' || this.state.fireState === 'smoldering') {
      this.state.fireState = 'burning';
    }
  }

  breakCamp(): void {
    this.state.isCamping = false;
    this.state.fireState = 'none';
    this.state.fuelRemaining = 0;
  }

  rest(
    duration: RestDuration,
    fatigue: FatigueSystem,
    provisions: ProvisionsSystem,
    clock: GameClock,
    terrain: TerrainType,
    rng?: () => number
  ): CampingResult {
    const random = rng ?? (() => scopedRNG('camping', 42, rngTick()));

    let hoursRested = 0;
    const encounters: CampEncounter[] = [];
    let wasInterrupted = false;

    for (let hour = 0; hour < duration; hour++) {
      const encounter = this.checkEncounter(terrain, clock.isNight(), random);
      if (encounter.type !== 'none') {
        encounters.push(encounter);
        this.state.encounters.push(encounter);
        if (encounter.wakesPlayer) {
          wasInterrupted = true;
          hoursRested = hour;
          break;
        }
      }

      if (this.hasFire()) {
        this.state.fuelRemaining -= this.config.fire.fuelPerHour;
        if (this.state.fuelRemaining <= 0) {
          this.state.fuelRemaining = 0;
          this.state.fireState = 'smoldering';
        }
      }

      clock.advanceHours(1, false);
      hoursRested = hour + 1;
    }

    const recoveryRate = this.hasFire()
      ? this.config.recoveryRates.withFire
      : this.config.recoveryRates.noFire;
    const dayBonus = !clock.isNight() ? this.config.recoveryRates.dayBonus : 0;
    const fatigueRecovered = hoursRested * (recoveryRate + dayBonus);
    fatigue.applyCampRest(hoursRested);

    const consumed = provisions.consumeForCamping(hoursRested);
    this.state.hoursCamped += hoursRested;

    let summary = `You rested for ${hoursRested} hour${hoursRested !== 1 ? 's' : ''}.`;
    if (wasInterrupted) {
      summary = `Your rest was interrupted after ${hoursRested} hour${hoursRested !== 1 ? 's' : ''}!`;
    }
    if (encounters.length > 0) {
      summary += ` You had ${encounters.length} encounter${encounters.length !== 1 ? 's' : ''}.`;
    }

    return {
      hoursRested,
      fatigueRecovered,
      foodConsumed: consumed.foodConsumed,
      waterConsumed: consumed.waterConsumed,
      wasInterrupted,
      encounters,
      endPhase: clock.getPhase(),
      summary,
    };
  }

  checkEncounter(
    terrain: TerrainType,
    isNight: boolean,
    rng?: () => number
  ): CampEncounter {
    const random = rng ?? (() => scopedRNG('camping', 42, rngTick()));
    const chance = this.getEncounterChance(terrain, isNight, this.hasFire());

    if (random() > chance) {
      return { type: 'none', isCombat: false, description: '', wakesPlayer: false };
    }

    return generateEncounter(rollEncounterType(this.config, random), random);
  }

  getState(): CampingState { return { ...this.state }; }

  loadState(state: Partial<CampingState>): void {
    this.state = { ...this.state, ...state };
  }

  reset(): void {
    this.state = { ...DEFAULT_CAMPING_STATE };
  }
}
