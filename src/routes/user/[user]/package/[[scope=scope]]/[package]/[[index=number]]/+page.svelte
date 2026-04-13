<script lang="ts">
	import { getRecentReview, getReview } from '$api/reviews.remote.js';
	import { getProfile } from '$api/user.remote.js';
	import { toPackageName } from '$lib';
	import Recent from '$ui/Review/Recent.svelte';
	import Reviews from '$ui/Reviews.svelte';

	let { params } = $props();

	const review = $derived(
		await getReview({
			type: 'name',
			author: params.user,
			package: toPackageName(params),
			index: parseInt(params.index || '0'),
		})
	);
	const yourReview = $derived(
		await getRecentReview({
			pkg: toPackageName(params),
		})
	);
	const user = $derived(await getProfile(params.user));
</script>

<div class="row start space gap-lg">
	<Reviews {review} {user} full />
	<Recent review={yourReview} packageID={review.packageID} />
</div>

<style>
	div.row.start.space {
		@media (width <= 950px) {
			flex-direction: column;
		}
	}
</style>
