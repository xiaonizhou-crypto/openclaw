import type { ThemePack } from "./types.js";

export const celestialCourtThemePack: ThemePack = {
  id: "celestial-court",
  displayName: "Celestial Court",
  roles: {
    governor: { label: "玉帝", description: "最高治理与全局裁决。", icon: "crown" },
    planner: { label: "太上老君", description: "负责推演、规划与方案成形。", icon: "sparkles" },
    reviewer: { label: "王母", description: "负责审议、秩序与放行前把关。", icon: "scale" },
    dispatcher: { label: "托塔李天王", description: "负责编制、派发与交接。", icon: "tower" },
    executor_fast: { label: "哪吒", description: "高机动快速执行。", icon: "bolt" },
    executor_heavy: { label: "天蓬元帅", description: "重型执行与多任务推进。", icon: "anvil" },
    observer: { label: "千里眼 / 顺风耳", description: "监看异动、监听风险与停滞。", icon: "eye" },
    treasury: { label: "财神", description: "预算、成本与资源看护。", icon: "coin" },
    auditor: { label: "司命星君", description: "记录、归档与审计回放。", icon: "book" },
  },
  navigation: {
    tasks: "天庭任务簿",
    approvalQueue: "待天裁队列",
  },
  states: {
    awaiting_human: "待天裁",
    approved: "已准奏",
    blocked: "受阻",
    completed: "功成",
    planned: "已列策",
  },
  uiTokens: {
    accent: "#c8a44d",
    accentSoft: "rgba(200, 164, 77, 0.18)",
    surface: "celestial-court",
  },
  panelCopy: {
    tasksTitle: "天庭任务簿",
    tasksSubtitle: "同一治理内核下的天庭叙事展示，不改变任务制度本身。",
    approvalQueueTitle: "待天裁队列",
    approvalQueueSubtitle: "等待人类拍板的任务会先停在这里。",
  },
};
