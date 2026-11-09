import { css } from './css.ts';
import { html } from './html.ts';
import { js } from './js.ts';
import { json } from './json.ts';

const LANGUAGES: Record<string, (code: string) => string> = {
	javascript: (code) => js(code, false)[0],
	typescript: (code) => js(code, true)[0],
	xml: (code) => html(code),
	css,
	json,
	svelte: (code) => html(code, 'svelte'),
};

const ALIASES: Record<string, string> = {
	js: 'javascript',
	jsx: 'javascript',
	mjs: 'javascript',
	cjs: 'javascript',
	ts: 'typescript',
	tsx: 'typescript',
	mts: 'typescript',
	cts: 'typescript',
	html: 'xml',
	xhtml: 'xml',
	rss: 'xml',
	atom: 'xml',
	xjb: 'xml',
	xsd: 'xml',
	xsl: 'xml',
	plist: 'xml',
	wsf: 'xml',
	svg: 'xml',
	jsonc: 'json',
	json5: 'json',
	vue: 'svelte',
};

/**
 * Highlighted HTML with hljs class names, or null for other languages or
 * input the scanners cannot handle (for example very deep nesting).
 */
export function highlight(code: string, lang: string) {
	const name = lang.toLowerCase();
	const fn = LANGUAGES[ALIASES[name] ?? name];
	try {
		return fn ? fn(code) : null;
	} catch {
		return null;
	}
}
