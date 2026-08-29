# Stack detail page

Status: needs-triage

## Problem

`/user/[user]/stack/[name]/[[index]]` prints the name, the description and the
raw package names. There is no author, no like control, no dates and no links.

## Scope

- Show the author, the description, the created date and the updated date.
- Show the packages. Decide between `Package/Default.svelte` cards and a denser
  list. A dense list is more likely to be correct, because a stack can hold a
  full dependency tree.
- Add the like control. See `04-stack-likes.md`.
- Show the edit and delete controls to the owner. See
  `05-stack-edit-and-delete.md`.
- `getStack` destructures `user` from locals and never uses it. Use it to return
  a `liked` flag, as the review queries do.
- Respect the stored package order. See `03-stack-package-order.md`.
