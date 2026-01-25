/**
 * TimeDisplay Component
 *
 * Displays the current game time, day counter, temperature, and weather.
 * Located in the top-left corner of the HUD.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../primitives/utils';
import {
  SunIcon,
  MoonIcon,
  SunriseIcon,
  SunsetIcon,
  CloudIcon,
  WindIcon,
  StormIcon,
  ThermometerIcon,
} from './icons';
import { formatGameTime, getTimeOfDay, getTemperature } from './hooks';
import type { TimeDisplayData, WeatherDisplayData, TimeOfDay, WeatherType } from './types';

const timeDisplayVariants = cva(
  [
    'px-3 py-2 rounded-lg',
    'bg-amber-950/80 backdrop-blur-sm',
    'border border-amber-800/50',
    'shadow-lg',
    'text-amber-100',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface TimeDisplayProps extends VariantProps<typeof timeDisplayVariants> {
  /** Time data from game state */
  time: TimeDisplayData;
  /** Weather data from game state */
  weather?: WeatherDisplayData;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show temperature */
  showTemperature?: boolean;
  /** Whether to show weather */
  showWeather?: boolean;
}

/**
 * Get the appropriate icon for the time of day
 */
function getTimeIcon(timeOfDay: TimeOfDay): React.ReactNode {
  switch (timeOfDay) {
    case 'dawn':
      return <SunriseIcon className="text-orange-400" aria-label="Dawn" />;
    case 'morning':
    case 'afternoon':
      return <SunIcon className="text-yellow-400" aria-label="Daytime" />;
    case 'evening':
      return <SunIcon className="text-orange-500" aria-label="Evening" />;
    case 'dusk':
      return <SunsetIcon className="text-orange-600" aria-label="Dusk" />;
    case 'night':
      return <MoonIcon className="text-blue-300" aria-label="Night" />;
    default:
      return <SunIcon className="text-yellow-400" aria-label="Day" />;
  }
}

/**
 * Get the appropriate icon for weather type
 */
function getWeatherIcon(type: WeatherType): React.ReactNode {
  switch (type) {
    case 'clear':
      return null; // No icon for clear weather
    case 'cloudy':
      return <CloudIcon className="text-gray-300" aria-label="Cloudy" />;
    case 'dusty':
      return <WindIcon className="text-amber-400" aria-label="Dusty" />;
    case 'stormy':
      return <StormIcon className="text-blue-400" aria-label="Stormy" />;
    default:
      return null;
  }
}

/**
 * Get weather description text
 */
function getWeatherDescription(weather: WeatherDisplayData): string {
  const { type, intensity } = weather;
  const intensityText = intensity > 0.7 ? 'Heavy ' : intensity > 0.4 ? '' : 'Light ';

  switch (type) {
    case 'clear':
      return 'Clear';
    case 'cloudy':
      return `${intensityText}Clouds`;
    case 'dusty':
      return `${intensityText}Dust`;
    case 'stormy':
      return `${intensityText}Storm`;
    default:
      return 'Clear';
  }
}

/**
 * TimeDisplay component for the game HUD
 */
export function TimeDisplay({
  time,
  weather,
  size,
  showTemperature = true,
  showWeather = true,
  className,
}: TimeDisplayProps) {
  const timeOfDay = getTimeOfDay(time.hour);
  const { time: formattedTime, period } = formatGameTime(time.hour);
  const temperature = getTemperature(time.hour, time.dayOfYear);

  return (
    <div
      className={cn(timeDisplayVariants({ size }), className)}
      role="status"
      aria-live="polite"
      aria-label="Game time and weather"
    >
      {/* Time Row */}
      <div className="flex items-center gap-2">
        {getTimeIcon(timeOfDay)}
        <span className="font-mono font-semibold tracking-wide" aria-label="Current time">
          {formattedTime}
          <span className="text-amber-400/80 text-[0.8em] ml-0.5">{period}</span>
        </span>
      </div>

      {/* Temperature Row */}
      {showTemperature && (
        <div className="flex items-center gap-2 mt-1 text-amber-300/80">
          <ThermometerIcon className="w-3.5 h-3.5" />
          <span className="text-[0.85em]" title={temperature.label}>
            {temperature.value}
          </span>
        </div>
      )}

      {/* Weather Row (if not clear) */}
      {showWeather && weather && weather.type !== 'clear' && (
        <div className="flex items-center gap-2 mt-1 text-amber-300/80">
          {getWeatherIcon(weather.type)}
          <span className="text-[0.85em]">{getWeatherDescription(weather)}</span>
        </div>
      )}

      {/* Day Counter - smaller text below */}
      <div className="mt-1.5 pt-1.5 border-t border-amber-700/30">
        <span className="text-[0.75em] text-amber-400/70">
          Day {time.dayOfYear}, {time.year}
        </span>
      </div>
    </div>
  );
}

export { timeDisplayVariants };
