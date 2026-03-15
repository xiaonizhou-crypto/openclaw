import { randomUUID } from "node:crypto";
import {
  ErrorCodes,
  errorShape,
  formatValidationErrors,
  validateTasksCreateParams,
  validateTasksGetParams,
  validateTasksListParams,
  validateTasksUpdateParams,
} from "../protocol/index.js";
import { createGovernedTask, getGovernedTask, listGovernedTasks, updateGovernedTask } from "../../tasks/store.js";
import type { GatewayRequestHandlers } from "./types.js";

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
};
