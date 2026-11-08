<script lang="ts">
	import { getLikedReviews } from '#api/reviews.remote.ts';
	import { getLikedStacks } from '#api/stacks.remote.ts';
	import List from '#ui/List.svelte';
	import Masonry from '#ui/Masonry.svelte';
	import Reviews from '#ui/Reviews.svelte';
	import Card from '#ui/Stack/Card.svelte';

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
	{:else}
		<p class="fg-dark">{params.user} hasn't liked any reviews yet.</p>
	{/each}
</List>

<List columns={1}>
	{#snippet head()}
		<span>stacks liked by {params.user}</span>
	{/snippet}
	{#if likedReviews.length > 0}
		<Masonry items={likedStacks} columns={3} rows={3}>
			{#snippet item(stack)}
				<Card {stack} />
			{/snippet}
		</Masonry>
	{:else}
		<p class="fg-dark">{params.user} hasn't liked any stacks yet.</p>
	{/if}
</List>

<style>
	p {
		padding-left: 2ch;
	}
</style>
