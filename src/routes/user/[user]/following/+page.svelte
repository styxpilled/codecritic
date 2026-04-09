<script lang="ts">
	import { getFollowing } from '$api/user.remote';
	import Avatar from '$ui/Avatar.svelte';

	let { params } = $props();
	const following = $derived(await getFollowing({ username: params.user }));
</script>

<ul class="col start">
	{#each following as user (user.id)}
		<li class="row">
			<Avatar {user} />
			<a href="/user/{user.username}" class="fg-red hov-line">
				{#if user.nickname}
					{user.nickname} ({user.username})
				{:else}
					{user.username}
				{/if}
			</a>
		</li>
	{/each}
</ul>
