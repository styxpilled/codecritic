<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	export let data;

	onMount(() => {
		console.log(data);
	});
</script>

{#if data.package}
	<h1>{$page.params.package}</h1>
	<p class="description">{data.package.description}</p>
	<!-- {data.package.} -->
	<form method="post" use:enhance>
		<label>
			<span>Review</span>
			<input name="review" type="text" />
		</label>
		<label>
			<span>Version</span>
			<input name="version" type="text" value={data.package['dist-tags'].latest} />
		</label>
		<label>
			<span>Rating</span>
			<input name="rating" type="number" value={5} />
		</label>
		<button type="submit">submit</button>
	</form>
	{#each data.reviews as review}
		{review.author}
		{review.rating}
		{review.review}
	{/each}
{/if}

<style>
	form {
		display: flex;
		flex-direction: column;
	}
</style>
