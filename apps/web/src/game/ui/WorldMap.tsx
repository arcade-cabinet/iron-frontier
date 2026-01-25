/**
 * WorldMap - Overhead view of the Frontier Territory
 *
 * Displays an old western paper map style visualization of the world
 * with regions, locations, connections, and fog of war.
 */

import {
  type Connection,
  type DangerLevel,
  getConnectionsFrom,
  type LocationRef,
  type Region,
  type TravelMethod,
  type World,
} from '@iron-frontier/shared/data/schemas/world';
import { FrontierTerritory } from '@iron-frontier/shared/data/worlds/frontier_territory';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useGameStore } from '../store/webGameStore';

// ============================================================================
// TYPES
// ============================================================================

export interface WorldMapProps {
  isOpen: boolean;
  onClose: () => void;
  onTravelTo?: (locationId: string) => void;
}

interface TooltipState {
  x: number;
  y: number;
  location: LocationRef;
  travelInfo?: {
    travelTime: number;
    danger: DangerLevel;
    method: TravelMethod;
  } | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Map dimensions and scaling
const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;
const PADDING = 40;

// Scale world coordinates to map coordinates
const scaleX = (wx: number, world: World) =>
  PADDING + (wx / world.dimensions.width) * (MAP_WIDTH - 2 * PADDING);
const scaleY = (wy: number, world: World) =>
  PADDING + (wy / world.dimensions.height) * (MAP_HEIGHT - 2 * PADDING);

// Biome colors (muted western palette)
const BIOME_COLORS: Record<string, string> = {
  desert: '#d4a574',
  badlands: '#b87333',
  grassland: '#8fbc8f',
  scrubland: '#c2b280',
  mountain: '#708090',
  riverside: '#5f9ea0',
  salt_flat: '#e8e4c9',
};

// Biome fill patterns (for visual distinction)
const BIOME_PATTERNS: Record<string, string> = {
  desert: 'url(#pattern-desert)',
  badlands: 'url(#pattern-badlands)',
  grassland: 'url(#pattern-grassland)',
  scrubland: 'url(#pattern-scrubland)',
  mountain: 'url(#pattern-mountain)',
  riverside: 'url(#pattern-riverside)',
  salt_flat: 'url(#pattern-salt)',
};

// Danger level colors
const DANGER_COLORS: Record<DangerLevel, string> = {
  safe: '#22c55e',
  low: '#84cc16',
  moderate: '#eab308',
  high: '#f97316',
  extreme: '#ef4444',
};

// ============================================================================
// LOCATION ICONS
// ============================================================================

function getLocationIcon(type: string, size: number = 20): ReactNode {
  const half = size / 2;

  switch (type) {
    case 'town':
    case 'city':
    case 'village':
      // Building cluster icon
      return (
        <g>
          <rect
            x={-half + 2}
            y={-half + 4}
            width={size - 8}
            height={size - 6}
            fill="currentColor"
          />
          <rect x={half - 8} y={-half + 2} width={6} height={size - 4} fill="currentColor" />
          <polygon
            points={`${-half + 2},${-half + 4} ${-half + half - 2},${-half - 2} ${half - 6},${-half + 4}`}
            fill="currentColor"
          />
        </g>
      );

    case 'mine':
    case 'quarry':
      // Pickaxe icon
      return (
        <g>
          <line
            x1={-half + 2}
            y1={half - 2}
            x2={half - 2}
            y2={-half + 2}
            stroke="currentColor"
            strokeWidth="3"
          />
          <polygon
            points={`${half - 4},${-half} ${half},${-half + 4} ${half - 2},${-half + 6} ${half - 8},${-half + 2}`}
            fill="currentColor"
          />
        </g>
      );

    case 'ranch':
    case 'farm':
      // Barn icon
      return (
        <g>
          <rect
            x={-half + 2}
            y={-half + 6}
            width={size - 4}
            height={size - 8}
            fill="currentColor"
          />
          <polygon
            points={`${-half},${-half + 6} 0,${-half} ${half},${-half + 6}`}
            fill="currentColor"
          />
        </g>
      );

    case 'train_station':
      // Train icon
      return (
        <g>
          <rect
            x={-half + 2}
            y={-half + 4}
            width={size - 4}
            height={size - 8}
            rx="2"
            fill="currentColor"
          />
          <circle cx={-half + 5} cy={half - 3} r="3" fill="currentColor" />
          <circle cx={half - 5} cy={half - 3} r="3" fill="currentColor" />
          <rect x={half - 6} y={-half + 2} width="4" height="4" fill="currentColor" />
        </g>
      );

    case 'waystation':
    case 'outpost':
      // Campfire/rest icon
      return (
        <g>
          <polygon
            points={`0,${-half + 2} ${-half + 4},${half - 2} ${half - 4},${half - 2}`}
            fill="currentColor"
          />
          <line
            x1={-half + 2}
            y1={half - 4}
            x2={half - 2}
            y2={half - 4}
            stroke="currentColor"
            strokeWidth="2"
          />
        </g>
      );

    case 'hideout':
      // Skull icon
      return (
        <g>
          <circle cx="0" cy={-half + 6} r="6" fill="currentColor" />
          <rect x={-3} y={2} width="6" height="6" fill="currentColor" />
          <circle cx={-2} cy={-half + 5} r="1.5" fill="#1a1a1a" />
          <circle cx={2} cy={-half + 5} r="1.5" fill="#1a1a1a" />
        </g>
      );

    case 'ruins':
      // Broken pillar icon
      return (
        <g>
          <rect x={-half + 3} y={-half + 6} width="4" height={size - 8} fill="currentColor" />
          <rect x={half - 7} y={-half + 4} width="4" height={size - 10} fill="currentColor" />
          <polygon
            points={`${-half + 3},${-half + 6} ${-half + 5},${-half + 2} ${-half + 7},${-half + 6}`}
            fill="currentColor"
          />
        </g>
      );

    case 'landmark':
      // Rock/mountain icon
      return (
        <g>
          <polygon
            points={`0,${-half + 2} ${-half + 2},${half - 2} ${half - 2},${half - 2}`}
            fill="currentColor"
          />
        </g>
      );

    case 'wilderness':
      // Tree icon
      return (
        <g>
          <polygon
            points={`0,${-half + 2} ${-half + 4},${half - 4} ${half - 4},${half - 4}`}
            fill="currentColor"
          />
          <rect x="-2" y={half - 6} width="4" height="4" fill="currentColor" />
        </g>
      );

    default:
      // Generic dot
      return <circle cx="0" cy="0" r={half - 2} fill="currentColor" />;
  }
}

// ============================================================================
// CONNECTION RENDERER
// ============================================================================

function renderConnection(
  conn: Connection,
  world: World,
  discoveredIds: Set<string>,
  _isAccessible: boolean
): ReactNode {
  const fromLoc = world.locations.find((l) => l.id === conn.from);
  const toLoc = world.locations.find((l) => l.id === conn.to);

  if (!fromLoc || !toLoc) return null;

  // Only show connections between discovered locations
  const fromDiscovered = discoveredIds.has(fromLoc.id);
  const toDiscovered = discoveredIds.has(toLoc.id);

  if (!fromDiscovered && !toDiscovered) return null;

  const x1 = scaleX(fromLoc.coord.wx, world);
  const y1 = scaleY(fromLoc.coord.wy, world);
  const x2 = scaleX(toLoc.coord.wx, world);
  const y2 = scaleY(toLoc.coord.wy, world);

  // Line style based on travel method
  let strokeDasharray = 'none';
  let strokeWidth = 2;
  let stroke = '#4a3728';

  switch (conn.method) {
    case 'road':
      strokeDasharray = 'none';
      strokeWidth = 3;
      stroke = '#4a3728';
      break;
    case 'trail':
      strokeDasharray = '8,4';
      strokeWidth = 2;
      stroke = '#6b5344';
      break;
    case 'railroad':
      strokeDasharray = '2,4';
      strokeWidth = 4;
      stroke = '#374151';
      break;
    case 'wilderness':
      strokeDasharray = '4,8';
      strokeWidth = 1;
      stroke = '#8b7355';
      break;
    case 'river':
      strokeDasharray = 'none';
      strokeWidth = 2;
      stroke = '#3b82f6';
      break;
  }

  // Dim if one end is undiscovered
  const opacity = fromDiscovered && toDiscovered ? 1 : 0.3;

  return (
    <g key={`conn-${conn.from}-${conn.to}`}>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        opacity={opacity}
        strokeLinecap="round"
      />
      {/* Railroad ties */}
      {conn.method === 'railroad' && (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#1f2937"
          strokeWidth={8}
          strokeDasharray="2,8"
          opacity={opacity * 0.5}
          strokeLinecap="butt"
        />
      )}
    </g>
  );
}

// ============================================================================
// REGION RENDERER
// ============================================================================

function renderRegion(region: Region, world: World, discovered: boolean): ReactNode {
  const x1 = scaleX(region.bounds.minX, world);
  const y1 = scaleY(region.bounds.minY, world);
  const x2 = scaleX(region.bounds.maxX + 1, world);
  const y2 = scaleY(region.bounds.maxY + 1, world);

  const width = x2 - x1;
  const height = y2 - y1;

  const baseColor = BIOME_COLORS[region.biome] || '#c2b280';
  const opacity = discovered ? 0.4 : 0.15;

  return (
    <g key={region.id}>
      <rect
        x={x1}
        y={y1}
        width={width}
        height={height}
        fill={baseColor}
        opacity={opacity}
        stroke={baseColor}
        strokeWidth={discovered ? 2 : 1}
        strokeOpacity={discovered ? 0.6 : 0.2}
        rx="4"
      />
      {/* Region name label */}
      {discovered && (
        <text
          x={x1 + width / 2}
          y={y1 + 16}
          textAnchor="middle"
          fill="#4a3728"
          fontSize="11"
          fontFamily="serif"
          fontStyle="italic"
          opacity="0.7"
        >
          {region.name}
        </text>
      )}
    </g>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function WorldMap({ isOpen, onClose, onTravelTo }: WorldMapProps) {
  const {
    addNotification,
    settings,
    currentLocationId: storeLocationId,
    discoveredLocationIds: storeDiscoveredIds,
    travelTo,
  } = useGameStore();

  // Use store values with fallbacks for when world not yet initialized
  const currentLocationId = storeLocationId ?? 'loc_dusty_springs';
  const discoveredLocationIds =
    storeDiscoveredIds.length > 0
      ? storeDiscoveredIds
      : FrontierTerritory.locations.filter((l) => l.discovered).map((l) => l.id);

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  // Memoize the world data
  const world = useMemo(() => FrontierTerritory, []);

  // Create a set for faster lookups
  const discoveredIds = useMemo(() => new Set(discoveredLocationIds), [discoveredLocationIds]);

  // Get discovered regions
  const discoveredRegions = useMemo(() => {
    const regionIds = new Set<string>();
    for (const locId of discoveredLocationIds) {
      const loc = world.locations.find((l) => l.id === locId);
      if (loc) {
        const region = world.regions.find(
          (r) =>
            loc.coord.wx >= r.bounds.minX &&
            loc.coord.wx <= r.bounds.maxX &&
            loc.coord.wy >= r.bounds.minY &&
            loc.coord.wy <= r.bounds.maxY
        );
        if (region) regionIds.add(region.id);
      }
    }
    return regionIds;
  }, [world, discoveredLocationIds]);

  // Get connections from current location
  const currentConnections = useMemo(() => {
    return getConnectionsFrom(world, currentLocationId);
  }, [world, currentLocationId]);

  // Check if a location is connected to current
  const getConnectionTo = useCallback(
    (targetId: string): Connection | null => {
      return (
        world.connections.find(
          (c) =>
            (c.from === currentLocationId && c.to === targetId) ||
            (c.bidirectional && c.from === targetId && c.to === currentLocationId)
        ) ?? null
      );
    },
    [world, currentLocationId]
  );

  // Handle location click
  const handleLocationClick = useCallback(
    (location: LocationRef) => {
      if (settings.haptics && navigator.vibrate) {
        navigator.vibrate(30);
      }

      if (location.id === currentLocationId) {
        addNotification('info', 'You are already here');
        return;
      }

      if (!discoveredIds.has(location.id)) {
        addNotification('warning', 'This location has not been discovered');
        return;
      }

      const connection = getConnectionTo(location.id);
      if (!connection) {
        addNotification('warning', 'No path to this location from here');
        return;
      }

      if (!location.accessible) {
        addNotification('warning', 'This location is not accessible');
        return;
      }

      // Use store's travelTo if available, otherwise call onTravelTo prop
      if (travelTo) {
        travelTo(location.id);
      }
      onTravelTo?.(location.id);
      onClose();
    },
    [
      currentLocationId,
      discoveredIds,
      getConnectionTo,
      travelTo,
      onTravelTo,
      onClose,
      addNotification,
      settings.haptics,
    ]
  );

  // Handle location hover
  const handleLocationHover = useCallback(
    (location: LocationRef, event: React.MouseEvent) => {
      const connection = getConnectionTo(location.id);
      setTooltip({
        x: event.clientX,
        y: event.clientY,
        location,
        travelInfo: connection
          ? {
              travelTime: connection.travelTime,
              danger: connection.danger,
              method: connection.method,
            }
          : null,
      });
      setHoveredLocation(location.id);
    },
    [getConnectionTo]
  );

  const handleLocationLeave = useCallback(() => {
    setTooltip(null);
    setHoveredLocation(null);
  }, []);

  // Render location marker
  const renderLocation = useCallback(
    (location: LocationRef): ReactNode => {
      const isDiscovered = discoveredIds.has(location.id);
      const isCurrent = location.id === currentLocationId;
      const isConnected = getConnectionTo(location.id) !== null;
      const isHovered = hoveredLocation === location.id;

      const x = scaleX(location.coord.wx, world);
      const y = scaleY(location.coord.wy, world);

      // Don't render undiscovered locations at all (true fog of war)
      if (!isDiscovered && !isCurrent) {
        return null;
      }

      // Determine marker color
      let markerColor = '#4a3728'; // default brown
      if (isCurrent) {
        markerColor = '#dc2626'; // red for current
      } else if (isConnected && isDiscovered) {
        markerColor = '#059669'; // green for accessible
      } else if (!isDiscovered) {
        markerColor = '#9ca3af'; // gray for undiscovered
      }

      const iconSize = isCurrent ? 24 : isHovered ? 22 : 18;

      return (
        <g
          key={location.id}
          transform={`translate(${x}, ${y})`}
          style={{ cursor: isDiscovered ? 'pointer' : 'default' }}
          onClick={() => isDiscovered && handleLocationClick(location)}
          onMouseEnter={(e) => handleLocationHover(location, e)}
          onMouseLeave={handleLocationLeave}
        >
          {/* Glow effect for current location */}
          {isCurrent && (
            <circle
              r={iconSize + 4}
              fill="none"
              stroke="#dc2626"
              strokeWidth="2"
              opacity="0.5"
              className="animate-pulse"
            />
          )}

          {/* Connection indicator ring */}
          {isConnected && !isCurrent && isDiscovered && (
            <circle
              r={iconSize + 2}
              fill="none"
              stroke="#059669"
              strokeWidth="1.5"
              strokeDasharray="4,2"
              opacity="0.6"
            />
          )}

          {/* Background circle */}
          <circle
            r={iconSize - 2}
            fill="#f5f0e6"
            stroke={markerColor}
            strokeWidth={isCurrent ? 3 : 2}
            opacity={isDiscovered ? 1 : 0.5}
          />

          {/* Location icon */}
          <g
            fill={markerColor}
            transform={`scale(${iconSize / 20})`}
            opacity={isDiscovered ? 1 : 0.5}
          >
            {getLocationIcon(location.type, 16)}
          </g>

          {/* Location name label */}
          {isDiscovered && (
            <text
              y={iconSize + 12}
              textAnchor="middle"
              fill="#4a3728"
              fontSize="10"
              fontFamily="serif"
              fontWeight={isCurrent ? 'bold' : 'normal'}
            >
              {location.name}
            </text>
          )}

          {/* Procedural indicator (small star) - shown if no locationDataId */}
          {!location.locationDataId && isDiscovered && (
            <text
              x={iconSize - 4}
              y={-iconSize + 4}
              fill="#7c3aed"
              fontSize="8"
              fontFamily="sans-serif"
            >
              ✦
            </text>
          )}
        </g>
      );
    },
    [
      world,
      discoveredIds,
      currentLocationId,
      hoveredLocation,
      handleLocationClick,
      handleLocationHover,
      handleLocationLeave,
      getConnectionTo,
    ]
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="h-[95vh] sm:h-[90vh] md:h-[85vh] bg-amber-950 border-amber-700"
      >
        <SheetHeader className="pb-1.5 sm:pb-2">
          <SheetTitle className="text-amber-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-sm sm:text-base">
            <span className="flex items-center gap-1.5 sm:gap-2">
              <MapIcon />
              {world.name}
            </span>
            <span className="text-amber-400 text-xs sm:text-sm font-normal">
              {discoveredLocationIds.length} / {world.locations.length} discovered
            </span>
          </SheetTitle>
        </SheetHeader>

        {/* Map Legend */}
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:gap-4 mb-2 sm:mb-3 p-1.5 sm:p-2 bg-amber-900/30 rounded-lg text-[10px] sm:text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 sm:w-4 h-0.5 bg-amber-800" />
            <span className="text-amber-300">Road</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 sm:w-4 h-0.5 border-t-2 border-dashed border-amber-700" />
            <span className="text-amber-300">Trail</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-3 sm:w-4 h-1 bg-gray-600"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, #4b5563 0px, #4b5563 2px, transparent 2px, transparent 6px)',
              }}
            />
            <span className="text-amber-300">Rail</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-red-600 border-2 border-amber-200" />
            <span className="text-amber-300">Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-emerald-600 border border-dashed border-emerald-400" />
            <span className="text-amber-300">Reachable</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-violet-400 text-xs sm:text-sm">✦</span>
            <span className="text-amber-300">Generated</span>
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-100px)] sm:h-[calc(100%-120px)]">
          {/* SVG Map */}
          <div className="relative bg-[#f5f0e6] rounded-lg border-2 sm:border-4 border-amber-800 shadow-lg overflow-hidden">
            {/* Paper texture overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />

            <svg
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
              className="w-full h-auto"
              style={{ minHeight: '280px' }}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Definitions */}
              <defs>
                {/* Compass rose gradient */}
                <linearGradient id="compassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b7355" />
                  <stop offset="100%" stopColor="#4a3728" />
                </linearGradient>
              </defs>

