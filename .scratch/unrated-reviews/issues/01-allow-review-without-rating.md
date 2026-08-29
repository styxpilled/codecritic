# Allow a review with no rating

Status: needs-triage

## Problem

Letterboxd lets a user write a review without stars. Codecritic does not.
`reviews.rating` is `notNull`, and `createReviewSchema` requires a value from 1
to 10.

## Scope

- Add a migration that makes `reviews.rating` nullable. Do not change the 1 to 10
  scale.
- Make the rating optional in `createReviewSchema`.
- Let `RatingInput` clear the selection. It already toggles a radio off on a
  second click, but the form still needs to submit an empty value.
- Make `Rating.svelte` render nothing when the rating is null.
- Check every aggregate query that reads `rating`.
