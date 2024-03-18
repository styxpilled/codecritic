<script lang="ts">
	import { marked } from 'marked';

	export let readme: string;
</script>

{#if readme}
	{#await marked.parse(readme, { gfm: true }) then r}
		{@html r}
	{/await}
{/if}

<style>
	:global(.readme img) {
		display: inline-block;
	}

	:global(.readme > h1),
	:global(.readme > h2),
	:global(.readme > h3),
	:global(.readme > p) {
		margin: 1rem 0rem;
	}

	:global(.readme > h1),
	:global(.readme > h2) {
		border-bottom: 1px solid #2b2a33;
		padding-bottom: 0.5rem;
	}

	:global(.readme > h1),
	:global(.readme > h2),
	:global(.readme > h3) {
		font-weight: 600;
		white-space: pre;
	}

	:global(.readme a) {
		text-decoration: underline;
		text-underline-offset: 0.2rem;
		color: #2f81f7;
	}

	:global(.readme code[class^='language-']) {
		display: block;
		padding: 0.25rem 0.5rem 0;
		background-color: #2b2a33;
		border-radius: 0.25rem;
		overflow: scroll;
	}

	:global(.readme code:not([class^='language-'])) {
		padding: 0.2rem 0.4rem;
		background-color: #2b2a33;
		border-radius: 0.25rem;
	}

	:global(.readme ul) {
		list-style: disc;
		margin-left: 2rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}
</style>
