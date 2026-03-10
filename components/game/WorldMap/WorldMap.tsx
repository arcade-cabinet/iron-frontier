/**
 * WorldMap - Full-screen modal displaying the Frontier Territory map
 *
 * Renders a View-based map with region backgrounds, connection lines,
 * tappable town markers, fog of war, and a travel tooltip.
 */

import * as React from "react";
import { Modal, Pressable, ScrollView, useWindowDimensions, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import type { LocationRef } from "@/src/game/data/schemas/world";

import { ConnectionLine } from "./ConnectionLine.tsx";
import { CurrentLocationBar } from "./CurrentLocationBar.tsx";
import { LocationMarker } from "./LocationMarker.tsx";
import { CompassRose, LocationTooltip, MapLegend, RegionLabel, RegionRect } from "./MapOverlay.tsx";
import {
  computeRenderSize,
  getLocationById,
  setRenderDimensions,
  type TooltipData,
  type WorldMapProps,
  world,
} from "./types.ts";

export function WorldMap({ isOpen, onClose, onTravelTo }: WorldMapProps) {
  const [tooltip, setTooltip] = React.useState<TooltipData | null>(null);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const { renderWidth, renderHeight } = React.useMemo(() => {
    const dims = computeRenderSize(screenWidth, screenHeight);
    setRenderDimensions(dims.renderWidth, dims.renderHeight);
    return dims;
  }, [screenWidth, screenHeight]);

  const { currentLocationId, discoveredLocationIds, travelTo, addNotification } =
    useGameStoreShallow((s) => ({
      currentLocationId: s.currentLocationId ?? "dusty_springs",
      discoveredLocationIds: s.discoveredLocationIds,
      travelTo: s.travelTo,
      addNotification: s.addNotification,
    }));

  const discoveredIds = React.useMemo(() => {
    const ids = new Set(discoveredLocationIds);
    if (ids.size === 0) {
      for (const loc of world.locations) {
        if (loc.discovered) ids.add(loc.id);
      }
    }
    return ids;
  }, [discoveredLocationIds]);

  const discoveredRegionIds = React.useMemo(() => {
    const regionIds = new Set<string>();
    for (const locId of discoveredIds) {
      const loc = getLocationById(locId);
      if (!loc) continue;
      const region = world.regions.find(
        (r) =>
          loc.coord.wx >= r.bounds.minX &&
          loc.coord.wx <= r.bounds.maxX &&
          loc.coord.wy >= r.bounds.minY &&
          loc.coord.wy <= r.bounds.maxY,
      );
      if (region) regionIds.add(region.id);
    }
    return regionIds;
  }, [discoveredIds]);

  const currentConnections = React.useMemo(
    () =>
      world.connections.filter(
        (c) => c.from === currentLocationId || (c.bidirectional && c.to === currentLocationId),
      ),
    [currentLocationId],
  );

  const connectedLocationIds = React.useMemo(() => {
    const ids = new Set<string>();
    for (const conn of currentConnections) {
      const targetId = conn.to === currentLocationId ? conn.from : conn.to;
      ids.add(targetId);
    }
    return ids;
  }, [currentConnections, currentLocationId]);

  const handleLocationPress = React.useCallback(
    (location: LocationRef) => {
      if (location.id === currentLocationId) {
        setTooltip({ location, travelInfo: null });
        return;
      }

      if (!discoveredIds.has(location.id)) {
        setTooltip({ location: { ...location, name: "Unknown Location" }, travelInfo: null });
        addNotification("warning", "This location has not been discovered");
        return;
      }

      const connection = world.connections.find(
        (c) =>
          (c.from === currentLocationId && c.to === location.id) ||
          (c.bidirectional && c.from === location.id && c.to === currentLocationId),
      );

      setTooltip({
        location,
        travelInfo: connection
          ? {
              travelTime: connection.travelTime,
              danger: connection.danger,
              method: connection.method,
            }
          : null,
      });
    },
    [currentLocationId, discoveredIds, addNotification],
  );

  const handleTravel = React.useCallback(
    (locationId: string) => {
      const location = getLocationById(locationId);
      if (!location) return;

      if (!location.accessible) {
        addNotification("warning", "This location is not accessible");
        return;
      }

      const connection = world.connections.find(
        (c) =>
          (c.from === currentLocationId && c.to === locationId) ||
          (c.bidirectional && c.from === locationId && c.to === currentLocationId),
      );

      if (!connection) {
        addNotification("warning", "No path to this location from here");
        return;
      }

      if (onTravelTo) {
        onTravelTo(locationId);
      } else {
        travelTo(locationId);
      }

      setTooltip(null);
      onClose();
    },
    [currentLocationId, onTravelTo, travelTo, onClose, addNotification],
  );

  if (!isOpen) return null;

  const currentLoc = getLocationById(currentLocationId);

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/70">
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close map"
        />

        <View className="absolute inset-x-0 bottom-0 top-[5%] rounded-t-2xl border-t border-amber-700 bg-amber-950 overflow-hidden">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-amber-800/50 px-4 py-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-medium text-amber-100">{world.name}</Text>
            </View>
            <Text className="text-xs text-amber-400">
              {discoveredIds.size} / {world.locations.length} discovered
            </Text>
          </View>

          <MapLegend />

          <ScrollView
            className="flex-1"
            contentContainerClassName="pb-4 px-3 pt-2"
            showsVerticalScrollIndicator={false}
            bounces
            maximumZoomScale={3}
            minimumZoomScale={1}
          >
            <View
              className="rounded-lg border-2 border-amber-800 overflow-hidden"
              style={{
                width: renderWidth,
                height: renderHeight,
                backgroundColor: "#f5f0e6",
                alignSelf: "center",
              }}
            >
              <Text
                style={{
                  position: "absolute",
                  top: 6,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: "bold",
                  fontStyle: "italic",
                  color: "#4a3728",
                  zIndex: 1,
                }}
              >
                {world.name}
              </Text>
              <Text
                style={{
                  position: "absolute",
                  top: 22,
                  left: 10,
                  right: 10,
                  textAlign: "center",
                  fontSize: 7,
                  fontStyle: "italic",
                  color: "#6b5344",
                  zIndex: 1,
                }}
                numberOfLines={2}
              >
                {world.description}
              </Text>

              <CompassRose />

              {world.regions.map((region) => (
                <React.Fragment key={region.id}>
                  <RegionRect region={region} isDiscovered={discoveredRegionIds.has(region.id)} />
                  {discoveredRegionIds.has(region.id) ? <RegionLabel region={region} /> : null}
                </React.Fragment>
              ))}

              {world.connections.map((conn) => (
                <ConnectionLine
                  key={`conn-${conn.from}-${conn.to}`}
                  conn={conn}
                  discoveredIds={discoveredIds}
                />
              ))}

              {world.locations.map((loc) => {
                const discovered = discoveredIds.has(loc.id);
                const isCurrent = loc.id === currentLocationId;
                if (!discovered && !isCurrent && !connectedLocationIds.has(loc.id)) return null;

                return (
                  <LocationMarker
                    key={loc.id}
                    location={loc}
                    isCurrent={isCurrent}
                    isDiscovered={discovered}
                    isConnected={connectedLocationIds.has(loc.id)}
                    onPress={() => handleLocationPress(loc)}
                  />
                );
              })}
            </View>

            <CurrentLocationBar
              currentLoc={currentLoc}
              currentLocationId={currentLocationId}
              currentConnections={currentConnections}
              discoveredIds={discoveredIds}
              onTravel={handleTravel}
              onUndiscoveredTravel={() =>
                addNotification("warning", "This location has not been discovered")
              }
            />
          </ScrollView>

          {tooltip ? (
            <LocationTooltip
              data={tooltip}
              currentLocationId={currentLocationId}
              isDiscovered={discoveredIds.has(tooltip.location.id)}
              onDismiss={() => setTooltip(null)}
              onTravel={handleTravel}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
