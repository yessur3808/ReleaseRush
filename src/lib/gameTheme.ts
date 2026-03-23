/**
 * Game-specific visual theming: accent colours, gradients, and category defaults.
 * Keeps all "per-game" brand colours in one place so they are easy to update.
 */

import type { CategoryType, Game } from "./types";

/** Per-game accent colour overrides (by stable game ID) */
const GAME_ACCENT: Record<string, string> = {
  "gta-vi": "#f97316", // orange
  "007-first-light": "#d4a017", // gold
  "cyberpunk-sequel": "#00e5ff", // neon cyan
  "fallout-5": "#a3e635", // radioactive green
  "fortnite-season-next": "#7c3aed", // purple
  "overwatch-2-season-next": "#f59e0b", // amber
  "apex-legends-season-next": "#ef4444", // red
  "valorant-next-act": "#ff4655", // VALORANT red
  "warframe-next-major-update": "#14b8a6", // teal
  "dota-2-season-next": "#b91c1c", // dark red
  "pokemon-pokopia": "#facc15", // Pokémon yellow
};

/** Fallback accent colour by category type */
const CATEGORY_ACCENT: Record<CategoryType, string> = {
  full_game: "#6366f1", // indigo
  dlc: "#ec4899", // pink
  season: "#8b5cf6", // violet
  event: "#f59e0b", // amber
  update: "#22c55e", // green
  store_reset: "#06b6d4", // cyan
  other: "#94a3b8", // slate
};

/** Return the accent colour for a given game. */
export function getGameAccent(game: Game): string {
  return GAME_ACCENT[game.id] ?? CATEGORY_ACCENT[game.category.type] ?? "#6366f1";
}

/**
 * Return a CSS linear-gradient string that acts as a tinted hero background.
 * Works both in dark and light mode – callers should choose opacity accordingly.
 */
export function getGameHeroGradient(accent: string, isDark: boolean): string {
  return isDark
    ? `linear-gradient(160deg, ${accent}22 0%, rgba(0,0,0,0) 60%)`
    : `linear-gradient(160deg, ${accent}18 0%, rgba(255,255,255,0) 60%)`;
}

/** Category badge colour (chip colour variant) */
export function getCategoryChipColor(
  type: CategoryType,
): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" {
  switch (type) {
    case "full_game":
      return "primary";
    case "dlc":
      return "secondary";
    case "season":
      return "info";
    case "event":
      return "warning";
    case "update":
      return "success";
    case "store_reset":
      return "info";
    default:
      return "default";
  }
}
