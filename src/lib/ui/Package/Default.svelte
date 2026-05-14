<script lang="ts">
	import Icon from '$ui/Icon.svelte';

	type Props = {
		pkg: {
			name: string;
			keywords?: string[];
			description: string;
			latest?: string | null;
			license?: string | null;
		};
	};

	let { pkg }: Props = $props();
</script>

<div class="pkg">
	<h3><a class="fg-blue hov-line semibold" href="/packages/{pkg.name}">{pkg.name}</a></h3>
	<div class="details">
		<p class="description">
			<a tabindex="-1" href="/packages/{pkg.name}">{pkg.description}</a>
		</p>
		{#if pkg.keywords}
			<ul class="row">
				{#each pkg.keywords.filter((k) => k).slice(0, 7) as keyword, i (i)}
					<li>
						<a
							class="keyword fg-dark bg-bright hov-link hov-invert"
							href="/search?text=keywords:{keyword}"
						>
							{keyword}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
	<p class="meta row space">
		{#if pkg.latest}
			<span><span class="fg-yellow">@latest</span> <span class="fg-green">{pkg.latest}</span></span>
		{/if}
		{#if pkg.license}
			<span class="hoverable">
				<Icon size="1em" id="scale" />
			</span>
			<span class="hoverable-content hoverable-top">{pkg.license}</span>
		{/if}
	</p>
</div>

<style>
	.pkg {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		width: 100%;
		background-color: var(--color-bg-brighter);
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		transition: outline-offset 0.25s ease-in-out;

		&:has(h3 > a:focus-visible),
		&:has(.description > a:focus-visible) {
			outline-offset: 2px;
			outline: 2px solid var(--color-blue);
		}
	}

	h3 a {
		height: 1.5rem;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		display: block;
		max-width: 20rem;
	}

	.details {
		height: 4.5rem;
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
		flex-wrap: wrap;
		gap: 0 0.25rem;
		overflow: hidden;
	}

	.keyword {
		word-break: keep-all;
		border-radius: 0.25rem;
		padding: 0 0.25rem;
	}
</style>
