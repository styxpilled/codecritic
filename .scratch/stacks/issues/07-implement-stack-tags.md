# Implement stack tags

Status: done

## Problem

`createStackSchema` accepts `tags` and `tagsString`, and `src/routes/stacks/new`
collects them, but `createStack` ignores both. There is no tags table.

## Scope

- Add a `stacks_tags` table, in the same shape as `packages_keywords`.
- Write the tags in `createStack` and read them back in `getStack` and
  `getRecentStacks`, with `json_group_array` and `toStringArr`.
- Decide whether tags are searchable, as package keywords are.

## Comments

Done. `stacks_tags` holds one row per tag, in the same shape as
`packages_keywords`. `createStack` and `updateStack` write the tags, and the
stack queries read them back. Tags are not searchable. Search covers package
keywords only, and a stack tag is a label of a collection, not of a package.