              {/* Regions (background) */}
              <g className="regions">
                {world.regions.map((region) =>
                  renderRegion(region, world, discoveredRegions.has(region.id))
                )}
              </g>

              {/* Connections */}
              <g className="connections">
                {world.connections.map((conn) =>
                  renderConnection(conn, world, discoveredIds, true)
                )}
              </g>

              {/* Locations */}
              <g className="locations">{world.locations.map((loc) => renderLocation(loc))}</g>

              {/* Compass Rose */}
              <g transform={`translate(${MAP_WIDTH - 60}, 60)`}>
                <circle r="30" fill="url(#compassGradient)" opacity="0.2" />
                <line x1="0" y1="-25" x2="0" y2="25" stroke="#4a3728" strokeWidth="1" />
                <line x1="-25" y1="0" x2="25" y2="0" stroke="#4a3728" strokeWidth="1" />
                <polygon points="0,-28 -4,-20 4,-20" fill="#4a3728" />
                <text y="-32" textAnchor="middle" fill="#4a3728" fontSize="10" fontFamily="serif">
                  N
                </text>
              </g>

              {/* Map title */}
              <text
                x={MAP_WIDTH / 2}
                y="28"
                textAnchor="middle"
                fill="#4a3728"
                fontSize="18"
                fontFamily="serif"
                fontWeight="bold"
                fontStyle="italic"
              >
                {world.name}
              </text>
              <text
                x={MAP_WIDTH / 2}
                y="44"
                textAnchor="middle"
                fill="#6b5344"
                fontSize="10"
                fontFamily="serif"
                fontStyle="italic"
              >
                {world.description}
              </text>
            </svg>
          </div>

