<script lang="ts">
	import { enhance } from '$app/forms';
	import { user } from '$lib/client/stores';
	import Avatar from '$ui/Avatar.svelte';
	import Review from '$ui/Review.svelte';

	export let data;
</script>

<div>
	{#if data.reviews?.length > 0}
		<h3>Reviews:</h3>
		<ul>
			{#each data.reviews as review}
				<li>
					<Review {review} showPackageName={true} showUserName={false} />
				</li>
			{/each}
		</ul>
	{:else}
		<h3>No reviews yet!</h3>
	{/if}
</div>
