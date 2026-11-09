import hljs from 'highlight.js/lib/core';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import ts from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import sanitizeHtml from 'sanitize-html';
import { githubRepo } from '#lib';
import { hljsDefineSvelte } from '#lib/client/highlight.ts';

hljs.registerLanguage('javascript', js);
hljs.registerLanguage('typescript', ts);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
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

const isRelative = (url: string) => !/^([a-z][a-z\d+.-]*:|\/\/|#)/i.test(url);

const resolve = (url: string, base: string) =>
	new URL(url.replace(/^\/+/, ''), base).href;

const resolveSrcset = (srcset: string, base: string) =>
	srcset
		.split(',')
		.filter((s) => s.trim())
		.map((s) => {
			const [u, ...rest] = s.trim().split(/\s+/);
			return [isRelative(u) ? resolve(u, base) : u, ...rest].join(' ');
		})
		.join(', ');

const BASE_OPTIONS: sanitizeHtml.IOptions = {
	allowedTags: sanitizeHtml.defaults.allowedTags.concat([
		'img',
		'picture',
		'source',
		'details',
		'summary',
		'del',
		'ins',
		'input',
	]),
	allowedAttributes: {
		'*': ['align'],
		a: ['href', 'name', 'title', 'rel'],
		img: ['src', 'srcset', 'alt', 'title', 'width', 'height'],
		source: ['srcset', 'media', 'type'],
		input: ['type', 'checked', 'disabled'],
		details: ['open'],
		td: ['colspan', 'rowspan'],
		th: ['colspan', 'rowspan'],
	},
	allowedClasses: { code: ['hljs', 'language-*'], span: ['hljs-*'] },
	allowedSchemes: ['http', 'https', 'mailto'],
	allowProtocolRelative: false,
};

export async function renderReadme(value: string, url: string | null) {
	if (!value) return '';
	const repo = githubRepo(url);
	const raw = `https://raw.githubusercontent.com/${repo}/HEAD/`;
	const blob = `https://github.com/${repo}/blob/HEAD/`;

	const media: sanitizeHtml.Transformer = (tagName, attribs) => {
		if (repo) {
			if (attribs.src && isRelative(attribs.src))
				attribs.src = resolve(attribs.src, raw);
			if (attribs.srcset) attribs.srcset = resolveSrcset(attribs.srcset, raw);
		}
		return { tagName, attribs };
	};

	return sanitizeHtml(await marked.parse(value), {
		...BASE_OPTIONS,
		transformTags: {
			a: (tagName, { href, ...attribs }) => {
				if (href && isRelative(href)) href = repo ? resolve(href, blob) : '';
				return {
					tagName,
					attribs: {
						...attribs,
						...(href && { href }),
						rel: 'nofollow noopener',
					},
				};
			},
			img: media,
			source: media,
			input: (tagName, { checked }) => ({
				tagName,
				attribs: {
					type: 'checkbox',
					disabled: '',
					...(checked !== undefined && { checked: '' }),
				},
			}),
		},
	});
}
