# Domain model

Codecritic is a Letterboxd-like site for npm packages. Where a behavior looks
unusual, the cause is usually parity with Letterboxd. Match Letterboxd first.

## Terms

| Codecritic | Letterboxd equivalent | Notes                                     |
| ---------- | --------------------- | ----------------------------------------- |
| Package    | Film                  | Data comes from the npm registry.         |
| Review     | Diary entry           | A user can write many for one package.    |
| Stack      | List                  | The name is flavor only.                  |
| Friend     | Friend                | See `Follows`.                            |

## Package

The `packages` table is a cache of npm registry metadata. The primary key is the
full package name, which includes the scope (`@scope/name`).

Keywords live in `packages_keywords`, one row per keyword. Queries collect them
with `json_group_array` and `toStringArr`.

Readmes live in `readmes`. The primary source is the `readme` field of the npm
registry document, because it is convenient and it keeps parity with npm. The
GitHub API path in `getReadme` is a fallback for packages that publish no readme
in their registry metadata. The `readmes.url` column holds the repository URL.
Its purpose is to resolve relative links and images in the markdown.

## Review

A review has an author, a package, a rating, a version and free text.

- The rating is an integer from 1 to 10. The scale will not change. The UI shows
  it as five stars with an optional half star. `RatingInput` draws ten half-star
  SVG shapes and mirrors every second one.
- A user can review the same package many times. The `index` column numbers
  these reviews from 0. `deleteReview` decrements the index of later reviews.
- Do not treat `index` as stable. URLs use it, but it can change.
- The `version` records which version of the package the review is about.

## Stack

A stack is a named collection of package names that one user owns.

- `normalizedName` is the slug that `normalizeName()` makes from the name.
- `index` counts how many stacks the same author already has with the same
  normalized name.
- Duplicate names are always permitted. Never block a stack because the name is
  in use. The index makes the URL unique.
- Tags are not implemented. The `tags` and `tagsString` fields in
  `createStackSchema` are unused.

## Follows

`users_follows` holds one directed row per follow.

A friend is a user that you follow. A mutual follow is when two users follow
each other. The database does not store mutuality. Calculate it when you need it.

## Legacy

`guestbook_messages` is an artifact of the earliest prototype. It has no
relations, routes or UI.
