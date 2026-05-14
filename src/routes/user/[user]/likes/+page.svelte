<script lang="ts">
	import { getLikedReviews } from '$api/reviews.remote';
	import List from '$ui/List.svelte';
	import Reviews from '$ui/Reviews.svelte';

	let { params } = $props();

	let likedReviewsPromise = $derived(getLikedReviews(params.user));
	let likedReviews = $derived(await likedReviewsPromise);
</script>

<List>
	{#snippet head()}
		<span>reviews liked by {params.user}</span>
	{/snippet}
	{#each likedReviews as review (review.id)}
		<Reviews {review} showUser={true} user={review.author} />
	{/each}
</List>
