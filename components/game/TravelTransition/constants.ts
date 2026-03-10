import type { DangerLevel, TravelMethod } from "@/src/game/data/schemas/world";
import { FrontierTerritory } from "@/src/game/data/worlds/frontier_territory";

export const DANGER_COLORS: Record<DangerLevel, string> = {
  safe: "#22c55e",
  low: "#84cc16",
  moderate: "#eab308",
  high: "#f97316",
  extreme: "#ef4444",
};

export const DANGER_BG: Record<DangerLevel, string> = {
  safe: "bg-green-900/40",
  low: "bg-lime-900/40",
  moderate: "bg-yellow-900/40",
  high: "bg-orange-900/40",
  extreme: "bg-red-900/40",
};

export const DANGER_BORDER: Record<DangerLevel, string> = {
  safe: "border-green-700/40",
  low: "border-lime-700/40",
  moderate: "border-yellow-700/40",
  high: "border-orange-700/40",
  extreme: "border-red-700/40",
};

type MethodVisual = {
  label: string;
  icon: string;
  speed: string;
};

export const METHOD_VISUALS: Record<TravelMethod, MethodVisual> = {
  road: { label: "Road", icon: "\u{1F40E}", speed: "Fast" },
  trail: { label: "Trail", icon: "\u{1F97E}", speed: "Moderate" },
  railroad: { label: "Railroad", icon: "\u{1F682}", speed: "Very Fast" },
  wilderness: { label: "Wilderness", icon: "\u{1F97E}", speed: "Slow" },
  river: { label: "River", icon: "\u{1F6F6}", speed: "Varies" },
};

export function getLocationName(locationId: string | null | undefined): string {
  if (!locationId) return "Unknown";
  const loc = FrontierTerritory.locations.find((l) => l.id === locationId);
  return loc?.name ?? locationId;
}
