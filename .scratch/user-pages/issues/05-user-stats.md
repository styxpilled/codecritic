# User stats page

Status: needs-triage

## Problem

The layout nav and the profile nav link to `/user/[user]/stats`. The route does
not exist.

## Scope

This is a long term goal. Do not start it until the other user pages are done.

Letterboxd puts its stats behind a subscription, so there is no template to
match. Content to consider:

- The rating distribution of the user.
- The keywords that occur most in the packages they review.
- Reviews over time.
- Licenses of the packages they review.

Note that the site has to work without JavaScript, so any chart has to render on
the server.
