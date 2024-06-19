<script lang="ts">
	import { enhance } from '$app/forms';
	import { user } from '$lib/client/stores';
	import Avatar from '$ui/Avatar.svelte';
	import List from '$ui/List.svelte';
	import Review from '$ui/Review.svelte';

	export let data;
</script>

<div>
	{#if data.reviews?.length > 0}
		<h3>Reviews:</h3>
		<List width="full" wrap={false}>
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
