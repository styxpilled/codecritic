import { Marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { githubRepo } from '#lib';
import { highlight } from './highlight/index.ts';
import { esc } from './highlight/util.ts';

/** Matches the only markup the highlighter may produce. */
const HIGHLIGHT_TAGS = /<span class="hljs-[\w -]+">|<\/span>/g;

/**
 * Highlighted code skips the sanitizer: it is escaped text in hljs spans.
 * Code blocks render as placeholders, which are replaced after sanitizing.
 */
let highlighted: string[] = [];
let placeholder = '';

const codeBlock = (cls: string, body: string) =>
	`<pre><code${cls ? ` class="${cls}"` : ''}>${body}</code></pre>\n`;

const marked = new Marked({
	gfm: true,
	renderer: {
		code({ text, lang }) {
			const name = lang?.match(/^\S+/)?.[0];
			if (!name) return codeBlock('', esc(text));
			const cls = `hljs language-${esc(name)}`;
			const html = highlight(text, name);
			if (html === null || /[<>]/.test(html.replace(HIGHLIGHT_TAGS, '')))
				return codeBlock(cls, esc(text));
			highlighted.push(html);
			return codeBlock(cls, `${placeholder}${highlighted.length - 1};`);
		},
	},
});

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
	allowedClasses: { code: ['hljs', 'language-*'] },
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

	highlighted = [];
	placeholder = `x${crypto.randomUUID().replaceAll('-', '')}:`;
	const html = sanitizeHtml(marked.parse(value, { async: false }), {
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
	return html.replace(
		new RegExp(`${placeholder}(\\d+);`, 'g'),
		(_, i: string) => highlighted[Number(i)]
	);
}
