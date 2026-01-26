/**
 * LocationLabel Component
 *
 * Displays the current location name with fade transitions.
 * Can show different styles for towns, routes, and landmarks.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../primitives/utils';
import { CompassIcon, TownIcon, LandmarkIcon } from './icons';
import { useReducedMotion } from './hooks';
import type { LocationData } from './types';

const locationLabelVariants = cva(
  [
    'inline-flex items-center gap-2',
    'px-4 py-2 rounded-lg',
    'backdrop-blur-sm',
    'border',
    'shadow-lg',
    'transition-all duration-500',
  ].join(' '),
  {
    variants: {
      type: {
        town: 'bg-amber-950/90 border-amber-600/50 text-amber-100',
        route: 'bg-amber-950/80 border-amber-700/40 text-amber-200',
        landmark: 'bg-sky-950/80 border-sky-700/40 text-sky-100',
        wilderness: 'bg-stone-950/80 border-stone-700/40 text-stone-200',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      type: 'route',
      size: 'md',
    },
  }
);

export interface LocationLabelProps extends VariantProps<typeof locationLabelVariants> {
  /** Location data */
  location: LocationData | null;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Whether to animate on change */
  animateOnChange?: boolean;
}

/**
 * Get icon for location type
 */
function getLocationIcon(type: LocationData['type']): React.ReactNode {
  switch (type) {
    case 'town':
      return <TownIcon className="w-5 h-5" aria-label="Town" />;
    case 'landmark':
      return <LandmarkIcon className="w-5 h-5" aria-label="Landmark" />;
    case 'route':
    case 'wilderness':
    default:
      return <CompassIcon className="w-5 h-5" aria-label="Location" />;
  }
}

/**
 * Get decorative prefix for location type
 */
function getLocationPrefix(type: LocationData['type']): string | null {
  switch (type) {
    case 'town':
      return null; // Towns just show their name
    case 'route':
      return 'Traveling: ';
    case 'landmark':
      return 'Near: ';
    case 'wilderness':
      return 'The ';
    default:
      return null;
  }
}

/**
 * LocationLabel component for the game HUD
 */
export function LocationLabel({
  location,
  type: overrideType,
  size,
  showIcon = true,
  animateOnChange = true,
  className,
}: LocationLabelProps) {
  const [displayLocation, setDisplayLocation] = React.useState<LocationData | null>(
    location
  );
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const reducedMotion = useReducedMotion();

  // Handle location change with transition
  React.useEffect(() => {
    if (!location) {
      // Fade out
      if (animateOnChange && !reducedMotion) {
        setIsTransitioning(true);
        const timer = setTimeout(() => {
          setDisplayLocation(null);
          setIsTransitioning(false);
        }, 300);
        return () => clearTimeout(timer);
      } else {
        setDisplayLocation(null);
      }
      return;
    }

    // If location changed
    if (displayLocation?.id !== location.id) {
      if (animateOnChange && !reducedMotion) {
        // Fade out old location
        setIsTransitioning(true);
        const fadeOutTimer = setTimeout(() => {
          // Switch to new location
          setDisplayLocation(location);
          // Start fade in
          setTimeout(() => {
            setIsTransitioning(false);
          }, 50);
        }, 300);
        return () => clearTimeout(fadeOutTimer);
      } else {
        setDisplayLocation(location);
      }
    }
  }, [location, animateOnChange, reducedMotion, displayLocation?.id]);

  // Don't render if no location
  if (!displayLocation) {
    return null;
  }

  const locationType = overrideType || displayLocation.type;
  const prefix = getLocationPrefix(locationType);

  return (
    <div
      className={cn(
        locationLabelVariants({ type: locationType, size }),
        isTransitioning && 'opacity-0',
        !isTransitioning && 'opacity-100',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`Current location: ${displayLocation.name}`}
    >
      {showIcon && (
        <span
          className={cn(
            locationType === 'town' && 'text-amber-400',
            locationType === 'route' && 'text-amber-500',
            locationType === 'landmark' && 'text-sky-400',
            locationType === 'wilderness' && 'text-stone-400'
          )}
        >
          {getLocationIcon(locationType)}
        </span>
      )}
      <span className="font-semibold">
        {prefix && <span className="font-normal opacity-80">{prefix}</span>}
        {displayLocation.name}
      </span>
    </div>
  );
}

export { locationLabelVariants };
