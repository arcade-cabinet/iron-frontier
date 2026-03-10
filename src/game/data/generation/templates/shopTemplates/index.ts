/**
 * Shop Templates - Procedural shop inventory generation
 */

export { generalStoreTemplate, gunsmithTemplate, apothecaryTemplate, blacksmithTemplate, saloonTemplate } from './standard.ts';
export { tradingPostTemplate, specialtySteamTemplate, stableTemplate, assayOfficeTemplate, travelingMerchantTemplate } from './specialty.ts';

export {
  calculatePrice,
  calculatePriceWithVariance,
  createPriceContextFromGeneration,
  getApplicableModifiers,
  getShopTemplate,
  getShopTemplatesByTags,
  type PriceCalculationContext,
  PRICE_MODIFIERS,
  SHOP_TEMPLATES,
} from './helpers.ts';
