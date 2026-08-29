<script lang="ts">
	import { getUserReviews } from '$api/reviews.remote';
	import type { ReviewSort } from '$api/schemas';
	import { getProfile } from '$api/user.remote';
	import List from '$ui/List.svelte';
	import Reviews from '$ui/Reviews.svelte';

	let { username, sort }: { username: string; sort: ReviewSort } = $props();

	const user = $derived(await getProfile(username));
	const reviews = $derived(await getUserReviews({ username, sort }));
</script>

<svelte:head>
	<title>{username}'s reviews · Codecritic</title>
</svelte:head>

<List columns={1}>
	{#snippet head()}
		<span>{sort} reviews by {username}</span>
		<span>{reviews.length}</span>
	{/snippet}
	{#each reviews as review (review.id)}
		<Reviews {review} {user} />
	{/each}
</List>
{#if reviews.length === 0}
	<p class="fg-dark">{username} has written no reviews yet.</p>
{/if}
