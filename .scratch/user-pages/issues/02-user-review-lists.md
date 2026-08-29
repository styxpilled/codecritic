# User review list routes

Status: needs-triage

## Problem

The layout nav and the profile nav link to `/user/[user]/reviews`. The profile
page also links to `/user/[user]/reviews/recent`. Neither route exists.

`getUserReviews` always orders by `created_at DESC` and takes no sort argument,
no limit and no page.

## Scope

- Add `/user/[user]/reviews`. It sorts by recent, because that is the useful
  default for one user.
- Add `/user/[user]/reviews/popular`, which sorts by like count. The package
  reviews already use a `reviews/popular` subpath, so this keeps the URL shape
  consistent.
- Both routes share one UI. Only the sort differs, and the sort happens on the
  server. Do not sort on the client.
- Consider more sorts: rating, package name and version date. Design the route
  shape so that another sort is a new subpath, not a new page.
- Add the sort, the limit and the page to `getUserReviews`.
- Point the profile page `more` link and the `recent reviews` heading at
  `/user/[user]/reviews`, not at `/reviews/recent`.
- Add a sub-nav for the sorts. It must work without JavaScript, so use links,
  not a select element.
