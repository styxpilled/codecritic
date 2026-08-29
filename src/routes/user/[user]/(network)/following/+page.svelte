<script lang="ts">
	import { getFollowing } from '$api/user.remote';
	import UserList from '$ui/UserList.svelte';

	const { params } = $props();
	const following = $derived(await getFollowing({ username: params.user }));
</script>

<svelte:head>
	<title>{params.user} follows · Codecritic</title>
</svelte:head>

<UserList users={following} empty="{params.user} follows nobody yet." />
