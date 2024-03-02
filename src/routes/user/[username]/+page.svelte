<script lang="ts">
	import Rating from '$ui/Rating.svelte';

	export let data;
</script>

<div>
	<h1>
		{data.user.nickname} ({data.user.username})
	</h1>
</div>

<ul>
	{#each data.reviews as review}
		<li>
			<h2><a href="/packages/{review.package}">{review.package}</a></h2>
			<p>{review.review}</p>
			{new Date(review.created_at).toLocaleDateString()}
			<Rating rating={review.rating} />
		</li>
	{/each}
</ul>
