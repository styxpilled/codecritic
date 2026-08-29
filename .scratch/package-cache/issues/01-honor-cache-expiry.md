# Honor package and readme cache expiry

Status: needs-triage

## Problem

`packages.expires` and `readmes.expires` are written but never read.
`getNPMPackage` returns the cached row whenever one exists, so package metadata
never refreshes after the first fetch. `getReadme` behaves the same way.

`getNPMPackage` also writes `expires: new Date()`, which is already in the past,
and the readme insert writes no `expires` value at all.

## Scope

Refresh at request time. The site runs serverless, so there is no cron job.

- Read `expires` before you return a cached row. Refetch from the npm registry
  when the row is stale.
- Set a real TTL on write.
- Decide what happens when the refetch fails. Prefer to serve the stale row over
  an error.
- Refresh `packages_keywords` with the package row.
