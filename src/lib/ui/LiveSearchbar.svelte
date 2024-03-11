<script lang="ts">
	import { fetchOr } from '$lib';
	import type { Package } from '$lib/types';
	export let show = false;
	let backdrop: HTMLDivElement;
	let searchString = '';
	let searchResults: Package[] = [];
	let searching = false;

	const search = async () => {
		searching = true;
		searchResults = await fetchOr(
			`/api/search?text=${encodeURIComponent(searchString)}`,
			searchResults
		);
		searching = false;
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div
	on:click|self={() => (show = false)}
	bind:this={backdrop}
	class:show
	class="dialog-backdrop"
	role="presentation"
>
	<div class="dialog">
		<form action="/">
			<input type="search" bind:value={searchString} on:keydown={search} />
		</form>
		{#if searching}
			Searching...
		{/if}
		{#if searchResults.length > 0}
			<ul>
				{#each searchResults as pkg}
					<li><a href="/packages/{pkg.name}">{pkg.name}</a></li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	.dialog {
		top: 25%;
		z-index: 500;
	}

	.dialog-backdrop {
		position: fixed;
		padding: 0;
		margin: 0;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: none;
		z-index: 500;
	}

	.show {
		display: block;
	}

	.dialog {
		display: flex;
		align-items: center;
		flex-direction: column;
		width: 34rem;
		padding: 1rem;
		margin-left: auto;
		margin-right: auto;
		background-color: orange;
		position: relative;
	}

	input[type='search'] {
		font-size: 2rem;
		width: 32rem;
	}

	ul {
		display: flex;
		word-break: keep-all;
		background-color: red;
		flex-direction: column;
		padding: 0 0.5rem;
		margin: 0;
		top: 4rem;
		width: 31rem;
		position: absolute;
		overflow: scroll;
	}
</style>
