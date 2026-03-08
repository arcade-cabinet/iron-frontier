/**
 * CompassBar — Fallout-style horizontal compass strip at the top of the screen.
 *
 * Shows cardinal/intercardinal direction tick marks (N, NE, E, etc.) that scroll
 * as the player rotates. Renders quest objective markers, nearby location names,
 * and enemy markers (red dots) during combat.
 *
 * Consumes player camera yaw from the Zustand store and quest markers from
 * QuestMarkerSystem. Styled in warm amber monochrome per the Iron Frontier palette.
 *
 * @module components/game/CompassBar
 */

import * as React from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { useGameStoreShallow } from '@/hooks/useGameStore';
import { useResponsive } from '@/hooks/useResponsive';
import { getActiveQuestMarkers, type QuestMarker } from '@/src/game/systems/QuestMarkerSystem';
import { gameStore } from '@/src/game/store/webGameStore';

// ============================================================================
// CONSTANTS
// ============================================================================

/** HUD amber color palette */
const HUD_AMBER = '#D4A855';
const HUD_AMBER_DIM = '#C4963F';
const HUD_TEXT = '#E8D5A8';
const HUD_BG = 'rgba(20, 15, 10, 0.6)';
const HUD_RED = '#CC4444';

/** Cardinal directions with their bearings in degrees. */
const DIRECTIONS: { label: string; bearing: number; major: boolean }[] = [
  { label: 'N', bearing: 0, major: true },
  { label: 'NE', bearing: 45, major: false },
  { label: 'E', bearing: 90, major: true },
  { label: 'SE', bearing: 135, major: false },
  { label: 'S', bearing: 180, major: true },
  { label: 'SW', bearing: 225, major: false },
  { label: 'W', bearing: 270, major: true },
  { label: 'NW', bearing: 315, major: false },
];

/** Tick marks every 15 degrees */
const TICK_INTERVAL = 15;

/** Visible arc of the compass in degrees. */
const COMPASS_FOV = 180;

/** Width of the compass bar relative to screen (0-1). */
const COMPASS_WIDTH_RATIO = 0.6;

/** Maximum distance for location names to appear (world units). */
const LOCATION_LABEL_DISTANCE = 100;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Normalize an angle to [-180, 180).
 */
function normalizeAngle(deg: number): number {
  let a = ((deg % 360) + 360) % 360;
  if (a >= 180) a -= 360;
  return a;
}

/**
 * Convert player yaw (radians, math convention) to compass bearing (degrees, 0=N, CW).
 */
function yawToBearing(yaw: number): number {
  // yaw=0 is facing +Z (North), increasing yaw rotates CW viewed from above
  const deg = (yaw * 180) / Math.PI;
  return ((deg % 360) + 360) % 360;
}

/**
 * Calculate the compass-relative X position of a bearing given the player bearing.
 * Returns a value in [-0.5, 0.5] (fraction of compass width), or null if out of FOV.
 */
function bearingToCompassX(
  targetBearing: number,
  playerBearing: number,
): number | null {
  const diff = normalizeAngle(targetBearing - playerBearing);
  const halfFov = COMPASS_FOV / 2;
  if (Math.abs(diff) > halfFov) return null;
  return diff / COMPASS_FOV;
}

/**
 * Compute bearing from player to a world position.
 */
function bearingToTarget(
  px: number,
  pz: number,
  tx: number,
  tz: number,
): number {
  const dx = tx - px;
  const dz = tz - pz;
  const rad = Math.atan2(dx, dz); // atan2(x,z) gives bearing from north
  return ((rad * 180) / Math.PI + 360) % 360;
}

// ============================================================================
// TICK MARK COMPONENT
// ============================================================================

interface TickProps {
  xFraction: number;
  label?: string;
  major: boolean;
  compassWidth: number;
}

const Tick = React.memo(function Tick({ xFraction, label, major, compassWidth }: TickProps) {
  const x = compassWidth * (0.5 + xFraction);
  const height = major ? 10 : 5;

  return (
    <View
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        alignItems: 'center',
        transform: [{ translateX: -0.5 }],
      }}
    >
      {/* Tick line */}
      <View
        style={{
          width: 1,
          height,
          backgroundColor: major ? HUD_AMBER : HUD_AMBER_DIM,
          opacity: major ? 0.9 : 0.4,
        }}
      />
      {/* Label */}
      {label && (
        <Text
          style={{
            color: HUD_AMBER,
            fontSize: major ? 10 : 8,
            fontWeight: major ? '700' : '400',
            fontFamily: Platform.select({
              ios: 'Menlo',
              android: 'monospace',
              default: 'monospace',
            }),
            marginTop: 1,
            opacity: major ? 1 : 0.6,
          }}
        >
          {label}
        </Text>
      )}
    </View>
  );
});

// ============================================================================
// QUEST MARKER DIAMOND
// ============================================================================

interface MarkerDiamondProps {
  xFraction: number;
  compassWidth: number;
  color?: string;
  label?: string;
}

