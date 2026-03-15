# Governed Task v1 Demo Snapshot

This is the current demo snapshot for the first governed-task loop inside clawOS/OpenClaw.

## What this snapshot includes

- Feishu inbound split:
  - `reply-only`
  - `governed-task`
- Governed task creation from Feishu inbound
- Control UI `Tasks` tab
- Approval Queue in the existing `Tasks` page
- Control UI approve / reject actions
- Real state transitions:
  - `awaiting_human -> approved`
  - `awaiting_human -> planned`
- Feishu text notification after approve / reject
- Task audit timeline entries for:
  - `approval.granted`
  - `approval.rejected`
  - `feishu.notified`
  - `feishu.notify_failed`

## Current minimum demo path

1. Send a high-risk task request in Feishu.
2. The message is classified into `governed-task`.
3. A governed task is created.
4. The task appears in the Control UI `Tasks` tab.
5. If it is high-risk, it appears in `Approval Queue`.
6. In Control UI, click `Approve` or `Reject`.
7. The task state changes immediately.
8. The original Feishu conversation receives a short status message.
9. The task detail timeline shows both the approval event and the Feishu notification outcome.

## Known not-yet-done items

- No real dispatcher runtime handoff
- No executor auto-run
- No planner auto re-plan after reject
- No Feishu-side approve/reject commands
- No advanced classifier
- Theme pack UI integration is intentionally minimal and only exists in governed-task UI (`default` + `celestial-court`)
- No new pages beyond the current `Tasks` page
- No fully verified local build in this environment yet

## Dependencies / prerequisites

- Feishu channel already connected and receiving messages
- Control UI available and opening the `Tasks` tab
- Local governance store writable:
  - `~/.openclaw/governance/tasks.json`
- A local development environment with project dependencies installed if you want full build verification

## Important architectural constraint

This governed-task kernel stays neutral.

Do not move worldview / theme logic into:

- state machine
- approval rules
- dispatch rules
- Feishu intake rules
- task lifecycle logic

Future worldviews must be theme packs only.
