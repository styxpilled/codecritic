<script lang="ts">
	import { user } from '$lib/client/stores';
	import Card from '$ui/Card.svelte';

	export let data;
</script>

<div class="row">
	<h2 class="fg-yellow">
		{data.stack.name}
	</h2>
	{#if data.stack.author === $user?.id}
		<a class="edit-btn hov-link" href="/user/{$user?.username}/stacks/{data.stack.id}/edit">
			<LucidePen />
		</a>
	{/if}
</div>
<p class="fg-dark">{data.stack.description}</p>
<ul>
	{#each data.stack.packages as pkg}
		<li>
			<Card {pkg} />
		</li>
	{/each}
</ul>

<style>
	.row {
		margin-top: 1rem;
	}

	.row,
	p {
		padding-left: 1rem;
	}

	ul {
		margin-top: 1rem;
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
</style>
