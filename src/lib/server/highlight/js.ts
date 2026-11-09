import { jsx } from './html.ts';
import {
	at,
	esc,
	isSpace,
	perSource,
	quoted,
	span,
	words,
	type Result,
} from './util.ts';

const KEYWORDS = words(
	'as in of if for while finally var new function do return void else break catch instanceof with throw case default try switch continue typeof delete let yield const class debugger async await static import from export extends get set'
);
const TS_KEYWORDS = words(
	'type interface enum implements declare namespace abstract readonly keyof infer is satisfies private protected public module asserts unique override accessor'
);
/** Keywords that name a method when a call follows, e.g. `map.get(`. */
const CONTEXTUAL = words(
	'get set type from of as is module namespace declare readonly abstract asserts unique satisfies infer keyof async static'
);
const LITERALS = words('true false null undefined NaN Infinity');
const TS_TYPES = words(
	'any void number boolean string object never symbol bigint unknown'
);
const LANGUAGE_VARS = words(
	'this super window document localStorage sessionStorage module global console arguments'
);
/** Globals that keep `built_in` even when called. */
const BUILT_IN_GLOBALS = words(
	'setInterval setTimeout clearInterval clearTimeout require exports eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape'
);
const BUILT_INS = words(
	'Object Function Boolean Symbol Math Date Number BigInt String RegExp Array Float32Array Float64Array Int8Array Uint8Array Uint8ClampedArray Int16Array Int32Array Uint16Array Uint32Array BigInt64Array BigUint64Array Set Map WeakSet WeakMap ArrayBuffer SharedArrayBuffer Atomics DataView JSON Promise Generator GeneratorFunction AsyncFunction Reflect Proxy Intl WebAssembly Error EvalError InternalError RangeError ReferenceError SyntaxError TypeError URIError'
).union(BUILT_IN_GLOBALS);

const IDENT = /[A-Za-z_$\u00a0-\uffff][\w$\u00a0-\uffff]*/y;
const NUMBER =
	/(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d+)?)n?/y;
const WS = /\s+/y;
const REGEX =
	/\/(?![*/])(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n[])+\/[dgimsuyv]*/y;
