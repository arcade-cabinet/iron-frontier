// Engine Types - Weather & Time

// ============================================================================
// WEATHER & TIME
// ============================================================================

export type WeatherType = 'clear' | 'cloudy' | 'dusty' | 'stormy';

export interface WeatherState {
  type: WeatherType;
  intensity: number;
  windDirection: number;
  windSpeed: number;
}

export interface TimeState {
  hour: number; // 0-24
  dayOfYear: number; // 1-365
  year: number;
}
