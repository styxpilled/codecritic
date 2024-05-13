<script lang="ts">
	import { enhance } from '$app/forms';
	import { user } from '$lib/client/stores';
	import Avatar from '$ui/Avatar.svelte';
	import Review from '$ui/Review.svelte';

	export let data;
</script>

<div>
	<div class="row user-header">
		<div class="row">
			<Avatar size="lg" username={data.user.username} />
			<h1>
				{data.user.nickname} ({data.user.username})
			</h1>
			{#if data.user.id !== $user?.id}
				{#if data.user.user_follows}
					<form use:enhance action="/api/users/id/{data.user.id}/followers" method="delete">
						<button class="hover-interact" type="submit">
							<span class="btn hover-hide bg-green">Following</span>
							<span class="btn hover-show bg-yellow">Unfollow</span>
						</button>
					</form>
				{:else}
					<form use:enhance action="/api/users/id/{data.user.id}/followers" method="post">
						<button type="submit">Follow</button>
					</form>
				{/if}
			{/if}
		</div>
		<div class="row">
			<a href="/user/{data.user.username}/following" class="hov-link">
				<div class="vertical">
					<h4 class="mono">{data.user.following}</h4>
					<span class="caption">Following</span>
				</div>
			</a>
			<a href="/user/{data.user.username}/followers" class="hov-link">
				<div class="vertical">
					<h4 class="mono">{data.user.followers}</h4>
					<span class="caption">Followers</span>
				</div>
			</a>
			<a href="/user/{data.user.username}/reviews" class="hov-link">
				<div class="vertical">
					<h4 class="mono">{data.user.reviews}</h4>
					<span class="caption">Reviews</span>
				</div>
			</a>
		</div>
	</div>
</div>

<ul>
	{#each data.reviews as review}
		<li>
			<Review {review} showPackageName={true} showUserName={false} />
		</li>
	{/each}
</ul>

<style>
	.user-header.row {
		justify-content: space-between;
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
		width: 7rem;
	}

	.hover-hide {
		position: absolute;
		top: 0;
		width: 6rem;
		transition: top 150ms ease-in-out;
		display: flex;
	}

	.hover-interact:hover > .hover-hide {
		top: -2rem;
		/* display: none; */
	}

	.hover-show {
		position: absolute;
		top: 2rem;
		width: 6rem;
		display: flex;
		transition: top 150ms ease-in-out;
		/* display: none; */
	}

	.hover-interact:hover > .hover-show {
		top: 0rem;
	}
</style>
