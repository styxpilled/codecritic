# Network sub-nav and mutuals page

Status: done

## Problem

The `[user]` layout links to `/user/[user]/network`, which is not a route. The
profile page links to `/user/[user]/followers` for the same "Network" item. The
followers and following pages are bare lists with no shared navigation and no
heading.

There is no mutuals page. A mutual follow is when two users follow each other.
The database does not store it.

## Scope

- Point the `Network` nav item straight at `/user/[user]/following`. Do not add
  a `/network` route.
- Add a shared sub-nav with `following`, `followers` and `mutuals`. All three
  pages show it. Put it in a layout under `/user/[user]/`, so that it does not
  repeat.
- Add `/user/[user]/mutuals` and a `getMutuals` query. Calculate mutuality in
  the query with a self join on `users_follows`. Do not store it.
- Give the three lists a shared component. They are the same list of users.
- Show the follow control on each row, as `/users` does.

## Comments

Implemented.

- The `[user]` layout `Network` item points at `/user/[user]/following`. The
  active state covers `following`, `followers` and `mutuals`. The profile nav
  points at `following` too, not at `followers`.
- `following`, `followers` and `mutuals` moved into a `(network)` route group.
  Its `+layout.svelte` draws the shared sub-nav through the new `$ui/SubNav`.
- `getMutuals` joins `users_follows` twice, once in each direction. Nothing is
  stored.
- The three pages share `$ui/UserList`, which shows the follow control.
- `getFollowing`, `getFollowers` and `getMutuals` now return `userFollows` and
  `followsUser`. They use `EXISTS` subqueries, so the row count stays correct
  and no `GROUP BY` is necessary.
