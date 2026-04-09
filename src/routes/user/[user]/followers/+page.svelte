<script lang="ts">
	import { getFollowers } from '$api/user.remote';
	import Avatar from '$ui/Avatar.svelte';

	let { params } = $props();
	const followers = $derived(await getFollowers({ username: params.user }));
</script>

<ul class="col start">
	{#each followers as user (user.id)}
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
