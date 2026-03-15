export type ThemeRoleKey =
  | "governor"
  | "planner"
  | "reviewer"
  | "dispatcher"
  | "executor_fast"
  | "executor_heavy"
  | "observer"
  | "treasury"
  | "auditor";

export type ThemeStateKey = "awaiting_human" | "approved" | "blocked" | "completed" | "planned";

export type ThemeNavigationKey = "tasks" | "approvalQueue";

export type ThemeRoleDefinition = {
  label: string;
  description: string;
  icon?: string;
};

export type ThemeUiTokens = {
  accent: string;
  accentSoft: string;
  surface: string;
};

export type ThemePack = {
  id: string;
  displayName: string;
  roles: Record<ThemeRoleKey, ThemeRoleDefinition>;
  navigation: Record<ThemeNavigationKey, string>;
  states: Record<ThemeStateKey, string>;
  uiTokens: ThemeUiTokens;
  panelCopy: {
    tasksTitle: string;
    tasksSubtitle: string;
    approvalQueueTitle: string;
    approvalQueueSubtitle: string;
  };
};

export type ThemePackId = "default" | "celestial-court";
