/**
 * HUD Icons
 *
 * SVG icons for the HUD components with consistent styling.
 * Icons are designed to be color-blind friendly with distinct shapes.
 */

import * as React from 'react';
import { cn } from '../primitives/utils';

interface IconProps {
  className?: string;
  'aria-label'?: string;
}

// ============================================================================
// TIME & WEATHER ICONS
// ============================================================================

export function SunIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label={ariaLabel || 'Sun'}
      role="img"
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function MoonIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label={ariaLabel || 'Moon'}
      role="img"
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

export function SunriseIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={ariaLabel || 'Sunrise'}
      role="img"
    >
      <path d="M12 2v4M4.93 10.93l1.41 1.41M2 18h2M20 18h2M19.07 10.93l-1.41 1.41M12 10a6 6 0 00-6 6h12a6 6 0 00-6-6z" />
      <path d="M12 2v4" />
    </svg>
  );
}

export function SunsetIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={ariaLabel || 'Sunset'}
      role="img"
    >
      <path d="M12 10v-4M4.93 10.93l1.41 1.41M2 18h2M20 18h2M19.07 10.93l-1.41 1.41M12 10a6 6 0 00-6 6h12a6 6 0 00-6-6z" />
    </svg>
  );
}

export function CloudIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label={ariaLabel || 'Cloudy'}
      role="img"
    >
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
    </svg>
  );
}

export function WindIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={ariaLabel || 'Dusty'}
      role="img"
    >
      <path d="M9.59 4.59A2 2 0 1111 8H2M12.59 19.41A2 2 0 1014 16H2M17.73 7.73A2.5 2.5 0 1119.5 12H2" />
    </svg>
  );
}

export function StormIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label={ariaLabel || 'Stormy'}
      role="img"
    >
      <path d="M19 16.9A5 5 0 0018 7h-1.26a8 8 0 10-11.62 9" />
      <path d="M13 11l-4 6h6l-4 6" />
    </svg>
  );
}

export function ThermometerIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={ariaLabel || 'Temperature'}
      role="img"
    >
      <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />
    </svg>
  );
}

// ============================================================================
// STATUS ICONS
// ============================================================================

export function HeartIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label={ariaLabel || 'Health'}
      role="img"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export function FatigueIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={ariaLabel || 'Fatigue'}
      role="img"
    >
      <path d="M2 4v16M6 4v6M6 14v6M10 4v16" />
      <path d="M14 4c0 2 2 6 2 8s-2 6-2 8" />
      <path d="M18 4c0 2 2 6 2 8s-2 6-2 8" />
    </svg>
  );
}

export function BedIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={ariaLabel || 'Rest'}
      role="img"
    >
      <path d="M2 4v16M2 8h18a2 2 0 012 2v10M2 17h20M6 8v9" />
    </svg>
  );
}

// ============================================================================
// PROVISIONS ICONS
// ============================================================================

export function FoodIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label={ariaLabel || 'Food'}
      role="img"
    >
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  );
}

export function WaterIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label={ariaLabel || 'Water'}
      role="img"
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
    </svg>
  );
}

export function CoinIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label={ariaLabel || 'Gold'}
      role="img"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v12M8 10h8M8 14h8" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// ============================================================================
// NAVIGATION ICONS
// ============================================================================

export function CompassIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={ariaLabel || 'Location'}
      role="img"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" />
    </svg>
  );
}

export function MapIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={ariaLabel || 'Map'}
      role="img"
    >
      <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

export function BackpackIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={ariaLabel || 'Inventory'}
      role="img"
    >
      <path d="M4 10a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10z" />
      <path d="M9 8V4a3 3 0 016 0v4" />
      <line x1="8" y1="14" x2="16" y2="14" />
    </svg>
  );
}

export function CampfireIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={ariaLabel || 'Camp'}
      role="img"
    >
      <path d="M12 12c-1-4 3-6 3-10 0 4 4 6 3 10" />
      <path d="M8 22l4-10 4 10" />
      <path d="M5 22h14" />
    </svg>
  );
}

export function MenuIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={ariaLabel || 'Menu'}
      role="img"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

// ============================================================================
// ALERT ICONS
// ============================================================================

export function AlertIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label={ariaLabel || 'Alert'}
      role="img"
    >
      <path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6zm-1 4v4h2v-4h-2zm0 6v2h2v-2h-2z" />
    </svg>
  );
}

export function DangerIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label={ariaLabel || 'Danger'}
      role="img"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2" />
      <circle cx="12" cy="16" r="1" fill="white" />
    </svg>
  );
}

export function InfoIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={ariaLabel || 'Info'}
      role="img"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function WarningIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label={ariaLabel || 'Warning'}
      role="img"
    >
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  );
}

// ============================================================================
// MISC ICONS
// ============================================================================

export function StarIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label={ariaLabel || 'Quest'}
      role="img"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function PlayerMarkerIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label={ariaLabel || 'Player'}
      role="img"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeWidth="2" stroke="currentColor" />
    </svg>
  );
}

export function TownIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label={ariaLabel || 'Town'}
      role="img"
    >
      <path d="M3 21h18v-2H3v2zm2-4h2v-4H5v4zm4 0h2v-4H9v4zm4 0h2v-4h-2v4zm4 0h2v-4h-2v4zM3 9v2h18V9L12 3 3 9z" />
    </svg>
  );
}

export function LandmarkIcon({ className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label={ariaLabel || 'Landmark'}
      role="img"
    >
      <path d="M12 2L4 7v2h16V7L12 2zM6 21h12v-9H6v9zm2-7h3v7H8v-7zm5 0h3v7h-3v-7z" />
    </svg>
  );
}
