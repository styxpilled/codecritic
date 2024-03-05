<script lang="ts">
	import Card from '$ui/Card.svelte';
	import List from '$ui/List.svelte';

	export let data;
</script>

<div class="greeting">
	{#if data.auth.user}
		<h1>Welcome back, {data.auth.user.nickname || data.auth.user.username}!</h1>
	{:else}
		<h1>Welcome to codecritic!</h1>
	{/if}
	<p>Here's what your friends have been {data.greetMessage}:</p>
	TODO: friends, friend activity
	<List>
		<svelte:fragment slot="head">
			<span>New from friends</span>
			<span>All activity</span>
		</svelte:fragment>
		<svelte:fragment slot="body">
			{#each data.packages as pkg}
				<Card {pkg} />
			{/each}
		</svelte:fragment>
	</List>
	<List>
		<span>Recommended</span>
		<span>All recommened</span>
	</List>
</div>

<style>
	.greeting {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}
</style>
