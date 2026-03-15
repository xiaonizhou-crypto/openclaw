import { html, nothing } from "lit";
import { formatRelativeTimestamp } from "../format.ts";
import type { GovernedTask, TasksGetResult, TasksListResult } from "../types.ts";

export type TasksProps = {
  loading: boolean;
  result: TasksListResult | null;
  error: string | null;
  query: string;
  selectedId: string | null;
  detailLoading: boolean;
  detail: TasksGetResult | null;
  onQueryChange: (next: string) => void;
  onRefresh: () => void;
  onSelect: (taskId: string) => void;
};

function renderRiskPill(task: GovernedTask) {
  return html`<span class="pill ${task.riskLevel === "high" ? "danger" : task.riskLevel === "medium" ? "warn" : "ok"}">${task.riskLevel}</span>`;
}

function renderStatePill(task: GovernedTask) {
  const tone =
    task.state === "completed"
      ? "ok"
      : task.state === "blocked" || task.state === "cancelled"
        ? "danger"
        : task.state === "awaiting_human"
          ? "warn"
          : "";
  return html`<span class="pill ${tone}">${task.state}</span>`;
}

function renderTaskRow(task: GovernedTask, selectedId: string | null, onSelect: (taskId: string) => void) {
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
      <div class="muted" style="margin-top: 8px; font-size: 12px;">${task.sourceChannel} · ${task.currentOwner}</div>
      <div class="row" style="margin-top: 8px; gap: 8px; flex-wrap: wrap;">
        ${renderStatePill(task)}
        <span class="pill">approval: ${task.approvalStatus}</span>
      </div>
      ${task.summary ? html`<div class="muted" style="margin-top: 10px;">${task.summary}</div>` : nothing}
    </button>
  `;
}

function renderDetail(detail: TasksGetResult | null, loading: boolean) {
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
          <div class="card-sub" style="margin-top: 6px;">${task.sourceChannel} · owner ${task.currentOwner}</div>
        </div>
        <div class="row" style="gap: 8px; flex-wrap: wrap; justify-content: flex-end;">
          ${renderRiskPill(task)}
          ${renderStatePill(task)}
          <span class="pill">approval: ${task.approvalStatus}</span>
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
            <div class="card-title">Governed Tasks</div>
            <div class="card-sub">Task lifecycle objects for the new clawOS governance layer.</div>
          </div>
          <button class="btn" ?disabled=${props.loading} @click=${props.onRefresh}>
            ${props.loading ? "Loading…" : "Refresh"}
          </button>
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
            : tasks.map((task) => renderTaskRow(task, props.selectedId, props.onSelect))}
        </div>
        </section>

        <section class="card" style="margin-top: 14px;">
          <div class="card-title">Approval Queue</div>
          <div class="card-sub">Tasks currently waiting for human approval.</div>
          <div style="margin-top: 12px; display: grid; gap: 10px;">
            ${approvalQueue.length === 0
              ? html`<div class="muted">No tasks are awaiting human approval.</div>`
              : approvalQueue.map(
                  (task) => html`
                    <button class="list-item" @click=${() => props.onSelect(task.id)}>
                      <div class="row" style="justify-content: space-between; align-items: flex-start; gap: 12px;">
                        <div>
                          <div class="mono" style="font-size: 12px;">${task.id}</div>
                          <div style="font-weight: 600; margin-top: 4px;">${task.title}</div>
                        </div>
                        ${renderRiskPill(task)}
                      </div>
                      <div class="muted" style="margin-top: 8px;">owner ${task.currentOwner} · approval ${task.approvalStatus}</div>
                    </button>
                  `,
                )}
          </div>
        </section>
      </section>

      ${renderDetail(props.detail, props.detailLoading)}
    </section>
  `;
}
