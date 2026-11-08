<script lang="ts">
	import { minidenticon } from 'minidenticons';
	import type { Snippet } from 'svelte';
	import { hashColor } from '$lib';
	import type { User } from '$lib/server/db/schema';

	type Props = Expand<
		{
			size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
			/** Sits in the bottom right corner. Meant for `lg` and `xl` only. */
			badge?: Snippet;
			link?: Snippet<[Snippet]>;
		} & (
			| {
					user: User;
					username?: undefined;
			  }
			| { username: string; user?: undefined }
		)
	>;

	let { size = 'md', username, user, badge, link }: Props = $props();

	// svelte-ignore state_referenced_locally
	let pxSize = {
		xs: 32,
		sm: 32,
		md: 64,
		lg: 128,
		xl: 256,
	}[size];

	const name = $derived(user?.username ?? username ?? '');

	// Seeded users have a negative github id. GitHub has no avatar for them, so
	// they get an identicon and no request goes out.
	const src = $derived(
		user
			? user.githubID < 0
				? null
				: `https://avatars.githubusercontent.com/u/${user.githubID}?size=${pxSize}`
			: `https://github.com/${username}.png?size=${pxSize}`
	);
	// The library picks its own hue. The site color wins through `fill`.
	const identicon = $derived(src ? '' : minidenticon(name));
</script>

{#snippet avatar()}
	{#if src}
		<img
			draggable="false"
			class="avatar-img {size}"
			height={pxSize}
			width={pxSize}
			{src}
			alt="{name}'s avatar"
		/>
	{:else if identicon}
		<span class="identicon {size} fg-{hashColor(name)}" aria-hidden="true">
			<!-- The library hashes the name into rects. No user text reaches the markup. -->
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html identicon}
		</span>
	{/if}
{/snippet}
<div class="avatar {size}">
	{#if link}
		{@render link(avatar)}
	{:else}
		{@render avatar()}
	{/if}
	{#if badge}
		<span class="badge">{@render badge()}</span>
	{/if}
</div>

<style>
	:global(a:focus-visible:has(div.avatar)),
	:global(a:focus-visible:has(.avatar-img)),
	:global(a:focus-visible:has(.identicon)) {
		outline: none;
	}

	:global(a:focus-visible) div.avatar,
	:global(a:focus-visible .avatar-img),
	:global(a:focus-visible .identicon) {
		border-radius: 100%;
		outline: 2px solid var(--color-blue);
		outline-offset: 2px;
	}

	:global(a:has(> div.avatar.sm)) {
		height: 2rem;
	}

	.avatar {
		display: inline-block;
		position: relative;
		height: 1.75rem;
		width: 1.75rem;
		background-color: whitesmoke;
		border-radius: 999px;
		transition: outline-offset 250ms ease-in-out;
		outline-offset: 0px;
	}

	img,
	.identicon {
		user-select: none;
		border-radius: 999px;
		transition: outline-offset 250ms ease-in-out;
		outline-offset: 0px;
		/* border: 1px solid #383d45bb; */
	}

	.identicon {
		display: block;
		box-sizing: border-box;
		background: white;
		/* background-color: var(--color-bg-brighter); */
		/* The border, the same as the image. */
		/* background-color: var(--bg, var(--color-bg-brighter)); */
		padding: 12%;
	}

	.identicon :global(svg) {
		display: block;
		height: 100%;
		width: 100%;
		fill: var(--fg);
		stroke: var(--fg);
		stroke-width: 0.1px;
	}

	.badge {
		position: absolute;
		right: 0;
		bottom: 0;
		display: block;
		line-height: 0;
	}

	.xs {
		min-height: 1.5rem;
		min-width: 1.5rem;
	}

	.sm {
		min-height: 2rem;
		min-width: 2rem;
	}

	.md {
		min-height: 3rem;
		min-width: 3rem;
	}

	.lg {
		min-height: 4rem;
		min-width: 4rem;
	}

	.xl {
		min-height: 8rem;
		min-width: 8rem;
	}
</style>
