<script lang="ts">
	import { isReviewPackage, type Package, type ReviewedPackage } from '$lib/types';
	import Avatar from './Avatar.svelte';
	import Rating from './Rating.svelte';

	export let pkg: Package | ReviewedPackage;
</script>

<div class="package">
	<div class="package-info">
		<h3>{pkg.name}</h3>
		<p class="description">{pkg.description}</p>
		<ul>
			{#each pkg.tags as tag}
				<li class="tag">{tag}</li>
			{/each}
		</ul>
		<span class="details row">
			<Avatar size="sm" />
			{pkg.author}
			published {pkg.version}
		</span>
	</div>
	{#if isReviewPackage(pkg)}
		<div class="review-info">
			<span class="row"><Avatar size="sm" /> {pkg.review.author}</span>
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
		border-radius: 0.25rem;

		& > .package-info {
			padding: 0 0.25rem;
		}
	}

	h3 {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.description {
		height: 3rem;
	}

	ul {
		display: flex;
		gap: 0.25rem;
		& > li {
			border-radius: 0.25rem;
			padding: 0 0.25rem;
			background-color: var(--color-bg-bright);
		}
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
