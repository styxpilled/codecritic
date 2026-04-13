<script lang="ts">
	import { error } from '@sveltejs/kit';
	import { createReview, getReview } from '$api/reviews.remote';
	import { createReviewSchema } from '$api/schemas';
	import { goto } from '$app/navigation';
	import { toPackageName } from '$lib';
	import { app } from '$lib/client/state.svelte';
	import { RatingInput } from '$ui/Review';

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

<form
	{...createReview.preflight(createReviewSchema).enhance(async ({ submit }) => {
		await submit();
		goto(`/user/${app.user?.username}/package/${review.packageID}/${review.index}`);
	})}
	class="btn bg-bright"
>
	<h1 class="fg-orange">{review.packageID}</h1>
	<input {...createReview.fields.id.as('number')} value={review.id} class="hidden" tabindex="-1" />
	<input
		{...createReview.fields.pkg.as('text')}
		value={review.packageID}
		class="hidden"
		tabindex="-1"
	/>
	<textarea {...createReview.fields.content.as('text')} value={review.content}></textarea>
	<label class="row">
		<span>Version</span>
		<select {...createReview.fields.version.as('select')}>
			<option value={review.version}>{review.version}</option>
		</select>
	</label>
	<RatingInput t={createReview.fields.rating} value={review.rating} />
	<button class="btn bg-green bold" type="submit">SAVE</button>
	{#each createReview.fields.allIssues() as issue (issue)}
		<p class="issue">{issue.message}</p>
	{/each}
</form>
