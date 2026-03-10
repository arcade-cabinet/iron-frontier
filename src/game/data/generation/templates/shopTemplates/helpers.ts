/**
 * Shop Template Helpers
 */

import type {
  GenerationContext,
  PriceModifier,
  ShopInventoryTemplate,
} from '../../../schemas/generation.ts';
import {
  generalStoreTemplate,
  gunsmithTemplate,
  apothecaryTemplate,
  blacksmithTemplate,
  saloonTemplate,
} from './standard.ts';
import {
  tradingPostTemplate,
  specialtySteamTemplate,
  stableTemplate,
  assayOfficeTemplate,
  travelingMerchantTemplate,
} from './specialty.ts';
import {
  boomTownPremium,
  cattleDriveMeatDiscount,
  droughtWaterPremium,
  festivalDiscount,
  ghostTownDiscount,
  medicalEmergencyPremium,
  miningTownOrePremium,
  outlawTerritoryPremium,
  railroadConnectionDiscount,
  remoteLocationPremium,
  steamTechPremium,
  summerPerishablesDiscount,
  warAmmunitionPremium,
  winterSupplyPremium,
} from './priceModifiers.ts';

export const SHOP_TEMPLATES: ShopInventoryTemplate[] = [
  generalStoreTemplate,
  gunsmithTemplate,
  apothecaryTemplate,
  blacksmithTemplate,
  saloonTemplate,
  tradingPostTemplate,
  specialtySteamTemplate,
  stableTemplate,
  assayOfficeTemplate,
  travelingMerchantTemplate,
];

export const PRICE_MODIFIERS: PriceModifier[] = [
  boomTownPremium,
  ghostTownDiscount,
  railroadConnectionDiscount,
  miningTownOrePremium,
  droughtWaterPremium,
  warAmmunitionPremium,
  winterSupplyPremium,
  summerPerishablesDiscount,
  cattleDriveMeatDiscount,
  remoteLocationPremium,
  outlawTerritoryPremium,
  festivalDiscount,
  steamTechPremium,
  medicalEmergencyPremium,
];

/**
 * Get a shop template by shop type or ID
 */
export function getShopTemplate(shopTypeOrId: string): ShopInventoryTemplate | undefined {
  return SHOP_TEMPLATES.find(
    (template) => template.id === shopTypeOrId || template.shopType === shopTypeOrId
  );
}

/**
 * Get all shop templates matching given tags
 */
export function getShopTemplatesByTags(tags: string[]): ShopInventoryTemplate[] {
  return SHOP_TEMPLATES.filter((template) => tags.some((tag) => template.tags.includes(tag)));
}

/**
 * Context for price calculation
 */
export interface PriceCalculationContext {
  /** Location type (town, outpost, etc.) */
  locationType?: string;
  /** Region ID */
  region?: string;
  /** Active world events */
  activeEvents?: string[];
  /** Current season */
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  /** Faction tensions (faction ID -> tension level 0-1) */
  factionTensions?: Record<string, number>;
  /** Population of the location */
  population?: number;
  /** Danger level (1-10) */
  dangerLevel?: number;
  /** Location features (e.g., 'railroad', 'river') */
  features?: string[];
}

/**
 * Check if a condition is met given the context
 */
function checkCondition(
  condition: { type?: string; target?: string; value?: number },
  context: PriceCalculationContext
): boolean {
  switch (condition.type ?? '') {
    case 'event_active':
      return context.activeEvents?.includes(condition.target ?? '') ?? false;

    case 'season':
      return context.season === condition.target;

    case 'population_below':
      return (context.population ?? 100) < (condition.value ?? 0);

    case 'danger_level_above':
      return (context.dangerLevel ?? 1) > (condition.value ?? 0);

    case 'faction_tension_above':
      if (condition.target === 'any') {
        return Object.values(context.factionTensions ?? {}).some(
          (tension) => tension > (condition.value ?? 0)
        );
      }
      return (context.factionTensions?.[condition.target ?? ''] ?? 0) > (condition.value ?? 0);

    case 'has_feature':
      return context.features?.includes(condition.target ?? '') ?? false;

    default:
      return true;
  }
}

/**
 * Check if a modifier applies to the given item and context
 */
function modifierApplies(
  modifier: PriceModifier,
  itemTags: string[],
  context: PriceCalculationContext
): boolean {
  const itemTagsMatch =
    modifier.itemTags.length === 0 || modifier.itemTags.some((tag) => itemTags.includes(tag));
  const locationTypeMatch =
    modifier.locationTypes.length === 0 ||
    (context.locationType !== undefined && modifier.locationTypes.includes(context.locationType));
  const regionMatch =
    modifier.regions.length === 0 ||
    (context.region !== undefined && modifier.regions.includes(context.region));
  const conditionsMet = modifier.conditions.every((condition) =>
    checkCondition(condition, context)
  );
  return itemTagsMatch && locationTypeMatch && regionMatch && conditionsMet;
}

/**
 * Calculate the final price for an item
 */
export function calculatePrice(
  basePrice: number,
  itemTags: string[],
  context: PriceCalculationContext
): number {
  let finalMultiplier = 1.0;
  for (const modifier of PRICE_MODIFIERS) {
    if (modifierApplies(modifier, itemTags, context)) {
      const midpoint = (modifier.multiplierRange[0] + modifier.multiplierRange[1]) / 2;
      finalMultiplier *= midpoint;
    }
  }
  return Math.round(basePrice * finalMultiplier);
}

/**
 * Calculate price with variance
 */
export function calculatePriceWithVariance(
  basePrice: number,
  itemTags: string[],
  context: PriceCalculationContext,
  random: () => number
): number {
  let finalMultiplier = 1.0;
  for (const modifier of PRICE_MODIFIERS) {
    if (modifierApplies(modifier, itemTags, context)) {
      const [min, max] = modifier.multiplierRange;
      const variance = random() * (max - min) + min;
      finalMultiplier *= variance;
    }
  }
  return Math.round(basePrice * finalMultiplier);
}

/**
 * Get all applicable modifiers for given item tags and context
 */
export function getApplicableModifiers(
  itemTags: string[],
  context: PriceCalculationContext
): PriceModifier[] {
  return PRICE_MODIFIERS.filter((modifier) => modifierApplies(modifier, itemTags, context));
}

/**
 * Create a GenerationContext compatible price context from game state
 */
export function createPriceContextFromGeneration(
  genContext: GenerationContext
): PriceCalculationContext {
  return {
    region: genContext.regionId,
    activeEvents: genContext.activeEvents,
    factionTensions: genContext.factionTensions,
  };
}
