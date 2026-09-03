# Small user card

Status: needs-triage

## Problem

The compact user row exists twice. `UserList.svelte` draws an avatar, a name
and a follow button, and the all-time popular list on `/users` draws the same
row again with a review count. Neither one says what the member does on the
site.

The large card from `02-large-user-card.md` does not fit a long list. The
followers, following and mutuals pages need a dense row that still carries
counts.

## Scope

Add the small card next to the large one, under the same `$ui/User/`
directory. Decide the name first, because it goes in the barrel and in
`docs/design.md`. `Row.svelte` says what the shape is. `Card.svelte` and
`Small.svelte` read as a pair. Pick one and use it in both files.

The row holds:

- The avatar at `sm` or `md`.
- The nickname and the username.
- Three counts: reviews, stacks, and likes given.
- The follow button, compact, from `04-compact-follow-button.md`.

### The counts

`likes` on `getPopularUsers` counts the likes that the reviews of the member
received. The count this issue asks for is the other direction, the likes that
the member gave, over reviews and over stacks together.

Add to the queries:

| Count       | Source                                                  |
| ----------- | ------------------------------------------------------- |
| Reviews     | `reviews` by the member. Already there.                 |
| Stacks      | `stacks` by the member. New.                            |
| Likes given | `likes_reviews` plus `stacks_likes` by the member. New. |

Three counts over four tables in one query multiplies rows if each one is a
join. Use scalar subqueries, or one grouped subquery per table. Check the
result against the seeded database, where the counts are known.

`getFollowers`, `getFollowing` and `getMutuals` also feed `UserList`, so they
need the same columns. Put the count columns in one shared select fragment,
in the way `followFlags` and `stackColumns` already work.

### Where it is used

`UserList.svelte` becomes a list of these rows. The all-time popular list on
`/users` uses it too, and drops its inline markup.

Decide whether the likes count links to `/user/[user]/likes`, which exists.

## Notes

Reviews and stacks have no count page of their own for likes given, so a
count with no link is acceptable here.
