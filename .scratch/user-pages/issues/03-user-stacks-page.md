# User stacks page

Status: needs-triage

## Problem

The layout nav and the profile nav both link to `/user/[user]/stacks`. The route
does not exist. There is no query that lists the stacks of one user.

## Scope

- Add a `getUserStacks` query. Give it the same shape as `getRecentStacks`, with
  a username filter.
- Add `/user/[user]/stacks`. Use the stack card from
  `.scratch/stacks/issues/01-stack-index-cards.md`. Do not design a second card.
- Show a create control to the owner.
- Depends on the stack card work.

## Comments

Blocked on `.scratch/stacks/issues/01-stack-index-cards.md`. The stack card does
not exist yet, and this issue says not to design a second one.
