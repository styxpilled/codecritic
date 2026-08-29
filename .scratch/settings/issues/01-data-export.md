# Data export

Status: needs-triage

## Problem

The privacy notice tells the user what data we hold, but the site gives them no
way to get a copy of it. GDPR calls this the right to data portability.

## Scope

- Add a `Download my data` control to `/settings/account`.
- Return one JSON file with the user record, the profile, the reviews, the
  stacks, the likes and the follows.
- A `+server.ts` endpoint suits this better than a remote function, because the
  response is a file download.
- Do not include other users' data. Follows list usernames only.
