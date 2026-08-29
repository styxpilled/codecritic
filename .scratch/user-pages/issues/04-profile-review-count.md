# The profile review count is hardcoded

Status: needs-triage

## Problem

`/user/[user]/+page@user.svelte` renders the literal string `000` for the
REVIEWS counter, next to the real FOLLOWING and FOLLOWERS counters.

`getProfile` returns `following` and `followers` but no review count.

## Scope

- Add the review count to `getProfile`.
- Count with `COUNT(DISTINCT reviews.id)` and a left join, so that a user with no
  reviews returns 0 and the follower counts stay correct. `getProfile` already
  uses `COUNT(DISTINCT ...)` for the same reason.
- Render the count with the same `padStart(3, '0')` treatment as the others.
