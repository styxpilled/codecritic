# The signed out viewer id collides with seeded users

Status: needs-triage

## Problem

The remote functions compare rows against the id of the viewer to build the
`liked`, `followsUser` and `userFollows` flags. When nobody is signed in, they
pass `-1` as the id:

```ts
followsUser: sql`${user?.id || -1} = ${following.following}`.mapWith(Boolean);
liked: likedFlag(user?.id ?? -1);
```

The sentinel assumes that no row holds the id `-1`. `scripts/seed.js` breaks
that assumption. Seeded users take the ids `-1` to `-8`, so the first seeded
user is the signed out viewer.

A visitor who is not signed in now sees the likes and the follows of that user
as their own. Like buttons show as pressed, and follow buttons show the wrong
state. The deployed site is mostly seeded data, so this is visible on the live
site today.

The bug is in the sentinel, not in the seed data. Any negative id is a valid
`INTEGER PRIMARY KEY`.

## Scope

There are 18 call sites in `src/routes/api/`:

- `reviews.remote.ts`, six uses of `likedFlag(user?.id ?? -1)`
- `stacks.remote.ts`, five uses of `stackColumns(user?.id ?? -1)`
- `user.remote.ts`, `followFlags(viewer?.id ?? -1)` and two pairs of inline
  `sql` flags

Options, in the order they are preferred:

1. Export one constant, for example `NO_VIEWER`, and use it at every call
   site. Give it a value that a row cannot hold. `0` works, because SQLite
   only assigns a rowid of `1` or higher and nothing inserts a `0`. Record the
   rule in `docs/domain.md`, because the seeder has to respect it.
2. Pass `null`, and let the comparison produce `NULL`, which `mapWith(Boolean)`
   turns into `false`. Cleaner in SQL, but it needs a check of how Drizzle
   binds `null` in each of these expressions.

Do not fix this by moving the seeded ids. That hides the fault and the next
seeder brings it back.

Add a check that a signed out request returns `false` for every flag while
seeded data is present.

## Notes

The seeded ids also reach the client in the `id` field, so a fix must not
assume the id is positive anywhere else.
