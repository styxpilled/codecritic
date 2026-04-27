<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		head,
		foot,
		columns,
		...rest
	}: {
		children: Snippet;
		head?: Snippet;
		foot?: Snippet;
		columns?: number;
		style?: string;
	} = $props();
</script>

<div class="list col" style:--columns={columns} {...rest}>
	{#if head}
		<div class="list-header row space upcase fg-dark">
			{@render head()}
		</div>
	{/if}
	<div class="list-content">{@render children()}</div>
	{#if foot}
		<div class="list-footer row space upcase fg-dark">
			{@render foot()}
		</div>
	{/if}
</div>

<style>
	.list {
		margin: 0 -1.5rem;
		/* background: red; */
		/* padding-top: 0.5rem; */
		@media (width <=950px) {
			margin: 1rem;
		}

		&:has(> .list-header) {
			margin-top: 1rem;
		}
		&:has(> .list-footer) {
			margin-bottom: 1rem;
		}
	}

	.list-content {
		display: grid;
		grid-template-columns: repeat(var(--columns, 3), 1fr);
		gap: var(--gap, 0.5rem);
		width: 100%;
		@media (width <=950px) {
			grid-template-columns: repeat(calc(var(--columns, 3) / 3), 1fr);
		}
	}

	.list-header,
	.list-footer {
		width: 100%;
		font-size: 0.75rem;
		border-bottom: 1px solid var(--color-bg-brightest);
		letter-spacing: 0.075em;
	}

	.list-footer {
		border-bottom: none;
		border-top: 1px solid var(--color-bg-brightest);
	}
</style>
