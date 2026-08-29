# Edit and delete a stack

Status: needs-triage

## Problem

There is no `updateStack` and no `deleteStack`. Once a user creates a stack,
they cannot change it or remove it.

## Scope

- Add an edit route at
  `/user/[user]/stack/[name]/[[index]]/edit`. The path carries the stack
  identity, in the same way the review edit route does.
- Share the form between `/stacks/new` and the edit route. Extract the markup
  from `/stacks/new` into a component, as `Review/Editor.svelte` does.
- Add `updateStack`. It has to replace the package rows, not append to them.
  `createStack` already deletes the rows before it inserts, so reuse that.
- Add `deleteStack`. It must delete only a stack that the caller owns.
- Deleting a stack has to re-pack the per-author `index` of the later stacks
  with the same `normalizedName`, in the same way `deleteReview` does.
- Renaming a stack changes `normalizedName`, and so changes the index it needs.
  Decide what the index becomes on rename.
- Show the edit and delete controls only to the owner.
