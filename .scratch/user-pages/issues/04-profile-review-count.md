# The profile review count is hardcoded

Status: done

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

## Comments

Implemented. `getProfile` counts with `COUNT(DISTINCT reviews.id)` over a left
join. The profile renders it with the same `padStart(3, '0')` treatment.
Verified against the dev database: a user with 3 reviews shows `003` and a user
with none shows `000`, and the follower counts do not change.
