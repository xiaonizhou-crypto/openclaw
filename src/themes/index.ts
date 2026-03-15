import { celestialCourtThemePack } from "./celestial-court.js";
import { defaultThemePack } from "./default.js";
import type { ThemePack, ThemePackId, ThemeRoleKey, ThemeStateKey } from "./types.js";

export const THEME_PACKS: Record<ThemePackId, ThemePack> = {
  default: defaultThemePack,
  "celestial-court": celestialCourtThemePack,
};

export function resolveThemePack(themeId?: string | null): ThemePack {
  if (!themeId) {
    return THEME_PACKS.default;
  }
  return THEME_PACKS[themeId as ThemePackId] ?? THEME_PACKS.default;
}

export function getThemeRoleLabel(themeId: string | null | undefined, role: ThemeRoleKey): string {
  return resolveThemePack(themeId).roles[role].label;
}

export function getThemeStateLabel(themeId: string | null | undefined, state: ThemeStateKey): string {
  return resolveThemePack(themeId).states[state];
}
