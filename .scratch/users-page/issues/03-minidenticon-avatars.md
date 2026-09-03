# Minidenticon avatars

Status: needs-triage

## Problem

`Avatar.svelte` builds a GitHub avatar URL from the GitHub id. A seeded member
has a negative id and no GitHub account, so the component renders a blank grey
circle. The seeded database is most of the deployed site, so most avatars are
blank. A real member whose GitHub avatar fails to load gets the same circle.

## Scope

Add the `minidenticons` package. It generates a small SVG from a string, with
no dependencies and no network request, and it runs on the server, which the
no-JavaScript rule needs.

In `Avatar.svelte`, when there is no GitHub avatar, render
`minidenticonSvg(username)` inline instead of the blank circle. Key the
identicon on the username, not the id, so the same member always gets the same
figure.

The generated SVG carries its own hue. Check it against the One Dark palette
in both themes. `minidenticonSvg` takes a saturation and a lightness, so the
figure can be pushed toward the site colors. If the default hue rotation
fights the palette, hash the username into `COLORS` and paint the figure with
that color instead.

Give the `img` or `svg` the same border and radius the GitHub avatar has, so
the two kinds of avatar look like one set.

## Notes

Do not delete the blank circle. It is still the state before an image loads.

The package is about 1kb. Check that it does not pull anything into the client
bundle that only the server needs.
