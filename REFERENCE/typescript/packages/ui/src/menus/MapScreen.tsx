/**
 * MapScreen Component
 *
 * Full world map view showing towns, routes, and the player's current position.
 * Supports clicking locations for info popups and travel initiation.
 *
 * @example
 * ```tsx
 * <MapScreen
 *   open={showMap}
 *   onClose={() => setShowMap(false)}
 *   locations={worldLocations}
 *   routes={worldRoutes}
 *   currentLocationId="iron_gulch"
 *   onLocationClick={(id) => showLocationInfo(id)}
 *   onTravel={(id) => startTravel(id)}
 * />
 * ```
 */

import * as React from 'react';
import { cn } from '../primitives/utils';
import type { MenuBaseProps, MapLocation, MapRoute } from './types';
import {
  CampfireIcon,
  ChevronRightIcon,
  CloseIcon,
  HomeIcon,
  MenuOverlay,
  TargetIcon,
} from './shared';

export interface MapScreenProps extends MenuBaseProps {
  /** All map locations */
  locations?: MapLocation[];
  /** Routes between locations */
  routes?: MapRoute[];
  /** Current player location ID */
  currentLocationId?: string;
  /** Callback when a location is clicked */
  onLocationClick?: (locationId: string) => void;
  /** Callback when travel is initiated */
  onTravel?: (locationId: string) => void;
}

function getLocationIcon(type: MapLocation['type']) {
  switch (type) {
    case 'town':
      return <HomeIcon className="w-full h-full" />;
    case 'camp':
      return <CampfireIcon className="w-full h-full" />;
    case 'dungeon':
      return <TargetIcon className="w-full h-full" />;
    default:
      return (
        <span className="text-lg font-bold">?</span>
      );
  }
}

function LocationMarker({
  location,
  isCurrent,
  onClick,
  isSelected,
}: {
  location: MapLocation;
  isCurrent: boolean;
  onClick: () => void;
  isSelected: boolean;
}) {
  const size = location.type === 'town' ? 'w-10 h-10 sm:w-12 sm:h-12' : 'w-8 h-8 sm:w-10 sm:h-10';

  return (
    <button
      onClick={onClick}
      className={cn(
        'absolute transform -translate-x-1/2 -translate-y-1/2',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900',
        'group'
      )}
      style={{
        left: `${location.position.x}%`,
        top: `${location.position.y}%`,
      }}
      aria-label={location.visited ? location.name : 'Unknown location'}
    >
      {/* Current location pulse */}
      {isCurrent && (
        <span className="absolute inset-0 rounded-full bg-amber-500/30 animate-ping" />
      )}

      {/* Marker */}
      <div
        className={cn(
          size,
          'rounded-full flex items-center justify-center',
          'border-2 transition-all duration-200',
          location.visited
            ? 'bg-stone-800 border-amber-600 text-amber-400'
            : 'bg-stone-900 border-stone-600 text-stone-500',
          isCurrent && 'border-amber-400 ring-2 ring-amber-400/50',
          isSelected && 'scale-110',
          'group-hover:scale-110 group-hover:border-amber-500'
        )}
      >
        {getLocationIcon(location.type)}
      </div>

      {/* Label */}
      <span
        className={cn(
          'absolute top-full left-1/2 -translate-x-1/2 mt-1',
          'text-[10px] sm:text-xs font-medium whitespace-nowrap',
          'px-1.5 py-0.5 rounded bg-stone-900/90',
          location.visited ? 'text-stone-200' : 'text-stone-500',
          'opacity-0 group-hover:opacity-100 transition-opacity'
        )}
      >
        {location.visited ? location.name : '???'}
      </span>
    </button>
  );
}

function LocationInfoPanel({
  location,
  isCurrent,
  canTravel,
  onTravel,
  onClose,
}: {
  location: MapLocation;
  isCurrent: boolean;
  canTravel: boolean;
  onTravel?: () => void;
  onClose: () => void;
}) {
  if (!location.visited) {
    return (
      <div className="p-4 text-center">
        <div className="w-12 h-12 rounded-full bg-stone-800 border-2 border-stone-600 text-stone-500 flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">?</span>
        </div>
        <h3 className="text-lg font-bold text-stone-400">Unknown Location</h3>
        <p className="text-sm text-stone-500 mt-1">
          Travel closer to discover this place
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm transition-colors min-h-[44px]"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            'bg-amber-700/30 border-2 border-amber-600/50 text-amber-400'
          )}
        >
          {getLocationIcon(location.type)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-amber-200">{location.name}</h3>
          <span className="text-xs text-stone-400 capitalize">{location.type}</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Description */}
      {location.description && (
        <p className="text-sm text-stone-400 mb-4">{location.description}</p>
      )}

      {/* Status */}
      {isCurrent && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-sm text-amber-400">You are here</span>
        </div>
      )}

      {/* Travel Button */}
      {!isCurrent && canTravel && onTravel && (
        <button
          onClick={onTravel}
          className={cn(
            'w-full flex items-center justify-center gap-2',
            'px-4 py-3 rounded-lg',
            'bg-amber-700 hover:bg-amber-600 text-white',
            'font-medium text-sm transition-colors',
            'min-h-[48px]'
          )}
        >
          Travel Here
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      )}

      {!isCurrent && !canTravel && (
        <p className="text-sm text-stone-500 text-center py-2">
          No direct route available
        </p>
      )}
    </div>
  );
}

