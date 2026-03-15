import { html, nothing } from "lit";
import type { ThemePack, ThemePackId } from "../../../src/themes/types.js";
import { formatRelativeTimestamp } from "../format.ts";
import type { GovernedTask, TasksGetResult, TasksListResult } from "../types.ts";

export type TasksProps = {
  themePack: ThemePack;
  themePackId: ThemePackId;
  loading: boolean;
  result: TasksListResult | null;
  error: string | null;
  query: string;
  selectedId: string | null;
  detailLoading: boolean;
  detail: TasksGetResult | null;
  decisionBusy?: boolean;
  onQueryChange: (next: string) => void;
  onThemeChange: (next: ThemePackId) => void;
  onRefresh: () => void;
  onSelect: (taskId: string) => void;
  onApprove: (taskId: string) => void;
  onReject: (taskId: string) => void;
};

function renderRiskPill(task: GovernedTask) {
  return html`<span class="pill ${task.riskLevel === "high" ? "danger" : task.riskLevel === "medium" ? "warn" : "ok"}">${task.riskLevel}</span>`;
}

function roleDisplay(themePack: ThemePack, owner: string) {
  const map: Record<string, keyof ThemePack["roles"]> = {
    governor: "governor",
    planner: "planner",
    reviewer: "reviewer",
    dispatcher: "dispatcher",
    executor_fast: "executor_fast",
    executor_heavy: "executor_heavy",
    observer: "observer",
    treasury: "treasury",
    auditor: "auditor",
  };
  const key = map[owner];
  return key ? themePack.roles[key].label : owner;
}

function stateDisplay(themePack: ThemePack, state: GovernedTask["state"]) {
  const aliases: Partial<Record<GovernedTask["state"], string>> = {
    awaiting_human: themePack.states.awaiting_human,
    approved: themePack.states.approved,
    blocked: themePack.states.blocked,
    completed: themePack.states.completed,
    planned: themePack.states.planned,
  };
  return aliases[state] ?? state;
}

function renderStatePill(task: GovernedTask, themePack: ThemePack) {
  const tone =
    task.state === "completed"
      ? "ok"
      : task.state === "blocked" || task.state === "cancelled"
        ? "danger"
        : task.state === "awaiting_human"
          ? "warn"
          : "";
  return html`<span class="pill ${tone}" style="border-color: ${themePack.uiTokens.accent};">${stateDisplay(themePack, task.state)}</span>`;
}

function renderTaskRow(
  task: GovernedTask,
  themePack: ThemePack,
  selectedId: string | null,
  onSelect: (taskId: string) => void,
) {
  const selected = task.id === selectedId;
  return html`
    <button class="list-item ${selected ? "active" : ""}" @click=${() => onSelect(task.id)}>
      <div class="row" style="justify-content: space-between; align-items: flex-start; gap: 10px;">
        <div>
          <div class="mono" style="font-size: 12px;">${task.id}</div>
          <div style="font-weight: 600; margin-top: 4px;">${task.title}</div>
        </div>
        <div>${renderRiskPill(task)}</div>
      </div>
      <div class="muted" style="margin-top: 8px; font-size: 12px;">${task.sourceChannel} · ${roleDisplay(themePack, task.currentOwner)}</div>
      <div class="row" style="margin-top: 8px; gap: 8px; flex-wrap: wrap;">
        ${renderStatePill(task, themePack)}
        <span class="pill">approval: ${task.approvalStatus}</span>
      </div>
      ${task.summary ? html`<div class="muted" style="margin-top: 10px;">${task.summary}</div>` : nothing}
    </button>
  `;
}

