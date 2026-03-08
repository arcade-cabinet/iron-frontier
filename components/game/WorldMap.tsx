/**
 * WorldMap - Full-screen modal displaying the Frontier Territory map
 *
 * Renders a View-based map with:
 * - Region backgrounds colored by biome
 * - Connection lines between locations (styled by travel method)
 * - Tappable town markers with current-location pulsing indicator
 * - Fog of war: undiscovered locations shown as "?" markers
 * - Town info popup on tap (name, distance, danger, faction)
 * - Panning/zooming via ScrollView
 * - Legend showing route types and danger levels
 *
 * Ported from legacy/angular-ui/world-map.component.ts
 */

import * as React from "react";
import { Modal, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import type { Connection, LocationRef, Region, World } from "@/src/game/data/schemas/world";
import { FrontierTerritory } from "@/src/game/data/worlds/frontier_territory";

// =============================================================================
// CONSTANTS
// =============================================================================

/** Logical coordinate space for the map canvas */
const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;
const PADDING = 40;

/**
 * Compute responsive render dimensions based on screen size.
 * Fills ~90% of the narrower axis while maintaining the map aspect ratio.
 */
function computeRenderSize(screenWidth: number, screenHeight: number) {
  // Available space is 90% of screen, minus some chrome (header ~100px)
  const availableWidth = screenWidth * 0.9;
  const availableHeight = (screenHeight - 140) * 0.9;
  const aspect = MAP_WIDTH / MAP_HEIGHT;

  let renderWidth: number;
  if (availableWidth / aspect <= availableHeight) {
    renderWidth = availableWidth;
  } else {
    renderWidth = availableHeight * aspect;
  }

  // Clamp so the map is never ridiculously large on desktop
  renderWidth = Math.min(renderWidth, 900);
  // Minimum so it stays usable on iPhone SE
  renderWidth = Math.max(renderWidth, 300);

  return {
    renderWidth,
    renderHeight: renderWidth / aspect,
  };
}

/** Fallback render dimensions for module-level coordinate helpers */
let _renderWidth = 380;
let _renderHeight = (380 / MAP_WIDTH) * MAP_HEIGHT;

const BIOME_COLORS: Record<string, string> = {
  desert: "#d4a574",
  badlands: "#b87333",
  grassland: "#8fbc8f",
  scrubland: "#c2b280",
  mountain: "#708090",
  riverside: "#5f9ea0",
  salt_flat: "#e8e4c9",
};

const DANGER_COLORS: Record<string, string> = {
  safe: "#22c55e",
  low: "#84cc16",
  moderate: "#eab308",
  high: "#f97316",
  extreme: "#ef4444",
};

// =============================================================================
// TYPES
// =============================================================================

type WorldMapProps = {
  isOpen: boolean;
  onClose: () => void;
  onTravelTo?: (locationId: string) => void;
};

type TooltipData = {
  location: LocationRef;
  travelInfo?: {
    travelTime: number;
    danger: string;
    method: string;
  } | null;
};

// =============================================================================
// COORDINATE HELPERS
// =============================================================================

const world: World = FrontierTerritory;

function scaleX(wx: number): number {
  return PADDING + (wx / world.dimensions.width) * (MAP_WIDTH - 2 * PADDING);
}

function scaleY(wy: number): number {
  return PADDING + (wy / world.dimensions.height) * (MAP_HEIGHT - 2 * PADDING);
}

/** Convert logical map coords to render coords */
function toRenderX(wx: number): number {
  return (scaleX(wx) / MAP_WIDTH) * _renderWidth;
}

function toRenderY(wy: number): number {
  return (scaleY(wy) / MAP_HEIGHT) * _renderHeight;
}

function getLocationById(id: string): LocationRef | undefined {
  return world.locations.find((loc) => loc.id === id);
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/** Pulsing ring for current location */
function PulseRing({ size }: { size: number }) {
  const opacity = useSharedValue(0.6);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size + 12,
          height: size + 12,
          borderRadius: (size + 12) / 2,
          borderWidth: 2,
          borderColor: "#dc2626",
          left: -(size + 12) / 2,
          top: -(size + 12) / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

/** Connection line between two locations */
function ConnectionLine({ conn, discoveredIds }: { conn: Connection; discoveredIds: Set<string> }) {
  const fromLoc = getLocationById(conn.from);
  const toLoc = getLocationById(conn.to);
  if (!fromLoc || !toLoc) return null;

  const fromDiscovered = discoveredIds.has(conn.from);
  const toDiscovered = discoveredIds.has(conn.to);
  if (!fromDiscovered && !toDiscovered) return null;

  const x1 = toRenderX(fromLoc.coord.wx);
  const y1 = toRenderY(fromLoc.coord.wy);
  const x2 = toRenderX(toLoc.coord.wx);
  const y2 = toRenderY(toLoc.coord.wy);

  // Calculate line properties
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  let color = "#4a3728";
  let height = 2;

  switch (conn.method) {
    case "road":
      color = "#4a3728";
      height = 3;
      break;
    case "trail":
      color = "#6b5344";
      height = 2;
      break;
    case "railroad":
      color = "#374151";
      height = 3;
      break;
    case "wilderness":
      color = "#8b7355";
      height = 1;
      break;
    case "river":
      color = "#3b82f6";
      height = 2;
      break;
  }

  const opacity = fromDiscovered && toDiscovered ? 0.8 : 0.25;

  // For trails and wilderness, use dashed appearance via segments
  const isDashed = conn.method === "trail" || conn.method === "wilderness";

  if (isDashed) {
    const segmentLength = conn.method === "wilderness" ? 4 : 6;
    const gapLength = conn.method === "wilderness" ? 6 : 4;
    const segments: React.ReactNode[] = [];
    let offset = 0;
    let i = 0;

    while (offset < length) {
      const segLen = Math.min(segmentLength, length - offset);
      const segX = x1 + (offset / length) * dx;
      const segY = y1 + (offset / length) * dy;

      segments.push(
        <View
          key={`seg-${i}`}
          style={{
            position: "absolute",
            left: segX,
            top: segY - height / 2,
            width: segLen,
            height,
            backgroundColor: color,
            opacity,
            transform: [{ translateX: 0 }, { translateY: 0 }, { rotate: `${angle}deg` }],
            transformOrigin: "left center",
          }}
        />,
      );

      offset += segmentLength + gapLength;
      i++;
    }

    return <>{segments}</>;
  }

  // Railroad: show crossties
  if (conn.method === "railroad") {
    const ties: React.ReactNode[] = [];
    const tieSpacing = 8;
    const tieLength = 6;
    const perpAngle = angle + 90;

    for (let d = tieSpacing; d < length - tieSpacing; d += tieSpacing) {
      const tx = x1 + (d / length) * dx;
      const ty = y1 + (d / length) * dy;
      ties.push(
        <View
          key={`tie-${d}`}
          style={{
            position: "absolute",
            left: tx - tieLength / 2,
            top: ty - 1,
            width: tieLength,
            height: 2,
            backgroundColor: "#1f2937",
            opacity: opacity * 0.6,
            transform: [{ rotate: `${perpAngle}deg` }],
          }}
        />,
      );
    }

    return (
      <>
        <View
          style={{
            position: "absolute",
            left: x1,
            top: y1 - height / 2,
            width: length,
            height,
            backgroundColor: color,
            opacity,
            transform: [{ rotate: `${angle}deg` }],
            transformOrigin: "left center",
          }}
        />
        {ties}
      </>
    );
  }

  // Solid line (road, river)
  return (
    <View
      style={{
        position: "absolute",
        left: x1,
        top: y1 - height / 2,
        width: length,
        height,
        backgroundColor: color,
        opacity,
        transform: [{ rotate: `${angle}deg` }],
        transformOrigin: "left center",
      }}
    />
  );
}

/** Region background rectangle */
function RegionRect({ region, isDiscovered }: { region: Region; isDiscovered: boolean }) {
  const x = toRenderX(region.bounds.minX);
  const y = toRenderY(region.bounds.minY);
  const x2 = toRenderX(region.bounds.maxX + 1);
  const y2 = toRenderY(region.bounds.maxY + 1);
  const w = x2 - x;
  const h = y2 - y;

  const biomeColor = BIOME_COLORS[region.biome] ?? "#c2b280";

  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        backgroundColor: biomeColor,
        opacity: isDiscovered ? 0.35 : 0.12,
        borderRadius: 4,
        borderWidth: isDiscovered ? 2 : 1,
        borderColor: biomeColor,
      }}
    />
  );
}

