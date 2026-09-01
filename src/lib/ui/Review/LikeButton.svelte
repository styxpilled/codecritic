<script lang="ts">
	import {
		// getReview,
		// getUserReviews,
		likeReview,
		unlikeReview,
	} from '$api/reviews.remote';
	import type { Review, User } from '$lib/server/db/schema';
	import LikeButton from '$ui/shared/LikeButton.svelte';

	let {
		user,
		review,
	}: {
		user?: User;
		review: Review & { liked?: boolean; likes?: number };
	} = $props();

	// const updates = [
	// getReview({ id: review.id, type: 'id' }).withOverride((reviews) => {
	// 	reviews.liked = !review.liked;
	// 	reviews.likes = likes + (review.liked ? 1 : -1);
	// 	return reviews;
	// }),
	// getUserReviews({ username: 'lockfilelover', limit: 5 }).withOverride(
	// 	(reviews) => {
	// 		const i = reviews.findIndex((r) => r.id === obj.id);
	// 		reviews[i].liked = !obj.liked;
	// 		reviews[i].likes = likes + (obj.liked ? 1 : -1);
	// 		return reviews;
	// 	}
	// ),
	// ];
</script>

<LikeButton
	obj={review}
	like={likeReview}
	unlike={unlikeReview}
	authorID={review.authorID}
	href={user
		? `/user/${user?.username}/package/${review.packageID}/likes`
		: undefined}
/>
