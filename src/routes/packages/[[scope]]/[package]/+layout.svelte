<script lang="ts">
	import { getNPMPackage } from '$api/npm.remote';
	import { toPackageName } from '$lib';
	import { relativeTimeFromDates } from '$lib/helpers';
	import Sidebar from './Sidebar.svelte';

	let { children, params } = $props();
	const pkg = $derived(await getNPMPackage(toPackageName(params)));
</script>

<div class="package col center">
	<div class="content">
		<Sidebar {pkg} name={toPackageName(params)} />
		<div class="metadata">
			<h1 class="fg-orange">{pkg.name}</h1>
			<div class="row">
				{#if pkg.latest}
					<p class="fg-yellow">@latest</p>
					<p class="fg-purple">
						{pkg.latest}
					</p>
				{/if}
				{#if pkg.modified}
					<p class="fg-dark">Published {relativeTimeFromDates(new Date(pkg.modified))}</p>
				{/if}
			</div>
			<p>{pkg.description}</p>
			<ul class="row">
				{#each pkg.keywords as keyword (keyword)}
					<li class="">
						<a
							class="btn fg-dark bg-bright hov-link hov-invert"
							href="/search?query=keywords:{keyword}">{keyword}</a
						>
					</li>
				{/each}
			</ul>
		</div>
		<div>{@render children()}</div>
	</div>
</div>

<style>
	.package {
		margin: 2rem 0;
		height: 100%;
		& > div {
			width: 1200px;
			height: max-content;
			@media (width <=1200px) {
				padding: 0 1rem;
				width: 100vw;
			}
		}
	}

	@media (width <= 1200px) {
		.content {
			display: grid;
			grid-template-columns: 1fr;
			grid-template-rows: auto auto auto;
		}
	}

	.metadata {
		margin-left: 1rem;
	}

	ul {
		margin: 0.5rem;
		max-width: 30rem;
		flex-wrap: wrap;
	}
</style>
