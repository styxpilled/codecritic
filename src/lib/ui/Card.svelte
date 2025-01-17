<script lang="ts">
	import { type Package } from '$lib/types';
	import License from './icons/License.svelte';

	interface Props {
		pkg: Package;
		wide?: boolean;
	}

	let { pkg, wide = false }: Props = $props();
</script>

<div class="package" class:wide>
	<h3><a class="fg-blue hov-line" href="/packages/{pkg.name}">{pkg.name}</a></h3>
	<div class="details">
		<p class="description">
			<a tabindex="-1" href="/packages/{pkg.name}">{pkg.description}</a>
		</p>
		{#if pkg.keywords}
			<ul>
				{#each pkg.keywords as keyword}
					<li>
						<a
							class="keyword fg-dark bg-bright hov-link hov-invert"
							href="/search?text=keywords:{keyword}">{keyword}</a
						>
					</li>
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
				<span class="hoverable-content">{pkg.license}</span>
			</span>
		{/if}
	</p>
</div>

<style>
	.package {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		width: 20.65rem;
		background-color: var(--color-bg-brighter);
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		transition: outline-offset 250ms ease-in-out;

		&.wide {
			width: 35rem;
		}

		&:has(h3 > a:focus-visible),
		&:has(.description > a:focus-visible) {
			outline-offset: 2px;
			outline: 2px solid var(--color-blue);
		}
	}

	h3 {
		font-size: 1.25rem;
		font-weight: 600;

		& > a:focus-visible {
			outline: none;
		}
	}

	.details {
		height: 4.75rem;
		overflow: hidden;
	}

	.description {
		overflow: hidden;
		text-overflow: ellipsis;
		text-overflow: '…';

		& > a:focus-visible {
			outline: none;
		}

		&:has(+ ul) {
			max-height: 3rem;
		}
	}

	ul {
		display: flex;
		gap: 0.25rem;
		overflow: hidden;
		flex-flow: wrap;
		& > li > a {
			border-radius: 0.25rem;
			padding: 0 0.25rem;
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
		background-color: var(--color-bg-brighter);
		border-bottom-left-radius: 0.25rem;
		border-bottom-right-radius: 0.25rem;
		padding: 0.25rem;
	} */
</style>
