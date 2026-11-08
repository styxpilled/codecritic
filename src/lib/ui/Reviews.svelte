<script lang="ts">
	import { optSubpath } from '$lib';
	import { app } from '$lib/client/state.svelte';
	import type { Review, User } from '$lib/server/db/schema';
	import Avatar from './Avatar.svelte';
	import LikeButton from './Review/LikeButton.svelte';
	import Rating from './Review/Rating.svelte';

	let {
		review,
		user,
		showUser,
		heading = 'package',
		small,
		full,
		truncate = true,
		headingFontSize,
		size = 'sm',
	}: {
		review: Review & { liked?: boolean; likes?: number };
		user?: User;
		showUser?: boolean;
		heading?: 'username' | 'package';
		small?: boolean;
		full?: boolean;
		truncate?: boolean;
		headingFontSize?: number;
		size?: 'sm' | 'xs';
	} = $props();
</script>

<div class="review btn bg-light" class:small class:truncate>
	<h4
		class="fg-orange row space start"
		style:font-size={headingFontSize ? `${headingFontSize}rem` : undefined}
	>
		<span class="row review-title">
			{#if (showUser || heading === 'username') && user}
				<a href="/user/{user.username}" class="row" title={user.username}>
					<Avatar {user} {size} />
				</a>
				{#if heading === 'username'}
					<a
						href="/user/{user.username}/package/{review.packageID}/{optSubpath(
							review.index
						)}"
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
						href="/user/{user.username}/package/{review.packageID}/{optSubpath(
							review.index
						)}"
						class="hov-line"
						style="max-height: 1lh; white-space: nowrap;"
					>
						{review.packageID}
					</a>
				{:else}
					<a href="/review/{review.id}">{review.packageID}</a>
				{/if}
			{/if}
		</span>
		<Rating rating={review.rating} />
	</h4>
	<p class="row nogap">
		{#if heading === 'package' && user && showUser}
			<a href="/user/{user.username}" class="fg-red hov-line">
				{user?.username}
			</a>
		{/if}
		<span class="fg-dark">^</span>
		<span class="fg-purple">{review.version}</span>
		<span class="fg-dark">@</span>
		<span class="fg-green">
			{review.createdAt.toLocaleDateString('en-GB')}
		</span>
	</p>
	<p class="content">
		{#if user}
			<a
				href="/user/{user.username}/package/{review.packageID}/{optSubpath(
					review.index
				)}"
			>
				{review.content}
			</a>
		{:else}
			<a href="/review/{review.id}">{review.content}</a>
		{/if}
	</p>
	<LikeButton {review} {user} />
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
		/* width: 40rem; */
		/* width: 100%; */
		/* position: relative; */
		/* margin-bottom: 1rem; */
		/* Necessary for shrinking on mobile */
		overflow: hidden;
		/* min-width: 0; */
		@media (width <= 950px) {
			/* width: 100%; */
			/* max-width: 80vw; */
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

		.review-title {
			max-width: 80%;
			overflow: hidden;
			& > .hov-line {
				margin-top: -2px;
			}
		}
	}

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
