<script lang="ts">
	import { getPopularStacks, getRecentStacks } from '$api/stacks.remote';
	import Icon from '$ui/Icon.svelte';
	import List from '$ui/List.svelte';
	import Masonry from '$ui/Masonry.svelte';
	import Card from '$ui/Stack/Card.svelte';

	const COLUMNS = 3;
	const ROWS = 3;
	const LIMIT = COLUMNS * ROWS;

	const recentStacksPromise = $derived(getRecentStacks({ limit: LIMIT }));
	const popularStacksPromise = $derived(getPopularStacks({ limit: LIMIT }));
	const recentStacks = $derived(await recentStacksPromise);
	const popularStacks = $derived(await popularStacksPromise);
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

<List columns={1}>
	{#snippet head()}
		<span>recent stacks</span>
	{/snippet}
	<Masonry items={recentStacks} columns={COLUMNS} rows={ROWS}>
		{#snippet item(stack)}
			<Card {stack} />
		{/snippet}
	</Masonry>
</List>

<List columns={1}>
	{#snippet head()}
		<span>popular stacks</span>
	{/snippet}
	<Masonry items={popularStacks} columns={COLUMNS} rows={ROWS}>
		{#snippet item(stack)}
			<Card {stack} />
		{/snippet}
	</Masonry>
</List>

<style>
	.page {
		margin: 2rem calc(min(4rem, 10vw));
		text-align: center;
	}

	h3 a {
		padding: 0.125rem 0.5rem;
	}

	@media (prefers-color-scheme: dark) {
		.a {
			display: none;
		}
	}

	@media (prefers-color-scheme: light) {
		.b {
			display: none;
		}
	}
</style>
