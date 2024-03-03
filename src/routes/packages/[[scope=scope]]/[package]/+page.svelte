<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	import RatingInput from '$ui/RatingInput.svelte';
	import Review from '$ui/Review.svelte';
	import List from '$ui/List.svelte';
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
				<p class="author">By {data.package.author.name}</p>
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
					{#await marked.parse(data.readme, { gfm: true }) then readme}
						{@html readme}
					{/await}
				{/if}
			</div>
		{/if}
	</div>
	<div class="package-sidebar">
		<div>
			<p>Install</p>
			<p class="command">pnpm add {data.packageName}</p>
		</div>
		{#if data.package.repository && data.package.repository.type === 'git'}
			{@const url = data.package.repository.url}
			{@const repository =
				'https://github.com' + url.substring(url.indexOf('github.com') + 10, url.length - 4)}
			<div>
				<p>Repository</p>
				<a href={repository}>{repository}</a>
			</div>
		{/if}
		{#if data.package.homepage}
			<div>
				<p>Homepage</p>
				<a href={data.package.homepage}>{data.package.homepage}</a>
			</div>
		{/if}
		<form method="post" use:enhance>
			<div>
				<RatingInput />
				<input type="datetime-local" />
			</div>
			<textarea placeholder="Add a review..." name="review" />
			<label>
				<span>Version</span>
				<select name="version">
					{#each Object.keys(data.package.versions).reverse() as g}
						<option value={g}>{g}</option>
					{/each}
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

	:global(.readme img) {
		display: inline-block;
		/* display: flex; */
	}

	:global(.readme > h1),
	:global(.readme > h2),
	:global(.readme > h3),
	:global(.readme > p) {
		margin: 1rem 0rem;
	}
	/* :global(.package p) {
		display: flex;
	} */
</style>
