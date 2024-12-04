<script lang="ts">
	import { user } from '$lib/client/stores';
	import Card from '$ui/Card.svelte';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();
</script>

<div class="stack">
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
		{:else}
			<li class="fg-cyan">It's an empty stack!</li>
		{/each}
	</ul>
</div>

<style>
	.stack {
		margin-top: 1rem;
		border-top: 1px solid var(--color-text-dark);
		border-bottom: 1px solid var(--color-text-dark);
		/* background-color: var(--color-bg-bright); */
		padding: 0.5rem;
		padding-left: 1rem;
		/* border-radius: 0.5rem; */
	}

	ul {
		margin-top: 1rem;
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
</style>
