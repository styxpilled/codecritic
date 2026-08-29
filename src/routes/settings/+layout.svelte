<script lang="ts">
	import { error } from '@sveltejs/kit';
	import { app } from '$lib/client/state.svelte';
	import Avatar from '$ui/Avatar.svelte';
	import SubNav from '$ui/SubNav.svelte';

	let { children } = $props();
	if (!app.user) error(401);
</script>

<svelte:head>
	<title>Settings · codecritic</title>
</svelte:head>

<main class="col start">
	<h1 class="row">
		{#if app.user}
			<a href="/user/{app.user.username}" class="col hov-light">
				<Avatar size="sm" user={app.user} />
			</a>
		{/if}
		Settings
	</h1>
	<SubNav
		links={[
			{ label: 'profile', href: '/settings' },
			{ label: 'account', href: '/settings/account' },
		]}
	/>
	{@render children?.()}
</main>

<style>
	main {
		width: 30rem;
		margin: 1rem 0;
		gap: 0.5rem;
		@media (width <= 950px) {
			width: 100%;
			padding: 0 1rem;
		}
	}

	h1 {
		font-size: 1.5rem;
	}
</style>
