<script lang="ts">
	import { getFollowing } from '$api/user.remote';
	import { List as UserList } from '$ui/User';

	const { params } = $props();
	const following = $derived(await getFollowing({ username: params.user }));
</script>

<svelte:head>
	<title>{params.user} follows · Codecritic</title>
</svelte:head>

<UserList users={following} empty="{params.user} follows nobody yet." />
