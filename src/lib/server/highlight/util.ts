/** Scanner output: the HTML and the index after the last consumed character. */
export type Result = [html: string, end: number];

const ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#x27;',
};

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);

export const span = (cls: string, text: string) =>
	`<span class="hljs-${cls}">${esc(text)}</span>`;

/** Runs a sticky regex at `i` and returns the match, or null. */
export const at = (re: RegExp, s: string, i: number) => {
	re.lastIndex = i;
	return re.exec(s)?.[0] ?? null;
};

/** Per-source cache. Holds a few sources: the block and nested slices. */
export function perSource<T>(make: (src: string) => T) {
	const cache = new Map<string, T>();
	return (src: string) => {
		let v = cache.get(src);
		if (v === undefined) {
			if (cache.size >= 8) cache.clear();
			v = make(src);
			cache.set(src, v);
		}
		return v;
	};
}

export const words = (s: string) => new Set(s.split(' '));

export const isSpace = (c: string) =>
	c === ' ' || c === '\n' || c === '\t' || c === '\r';

/** Index after the quoted string that starts at `i`. Stops at a newline. */
export const quoted = (s: string, i: number) => {
	const q = s[i];
	let j = i + 1;
	while (j < s.length && s[j] !== q && s[j] !== '\n')
		j += s[j] === '\\' ? 2 : 1;
	return Math.min(j + 1, s.length);
};
