<script lang="ts">
	import { Marked } from 'marked';
	import { markedHighlight } from 'marked-highlight';
	import { baseUrl } from 'marked-base-url';
	import hljs from 'highlight.js';

	import '$styles/github.css';
	import { stripGit } from '$lib';

	interface Props {
		readme: string;
		url: string;
	}

	let { readme, url }: Props = $props();

	url = stripGit(url);

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
	{#await marked.parse(readme.replaceAll('src="./', `src="${url}/raw/main/`)) then r}
		{@html r}
	{/await}
{/if}

<style>
	:global(.readme) {
		& img {
			display: inline-block;
		}

		& > h1,
		& > h2,
		& > h3,
		& > p {
			margin: 1rem 0rem;
		}

		& > h1,
		& > h2 {
			border-bottom: 1px solid var(--color-bg-brighter);
			padding-bottom: 0.5rem;
		}

		& > h1,
		& > h2,
		& > h3 {
			font-weight: 600;
			white-space: pre;
		}

		& a {
			text-decoration: underline;
			text-underline-offset: 0.2rem;
			color: var(--color-blue);
		}

		& a:hover {
			text-decoration-style: dashed;
		}

		& code[class^='language-'] {
			display: block;
			padding: 0.25rem 0.5rem 0;
			background-color: var(--color-bg-brighter);
			border-radius: 0.25rem;
			overflow: scroll;
		}

		& code:not([class^='language-']) {
			padding: 0.2rem 0.4rem;
			background-color: var(--color-bg-brighter);
			border-radius: 0.25rem;
			color: #abb2bf;
		}

		& ul {
			list-style: disc;
			margin-left: 2rem;
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
			margin-top: 0.5rem;
			margin-bottom: 0.5rem;
		}

		& .language-bash {
			margin: 0.25rem 0;
		}

		& hr {
			height: 0.25rem;
			margin: 1.5rem 0;
		}

		@media (prefers-color-scheme: dark) {
			& [href$='#gh-light-mode-only'],
			& [src$='#gh-light-mode-only'] {
				display: none;
			}
		}
	}
</style>
