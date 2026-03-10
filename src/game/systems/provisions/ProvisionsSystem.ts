import type {
  ForagingResult,
  HuntingResult,
  ProvisionsConfig,
  ProvisionsState,
  ProvisionStatus,
  TerrainType,
} from './types';
import { DEFAULT_PROVISIONS_CONFIG, DEFAULT_PROVISIONS_STATE, STATUS_THRESHOLDS } from './config';
import { executeHunt, executeForage } from './gathering';

export class ProvisionsSystem {
  private config: ProvisionsConfig;
  private state: ProvisionsState;

  constructor(
    config: Partial<ProvisionsConfig> = {},
    initialState: Partial<ProvisionsState> = {}
  ) {
    this.config = { ...DEFAULT_PROVISIONS_CONFIG, ...config };
    this.state = { ...DEFAULT_PROVISIONS_STATE, ...initialState };
  }

  getFood(): number { return this.state.food; }
  getWater(): number { return this.state.water; }
  getFoodPercentage(): number { return this.state.food / this.config.maxFood; }
  getWaterPercentage(): number { return this.state.water / this.config.maxWater; }
  getFoodStatus(): ProvisionStatus { return this.getStatus(this.getFoodPercentage()); }
  getWaterStatus(): ProvisionStatus { return this.getStatus(this.getWaterPercentage()); }
  hasFood(): boolean { return this.state.food > 0; }
  hasWater(): boolean { return this.state.water > 0; }
  getHoursSinceFood(): number { return this.state.hoursSinceFood; }
  getHoursSinceWater(): number { return this.state.hoursSinceWater; }

  getOverallStatus(): ProvisionStatus {
    const statusOrder: ProvisionStatus[] = ['abundant', 'adequate', 'low', 'critical', 'depleted'];
    const foodIndex = statusOrder.indexOf(this.getFoodStatus());
    const waterIndex = statusOrder.indexOf(this.getWaterStatus());
    return statusOrder[Math.max(foodIndex, waterIndex)];
  }

  getFatigueMultiplier(): number {
    let multiplier = 1.0;
    if (!this.hasFood()) multiplier *= this.config.depletionEffects.noFood;
    if (!this.hasWater()) multiplier *= this.config.depletionEffects.noWater;
    return multiplier;
  }

  getDehydrationDamage(): number {
    return this.hasWater() ? 0 : this.config.dehydrationDamage;
  }

  estimateFoodDuration(): number {
    if (!this.hasFood()) return 0;
    return this.state.food / this.config.consumption.food;
  }

  estimateWaterDuration(): number {
    if (!this.hasWater()) return 0;
    return this.state.water / this.config.consumption.water;
  }

  getDescription(): string {
    const foodStatus = this.getFoodStatus();
    const waterStatus = this.getWaterStatus();

    if (foodStatus === 'depleted' && waterStatus === 'depleted') {
      return 'You are starving and severely dehydrated. Find supplies immediately!';
    }
    if (waterStatus === 'depleted') return 'You are severely dehydrated. Your health is draining!';
    if (foodStatus === 'depleted') return 'You are starving. Fatigue is building rapidly.';
    if (foodStatus === 'critical' || waterStatus === 'critical') {
      return 'Supplies are critically low. Resupply soon or hunt for food.';
    }
    if (foodStatus === 'low' || waterStatus === 'low') return 'Supplies are running low. Consider restocking.';
    if (foodStatus === 'abundant' && waterStatus === 'abundant') return 'Well-stocked with provisions.';
    return 'Supplies are adequate for now.';
  }

  consumeForTravel(hours: number): {
    foodConsumed: number;
    waterConsumed: number;
    ranOutOfFood: boolean;
    ranOutOfWater: boolean;
  } {
    const previousFood = this.state.food;
    const previousWater = this.state.water;

    this.state.food = Math.max(0, this.state.food - hours * this.config.consumption.food);
    this.state.water = Math.max(0, this.state.water - hours * this.config.consumption.water);

    if (this.hasFood()) { this.state.hoursSinceFood = 0; }
    else { this.state.hoursSinceFood += hours; }

    if (this.hasWater()) { this.state.hoursSinceWater = 0; }
    else { this.state.hoursSinceWater += hours; }

    return {
      foodConsumed: previousFood - this.state.food,
      waterConsumed: previousWater - this.state.water,
      ranOutOfFood: previousFood > 0 && this.state.food === 0,
      ranOutOfWater: previousWater > 0 && this.state.water === 0,
    };
  }

  consumeForCamping(hours: number): { foodConsumed: number; waterConsumed: number } {
    const previousFood = this.state.food;
    const previousWater = this.state.water;

    this.state.food = Math.max(0, this.state.food - (hours * this.config.consumption.food) / 2);
    this.state.water = Math.max(0, this.state.water - (hours * this.config.consumption.water) / 2);

    return {
      foodConsumed: previousFood - this.state.food,
      waterConsumed: previousWater - this.state.water,
    };
  }

  addFood(amount: number): void {
    this.state.food = Math.min(this.config.maxFood, this.state.food + amount);
    this.state.hoursSinceFood = 0;
  }

  addWater(amount: number): void {
    this.state.water = Math.min(this.config.maxWater, this.state.water + amount);
    this.state.hoursSinceWater = 0;
  }

  addProvisions(food: number, water: number): void {
    this.addFood(food);
    this.addWater(water);
  }

  refillAll(): void {
    this.state.food = this.config.maxFood;
    this.state.water = this.config.maxWater;
    this.state.hoursSinceFood = 0;
    this.state.hoursSinceWater = 0;
  }

  attemptHunt(skillModifier = 0, rng?: () => number): HuntingResult {
    const random = rng ?? Math.random;
    const result = executeHunt(this.config, skillModifier, random);
    if (result.apply) {
      this.addFood(result.foodGained);
      this.addWater(result.waterGained);
    }
    const { apply: _, ...huntResult } = result;
    return huntResult;
  }

  attemptForage(terrain: TerrainType, rng?: () => number): ForagingResult {
    const random = rng ?? Math.random;
    const result = executeForage(this.config, terrain, random);
    if (result.apply) {
      this.addFood(result.foodFound);
      this.addWater(result.waterFound);
    }
    const { apply: _, ...forageResult } = result;
    return forageResult;
  }

  getForagingChance(terrain: TerrainType): number {
    return this.config.foragingChances[terrain];
  }

  getState(): ProvisionsState { return { ...this.state }; }

  loadState(state: Partial<ProvisionsState>): void {
    this.state = { ...this.state, ...state };
  }

  reset(): void {
    this.state = { ...DEFAULT_PROVISIONS_STATE };
  }

  private getStatus(percentage: number): ProvisionStatus {
    if (percentage >= STATUS_THRESHOLDS.abundant) return 'abundant';
    if (percentage >= STATUS_THRESHOLDS.adequate) return 'adequate';
    if (percentage >= STATUS_THRESHOLDS.low) return 'low';
    if (percentage >= STATUS_THRESHOLDS.critical) return 'critical';
    return 'depleted';
  }
}
