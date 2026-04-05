<script lang="ts">
	import { Marked } from 'marked';
	import { markedHighlight } from 'marked-highlight';
	import { baseUrl } from 'marked-base-url';
	import hljs from 'highlight.js';
	import DOMPurify from 'dompurify';
	import '$styles/readme.css';
	import '$styles/github.css';
	import { stripGit } from '$lib';
	import { browser } from '$app/environment';
	import Icon from './Icon.svelte';

	interface Props {
		readme: string;
		url: string;
	}

	let { readme, url }: Props = $props();

	url = stripGit(url);

	const marked = new Marked(
		markedHighlight({
			langPrefix: 'hljs language-',
			highlight(code, lang) {
				const language = hljs.getLanguage(lang) ? lang : 'plaintext';
				return hljs.highlight(code, { language }).value;
			}
		}),
		baseUrl(url + '/blob/main/'),
		{ gfm: true }
	);
</script>

{#if readme}
	<div class="readme">
		{#await marked.parse(readme
				.replaceAll('src="./', `src="${url}/raw/main/`)
				.replaceAll(/srcset="(?!https:\/\/)/g, `srcset="${url}/raw/main/`)
				.replaceAll(/src="(?!https:\/\/)/g, `src="${url}/raw/main/`)) then parsed}
			<!-- {@const fixed = parsed.replaceAll(/src="(?!https:\/\/)/, `src="${url}/raw/main/`)} -->
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html DOMPurify(
				browser ? window : (await import('linkedom')).parseHTML('<!DOCTYPE html><body>')
			).sanitize(parsed)}
		{/await}
	</div>
	<label class="hide-readme hov-link fg-blue pointer mobile">
		<Icon size="1.25em" id="x" class="closed" style="color: transparent;" />
		<span class="closed">...more</span>
		<Icon size="1.25em" id="x" class="open" />
		<span class="open">Show less</span>
		<input type="checkbox" name="readme-checkbox" />
	</label>
{/if}
