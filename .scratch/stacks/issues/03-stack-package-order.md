# Store the package order in a stack

Status: needs-triage

## Problem

`stacks_packages` has no order column. `getStack` collects the packages with
`json_group_array(DISTINCT ...)`, so the order is whatever SQLite returns.

The order of the packages in a stack is meaningful to the author.

## Scope

Only do this if it does not complicate the code. If the cost is high, close the
issue and accept an unordered stack.

- Add a `position` integer column to `stacks_packages`.
- Write the position from the order of the form fields in `createStack`.
- Order by it in `getStack` and `getRecentStacks`. Note that
  `json_group_array(DISTINCT ...)` cannot take an `ORDER BY`, so the query needs
  a different shape.
- Let the author reorder the packages in the stack form. The reorder control has
  to degrade without JavaScript.
