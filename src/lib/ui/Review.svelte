<script lang="ts">
	import { fetchUser } from '$lib/client/dexie';
	import type { Review } from '$lib/types';
	import Avatar from './Avatar.svelte';
	import Rating from './Rating.svelte';

	export let review: Review;
</script>

<div class="review">
	<div class="review-head">
		{#await fetchUser(review.author)}
			<Avatar username={undefined} />
			<p>
				Used by
				<span class="link">Loading...</span>
				{new Date(review.created_at).toLocaleDateString('en-US')}
			</p>
		{:then user}
			{#if user}
				<Avatar username={user.username} />
				<p>
					Used by
					<a href="/users/{user.username}">{user.nickname || user.username}</a>
					{new Date(review.created_at).toLocaleDateString('en-US')}
				</p>
			{/if}
		{/await}
	</div>
	<div class="review-content">
		<Rating rating={review.rating} />
		<p>{review.review}</p>
	</div>
</div>

<style>
	.review-head {
		display: flex;
		gap: 1rem;
	}

	a,
	.link {
		color: red;
	}
</style>
