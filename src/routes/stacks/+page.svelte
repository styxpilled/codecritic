<script lang="ts">
	import List from '$ui/List.svelte';
	import SimplePage from '$ui/SimplePage.svelte';
	import Stack from '$ui/Stack.svelte';

	export let data;
</script>

<SimplePage>
	<div class="col header-start">
		<h2 class="fg-dark">Show off your stacks!</h2>
		<h3>
			<a href="/stacks/new" class="btn fg-dark bg-green">
				<LucideListPlus />
				Create a new stack
			</a>
		</h3>
	</div>
	<List width="full">
		<svelte:fragment slot="head">
			<span>new from mutuals</span>
			<span>more</span>
		</svelte:fragment>
		<svelte:fragment slot="body"></svelte:fragment>
	</List>
	<List width="full">
		<svelte:fragment slot="head">
			<span>popular stacks</span>
			<span>more</span>
		</svelte:fragment>
		<svelte:fragment slot="body">
			{#each data.stacks as stack}
				<Stack {stack} />
			{/each}
		</svelte:fragment>
	</List>
</SimplePage>

<style>
	.greeting {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 3rem;
		gap: 1rem;
	}
</style>
