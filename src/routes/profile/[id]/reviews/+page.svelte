<script lang="ts">
	import Rating from '$ui/Rating.svelte';

	export let data;
	// console.log(data);
</script>

{#each data.reviews as review}
	<h2>{review.package}</h2>
	<p>{review.review}</p>
	<Rating rating={1} />
{/each}
