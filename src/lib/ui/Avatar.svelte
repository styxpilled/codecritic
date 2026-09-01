<script lang="ts">
	import type { User } from '$lib/server/db/schema';

	type Props = Expand<
		{
			size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		} & (
			| {
					user: User;
					username?: undefined;
			  }
			| { username: string; user?: undefined }
		)
	>;

	let { size = 'md', username, user }: Props = $props();

	// svelte-ignore state_referenced_locally
	let pxSize = {
		xs: 32,
		sm: 32,
		md: 64,
		lg: 128,
		xl: 256,
	}[size];

	// Seeded users have a negative github id. GitHub has no avatar for them, so
	// the blank circle stays and no request goes out.
	const src = $derived(
		user
			? user.githubID < 0
				? null
				: `https://avatars.githubusercontent.com/u/${user.githubID}?size=${pxSize}`
			: `https://github.com/${username}.png?size=${pxSize}`
	);
</script>

<div class="avatar {size}">
	{#if src}
		<img
			draggable="false"
			class={size}
			height={pxSize}
			width={pxSize}
			{src}
			alt="avatar"
		/>
	{/if}
</div>

<style>
	:global(a:focus-visible:has(div.avatar)) {
		outline: none;
	}

	:global(a:focus-visible) div.avatar {
		outline: 2px solid var(--color-blue);
		outline-offset: 2px;
	}

	:global(a:has(> div.avatar.sm)) {
		height: 2rem;
	}

	.avatar {
		display: inline-block;
		height: 1.75rem;
		width: 1.75rem;
		background-color: whitesmoke;
		border-radius: 999px;
		transition: outline-offset 250ms ease-in-out;
		outline-offset: 0px;
	}

	img {
		user-select: none;
		border-radius: 999px;
		border: 1px solid #383d45bb;
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
