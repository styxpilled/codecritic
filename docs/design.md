# Design system

The UI is a cross between Letterboxd and the One Dark Pro editor theme.

## Color

`src/lib/styles/colors.css` holds the palette. The colors are One Dark Pro
terminal colors. Backgrounds go from `--color-bg` to `--color-bg-brightest`.

Colors can carry sematic meaning:

| Color  | Meaning                 |
| ------ | ----------------------- |
| Red    | Usernames               |
| Blue   | Packages, Ratings, Tags |
| Purple | Versions                |
| Green  | Dates                   |
| Yellow | Constants               |
| Orange | Reviews                 |
| Cyan   | Licenses                |

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

`COLORS` in `src/lib/index.ts` is the color rotation. Use it only for the cases
it already serves: keyword chips, avatars, and package chips on stack cards and
user cards. It is not a general palette.

Package chips break the rule that packages are blue. A row of four identical
blue chips reads as one block, and the rotation tells the packages apart at a
glance, which is what a chip row is for. `hashColor(name)` picks the color, so
one package has one color everywhere. Identicons use the same hash.

### Light mode

Light mode is not available. The block in `colors.css` is commented out and
`app.css` hardcodes `color-scheme: dark`. See the issue tracker.

## Utility classes

`src/lib/styles/app.css` holds the utilities. The main groups are:

- Layout: `row`, `col`, `nogap`, `gap-sm`, `gap-lg`, `start`, `end`, `space`.
- Shape: `btn`, `btn lg`, `round`, `interactive-btn`.
- Text: `semibold`, `bold`, `upcase`.
- Hover and focus: `hov-link`, `hov-line`, `hov-light`, `hov-invert`.

`interactive-btn` grows a button by 2px on hover and on `:focus-visible`. A
negative margin cancels the growth, so the layout does not move. It reads the
padding from the `--btn-py` and `--btn-px` custom properties that `btn` sets,
which is why it works on both `btn` and `btn lg`.

Hover utilities also apply on `:focus-visible`, and they remove the default
outline. Keep this behavior when you add new ones, because the site has to stay
usable from the keyboard.

## Components

Shared components live in `src/lib/ui` and use the `$ui` alias. Group related
components in a directory with an `index.ts` barrel, as `Review/` and
`Package/` do.

Route-only components live next to their route, as `Sidebar.svelte` does.

### User

`User/` holds `Card` (the large card on `/users`), `Row` (the dense row for
followers, following and mutuals), `List` (a list of rows), `Favorites` (the
package chips) and `Name` (the nickname and username link).

A card is not one click target. The avatar and the name are two links to the
profile, each count links to its own page, and the chips and the follow button
sit outside every link.

### Follow button

`FollowButton/Default` is the wide text button. `FollowButton/Compact` is a
circle with an icon for places without room for text. A caller picks one. No
breakpoint swaps them. Both render a link to `/login/github` for a visitor and
nothing on the profile of the viewer.

`Avatar` takes an optional `badge` snippet that sits in the bottom right
corner, meant for the compact button on `lg` and `xl` sizes.

### Avatar

A user without a GitHub avatar gets an identicon from `minidenticons`, keyed
on the username and painted with the `hashColor` of the username.

## Icons

Icons come from `lucide-static` through `vite-plugin-lucide-sprite`. Use
`<Icon id="name" size="1em" />`.