const MarkerDiamond = React.memo(function MarkerDiamond({
  xFraction,
  compassWidth,
  color = HUD_AMBER,
  label,
}: MarkerDiamondProps) {
  const x = compassWidth * (0.5 + xFraction);

  return (
    <View
      style={{
        position: 'absolute',
        left: x,
        bottom: -2,
        alignItems: 'center',
        transform: [{ translateX: -4 }],
      }}
    >
      {/* Diamond shape */}
      <View
        style={{
          width: 8,
          height: 8,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
          opacity: 0.9,
        }}
      />
      {label && (
        <Text
          style={{
            color: HUD_TEXT,
            fontSize: 8,
            marginTop: 4,
            textAlign: 'center',
            maxWidth: 60,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </View>
  );
});

// ============================================================================
// ENEMY DOT
// ============================================================================

interface EnemyDotProps {
  xFraction: number;
  compassWidth: number;
}

const EnemyDot = React.memo(function EnemyDot({ xFraction, compassWidth }: EnemyDotProps) {
  const x = compassWidth * (0.5 + xFraction);

  return (
    <View
      style={{
        position: 'absolute',
        left: x,
        top: 2,
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: HUD_RED,
        transform: [{ translateX: -2.5 }],
        opacity: 0.9,
      }}
    />
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CompassBar() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, isPhone } = useResponsive();

  const { playerRotation, combatState } = useGameStoreShallow((s) => ({
    playerRotation: s.playerRotation,
    combatState: s.combatState,
  }));

  const compassWidth = Math.round(screenWidth * COMPASS_WIDTH_RATIO);
  const playerBearing = yawToBearing(playerRotation);

  // Get quest markers from the full store
  const questMarkers = React.useMemo(() => {
    const state = gameStore.getState();
    return getActiveQuestMarkers(state);
  }, [playerRotation]); // Recalc when player moves

  // Get enemy bearings from combat state
  const enemyBearings = React.useMemo(() => {
    if (!combatState) return [];
    const state = gameStore.getState();
    const playerPos = state.playerPosition;
    return combatState.combatants
      .filter((c) => !c.isPlayer && !c.isDead)
      .map((enemy) => {
        // Enemy positions in combat are hex-grid, approximate to world positions
        // For now, distribute them evenly in a 30-degree arc in front
        const offset = (enemy.position.q * 15) - 15;
        return (playerBearing + offset + 360) % 360;
      });
  }, [combatState, playerBearing]);

  // Build tick marks
  const ticks = React.useMemo(() => {
    const result: { bearing: number; label?: string; major: boolean }[] = [];

    // Add cardinal direction ticks
    for (const dir of DIRECTIONS) {
      result.push({ bearing: dir.bearing, label: dir.label, major: dir.major });
    }

    // Add intermediate ticks every TICK_INTERVAL degrees
    for (let b = 0; b < 360; b += TICK_INTERVAL) {
      // Skip if there's already a direction label at this bearing
      if (DIRECTIONS.some((d) => d.bearing === b)) continue;
      result.push({ bearing: b, major: false });
    }

    return result;
  }, []);

  return (
    <View
      style={{
        position: 'absolute',
        top: Math.max(insets.top, 8) + 4,
        left: (screenWidth - compassWidth) / 2,
        width: compassWidth,
        height: isPhone ? 28 : 34,
        backgroundColor: HUD_BG,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: `${HUD_AMBER}33`,
        overflow: 'hidden',
      }}
      pointerEvents="none"
    >
      {/* Center line indicator */}
      <View
        style={{
          position: 'absolute',
          left: compassWidth / 2,
          top: 0,
          bottom: 0,
          width: 1,
          backgroundColor: HUD_AMBER,
          opacity: 0.5,
        }}
      />

      {/* Tick marks and labels */}
      {ticks.map((tick) => {
        const x = bearingToCompassX(tick.bearing, playerBearing);
        if (x === null) return null;
        return (
          <Tick
            key={tick.bearing}
            xFraction={x}
            label={tick.label}
            major={tick.major}
            compassWidth={compassWidth}
          />
        );
      })}

      {/* Quest markers */}
      {questMarkers
        .filter((m): m is QuestMarker & { worldPosition: NonNullable<QuestMarker['worldPosition']> } =>
          !m.isComplete && m.worldPosition !== null,
        )
        .map((marker) => {
          const state = gameStore.getState();
          const bearing = bearingToTarget(
            state.playerPosition.x,
            state.playerPosition.z,
            marker.worldPosition.x,
            marker.worldPosition.z,
          );
          const x = bearingToCompassX(bearing, playerBearing);
          if (x === null) return null;

          const showLabel =
            marker.distance !== null && marker.distance < LOCATION_LABEL_DISTANCE;

          return (
            <MarkerDiamond
              key={`${marker.questId}-${marker.objectiveId}`}
              xFraction={x}
              compassWidth={compassWidth}
              label={showLabel ? marker.label : undefined}
            />
          );
        })}

      {/* Enemy dots */}
      {enemyBearings.map((bearing, i) => {
        const x = bearingToCompassX(bearing, playerBearing);
        if (x === null) return null;
        return (
          <EnemyDot
            key={`enemy-${i}`}
            xFraction={x}
            compassWidth={compassWidth}
          />
        );
      })}
    </View>
  );
}
