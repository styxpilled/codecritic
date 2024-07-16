<script lang="ts">
	import type { User } from '$lib/types';
	import Avatar from './Avatar.svelte';

	export let user: User & { likes?: number; reviews?: number };
</script>

<div class="row">
	<a href="/user/{user.username}">
		<Avatar username={user.username} />
	</a>
	<div class="col start" style="gap: 0;">
		<a href="/user/{user.username}">
			<h3 class="fg-red hov-line">
				{#if user.nickname}
					{user.nickname} ({user.username})
				{:else}
					{user.username}
				{/if}
			</h3>
		</a>
		<p>
			{#if user?.reviews}
				<span class="fg-dark">{user.reviews} reviews</span>,
			{/if}
			{#if user?.likes}
				<span class="fg-dark">{user.likes} total likes</span>
			{/if}
		</p>
	</div>
</div>
