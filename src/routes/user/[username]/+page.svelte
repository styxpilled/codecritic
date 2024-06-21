<script lang="ts">
	import List from '$ui/List.svelte';
	import Review from '$ui/Review.svelte';
	import Banner1 from '$ui/banners/Banner1.svelte';
	export let data;
</script>

<div class="row start">
	{#if data.reviews?.length > 0}
		<List width="full" wrap={false}>
			<svelte:fragment slot="head">
				<h3>Reviews:</h3>
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
	<Banner1 />
</div>

<style>
	.row.start {
		padding: 1rem;
		gap: 1rem;
	}
</style>
