<script lang="ts">
	import { getRecentStacks } from '$api/stacks.remote';
	import { optSubpath } from '$lib';
	import Icon from '$ui/Icon.svelte';

	const recentStacksPromise = $derived(getRecentStacks({}));
	const recentStacks = $derived(await recentStacksPromise);
</script>

<div class="col center">
	<h2 class="fg-dark">T3, O7, G7 - a letter and a number and you're good to go:</h2>
	<h3>
		<a href="/stacks/new" class="btn bg-green semibold row nogap">
			<Icon id="list-plus" />
			Create your own stack
		</a>
	</h3>
	{#each recentStacks as stack (stack.id)}
		<a href="/user/{stack.author.username}/stack/{stack.normalizedName}/{optSubpath(stack.index)}">
			stack
			{stack.name}
		</a>
	{/each}
</div>

<style>
	div {
		margin: 2rem calc(min(4rem, 10vw));
		text-align: center;
	}

	a {
		padding: 0.125rem 0.5rem;
	}
</style>
