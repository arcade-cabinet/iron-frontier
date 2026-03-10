/**
 * NPC Generator - Barrel export for procedural NPC generation
 */

// Types
export { type GeneratedNPC } from './types.ts';

// Core generation and registry
export {
  generateNPC,
  getNPCTemplate,
  getNPCTemplatesByRole,
  getNPCTemplatesForLocation,
  initNPCTemplates,
} from './npcCore.ts';

// Location and building NPC generation
export {
  generateNPCsForBuilding,
  generateNPCsForLocation,
} from './locationNPCs.ts';