const CALL_AHEAD = /\s*\(/y;
const ARROW_AHEAD = /\s*=\s*(?:async\s*)?(?:\([^()]*\)|[\w$]+)\s*=>/y;
const KEY_AHEAD = /[ \t]*:(?!:)/y;
const TS_KEY_AHEAD = /[ \t]*\??:(?!:)/y;
const ARROW = /\s*=>/y;
const METHOD_BODY = /\s*(?::[^;{}=()]*)?\{/y;
/** hljs CLASS_REFERENCE. It can match only a prefix of the name. */
const CLASS_REF =
	/JSON|[A-Z][a-z]+(?:[A-Z][a-z]*|\d)*|[A-Z]{2,}(?:[A-Z][a-z]+|\d)+(?:[A-Z][a-z]*)*|[A-Z]{2,}[a-z]+(?:[A-Z][a-z]+|\d)*(?:[A-Z][a-z]*)*/y;
const CONSTANT = /^[A-Z][A-Z_0-9]+$/;
const USE_STRICT = /^["']use strict["']$/;
const DECORATOR = /@[A-Za-z_$][\w$]*/y;
const DOC =
	/(@[A-Za-z]+)(?:([ \t]*)\{((?:[^{}\n]|\{[^{}\n]*\})*)\}(?:([ \t]+)([\w$.]+)(?=[ \t]*-|[ \t]*$))?)?/gm;

const isDigit = (code: number) => code >= 48 && code <= 57;

/** For each `(`, the index of its `)`, else -1. */
const parenMatches = perSource((s) => {
	const matches = new Int32Array(s.length).fill(-1);
	const stack: number[] = [];
	for (let j = 0; j < s.length; j++) {
		const c = s[j];
		if (c === '"' || c === "'" || c === '`') j = quoted(s, j) - 1;
		else if (c === '(' || c === '[' || c === '{') stack.push(j);
		else if (c === ')' || c === ']' || c === '}') {
			const open = stack.pop();
			if (open !== undefined && c === ')' && s[open] === '(') matches[open] = j;
		}
	}
	return matches;
});

/** Index of the `)` that closes the `(` at `i`, or -1. */
const closeParen = (s: string, i: number) => (i < 0 ? -1 : parenMatches(s)[i]);

function comment(body: string) {
	if (!body.startsWith('/**')) return span('comment', body);
	const html = esc(body).replace(
		DOC,
		(_, tag: string, s1?: string, type?: string, s2?: string, name?: string) =>
			`<span class="hljs-doctag">${tag}</span>` +
			(type === undefined
				? ''
				: `${s1}{<span class="hljs-type">${type}</span>}`) +
			(name === undefined
				? ''
				: `${s2}<span class="hljs-variable">${name}</span>`)
	);
	return `<span class="hljs-comment">${html}</span>`;
}

/**
 * `full` marks everything. `restricted` marks only keywords, literals and
 * built-ins, as hljs does in parameters and template strings.
 */
type Level = 'full' | 'restricted';

/**
 * Highlights JavaScript or TypeScript from `from`. With `inBraces`, stops at
 * the `}` that closes an enclosing `{` (a template or markup expression).
 */
export function js(
	src: string,
	ts: boolean,
	from = 0,
	inBraces = false,
	level: Level = 'full'
): Result {
	const n = src.length;
	const full = level === 'full';
	let out = '';
	let i = from;
	let regexOk = true;
	let prev = '';
	let lineStart = true;
	let depth = 0;
	let declArrow = false;

	/** In TS, hljs marks types in declared parameters. */
	const params = (open: number, close: number, typed = false) =>
		close > open + 1
			? `(<span class="hljs-params">${js(src.slice(open + 1, close), ts, 0, false, ts && typed ? 'full' : 'restricted')[0]}</span>)`
			: '()';

	while (i < n) {
		const c = src[i];
		const code = src.charCodeAt(i);

		if (isSpace(c)) {
			const w = at(WS, src, i)!;
			out += w;
			i += w.length;
			if (w.includes('\n')) lineStart = true;
			continue;
		}
		const atLineStart: boolean = lineStart;
		lineStart = false;

		if (c === '/' && (src[i + 1] === '/' || src[i + 1] === '*')) {
			let e: number;
			if (src[i + 1] === '/') {
				e = src.indexOf('\n', i);
				if (e < 0) e = n;
			} else {
				e = src.indexOf('*/', i + 2);
				e = e < 0 ? n : e + 2;
			}
			out += comment(src.slice(i, e));
			i = e;
			lineStart = atLineStart;
			continue;
		}
		if (c === '"' || c === "'") {
			const e = quoted(src, i);
			const str = src.slice(i, e);
			out += span(atLineStart && USE_STRICT.test(str) ? 'meta' : 'string', str);
			i = e;
			regexOk = false;
			prev = '"';
			continue;
		}
		if (c === '`') {
			let s = '<span class="hljs-string">`';
			let j = i + 1;
			let start = j;
			while (j < n && src[j] !== '`') {
				if (src[j] === '\\') j += 2;
				else if (src[j] === '$' && src[j + 1] === '{') {
					const [inner, e] = js(src, ts, j + 2, true, 'restricted');
					const close = src[e] === '}' ? '}' : '';
					s += `${esc(src.slice(start, j))}<span class="hljs-subst">\${${inner}${close}</span>`;
					j = start = e + 1;
				} else j++;
			}
			j = Math.min(j + 1, n);
			out += s + esc(src.slice(start, j)) + '</span>';
			i = j;
			regexOk = false;
			prev = '`';
			continue;
		}
		if (isDigit(code) || (c === '.' && isDigit(src.charCodeAt(i + 1)))) {
			const num = at(NUMBER, src, i)!;
			out += span('number', num);
			i += num.length;
			regexOk = false;
			prev = '0';
			continue;
		}
		if (c === '/' && regexOk) {
			const re = at(REGEX, src, i);
			if (re) {
				out += span('regexp', re);
				i += re.length;
				regexOk = false;
				continue;
			}
		}
		if (c === '.' && src[i + 1] === '.' && src[i + 2] === '.') {
			out += '...';
			i += 3;
			regexOk = true;
			prev = '...';
			continue;
		}
		if (full && c === '<' && regexOk) {
			const r = jsx(src, i, ts);
			if (r) {
				out += r[0];
				i = r[1];
				regexOk = false;
				prev = '>';
				continue;
			}
		}
		if (full && c === '@') {
			const d = at(DECORATOR, src, i);
			if (d) {
				out += span('meta', d);
				i += d.length;
				continue;
			}
		}
		if (full && c === '(') {
			const close = closeParen(src, i);
			const arrow =
				regexOk && prev !== 'async' && close > 0
					? at(ARROW, src, close + 1)
					: null;
			if (arrow) {
				const sig = params(i, close, declArrow) + esc(arrow);
				out += declArrow ? sig : `<span class="hljs-function">${sig}</span>`;
				declArrow = false;
				i = close + 1 + arrow.length;
				regexOk = true;
				prev = '>';
				continue;
			}
			if (close > 0 && prev === 'function') {
				out += params(i, close);
				i = close + 1;
				regexOk = false;
				prev = ')';
				continue;
			}
		}

		const id = at(IDENT, src, i);
		if (id) {
			const before = prev;
			i += id.length;
			prev = id;
			const keyword =
				(KEYWORDS.has(id) || (ts && TS_KEYWORDS.has(id))) &&
				!(ts && TS_TYPES.has(id)) &&
				!(
					CONTEXTUAL.has(id) &&
					(before === 'const' || before === 'let' || before === 'var')
				);
			if (!full) {
				out += keyword
					? span('keyword', id)
					: LITERALS.has(id)
						? span('literal', id)
						: LANGUAGE_VARS.has(id)
							? span('variable language_', id)
							: BUILT_INS.has(id) || (ts && TS_TYPES.has(id))
								? span('built_in', id)
								: esc(id);
				regexOk = keyword;
				continue;
			}
			const call = at(CALL_AHEAD, src, i) !== null;
			const open = call ? src.indexOf('(', i) : -1;
			const close = call ? closeParen(src, open) : -1;
			const method = close > 0 && at(METHOD_BODY, src, close + 1) !== null;
			const arrow = regexOk ? at(ARROW, src, i) : null;
			const classRef =
				keyword || before === 'function' || (before === '.' && !call)
					? null
					: at(CLASS_REF, src, i - id.length);
			let cls = '';
			if (classRef) {
				out += span('title class_', classRef) + esc(id.slice(classRef.length));
				regexOk = false;
				continue;
			} else if (before === '.') cls = call ? 'title function_' : 'property';
			else if (
				before !== '?' &&
				before !== 'case' &&
				(ts || before === '{' || before === ',' || atLineStart) &&
				at(ts ? TS_KEY_AHEAD : KEY_AHEAD, src, i) !== null
			)
				cls = 'attr';
			else if (
				keyword &&
				!(CONTEXTUAL.has(id) && (method || (call && !declArrow)))
			)
				cls = 'keyword';
			else if (LITERALS.has(id)) cls = 'literal';
			else if (LANGUAGE_VARS.has(id)) cls = 'variable language_';
			else if (before === 'class' || before === 'interface')
				cls = 'title class_';
			else if (before === 'extends' || before === 'implements')
				cls = 'title class_ inherited__';
			else if (before === 'function') cls = 'title function_';
			else if (arrow && before !== 'async') {
				out += declArrow
					? esc(id + arrow)
					: `<span class="hljs-function"><span class="hljs-params">${esc(id)}</span>${esc(arrow)}</span>`;
				i += arrow.length;
				prev = '>';
				declArrow = false;
				regexOk = true;
				continue;
			} else if (
				(before === 'const' || before === 'let' || before === 'var') &&
				at(ARROW_AHEAD, src, i) !== null
			) {
				cls = 'title function_';
				declArrow = true;
			} else if (call && !BUILT_IN_GLOBALS.has(id)) {
				if (method) {
					out += span('title function_', id) + src.slice(i, open);
					out += params(open, close, true);
					i = close + 1;
					regexOk = false;
					prev = ')';
					continue;
				}
				cls = 'title function_';
			} else if (CONSTANT.test(id)) cls = 'variable constant_';
			else if (ts && TS_TYPES.has(id)) cls = 'built_in';
			else if (BUILT_INS.has(id)) cls = 'built_in';
			out += cls ? span(cls, id) : esc(id);
			regexOk = cls === 'keyword';
			continue;
		}

		if (c === '{') depth++;
		else if (c === '}') {
			if (depth === 0 && inBraces) return [out, i];
			depth--;
		}
		out += esc(c);
		regexOk = c !== ')' && c !== ']' && c !== '}';
		prev = c;
		i++;
	}
	return [out, i];
}
