# Design system

The UI is a cross between Letterboxd and the One Dark Pro editor theme.

## Color

`src/lib/styles/colors.css` holds the palette. The colors are One Dark Pro
terminal colors. Backgrounds go from `--color-bg` to `--color-bg-brightest`.

### The fg/bg pair

Colored elements do not set `color` or `background-color` directly. They set the
`--fg` and `--bg` custom properties through a utility class:

- `fg-<color>` sets `--fg` only.
- `bg-<color>` sets `--bg` and a readable `--fg`.

Any element with a class that contains `fg-` or `bg-` then gets
`color: var(--fg)` and `background-color: var(--bg)`.

Always declare the pair. The second half acts as a fallback so that `hov-invert`
can swap the two values and still produce a readable result.

### COLORS

`COLORS` in `src/lib/index.ts` is the color rotation. Use it only for the two
cases it already serves: keyword chips and avatars. It is not a general palette.

### Light mode

Light mode is not available. The block in `colors.css` is commented out and
`app.css` hardcodes `color-scheme: dark`. See the issue tracker.

## Utility classes

`src/lib/styles/app.css` holds the utilities. The main groups are:

- Layout: `row`, `col`, `nogap`, `gap-sm`, `gap-lg`, `start`, `end`, `space`.
- Shape: `btn`, `btn lg`, `round`.
- Text: `semibold`, `bold`, `upcase`.
- Hover and focus: `hov-link`, `hov-line`, `hov-light`, `hov-invert`.

Hover utilities also apply on `:focus-visible`, and they remove the default
outline. Keep this behavior when you add new ones, because the site has to stay
usable from the keyboard.

## Components

Shared components live in `src/lib/ui` and use the `$ui` alias. Group related
components in a directory with an `index.ts` barrel, as `Review/` and
`Package/` do.

Route-only components live next to their route, as `Sidebar.svelte` does.

## Icons

Icons come from `lucide-static` through `vite-plugin-lucide-sprite`. Use
`<Icon id="name" size="1em" />`.
