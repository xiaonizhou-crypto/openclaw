import type { GatewayBrowserClient } from "../gateway.ts";
import type { TasksGetResult, TasksListResult } from "../types.ts";

export type TasksState = {
  client: GatewayBrowserClient | null;
  connected: boolean;
  tasksLoading: boolean;
  tasksResult: TasksListResult | null;
  tasksError: string | null;
  tasksQuery: string;
  tasksSelectedId: string | null;
  taskDetailLoading: boolean;
  taskDetail: TasksGetResult | null;
  tasksDecisionBusy?: boolean;
};

export async function loadTasks(state: TasksState) {
  if (!state.client || !state.connected || state.tasksLoading) {
    return;
  }
  state.tasksLoading = true;
  state.tasksError = null;
  try {
    const res = await state.client.request<TasksListResult>("tasks.list", {
      query: state.tasksQuery || undefined,
      limit: 100,
    });
    state.tasksResult = res;
    const selectedId =
      state.tasksSelectedId && res.tasks.some((task) => task.id === state.tasksSelectedId)
        ? state.tasksSelectedId
        : (res.tasks[0]?.id ?? null);
    state.tasksSelectedId = selectedId;
    if (selectedId) {
      await loadTaskDetail(state, selectedId);
    } else {
      state.taskDetail = null;
    }
  } catch (err) {
    state.tasksError = String(err);
  } finally {
    state.tasksLoading = false;
  }
}

export async function loadTaskDetail(state: TasksState, taskId?: string | null) {
  const nextId = taskId ?? state.tasksSelectedId;
  if (!state.client || !state.connected || !nextId) {
    state.taskDetail = null;
    state.tasksSelectedId = nextId ?? null;
    return;
  }
  state.taskDetailLoading = true;
  state.tasksSelectedId = nextId;
  try {
    state.taskDetail = await state.client.request<TasksGetResult>("tasks.get", { taskId: nextId });
  } catch (err) {
    state.tasksError = String(err);
  } finally {
    state.taskDetailLoading = false;
  }
}

async function decideTask(state: TasksState, method: "tasks.approve" | "tasks.reject", taskId: string, note?: string) {
  if (!state.client || !state.connected || state.tasksDecisionBusy) {
    return;
  }
  state.tasksDecisionBusy = true;
  state.tasksError = null;
  try {
    await state.client.request(method, { taskId, note });
    const currentQuery = state.tasksQuery;
    state.tasksQuery = "";
    await loadTasks(state);
    state.tasksQuery = currentQuery;
    await loadTasks(state);
    const stillExists = state.tasksResult?.tasks.some((task) => task.id === taskId) ?? false;
    if (stillExists) {
      await loadTaskDetail(state, taskId);
    } else {
      state.taskDetail = null;
      state.tasksSelectedId = state.tasksResult?.tasks[0]?.id ?? null;
      if (state.tasksSelectedId) {
        await loadTaskDetail(state, state.tasksSelectedId);
      }
    }
  } catch (err) {
    state.tasksError = String(err);
  } finally {
    state.tasksDecisionBusy = false;
  }
}

export async function approveTask(state: TasksState, taskId: string, note?: string) {
  await decideTask(state, "tasks.approve", taskId, note);
}

export async function rejectTask(state: TasksState, taskId: string, note?: string) {
  await decideTask(state, "tasks.reject", taskId, note);
}
