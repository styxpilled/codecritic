<script lang="ts">
	import { getFollowers } from '#api/user.remote.ts';
	import { List as UserList } from '#ui/User/index.ts';

	const { params } = $props();
	const followers = $derived(await getFollowers({ username: params.user }));
</script>

<svelte:head>
	<title>{params.user}'s followers · Codecritic</title>
</svelte:head>

<UserList users={followers} empty="{params.user} has no followers yet." />
