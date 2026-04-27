<script lang="ts">
	import { error } from '@sveltejs/kit';
	import { getReview } from '$api/reviews.remote';
	import { goto } from '$app/navigation';
	import { toPackageName } from '$lib';
	import { app } from '$lib/client/state.svelte';
	import Editor from '$ui/Review/Editor.svelte';

	if (!app.user) error(401);

	let { params } = $props();

	const review = $derived(
		await getReview({
			type: 'name',
			author: app.user.username,
			index: parseInt(params.index || '0'),
			package: toPackageName(params),
		})
	);
</script>

<Editor
	{review}
	onSubmit={() => {
		goto(`/user/${app.user?.username}/package/${review.packageID}/${review.index}`);
	}}
/>

<style>
	:global(.content) {
		max-width: 900px;
		justify-content: center;

		@media (width >= 950px) {
			& > .review-editor {
				margin-left: 1rem;
			}
		}
	}
</style>
