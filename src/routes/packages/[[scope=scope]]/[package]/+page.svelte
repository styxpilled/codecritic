<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import RatingInput from '$ui/RatingInput.svelte';
	import Review from '$ui/Review.svelte';
	import Readme from '$ui/Readme.svelte';
	import { browser } from '$app/environment';
	export let data;

	onMount(() => {
		console.log(data);
	});

	let selectedManager = 'npm';
	const managers = ['npm', 'yarn', 'pnpm', 'bun'];
</script>

<div class="package-container">
	<div class="package">
		<div class="package-body">
			{#if data.package}
				<div class="package-head">
					<div class="row align">
						<h2>{data.packageName}</h2>
						<button title="Hide README">
							<label class="collapse">
								<span class="show"><LucideEye /></span>
								<span class="hide"><LucideEyeOff /></span>
								<input class="collapser" type="checkbox" />
							</label>
						</button>
					</div>
					{#if data.package.author}
						<p class="author">By {data.package.author}</p>
					{/if}
					<p class="description">{data.package.description}</p>
					{#if data.package.keywords}
						<ul class="keywords">
							{#each data.package.keywords as keyword}
								<li class="bg-light fg-dark">{keyword}</li>
							{/each}
						</ul>
					{/if}
				</div>
				<div class="readme">
					{#if data.readme}
						<Readme readme={data.readme} url={data.package.repository || ''} />
					{/if}
				</div>
			{/if}
		</div>
		<div class="package-sidebar">
			<div class="manager">
				<p class="manager-selection row">
					{#each managers as manager, i}
						<label>
							{manager}
							<input
								class="hidden"
								type="radio"
								name="install"
								value={manager}
								bind:group={selectedManager}
								checked={i === 0}
							/>
						</label>
					{/each}
				</p>
				<p class="command">
					{#each managers as manager}
						<span class="hidden {manager}">{manager} add {data.packageName}</span>
					{/each}
					<button
						disabled={!browser}
						on:click={async () => {
							navigator.clipboard.writeText(`${selectedManager} add ${data.packageName}`);
						}}
					>
						<LucideCopy />
					</button>
				</p>
			</div>
			{#if data.package.repository}
				<div class="sidebar-link">
					<p class="sidebar-link-label">Repository</p>
					<p class="command"><a href={data.package.repository}>{data.package.repository}</a></p>
				</div>
			{/if}
			{#if data.package.homepage}
				<div class="sidebar-link">
					<p class="sidebar-link-label">Homepage</p>
					<p class="command"><a href={data.package.homepage}>{data.package.homepage}</a></p>
				</div>
			{/if}
			<form class="submit-review bg-light" method="post" use:enhance>
				<div class="row">
					<RatingInput />
					<input type="date" value={new Date().toISOString().slice(0, 10)} />
				</div>
				<textarea placeholder="Add a review..." name="review" />
				TODO: versions
				<div class="row">
					<label>
						<span>Version</span>
						<select name="version">
							<option value={data.package.latest}>{data.package.latest}</option>
						</select>
					</label>
					<button class="btn bg-green" type="submit">Save</button>
				</div>
			</form>
			<div class="reviews">
				{#each data.reviews as review}
					<Review {review} />
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.package-container {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.package {
		display: grid;
		grid-template-columns: 3fr 2fr;
		grid-template-rows: 1fr;
		flex-shrink: 0;
		width: 1200px;
		gap: 0px 0px;
		grid-template-areas: 'body sidebar';

		@media (width <= 1200px) {
			& {
				width: 100vw;
				display: flex;
				flex-direction: column;
				padding: 0 1rem;
			}
		}
	}

	.package-head {
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--color-bg-bright);
	}

	.package-body {
		grid-area: body;
		padding: 0.5rem;
		max-width: 720px;

		&:has(input.collapser:checked) > .readme {
			display: none;
		}
	}

	.collapse {
		cursor: pointer;

		& > .show {
			display: none;
		}

		& > .hide {
			display: block;
		}
		&:has(> input:checked) {
			& > .hide {
				display: none;
			}
			& > .show {
				display: block;
			}
		}

		& input {
			display: none;
		}
	}

	.package-sidebar {
		grid-area: sidebar;
		margin-left: 0.5rem;
	}

	.manager-selection {
		margin: 0.5rem 0;
	}

	.manager-selection > label {
		background-color: var(--color-bg-bright);
		padding: 0 0.5rem;
		text-align: center;
		border-radius: 0.25rem;
		cursor: pointer;
		user-select: none;
	}

	.manager-selection > label:has(input:checked) {
		/* TODO */
		background-color: #383d45;
	}

	/* Figure out something nicer */
	.manager-selection:has(> label > input[value='npm']:checked) ~ .command > .npm {
		display: block;
	}

	.manager-selection:has(> label > input[value='yarn']:checked) ~ .command > .yarn {
		display: block;
	}

	.manager-selection:has(> label > input[value='pnpm']:checked) ~ .command > .pnpm {
		display: block;
	}

	.manager-selection:has(> label > input[value='bun']:checked) ~ .command > .bun {
		display: block;
	}

	.command {
		display: flex;
		justify-content: space-between;
		background-color: var(--color-bg-bright);
		border-radius: 0.25rem;
		padding: 0.25rem 0.5rem;
		user-select: all;
		color: #abb2bf;
	}

	.sidebar-link-label {
		color: #5c6370;
		font-weight: 600;
	}

	form {
		display: flex;
		flex-direction: column;
		background-color: var(--color-bg-bright);
		padding: 1rem;
		gap: 1rem;
	}

	form > div {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	textarea {
		resize: none;
		height: 6rem;
		transition: height 300ms ease-in-out;
	}

	textarea:focus-visible {
		height: 12rem;
	}

	.keywords {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.keywords > li {
		padding: 0 0.5rem;
		border-radius: 0.25rem;
	}

	.submit-review {
		border-radius: 0.5rem;
		margin: 0.5rem 0;
		/* width: 50rem; */
	}
</style>
