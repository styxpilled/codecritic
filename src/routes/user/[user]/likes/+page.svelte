<script lang="ts">
	import { getLikedReviews } from '$api/reviews.remote';
	import { getLikedStacks } from '$api/stacks.remote';
	import List from '$ui/List.svelte';
	import Reviews from '$ui/Reviews.svelte';
	import Card from '$ui/Stack/Card.svelte';

	let { params } = $props();

	let likedReviewsPromise = $derived(getLikedReviews(params.user));
	let likedReviews = $derived(await likedReviewsPromise);
	let likedStacksPromise = $derived(getLikedStacks(params.user));
	let likedStacks = $derived(await likedStacksPromise);
</script>

<List>
	{#snippet head()}
		<span>reviews liked by {params.user}</span>
	{/snippet}
	{#each likedReviews as review (review.id)}
		<Reviews {review} showUser={true} user={review.author} />
	{/each}
</List>

<List>
	{#snippet head()}
		<span>stacks liked by {params.user}</span>
	{/snippet}
	{#each likedStacks as stack (stack.id)}
		<Card {stack} />
	{/each}
</List>
