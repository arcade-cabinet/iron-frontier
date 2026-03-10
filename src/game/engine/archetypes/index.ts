// engine/archetypes — Procedural building archetype registry.
// Every archetype registers itself here. The R3F <Building> component
// looks up archetypes from ARCHETYPE_REGISTRY by type key.

import { BankArchetype } from './Bank';
import { BarberArchetype } from './Barber';
import { BlacksmithArchetype } from './Blacksmith';
import { ChurchArchetype } from './Church';
import { DoctorOfficeArchetype } from './DoctorOffice';
import { GeneralStoreArchetype } from './GeneralStore';
import { InnArchetype } from './Inn';
import { LiveryArchetype } from './Livery';
import { MiningOfficeArchetype } from './MiningOffice';
import { NewspaperArchetype } from './Newspaper';
import { SaloonArchetype } from './Saloon';
import { SheriffOfficeArchetype } from './SheriffOffice';
import { TelegraphOfficeArchetype } from './TelegraphOffice';
import { UndertakerArchetype } from './Undertaker';
import type { BuildingArchetype } from './types';

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const ARCHETYPE_REGISTRY = new Map<string, BuildingArchetype>();

// Register all archetypes
ARCHETYPE_REGISTRY.set(SaloonArchetype.type, SaloonArchetype);
ARCHETYPE_REGISTRY.set(InnArchetype.type, InnArchetype);
ARCHETYPE_REGISTRY.set(SheriffOfficeArchetype.type, SheriffOfficeArchetype);
ARCHETYPE_REGISTRY.set(GeneralStoreArchetype.type, GeneralStoreArchetype);
ARCHETYPE_REGISTRY.set(BlacksmithArchetype.type, BlacksmithArchetype);
ARCHETYPE_REGISTRY.set(BankArchetype.type, BankArchetype);
ARCHETYPE_REGISTRY.set(ChurchArchetype.type, ChurchArchetype);
ARCHETYPE_REGISTRY.set(DoctorOfficeArchetype.type, DoctorOfficeArchetype);
ARCHETYPE_REGISTRY.set(LiveryArchetype.type, LiveryArchetype);
ARCHETYPE_REGISTRY.set(TelegraphOfficeArchetype.type, TelegraphOfficeArchetype);
ARCHETYPE_REGISTRY.set(MiningOfficeArchetype.type, MiningOfficeArchetype);
ARCHETYPE_REGISTRY.set(UndertakerArchetype.type, UndertakerArchetype);
ARCHETYPE_REGISTRY.set(NewspaperArchetype.type, NewspaperArchetype);
ARCHETYPE_REGISTRY.set(BarberArchetype.type, BarberArchetype);

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export type { BuildingArchetype, BuildingSlots } from './types';
export { SaloonArchetype } from './Saloon';
export { InnArchetype } from './Inn';
export { SheriffOfficeArchetype } from './SheriffOffice';
export { GeneralStoreArchetype } from './GeneralStore';
export { BlacksmithArchetype } from './Blacksmith';
export { BankArchetype } from './Bank';
export { ChurchArchetype } from './Church';
export { DoctorOfficeArchetype } from './DoctorOffice';
export { LiveryArchetype } from './Livery';
export { TelegraphOfficeArchetype } from './TelegraphOffice';
export { MiningOfficeArchetype } from './MiningOffice';
export { UndertakerArchetype } from './Undertaker';
export { NewspaperArchetype } from './Newspaper';
export { BarberArchetype } from './Barber';

// Building base helpers — useful for custom archetypes
export { createFloor, createRoof, createWall, DEFAULT_PALETTE } from './BuildingBase';
export { createDoor, createPorch, createSign, createWindow } from './BuildingBase.composite';