export function MapScreen({
  open = false,
  onClose,
  locations = [],
  routes = [],
  currentLocationId,
  onLocationClick,
  onTravel,
  className,
  testID,
}: MapScreenProps) {
  const [selectedLocationId, setSelectedLocationId] = React.useState<string | null>(null);

  // Get the selected location
  const selectedLocation = locations.find((l) => l.id === selectedLocationId);

  // Check if we can travel to the selected location
  const canTravelTo = React.useMemo(() => {
    if (!currentLocationId || !selectedLocationId || currentLocationId === selectedLocationId) {
      return false;
    }
    // Check if there's a route between current location and selected
    return routes.some(
      (r) =>
        (r.from === currentLocationId && r.to === selectedLocationId) ||
        (r.to === currentLocationId && r.from === selectedLocationId)
    );
  }, [currentLocationId, selectedLocationId, routes]);

  // Reset selection when closing
  React.useEffect(() => {
    if (!open) {
      setSelectedLocationId(null);
    }
  }, [open]);

  const handleLocationClick = (locationId: string) => {
    setSelectedLocationId(locationId);
    onLocationClick?.(locationId);
  };

  return (
    <MenuOverlay open={open} onClose={onClose} className={className}>
      <div
        data-testid={testID}
        className="h-full flex flex-col bg-stone-950"
      >
        {/* Header */}
        <header className="flex items-center justify-between p-3 sm:p-4 border-b border-amber-800/30 bg-stone-900/50">
          <h2 className="text-lg sm:text-xl font-bold text-amber-200 tracking-wide uppercase">
            World Map
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close map"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </header>

        {/* Map Content */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          {/* Map View */}
          <div className="flex-1 relative overflow-hidden bg-stone-900/50">
            {/* Map background with paper texture */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 30% 40%, rgba(217, 119, 6, 0.05) 0%, transparent 50%),
                  radial-gradient(circle at 70% 60%, rgba(194, 65, 12, 0.05) 0%, transparent 50%),
                  linear-gradient(to bottom, rgba(28, 25, 23, 0.8), rgba(28, 25, 23, 0.9))
                `,
              }}
            />

            {/* Routes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {routes.map((route, index) => {
                const fromLocation = locations.find((l) => l.id === route.from);
                const toLocation = locations.find((l) => l.id === route.to);
                if (!fromLocation || !toLocation) return null;

                return (
                  <line
                    key={index}
                    x1={`${fromLocation.position.x}%`}
                    y1={`${fromLocation.position.y}%`}
                    x2={`${toLocation.position.x}%`}
                    y2={`${toLocation.position.y}%`}
                    stroke={route.traveled ? '#d97706' : '#57534e'}
                    strokeWidth={route.traveled ? 3 : 2}
                    strokeDasharray={route.traveled ? undefined : '8 4'}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>

            {/* Location Markers */}
            {locations.map((location) => (
              <LocationMarker
                key={location.id}
                location={location}
                isCurrent={location.id === currentLocationId}
                isSelected={location.id === selectedLocationId}
                onClick={() => handleLocationClick(location.id)}
              />
            ))}

            {/* Legend */}
            <div className="absolute bottom-3 left-3 flex flex-col gap-1 bg-stone-900/90 rounded-lg p-2 text-[10px] sm:text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 bg-amber-600" />
                <span>Traveled</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 border-t border-dashed border-stone-600" />
                <span>Unexplored</span>
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div
            className={cn(
              'w-full sm:w-72 bg-stone-900 border-t sm:border-t-0 sm:border-l border-stone-800',
              !selectedLocation && 'hidden sm:block'
            )}
          >
            {selectedLocation ? (
              <LocationInfoPanel
                location={selectedLocation}
                isCurrent={selectedLocation.id === currentLocationId}
                canTravel={canTravelTo}
                onTravel={() => onTravel?.(selectedLocation.id)}
                onClose={() => setSelectedLocationId(null)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-stone-500 p-4">
                <TargetIcon className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm text-center">Select a location on the map</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MenuOverlay>
  );
}

MapScreen.displayName = 'MapScreen';

export default MapScreen;
