import { Static, Type } from "@sinclair/typebox";
import { NonEmptyString } from "./primitives.js";

export const TaskRiskLevelSchema = Type.Union([
  Type.Literal("low"),
  Type.Literal("medium"),
  Type.Literal("high"),
]);

export const TaskApprovalStatusSchema = Type.Union([
  Type.Literal("not_needed"),
  Type.Literal("pending"),
  Type.Literal("approved"),
  Type.Literal("rejected"),
]);

export const TaskStateSchema = Type.Union([
  Type.Literal("new"),
  Type.Literal("triaged"),
  Type.Literal("planned"),
  Type.Literal("in_review"),
  Type.Literal("awaiting_human"),
  Type.Literal("approved"),
  Type.Literal("dispatched"),
  Type.Literal("running"),
  Type.Literal("blocked"),
  Type.Literal("completed"),
  Type.Literal("cancelled"),
]);

export const TaskAuditEventSchema = Type.Object(
  {
    id: NonEmptyString,
    at: Type.Integer(),
    actorKind: Type.Union([Type.Literal("system"), Type.Literal("agent"), Type.Literal("human")]),
    actorId: NonEmptyString,
    type: Type.Union([
      Type.Literal("task.created"),
      Type.Literal("task.classified"),
      Type.Literal("plan.created"),
      Type.Literal("review.requested"),
      Type.Literal("review.approved"),
      Type.Literal("review.rejected"),
      Type.Literal("approval.requested"),
      Type.Literal("approval.granted"),
      Type.Literal("approval.rejected"),
      Type.Literal("feishu.notified"),
      Type.Literal("feishu.notify_failed"),
      Type.Literal("task.dispatched"),
      Type.Literal("task.started"),
      Type.Literal("task.blocked"),
      Type.Literal("task.completed"),
    ]),
    summary: NonEmptyString,
  },
  { additionalProperties: false },
);

export const GovernedTaskSchema = Type.Object(
  {
    id: NonEmptyString,
    title: NonEmptyString,
    sourceChannel: NonEmptyString,
    sourceSessionKey: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    sourceThreadId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    sourceMessageId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    sourceTarget: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    sourceAccountId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    intentType: NonEmptyString,
    riskLevel: TaskRiskLevelSchema,
    state: TaskStateSchema,
    approvalStatus: TaskApprovalStatusSchema,
    currentOwner: NonEmptyString,
    createdAt: Type.Integer(),
    updatedAt: Type.Integer(),
    summary: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    plan: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    reviewerNote: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    labels: Type.Optional(Type.Array(NonEmptyString)),
    artifacts: Type.Optional(
      Type.Array(
        Type.Object(
          {
            kind: NonEmptyString,
            title: NonEmptyString,
            href: Type.Optional(Type.Union([Type.String(), Type.Null()])),
          },
          { additionalProperties: false },
        ),
      ),
    ),
    auditEvents: Type.Array(TaskAuditEventSchema),
  },
  { additionalProperties: false },
);

export const TasksListParamsSchema = Type.Object(
  {
    limit: Type.Optional(Type.Integer({ minimum: 1 })),
    query: Type.Optional(Type.String()),
    states: Type.Optional(Type.Array(TaskStateSchema)),
    riskLevels: Type.Optional(Type.Array(TaskRiskLevelSchema)),
  },
  { additionalProperties: false },
);

export const TasksGetParamsSchema = Type.Object(
  {
    taskId: NonEmptyString,
  },
  { additionalProperties: false },
);

export const TasksCreateParamsSchema = Type.Object(
  {
    title: NonEmptyString,
    sourceChannel: NonEmptyString,
    sourceSessionKey: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    sourceThreadId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    sourceMessageId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    sourceTarget: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    sourceAccountId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    intentType: NonEmptyString,
    riskLevel: TaskRiskLevelSchema,
    summary: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    plan: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    reviewerNote: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    labels: Type.Optional(Type.Array(NonEmptyString)),
    currentOwner: Type.Optional(NonEmptyString),
    state: Type.Optional(TaskStateSchema),
    approvalStatus: Type.Optional(TaskApprovalStatusSchema),
  },
  { additionalProperties: false },
);

export const TasksUpdateParamsSchema = Type.Object(
  {
    taskId: NonEmptyString,
    patch: Type.Object(
      {
        title: Type.Optional(NonEmptyString),
        summary: Type.Optional(Type.Union([Type.String(), Type.Null()])),
        plan: Type.Optional(Type.Union([Type.String(), Type.Null()])),
        reviewerNote: Type.Optional(Type.Union([Type.String(), Type.Null()])),
        riskLevel: Type.Optional(TaskRiskLevelSchema),
        state: Type.Optional(TaskStateSchema),
        approvalStatus: Type.Optional(TaskApprovalStatusSchema),
        currentOwner: Type.Optional(NonEmptyString),
        labels: Type.Optional(Type.Array(NonEmptyString)),
      },
      { additionalProperties: false },
    ),
    auditSummary: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

export const TasksDecisionParamsSchema = Type.Object(
  {
    taskId: NonEmptyString,
    note: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

export const TasksListResultSchema = Type.Object(
  {
    path: NonEmptyString,
    tasks: Type.Array(GovernedTaskSchema),
    total: Type.Integer({ minimum: 0 }),
    generatedAt: Type.Integer(),
  },
  { additionalProperties: false },
);

export const TasksGetResultSchema = Type.Object(
  {
    path: NonEmptyString,
    task: Type.Union([GovernedTaskSchema, Type.Null()]),
    generatedAt: Type.Integer(),
  },
  { additionalProperties: false },
);

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
export type TaskAuditEvent = Static<typeof TaskAuditEventSchema>;
export type GovernedTask = Static<typeof GovernedTaskSchema>;
export type TasksListParams = Static<typeof TasksListParamsSchema>;
export type TasksGetParams = Static<typeof TasksGetParamsSchema>;
export type TasksCreateParams = Static<typeof TasksCreateParamsSchema>;
export type TasksUpdateParams = Static<typeof TasksUpdateParamsSchema>;
export type TasksDecisionParams = Static<typeof TasksDecisionParamsSchema>;
export type TasksListResult = Static<typeof TasksListResultSchema>;
export type TasksGetResult = Static<typeof TasksGetResultSchema>;
