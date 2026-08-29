# Stack index cards

Status: needs-triage

## Problem

`/stacks` renders each stack as a bare anchor with the literal text
`stack {stack.name}`. There is no card, no author, no description and no
packages.

`getRecentStacks` returns only the stack columns and the author. It accepts a
`page` argument and ignores it.

## Scope

- Design a text-first stack card. Do not copy the Letterboxd list card, because
  Codecritic has no cover images. Show the name, the author, the description and
  the packages.
- Inline the packages in the card. Add them to `getRecentStacks` with
  `json_group_array` and `toStringArr`, in the same way `getStack` does.
- Add the like count to `getRecentStacks`. See `04-stack-likes.md`.
- Do not paginate. Remove the unused `page` argument, or make the limit the only
  control.
- Keep the package chips consistent with the `COLORS` rotation that
  `/stacks/new` already uses.
