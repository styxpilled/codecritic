<script lang="ts">
	import Card from '$ui/Card.svelte';
	import List from '$ui/List.svelte';

	export let data;
</script>

<div class="greeting">
	{#if data.auth.user}
		<h1>
			<span>
				Welcome back, <a class="fg-red hov-line" href="/user/{data.auth.user.username}"
					>{data.auth.user.nickname || data.auth.user.username}</a
				>!
			</span>
		</h1>
	{:else}
		<h1>Welcome to codecritic!</h1>
	{/if}
	<h3>Here's what your friends have been {data.greetMessage}:</h3>
	TODO: friends, friend activity
	<List>
		<svelte:fragment slot="head">
			<span>popular</span>
			<span>more</span>
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
