import { at, esc, isSpace, quoted, span, words } from './util.ts';

const IDENT = /-?[A-Za-z_][\w-]*|--[\w-]+/y;
const NUMBER = /\d+(?:\.\d+)?(?:%|[A-Za-z]+)?/y;
const HEX = /#[\da-fA-F]{3,8}\b/y;
const AT_RULE = /@[\w-]+/y;
const WS = /\s+/y;
const MEDIA_KEYWORDS = words('and or not only');

const comment = (src: string, i: number) => {
	const e = src.indexOf('*/', i + 2);
	return e < 0 ? src.length : e + 2;
};

/** Index of the first `{`, `;` or `}` at nesting level 0 from `i`. */
function statementEnd(src: string, i: number) {
	let depth = 0;
	for (let j = i; j < src.length; j++) {
		const c = src[j];
		if (c === '"' || c === "'") j = quoted(src, j) - 1;
		else if (c === '/' && src[j + 1] === '*') j = comment(src, j) - 1;
		else if (c === '(' || c === '[') depth++;
		else if (c === ')' || c === ']') depth--;
		else if (depth <= 0 && (c === '{' || c === ';' || c === '}')) return j;
	}
	return src.length;
}

/** Shared tokens: whitespace, comments, strings. Returns [html, end] or null. */
function common(src: string, i: number, to: number): [string, number] | null {
	const c = src[i];
	if (isSpace(c)) {
		const w = at(WS, src, i)!;
		return [w, i + w.length];
	}
	if (c === '/' && src[i + 1] === '*') {
		const e = Math.min(comment(src, i), to);
		return [span('comment', src.slice(i, e)), e];
	}
	if (c === '"' || c === "'") {
		const e = Math.min(quoted(src, i), to);
		return [span('string', src.slice(i, e)), e];
	}
	return null;
}

function selector(src: string, from: number, to: number) {
	let out = '';
	let i = from;
	while (i < to) {
		const r = common(src, i, to);
		if (r) {
			[out, i] = [out + r[0], r[1]];
			continue;
		}
		const c = src[i];
		const id = c === '.' || c === '#' ? at(IDENT, src, i + 1) : null;
		const tag = id === null ? at(IDENT, src, i) : null;
		if (id) {
			out += span(c === '.' ? 'selector-class' : 'selector-id', c + id);
			i += id.length + 1;
		} else if (c === ':') {
			const colons = src[i + 1] === ':' ? 2 : 1;
			const name = at(IDENT, src, i + colons) ?? '';
			out += span('selector-pseudo', src.slice(i, i + colons) + name);
			i += colons + name.length;
		} else if (c === '[') {
			let e = src.indexOf(']', i);
			e = e < 0 || e > to ? to : e + 1;
			const inner = esc(src.slice(i, e)).replace(
				/(&quot;|&#x27;).*?\1/g,
				(s) => `<span class="hljs-string">${s}</span>`
			);
			out += `<span class="hljs-selector-attr">${inner}</span>`;
			i = e;
		} else if (tag && !/^\d/.test(tag)) {
			out += span('selector-tag', tag);
			i += tag.length;
		} else if (/\d/.test(c)) {
			const num = at(NUMBER, src, i)!;
			out += span('number', num);
			i += num.length;
		} else {
			out += esc(c);
			i++;
		}
	}
	return out;
}

/** Values in declarations and at-rule preludes. */
function value(src: string, from: number, to: number, prelude = false) {
	let out = '';
	let i = from;
	let parens = 0;
	while (i < to) {
		const r = common(src, i, to);
		if (r) {
			[out, i] = [out + r[0], r[1]];
			continue;
		}
		const c = src[i];
		let tok: string | null;
		if (c === '!' && (tok = at(/![ \t]*important\b/iy, src, i))) {
			out += span('meta', tok);
		} else if (c === '#' && (tok = at(HEX, src, i))) {
			out += span('number', tok);
		} else if (/\d/.test(c) && (tok = at(NUMBER, src, i))) {
			out += span('number', tok);
		} else if ((tok = at(IDENT, src, i))) {
			if (src[i + tok.length] === '(') out += span('built_in', tok);
			else if (tok.startsWith('--') && parens === 0) out += span('attr', tok);
			else if (prelude && MEDIA_KEYWORDS.has(tok)) out += span('keyword', tok);
			else if (prelude && at(/[ \t]*:/y, src, i + tok.length))
				out += span('attribute', tok);
			else out += esc(tok);
		} else {
			tok = c;
			if (c === '(') parens++;
			else if (c === ')') parens--;
			out += esc(c);
		}
		i += tok.length;
	}
	return out;
}

export function css(src: string) {
	let out = '';
	let i = 0;
	const n = src.length;
	while (i < n) {
		const r = common(src, i, n);
		if (r) {
			[out, i] = [out + r[0], r[1]];
			continue;
		}
		const c = src[i];
		if (c === '}' || c === ';' || c === '{') {
			out += c;
			i++;
			continue;
		}
		const end = statementEnd(src, i);
		const rule = at(AT_RULE, src, i);
		if (rule) {
			out += span('keyword', rule) + value(src, i + rule.length, end, true);
		} else if (src[end] === '{') {
			out += selector(src, i, end);
		} else {
			const colon = src.indexOf(':', i);
			if (colon < 0 || colon > end) out += value(src, i, end);
			else {
				const name = src.slice(i, colon).trimEnd();
				out +=
					span(name.startsWith('--') ? 'attr' : 'attribute', name) +
					src.slice(i + name.length, colon + 1) +
					value(src, colon + 1, end);
			}
		}
		if (src[end] === '{') {
			out += '{';
			i = end + 1;
		} else i = end;
	}
	return out;
}
