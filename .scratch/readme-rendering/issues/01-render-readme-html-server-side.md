# Render readme HTML on the server and cache it

Status: needs-triage

## Problem

`src/lib/ui/Readme.svelte` parses, highlights, and sanitizes the raw markdown in
the component. This runs on the server and again in the browser.

- The client repeats the full parse, highlight, and sanitize pass at hydration
  and on every client-side navigation to a package page. The result is identical
  to the HTML the server already sent.
- `marked`, `marked-highlight`, `dompurify`, and `highlight.js` core with five
  language grammars ship in the client bundle. The `linkedom` import is behind a
  `browser` check and is dropped only if the bundler folds the ternary.
- The worker pays the parse and the DOMPurify pass on every request. Workers
  bill CPU time, and readme content does not change between cache refreshes.
- The `{#await}` block renders nothing until the parse resolves, so the readme
  area is empty for a moment on client-side navigation.

`readmes` is already a cache table keyed by package name. The content is stable
between refreshes, so the rendered HTML belongs in that row.

## Scope

- Add an `html` column to `readmes`.
- Move the render pipeline into `src/routes/api/readme.remote.ts`, at the point
  that writes the row: rewrite relative image `src` and `srcset` against the raw
  GitHub URL, parse with `marked` and `marked-highlight`, sanitize with
  DOMPurify over `linkedom`.
- Keep `value`, so a re-render never needs a refetch from GitHub.
- Reduce `Readme.svelte` to `{@html html}` plus the show-more label. Remove the
  markdown imports and the `{#await}`.
- Rendering once at write time means a DOMPurify or `marked` upgrade does not
  clean rows that are already stored. Accepted. Clear the table if a pipeline
  change matters.

## Related

- `.scratch/package-cache/issues/01-honor-cache-expiry.md` covers the unread
  `readmes.expires` value. Stored readmes never refresh today, which makes the
  stored HTML permanent too.
