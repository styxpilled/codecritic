<script lang="ts">
	import {
		// getReview,
		// getUserReviews,
		likeStack,
		unlikeStack,
	} from '$api/stacks.remote';
	import { optSubpath } from '$lib';
	import type { Stack, User } from '$lib/server/db/schema';
	import LikeButton from '$ui/shared/LikeButton.svelte';

	let {
		// user,
		stack,
	}: {
		// user?: User;
		stack: Stack & { liked?: boolean; likes?: number; author: User };
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
	obj={stack}
	like={likeStack}
	unlike={unlikeStack}
	authorID={stack.author.id}
	href="/user/${stack.author
		.username}/stack/${stack.normalizedName}/${optSubpath(stack.index)}likes"
/>
