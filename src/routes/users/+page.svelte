<script lang="ts">
	import { getPopularUsers } from '#api/user.remote.ts';
	import List from '#ui/List.svelte';
	import { Card, List as UserList } from '#ui/User/index.ts';

	const recentPopularUsersPromise = $derived(getPopularUsers({ recent: true }));
	const recentPopularUsers = $derived(await recentPopularUsersPromise);
	const popularUsersPromise = $derived(getPopularUsers({}));
	const popularUsers = $derived(await popularUsersPromise);
</script>

<svelte:head>
	<title>Members · Codecritic</title>
</svelte:head>

<p class="fg-dark">
	10x devs, Typescript wizards and vibe coders - find popular members:
</p>

<List columns={4}>
	{#snippet head()}
		<span>popular this week</span>
	{/snippet}
	{#each recentPopularUsers as user, i (user.id)}
		<Card bind:user={recentPopularUsers[i]} />
	{:else}
		<p class="fg-dark">No reviews this week.</p>
	{/each}
</List>

<List columns={1} style="max-width: 40rem;">
	{#snippet head()}
		<span>all-time popular</span>
	{/snippet}
	<UserList users={popularUsers} empty="No members yet." />
</List>

<style>
	p {
		margin: 2rem calc(min(4rem, 10vw));
		font-size: 1.5rem;
		text-align: center;
	}
</style>
