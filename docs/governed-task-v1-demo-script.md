# Governed Task v1 Demo Script

Use this to demo the current snapshot without expanding scope.

## A. Push-before-demo check

1. Confirm current branch is clean.
2. Confirm latest snapshot commits exist:
   - `f985db5`
   - `fdaaf94`
   - `cef188b`
   - `9636c8a`
   - `24f6bb3`
3. Confirm Feishu is connected.
4. Confirm Control UI opens normally.
5. Confirm `Tasks` tab is visible.

## B. Suggested demo message in Feishu

Send a message that clearly triggers governed-task + approval.

Example:

> 帮我推进这个正式任务，并在执行前提醒我审批，后续准备对外发送。

This should hit the current minimal classifier and create a high-risk governed task.

## C. What to show live

### Step 1 — Feishu inbound
Show that the message arrives in Feishu and receives a short acknowledgement.

Expected result:
- a governed task is created
- the task id is returned in a short text reply

### Step 2 — Tasks tab
Open Control UI → `Tasks`.

Show:
- the new task in the task board
- the task state is `awaiting_human`
- the task approval status is `pending`
- the task also appears in `Approval Queue`

### Step 3 — Task detail
Click into the task.

Show in timeline:
- `task.created`
- intake classification event
- `approval.requested` when applicable

### Step 4 — Approve path
Click `Approve`.

Expected result:
- approval queue entry disappears
- task board refreshes
- detail refreshes
- state becomes `approved`
- current owner becomes `dispatcher`
- timeline shows `approval.granted`
- Feishu gets a text notification
- timeline then shows `feishu.notified` (or `feishu.notify_failed` if delivery fails)

### Step 5 — Reject path (second run)
Repeat with another high-risk task and click `Reject`.

Expected result:
- approval queue entry disappears
- state becomes `planned`
- current owner becomes `planner`
- timeline shows `approval.rejected`
- Feishu gets a text notification
- timeline then shows `feishu.notified` or `feishu.notify_failed`

## D. What to say explicitly during demo

- This is a neutral governed-task kernel, not a theme-specific workflow.
- The current demo closes the loop from Feishu inbound to approval decision and back to Feishu notification.
- Runtime execution, planner automation, and theme packs are intentionally not part of this snapshot.

## E. Push checklist

### 1. Remote setup
If this repo is not yet linked to your personal GitHub repo:

```bash
git remote -v
git remote add origin <your-personal-repo-url>
# or update existing
git remote set-url origin <your-personal-repo-url>
```

### 2. Pre-push checks to run locally
Run these on a machine with dependencies installed:

```bash
git status
pnpm install
pnpm build
pnpm ui:build
```

If your project uses a different standard check flow, use that instead.

### 3. Feishu manual verification
- send one lightweight message → confirm reply-only path
- send one high-risk request → confirm governed-task path
- approve once in UI
- reject once in UI
- confirm Feishu notifications arrive
- confirm timeline contains approval + notify outcome events

### 4. Push
```bash
git push -u origin <branch-name>
```

## F. Explicitly out of scope for this snapshot

Do not add before push:

- runtime auto execution
- planner/reviewer/dispatcher automation
- Feishu-side approve/reject commands
- theme pack runtime wiring
- more pages
- advanced classifier logic
