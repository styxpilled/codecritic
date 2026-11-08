<script lang="ts">
	import { getUserReviews } from '#api/reviews.remote.ts';
	import { toPackageName } from '#lib';
	import List from '#ui/List.svelte';
	import Reviews from '#ui/Reviews.svelte';

	let { params } = $props();

	const reviews = $derived(
		await getUserReviews({
			username: params.user,
			pkg: toPackageName(params),
			limit: 50,
		})
	);
</script>

<List columns={1}>
	{#snippet head()}
		<span>Reviews for {toPackageName(params)} by {params.user}</span>
	{/snippet}
	{#each reviews as review (review.id)}
		<Reviews {review} />
	{/each}
</List>
