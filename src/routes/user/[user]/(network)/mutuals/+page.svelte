<script lang="ts">
	import { getMutuals } from '$api/user.remote';
	import UserList from '$ui/UserList.svelte';

	const { params } = $props();
	const mutuals = $derived(await getMutuals({ username: params.user }));
</script>

<svelte:head>
	<title>{params.user}'s mutuals · Codecritic</title>
</svelte:head>

<UserList users={mutuals} empty="{params.user} has no mutuals yet." />
