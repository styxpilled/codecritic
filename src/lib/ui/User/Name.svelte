<script lang="ts">
	import type { User } from '$lib/server/db/schema';

	/** The link on the nickname and the username. */
	let { user }: { user: User } = $props();
</script>

<a href="/user/{user.username}" class="name fg-red hov-line">
	{#if user.nickname}
		{user.nickname} ({user.username})
	{:else}
		{user.username}
	{/if}
</a>

<style>
	.name {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
