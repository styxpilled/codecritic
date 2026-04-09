<script lang="ts">
	import { getProfile } from '$api/user.remote.js';
	import { page } from '$app/state';
	import Avatar from '$ui/Avatar.svelte';

	let { children, params } = $props();
	const user = $derived(await getProfile(params.user));
</script>

{#snippet link(label: string)}
	<li>
		<a
			class="hov-link fg-dark"
			href="/user/{user.username}/{label}"
			class:active={page.url.pathname === `/user/${user.username}/${label}`}
		>
			{label}
		</a>
	</li>
{/snippet}
<div id="user-header" class="row btn bg-light space">
	<div class="row">
		<Avatar {user} size="sm" />
		<a href="/user/{user.username}" class="hov-link">
			{#if user.nickname}
				{user.nickname} ({user.username})
			{:else}
				{user.username}
			{/if}
		</a>
	</div>
	<ul class="row" style="gap: 2rem">
		{@render link('reviews')}
		{@render link('stacks')}
		{@render link('network')}
		{@render link('likes')}
		{@render link('stats')}
	</ul>
	<div></div>
</div>
{@render children?.()}

<style>
	#user-header {
		padding: 0.5rem 1rem;
		margin-bottom: 2rem;
	}

	li a {
		text-transform: capitalize;
	}
</style>
