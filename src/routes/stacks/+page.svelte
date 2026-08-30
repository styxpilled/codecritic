<script lang="ts">
	import { getRecentStacks } from '$api/stacks.remote';
	import Icon from '$ui/Icon.svelte';
	import List from '$ui/List.svelte';
	import Card from '$ui/Stack/Card.svelte';

	const recentStacksPromise = $derived(getRecentStacks({ limit: 18 }));
	const recentStacks = $derived(await recentStacksPromise);
</script>

<div class="page col">
	<h2 class="fg-dark">
		T3, O7, G7 - a letter and a number and you're good to go:
	</h2>
	<h3>
		<a href="/stacks/new" class="btn bg-green semibold row nogap">
			<Icon id="list-plus" />
			Create your own stack
		</a>
	</h3>
</div>

<List columns={3}>
	{#snippet head()}
		<span>recent stacks</span>
	{/snippet}
	{#each recentStacks as stack (stack.id)}
		<Card {stack} />
	{/each}
</List>

<style>
	.page {
		margin: 2rem calc(min(4rem, 10vw));
		text-align: center;
	}

	h3 a {
		padding: 0.125rem 0.5rem;
	}
</style>
