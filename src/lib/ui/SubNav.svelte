<script lang="ts">
	import { page } from '$app/state';

	let { links }: { links: { label: string; href: string }[] } = $props();
</script>

<nav>
	<ul class="row upcase">
		{#each links as { label, href } (href)}
			<li>
				<a
					class="hov-link fg-dark"
					class:active={page.url.pathname === href}
					{href}
				>
					{label}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	ul {
		gap: 1.5rem;
		padding: 0.5rem 0;
		margin-bottom: 1rem;
		border-bottom: 1px solid var(--color-bg-brightest);
		font-size: 0.75rem;
		letter-spacing: 0.075em;
	}

	.active {
		--fg: var(--color-text);
	}
</style>
