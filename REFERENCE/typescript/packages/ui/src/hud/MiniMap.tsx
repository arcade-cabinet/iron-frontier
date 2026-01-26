/**
 * MiniMap Component (Optional)
 *
 * A small circular or square map showing player position,
 * nearby points of interest, and current route.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../primitives/utils';
import { PlayerMarkerIcon, TownIcon, LandmarkIcon, StarIcon, DangerIcon } from './icons';
import type { MapMarker } from './types';

const miniMapVariants = cva(
  [
    'relative overflow-hidden',
    'bg-amber-950/80 backdrop-blur-sm',
    'border-2 border-amber-700/60',
    'shadow-lg',
  ].join(' '),
  {
    variants: {
      shape: {
        circle: 'rounded-full',
        square: 'rounded-lg',
      },
      size: {
        sm: 'w-24 h-24',
        md: 'w-32 h-32',
        lg: 'w-40 h-40',
      },
    },
    defaultVariants: {
      shape: 'circle',
      size: 'md',
    },
  }
);

export interface MiniMapProps extends VariantProps<typeof miniMapVariants> {
  /** Player position (0-1 normalized) */
  playerPosition: { x: number; y: number };
  /** Player rotation in radians */
  playerRotation?: number;
  /** Map markers to display */
  markers?: MapMarker[];
  /** Whether to show direction indicator */
  showCompass?: boolean;
  /** Map scale (zoom level) */
  scale?: number;
  /** Whether the map is visible */
  visible?: boolean;
  /** Toggle visibility callback */
  onToggle?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get marker icon by type
 */
function getMarkerIcon(type: MapMarker['type']): React.ReactNode {
  switch (type) {
    case 'player':
      return <PlayerMarkerIcon className="w-4 h-4 text-green-400" />;
    case 'town':
      return <TownIcon className="w-3 h-3 text-amber-400" />;
    case 'landmark':
      return <LandmarkIcon className="w-3 h-3 text-sky-400" />;
    case 'quest':
      return <StarIcon className="w-3 h-3 text-yellow-400" />;
    case 'danger':
      return <DangerIcon className="w-3 h-3 text-red-400" />;
    default:
      return null;
  }
}

/**
 * Single map marker component
 */
interface MapMarkerItemProps {
  marker: MapMarker;
  containerSize: number;
  scale: number;
  playerPosition: { x: number; y: number };
  isPlayer?: boolean;
  playerRotation?: number;
}

function MapMarkerItem({
  marker,
  containerSize,
  scale,
  playerPosition,
  isPlayer,
  playerRotation = 0,
}: MapMarkerItemProps) {
  // Calculate relative position from player
  const relX = (marker.x - playerPosition.x) * scale;
  const relY = (marker.y - playerPosition.y) * scale;

  // Convert to screen coordinates (centered)
  const halfSize = containerSize / 2;
  const screenX = halfSize + relX * halfSize;
  const screenY = halfSize - relY * halfSize; // Invert Y for screen coords

  // Check if marker is within bounds
  const padding = 8;
  const isInBounds =
    screenX >= padding &&
    screenX <= containerSize - padding &&
    screenY >= padding &&
    screenY <= containerSize - padding;

  if (!isInBounds && !isPlayer) {
    return null;
  }

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100"
      style={{
        left: isPlayer ? halfSize : screenX,
        top: isPlayer ? halfSize : screenY,
        transform: isPlayer
          ? `translate(-50%, -50%) rotate(${playerRotation}rad)`
          : 'translate(-50%, -50%)',
      }}
      title={marker.label}
    >
      {getMarkerIcon(marker.type)}
    </div>
  );
}

/**
 * Compass rose component
 */
function CompassRose({ size }: { size: number }) {
  const radius = size / 2 - 8;
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Cardinal directions */}
      <span
        className="absolute text-[8px] font-bold text-amber-400"
        style={{ left: '50%', top: '4px', transform: 'translateX(-50%)' }}
      >
        N
      </span>
      <span
        className="absolute text-[8px] font-bold text-amber-600/60"
        style={{ left: '50%', bottom: '4px', transform: 'translateX(-50%)' }}
      >
        S
      </span>
      <span
        className="absolute text-[8px] font-bold text-amber-600/60"
        style={{ right: '4px', top: '50%', transform: 'translateY(-50%)' }}
      >
        E
      </span>
      <span
        className="absolute text-[8px] font-bold text-amber-600/60"
        style={{ left: '4px', top: '50%', transform: 'translateY(-50%)' }}
      >
        W
      </span>
    </div>
  );
}

/**
 * MiniMap component for the game HUD
 */
export function MiniMap({
  playerPosition,
  playerRotation = 0,
  markers = [],
  showCompass = true,
  scale = 1,
  visible = true,
  onToggle,
  shape,
  size,
  className,
}: MiniMapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = React.useState(128);

  // Get container size
  React.useEffect(() => {
    if (containerRef.current) {
      setContainerSize(containerRef.current.offsetWidth);
    }
  }, [size]);

  if (!visible) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'w-8 h-8 rounded-full',
          'bg-amber-950/80 border-2 border-amber-700/60',
          'flex items-center justify-center',
          'text-amber-400 hover:text-amber-300',
          'transition-colors',
          className
        )}
        aria-label="Show minimap"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
        </svg>
      </button>
    );
  }

  // Create player marker
  const playerMarker: MapMarker = {
    id: 'player',
    type: 'player',
    x: playerPosition.x,
    y: playerPosition.y,
    label: 'You',
  };

  return (
    <div
      ref={containerRef}
      className={cn(miniMapVariants({ shape, size }), className)}
      role="img"
      aria-label="Mini map showing nearby area"
    >
      {/* Map background texture */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 30%, rgba(217, 119, 6, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(217, 119, 6, 0.2) 0%, transparent 50%)
          `,
        }}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(217, 119, 6, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(217, 119, 6, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '16px 16px',
        }}
      />

      {/* Map markers */}
      {markers.map((marker) => (
        <MapMarkerItem
          key={marker.id}
          marker={marker}
          containerSize={containerSize}
          scale={scale}
          playerPosition={playerPosition}
        />
      ))}

      {/* Player marker (always centered) */}
      <MapMarkerItem
        marker={playerMarker}
        containerSize={containerSize}
        scale={scale}
        playerPosition={playerPosition}
        isPlayer
        playerRotation={playerRotation}
      />

      {/* Compass rose */}
      {showCompass && <CompassRose size={containerSize} />}

      {/* Toggle button */}
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-900/60 text-amber-400 hover:text-amber-300 text-[10px] flex items-center justify-center"
          aria-label="Hide minimap"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      )}
    </div>
  );
}

export { miniMapVariants };
