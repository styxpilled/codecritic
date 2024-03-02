<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import RatingInput from '$ui/RatingInput.svelte';
	export let data;

	onMount(() => {
		console.log(data);
	});
</script>

<div>
	{#if data.package}
		<div>
			<h1>{$page.params.package}</h1>
			<a href={data.package.homepage}>Homepage</a>
		</div>
		{#if data.package.author}
			<p class="author">By {data.package.author.name}</p>
		{/if}
		<p class="description">{data.package.description}</p>
		<ul>
			{#each data.package.keywords as keyword}
				<li>{keyword}</li>
			{/each}
		</ul>
		<form method="post" use:enhance>
			<label>
				<span>Review</span>
				<textarea name="review" />
			</label>
			<label>
				<span>Version</span>
				<select name="version">
					{#each Object.keys(data.package.versions).reverse() as g}
						<option value={g}>{g}</option>
					{/each}
				</select>
			</label>
			<RatingInput />
			<button type="submit">submit</button>
		</form>
		{#each data.reviews as review}
			{review.author}
			{review.rating}
			{review.review}
		{/each}
	{/if}
</div>

<style>
	form {
		display: flex;
		flex-direction: column;
	}
</style>
