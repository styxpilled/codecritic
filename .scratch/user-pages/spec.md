# User pages

`/user/[user]` and its subpages. The layout nav and the profile nav both link to
routes that do not exist.

## Current routes

| Route                                        | State    |
| -------------------------------------------- | -------- |
| `/user`                                       | Done. Profile settings. |
| `/user/[user]`                                | Mostly done. |
| `/user/[user]/followers`                      | Done. |
| `/user/[user]/following`                      | Done. |
| `/user/[user]/likes`                          | Done. |
| `/user/[user]/package/...`                    | Done. |
| `/user/[user]/stack/...`                      | See `.scratch/stacks/`. |
| `/user/[user]/reviews`                        | Done. Recent sort. |
| `/user/[user]/reviews/popular`                | Done. Like count sort. |
| `/user/[user]/stacks`                         | Missing, linked. |
| `/user/[user]/mutuals`                        | Done. |
| `/user/[user]/network`                        | Not a route. The nav link goes to `following`. |
| `/user/[user]/stats`                          | Missing, linked. Long term. |

## Decisions

- `+page@user.svelte` breaks out of the `[user]` layout on purpose. The profile
  page draws its own nav. Keep it.
- The `Network` nav link goes straight to `/user/[user]/following`. There is no
  `/network` route.
- Review lists share one UI. The sort comes from the route.

## Issues

| File                        | Summary                             |
| --------------------------- | ----------------------------------- |
| `01-network-sub-nav.md`     | Mutuals page and a shared sub-nav   |
| `02-user-review-lists.md`   | Missing review routes and sorts     |
| `03-user-stacks-page.md`    | Missing stacks route                |
| `04-profile-review-count.md`| The review count is hardcoded       |
| `05-user-stats.md`          | Long term                           |
