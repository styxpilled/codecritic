<script lang="ts">
	import { Marked } from 'marked';
	import { markedHighlight } from 'marked-highlight';
	import { baseUrl } from 'marked-base-url';
	import hljs from 'highlight.js';

	import '$styles/github.css';

	interface Props {
		readme: string;
		url: string;
	}

	let { readme, url }: Props = $props();

	const marked = new Marked(
		markedHighlight({
			langPrefix: 'hljs language-',
			highlight(code, lang, info) {
				const language = hljs.getLanguage(lang) ? lang : 'plaintext';
				return hljs.highlight(code, { language }).value;
			}
		}),
		baseUrl(url + '/blob/main/'),
		{ gfm: true }
	);
</script>

{#if readme}
	{#await marked.parse(readme) then r}
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
		border-bottom: 1px solid var(--color-bg-bright);
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
		color: var(--color-blue);
	}

	:global(.readme code[class^='language-']) {
		display: block;
		padding: 0.25rem 0.5rem 0;
		background-color: var(--color-bg-bright);
		border-radius: 0.25rem;
		overflow: scroll;
	}

	:global(.readme code:not([class^='language-'])) {
		padding: 0.2rem 0.4rem;
		background-color: var(--color-bg-bright);
		border-radius: 0.25rem;
		color: #abb2bf;
	}

	:global(.readme ul) {
		list-style: disc;
		margin-left: 2rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}

	:global(.readme .language-bash) {
		margin: 0.25rem 0;
	}

	:global(.readme hr) {
		height: 0.25rem;
		margin: 1.5rem 0;
	}
</style>
