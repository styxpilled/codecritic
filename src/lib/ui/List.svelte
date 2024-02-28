<script lang="ts">
	import type { Package, ReviewedPackage } from '$lib/types';
	import Card from './Card.svelte';

	export let packages: Package[] | ReviewedPackage[];
</script>

<div class="list">
	<div class="list-info">
		<slot />
	</div>
	<div class="list-content">
		{#each packages as pkg}
			<Card {pkg} />
		{/each}
	</div>
</div>

<style>
	.list-content {
		display: flex;
		gap: 0.5rem;
	}

	.list-info {
		display: flex;
		justify-content: space-between;
		text-transform: uppercase;
		font-size: 0.8rem;
		letter-spacing: 0.975px;
		border-bottom: 1px solid slategrey;
		margin-bottom: 0.5rem;
	}
</style>
