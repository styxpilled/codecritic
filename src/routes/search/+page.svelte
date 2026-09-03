<script lang="ts">
	import { searchNPM } from '$api/npm.remote';
	import { page } from '$app/state';
	import List from '$ui/List.svelte';
	import Package from '$ui/Package';

	let query = $derived(page.url.searchParams.get('query'));
	const results = $derived(query ? await searchNPM(query) : []);
</script>

<svelte:boundary>
	{#if results && results.length > 0}
		<List>
			{#snippet head()}
				<h3 class="fg-dark">Showing matches for "{query}":</h3>
			{/snippet}
			{#each results as pkg (pkg.name)}
				<Package {pkg} />
			{/each}
			{#snippet foot()}
				<span></span>
				<a href="/search?{page.url.searchParams}" class="hov-link">
					Load more results
				</a>
			{/snippet}
		</List>
	{:else}
		<h3 class="fg-dark">Nothing here but chickens!</h3>
	{/if}
</svelte:boundary>
