<script lang="ts">
	import { getPopularUsers } from '$api/user.remote';
	import { app } from '$lib/client/state.svelte';
	import Avatar from '$ui/Avatar.svelte';
	import FollowButton from '$ui/FollowButton.svelte';
	import List from '$ui/List.svelte';

	const recentPopularUsersPromise = $derived(getPopularUsers({ recent: true }));
	const recentPopularUsers = $derived(await recentPopularUsersPromise);
	const popularUsersPromise = $derived(getPopularUsers({}));
	const popularUsers = $derived(await popularUsersPromise);
</script>

<p class="fg-dark">10x devs, Typescript wizards and vibe coders - find popular members:</p>

<List columns={5}>
	{#snippet head()}
		<span>popular this week</span>
	{/snippet}
	{#each recentPopularUsers as user (user.id)}
		<div class="">
			<a href="/user/{user.username}" class="fg-dark col center">
				<Avatar {user} size="xl" />
				<div class="col nogap">
					<h4 class="fg-red hov-line">
						{#if user.nickname}
							{user.nickname} ({user.username})
						{:else}
							{user.username}
						{/if}
					</h4>
					<div>
						<span>{user.likes} likes</span>
						<span>{user.reviews} reviews</span>
					</div>
				</div>
			</a>
		</div>
	{/each}
</List>

<List columns={1} style="max-width: 40rem;">
	{#snippet head()}
		<span>all-time popular</span>
	{/snippet}
	{#each popularUsers as user, i (user.id)}
		<div class="row space">
			<a href="/user/{user.username}" class="fg-dark row">
				<Avatar {user} size="md" />
				<div class="col nogap start">
					<h4 class="fg-red">
						{#if user.nickname}
							{user.nickname} ({user.username})
						{:else}
							{user.username}
						{/if}
					</h4>
					<!-- <span>{user.likes} likes</span> -->
					<span>{user.reviews} reviews</span>
				</div>
			</a>
			{#if app.user?.id !== user.id}
				<FollowButton bind:user={popularUsers[i]} />
			{/if}
		</div>
	{/each}
</List>

<style>
	p {
		margin: 2rem calc(min(4rem, 10vw));
		font-size: 1.5rem;
		text-align: center;
	}
</style>
