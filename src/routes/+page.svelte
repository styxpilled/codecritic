<script lang="ts">
	import Card from '$ui/Card.svelte';
	import List from '$ui/List.svelte';
	import Review from '$ui/Review.svelte';

	export let data;
</script>

<div class="greeting">
	{#if data.auth.user}
		<h1>
			<!-- Don't reformat this because then we get a space before the ! -->
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
	{#if data.mutualReviews.length > 0}
		<List>
			<svelte:fragment slot="head">
				<span>new from mutuals</span>
				<span>more</span>
			</svelte:fragment>
			<svelte:fragment slot="body">
				{#each data.mutualReviews as review}
					<Review showPackageName truncateVersion fixedWidth truncate={4} {review} />
				{/each}
			</svelte:fragment>
		</List>
	{/if}
	<List>
		<svelte:fragment slot="head">
			<span>popular on codecritic</span>
			<span>more</span>
		</svelte:fragment>
		<svelte:fragment slot="body">
			{#each data.packages as pkg}
				<Card {pkg} />
			{/each}
		</svelte:fragment>
	</List>
	<List>
		<svelte:fragment slot="head">
			<span>Recommended</span>
			<span>All recommened</span>
		</svelte:fragment>
		<svelte:fragment slot="body">
			<p>Coming soon!</p>
		</svelte:fragment>
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
