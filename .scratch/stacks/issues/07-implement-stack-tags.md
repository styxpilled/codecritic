# Implement stack tags

Status: needs-triage

## Problem

`createStackSchema` accepts `tags` and `tagsString`, and `src/routes/stacks/new`
collects them, but `createStack` ignores both. There is no tags table.

## Scope

- Add a `stacks_tags` table, in the same shape as `packages_keywords`.
- Write the tags in `createStack` and read them back in `getStack` and
  `getRecentStacks`, with `json_group_array` and `toStringArr`.
- Decide whether tags are searchable, as package keywords are.
