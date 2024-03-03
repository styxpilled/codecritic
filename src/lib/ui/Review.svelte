<script lang="ts">
	import { fetchUser } from '$lib/client/dexie';
	import { user } from '$lib/client/stores';
	import type { Review } from '$lib/types';
	import Avatar from './Avatar.svelte';
	import Rating from './Rating.svelte';
	import ReviewInfo from './ReviewInfo.svelte';

	export let review: Review;
</script>

<div class="review">
	<div class="review-head">
		{#if review.author === $user?.id}
			<ReviewInfo {review} user={$user} />
		{:else}
			{#await fetchUser(review.author)}
				<ReviewInfo {review} user={undefined} />
			{:then user}
				{#if user}
					<ReviewInfo {review} {user} />
				{/if}
			{/await}
		{/if}
	</div>
	<div class="review-body">
		<Rating rating={review.rating} />
		<p class="review-content">{review.review}</p>
		{#if $user}
			{#if review.author !== $user?.id}
				<button>❤︎ Like review</button>
			{/if}
		{:else}
			<p>Log in to like review!</p>
		{/if}
	</div>
</div>

<style>
	.review {
		padding: 0.5rem;
		margin: 0.5rem;
		background-color: #383d45;
		border-radius: 0.5rem;
	}

	.review-head {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.review-body {
		margin-left: 3.5rem;
	}

	.review-content {
		white-space: pre-wrap;
	}
</style>
