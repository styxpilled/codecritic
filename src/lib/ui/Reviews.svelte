<script lang="ts">
	import { likeReview, unlikeReview } from '$api/reviews.remote';
	import { optSubpath } from '$lib';
	import { app } from '$lib/client/state.svelte';
	import type { Review, User } from '$lib/server/db/schema';
	import Avatar from './Avatar.svelte';
	import Rating from './Review/Rating.svelte';

	let {
		review,
		user,
		showUser,
		showUsername,
		small,
		full,
		truncate = true,
		headingFontSize,
		size = 'sm',
	}: {
		review: Review & { liked?: boolean; likes?: number };
		user?: User;
		showUser?: boolean;
		showUsername?: boolean;
		small?: boolean;
		full?: boolean;
		truncate?: boolean;
		headingFontSize?: number;
		size?: 'sm' | 'xs';
	} = $props();
</script>

<div class="review btn bg-light" class:small class:truncate>
	<h4 class="fg-orange row" style:font-size={headingFontSize ? `${headingFontSize}rem` : undefined}>
		{#if (showUser || showUsername) && user}
			<a href="/user/{user.username}" class="row" title={user.username}>
				<Avatar {user} {size} />
			</a>
			{#if showUsername}
				<a
					href="/user/{user.username}/package/{review.packageID}/{optSubpath(review.index)}"
					class="fg-red hov-line"
				>
					{#if user.nickname}
						{user.nickname} ({user.username})
					{:else}
						{user.username}
					{/if}
				</a>
			{/if}
		{/if}
		{#if !small}
			{#if full}
				<a href="/packages/{review.packageID}" class="hov-line">
					{review.packageID}
				</a>
			{:else if user}
				<a
					href="/user/{user.username}/package/{review.packageID}/{optSubpath(review.index)}"
					class="hov-line"
				>
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
				{...(review.liked ? unlikeReview : likeReview)
					.for(review.id)
					.enhance(async ({ submit }) => {
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
					<button class="fg-dark hov-light" type="submit">
						<span class="fg-red">❤︎</span> Liked
					</button>
				{:else}
					<button class="fg-dark hov-light" type="submit">
						<span>❤︎</span> Like
					</button>
				{/if}
			</form>
		{/if}
		{#if review.likes}
			{@const url = user
				? `/user/${user.username}/package/${review.packageID}/${optSubpath(review.index)}likes`
				: `"/review/${review.id}"`}
			<a href={url} class="fg-dark hov-line">
				{review.likes}
				{#if review.likes === 1}
					like
				{:else}
					likes
				{/if}
			</a>
		{/if}
	</div>
	{#if app.user && app.user.id === review.authorID}
		<a
			href="/packages/{review.packageID}/review/{review.index}/edit"
			class="fg-dark edit-btn hov-light"
		>
			Edit
		</a>
	{/if}
</div>

<style>
	.review {
		padding: 0.75rem 1rem;
		width: 40rem;
		width: 100%;
		position: relative;
		/* margin-bottom: 1rem; */

		@media (width <=950px) {
			width: 100%;
		}
		&.small {
			width: 100%;
			& h4 {
				font-size: 1.25rem;
			}
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

	.truncate .content {
		width: 100%;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		overflow: hidden;
	}

	.content {
		white-space: pre-wrap;
	}
</style>
