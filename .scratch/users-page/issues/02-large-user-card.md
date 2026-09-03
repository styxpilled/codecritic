# Large user card

Status: needs-triage

## Problem

`/users` draws its two lists inline. The first list is an avatar, a name and
two counts in a `List` of five columns. The second list is a row. Neither one
shows what the member does on the site, and the markup is copied between the
two lists and `UserList.svelte`.

Blocked on `01-favorite-packages.md`. The card has no packages to draw until
the table exists.

## Scope

Add `src/lib/ui/User/Card.svelte`, with an `index.ts` barrel next to it, as
`Stack/` and `Review/` do. Move `UserList.svelte` under the same directory if
that stays tidy.

The card holds:

- The avatar at `lg` or `xl`.
- The nickname and the username, in the `fg-red` username color.
- The review count and the stack count, as counts with a label.
- The four favorite packages, as chips.

`getPopularUsers` returns no stack count today. Add it. Watch the join. The
query already joins reviews and likes, so a third join multiplies the rows.
Count with a subquery or a distinct count.

### Package chips

Color each chip from the `COLORS` rotation, hashed from the package name, the
same way `Stack/Card.svelte` colors its chips:

```js
COLORS[[...value].reduce((sum, c) => sum + c.charCodeAt(0), 0) % COLORS.length];
```

Pull that helper out of `Stack/Card.svelte` into `src/lib/index.ts` instead of
copying it a second time.

`docs/design.md` says `COLORS` serves keyword chips and avatars only. This is
a third case. Either add it to that list or say why the card is different.
Note that the design system gives packages the color blue. A rotation over
package names goes against that rule, so the decision needs to be written
down.

Each chip links to the package.

### The page

`/users` keeps its two lists. The first one, popular this week, uses the card.
The second one, all-time popular, keeps the compact row, so the page has one
strong block and one dense block. A grid of cards, not `List` with five
columns, because the card is wide.

The card must degrade. A member with no favorites, no stacks or no reviews
still produces a card of the same height.

## Notes

The site works without JavaScript. The card is static markup and CSS.
