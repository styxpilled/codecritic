<script lang="ts">
	import { createReview, deleteReview } from '$api/reviews.remote';
	import { createReviewSchema } from '$api/schemas';
	import { goto } from '$app/navigation';
	import type { Package, Review } from '$lib/server/db/schema';
	import RatingInput from './RatingInput.svelte';

	let {
		pkg,
		review,
		onSubmit,
	}: ({ pkg: Package; review?: undefined } | { pkg?: undefined; review: Review }) & {
		onSubmit?: () => void;
	} = $props();
</script>

<form
	class="review-editor fg-dark bg-light col start"
	{...createReview.preflight(createReviewSchema).enhance(async ({ submit }) => {
		await submit();
		if (onSubmit) onSubmit();
	})}
>
	<input
		type="text"
		{...createReview.fields.pkg.as('text')}
		class="hidden"
		tabindex="-1"
		value={pkg?.name || review?.packageID}
	/>
	<div class="row space">
		<RatingInput t={createReview.fields.rating} value={review?.rating} />
		<input type="date" value={new Date().toISOString().slice(0, 10)} />
	</div>
	{#if review}
		<input
			{...createReview.fields.id.as('number')}
			value={review.id}
			class="hidden"
			tabindex="-1"
		/>
	{/if}
	<textarea
		placeholder="Add a review..."
		{...createReview.fields.content.as('text')}
		value={review?.content}
	></textarea>
	<div class="row space">
		<label class="row">
			<span>Version</span>
			<select {...createReview.fields.version.as('select')}>
				<option value={pkg?.latest || review?.version}>{pkg?.latest || review?.version}</option>
			</select>
			<span>-- TODO</span>
		</label>
		<div class="row">
			{#if review}
				<button class="btn bg-red bold" form="delete-review-{review.id}" type="submit"
					>DELETE</button
				>
			{/if}
			<button class="btn bg-green bold" type="submit">SAVE</button>
		</div>
	</div>
	{#each createReview.fields.allIssues() as issue (issue)}
		<p class="issue">{issue.message}</p>
	{/each}
	{#each deleteReview.fields.allIssues() as issue (issue)}
		<p class="issue">{issue.message}</p>
	{/each}
</form>
{#if review}
	<form
		{...deleteReview.enhance(async ({ submit }) => {
			submit();
			goto(`/packages/${review.packageID}`);
		})}
		id="delete-review-{review.id}"
		class="hidden"
		tabindex="-1"
	>
		<input {...deleteReview.fields.id.as('number')} value={review.id} />
		<button class="btn bg-green bold" type="submit" id="delete-review-{review.id}"> SAVE </button>
	</form>
{/if}

<style>
	.review-editor {
		padding: 0.75rem 1rem 0.5rem;
		border-radius: 0.5rem;
		width: calc(480px - 1rem);

		@media (width <= 950px) {
			width: 100%;
		}
	}

	textarea {
		width: 100%;
		max-width: 100%;
		min-height: 3lh;
		max-height: 10lh;
		field-sizing: content;
	}

	div.row.space {
		width: 100%;
	}

	button {
		font-size: 0.9rem;
		transition:
			padding 150ms ease-in-out,
			margin 150ms ease-in-out;
		&:hover,
		&:focus {
			padding: 2px calc(0.25rem + 2px);
			margin: -2px;
		}
	}
</style>
