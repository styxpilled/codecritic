import { at, esc, quoted, span } from './util.ts';

const NUMBER = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
const WORD = /[A-Za-z_$][\w$]*/y;
const KEY_AHEAD = /\s*:/y;
const LITERALS = new Set(['true', 'false', 'null']);

/** JSON, also with comments and unquoted keys (jsonc, json5). */
export function json(src: string) {
	let out = '';
	let i = 0;
	while (i < src.length) {
		const c = src[i];
		let tok: string | null;
		if (c === '"' || c === "'") {
			const e = quoted(src, i);
			tok = src.slice(i, e);
			out += span(at(KEY_AHEAD, src, e) ? 'attr' : 'string', tok);
		} else if (c === '/' && (src[i + 1] === '/' || src[i + 1] === '*')) {
			let e = src.indexOf(src[i + 1] === '/' ? '\n' : '*/', i + 2);
			e = e < 0 ? src.length : src[i + 1] === '/' ? e : e + 2;
			tok = src.slice(i, e);
			out += span('comment', tok);
		} else if ((tok = at(NUMBER, src, i))) {
			out += span('number', tok);
		} else if ((tok = at(WORD, src, i))) {
			out += LITERALS.has(tok)
				? `<span class="hljs-literal"><span class="hljs-keyword">${tok}</span></span>`
				: at(KEY_AHEAD, src, i + tok.length)
					? span('attr', tok)
					: esc(tok);
		} else if ('{}[],:'.includes(c)) {
			tok = c;
			out += span('punctuation', c);
		} else {
			tok = c;
			out += esc(c);
		}
		i += tok.length;
	}
	return out;
}
