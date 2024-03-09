<script lang="ts">
	import Card from '$ui/Card.svelte';

	export let data;
</script>

<div>
	<h3>Found {data.searchResult.length} matches for "{data.query}"</h3>
</div>
<ul>
	{#each data.searchResult as pkg}
		<li>
			<Card {pkg} wide />
		</li>
	{/each}
</ul>

<style>
	ul {
		display: flex;
		gap: 1rem;
		flex-direction: column;
	}
</style>
