<script lang="ts">
	import { getStackLikes } from '#api/stacks.remote.ts';
	import Avatar from '#ui/Avatar.svelte';
	import List from '#ui/List.svelte';

	let { params } = $props();

	const users = $derived(
		await getStackLikes({
			type: 'name',
			name: params.name,
			username: params.user,
			index: parseInt(params.index || '0'),
		})
	);
</script>

<List>
	{#each users as user (user.id)}
		<a href="/user/{user.username}" class="row fg-dark">
			<Avatar {user} size="sm" />
			<span class="fg-red hov-line">{user.username}</span>
		</a>
	{/each}
</List>
