<script lang="ts">
	import type { UserCard } from '$lib/types';
	import Row from './Row.svelte';

	let { users, empty }: { users: UserCard[]; empty: string } = $props();
</script>

{#if users.length === 0}
	<p class="fg-dark">{empty}</p>
{:else}
	<ul class="col start">
		{#each users as user, i (user.id)}
			<li>
				<Row bind:user={users[i]} />
			</li>
		{/each}
	</ul>
{/if}

<style>
	ul {
		max-width: 40rem;
		width: 100%;
	}

	li {
		width: 100%;
	}
</style>
