<script lang="ts">
	import Review from '$ui/Review.svelte';

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
			<Review {review} showPackageName={true} showUserName={false} />
		</li>
	{/each}
</ul>
