<script lang="ts">
	import { enhance } from '$app/forms';
	import { user } from '$lib/client/stores';
	import Avatar from '$ui/Avatar.svelte';
	import Review from '$ui/Review.svelte';

	export let data;
</script>

<div class="row user-header">
	<div class="row">
		<Avatar size="lg" username={data.user.username} />
		<h1>
			{#if data.user.nickname}
				{data.user.nickname} ({data.user.username})
			{:else}
				{data.user.username}
			{/if}
		</h1>
		{#if data.user.id !== $user?.id}
			{#if data.user.user_follows}
				<form use:enhance action="/user/{data.user.username}?/unfollow" method="post">
					<input class="hidden" type="text" name="id" value={data.user.id} />
					<button class="hover-interact" type="submit">
						<span class="btn hover-hide bg-green">
							{#if data.user.follows_user}
								<span>Mutuals</span>
							{:else}
								<span>Following</span>
							{/if}
						</span>
						<span class="btn hover-show bg-yellow">Unfollow</span>
					</button>
				</form>
			{:else if $user === null}
				<a class="btn fg-dark" href="/login/github">Sign in to follow</a>
			{:else}
				<form use:enhance action="/user/{data.user.username}?/follow" method="post">
					<input class="hidden" type="text" name="id" value={data.user.id} />
					<button class="hover-interact" type="submit">
						<span class="btn hover-hide bg-yellow">
							{#if data.user.follows_user}
								<span>Follows you</span>
							{:else}
								<span>Follow</span>
							{/if}
						</span>
						<span class="btn hover-show bg-blue">Follow</span>
					</button>
				</form>
			{/if}
		{/if}
	</div>
	<div class="row">
		<a href="/user/{data.user.username}/following" class="hov-link">
			<div class="vertical">
				<h4 class="mono">{data.user.following.padStart(3, '0')}</h4>
				<span class="caption">Following</span>
			</div>
		</a>
		<a href="/user/{data.user.username}/followers" class="hov-link">
			<div class="vertical">
				<h4 class="mono">{data.user.followers.padStart(3, '0')}</h4>
				<span class="caption">Followers</span>
			</div>
		</a>
		<a href="/user/{data.user.username}/reviews" class="hov-link">
			<div class="vertical">
				<h4 class="mono">{(data.user.reviews + '').padStart(3, '0')}</h4>
				<span class="caption">Reviews</span>
			</div>
		</a>
	</div>
</div>
<div>
	{#if data.reviews?.length > 0}
		<h3>Reviews:</h3>
		<ul>
			{#each data.reviews as review}
				<li>
					<Review {review} showPackageName={true} showUserName={false} />
				</li>
			{/each}
		</ul>
	{:else}
		<h3>No reviews yet!</h3>
	{/if}
</div>

<style>
	.user-header.row {
		justify-content: space-between;
		padding: 1rem 0;
	}

	.vertical {
		display: flex;
		flex-direction: column;
		align-items: center;

		& > .caption {
			text-transform: uppercase;
			font-size: 0.75rem;
			font-weight: 400;
			letter-spacing: 0.075em;
		}
	}

	.hover-interact {
		position: relative;
		overflow: hidden;
		height: 1.5rem;
		/* width: 7rem; */
		width: 7rem;
	}

	.hover-hide {
		display: flex;
		position: absolute;
		top: 0;
		width: 100%;
		transition: top 150ms ease-in-out;
	}

	.hover-interact:hover > .hover-hide {
		top: -2rem;
		/* display: none; */
	}

	.hover-show {
		display: flex;
		position: absolute;
		top: 2rem;
		width: 100%;
		transition: top 150ms ease-in-out;
		/* display: none; */
	}

	.hover-interact:hover > .hover-show {
		top: 0rem;
	}
</style>
