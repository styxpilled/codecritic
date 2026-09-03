# The user cards need small link targets

Status: needs-triage

## Problem

The popular list on `/users` wraps the whole member in one link:

```svelte
<a href="/user/{user.username}" class="fg-dark col center">
	<Avatar {user} size="xl" />
	<h4>...</h4>
	<div>
		<span>{user.likes} likes</span>
		<span>{user.reviews} reviews</span>
	</div>
</a>
```

The link covers the avatar, the name and both counts, so it is far larger than
it looks. The hover state and the focus ring cover the whole block. A member
who wants to read a count still points at a link, and the counts cannot become
links of their own, because a link cannot hold a link.

`UserList.svelte` has a smaller version of the same problem. The link holds the
avatar and the name in one target.

## Scope

In the new cards from `02-large-user-card.md` and `06-user-row-card.md`, the
link envelops the avatar and the text that names the member, and nothing else.

- One link on the avatar. One link on the nickname and the username. Both go
  to the profile.
- Counts, package chips and the follow button sit outside every link.
- Give each count its own link where a page exists for it. Reviews go to
  `/user/[user]/reviews`, stacks to `/user/[user]/stacks`, likes to
  `/user/[user]/likes`.
- Two links to the same profile in one card need one accessible name each. The
  avatar link needs an `aria-label` or an `alt` that names the member, because
  the picture alone says nothing. Today the `alt` is the word `avatar` for
  every member.

The hover rules follow. `hov-line` on the name, and the avatar keeps the
outline rule that `Avatar.svelte` already sets for `a:focus-visible`.

The card is not one click target. A member who wants the profile clicks the
picture or the name.

## Notes

Fix the cards. Leave the old markup on `/users` alone, because
`02-large-user-card.md` and `06-user-row-card.md` delete it.
