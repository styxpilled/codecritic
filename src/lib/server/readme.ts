import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import { parseHTML } from 'linkedom';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import { stripGit } from '$lib';
import { hljsDefineSvelte } from '$lib/client/highlight';

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
			if (hljs.getLanguage(lang)) {
				return hljs.highlight(code, { language: lang }).value;
			}
			return code;
		},
	}),
	{ gfm: true }
);

/** Rewrite relative asset URLs, parse the markdown, and sanitize the result. */
export async function renderReadme(value: string, url: string | null) {
	if (!value) return '';
	const base = `${stripGit(url).replace('github', 'raw.githubusercontent')}/HEAD/`;
	const parsed = await marked.parse(
		value
			.replaceAll('src="./', `src="${base}`)
			.replaceAll(/srcset="(?!https:\/\/)/g, `srcset="${base}`)
			.replaceAll(/src="(?!https:\/\/)/g, `src="${base}`)
	);
	return DOMPurify(parseHTML('<!DOCTYPE html><body>')).sanitize(parsed);
}
