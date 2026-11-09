import { css } from './css.ts';
import { js } from './js.ts';
import { at, esc, isSpace, perSource, span, type Result } from './util.ts';

/** `html`: plain markup. `svelte`: `{…}` blocks hold JS. `jsx`: JSX inside JS. */
type Mode = 'html' | 'svelte' | 'jsx';

const NAME = /[A-Za-z][\w:.-]*/y;
const ATTR = /[^\s"'>/={}]+/y;
const UNQUOTED = /[^\s>]+/y;
const ENTITY = /&(?:[A-Za-z][\w]*|#\d+|#x[\da-fA-F]+);/y;
const BLOCK = /[#:/@][a-z]+/y;
const TS_GENERIC = /<[A-Z]\w*\s*(?:,|extends\b|>\s*\()/y;
const LANG_TS = /\blang=["']?ts\b/;

/** `{` expression `}` from `i`, as JS. */
function expression(src: string, i: number, ts: boolean, mode: Mode): Result {
	let out = '{';
	let j = i + 1;
	const block = mode === 'svelte' ? at(BLOCK, src, j) : null;
	if (block) {
		out += span('keyword', block);
		j += block.length;
	}
	const [inner, e] = js(src, ts, j, true);
	return [
		out + inner + (src[e] === '}' ? '}' : ''),
		Math.min(e + 1, src.length),
	];
}

/** Tag from `<` at `i`. Returns the HTML, the end, the name and if it closes. */
function tag(src: string, i: number, ts: boolean, mode: Mode) {
	const closing = src[i + 1] === '/';
	let j = i + (closing ? 2 : 1);
	const name = at(NAME, src, j) ?? '';
	j += name.length;
	let out = `<span class="hljs-tag">&lt;${closing ? '/' : ''}${name ? span('name', name) : ''}`;
	let selfClosing = false;
	let closed = false;
	while (j < src.length) {
		const c = src[j];
		if (c === '>') {
			j++;
			closed = true;
			break;
		}
		if (c === '/' && src[j + 1] === '>') {
			selfClosing = true;
			j += 2;
			out += '/';
			break;
		}
		if (isSpace(c) || c === '=') {
			out += c;
			j++;
		} else if (c === '"' || c === "'") {
			let e = src.indexOf(c, j + 1);
			e = e < 0 ? src.length : e + 1;
			out += span('string', src.slice(j, e));
			j = e;
		} else if (c === '{' && mode !== 'html') {
			const [h, e] = expression(src, j, ts, mode);
			out += h;
			j = e;
		} else if (src[j - 1] === '=') {
			const v = at(UNQUOTED, src, j)!;
			out += span('string', v);
			j += v.length;
		} else {
			const a = at(ATTR, src, j);
			if (!a) {
				out += esc(c);
				j++;
				continue;
			}
			out += a[0] === '@' ? '@' + span('attr', a.slice(1)) : span('attr', a);
			j += a.length;
		}
	}
	return {
		html: out + (selfClosing || closed ? '&gt;' : '') + '</span>',
		end: j,
		name,
		closing,
		selfClosing,
	};
}

/** Markup from `from`. In `jsx` mode, stops after the root element closes. */
function markup(src: string, from: number, ts: boolean, mode: Mode): Result {
	let out = '';
	let i = from;
	let depth = 0;
	const n = src.length;
	while (i < n) {
		const c = src[i];
		if (c === '<' && src.startsWith('<!--', i)) {
			let e = src.indexOf('-->', i);
			e = e < 0 ? n : e + 3;
			out += span('comment', src.slice(i, e));
			i = e;
		} else if (c === '<' && (src[i + 1] === '!' || src[i + 1] === '?')) {
			let e = src.indexOf('>', i);
			e = e < 0 ? n : e + 1;
			const body = esc(src.slice(i, e)).replace(
				/^(&lt;!DOCTYPE\s+)(\w+)/i,
				'$1<span class="hljs-keyword">$2</span>'
			);
			out += `<span class="hljs-meta">${body}</span>`;
			i = e;
		} else if (c === '<' && /[A-Za-z/>]/.test(src[i + 1] ?? '')) {
			const t = tag(src, i, ts, mode);
			out += t.html;
			i = t.end;
			if (mode === 'jsx') {
				if (t.closing) depth--;
				else if (!t.selfClosing) depth++;
				if (depth <= 0) return [out, i];
				continue;
			}
			const raw = t.closing || t.selfClosing ? '' : t.name.toLowerCase();
			if (raw === 'script' || raw === 'style') {
				let e = src.toLowerCase().indexOf(`</${raw}`, i);
				if (e < 0) e = n;
				const body = src.slice(i, e);
				out +=
					raw === 'style'
						? css(body)
						: js(body, LANG_TS.test(src.slice(i - 40, i)) || ts)[0];
				i = e;
			}
		} else if (c === '{' && mode !== 'html') {
			const [h, e] = expression(src, i, ts, mode);
			out += h;
			i = e;
		} else if (c === '&' && mode !== 'jsx' && at(ENTITY, src, i)) {
			const ent = at(ENTITY, src, i)!;
			out += span('symbol', ent);
			i += ent.length;
		} else {
			out += esc(c);
			i++;
		}
	}
	return [out, i];
}

export const html = (src: string, mode: 'html' | 'svelte' = 'html') =>
	markup(src, 0, false, mode)[0];

const nextIndex = perSource(() => new Map<string, number>());

/** If `needle` occurs at or after `i`. Caches the next index per source. */
function occurs(src: string, needle: string, i: number) {
	const found = nextIndex(src);
	const k = found.get(needle);
	if (k !== undefined && (k < 0 || k >= i)) return k >= 0;
	const next = src.indexOf(needle, i);
	found.set(needle, next);
	return next >= 0;
}

/** JSX element at `i` inside JS, or null if `<` starts no element. */
export function jsx(src: string, i: number, ts: boolean): Result | null {
	if (ts && at(TS_GENERIC, src, i)) return null;
	const name = at(NAME, src, i + 1);
	if (src[i + 1] === '>') {
		if (!occurs(src, '</>', i)) return null;
	} else if (!name || (!occurs(src, `</${name}`, i) && !occurs(src, '/>', i)))
		return null;
	return markup(src, i, ts, 'jsx');
}