/** Region name label (shown only when discovered) */
function RegionLabel({ region }: { region: Region }) {
  const x = toRenderX(region.bounds.minX);
  const x2 = toRenderX(region.bounds.maxX + 1);
  const y = toRenderY(region.bounds.minY);
  const centerX = x + (x2 - x) / 2;

  return (
    <Text
      style={{
        position: "absolute",
        left: centerX - 60,
        top: y + 4,
        width: 120,
        textAlign: "center",
        fontSize: 9,
        fontStyle: "italic",
        color: "#4a3728",
        opacity: 0.6,
      }}
      numberOfLines={1}
    >
      {region.name}
    </Text>
  );
}

/** Location marker dot */
function LocationMarker({
  location,
  isCurrent,
  isDiscovered,
  isConnected,
  onPress,
}: {
  location: LocationRef;
  isCurrent: boolean;
  isDiscovered: boolean;
  isConnected: boolean;
  onPress: () => void;
}) {
  const x = toRenderX(location.coord.wx);
  const y = toRenderY(location.coord.wy);
  const size = isCurrent ? 18 : 14;

  let markerColor = "#4a3728";
  if (isCurrent) markerColor = "#dc2626";
  else if (isConnected && isDiscovered) markerColor = "#059669";
  else if (!isDiscovered) markerColor = "#9ca3af";

  return (
    <Pressable
      style={{
        position: "absolute",
        left: x - 22,
        top: y - 22,
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        zIndex: isCurrent ? 20 : 10,
      }}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isDiscovered ? `${location.name}, ${location.type}` : "Unknown location"}
    >
      {/* Current location pulse ring */}
      {isCurrent && <PulseRing size={size} />}

      {/* Connected location dashed ring */}
      {isConnected && !isCurrent && isDiscovered && (
        <View
          style={{
            position: "absolute",
            width: size + 6,
            height: size + 6,
            borderRadius: (size + 6) / 2,
            borderWidth: 1.5,
            borderColor: "#059669",
            borderStyle: "dashed",
            opacity: 0.5,
          }}
        />
      )}

      {/* Marker circle */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#f5f0e6",
          borderWidth: isCurrent ? 3 : 2,
          borderColor: markerColor,
          opacity: isDiscovered ? 1 : 0.5,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Location type icon (simple shapes) */}
        {isDiscovered ? (
          <LocationIcon type={location.type} color={markerColor} size={size - 6} />
        ) : (
          <Text
            style={{
              fontSize: 8,
              color: "#9ca3af",
              fontWeight: "bold",
            }}
          >
            ?
          </Text>
        )}
      </View>

      {/* Location name label */}
      <Text
        style={{
          position: "absolute",
          top: size / 2 + 14,
          width: 80,
          textAlign: "center",
          fontSize: 8,
          color: "#4a3728",
          fontWeight: isCurrent ? "bold" : "normal",
        }}
        numberOfLines={1}
      >
        {isDiscovered ? location.name : "???"}
      </Text>
    </Pressable>
  );
}

