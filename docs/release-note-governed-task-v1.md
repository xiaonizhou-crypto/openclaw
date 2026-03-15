# Governed-task v1 Demo Release Note

## What this repository currently is

This repository is an OpenClaw snapshot that now demonstrates a neutral governed-task kernel on top of the existing control plane.

It is not yet a full multi-agent execution runtime for governed tasks.
It is a **v1 demo snapshot** proving:

- task intake from Feishu
- human approval gate
- task state transition visibility
- audit timeline visibility
- theme-pack-based narrative switching for governed-task UI

## What it can demo today

- Feishu inbound split into `reply-only` vs `governed-task`
- governed task creation from Feishu inbound
- `Tasks` tab in Control UI
- `Approval Queue` in the same page
- approve / reject decisions from Control UI
- state change after approval decision
- Feishu text notification after decision
- audit entries for both approval and notification delivery outcome
- governed-task display switching between:
  - `default`
  - `celestial-court`

## What it does not do yet

- no runtime auto dispatch / execution
- no planner auto re-plan
- no Feishu-side approve / reject command
- no advanced classifier
- no additional theme packs wired into UI beyond `default` and `celestial-court`
- no large-scale UI theming beyond governed-task-related display fields

## Local verification suggestion

On a machine with full dependencies installed, verify:

```bash
git status
pnpm install
pnpm build
pnpm ui:build
```

Then manually test:

1. send a lightweight Feishu message → confirm reply-only path
2. send a high-risk Feishu request → confirm governed-task path
3. open `Tasks` tab → confirm task + approval queue appear
4. approve once → confirm state change + Feishu notify + timeline events
5. reject once → confirm state change + Feishu notify + timeline events
6. switch theme pack between `default` and `celestial-court` in governed-task UI
