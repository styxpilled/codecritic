<script lang="ts">
	import { run, preventDefault } from 'svelte/legacy';

	import { fetchOr } from '$lib';
	import { user } from '$lib/client/stores';
	import { onMount } from 'svelte';

	let showLiveSearch = $state(false);

	let searchString = $state('');
	let searchResults: string[] = $state([]);
	let previousQuery = searchString;
	let index = 0;
	let selectedPackages: string[] = $state([]);

	const search = async () => {
		if (searchString === previousQuery) return;
		const query = searchString;
		const innerIndex = index + 1;
		fetchOr(`/api/search?text=${encodeURIComponent(searchString)}`, searchResults).then(
			(result) => {
				if (innerIndex > index) {
					index = innerIndex;
					searchResults = result;
					previousQuery = query;
				}
			}
		);
	};

	onMount(() => {
		showLiveSearch = true;
	});
	run(() => {
		searchString;
		search();
	});
</script>

<form action="/stacks/new?/create" method="post">
	<div class="col">
		<div class="row">
			<div class="col">
				<label>
					Name
					<input type="text" name="name" required />
				</label>
				<p>todo: make this work without js</p>
				<label>
					Tags
					<input type="text" name="tags" />
				</label>
			</div>
			<div class="col">
				<label>
					Description
					<textarea name="description"></textarea>
				</label>
			</div>
		</div>
		<div class="row">
			<noscript>
				<label>
					add a package (comma separated)
					<input type="text" name="package" />
				</label>
			</noscript>
			{#if showLiveSearch}
				<div class="search">
					<form
						action="/"
						onsubmit={preventDefault(() => {
							if (!selectedPackages.includes(searchString)) selectedPackages.push(searchString);
							selectedPackages = selectedPackages;
							searchResults = [];
							searchString = '';
						})}
					>
						<label>
							add a package
							<input class="search-box" type="search" bind:value={searchString} />
						</label>
					</form>
					{#if searchResults.length > 0 && searchString !== ''}
						<div class="results">
							<ul>
								{#each searchResults as pkg}
									<li>
										<button
											onclick={preventDefault(() => {
												if (!selectedPackages.includes(pkg)) selectedPackages.push(pkg);
												selectedPackages = selectedPackages;
												searchResults = [];
												searchString = '';
											})}
										>
											{pkg}
										</button>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			{/if}
			<a class="btn" href="{$user?.username}/stacks">Cancel</a>
			<button class="btn bg-green" type="submit">Save</button>
		</div>
		<ul class="col">
			{#each selectedPackages as pkg, i}
				<li class="btn">
					{pkg}
					<button
						type="button"
						onclick={() => {
							selectedPackages.splice(i, 1);
							selectedPackages = selectedPackages;
						}}
					>
						<LucideX />
					</button>
				</li>
			{/each}
		</ul>
	</div>
</form>

<style>
	div {
		gap: 0.5rem;

		&.col {
			align-items: flex-start;
		}
	}

	label {
		display: flex;
		flex-direction: column;
	}

	.search {
		position: relative;

		& .results > ul {
			position: absolute;
			height: max-content;
			max-height: 12rem;
			overflow-y: scroll;
			border-radius: 0.5rem;
			background-color: var(--color-bg-brighter);
			padding: 0.25rem 0.5rem;
		}

		&:not(:focus-within) .results > ul {
			display: none;
		}

		&:has(.search-box:focus-visible) .results > ul,
		&:focus-within > ul {
			display: block;
		}
	}
</style>
