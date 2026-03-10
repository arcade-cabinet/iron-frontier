// TouchOverlay barrel — platform router + re-exports.

import { Platform } from "react-native";
import type { TouchOverlayProps } from "./constants.ts";
import { TouchOverlayNative } from "./TouchOverlayNative.tsx";
import { TouchOverlayWeb } from "./TouchOverlayWeb.tsx";

export type { TouchOverlayProps } from "./constants.ts";

export function TouchOverlay({ interactionNearby = false }: TouchOverlayProps) {
  if (Platform.OS === "web" && typeof document !== "undefined") {
    return TouchOverlayWeb({ interactionNearby });
  }
  return TouchOverlayNative({ interactionNearby });
}
