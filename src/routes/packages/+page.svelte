<script lang="ts">
	import { examples } from '$lib/types';
	import Card from '$ui/Card.svelte';
	import List from '$ui/List.svelte';
	import Review from '$ui/Review.svelte';

	export let data;
</script>

<div>
	<h3>Popular packages this week:</h3>
	<ul class="packages">
		<List>
			<svelte:fragment slot="head">
				<span>TODO</span>
				<span>TODO</span>
			</svelte:fragment>
			<svelte:fragment slot="body">
				{#each data.packages as pkg}
					<Card {pkg} />
				{/each}
			</svelte:fragment>
		</List>
		<li></li>
	</ul>
	<h3>Popular reviews this week:</h3>
	<ul>
		{#each data.reviews as review}
			<Review showPackageName={true} {review} />
		{/each}
	</ul>
</div>

<style>
	ul.packages {
		display: flex;
		gap: 0.5rem;
	}
</style>
