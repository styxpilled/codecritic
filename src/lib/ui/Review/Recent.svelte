<script lang="ts">
	import { app } from '$lib/client/state.svelte';
	import type { Review } from '$lib/server/db/schema';
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

<div class="recent col bg-bright" class:small>
	<div class="col nogap">
		<span class="fg-dark">Rated</span>
		<RatingInput noInput={true} value={review?.rating || 0} t={{}} />
	</div>
	{#if app.user}
		{#if review}
			<a href="/packages/{packageID}/review/{review.index}/edit" class="fg-dark hov-link">
				Edit or delete review...
			</a>
		{/if}
		<a href="/packages/{packageID}" class="fg-dark hov-link">
			Review or log{review ? ' again' : ''}...
		</a>
	{:else}
		<a href="/login/github" class="fg-dark hov-link">Sign in to review</a>
	{/if}
</div>

<style>
	.recent {
		padding: 1rem 0;
		float: right;
		align-self: flex-end;
		border-radius: 0.5rem;
		text-align: center;
		width: 18.25rem;

		&.small {
			align-self: center;
			/* width: 100%; */
		}

		& > * {
			padding: 0 1rem 0.375rem;
			width: 100%;
			border-bottom: 1px solid var(--color-bg);
		}
	}

	@media (width <=950px) {
		.recent {
			width: 100%;
		}
	}
</style>
