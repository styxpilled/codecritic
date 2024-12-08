<script lang="ts">
	import Banner from '$ui/banners/Banner.svelte';
	import Card from '$ui/Card.svelte';
	import List from '$ui/List.svelte';
	import Review from '$ui/Review.svelte';
	import SimplePage from '$ui/SimplePage.svelte';

	let { data } = $props();
</script>

<SimplePage>
	<div class="col header-start">
		{#if data.auth.user}
			<h2 class="fg-dark">
				<!-- Don't reformat this because then we get a space before the ! -->
				<span>
					Welcome back, <a class="fg-red hov-line" href="/user/{data.auth.user.username}"
						>{data.auth.user.nickname || data.auth.user.username}</a
					>!
				</span>
			</h2>
			<h2 class="fg-dark">Here's what your friends have been {data.greetMessage}:</h2>
		{:else}
			<h2 class="fg-dark">Welcome to codecritic!</h2>
			<h2 class="fg-dark">Sign up to see what your friends have been {data.greetMessage}:</h2>
		{/if}
	</div>
	{#if data.mutualReviews.length > 0}
		<List>
			{#snippet head()}
				<span>new from mutuals</span>
				<span>more</span>
			{/snippet}
			{#snippet body()}
				{#each data.mutualReviews as review}
					<Review showPackageName truncateVersion fixedWidth truncate={4} {review} />
				{/each}
			{/snippet}
		</List>
	{/if}
	<List>
		{#snippet head()}
			<span>popular on codecritic</span>
			<span>more</span>
		{/snippet}
		{#snippet body()}
			{#each data.packages as pkg}
				<Card {pkg} />
			{/each}
		{/snippet}
	</List>
	<Banner rand={data.rand} banner={data.ad} />
	<List>
		{#snippet head()}
			<span>Recommended</span>
			<span>All recommended</span>
		{/snippet}
		{#snippet body()}
			<p>Coming soon!</p>
		{/snippet}
	</List>
</SimplePage>
