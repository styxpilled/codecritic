# Session metadata

Status: needs-triage

## Problem

The sessions list on `/settings/account` shows the sign in date and nothing
else. A user cannot tell one session from another, so the list gives them no
help when they want to find a session they do not recognize.

## Scope

- Add `user_agent` and `last_seen` columns to `sessions`. Write them in
  `hooks.server.ts`.
- Show a readable device name and the last use date in the list.
- Add a control that ends one session, next to `Sign out everywhere`.
- Do not store the IP address. The privacy notice says we do not process
  location or device data, so update the notice first, or keep only the user
  agent.
