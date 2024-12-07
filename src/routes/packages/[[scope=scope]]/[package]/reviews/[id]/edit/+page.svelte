<!-- @migration-task Error while migrating Svelte code: `<form>` is invalid inside `<form>` -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import RatingInput from '$ui/RatingInput.svelte';

	export let data;
	let date = new Date(data.review.created_at);
</script>

<div class="review">
	<form
		class="submit-review"
		use:enhance
		method="post"
		action="/packages/{data.review.package}/reviews/{data.review.id}/edit?/edit"
	>
		<div class="review-rating">
			<h2 class="hov-link hov-line">
				<a href="/packages/{data.review.package}">{data.review.package}</a>
			</h2>
			<RatingInput value={data.review.rating} />
			<input
				type="datetime-local"
				disabled
				value={new Date(date.getTime() + date.getTimezoneOffset() * -60 * 1000)
					.toISOString()
					.slice(0, 19)}
			/>
		</div>
		<textarea bind:value={data.review.review} placeholder="Add a review..." name="review">
		</textarea>
		<div class="end">
			<div class="row">
				<button form="delete-review" class="btn bg-red" type="submit">Delete</button>
				<button class="btn bg-green" type="submit">Save</button>
			</div>
		</div>
	</form>
	<form
		use:enhance
		id="delete-review"
		method="post"
		action="/packages/{data.review.package}/reviews/{data.review.id}/edit?/delete"
	></form>
</div>

<style>
	.review {
		padding: 0.5rem;
		margin: 0.5rem;
		margin-top: 0;
		padding-top: 0;
		border-radius: 0.5rem;
		max-width: 50rem;
	}

	.submit-review {
		display: flex;
		flex-direction: column;
		background-color: var(--color-bg-bright);
		padding: 1rem;
		margin: 2rem;
		gap: 1rem;
	}

	.submit-review > .review-rating {
		display: flex;
		/* align-items: center; */
		justify-content: space-between;
	}

	textarea {
		resize: none;
		height: 6rem;
		transition: height 300ms ease-in-out;
	}

	textarea:focus-visible {
		height: 12rem;
	}

	.submit-review {
		border-radius: 0.5rem;
		margin: 0.5rem;
		/* width: 50rem; */
	}
</style>