function renderDetail(
  detail: TasksGetResult | null,
  themePack: ThemePack,
  loading: boolean,
  decisionBusy: boolean | undefined,
  onApprove: (taskId: string) => void,
  onReject: (taskId: string) => void,
) {
  if (loading) {
    return html`<section class="card"><div class="muted">Loading task detail…</div></section>`;
  }
  const task = detail?.task;
  if (!task) {
    return html`<section class="card"><div class="muted">Select a governed task to inspect its lifecycle.</div></section>`;
  }
  return html`
    <section class="card">
      <div class="row" style="justify-content: space-between; align-items: flex-start; gap: 16px;">
        <div>
          <div class="mono">${task.id}</div>
          <div class="card-title" style="margin-top: 8px;">${task.title}</div>
          <div class="card-sub" style="margin-top: 6px;">${task.sourceChannel} · owner ${roleDisplay(themePack, task.currentOwner)}</div>
        </div>
        <div>
          <div class="row" style="gap: 8px; flex-wrap: wrap; justify-content: flex-end;">
            ${renderRiskPill(task)}
            ${renderStatePill(task, themePack)}
            <span class="pill">approval: ${task.approvalStatus}</span>
          </div>
          ${
            task.state === "awaiting_human"
              ? html`<div class="row" style="gap: 8px; margin-top: 10px; justify-content: flex-end;">
                  <button class="btn primary" ?disabled=${decisionBusy} @click=${() => onApprove(task.id)}>
                    ${decisionBusy ? "Working…" : "Approve"}
                  </button>
                  <button class="btn" ?disabled=${decisionBusy} @click=${() => onReject(task.id)}>
                    Reject
                  </button>
                </div>`
              : nothing
          }
        </div>
      </div>

      ${task.summary ? html`<div style="margin-top: 16px;">${task.summary}</div>` : nothing}

      <div class="grid grid-cols-2" style="margin-top: 18px; gap: 12px;">
        <div>
          <div class="card-sub">Plan</div>
          <pre class="code-block" style="white-space: pre-wrap; margin-top: 8px;">${task.plan ?? "No structured plan yet."}</pre>
        </div>
        <div>
          <div class="card-sub">Review note</div>
          <pre class="code-block" style="white-space: pre-wrap; margin-top: 8px;">${task.reviewerNote ?? "No reviewer note."}</pre>
        </div>
      </div>

      <div style="margin-top: 18px;">
        <div class="card-sub">Timeline</div>
        <div class="table" style="margin-top: 10px;">
          <div class="table-head">
            <div>When</div>
            <div>Actor</div>
            <div>Event</div>
            <div>Summary</div>
          </div>
          ${task.auditEvents.map(
            (event) => html`
              <div class="table-row">
                <div>${formatRelativeTimestamp(event.at)}</div>
                <div>${event.actorKind}:${event.actorId}</div>
                <div class="mono">${event.type}</div>
                <div>${event.summary}</div>
              </div>
            `,
          )}
        </div>
      </div>
    </section>
  `;
}

export function renderTasks(props: TasksProps) {
  const tasks = props.result?.tasks ?? [];
  const approvalQueue = tasks.filter((task) => task.state === "awaiting_human");
  return html`
    <section class="grid grid-cols-2" style="align-items: start;">
      <section>
        <section class="card">
        <div class="row" style="justify-content: space-between;">
          <div>
            <div class="card-title">${props.themePack.panelCopy.tasksTitle}</div>
            <div class="card-sub">${props.themePack.panelCopy.tasksSubtitle}</div>
          </div>
          <div class="row" style="gap: 8px; align-items: center;">
            <label class="field" style="min-width: 180px; margin: 0;">
              <span>Theme Pack</span>
              <select .value=${props.themePackId} @change=${(e: Event) => props.onThemeChange((e.target as HTMLSelectElement).value as ThemePackId)}>
                <option value="default">Default</option>
                <option value="celestial-court">Celestial Court</option>
              </select>
            </label>
            <button class="btn" ?disabled=${props.loading} @click=${props.onRefresh}>
              ${props.loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>

        <label class="field" style="margin-top: 14px;">
          <span>Search</span>
          <input .value=${props.query} @input=${(e: Event) => props.onQueryChange((e.target as HTMLInputElement).value)} placeholder="task id / title / label" />
        </label>

        ${props.error ? html`<div class="callout danger" style="margin-top: 12px;">${props.error}</div>` : nothing}
        <div class="muted" style="margin-top: 12px;">${props.result ? `Store: ${props.result.path}` : ""}</div>

        <div style="margin-top: 14px; display: grid; gap: 10px;">
          ${tasks.length === 0
            ? html`<div class="muted">No governed tasks yet.</div>`
            : tasks.map((task) => renderTaskRow(task, props.themePack, props.selectedId, props.onSelect))}
        </div>
        </section>

        <section class="card" style="margin-top: 14px;">
          <div class="card-title">${props.themePack.panelCopy.approvalQueueTitle}</div>
          <div class="card-sub">${props.themePack.panelCopy.approvalQueueSubtitle}</div>
          <div style="margin-top: 12px; display: grid; gap: 10px;">
            ${approvalQueue.length === 0
              ? html`<div class="muted">No tasks are in ${props.themePack.states.awaiting_human.toLowerCase()} right now.</div>`
              : approvalQueue.map(
                  (task) => html`
                    <div class="list-item">
                      <div class="row" style="justify-content: space-between; align-items: flex-start; gap: 12px;">
                        <button class="btn" @click=${() => props.onSelect(task.id)}>
                          <span class="mono">${task.id}</span>
                        </button>
                        ${renderRiskPill(task)}
                      </div>
                      <div style="font-weight: 600; margin-top: 8px;">${task.title}</div>
                      <div class="muted" style="margin-top: 8px;">owner ${roleDisplay(props.themePack, task.currentOwner)} · approval ${task.approvalStatus}</div>
                      <div class="row" style="gap: 8px; margin-top: 10px;">
                        <button class="btn primary" ?disabled=${props.decisionBusy} @click=${() => props.onApprove(task.id)}>
                          ${props.decisionBusy ? "Working…" : "Approve"}
                        </button>
                        <button class="btn" ?disabled=${props.decisionBusy} @click=${() => props.onReject(task.id)}>
                          Reject
                        </button>
                      </div>
                    </div>
                  `,
                )}
          </div>
        </section>
      </section>

      ${renderDetail(props.detail, props.themePack, props.detailLoading, props.decisionBusy, props.onApprove, props.onReject)}
    </section>
  `;
}
