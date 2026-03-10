/**
 * Price Modifiers - Context-based price adjustments
 */

import type { PriceModifier } from '../../../schemas/generation.ts';

// ============================================================================
// PRICE MODIFIERS
// ============================================================================

/**
 * Boom Town Premium - Mining boom increases all prices
 */
export const boomTownPremium: PriceModifier = {
  id: 'boom_town_premium',
  itemTags: [],
  locationTypes: ['boom_town', 'mining_town'],
  regions: [],
  multiplierRange: [1.2, 1.4],
  conditions: [{ type: 'event_active', target: 'mining_boom' }],
  tags: ['economy', 'boom'],
};


/**
 * Ghost Town Discount - Abandoned towns have desperate sellers
 */
export const ghostTownDiscount: PriceModifier = {
  id: 'ghost_town_discount',
  itemTags: [],
  locationTypes: ['ghost_town', 'abandoned'],
  regions: [],
  multiplierRange: [0.5, 0.7],
  conditions: [{ type: 'population_below', value: 10 }],
  tags: ['economy', 'abandoned'],
};


/**
 * Railroad Connection Discount - Better supply lines mean lower prices
 */
export const railroadConnectionDiscount: PriceModifier = {
  id: 'railroad_connection',
  itemTags: [],
  locationTypes: ['railroad_town', 'station'],
  regions: [],
  multiplierRange: [0.8, 0.9],
  conditions: [{ type: 'has_feature', target: 'railroad' }],
  tags: ['economy', 'infrastructure'],
};


/**
 * Mining Town Ore Premium - Ore and minerals cost more in mining towns
 */
export const miningTownOrePremium: PriceModifier = {
  id: 'mining_town_ore_premium',
  itemTags: ['ore', 'mineral', 'gold', 'silver', 'copper'],
  locationTypes: ['mining_town', 'mining_camp'],
  regions: [],
  multiplierRange: [1.15, 1.35],
  conditions: [],
  tags: ['mining', 'commodity'],
};


/**
 * Drought Water Premium - Water and related goods spike during drought
 */
export const droughtWaterPremium: PriceModifier = {
  id: 'drought_water_premium',
  itemTags: ['water', 'canteen', 'liquid', 'drink'],
  locationTypes: [],
  regions: ['desert', 'badlands', 'scrubland'],
  multiplierRange: [1.5, 2.0],
  conditions: [{ type: 'event_active', target: 'drought' }],
  tags: ['weather', 'emergency'],
};


/**
 * War Ammunition Premium - Conflict drives up ammo prices
 */
export const warAmmunitionPremium: PriceModifier = {
  id: 'war_ammunition_premium',
  itemTags: ['ammunition', 'ammo', 'gunpowder', 'weapon'],
  locationTypes: [],
  regions: [],
  multiplierRange: [1.3, 1.6],
  conditions: [{ type: 'faction_tension_above', target: 'any', value: 0.7 }],
  tags: ['conflict', 'military'],
};


/**
 * Winter Supply Premium - Cold weather increases supply costs
 */
export const winterSupplyPremium: PriceModifier = {
  id: 'winter_supply_premium',
  itemTags: ['food', 'fuel', 'coal', 'clothing', 'blanket'],
  locationTypes: [],
  regions: ['mountains', 'northern_territory'],
  multiplierRange: [1.2, 1.4],
  conditions: [{ type: 'season', target: 'winter' }],
  tags: ['seasonal', 'weather'],
};


/**
 * Summer Perishables Discount - Perishable goods cheaper in summer
 */
export const summerPerishablesDiscount: PriceModifier = {
  id: 'summer_perishables_discount',
  itemTags: ['food', 'fruit', 'vegetable', 'perishable'],
  locationTypes: [],
  regions: [],
  multiplierRange: [0.75, 0.9],
  conditions: [{ type: 'season', target: 'summer' }],
  tags: ['seasonal', 'agriculture'],
};


/**
 * Cattle Drive Meat Discount - Surplus meat during cattle drives
 */
export const cattleDriveMeatDiscount: PriceModifier = {
  id: 'cattle_drive_meat_discount',
  itemTags: ['meat', 'beef', 'jerky', 'food'],
  locationTypes: ['cattle_town', 'ranch'],
  regions: ['plains', 'grassland'],
  multiplierRange: [0.7, 0.85],
  conditions: [{ type: 'event_active', target: 'cattle_drive' }],
  tags: ['livestock', 'seasonal'],
};


/**
 * Remote Location Premium - Distance from civilization increases prices
 */
export const remoteLocationPremium: PriceModifier = {
  id: 'remote_location_premium',
  itemTags: [],
  locationTypes: ['outpost', 'waystation', 'frontier_camp'],
  regions: ['badlands', 'deep_desert', 'wilderness'],
  multiplierRange: [1.25, 1.5],
  conditions: [],
  tags: ['logistics', 'frontier'],
};


/**
 * Outlaw Territory Premium - Risk premium in dangerous areas
 */
export const outlawTerritoryPremium: PriceModifier = {
  id: 'outlaw_territory_premium',
  itemTags: [],
  locationTypes: [],
  regions: ['badlands', 'outlaw_territory'],
  multiplierRange: [1.15, 1.35],
  conditions: [{ type: 'danger_level_above', value: 6 }],
  tags: ['danger', 'risk'],
};


/**
 * Festival Discount - Town celebrations bring sales
 */
export const festivalDiscount: PriceModifier = {
  id: 'festival_discount',
  itemTags: ['alcohol', 'food', 'clothing', 'luxury'],
  locationTypes: ['town', 'city'],
  regions: [],
  multiplierRange: [0.85, 0.95],
  conditions: [{ type: 'event_active', target: 'festival' }],
  tags: ['social', 'celebration'],
};


/**
 * Steam Tech Premium - High-tech items always cost more
 */
export const steamTechPremium: PriceModifier = {
  id: 'steam_tech_premium',
  itemTags: ['steam', 'automaton', 'gadget', 'clockwork', 'mechanical'],
  locationTypes: [],
  regions: [],
  multiplierRange: [1.3, 1.5],
  conditions: [],
  tags: ['technology', 'steampunk'],
};


/**
 * Medical Emergency Premium - Disease outbreaks spike medical prices
 */
export const medicalEmergencyPremium: PriceModifier = {
  id: 'medical_emergency_premium',
  itemTags: ['medicine', 'bandage', 'antidote', 'tonic', 'healing'],
  locationTypes: [],
  regions: [],
  multiplierRange: [1.5, 2.0],
  conditions: [{ type: 'event_active', target: 'disease_outbreak' }],
  tags: ['emergency', 'medical'],
};
