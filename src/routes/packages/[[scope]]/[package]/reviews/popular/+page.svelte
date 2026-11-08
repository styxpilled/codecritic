<script lang="ts">
	import { getNPMPackage } from '#api/npm.remote.ts';
	import { getPopularReviews } from '#api/reviews.remote.ts';
	import { toPackageName } from '#lib';
	import Reviews from '#ui/Reviews.svelte';

	let { params } = $props();
	const pkg = $derived(await getNPMPackage(toPackageName(params)));
	const reviews = $derived(
		await getPopularReviews({
			packageID: toPackageName(params),
		})
	);
</script>

<div>
	<h3 class="fg-orange">{pkg.name}</h3>
</div>
<div class="col">
	{#each reviews as review (review.id)}
		<Reviews {review} user={review.author} showUser small />
	{/each}
</div>
