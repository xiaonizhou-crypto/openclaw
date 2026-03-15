import type { ThemePack } from "./types.js";

export const defaultThemePack: ThemePack = {
  id: "default",
  displayName: "Default",
  roles: {
    governor: { label: "Governor", description: "Global governance and escalation.", icon: "shield" },
    planner: { label: "Planner", description: "Builds task plans and execution steps.", icon: "drafting-compass" },
    reviewer: { label: "Reviewer", description: "Checks plan quality and risk before release.", icon: "clipboard-check" },
    dispatcher: { label: "Dispatcher", description: "Owns post-approval handoff and routing.", icon: "route" },
    executor_fast: { label: "Fast Executor", description: "Handles quick-turn execution work.", icon: "zap" },
    executor_heavy: { label: "Heavy Executor", description: "Handles longer heavy execution work.", icon: "hammer" },
    observer: { label: "Observer", description: "Monitors system events and stalls.", icon: "radar" },
    treasury: { label: "Treasury", description: "Tracks cost, budget, and resource posture.", icon: "coins" },
    auditor: { label: "Auditor", description: "Preserves audit trails and timelines.", icon: "scroll" },
  },
  navigation: {
    tasks: "Tasks",
    approvalQueue: "Approval Queue",
  },
  states: {
    awaiting_human: "Awaiting Human",
    approved: "Approved",
    blocked: "Blocked",
    completed: "Completed",
    planned: "Planned",
  },
  uiTokens: {
    accent: "#6d5efc",
    accentSoft: "rgba(109, 94, 252, 0.16)",
    surface: "governance-neutral",
  },
  panelCopy: {
    tasksTitle: "Governed Tasks",
    tasksSubtitle: "Task lifecycle objects for the neutral clawOS governance layer.",
    approvalQueueTitle: "Approval Queue",
    approvalQueueSubtitle: "Tasks currently waiting for human approval.",
  },
};
