<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	import RatingInput from '$ui/RatingInput.svelte';
	import Review from '$ui/Review.svelte';
	export let data;

	onMount(() => {
		console.log(data);
	});
</script>

<div class="package">
	<div class="package-body">
		{#if data.package}
			<div>
				<h2>{$page.params.package}</h2>
			</div>
			{#if data.package.author}
				<p class="author">By {data.package.author.name}</p>
			{/if}
			<p class="description">{data.package.description}</p>
			<ul class="keywords">
				{#each data.package.keywords as keyword}
					<li>{keyword}</li>
				{/each}
			</ul>
			{#if data.package.readme}
				{#await marked.parse(data.package.readme, { gfm: true }) then readme}
					{@html readme}
				{/await}
			{/if}
		{/if}
	</div>
	<div class="package-sidebar">
		<div>
			<p>Install</p>
			<p class="command">pnpm add {data.package.name}</p>
		</div>
		{#if data.package.repository && data.package.repository.type === 'git'}
			{@const repository = data.package.repository.url.substring(
				4,
				data.package.repository.url.length - 4
			)}
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
			<RatingInput />
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
	</div>
</div>
<div class="reviews">
	{#each data.reviews as review}
		<Review {review} />
	{/each}
</div>

<style>
	.package {
		display: flex;
	}

	form {
		display: flex;
		flex-direction: column;
		background-color: #383d45;
		padding: 1rem;
		gap: 1rem;
	}

	.keywords {
		display: flex;
		gap: 0.5rem;
	}

	.keywords > li {
		background-color: #383d45;
		padding: 0 0.5rem;
		border-radius: 0.25rem;
	}

	:global(.package img) {
		display: inline-block;
	}
	/* :global(.package p) {
		display: flex;
	} */
</style>
