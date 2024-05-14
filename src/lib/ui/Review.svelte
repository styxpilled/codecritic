<script lang="ts">
	import { enhance } from '$app/forms';
	import { user } from '$lib/client/stores';
	import type { Review } from '$lib/types';
	import Avatar from './Avatar.svelte';
	import Rating from './Rating.svelte';

	export let review: Review;
	export let showPackageName = false;
	export let showUserName = true;
	export let redirectToPackage = false;
</script>

<div class="review">
	<div class="review-head">
		<a class="avatar" href="/user/{review.author.username || ''}">
			<Avatar size="md" username={review.author?.username} />
		</a>
		<div class="review-info" class:center={true}>
			<div class="row">
				<div class="row">
					{#if showPackageName}
						<h2>
							<a
								class="hov-link hov-line fg-dark"
								href={redirectToPackage
									? `/packages/${review.package}`
									: `/packages/${review.package}/reviews/${review.id}`}
							>
								{review.package}
							</a>
						</h2>
					{:else}
						<p>
							<a class="fg-red hov-line" href="/user/{review.author.username || ''}">
								{review.author.nickname || review.author.username || 'Loading...'}
							</a>
							<a class="fg-purple" href="/packages/{review.package}/reviews/{review.id}">rated</a>
						</p>
					{/if}
					<Rating rating={review.rating} />
				</div>
				{#if review.author.id === $user?.id}
					<a href="/packages/{review.package}/reviews/{review.id}/edit">edit</a>
				{/if}
			</div>
			<p>
				{#if showUserName && showPackageName}
					<a class="fg-purple" href="/packages/{review.package}/reviews/{review.id}">review by</a>
					<a class="fg-red hov-line" href="/user/{review.author.username || ''}">
						{review.author.nickname || review.author.username || 'Loading...'}<span class="fg-text"
							>;</span
						>
					</a>
				{/if}
				<a href="/packages/{review.package}/reviews/{review.id}">
					<span class="fg-yellow">version</span>
					<span class="fg-green">"{review.version}"</span>
					<span class="fg-purple">on</span>
					<span class="fg-green">"{new Date(review.created_at).toLocaleDateString('en-US')}"</span>
				</a>
			</p>
		</div>
	</div>
	<div class="review-body">
		<p class="review-content">{review.review}</p>
		<div class="row">
			{#if $user}
				{#if review.author.id !== $user?.id}
					{#if review.liked}
						<form
							use:enhance
							on:submit={() => {
								review.liked = false;
								review.likes -= 1;
							}}
							method="post"
							action="/packages/{review.package}/reviews/{review.id}?/unlike"
						>
							<button style="color: var(--color-text-dark);"
								><span class="fg-red">❤︎</span> Liked</button
							>
						</form>
					{:else}
						<form
							use:enhance
							on:submit={() => {
								review.liked = true;
								review.likes += 1;
							}}
							method="post"
							action="/packages/{review.package}/reviews/{review.id}?/like"
						>
							<button><span>❤︎</span> Like review</button>
						</form>
					{/if}
				{/if}
			{:else}
				<p>Log in to like review!</p>
			{/if}
			{#if review.likes}
				<p>{review.likes} {review.likes === 1 ? 'like' : 'likes'}</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.review {
		padding: 0.5rem;
		margin: 0.5rem;
		background-color: var(--color-bg-bright);
		border-radius: 0.5rem;
		max-width: 50rem;
	}

	.review-head {
		margin-left: 0.25rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.avatar {
		height: 2.5rem;
		justify-self: center;
	}

	.review-info {
		display: flex;
		align-items: flex-start;
		flex-direction: column;
		width: 100%;
	}

	.review-info > .row {
		display: flex;
		width: 100%;
		justify-content: space-between;

		& > .row {
			gap: 0.25rem;
		}
	}

	.review-body {
		padding: 0.5rem;
		color: var(--color-text-darker);
		/* margin-left: 3.25rem; */
	}

	.review-content {
		white-space: pre-wrap;
	}
</style>
