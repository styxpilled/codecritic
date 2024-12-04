<script lang="ts">
	import List from '$ui/List.svelte';
	import SimplePage from '$ui/SimplePage.svelte';
	import Stack from '$ui/Stack.svelte';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();
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
		{#snippet head()}
			
				<span>new from mutuals</span>
				<span>more</span>
			
			{/snippet}
		{#snippet body()}
				<svelte:fragment ></svelte:fragment>
			{/snippet}
	</List>
	<List width="full">
		{#snippet head()}
			
				<span>popular stacks</span>
				<span>more</span>
			
			{/snippet}
		{#snippet body()}
			
				{#each data.stacks as stack}
					<Stack {stack} />
				{/each}
			
			{/snippet}
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
