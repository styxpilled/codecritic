<script lang="ts">
	import DOMPurify from 'dompurify';
	import hljs from 'highlight.js/lib/core';
	import css from 'highlight.js/lib/languages/css';
	import js from 'highlight.js/lib/languages/javascript';
	import ts from 'highlight.js/lib/languages/typescript';
	import xml from 'highlight.js/lib/languages/xml';
	import { Marked } from 'marked';
	import { markedHighlight } from 'marked-highlight';
	import { browser } from '$app/environment';
	import { stripGit } from '$lib';
	import { hljsDefineSvelte } from '$lib/client/highlight';
	import '$styles/github.css';
	import '$styles/readme.css';
	import Icon from './Icon.svelte';

	interface Props {
		readme: string;
		url: string;
	}

	let { readme, url }: Props = $props();

	const _url = $derived(stripGit(url).replace('github', 'raw.githubusercontent'));
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
			},
		}),
		{ gfm: true }
	);
</script>

{#if readme}
	<div class="readme">
		{#await marked.parse(readme
				.replaceAll('src="./', `src="${_url}/HEAD/`)
				.replaceAll(/srcset="(?!https:\/\/)/g, `srcset="${_url}/HEAD/`)
				.replaceAll(/src="(?!https:\/\/)/g, `src="${_url}/HEAD/`)) then parsed}
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
