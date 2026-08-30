<script lang="ts">
	import { getPopularReviews, getRecentReview } from '$api/reviews.remote';
	import { page } from '$app/state';
	import { stripGit } from '$lib';
	import type { Package } from '$lib/server/db/schema';
	import Icon from '$ui/Icon.svelte';
	import List from '$ui/List.svelte';
	import ReviewEditor from '$ui/Review/Editor.svelte';
	import Recent from '$ui/Review/Recent.svelte';
	import Reviews from '$ui/Reviews.svelte';

	type Props = {
		pkg: Package;
		name: string;
	};

	let { pkg, name }: Props = $props();
	const managers = ['npm', 'pnpm', 'bun', 'deno', 'yarn'];
	let selectedManager = $state('npm');
	let reviewsPromise = $derived(
		getPopularReviews({
			packageID: name,
		})
	);
	const yourReviewPromise = $derived(
		getRecentReview({
			pkg: name,
		})
	);
	const yourReview = $derived(await yourReviewPromise);
	const reviews = $derived(await reviewsPromise);
</script>

<div class="sidebar col start" class:mini={yourReview}>
	<div class="row">
		{#each managers as manager (manager)}
			<label class="btn pointer hov-light fg-dark bg-bright">
				{manager}
				<input class="" type="radio" name="install" value={manager} bind:group={selectedManager} />
			</label>
		{/each}
	</div>
	<p class="btn lg fg-dark bg-light row space">
		{#each managers as manager (manager)}
			<span class="command" data-manager={manager}>{manager} add {pkg.name}</span>
		{/each}
		<span class="copy-feedback btn bg-green">Copied!</span>
		<button
			class="copy-btn hov-light js-only"
			onclick={async () => {
				await navigator.clipboard.writeText(`${selectedManager} add ${pkg.name}`);
			}}
		>
			<Icon size="1.25em" id="copy" />
		</button>
	</p>
	<div class="links col start gap-sm">
		<p class="semibold fg-dark">Repository</p>
		<p class="btn lg fg-dark bg-light hov-link">{stripGit(pkg.repository)}</p>
		<p class="semibold fg-dark">Homepage</p>
		<p class="btn lg fg-dark bg-light">
			<a class="hov-link" style="word-break:break-all;" href={pkg.homepage}>{pkg.homepage}</a>
		</p>
	</div>
	{#if yourReview}
		<Recent review={yourReview} packageID={name} small />
		<ReviewEditor {pkg} />
	{:else}
		<ReviewEditor {pkg} />
	{/if}
	{#if reviews.length && page.url.pathname === `/packages/${name}`}
		<div class="col">
			<List columns={1} style="width: 100%; --gap: .5rem">
				{#each reviews as review (review.id)}
					<Reviews {review} user={review.author} heading='username' small />
				{/each}
				{#snippet foot()}
					<span></span>
					<a href="/packages/{name}/reviews/popular" class="hov-link">more</a>
				{/snippet}
			</List>
		</div>
	{/if}
</div>

<style>
	.sidebar {
		display: flex;
		margin-bottom: 1rem;
		margin-left: 0.5rem;
		width: calc(480px - 6rem);

		:global(.recent) {
			display: none;
		}

		:global(.recent:has(.show-editor:not(:checked))) {
			display: flex;

			& + .review-editor {
				display: none;
			}
		}

		@media (width <= 1200px) {
			grid-row-start: 2;
		}

		@media (width <= 950px) {
			margin: 0;
			width: 100%;
		}
	}

	.sidebar p,
	.sidebar div {
		width: 100%;
	}

	.command {
		display: none;
	}

	.sidebar:has([value='npm']:checked) [data-manager='npm'],
	.sidebar:has([value='pnpm']:checked) [data-manager='pnpm'],
	.sidebar:has([value='bun']:checked) [data-manager='bun'],
	.sidebar:has([value='deno']:checked) [data-manager='deno'],
	.sidebar:has([value='yarn']:checked) [data-manager='yarn'] {
		display: block;
	}

	label:has(input:checked) {
		--bg: var(--color-bg-brightest);
		--fg: var(--color-text-darker);
	}

	.copy-feedback {
		position-anchor: --copy-anchor;
		position-area: top center;
		position: absolute;
		margin-bottom: 0.25rem;
		display: none;
		transition: display 0.5s allow-discrete;
		&:has(+ button:active) {
			display: block;
		}
	}

	.copy-btn {
		anchor-name: --copy-anchor;
	}

	@media (width >= 1200px) {
		.sidebar {
			float: right;
			max-width: calc(480px - 1rem);
		}
	}
</style>
