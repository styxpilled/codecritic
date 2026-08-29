# Restore light mode

Status: needs-triage

## Problem

Light mode does not work. `src/lib/styles/colors.css` has a light palette in a
commented-out `@media (prefers-color-scheme: light)` block. `src/lib/styles/app.css`
hardcodes `color-scheme: dark` on `html, body` and a literal `#181a1b` background
on `body`.

## Scope

- Restore the light palette and confirm every token in the dark `:root` block has
  a light counterpart.
- Remove the hardcoded `color-scheme: dark` and the literal body background.
- Check the fg/bg pair utilities in both themes. `bg-*` classes set `--fg` to
  `--color-bg-brighter`, which is a dark value.
- Check `github.css` and `readme.css`, which style rendered readme markdown and
  highlighted code.
- Decide whether the user can override the system preference. An override needs
  a no-JS path, so a form post plus a cookie is more suitable than localStorage.
