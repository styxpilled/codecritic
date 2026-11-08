<script lang="ts">
	import { getUserStacks } from '$api/stacks.remote';
	import { app } from '$lib/client/state.svelte.js';
	import Icon from '$ui/Icon.svelte';
	import List from '$ui/List.svelte';
	import Masonry from '$ui/Masonry.svelte';
	import Card from '$ui/Stack/Card.svelte';

	let { params } = $props();

	const stacksPromise = $derived(getUserStacks(params.user));
	const stacks = $derived(await stacksPromise);
	const owner = $derived(app.user?.username === params.user);
</script>

<svelte:head>
	<title>{params.user}'s stacks · Codecritic</title>
</svelte:head>

<List columns={1} groupID="user-stacks">
	{#snippet head()}
		<span>stacks by {params.user}</span>
		{#if owner}
			<a href="/stacks/new" class="hov-link row nogap">
				<Icon id="list-plus" size="1em" />
				new stack
			</a>
		{/if}
	{/snippet}
	{#if stacks.length}
		<Masonry items={stacks} columns={3}>
			{#snippet item(stack)}
				<Card {stack} />
			{/snippet}
		</Masonry>
	{:else}
		<p class="fg-dark">
			{#if owner}
				No stacks yet. <a href="/stacks/new" class="hov-link">Create one</a>
				.
			{:else}
				Nothing yet!
			{/if}
		</p>
	{/if}
</List>

<style>
	p {
		padding-left: 2ch;
	}
</style>
