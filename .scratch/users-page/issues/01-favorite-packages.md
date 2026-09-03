# Favorite packages

Status: needs-triage

## Problem

A member has no way to say which packages they stand for. The profile shows
reviews and stacks in time order, so a visitor has to read a list to learn
anything about the member. Letterboxd solves this with four favorite films on
the profile. The site needs the same thing for packages.

## Scope

Add a `users_packages` table:

| Column     | Type    | Note                                  |
| ---------- | ------- | ------------------------------------- |
| `user_id`  | integer | References `users.id`, cascade delete |
| `package`  | text    | The package name                      |
| `position` | integer | 0 to 3, the order the member chose    |

Follow `stacks_packages`, which holds the package name as text and keeps the
foreign key to `packages` commented out. A member can pick a package that the
cache has not seen yet.

Add a unique constraint on `(user_id, position)`, so the four slots cannot
hold duplicates.

Four is a hard limit. Enforce it in the remote function, not only in the UI.

### Queries

- `getFavoritePackages(username)`, or fold the packages into the existing
  profile query if that saves a round trip.
- `setFavoritePackages(packages: string[])` for the signed in member. It
  replaces all four slots in one call, because the editor reorders them.
- `getPopularUsers` returns the four packages of each member. The card needs
  them, and one query per card is not acceptable.

### Where they show

- The large user card on `/users`. See `02-large-user-card.md`.
- The profile page `/user/[user]`, near the top, above the reviews. This is
  the place a visitor looks first, and Letterboxd puts the favorites there.

Both places draw the same chips. Pull the chip into a component if the two
layouts agree.

### Editor

The member picks the packages in settings. See `.scratch/settings/spec.md`.
Reuse the package search that the stack editor uses, so the member does not
learn a second control. Empty slots are valid. A member with no favorites
shows none, and the card stays the same height.

## Notes

The migration is additive, so `pnpm cf:migrate-remote` is enough. Update
`scripts/seed.js` in the same change, so seeded members have favorites, or
every card on the deployed site shows an empty row.

Update `docs/domain.md` with the new table.
