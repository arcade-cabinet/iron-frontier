/**
 * ConnectionLine - renders route lines between two map locations.
 * Supports road (solid), trail (dashed), railroad (with crossties),
 * wilderness (dotted), and river styles.
 */

import type * as React from "react";
import { View } from "react-native";

import type { Connection } from "@/src/game/data/schemas/world";
import { getLocationById, toRenderX, toRenderY } from "./types.ts";

export function ConnectionLine({
  conn,
  discoveredIds,
}: {
  conn: Connection;
  discoveredIds: Set<string>;
}) {
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
