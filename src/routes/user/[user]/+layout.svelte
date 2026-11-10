<script lang="ts">
	import { getProfile } from '#api/user.remote.ts';
	import FollowButton from '#lib/ui/FollowButton/index.ts';
	import Avatar from '#ui/Avatar.svelte';
	import { page } from '$app/state';

	let { children, params } = $props();
	const user = $derived(await getProfile(params.user));
</script>

{#snippet link(label: string, path = label, prefixes = [path])}
	<li>
		<a
			class="hov-link fg-dark"
			href="/user/{user.username}/{path}"
			class:active={prefixes.some((p) =>
				page.url.pathname.startsWith(`/user/${user.username}/${p}`)
			)}
		>
			{label}
		</a>
	</li>
{/snippet}
<div id="user-header" class="row btn bg-light space">
	<div class="row">
		<Avatar {user} size="sm" />
		<a href="/user/{user.username}" class="hov-line fg-red">
			{#if user.nickname}
				{user.nickname} ({user.username})
			{:else}
				{user.username}
			{/if}
		</a>
		<FollowButton.Compact {user} />
	</div>
	<ul class="row desktop" style="gap: 2rem">
		{@render link('reviews')}
		{@render link('stacks')}
		{@render link('network', 'following', [
			'following',
			'followers',
			'mutuals',
		])}
		{@render link('likes')}
		{@render link('stats')}
	</ul>
	<div></div>
</div>
<div class="user-subpage">{@render children?.()}</div>

<style>
	#user-header {
		padding: 0.5rem 1rem;
		margin-bottom: 1rem;
		@media (width <=950px) {
			margin: 0 1rem 1rem;
		}
	}

	.user-subpage {
		@media (width <=950px) {
			margin: 0 1rem;
		}
	}

	li a {
		text-transform: capitalize;
	}

	li a.active {
		--fg: var(--color-blue);
	}
</style>
