import { randomUUID } from "node:crypto";
import { loadConfig } from "../../config/config.js";
import {
  ErrorCodes,
  errorShape,
  formatValidationErrors,
  validateTasksCreateParams,
  validateTasksDecisionParams,
  validateTasksGetParams,
  validateTasksListParams,
  validateTasksUpdateParams,
} from "../protocol/index.js";
import {
  approveGovernedTask,
  createGovernedTask,
  getGovernedTask,
  listGovernedTasks,
  rejectGovernedTask,
  updateGovernedTask,
} from "../../tasks/store.js";
import { sendMessageFeishu } from "../../../extensions/feishu/src/send.js";
import type { GatewayRequestHandlers } from "./types.js";

async function maybeNotifyFeishuTaskDecision(params: {
  task: ReturnType<typeof getGovernedTask>["task"];
  action: "approved" | "rejected";
}) {
  const task = params.task;
  if (!task || task.sourceChannel !== "feishu" || !task.sourceTarget?.trim()) {
    return;
  }
  try {
    await sendMessageFeishu({
      cfg: loadConfig(),
      to: task.sourceTarget,
      accountId: task.sourceAccountId ?? undefined,
      replyToMessageId: task.sourceMessageId ?? undefined,
      replyInThread: Boolean(task.sourceThreadId),
      text:
        params.action === "approved"
          ? `治理任务 ${task.id} 已批准。\n当前状态：${task.state}\n当前负责人：${task.currentOwner}`
          : `治理任务 ${task.id} 已打回。\n当前状态：${task.state}\n当前负责人：${task.currentOwner}`,
    });
  } catch {
    // Keep approval path non-blocking even if notification delivery fails.
  }
}

export const tasksHandlers: GatewayRequestHandlers = {
  "tasks.list": ({ params, respond }) => {
    if (!validateTasksListParams(params)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.INVALID_REQUEST,
          `invalid tasks.list params: ${formatValidationErrors(validateTasksListParams.errors)}`,
        ),
      );
      return;
    }
    const p = params as { limit?: number; query?: string; states?: string[]; riskLevels?: string[] };
    respond(
      true,
      listGovernedTasks({
        limit: p.limit,
        query: p.query,
        states: p.states,
        riskLevels: p.riskLevels,
      }),
      undefined,
    );
  },
  "tasks.get": ({ params, respond }) => {
    if (!validateTasksGetParams(params)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.INVALID_REQUEST,
          `invalid tasks.get params: ${formatValidationErrors(validateTasksGetParams.errors)}`,
        ),
      );
      return;
    }
    const p = params as { taskId: string };
    respond(true, getGovernedTask(p.taskId), undefined);
  },
  "tasks.create": ({ params, respond }) => {
    if (!validateTasksCreateParams(params)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.INVALID_REQUEST,
          `invalid tasks.create params: ${formatValidationErrors(validateTasksCreateParams.errors)}`,
        ),
      );
      return;
    }
    const p = params as Parameters<typeof createGovernedTask>[0];
    respond(true, createGovernedTask(p), undefined);
  },
  "tasks.update": ({ params, respond }) => {
    if (!validateTasksUpdateParams(params)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.INVALID_REQUEST,
          `invalid tasks.update params: ${formatValidationErrors(validateTasksUpdateParams.errors)}`,
        ),
      );
      return;
    }
    const p = params as {
      taskId: string;
      patch: Parameters<typeof updateGovernedTask>[0]["patch"];
      auditSummary?: string;
    };
    const updated = updateGovernedTask({
      taskId: p.taskId,
      patch: p.patch,
      auditEvent: p.auditSummary
        ? {
            id: randomUUID(),
            at: Date.now(),
            actorKind: "system",
            actorId: "gateway",
            type: "task.started",
            summary: p.auditSummary,
          }
        : undefined,
    });
    if (!updated) {
      respond(false, undefined, errorShape(ErrorCodes.NOT_FOUND, `task not found: ${p.taskId}`));
      return;
    }
    respond(true, updated, undefined);
  },
  "tasks.approve": async ({ params, respond }) => {
    if (!validateTasksDecisionParams(params)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.INVALID_REQUEST,
          `invalid tasks.approve params: ${formatValidationErrors(validateTasksDecisionParams.errors)}`,
        ),
      );
      return;
    }
    const p = params as { taskId: string; note?: string };
    const updated = approveGovernedTask({ taskId: p.taskId, note: p.note, actorId: "control-ui" });
    if (!updated) {
      respond(false, undefined, errorShape(ErrorCodes.NOT_FOUND, `task not found: ${p.taskId}`));
      return;
    }
    await maybeNotifyFeishuTaskDecision({ task: updated, action: "approved" });
    respond(true, updated, undefined);
  },
  "tasks.reject": async ({ params, respond }) => {
    if (!validateTasksDecisionParams(params)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.INVALID_REQUEST,
          `invalid tasks.reject params: ${formatValidationErrors(validateTasksDecisionParams.errors)}`,
        ),
      );
      return;
    }
    const p = params as { taskId: string; note?: string };
    const updated = rejectGovernedTask({ taskId: p.taskId, note: p.note, actorId: "control-ui" });
    if (!updated) {
      respond(false, undefined, errorShape(ErrorCodes.NOT_FOUND, `task not found: ${p.taskId}`));
      return;
    }
    await maybeNotifyFeishuTaskDecision({ task: updated, action: "rejected" });
    respond(true, updated, undefined);
  },
};
