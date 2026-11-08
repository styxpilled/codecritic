<script lang="ts">
	import { hashColor } from '$lib';

	/** The favorite package chips. An empty list keeps one line of height. */
	let { packages }: { packages: string[] } = $props();
</script>

<ul class="chips row wrap">
	{#each packages as pkg (pkg)}
		<li>
			<a class="chip bg-{hashColor(pkg)} hov-invert" href="/packages/{pkg}">
				{pkg}
			</a>
		</li>
	{/each}
</ul>

<style>
	.chips {
		gap: 0.25rem;
		height: 1.3125rem;
		overflow: hidden;
		min-width: 0;
	}

	.chips li {
		min-width: 0;
		max-width: 100%;
	}

	.chip {
		display: block;
		max-width: 100%;
		border-radius: 0.25rem;
		padding: 0 0.25rem;
		font-size: 0.875rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