/** Simple location-type icon using View-based shapes */
function LocationIcon({ type, color, size }: { type: string; color: string; size: number }) {
  const s = Math.max(size, 4);

  switch (type) {
    case "town":
    case "city":
    case "village":
      // Building shape: small rectangle
      return (
        <View
          style={{
            width: s,
            height: s * 0.7,
            backgroundColor: color,
            borderRadius: 1,
          }}
        />
      );
    case "mine":
    case "quarry":
      // Pickaxe hint: diagonal line
      return (
        <View
          style={{
            width: s,
            height: 2,
            backgroundColor: color,
            transform: [{ rotate: "-45deg" }],
          }}
        />
      );
    case "ranch":
    case "farm":
      // Barn: wider rectangle
      return (
        <View
          style={{
            width: s,
            height: s * 0.6,
            backgroundColor: color,
            borderRadius: 1,
          }}
        />
      );
    case "train_station":
      // Train: rectangle with dots
      return (
        <View
          style={{
            width: s,
            height: s * 0.5,
            backgroundColor: color,
            borderRadius: 2,
          }}
        />
      );
    case "waystation":
    case "outpost":
      // Triangle hint: small diamond
      return (
        <View
          style={{
            width: s * 0.7,
            height: s * 0.7,
            backgroundColor: color,
            transform: [{ rotate: "45deg" }],
          }}
        />
      );
    case "hideout":
      // Skull hint: circle
      return (
        <View
          style={{
            width: s * 0.8,
            height: s * 0.8,
            backgroundColor: color,
            borderRadius: s * 0.4,
          }}
        />
      );
    case "ruins":
      // Broken columns: two small rects
      return (
        <View style={{ flexDirection: "row", gap: 1 }}>
          <View
            style={{
              width: s * 0.3,
              height: s * 0.8,
              backgroundColor: color,
            }}
          />
          <View
            style={{
              width: s * 0.3,
              height: s * 0.5,
              backgroundColor: color,
            }}
          />
        </View>
      );
    case "landmark":
    case "wilderness":
      // Triangle
      return (
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: s * 0.4,
            borderRightWidth: s * 0.4,
            borderBottomWidth: s * 0.7,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: color,
          }}
        />
      );
    case "camp":
      // Tent: triangle
      return (
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: s * 0.4,
            borderRightWidth: s * 0.4,
            borderBottomWidth: s * 0.6,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: color,
          }}
        />
      );
    default:
      return (
        <View
          style={{
            width: s * 0.6,
            height: s * 0.6,
            backgroundColor: color,
            borderRadius: s * 0.3,
          }}
        />
      );
  }
}

