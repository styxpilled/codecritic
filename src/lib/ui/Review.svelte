<script lang="ts">
	import { enhance } from '$app/forms';
	import { user } from '$lib/client/stores';
	import type { Review } from '$lib/types';
	import Avatar from './Avatar.svelte';
	import Rating from './Rating.svelte';

	export let review: Review;
	export let showPackageName = false;
</script>

<div class="review">
	<div class="review-head">
		<a href="/user/{review.author.username || ''}">
			<Avatar size="lg" username={review.author?.username} />
		</a>
		<div class="review-info">
			<a href="/packages/{review.package}">
				{#if showPackageName}
					<h2>{review.package}</h2>
				{/if}
			</a>
			<a class="link" href="/user/{review.author.username || ''}">
				{review.author.nickname || review.author.username || 'Loading...'}
			</a>
		</div>
		<a href="/packages/{review.package}/reviews/{review.id}">
			Version
			<span>{review.version}</span>
			on
			<span>{new Date(review.created_at).toLocaleDateString('en-US')}</span>
		</a>
	</div>
	<div class="review-body">
		<Rating rating={review.rating} />
		<p class="review-content">{review.review}</p>
		{#if $user}
			{#if review.author.id !== $user?.id}
				{#if review.liked}
					<form
						use:enhance
						on:submit={() => (review.liked = true)}
						method="post"
						action="/packages/{review.package}/reviews/{review.id}?/unlike"
					>
						<button><span class="accent-alt">❤︎</span> Liked</button>
					</form>
				{:else}
					<form
						use:enhance
						on:submit={() => (review.liked = false)}
						method="post"
						action="/packages/{review.package}/reviews/{review.id}?/like"
					>
						<button>❤︎ Like review</button>
					</form>
				{/if}
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
		align-items: flex-start;
		gap: 1rem;
	}

	.review-info {
		display: flex;
		flex-direction: column;
	}

	.review-body {
		margin-left: 3.5rem;
	}

	.review-content {
		white-space: pre-wrap;
	}
</style>
