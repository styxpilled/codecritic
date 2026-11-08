# Architecture

## Stack

- SvelteKit 2 with Svelte 5. Runes mode is on for all project files. Async
  Svelte (`experimental.async`) is on, so components can `await` in markup.
- Drizzle ORM on Cloudflare D1 (SQLite).
- Cloudflare Workers through `@sveltejs/adapter-cloudflare`.
- Valibot for input validation.

## Environments

See `README.md` for the commands.

| Environment | Database                      |
| ----------- | ----------------------------- |
| dev         | `local.db` through wrangler   |
| preview     | wrangler local D1             |
| remote      | Cloudflare D1 `codecritic-d1` |

Migrations are in `src/lib/server/db/migrations`. The D1 binding is
`codecritic_d1`.

## Data access

All data access uses SvelteKit remote functions. They live in
`src/routes/api/*.remote.ts` and use the `$api` alias.

- Use remote functions wherever possible. Add a `+page.server.ts` load function
  only when a remote function cannot do the job. `src/routes/review/[id]` is one
  such case, because it only redirects.
- `query` is for reads. `form` is for mutations.
- Validation schemas that more than one file needs live in
  `src/routes/api/schemas.ts`.
- Get the request context with `getRequestEvent().locals`, which holds `db`,
  `user` and `session`. `hooks.server.ts` sets all three.
- Return `error(401)` from a mutation when `locals.user` is null.

## No-JS support

The site must work without JavaScript. This is a hard requirement.

- Every feature has to degrade as well as it can without JavaScript.
- This is why mutations use `form`. A `form` remote function works as a normal
  HTML form post when JavaScript is off, and SvelteKit enhances it when
  JavaScript is on.
- Mutations such as `likeReview` and `follow` return nothing. They rely on
  automatic query invalidation.
- `createReviewSchema` uses `v.picklist([...])` unions because form values
  arrive as strings.
- Mark controls that need JavaScript with the `js-only` class.

## Auth

GitHub OAuth through `arctic`. Routes are `/login/github` and
`/login/github/callback`.

The session token is `<id>.<secret>`. The database stores only a SHA-256 hash of
the secret. `validateSessionToken` compares the hash in constant time. Sessions
live for 30 days. The cookie name is `codecritic_session`.

## Routing

- `/packages/[[scope]]/[package]` is the package page. The `scope` matcher
  accepts a segment that starts with `@`.
- `/user/[user]/package/[[scope]]/[package]/[[index]]` is one review.
- `/user/[user]/stack/[name]/[[index]]` is one stack.
- `/review/[id]` redirects to the canonical review URL.
- Optional numeric segments use the `number` param matcher.
- Build package names from route params with `toPackageName(params)`.