          {/* Current Location Info */}
          <div className="mt-2 sm:mt-4 p-2 sm:p-3 bg-amber-900/40 rounded-lg border border-amber-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-amber-400 text-[10px] sm:text-xs uppercase tracking-wider">
                  Current Location
                </div>
                <div className="text-amber-100 font-medium text-sm sm:text-base">
                  {world.locations.find((l) => l.id === currentLocationId)?.name ?? 'Unknown'}
                </div>
              </div>
              <Badge className="bg-amber-600 text-amber-100 text-[10px] sm:text-xs">
                {world.locations.find((l) => l.id === currentLocationId)?.type ?? 'unknown'}
              </Badge>
            </div>

            {/* Available destinations */}
            {currentConnections.length > 0 && (
              <div className="mt-2 sm:mt-3">
                <div className="text-amber-400 text-[10px] sm:text-xs uppercase tracking-wider mb-1.5 sm:mb-2">
                  Travel Options ({currentConnections.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                  {currentConnections
                    .filter((conn) =>
                      discoveredIds.has(conn.to === currentLocationId ? conn.from : conn.to)
                    )
                    .slice(0, 4)
                    .map((conn) => {
                      const targetId = conn.to === currentLocationId ? conn.from : conn.to;
                      const target = world.locations.find((l) => l.id === targetId);
                      if (!target) return null;

                      return (
                        <Button
                          key={target.id}
                          variant="outline"
                          size="sm"
                          className="bg-amber-800/30 border-amber-700/50 text-amber-200 hover:bg-amber-700/50 justify-start text-left h-auto py-2 min-h-[44px]"
                          onClick={() => handleLocationClick(target)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium truncate text-xs sm:text-sm">
                              {target.name}
                            </span>
                            <span className="text-[10px] sm:text-xs text-amber-400">
                              {conn.travelTime}h via {conn.method}
                            </span>
                          </div>
                        </Button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 bg-amber-950 border border-amber-700 rounded-lg p-3 shadow-xl pointer-events-none"
            style={{
              left: Math.min(tooltip.x + 10, window.innerWidth - 200),
              top: Math.max(tooltip.y - 80, 10),
            }}
          >
            <div className="text-amber-100 font-medium">{tooltip.location.name}</div>
            <div className="text-amber-400 text-xs capitalize">{tooltip.location.type}</div>
            {tooltip.location.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {tooltip.location.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} className="text-xs bg-amber-800/50 text-amber-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {tooltip.travelInfo && (
              <div className="mt-2 pt-2 border-t border-amber-700/50">
                <div className="text-xs text-amber-300">
                  <span className="capitalize">{tooltip.travelInfo.method}</span>
                  {' - '}
                  {tooltip.travelInfo.travelTime}h travel time
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-amber-400">Danger:</span>
                  <span
                    className="text-xs font-medium capitalize"
                    style={{ color: DANGER_COLORS[tooltip.travelInfo.danger] }}
                  >
                    {tooltip.travelInfo.danger}
                  </span>
                </div>
              </div>
            )}
            {tooltip.location.id === currentLocationId && (
              <div className="mt-2 text-xs text-amber-500 italic">You are here</div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// ICONS
// ============================================================================

function MapIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
      />
    </svg>
  );
}

export default WorldMap;
