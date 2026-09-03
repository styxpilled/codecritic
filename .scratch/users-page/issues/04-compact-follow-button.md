# Compact follow button

Status: needs-triage

## Problem

`FollowButton.svelte` is 10rem wide and 1.5rem high. It carries four states as
text, `Not following`, `Follow`, `Following` and `Unfollow`, and it slides
between them. The width is fixed, so the button does not fit next to a name on
a narrow screen, and it does not fit on the large user card, where the space
beside the avatar belongs to the counts and the packages.

The card needs a follow control that costs no horizontal space.

Blocked on `05-follow-button-signed-out.md`. The compact button inherits the
signed out behavior, so the rewrite lands first.

## Scope

Add a second component, for example `FollowButton/Compact.svelte`, next to the
one that exists. Group the two under a directory with an `index.ts` barrel.

The button is a circle with a plus sign. It has no text.

- The plus sign turns into a check mark, or into a minus sign on hover, so
  each of the four states of the wide button still has a reading. Decide which
  states matter without text. `Follows you` may have to go, because it is not
  an action.
- The hover fill grows from the middle of the circle in a second color, not a
  change of the background color. A radial `background-image`, or a
  pseudo-element that scales from `0` to `1`, both work without JavaScript.
- Use the `--fg` and `--bg` pair through the `bg-` utilities, as the wide
  button does. Blue for follow, green for following, red for unfollow.

### Placement on an avatar

The button has to sit at the bottom right corner of a large avatar and overlap
it, in the way a status badge does.

- Add the anchor to `Avatar.svelte` as an optional snippet or slot, so the
  avatar owns the corner and the caller does not write the offsets a second
  time. The alternative is a wrapper class in `app.css`, but then every caller
  repeats the position rules.
- The corner is only for the `lg` and `xl` sizes. On `md` and below the button
  covers too much of the picture.
- The button needs a ring in the page background color, so the circle reads
  against the picture.

### Where it is used

The caller asks for the compact button. There is no breakpoint that swaps the
two, because a swap ships both markups on every page.

Three call sites use the wide button today:

| Call site                                  | Button     |
| ------------------------------------------ | ---------- |
| `src/routes/user/[user]/+page@user.svelte` | Stays wide |
| `src/lib/ui/UserList.svelte`               | Compact    |
| `src/routes/users/+page.svelte`            | Compact    |

The profile page keeps the wide button. It has the room, and the text states
are worth keeping there.

## Notes

The button is a form submit for a signed in member, and a link to
`/login/github` for a visitor, the same as the wide one after `05`. Keep the
optimistic update and the `updates(getProfile(...))` call.

It must be usable from the keyboard. Give it an `aria-label` that says the
action, because the icon carries no name, and keep the focus ring the hover
utilities set.
