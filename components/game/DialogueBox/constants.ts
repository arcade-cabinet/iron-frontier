/** Amber/gold color for NPC names and accents */
export const AMBER_GOLD = "#D4A049";
/** Warm border tint for the dialogue panel */
export const WARM_BORDER = "#8B6914";
/** Dark panel background with warm tint */
export const PANEL_BG = "rgba(28, 22, 16, 0.92)";
/** Text body background — slightly lighter inset */
export const TEXT_AREA_BG = "rgba(38, 30, 20, 0.85)";
/** Dialogue body text color */
export const BODY_TEXT_COLOR = "#C4A882";
/** Hint/secondary text */
export const HINT_COLOR = "#A08060";
/** Decorative rule color */
export const RULE_COLOR = "#6B5030";

const EXPRESSION_BORDER_COLORS: Record<string, string> = {
  angry: "#ef4444",
  happy: "#22c55e",
  sad: "#3b82f6",
  suspicious: "#eab308",
  worried: "#f97316",
  threatening: "#dc2626",
  curious: "#06b6d4",
  friendly: "#10b981",
  serious: "#64748b",
  thoughtful: "#a855f7",
  shocked: "#ec4899",
  determined: "#f59e0b",
  eager: "#84cc16",
  bitter: "#f43f5e",
};

const DEFAULT_BORDER_COLOR = "#d97706";

export function getExpressionColor(expression?: string): string {
  if (!expression) return DEFAULT_BORDER_COLOR;
  return EXPRESSION_BORDER_COLORS[expression] ?? DEFAULT_BORDER_COLOR;
}
