import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { GovernedTask, TaskAuditEvent, TasksGetResult, TasksListResult } from "../shared/task-types.js";

const TASKS_DIR = path.join(os.homedir(), ".openclaw", "governance");
const TASKS_FILE = path.join(TASKS_DIR, "tasks.json");

function seedTasks(now = Date.now()): GovernedTask[] {
  return [
    {
      id: "T-1001",
      title: "Design clawOS governed task lifecycle v1",
      sourceChannel: "feishu",
      sourceSessionKey: "main",
      sourceThreadId: null,
      sourceMessageId: null,
      sourceTarget: "chat:demo-feishu",
      sourceAccountId: null,
      intentType: "project-design",
      riskLevel: "medium",
      state: "planned",
      approvalStatus: "not_needed",
      currentOwner: "planner",
      createdAt: now - 1000 * 60 * 90,
      updatedAt: now - 1000 * 60 * 25,
      summary: "Turn inbound work requests into governed tasks with review/approval gates.",
      plan: "1. Define state machine\n2. Define Feishu intake split\n3. Add task board\n4. Add approval queue",
      reviewerNote: null,
      labels: ["governance", "agent-os"],
      artifacts: [{ kind: "doc", title: "Kernel v1 outline" }],
      auditEvents: [
        {
          id: "evt-1",
          at: now - 1000 * 60 * 90,
          actorKind: "human",
          actorId: "founder",
          type: "task.created",
          summary: "Task opened from a formal product direction request.",
        },
        {
          id: "evt-2",
          at: now - 1000 * 60 * 60,
          actorKind: "system",
          actorId: "intake",
          type: "task.classified",
          summary: "Classified as governed project-design work.",
        },
        {
          id: "evt-3",
          at: now - 1000 * 60 * 25,
          actorKind: "agent",
          actorId: "planner",
          type: "plan.created",
          summary: "Drafted first implementation plan and backlog slice.",
        },
      ],
    },
    {
      id: "T-1002",
      title: "Feishu approval entry for high-risk tasks",
      sourceChannel: "feishu",
      sourceSessionKey: "main",
      sourceThreadId: null,
      sourceMessageId: null,
      sourceTarget: "chat:demo-feishu",
      sourceAccountId: null,
      intentType: "workflow",
      riskLevel: "high",
      state: "awaiting_human",
      approvalStatus: "pending",
      currentOwner: "reviewer",
      createdAt: now - 1000 * 60 * 45,
      updatedAt: now - 1000 * 60 * 10,
      summary: "Only high-risk external actions should pause for human approval in Feishu.",
      plan: "Add approval request object, expose to control UI, send compact Feishu action card later.",
      reviewerNote: "Needs explicit human gate for external send / destructive write / high-cost execution.",
      labels: ["feishu", "approval", "p0"],
      artifacts: [],
      auditEvents: [
        {
          id: "evt-4",
          at: now - 1000 * 60 * 45,
          actorKind: "human",
          actorId: "founder",
          type: "task.created",
          summary: "Approval workflow requested for risky tasks.",
        },
        {
          id: "evt-5",
          at: now - 1000 * 60 * 10,
          actorKind: "agent",
          actorId: "reviewer",
          type: "approval.requested",
          summary: "Escalated to human because task contains high-risk write actions.",
        },
      ],
    },
    {
      id: "T-1003",
      title: "Task board view in control UI",
      sourceChannel: "webchat",
      sourceSessionKey: "main",
      sourceThreadId: null,
      sourceMessageId: null,
      sourceTarget: null,
      sourceAccountId: null,
      intentType: "ui",
      riskLevel: "low",
      state: "running",
      approvalStatus: "not_needed",
      currentOwner: "dispatcher",
      createdAt: now - 1000 * 60 * 20,
      updatedAt: now - 1000 * 60 * 5,
      summary: "Expose governed tasks next to Sessions/Cron in the control UI.",
      plan: "Add Tasks tab, board table, side detail timeline.",
      reviewerNote: null,
      labels: ["ui", "dashboard"],
      artifacts: [],
      auditEvents: [
        {
          id: "evt-6",
          at: now - 1000 * 60 * 18,
          actorKind: "agent",
          actorId: "reviewer",
          type: "review.approved",
          summary: "UI slice approved for implementation.",
        },
        {
          id: "evt-7",
          at: now - 1000 * 60 * 16,
          actorKind: "system",
          actorId: "dispatcher",
          type: "task.dispatched",
          summary: "Assigned to control-ui workstream.",
        },
        {
          id: "evt-8",
          at: now - 1000 * 60 * 5,
          actorKind: "agent",
          actorId: "executor-ui",
          type: "task.started",
          summary: "Tasks board implementation in progress.",
        },
      ],
    },
  ];
}

