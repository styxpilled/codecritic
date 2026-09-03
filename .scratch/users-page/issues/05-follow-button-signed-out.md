# The follow button does not handle a signed out visitor

Status: needs-triage

## Problem

`FollowButton.svelte` always renders a form and a submit button. A visitor who
is not signed in can press it. The submit then fails in the remote function,
and the optimistic update has already flipped the label.

The button has a `Not logged in` state, but it is a label on the same button,
and the branch that picks it never reads the session:

```svelte
{#if user}
	Not logged in
{:else}
	Not following
{/if}
```

`user` is the profile that the button follows, not the viewer, and it is a
required prop. The condition is therefore always true, and the resting label
of every signed out visitor is `Not logged in`. The signed in viewer reads it
too.

The like button already does this correctly. When `app.user` is missing it
renders a link to `/login/github` instead of a form, and no form ever reaches
a signed out visitor.

## Scope

Rewrite `FollowButton.svelte`:

- Read the viewer from `app.user`, as `shared/LikeButton.svelte` does.
- When there is no viewer, render an `<a href="/login/github">` in place of
  the form. Style it as the `Follow` state, so the control does not move or
  change size when a member signs in.
- When there is a viewer, keep the form, the four states and the slide
  between them.
- Take `Not logged in` out of the state list. It is not a state of the
  relationship. `Not following`, `Follow`, `Following`, `Unfollow` and
  `Follows you` stay.
- The profile page hides the button on the profile of the viewer. Keep that,
  and check the same guard in `UserList.svelte` and `/users`, which test
  `app.user.id !== user.id` in three separate places.

`04-compact-follow-button.md` inherits this behavior. Land this issue first,
so the compact button is built on a component that already knows about the
signed out visitor.

## Notes

The link and the form must look the same. A visitor who signs in from the link
comes back to a page where the control sits in the same place.
