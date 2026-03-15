export type FeishuGovernanceRoute =
  | {
      mode: "reply-only";
      reason: "lightweight" | "question" | "chat";
    }
  | {
      mode: "governed-task";
      reason: "explicit-request" | "high-risk";
      title: string;
      riskLevel: "medium" | "high";
      requiresApproval: boolean;
      intentType: string;
      summary: string;
    };

const EXPLICIT_TASK_PATTERNS = [
  /(^|\s)(请|帮我|麻烦|安排|推进|跟进|整理|分析|输出|制定|写一份|做一个|做一版)/,
  /(任务|项目|方案|计划|审批|review|审核|执行|推进)/i,
];

const HIGH_RISK_PATTERNS = [
  /(审批|批准|确认执行|对外发送|群发|发布|删|删除|覆盖|修改正式|重启|上线)/,
  /(高风险|敏感|外部|生产|正式)/,
];

function compactWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function deriveTitle(text: string): string {
  const compact = compactWhitespace(text);
  return compact.length > 72 ? `${compact.slice(0, 69)}...` : compact;
}

export function classifyFeishuGovernanceMessage(text: string): FeishuGovernanceRoute {
  const compact = compactWhitespace(text);
  if (!compact) {
    return { mode: "reply-only", reason: "chat" };
  }
  const highRisk = HIGH_RISK_PATTERNS.some((pattern) => pattern.test(compact));
  const explicitTask = EXPLICIT_TASK_PATTERNS.some((pattern) => pattern.test(compact));

  if (!explicitTask && compact.length < 48 && /[?？]$/.test(compact)) {
    return { mode: "reply-only", reason: "question" };
  }
  if (!explicitTask && !highRisk) {
    return { mode: "reply-only", reason: "lightweight" };
  }

  return {
    mode: "governed-task",
    reason: highRisk ? "high-risk" : "explicit-request",
    title: deriveTitle(compact),
    riskLevel: highRisk ? "high" : "medium",
    requiresApproval: highRisk,
    intentType: highRisk ? "high-risk-request" : "task-request",
    summary: compact,
  };
}
