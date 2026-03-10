/**
 * ShopPanel shared types, constants, and helpers.
 */

// =============================================================================
// Types
// =============================================================================

export type ConfirmationDialog = {
  type: "buy" | "sell";
  itemName: string;
  price: number;
  onConfirm: () => void;
} | null;

// =============================================================================
// Constants
// =============================================================================

export const RARITY_BADGE_VARIANT: Record<
  string,
  "success" | "warning" | "info" | "danger" | "default"
> = {
  legendary: "warning",
  rare: "info",
  uncommon: "success",
  common: "default",
};

// =============================================================================
// Helpers
// =============================================================================

export function getRarityBadgeVariant(rarity: string) {
  return RARITY_BADGE_VARIANT[rarity] ?? "default";
}

export function formatStock(stock: number | undefined): string {
  if (stock === undefined || stock < 0) return "\u221E"; // infinity
  if (stock === 0) return "Sold Out";
  return `x${stock}`;
}
