<script lang="ts">
	import Card from '$ui/Card.svelte';
	import List from '$ui/List.svelte';
	import Review from '$ui/Review.svelte';

	export let data;
</script>

<div class="packages-page col">
	<div>
		<ul class="packages">
			<List>
				<svelte:fragment slot="head">
					<span>Popular packages this week</span>
					<a href="/">TODO MORE</a>
				</svelte:fragment>
				<svelte:fragment slot="body">
					{#each data.packages as pkg}
						<Card {pkg} />
					{/each}
				</svelte:fragment>
			</List>
			<li></li>
		</ul>
	</div>
	<div>
		<h3>Popular reviews this week:</h3>
		<ul>
			{#each data.reviews as review}
				<Review showPackageName={true} {review} />
			{/each}
		</ul>
	</div>
</div>

<style>
	.packages-page {
		gap: 2rem;
	}

	ul.packages {
		display: flex;
		gap: 0.5rem;
	}
</style>
