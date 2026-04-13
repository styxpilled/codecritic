<script lang="ts">
	import { likeReview, unlikeReview } from '$api/reviews.remote';
	import { app } from '$lib/client/state.svelte';
	import type { Review, User } from '$lib/server/db/schema';
	import Avatar from './Avatar.svelte';
	import Rating from './Review/Rating.svelte';

	let {
		review,
		user,
		showUser,
		small,
		full,
	}: {
		review: Review & { liked?: boolean; likes?: number };
		user?: User;
		showUser?: boolean;
		small?: boolean;
		full?: boolean;
	} = $props();
</script>

<div class="review btn bg-light" class:small>
	<h4 class="fg-orange row">
		{#if showUser && user}
			<a href="/user/{user.username}" class="row">
				<Avatar {user} size="sm" />
			</a>
			<a
				href="/user/{user.username}/package/{review.packageID}/{review.index}"
				class="fg-red hov-line"
			>
				{#if user.nickname}
					{user.nickname} ({user.username})
				{:else}
					{user.username}
				{/if}
			</a>
		{/if}
		{#if !small}
			{#if full}
				<a href="/packages/{review.packageID}" class="hov-line">
					{review.packageID}
				</a>
			{:else if user}
				<a href="/user/{user.username}/package/{review.packageID}/{review.index}" class="hov-line">
					{review.packageID}
				</a>
			{:else}
				<a href="/review/{review.id}">{review.packageID}</a>
			{/if}
		{/if}
		<Rating rating={review.rating} />
	</h4>
	<p>
		<span class="fg-purple">{review.version}</span><span class="fg-dark">@</span><span
			class="fg-yellow">{review.createdAt.toLocaleDateString('en-GB')}</span
		>
	</p>
	<p class="content">{review.content}</p>
	<div class="row">
		{#if !app.user}
			<a href="/login/github" class="fg-dark">Log in to like</a>
		{:else if app.user.id !== review.authorID}
			<form
				{...(review.liked ? unlikeReview : likeReview).enhance(async ({ submit }) => {
					await submit();
					review.liked = !review.liked;
				})}
			>
				<input
					class="hidden"
					{...(review.liked ? unlikeReview : likeReview).fields.id.as('number')}
					value={review.id}
				/>
				{#if review.liked}
					<button class="fg-dark" type="submit">
						<span class="fg-red">❤︎</span> Liked
					</button>
				{:else}
					<button class="fg-dark" type="submit">
						<span>❤︎</span> Like
					</button>
				{/if}
			</form>
		{/if}
		{#if review.likes}
			<span class="fg-dark">
				{review.likes}
				{#if review.likes === 1}
					like
				{:else}
					likes
				{/if}
			</span>
		{/if}
	</div>
	{#if app.user && app.user.id === review.authorID}
		<a href="/packages/{review.packageID}/review/{review.index}/edit" class="fg-dark edit-btn">
			Edit
		</a>
	{/if}
</div>

<style>
	.review {
		padding: 0.75rem 1rem;
		width: 40rem;
		position: relative;
		/* margin-bottom: 1rem; */

		@media (width <=950px) {
			width: 100%;
		}
		&.small {
			width: 100%;
		}
	}

	h4 {
		font-size: 1.5rem;
	}

	/* input.hidden {
		display: none !important;
	} */
	.edit-btn {
		position: absolute;
		bottom: 0.75rem;
		right: 1rem;
		visibility: hidden;
	}

	.review:hover,
	.review:focus-within {
		& .edit-btn {
			visibility: visible;
		}
	}

	.content {
		white-space: pre-wrap;
	}
</style>
