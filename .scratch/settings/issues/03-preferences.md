# Display preferences

Status: needs-triage

## Problem

`/settings` holds profile fields only. There is no place for the display
choices that a user makes again and again.

## Scope

- Add a `/settings/preferences` page.
- Candidates: the color theme, once light mode exists (see
  `.scratch/light-mode/`); the default review sort; whether the profile shows
  the email-free GitHub link.
- Store the preferences in the `profiles` table, not in `localStorage`, because
  the pages must render correctly on the server and without JavaScript.
- Do not add a preference until a second page needs it. One page can keep its
  choice in the URL.
