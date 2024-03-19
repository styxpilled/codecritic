<script lang="ts">
	import { isReviewPackage, type Package } from '$lib/types';
	import Avatar from './Avatar.svelte';
	import Rating from './Rating.svelte';

	export let pkg: Package;
	export let wide = false;
</script>

<div class="package" class:wide>
	<div class="package-info">
		<h3><a href="/packages/{pkg.name}">{pkg.name}</a></h3>
		<div class="details">
			<p class="description">
				<a href="/packages/{pkg.name}">{pkg.description}</a>
			</p>
			{#if pkg.keywords}
				<ul>
					{#each pkg.keywords as keyword}
						<li class="keyword">{keyword}</li>
					{/each}
				</ul>
			{/if}
		</div>
		<p>
			<!-- <Avatar username={pkg.author} size="sm" />
			{pkg.author} -->
			{#if pkg.latest}
				<span>Latest {pkg.latest}</span>
			{/if}
			{#if pkg.license}
				<span class="hoverable">License: <span class="hoverable-content">{pkg.license}</span></span>
			{/if}
		</p>
	</div>
	{#if isReviewPackage(pkg)}
		<div class="review-info">
			<span class="row"
				><Avatar size="sm" username={pkg.review.author.username} /> {pkg.review.author}</span
			>
			<span><Rating rating={pkg.review.rating} /></span>
		</div>
	{/if}
</div>

<style>
	.package {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 20rem;
		background-color: #2e3235;
		padding: 0.25rem;
		border-radius: 0.25rem;

		&.wide {
			width: 35rem;
		}

		& > .package-info {
			padding: 0 0.25rem;
		}
	}

	h3 {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.details {
		max-height: 4.75rem;
		overflow: hidden;
	}

	.description {
		overflow: hidden;
		text-overflow: ellipsis;
		text-overflow: '…';

		&:has(+ ul) {
			max-height: 3rem;
		}
	}

	ul {
		display: flex;
		gap: 0.25rem;
		overflow: hidden;
		flex-flow: wrap;
		& > li {
			border-radius: 0.25rem;
			padding: 0 0.25rem;
			background-color: var(--color-bg-bright);
		}
	}

	.keyword {
		word-break: keep-all;
	}

	.review-info {
		display: flex;
		justify-content: space-between;
		background-color: var(--color-bg-bright);
		border-bottom-left-radius: 0.25rem;
		border-bottom-right-radius: 0.25rem;
		padding: 0.25rem;
	}
</style>
