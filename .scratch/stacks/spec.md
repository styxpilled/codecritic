# Stacks

A stack is the Letterboxd list equivalent. See `docs/domain.md`.

The backend and the UI are both incomplete. This directory holds the work that
remains.

## Decisions

- Do not copy the Letterboxd list card. Codecritic has no images to show.
  Design a text-first card.
- Package order in a stack matters, but only if it does not complicate the
  code.
- Do not validate package names against the npm registry on save. A rich UI
  stops most bad input, and the user sees the problem when they open the
  package page.
- The stack index does not paginate. A stack card inlines its packages.
- The edit form path carries the stack identity, as the review edit form does.

## Issues

| File                          | Summary                          |
| ----------------------------- | -------------------------------- |
| `01-stack-index-cards.md`     | `/stacks` is a placeholder       |
| `02-stack-detail-page.md`     | The detail page is a placeholder |
| `03-stack-package-order.md`   | Package order is not stored      |
| `04-stack-likes.md`           | `stacks_likes` is unused         |
| `05-stack-edit-and-delete.md` | No way to change a stack         |
| `06-create-stack-result.md`   | `createStack` swallows the result|
| `07-implement-stack-tags.md`  | Tags are collected but discarded |
