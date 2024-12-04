<script lang="ts">
	import { self } from 'svelte/legacy';

	import { fetchOr } from '$lib';
	interface Props {
		show?: boolean;
	}

	let { show = $bindable(false) }: Props = $props();
	let backdrop: HTMLDivElement = $state();
	let searchString = $state('');
	let searchResults: string[] = $state([]);
	let previousQuery = searchString;
	let index = 0;
	let awaitingIndex = 0;

	const search = async () => {
		if (searchString === previousQuery) return;
		const query = searchString;
		const innerIndex = index + 1;
		awaitingIndex += 1;
		const innerAwaitingIndex = awaitingIndex;
		fetchOr(`/api/search?text=${encodeURIComponent(searchString)}`, searchResults).then(
			(result) => {
				if (innerIndex > index || innerAwaitingIndex > awaitingIndex) {
					index = innerIndex;
					searchResults = result;
					previousQuery = query;
				}
			}
		);
	};
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	onclick={self(() => (show = false))}
	bind:this={backdrop}
	class:show
	class="dialog-backdrop"
	role="presentation"
>
	<div class="dialog">
		<form action="/">
			<input type="search" bind:value={searchString} onkeyup={search} />
		</form>
		{#if searchResults.length > 0}
			<div class="results">
				<ul>
					{#each searchResults as pkg}
						<li><a href="/packages/{pkg}">{pkg}</a></li>
					{/each}
				</ul>
			</div>
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
		background-color: var(--color-bg-bright);
		position: relative;
		border-radius: 0.5rem;
	}

	input[type='search'] {
		font-size: 2rem;
		width: 32rem;
	}

	.results {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 31rem;
		top: 5.5rem;
		background-color: var(--color-bg-bright);
		border-radius: 0.5rem;
	}

	ul {
		display: flex;
		word-break: keep-all;
		flex-direction: column;
		padding: 0 0.5rem;
		margin: 0;
		overflow: scroll;
	}

	li > a {
		display: block;
		width: 100%;
		padding: 0 0.5rem;
		border-radius: 0.5rem;
	}

	li > a:hover {
		background-color: var(--color-bg);
	}
</style>
