<script lang="ts">
	import type { Review } from '$lib/types';
	import { enhance } from '$app/forms';
	import { user } from '$lib/client/stores';
	import Avatar from './Avatar.svelte';
	import Rating from './Rating.svelte';

	interface Props {
		style?: string;
		review: Review;
		showPackageName?: boolean;
		showUserName?: boolean;
		redirectToPackage?: boolean;
		truncate?: number | undefined;
		truncateVersion?: boolean;
		fixedWidth?: boolean;
	}

	let {
		style = '',
		review = $bindable(),
		showPackageName = false,
		showUserName = true,
		redirectToPackage = false,
		truncate = 8,
		truncateVersion = false,
		fixedWidth = false
	}: Props = $props();
</script>

<div class="review" {style} class:fixed-width={fixedWidth}>
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
								class="hov-link hov-line fg-blue"
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
					<a class="edit-btn hov-link" href="/packages/{review.package}/reviews/{review.id}/edit"
						><LucidePen /></a
					>
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
				<a href="/packages/{review.package}/reviews/{review.id}" style="display: block;">
					<span class="fg-yellow hov-light">version</span>
					<span class="fg-green hov-light">
						{#if truncateVersion}
							{@const sixthChar = review.version.charAt(5)}
							{@const index = sixthChar >= '0' && sixthChar <= '9' ? 6 : 5}
							<span class="hoverable">
								<span>"{review.version.slice(0, index)}"</span>
								<span class="hoverable-content">{review.version}</span>
							</span>
						{:else}
							"{review.version}"
						{/if}
					</span>
					<span class="fg-purple hov-light">on</span>
					<span class="fg-green hov-light">
						"{new Date(review.created_at).toLocaleDateString('en-US')}"
					</span>
				</a>
			</p>
		</div>
	</div>
	<div class="review-body">
		<p
			class="review-content"
			class:truncate
			style={truncate ? `-webkit-line-clamp: ${truncate};` : ''}
		>
			{review.review}
		</p>
		<div class="row">
			{#if $user}
				{#if review.author.id !== $user?.id}
					{#if review.liked}
						<form
							use:enhance
							onsubmit={() => {
								review.liked = false;
								review.likes -= 1;
							}}
							method="post"
							action="/packages/{review.package}/reviews/{review.id}?/unlike"
						>
							<button style="color: var(--color-text-dark);"
								><span class="fg-red no-twemoji">❤︎</span> Liked</button
							>
						</form>
					{:else}
						<form
							use:enhance
							onsubmit={() => {
								review.liked = true;
								review.likes += 1;
							}}
							method="post"
							action="/packages/{review.package}/reviews/{review.id}?/like"
						>
							<button><span class="no-twemoji">❤︎</span> Like review</button>
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
		background-color: var(--color-bg-bright);
		border-radius: 0.5rem;
		width: 100%;
		max-width: 50rem;
	}

	.review.fixed-width {
		width: 20.65rem;
		height: 100%;
	}

	.edit-btn {
		display: none;
	}

	.review:hover .edit-btn {
		display: block;
	}

	.review-head {
		margin-left: 0.25rem;
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
	}

	.avatar {
		margin-top: 0.5rem;
		height: 3rem;
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
		text-overflow: ellipsis;
	}

	.review-content.truncate {
		display: -webkit-box;
		overflow: hidden;
		-webkit-box-orient: vertical;
	}
</style>
