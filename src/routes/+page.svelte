<script lang="ts">
	import {
		getFriendLikedReviews,
		getFriendRecentReviews,
	} from '$api/friends.remote';
	import { getPopularPackages } from '$api/packages.remote';
	import { app } from '$lib/client/state.svelte';
	import { sliceArrayToMultiple } from '$lib/helpers';
	import List from '$ui/List.svelte';
	import Package from '$ui/Package';
	import Reviews from '$ui/Reviews.svelte';

	const popularPackages = $derived(
		await getPopularPackages({
			limit: 6,
		})
	);
	const friendLiked = $derived(
		app.user
			? await getFriendLikedReviews({
					limit: 4,
				})
			: []
	);
	const friendReviews = $derived(
		app.user
			? await getFriendRecentReviews({
					limit: 6,
				})
			: []
	);
</script>

<h1 class="fg-dark">
	{#if app.user}
		<span>
			Hello,
			<a href="/user/{app.user.username}" class="fg-red hov-line">
				{app.user.nickname || app.user.username}
			</a>
			!
		</span>
	{:else}
		Welcome to codecritic!
	{/if}
</h1>
<p class="fg-dark">Here's what your friends have been using:</p>
{#if friendReviews.length}
	<List columns={2}>
		{#snippet head()}
			<a href="/activity" class="hov-link">new from friends</a>
			<a href="/activity" class="hov-link">more</a>
		{/snippet}
		{#each sliceArrayToMultiple(friendReviews, 2) as review (review.id)}
			<Reviews
				{review}
				user={review.author}
				showUser
				headingFontSize={1.5}
				size="xs"
			/>
		{/each}
	</List>
{/if}
{#if friendLiked.length}
	<List columns={2}>
		{#snippet head()}
			<a href="/popular" class="hov-link">popular with friends</a>
			<a href="/popular" class="hov-link">more</a>
		{/snippet}
		{#each sliceArrayToMultiple(friendLiked, 2) as review (review.id)}
			<Reviews
				{review}
				user={review.author}
				showUser
				headingFontSize={1.5}
				size="xs"
			/>
		{/each}
	</List>
{/if}
<List>
	{#snippet head()}
		<a href="/packages/popular" class="hov-link">popular on codecritic</a>
		<a href="/packages/popular" class="hov-link">more</a>
	{/snippet}
	{#each sliceArrayToMultiple(popularPackages, 3) as pkg (pkg.name)}
		<Package {pkg} />
	{/each}
</List>

<style>
	h1 {
		margin: 2rem calc(min(4rem, 10vw)) 0rem;
	}

	p {
		margin-left: calc(min(3rem, 7vw));
		font-size: 1.5rem;
	}
</style>
