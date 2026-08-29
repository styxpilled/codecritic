# createStack loses its result

Status: needs-triage

## Problem

`createStack` wraps its whole body in a `try/catch` that logs the error and
continues. The caller cannot tell success from failure. The `redirect` to the
new stack is commented out, and the function returns nothing, so a successful
save leaves the user on the empty form.

`/stacks/new` already renders `createStack.fields.allIssues()`, so the client is
ready for real errors.

## Scope

- Remove the `try/catch`. Let `error()` and validation failures propagate, so
  that `allIssues()` receives them.
- Redirect to the new stack on success.
- Note that `error(401)` inside the `try` is currently caught and swallowed, so
  an anonymous visitor can reach the insert path.
- Confirm the redirect works without JavaScript.
