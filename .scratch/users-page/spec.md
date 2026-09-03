# Users page

`/users` is the member directory. It has never been designed. It shows two
lists that reuse `Avatar` and a heading, and it shows no work of the user
except a review count.

## Current state

| Route    | State                                                                       |
| -------- | --------------------------------------------------------------------------- |
| `/users` | Two lists from `getPopularUsers`. Popular this week, then all-time popular. |

`getPopularUsers` in `src/routes/api/user.remote.ts` returns the user columns,
a like count, a review count and the two follow flags. It has no stack count
and no packages.

## Goal

Make the directory show who a member is at a glance. A member is described by
the packages they choose, the same way a Letterboxd member is described by
their four favorite films.

## Decisions

- Every member picks up to four favorite packages. The order is the choice of
  the member, not a ranking that the site computes.
- The large card is the unit of the directory. The compact row stays for
  followers, following and mutuals, where the list is long.
- Seeded members and members without a GitHub avatar get a generated
  identicon, so no card is a blank circle.
- The card and the compact row stay two components. A single component with a
  `size` prop would carry both layouts and crowd the file.
- A card is not one click target. The links cover the avatar and the name, and
  the counts are links of their own. See `07-card-link-targets.md`.
- The card carries a review count and a stack count. No like count yet.
- `/users` gets no search. Search is one job across the whole site, and it
  waits for that work.

## Issues

| File                             | Summary                                    |
| -------------------------------- | ------------------------------------------ |
| `01-favorite-packages.md`        | Store and edit the four favorite packages  |
| `02-large-user-card.md`          | The card component and the `/users` layout |
| `03-minidenticon-avatars.md`     | Generated avatars for members without one  |
| `04-compact-follow-button.md`    | Icon follow button for narrow contexts     |
| `05-follow-button-signed-out.md` | The follow button ignores the session      |
| `06-user-row-card.md`            | The small card, with three counts          |
| `07-card-link-targets.md`        | Links cover only the avatar and the name   |

`01` blocks `02`. The card has no packages to draw until the table exists.
`05` blocks `04`, and `04` blocks `06`, which puts the compact button in the
row. `07` is a rule for `02` and `06`, so read it before either one. `03` and
`05` are independent of the rest.

- The compact follow button is opt in. A caller asks for it. No breakpoint
  swaps the two buttons.