function ensureStore(): void {
  if (!fs.existsSync(TASKS_DIR)) {
    fs.mkdirSync(TASKS_DIR, { recursive: true });
  }
  if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify({ tasks: seedTasks() }, null, 2));
  }
}

function compareTasks(a: GovernedTask, b: GovernedTask): number {
  return b.updatedAt - a.updatedAt;
}

export function resolveGovernanceTasksPath(): string {
  ensureStore();
  return TASKS_FILE;
}

export function loadGovernedTasks(): GovernedTask[] {
  ensureStore();
  const raw = fs.readFileSync(TASKS_FILE, "utf8");
  const parsed = JSON.parse(raw) as { tasks?: GovernedTask[] };
  return Array.isArray(parsed.tasks) ? [...parsed.tasks].sort(compareTasks) : [];
}

export function listGovernedTasks(params?: {
  states?: string[];
  riskLevels?: string[];
  query?: string;
  limit?: number;
}): TasksListResult {
  const all = loadGovernedTasks();
  const states = new Set((params?.states ?? []).map((value) => value.trim()).filter(Boolean));
  const riskLevels = new Set((params?.riskLevels ?? []).map((value) => value.trim()).filter(Boolean));
  const query = params?.query?.trim().toLowerCase() ?? "";
  let filtered = all.filter((task) => {
    if (states.size > 0 && !states.has(task.state)) {
      return false;
    }
    if (riskLevels.size > 0 && !riskLevels.has(task.riskLevel)) {
      return false;
    }
    if (!query) {
      return true;
    }
    return [task.id, task.title, task.summary ?? "", task.currentOwner, ...(task.labels ?? [])]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
  const limit = typeof params?.limit === "number" && params.limit > 0 ? params.limit : 100;
  filtered = filtered.slice(0, limit);
  return {
    path: TASKS_FILE,
    tasks: filtered,
    total: filtered.length,
    generatedAt: Date.now(),
  };
}

export function getGovernedTask(taskId: string): TasksGetResult {
  const tasks = loadGovernedTasks();
  const normalized = taskId.trim();
  return {
    path: TASKS_FILE,
    task: tasks.find((task) => task.id === normalized) ?? null,
    generatedAt: Date.now(),
  };
}

function saveGovernedTasks(tasks: GovernedTask[]): void {
  ensureStore();
  fs.writeFileSync(TASKS_FILE, JSON.stringify({ tasks: [...tasks].sort(compareTasks) }, null, 2));
}

export function createGovernedTask(input: {
  title: string;
  sourceChannel: string;
  sourceSessionKey?: string | null;
  sourceThreadId?: string | null;
  sourceMessageId?: string | null;
  sourceTarget?: string | null;
  sourceAccountId?: string | null;
  intentType: string;
  riskLevel: GovernedTask["riskLevel"];
  summary?: string | null;
  plan?: string | null;
  reviewerNote?: string | null;
  labels?: string[];
  currentOwner?: string;
  state?: GovernedTask["state"];
  approvalStatus?: GovernedTask["approvalStatus"];
  auditEvents?: TaskAuditEvent[];
}): GovernedTask {
  const tasks = loadGovernedTasks();
  const now = Date.now();
  const numericIds = tasks
    .map((task) => Number(task.id.replace(/^T-/, "")))
    .filter((value) => Number.isFinite(value));
  const nextId = `T-${String((numericIds.length ? Math.max(...numericIds) : 1000) + 1)}`;
  const created: GovernedTask = {
    id: nextId,
    title: input.title.trim(),
    sourceChannel: input.sourceChannel.trim(),
    sourceSessionKey: input.sourceSessionKey ?? null,
    sourceThreadId: input.sourceThreadId ?? null,
    sourceMessageId: input.sourceMessageId ?? null,
    sourceTarget: input.sourceTarget ?? null,
    sourceAccountId: input.sourceAccountId ?? null,
    intentType: input.intentType.trim(),
    riskLevel: input.riskLevel,
    state: input.state ?? (input.approvalStatus === "pending" ? "awaiting_human" : "new"),
    approvalStatus: input.approvalStatus ?? "not_needed",
    currentOwner: input.currentOwner ?? (input.approvalStatus === "pending" ? "reviewer" : "intake"),
    createdAt: now,
    updatedAt: now,
    summary: input.summary ?? null,
    plan: input.plan ?? null,
    reviewerNote: input.reviewerNote ?? null,
    labels: input.labels ?? [],
    artifacts: [],
    auditEvents: input.auditEvents ?? [
      {
        id: randomUUID(),
        at: now,
        actorKind: "system",
        actorId: "intake",
        type: "task.created",
        summary: "Task created from inbound governance intake.",
      },
    ],
  };
  tasks.push(created);
  saveGovernedTasks(tasks);
  return created;
}

export function updateGovernedTask(input: {
  taskId: string;
  patch: Partial<
    Pick<
      GovernedTask,
      | "title"
      | "summary"
      | "plan"
      | "reviewerNote"
      | "riskLevel"
      | "state"
      | "approvalStatus"
      | "currentOwner"
      | "labels"
      | "artifacts"
    >
  >;
  auditEvent?: TaskAuditEvent;
}): GovernedTask | null {
  const tasks = loadGovernedTasks();
  const index = tasks.findIndex((task) => task.id === input.taskId.trim());
  if (index < 0) {
    return null;
  }
  const current = tasks[index] as GovernedTask;
  const updated: GovernedTask = {
    ...current,
    ...input.patch,
    updatedAt: Date.now(),
    auditEvents: input.auditEvent ? [...current.auditEvents, input.auditEvent] : current.auditEvents,
  };
  tasks[index] = updated;
  saveGovernedTasks(tasks);
  return updated;
}

export function approveGovernedTask(input: {
  taskId: string;
  note?: string;
  actorId?: string;
}): GovernedTask | null {
  return updateGovernedTask({
    taskId: input.taskId,
    patch: {
      approvalStatus: "approved",
      state: "approved",
      currentOwner: "dispatcher",
    },
    auditEvent: {
      id: randomUUID(),
      at: Date.now(),
      actorKind: "human",
      actorId: input.actorId?.trim() || "operator",
      type: "approval.granted",
      summary: input.note?.trim() || "Task approved from control UI.",
    },
  });
}

export function rejectGovernedTask(input: {
  taskId: string;
  note?: string;
  actorId?: string;
}): GovernedTask | null {
  return updateGovernedTask({
    taskId: input.taskId,
    patch: {
      approvalStatus: "rejected",
      state: "planned",
      currentOwner: "planner",
    },
    auditEvent: {
      id: randomUUID(),
      at: Date.now(),
      actorKind: "human",
      actorId: input.actorId?.trim() || "operator",
      type: "approval.rejected",
      summary: input.note?.trim() || "Task rejected and returned for revision.",
    },
  });
}
