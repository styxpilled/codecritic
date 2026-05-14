<script lang="ts">
	import { getUserReviews } from '$api/reviews.remote.js';
	import { follow, getProfile, unfollow } from '$api/user.remote.js';
	import { app } from '$lib/client/state.svelte.js';
	import Avatar from '$ui/Avatar.svelte';
	import FollowButton from '$ui/FollowButton.svelte';
	import Icon from '$ui/Icon.svelte';
	import List from '$ui/List.svelte';
	import Reviews from '$ui/Reviews.svelte';

	let { params } = $props();
	// svelte-ignore state_referenced_locally
	let user = $state(await getProfile(params.user));
	let reviewsPromise = $derived(getUserReviews({ username: params.user }));
	let reviews = $derived(await reviewsPromise);
	$effect(() => {
		getProfile(params.user).then((v) => {
			user = v;
		});
	});
</script>

{#snippet profile(c: 'mobile' | 'desktop')}
	{#if user.profile && (user.profile.bio || user.profile.url)}
		<div class="col start profile {c}">
			{#if user.profile.bio}
				<p class="fg-dark bio">
					<Icon size="1em" style="float: left; margin: 0.25rem;" id="notebook" />
					{user.profile.bio}
				</p>
			{/if}
			{#if user.profile.url}
				<p>
					<a class="fg-dark hov-link" href={user.profile.url}>
						<Icon size="1em" style="float: left; margin: 0.25rem;" id="globe" />
						{user.profile.url}
					</a>
				</p>
			{/if}
		</div>
	{/if}
{/snippet}

<svelte:head>
	<title>{user.username}'s profile · Codecritic</title>
</svelte:head>

<div id="user-profile">
	<div class="row space header">
		<div class="row">
			<Avatar {user} size="xl" />
			<div class="col start">
				<div class="row header-fields">
					<h1 class="fg-red">
						{#if user.nickname}
							{user.nickname} ({user.username})
						{:else}
							{user.username}
						{/if}
					</h1>
					{#if app.user?.id === user.id}
						<a href="/user" class="btn bg-light fg-dark hov-link hov-invert">Edit profile</a>
					{:else if !app.user}
						<a href="/login/github" class="fg-dark hov-link">Sign in to follow</a>
					{:else}
						<FollowButton bind:user />
					{/if}
				</div>
				{@render profile('desktop')}
			</div>
		</div>
		{@render profile('mobile')}
		<div class="info row">
			<a href="/user/{user.username}/following" class="col hov-link">
				<span class="mono">{user.following.toString().padStart(3, '0')}</span>
				<span>FOLLOWING</span>
			</a>
			<a href="/user/{user.username}/followers" class="col hov-link">
				<span class="mono">{user.followers.toString().padStart(3, '0')}</span>
				<span>FOLLOWERS</span>
			</a>
			<a href="/user/{user.username}/reviews" class="col hov-link">
				<span class="mono">000</span>
				<span>REVIEWS</span>
			</a>
		</div>
	</div>
	<nav>
		<ul class="row space">
			<li><a class="hov-link" href="/user/{user.username}/reviews">Reviews</a></li>
			<li><a class="hov-link" href="/user/{user.username}/stacks">Stacks</a></li>
			<li><a class="hov-link" href="/user/{user.username}/followers">Network</a></li>
			<li><a class="hov-link" href="/user/{user.username}/likes">Likes</a></li>
			<li><a class="hov-link" href="/user/{user.username}/stats">Stats</a></li>
		</ul>
	</nav>
	<div class="recent-reviews">
		<List columns={1}>
			{#snippet head()}
				<a href="/user/{params.user}/reviews/recent">recent reviews</a>
				<a href="/user/{params.user}/reviews/recent">more</a>
			{/snippet}
			{#each reviews as review (review.id)}
				<Reviews {review} {user} />
			{/each}
		</List>
	</div>
</div>

<style>
	#user-profile {
		padding: 1rem;
	}
	h1 {
		white-space: pre-wrap;
		word-break: break-word;
	}
	.bio {
		max-width: 30rem;
	}

	@media (width <=950px) {
		.header,
		.header-fields {
			flex-direction: column;
		}
		.bio {
			max-width: 20rem;
		}
		.profile {
			flex-direction: column;
		}
	}

	nav > ul {
		margin: 1rem 0;
		padding: 0.5rem;
		border-top: 1px solid var(--color-text-dark);
		border-bottom: 1px solid var(--color-text-dark);
		font-size: 1.25rem;
	}

	.info > a {
		gap: 0.25rem;
		line-height: 1;
		font-size: 0.75rem;
		letter-spacing: 0.075em;
		.mono {
			font-size: 1.125rem;
		}
	}

	.header-fields :global(form) {
		height: 1.5rem;
	}

	.recent-reviews {
		width: calc(min(30rem, 90vw));

		@media (width >= 950px) {
			padding: 0 2rem;
		}
	}
</style>
