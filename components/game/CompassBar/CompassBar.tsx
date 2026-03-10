import * as React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGameStoreShallow } from "@/hooks/useGameStore";
import { useResponsive } from "@/hooks/useResponsive";
import { gameStore } from "@/src/game/store/webGameStore";
import { getActiveQuestMarkers, type QuestMarker } from "@/src/game/systems/QuestMarkerSystem";
import { EnemyDot, MarkerDiamond, Tick } from "./CompassMarkers.tsx";
import {
  COMPASS_WIDTH_RATIO,
  DIRECTIONS,
  HUD_AMBER,
  HUD_BG,
  LOCATION_LABEL_DISTANCE,
  TICK_INTERVAL,
} from "./constants.ts";
import { bearingToCompassX, bearingToTarget, yawToBearing } from "./helpers.ts";

export function CompassBar() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, isPhone } = useResponsive();

  const { playerRotation, combatState } = useGameStoreShallow((s) => ({
    playerRotation: s.playerRotation,
    combatState: s.combatState,
  }));

  const compassWidth = Math.round(screenWidth * COMPASS_WIDTH_RATIO);
  const playerBearing = yawToBearing(playerRotation);

  const questMarkers = React.useMemo(() => {
    const state = gameStore.getState();
    return getActiveQuestMarkers(state);
  }, []);

  const enemyBearings = React.useMemo(() => {
    if (!combatState) return [];
    const state = gameStore.getState();
    const _playerPos = state.playerPosition;
    return combatState.combatants
      .filter((c) => !c.isPlayer && !c.isDead)
      .map((enemy) => {
        const offset = enemy.position.q * 15 - 15;
        return (playerBearing + offset + 360) % 360;
      });
  }, [combatState, playerBearing]);

  const ticks = React.useMemo(() => {
    const result: { bearing: number; label?: string; major: boolean }[] = [];

    for (const dir of DIRECTIONS) {
      result.push({ bearing: dir.bearing, label: dir.label, major: dir.major });
    }

    for (let b = 0; b < 360; b += TICK_INTERVAL) {
      if (DIRECTIONS.some((d) => d.bearing === b)) continue;
      result.push({ bearing: b, major: false });
    }

    return result;
  }, []);

  return (
    <View
      style={{
        position: "absolute",
        top: Math.max(insets.top, 8) + 4,
        left: (screenWidth - compassWidth) / 2,
        width: compassWidth,
        height: isPhone ? 28 : 34,
        backgroundColor: HUD_BG,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: `${HUD_AMBER}33`,
        overflow: "hidden",
      }}
      pointerEvents="none"
    >
      <View
        style={{
          position: "absolute",
          left: compassWidth / 2,
          top: 0,
          bottom: 0,
          width: 1,
          backgroundColor: HUD_AMBER,
          opacity: 0.5,
        }}
      />

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

      {questMarkers
        .filter(
          (m): m is QuestMarker & { worldPosition: NonNullable<QuestMarker["worldPosition"]> } =>
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

          const showLabel = marker.distance !== null && marker.distance < LOCATION_LABEL_DISTANCE;

          return (
            <MarkerDiamond
              key={`${marker.questId}-${marker.objectiveId}`}
              xFraction={x}
              compassWidth={compassWidth}
              label={showLabel ? marker.label : undefined}
            />
          );
        })}

      {enemyBearings.map((bearing, i) => {
        const x = bearingToCompassX(bearing, playerBearing);
        if (x === null) return null;
        return <EnemyDot key={`enemy-${i}`} xFraction={x} compassWidth={compassWidth} />;
      })}
    </View>
  );
}
