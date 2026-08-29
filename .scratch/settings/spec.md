# Settings

`/settings` is where a signed in user changes their own account. The header and
the privacy notice both linked to `/settings` before the route existed.

## Routes

| Route               | State                                     |
| ------------------- | ----------------------------------------- |
| `/settings`         | Done. Profile form.                       |
| `/settings/account` | Done. Sessions and account deletion.      |
| `/user`             | Done. Permanent redirect to `/settings`.  |

## Decisions

- The profile form moved from `/user` to `/settings`. `/user` now redirects with
  status 308, because the old URL had no other purpose.
- The two pages share `settings/+layout.svelte`, which holds the heading and a
  `SubNav`.
- Auth mutations are remote `form` functions in `src/routes/api/auth.remote.ts`.
  This keeps them working without JavaScript, like every other mutation.
- `deleteUser` does not rely on cascades. `stacks.author` has no foreign key, so
  the helper deletes every dependent row itself in one `db.batch`.
- Account deletion asks the user to retype their username. The comparison is on
  the server, because the schema cannot see the session.
- Sessions carry no user agent and no IP address. The list shows the sign in
  date only, and marks the current device.

## Issues

| File                       | Summary                              |
| -------------------------- | ------------------------------------ |
| `01-data-export.md`        | Export the user's own data           |
| `02-session-metadata.md`   | Record device and last seen          |
| `03-preferences.md`        | Per user display preferences         |
