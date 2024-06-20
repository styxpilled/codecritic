<script lang="ts">
	import List from '$ui/List.svelte';
</script>

<div class="greeting">
	<h1>Show off your stacks!</h1>
	<h3>
		<a href="/stacks/new" class="btn fg-dark bg-green">
			<LucideListPlus />
			Create a new stack
		</a>
	</h3>
</div>

<List>
	<svelte:fragment slot="head">
		<span>new from mutuals</span>
		<span>more</span>
	</svelte:fragment>
	<svelte:fragment slot="body"></svelte:fragment>
</List>

<style>
	.greeting {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}
</style>
