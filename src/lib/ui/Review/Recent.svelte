<script lang="ts">
	import { app } from '#lib/client/state.svelte.ts';
	import type { Review } from '#lib/server/db/schema.ts';
	import RatingInput from './RatingInput.svelte';

	let {
		review,
		packageID,
		small,
	}: {
		review: Review | null;
		packageID: string;
		small?: boolean;
	} = $props();
</script>

<div class="recent col center bg-bright" class:small>
	<div class="col nogap">
		<span class="fg-dark">Rated</span>
		<RatingInput noInput={true} value={review?.rating || 0} t={{}} />
	</div>
	{#if app.user}
		{#if review}
			<div>
				{#if review.index === 0}
					<a href="/packages/{packageID}/review/edit" class="fg-dark hov-link">
						Edit or delete review...
					</a>
				{:else}
					<a
						href="/user/{app.user.username}/package/{review.packageID}/all"
						class="fg-dark hov-link"
					>
						Show your reviews...
					</a>
				{/if}
			</div>
		{/if}
		<div>
			<label class="fg-dark hov-link pointer">
				<span>Review or log{review ? ' again' : ''}...</span>
				<input type="checkbox" class="show-editor" checked={false} />
			</label>
		</div>
		<!-- <a href="/packages/{packageID}" class="fg-dark hov-link">
			Review or log{review ? ' again' : ''}...
		</a> -->
	{:else}
		<a href="/login/github" class="fg-dark hov-link">Sign in to review</a>
	{/if}
</div>

<style>
	.recent {
		padding: 1rem 0;
		float: right;
		/* align-self: flex-end; */
		border-radius: 0.5rem;
		text-align: center;
		/* width: 18.25rem; */
		/* width: calc(480px - 6rem); */
		&.small {
			align-self: center;
			width: 100%;
		}

		& > * {
			padding: 0 1rem 0.375rem;
			/* width: max-content; */
			display: flex;
			justify-content: center;
			width: 100%;
			border-bottom: 1px solid var(--color-bg);
		}
	}

	label {
		width: max-content;
	}

	@media (width <=950px) {
		.recent {
			width: 100%;
		}
	}
</style>
