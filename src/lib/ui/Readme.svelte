<script lang="ts">
	import { Marked } from 'marked';
	import { markedHighlight } from 'marked-highlight';
	import hljs from 'highlight.js/lib/core';
	import js from 'highlight.js/lib/languages/javascript';
	import ts from 'highlight.js/lib/languages/typescript';
	import xml from 'highlight.js/lib/languages/xml';
	import css from 'highlight.js/lib/languages/css';
	import DOMPurify from 'dompurify';
	import '$styles/readme.css';
	import '$styles/github.css';
	import { stripGit } from '$lib';
	import { browser } from '$app/environment';
	import Icon from './Icon.svelte';
	import { hljsDefineSvelte } from '$lib/client/highlight';

	interface Props {
		readme: string;
		url: string;
	}

	let { readme, url }: Props = $props();

	url = stripGit(url).replace('github', 'raw.githubusercontent');

	hljs.registerLanguage('javascript', js);
	hljs.registerLanguage('typescript', ts);
	hljs.registerLanguage('xml', xml);
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('svelte', hljsDefineSvelte);
	hljs.registerLanguage('vue', hljsDefineSvelte);
	const marked = new Marked(
		markedHighlight({
			langPrefix: 'hljs language-',
			highlight(code, lang) {
				let language = hljs.getLanguage(lang) ? lang : 'plaintext';
				return hljs.highlight(code, { language }).value;
			}
		}),
		{ gfm: true }
	);
</script>

{#if readme}
	<div class="readme">
		{#await marked.parse(readme
				.replaceAll('src="./', `src="${url}/HEAD/`)
				.replaceAll(/srcset="(?!https:\/\/)/g, `srcset="${url}/HEAD/`)
				.replaceAll(/src="(?!https:\/\/)/g, `src="${url}/HEAD/`)) then parsed}
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
