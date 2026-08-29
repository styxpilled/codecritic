<script lang="ts">
	import { app } from '$lib/client/state.svelte';
	import type { User } from '$lib/server/db/schema';
	import Avatar from './Avatar.svelte';
	import FollowButton from './FollowButton.svelte';

	type Row = User & { userFollows: boolean; followsUser: boolean };

	let { users, empty }: { users: Row[]; empty: string } = $props();
</script>

{#if users.length === 0}
	<p class="fg-dark">{empty}</p>
{:else}
	<ul class="col start">
		{#each users as user, i (user.id)}
			<li class="row space">
				<a href="/user/{user.username}" class="fg-dark row">
					<Avatar {user} size="md" />
					<h4 class="fg-red hov-line">
						{#if user.nickname}
							{user.nickname} ({user.username})
						{:else}
							{user.username}
						{/if}
					</h4>
				</a>
				{#if app.user && app.user.id !== user.id}
					<FollowButton bind:user={users[i]} />
				{/if}
			</li>
		{/each}
	</ul>
{/if}

<style>
	ul {
		max-width: 40rem;
	}

	li {
		width: 100%;
	}
</style>
