<script lang="ts">
	import List from '$ui/List.svelte';
	import Review from '$ui/Review.svelte';
	export let data;
</script>

<div class="row start">
	{#if data.reviews?.length > 0}
		<List width="full" wrap={false}>
			<svelte:fragment slot="head">
				<span>Reviews</span>
			</svelte:fragment>
			<svelte:fragment slot="body">
				{#each data.reviews as review}
					<Review {review} showPackageName={true} showUserName={false} />
				{/each}
			</svelte:fragment>
		</List>
	{:else}
		<h3>No reviews yet!</h3>
	{/if}
</div>

<style>
	.row.start {
		gap: 1rem;
	}
</style>
