<script lang="ts">
	import { enhance } from '$app/forms';
	import { user } from '$lib/client/stores';
	import Avatar from '$ui/Avatar.svelte';
	import List from '$ui/List.svelte';

	export let data;
</script>

<!-- This is completely unreadable. What is this. -->
<div class="row user-header">
	<div class="row">
		<Avatar size="xl" username={data.user.username} />
		<div class="col start name-actions-bio">
			<div class="row name-actions">
				<h1>
					<a class="fg-red hov-line" href="/user/{data.user.username}">
						{#if data.user.nickname}
							{data.user.nickname} ({data.user.username})
						{:else}
							{data.user.username}
						{/if}
					</a>
				</h1>
				{#if data.user.id === $user?.id}
					<a class="btn fg-dark hov-light" href="/settings">Edit profile</a>
				{:else if data.user.user_follows}
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
					<a class="btn fg-dark hov-light" href="/login/github">Sign in to follow</a>
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
			</div>
			{#if data.profile.bio}
				<p class="bio fg-dark">{data.profile.bio}</p>
			{/if}
		</div>
	</div>
	<div class="row">
		<a href="/user/{data.user.username}/following" class="hov-link">
			<div class="vertical">
				<h4 class="mono">{(data.user.following + '').padStart(3, '0')}</h4>
				<span class="caption">Following</span>
			</div>
		</a>
		<a href="/user/{data.user.username}/followers" class="hov-link">
			<div class="vertical">
				<h4 class="mono">{(data.user.followers + '').padStart(3, '0')}</h4>
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
<ul>
	<li>
		<h4><a class="hov-link hov-line" href="/user/{data.user.username}/reviews">Reviews</a></h4>
	</li>
	<li>
		<h4><a class="hov-link hov-line" href="/user/{data.user.username}/stacks">Stacks</a></h4>
	</li>
	<li>
		<h4><a class="hov-link hov-line" href="/user/{data.user.username}/stacks">Network</a></h4>
	</li>
	<li>
		<h4><a class="hov-link hov-line" href="/user/{data.user.username}/stacks">Likes</a></h4>
	</li>
	<li>
		<h4><a class="hov-link hov-line" href="/user/{data.user.username}/stacks">Stats</a></h4>
	</li>
</ul>
<div class="spacer"></div>
<slot />

<style>
	.user-header.row {
		justify-content: space-between;
		/* border-bottom: 1px solid var(--color-text-dark); */
		padding-bottom: 0.5rem;
		/* margin-bottom: 0.5rem; */
		height: fit-content;
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

	ul {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem;
		border-top: 1px solid var(--color-text-dark);
		border-bottom: 1px solid var(--color-text-dark);
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

	.bio {
		display: block;
		max-width: 30rem;
		overflow-y: auto;
		overflow-x: hidden;
		white-space: pre-line;
		max-height: 6rem;
	}

	.spacer {
		margin-bottom: 1rem;
	}
</style>
