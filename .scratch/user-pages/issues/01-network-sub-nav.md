# Network sub-nav and mutuals page

Status: needs-triage

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
