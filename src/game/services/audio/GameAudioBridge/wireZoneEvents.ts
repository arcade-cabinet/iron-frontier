/**
 * Zone system event wiring for the GameAudioBridge.
 *
 * @module services/audio/GameAudioBridge/wireZoneEvents
 */

import { getZoneSystem, type Zone } from '../../../systems/ZoneSystem';
import type { AmbientManager, AmbientZone } from '../AmbientManager';
import type { MusicManager } from '../MusicManager';
import type { SFXNodeCache } from './SFXNodeCache';

/**
 * Subscribe to zone change events and trigger the appropriate audio.
 * Returns an unsubscribe function.
 */
export function wireZoneEvents(
  sfxCache: SFXNodeCache,
  ambientManager: AmbientManager | null,
  musicManager: MusicManager | null,
): () => void {
  const zoneSystem = getZoneSystem();

  const unsubZoneChange = zoneSystem.onZoneChange(
    (newZone: Zone | null, _previousZone: Zone | null) => {
      if (!newZone) {
        ambientManager?.setZone('wilderness');
        musicManager?.setState('exploration_day');
        return;
      }

      let ambientZone: AmbientZone = 'wilderness';
      if (newZone.type === 'town') {
        ambientZone = 'town';
        musicManager?.setState('town');
      } else if (newZone.type === 'building') {
        ambientZone = 'interior';
        sfxCache.play('door_open');
      } else if (newZone.type === 'route') {
        ambientZone = 'wilderness';
      }

      ambientManager?.setZone(ambientZone);
    },
  );

  return unsubZoneChange;
}
