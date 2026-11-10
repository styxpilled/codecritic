<script lang="ts">
	import { follow, getProfile, unfollow } from '#api/user.remote.ts';
	import { app } from '#lib/client/state.svelte.ts';
	import type { FollowUser } from '#lib/types.ts';
	import Icon from '#ui/Icon.svelte';

	let { user = $bindable() }: { user: FollowUser } = $props();
	// One form instance can attach to one <form> only, so key it per component.
	const uid = $props.id();
	// Local, so the toggle shows even when `user` is not reactive.
	let following = $derived(user.userFollows);
	const form = $derived((following ? unfollow : follow).for(uid));
</script>

{#if !app.user}
	<a
		href="/login/github"
		class="compact bg-blue"
		aria-label="Sign in to follow"
	>
		<Icon id="plus" size="1em" />
	</a>
{:else if app.user.id !== user.id}
	<form
		{...form.enhance(async ({ submit }) => {
			following = !following;
			if (user?.followers) {
				user.followers += following ? 1 : -1;
			}
			await submit().updates(getProfile(user.username));
		})}
	>
		<input
			{...form.fields.username.as('text')}
			value={user.username}
			class="hidden"
		/>
		{#if following}
			<button
				class="compact bg-green"
				type="submit"
				aria-label="Unfollow {user.username}"
			>
				<Icon id="check" size="1em" />
				<Icon id="minus" size="1em" />
			</button>
		{:else}
			<button
				class="compact bg-blue"
				type="submit"
				aria-label="Follow {user.username}"
			>
				<Icon id="plus" size="1em" />
			</button>
		{/if}
	</form>
{/if}

<style>
	.compact {
		--hov: var(--fg);
		--hov-fg: var(--bg);

		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 1.75rem;
		width: 1.75rem;
		border: none;
		border-radius: 999px;
		box-shadow: inset 0 0 0 1.5px var(--color-bg);
		cursor: pointer;
		overflow: hidden;
		isolation: isolate;
		font-size: 1.125rem;
		line-height: 1;
	}

	/* The hover fill grows from the middle in a second color. */
	.compact::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 999px;
		background-color: var(--hov);
		transform: scale(0);
		transition: transform 200ms ease-in-out;
		z-index: -1;
	}

	.compact:hover,
	.compact:focus-visible {
		outline: none;
		color: var(--hov-fg);
	}

	.compact:hover::before,
	.compact:focus-visible::before {
		transform: scale(1.1);
	}

	.compact.bg-green {
		--hov: var(--color-red);
		--hov-fg: var(--color-bg-brighter);
	}

	/* Following shows a check. On hover the check gives way to a minus. */
	.compact.bg-green :global(svg) {
		position: absolute;
		transition: opacity 150ms ease-in-out;
	}
	.compact.bg-green :global(svg:last-child),
	.compact.bg-green:hover :global(svg:first-child),
	.compact.bg-green:focus-visible :global(svg:first-child) {
		opacity: 0;
	}
	.compact.bg-green:hover :global(svg:last-child),
	.compact.bg-green:focus-visible :global(svg:last-child) {
		opacity: 1;
	}
</style>
