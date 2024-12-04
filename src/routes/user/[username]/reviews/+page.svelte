<script lang="ts">
	import List from '$ui/List.svelte';
	import Review from '$ui/Review.svelte';
	interface Props {
		data: any;
	}

	let { data }: Props = $props();
</script>

<div class="row start">
	{#if data.reviews?.length > 0}
		<List width="full" wrap={false}>
			{#snippet head()}
					
					<span>Reviews</span>
				
					{/snippet}
			{#snippet body()}
					
					{#each data.reviews as review}
						<Review {review} showPackageName={true} showUserName={false} />
					{/each}
				
					{/snippet}
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
