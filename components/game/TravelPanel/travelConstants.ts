/**
 * Travel panel constants, types, and utility functions.
 */

import type { DangerLevel, TravelMethod } from "@/src/game/data/schemas/world";
import { FrontierTerritory } from "@/src/game/data/worlds/frontier_territory";

export type DangerStyle = {
  bg: string;
  text: string;
  border: string;
  label: string;
  barColor: string;
};

export const DANGER_STYLES: Record<DangerLevel, DangerStyle> = {
  safe: {
    bg: "bg-green-900/50",
    text: "text-green-400",
    border: "border-green-700/50",
    label: "Safe",
    barColor: "#22c55e",
  },
  low: {
    bg: "bg-lime-900/50",
    text: "text-lime-400",
    border: "border-lime-700/50",
    label: "Low",
    barColor: "#84cc16",
  },
  moderate: {
    bg: "bg-yellow-900/50",
    text: "text-yellow-400",
    border: "border-yellow-700/50",
    label: "Moderate",
    barColor: "#eab308",
  },
  high: {
    bg: "bg-orange-900/50",
    text: "text-orange-400",
    border: "border-orange-700/50",
    label: "High",
    barColor: "#f97316",
  },
  extreme: {
    bg: "bg-red-900/50",
    text: "text-red-400",
    border: "border-red-700/50",
    label: "Extreme",
    barColor: "#ef4444",
  },
};

export type MethodInfo = {
  label: string;
  speed: string;
  iconChar: string;
  provisionCostMod: number;
  fatigueCostMod: number;
};

export const METHOD_INFO: Record<TravelMethod, MethodInfo> = {
  road: {
    label: "Road",
    speed: "Fast",
    iconChar: "\u{1F40E}",
    provisionCostMod: 1,
    fatigueCostMod: 0.8,
  },
  trail: {
    label: "Trail",
    speed: "Moderate",
    iconChar: "\u{1F97E}",
    provisionCostMod: 1.2,
    fatigueCostMod: 1,
  },
  railroad: {
    label: "Railroad",
    speed: "Very Fast",
    iconChar: "\u{1F682}",
    provisionCostMod: 0.5,
    fatigueCostMod: 0.3,
  },
  wilderness: {
    label: "Wilderness",
    speed: "Slow",
    iconChar: "\u{1F97E}",
    provisionCostMod: 1.5,
    fatigueCostMod: 1.5,
  },
  river: {
    label: "River",
    speed: "Varies",
    iconChar: "\u{1F6F6}",
    provisionCostMod: 0.8,
    fatigueCostMod: 0.7,
  },
};

export const DANGER_COLORS: Record<string, string> = {
  safe: "#22c55e",
  low: "#84cc16",
  moderate: "#eab308",
  high: "#f97316",
  extreme: "#ef4444",
};

export function estimateTravelCosts(
  travelTime: number,
  method: TravelMethod,
): { provisions: number; fatigue: number } {
  const info = METHOD_INFO[method] ?? METHOD_INFO.trail;
  return {
    provisions: Math.ceil(travelTime * info.provisionCostMod),
    fatigue: Math.ceil(travelTime * 10 * info.fatigueCostMod),
  };
}

export function getLocationName(locationId?: string | null): string {
  if (!locationId) return "Unknown";
  const loc = FrontierTerritory.locations.find((l) => l.id === locationId);
  return loc?.name ?? locationId;
}
