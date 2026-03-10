import { ZoneSystem } from './ZoneSystem';

let zoneSystemInstance: ZoneSystem | null = null;

export function getZoneSystem(): ZoneSystem {
  if (!zoneSystemInstance) {
    zoneSystemInstance = new ZoneSystem();
  }
  return zoneSystemInstance;
}

export function resetZoneSystem(): void {
  if (zoneSystemInstance) {
    zoneSystemInstance.dispose();
    zoneSystemInstance = null;
  }
}
