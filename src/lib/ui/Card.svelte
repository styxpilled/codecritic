<script lang="ts">
	import { type Package } from '$lib/types';
	import License from './icons/License.svelte';

	export let pkg: Package;
	export let wide = false;
</script>

<div class="package" class:wide>
	<h3><a class="fg-blue hov-line" href="/packages/{pkg.name}">{pkg.name}</a></h3>
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
	<p class="meta">
		{#if pkg.latest}
			<span><span class="fg-yellow">@latest</span> <span class="fg-green">{pkg.latest}</span></span>
		{/if}
		{#if pkg.license}
			<span class="hoverable">
				<License />
				<div class="hoverable-content">{pkg.license}</div>
			</span>
		{/if}
	</p>
</div>

<style>
	.package {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		width: 20rem;
		background-color: var(--color-bg-bright);
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;

		&.wide {
			width: 35rem;
		}
	}

	h3 {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.details {
		height: 4.75rem;
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
			background-color: var(--color-bg);
			color: var(--color-text-dark);

			&:hover {
				color: var(--color-bg);
				background-color: var(--color-blue);
				cursor: pointer;
			}
		}
	}

	.keyword {
		word-break: keep-all;
	}

	.meta {
		justify-self: flex-end;
		display: flex;
		justify-content: space-between;
	}

	/* .review-info {
		display: flex;
		justify-content: space-between;
		background-color: var(--color-bg-bright);
		border-bottom-left-radius: 0.25rem;
		border-bottom-right-radius: 0.25rem;
		padding: 0.25rem;
	} */
</style>