/** Tooltip showing location info */
function LocationTooltip({
  data,
  currentLocationId,
  onDismiss,
}: {
  data: TooltipData;
  currentLocationId: string;
  onDismiss: () => void;
}) {
  const { location, travelInfo } = data;
  const isHere = location.id === currentLocationId;

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(100)}
      className="absolute bottom-4 left-4 right-4 z-50"
    >
      <Pressable onPress={onDismiss}>
        <View className="rounded-lg border border-amber-700 bg-amber-950 p-3 shadow-xl">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-amber-100">{location.name}</Text>
            <Text className="text-xs capitalize text-amber-400">{location.type}</Text>
          </View>

          {/* Tags */}
          {location.tags && location.tags.length > 0 && (
            <View className="mt-1.5 flex-row flex-wrap gap-1">
              {location.tags.slice(0, 4).map((tag) => (
                <View key={tag} className="rounded bg-amber-800/50 px-1.5 py-0.5">
                  <Text className="text-[10px] text-amber-300">{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Travel info */}
          {travelInfo && (
            <View className="mt-2 border-t border-amber-700/50 pt-2">
              <Text className="text-xs text-amber-300">
                <Text className="capitalize">{travelInfo.method}</Text>
                {" - "}
                {travelInfo.travelTime}h travel time
              </Text>
              <View className="mt-1 flex-row items-center gap-1">
                <Text className="text-xs text-amber-400">Danger:</Text>
                <Text
                  className="text-xs font-medium capitalize"
                  style={{ color: DANGER_COLORS[travelInfo.danger] ?? "#eab308" }}
                >
                  {travelInfo.danger}
                </Text>
              </View>
            </View>
          )}

          {isHere && <Text className="mt-2 text-xs italic text-amber-500">You are here</Text>}
        </View>
      </Pressable>
    </Animated.View>
  );
}

/** Legend showing map symbols */
function MapLegend() {
  return (
    <View className="mx-3 mt-2 flex-row flex-wrap gap-x-4 gap-y-1.5 rounded-lg bg-amber-900/30 p-2">
      {/* Route types */}
      <View className="flex-row items-center gap-1">
        <View className="h-[3px] w-4 bg-amber-800" />
        <Text className="text-[10px] text-amber-300">Road</Text>
      </View>
      <View className="flex-row items-center gap-1">
        <View className="h-[2px] w-4 border-t-2 border-dashed border-amber-700" />
        <Text className="text-[10px] text-amber-300">Trail</Text>
      </View>
      <View className="flex-row items-center gap-1">
        <View className="h-[3px] w-4 bg-gray-600" />
        <Text className="text-[10px] text-amber-300">Rail</Text>
      </View>

      {/* Location types */}
      <View className="flex-row items-center gap-1">
        <View className="h-3 w-3 rounded-full border-2 border-amber-200 bg-red-600" />
        <Text className="text-[10px] text-amber-300">Current</Text>
      </View>
      <View className="flex-row items-center gap-1">
        <View className="h-3 w-3 rounded-full border border-dashed border-emerald-400 bg-emerald-600" />
        <Text className="text-[10px] text-amber-300">Reachable</Text>
      </View>
    </View>
  );
}

/** Compass rose indicator */
function CompassRose() {
  return (
    <View
      style={{
        position: "absolute",
        right: 10,
        top: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(74, 55, 40, 0.15)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: 10,
          color: "#4a3728",
          fontWeight: "bold",
          position: "absolute",
          top: 2,
        }}
      >
        N
      </Text>
      {/* Vertical line */}
      <View
        style={{
          width: 1,
          height: 20,
          backgroundColor: "#4a3728",
          opacity: 0.5,
        }}
      />
      {/* Horizontal line */}
      <View
        style={{
          position: "absolute",
          width: 20,
          height: 1,
          backgroundColor: "#4a3728",
          opacity: 0.5,
        }}
      />
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function WorldMap({ isOpen, onClose, onTravelTo }: WorldMapProps) {
  const [tooltip, setTooltip] = React.useState<TooltipData | null>(null);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Compute responsive render size and update module-level variables so
  // sub-components (ConnectionLine, RegionRect, LocationMarker) pick it up.
  const { renderWidth, renderHeight } = React.useMemo(() => {
    const dims = computeRenderSize(screenWidth, screenHeight);
    _renderWidth = dims.renderWidth;
    _renderHeight = dims.renderHeight;
    return dims;
  }, [screenWidth, screenHeight]);

  // Read store state
  const { currentLocationId, discoveredLocationIds, travelTo, addNotification } =
    useGameStoreShallow((s) => ({
      currentLocationId: s.currentLocationId ?? "dusty_springs",
      discoveredLocationIds: s.discoveredLocationIds,
      travelTo: s.travelTo,
      addNotification: s.addNotification,
    }));

  // Derived state
  const discoveredIds = React.useMemo(() => {
    const ids = new Set(discoveredLocationIds);
    // Fallback: include locations marked as discovered in world data
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

  // Handlers
  const handleLocationPress = React.useCallback(
    (location: LocationRef) => {
      if (location.id === currentLocationId) {
        setTooltip({
          location,
          travelInfo: null,
        });
        return;
      }

      if (!discoveredIds.has(location.id)) {
        // Show tooltip for undiscovered location
        setTooltip({
          location: { ...location, name: "Unknown Location" },
          travelInfo: null,
        });
        addNotification("warning", "This location has not been discovered");
        return;
      }

      // Find connection to this location
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
        {/* Backdrop press to close */}
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close map"
        />

        {/* Map panel */}
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

          {/* Legend */}
          <MapLegend />

          {/* Scrollable map area */}
          <ScrollView
            className="flex-1"
            contentContainerClassName="pb-4 px-3 pt-2"
            showsVerticalScrollIndicator={false}
            bounces
            maximumZoomScale={3}
            minimumZoomScale={1}
          >
            {/* Map canvas */}
            <View
              className="rounded-lg border-2 border-amber-800 overflow-hidden"
              style={{
                width: renderWidth,
                height: renderHeight,
                backgroundColor: "#f5f0e6",
                alignSelf: "center",
              }}
            >
              {/* Title */}
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

              {/* Compass */}
              <CompassRose />

              {/* Region backgrounds */}
              {world.regions.map((region) => (
                <React.Fragment key={region.id}>
                  <RegionRect region={region} isDiscovered={discoveredRegionIds.has(region.id)} />
                  {discoveredRegionIds.has(region.id) && <RegionLabel region={region} />}
                </React.Fragment>
              ))}

              {/* Connections */}
              {world.connections.map((conn) => (
                <ConnectionLine
                  key={`conn-${conn.from}-${conn.to}`}
                  conn={conn}
                  discoveredIds={discoveredIds}
                />
              ))}

              {/* Location markers */}
              {world.locations.map((loc) => {
                const discovered = discoveredIds.has(loc.id);
                const isCurrent = loc.id === currentLocationId;

                // Show if discovered, current, or connected to current
                if (!discovered && !isCurrent && !connectedLocationIds.has(loc.id)) {
                  return null;
                }

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

            {/* Current location info bar */}
            <View className="mt-3 rounded-lg border border-amber-700/50 bg-amber-900/40 p-3">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-[10px] uppercase tracking-wider text-amber-400">
                    Current Location
                  </Text>
                  <Text className="text-sm font-medium text-amber-100">
                    {currentLoc?.name ?? "Unknown"}
                  </Text>
                </View>
                <View className="rounded bg-amber-600 px-2 py-0.5">
                  <Text className="text-[10px] capitalize text-amber-100">
                    {currentLoc?.type ?? "unknown"}
                  </Text>
                </View>
              </View>

              {/* Travel options */}
              {currentConnections.length > 0 && (
                <View className="mt-3">
                  <Text className="mb-1.5 text-[10px] uppercase tracking-wider text-amber-400">
                    Travel Options ({currentConnections.length})
                  </Text>
                  <View className="gap-1.5">
                    {currentConnections.slice(0, 6).map((conn) => {
                      const targetId = conn.to === currentLocationId ? conn.from : conn.to;
                      const target = getLocationById(targetId);
                      if (!target) return null;
                      const isTargetDiscovered = discoveredIds.has(targetId);

                      return (
                        <Pressable
                          key={`travel-${targetId}`}
                          className="min-h-[44px] flex-row items-center justify-between rounded border border-amber-700/50 bg-amber-800/30 px-3 py-2"
                          onPress={() => {
                            if (isTargetDiscovered) {
                              handleTravel(targetId);
                            } else {
                              addNotification("warning", "This location has not been discovered");
                            }
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`Travel to ${isTargetDiscovered ? target.name : "unknown location"}`}
                        >
                          <View className="flex-1">
                            <Text className="text-xs font-medium text-amber-200">
                              {isTargetDiscovered ? target.name : "???"}
                            </Text>
                            <Text className="text-[10px] text-amber-400">
                              {conn.travelTime}h via {conn.method}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-1.5">
                            <View
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: DANGER_COLORS[conn.danger] ?? "#eab308",
                              }}
                            />
                            <Text
                              className="text-[10px] capitalize"
                              style={{
                                color: DANGER_COLORS[conn.danger] ?? "#eab308",
                              }}
                            >
                              {conn.danger}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Tooltip overlay */}
          {tooltip && (
            <LocationTooltip
              data={tooltip}
              currentLocationId={currentLocationId}
              onDismiss={() => setTooltip(null)}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

export default WorldMap;
