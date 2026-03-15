export type TaskRiskLevel = "low" | "medium" | "high";

export type TaskApprovalStatus = "not_needed" | "pending" | "approved" | "rejected";

export type TaskState =
  | "new"
  | "triaged"
  | "planned"
  | "in_review"
  | "awaiting_human"
  | "approved"
  | "dispatched"
  | "running"
  | "blocked"
  | "completed"
  | "cancelled";

export type TaskActorKind = "system" | "agent" | "human";

export type TaskAuditEvent = {
  id: string;
  at: number;
  actorKind: TaskActorKind;
  actorId: string;
  type:
    | "task.created"
    | "task.classified"
    | "plan.created"
    | "review.requested"
    | "review.approved"
    | "review.rejected"
    | "approval.requested"
    | "approval.granted"
    | "approval.rejected"
    | "feishu.notified"
    | "feishu.notify_failed"
    | "task.dispatched"
    | "task.started"
    | "task.blocked"
    | "task.completed";
  summary: string;
};

export type GovernedTask = {
  id: string;
  title: string;
  sourceChannel: string;
  sourceSessionKey?: string | null;
  sourceThreadId?: string | null;
  sourceMessageId?: string | null;
  sourceTarget?: string | null;
  sourceAccountId?: string | null;
  intentType: string;
  riskLevel: TaskRiskLevel;
  state: TaskState;
  approvalStatus: TaskApprovalStatus;
  currentOwner: string;
  createdAt: number;
  updatedAt: number;
  summary?: string | null;
  plan?: string | null;
  reviewerNote?: string | null;
  labels?: string[];
  artifacts?: Array<{ kind: string; title: string; href?: string | null }>;
  auditEvents: TaskAuditEvent[];
};

export type TasksListResult = {
  path: string;
  tasks: GovernedTask[];
  total: number;
  generatedAt: number;
};

export type TasksGetResult = {
  path: string;
  task: GovernedTask | null;
  generatedAt: number;
};
