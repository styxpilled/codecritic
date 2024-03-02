<script lang="ts">
	import { examples } from '$lib/types';
	import List from '$ui/List.svelte';

	export let data;
</script>

<div>
	<h3>Popular packages this week:</h3>
	<ul>
		{#each data.packages as pkg}
			<li>
				<span>{pkg.package}</span>
				<span>Popularity: {pkg.count}</span>
			</li>
		{/each}
	</ul>
	<List packages={examples}>
		<svelte:fragment>Just reviewed...</svelte:fragment>
	</List>

	<List packages={examples}>
		<svelte:fragment>Popular reviews this week</svelte:fragment>
	</List>
</div>
