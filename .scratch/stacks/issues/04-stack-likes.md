# Stack likes

Status: needs-triage

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
