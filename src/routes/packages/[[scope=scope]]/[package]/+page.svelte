<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	import RatingInput from '$ui/RatingInput.svelte';
	import Review from '$ui/Review.svelte';
	import Readme from '$ui/Readme.svelte';
	export let data;

	onMount(() => {
		console.log(data);
	});
</script>

<div class="package">
	<div class="package-body">
		{#if data.package}
			<div>
				<h2>{data.packageName}</h2>
			</div>
			{#if data.package.author}
				<p class="author">By {data.package.author}</p>
			{/if}
			<p class="description">{data.package.description}</p>
			{#if data.package.keywords}
				<ul class="keywords">
					{#each data.package.keywords as keyword}
						<li>{keyword}</li>
					{/each}
				</ul>
			{/if}
			<div class="readme">
				{#if data.readme}
					<Readme readme={data.readme} url={data.package.repository || ''} />
				{/if}
			</div>
		{/if}
	</div>
	<div class="package-sidebar">
		<div>
			<p class="manager-selection row">
				<label>
					npm
					<input class="hidden" type="radio" name="install" value="npm" checked />
				</label>
				<label>
					yarn
					<input class="hidden" type="radio" name="install" value="yarn" />
				</label>
				<label>
					<input class="hidden" type="radio" name="install" value="pnpm" />
					pnpm
				</label>
			</p>
			<p class="command">
				<span class="hidden npm">npm i {data.packageName}</span>
				<span class="hidden yarn">yarn add {data.packageName}</span>
				<span class="hidden pnpm">pnpm add {data.packageName}</span>
			</p>
		</div>
		{#if data.package.repository}
			<div>
				<p>Repository</p>
				<a href={data.package.repository}>{data.package.repository}</a>
			</div>
		{/if}
		{#if data.package.homepage}
			<div>
				<p>Homepage</p>
				<a href={data.package.homepage}>{data.package.homepage}</a>
			</div>
		{/if}
		<form class="submit-review" method="post" use:enhance>
			<div>
				<RatingInput />
				<input type="datetime-local" />
			</div>
			<textarea placeholder="Add a review..." name="review" />
			TODO: versions
			<label>
				<span>Version</span>
				<select name="version">
					<option value={data.package.latest}>{data.package.latest}</option>
				</select>
			</label>
			<button type="submit">Save</button>
		</form>
		<div class="reviews">
			{#each data.reviews as review}
				<Review {review} />
			{/each}
		</div>
	</div>
</div>

<style>
	.package {
		display: grid;
		grid-template-columns: 3fr 2fr;
		grid-template-rows: 1fr;
		max-width: 1200px;
		gap: 0px 0px;
		grid-template-areas: 'body sidebar';
	}

	.package-body {
		grid-area: body;
		padding: 0.5rem;
		max-width: 720px;
	}

	.package-sidebar {
		grid-area: sidebar;
	}

	.manager-selection {
		margin: 0.5rem 0.25rem;
	}

	.manager-selection > label {
		background-color: #2b2a33;
		padding: 0 0.5rem;
		text-align: center;
		border-radius: 0.25rem;
		cursor: pointer;
		user-select: none;
	}

	.manager-selection > label:has(input:checked) {
		background-color: #383d45;
	}

	.manager-selection:has(> label > input[value='npm']:checked) ~ .command > .npm {
		display: block;
	}

	.manager-selection:has(> label > input[value='yarn']:checked) ~ .command > .yarn {
		display: block;
	}

	.manager-selection:has(> label > input[value='pnpm']:checked) ~ .command > .pnpm {
		display: block;
	}

	.command {
		background-color: #2b2a33;
		border-radius: 0.25rem;
		padding: 0.25rem 0.5rem;
		margin: 0.5rem 0.25rem;
		user-select: all;
	}

	form {
		display: flex;
		flex-direction: column;
		background-color: #383d45;
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
		background-color: #383d45;
		padding: 0 0.5rem;
		border-radius: 0.25rem;
	}

	.submit-review {
		border-radius: 0.5rem;
		margin: 0.5rem;
		/* width: 50rem; */
	}
</style>
