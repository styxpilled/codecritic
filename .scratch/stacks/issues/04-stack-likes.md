# Stack likes

Status: done

## Problem

The `stacks_likes` table exists. No query reads it, no form writes it and no UI
shows it.

## Scope

Give stacks the same treatment as review likes.

- Add `likeStack` and `unlikeStack` `form` remote functions, in the same shape
  as `likeReview` and `unlikeReview`. Return nothing and rely on query
  invalidation.
- Add the like count and a `liked` flag to `getStack` and `getRecentStacks`.
- Add a `getStackLikes` query that lists the users who liked a stack, as
  `getReviewLikes` does.
- Show liked stacks on the user likes page, next to the liked reviews.
- The like control has to work without JavaScript.

## Comments

Backend done: `likeStack`, `unlikeStack`, `getStackLikes`, `getLikedStacks`, and
a `likes` count and a `liked` flag on `getStack`, `getRecentStacks`,
`getUserStacks` and `getLikedStacks`. The counts and the flag are correlated
subqueries, so they do not need a join or a `GROUP BY`.

`$ui/Stack/LikeButton.svelte` holds the control. It is a plain form post without
JavaScript. The user likes page now lists the liked stacks next to the liked
reviews.
