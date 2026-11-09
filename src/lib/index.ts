export const $fetch = async <T>(
	url: URL | RequestInfo,
	fallback?: T | null,
	fetchFn = fetch,
	init?: RequestInit
): Promise<T | null> => {
	try {
		const r = await fetchFn(url, init);
		if (!r.ok) {
			console.error(r.status, r.statusText, await r.json());
			if (fallback === undefined) {
				throw new Error(`Bad request to ${url}: ${r.status}, ${r.statusText}`);
			}
			return fallback;
		}
		return r.json();
	} catch (e) {
		if (fallback === undefined) throw e;
		return fallback;
	}
};

export const toPackageName = (params: { scope?: string; package: string }) => {
	return params.scope ? `${params.scope}/${params.package}` : params.package;
};

export const optSubpath = (v: unknown) => {
	return v ? `${v}/` : '';
};

export const stripGit = (url: string | null) => {
	if (url === null) return '';
	const plusGit = url.startsWith('git+');
	const dotGit = url.endsWith('.git');
	return url.substring(plusGit ? 4 : 0, dotGit ? url.length - 4 : url.length);
};

const GITHUB_REPO =
	/^(?:git\+)?(?:(?:https?|git|ssh):\/\/)?(?:[^@/]+@)?(?:www\.)?github\.com[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:[/#?]|$)/i;
const GITHUB_SHORTHAND = /^github:([\w.-]+)\/([\w.-]+?)(?:\.git)?$/i;

/** Returns `owner/repo` for GitHub repository URLs, else null. */
export const githubRepo = (url: string | null) => {
	if (!url) return null;
	const m = url.match(GITHUB_REPO) ?? url.match(GITHUB_SHORTHAND);
	if (!m || [m[1], m[2]].some((s) => /^\.+$/.test(s))) return null;
	return `${m[1]}/${m[2]}`;
};

export const COLORS = [
	'red',
	'orange',
	'yellow',
	'green',
	'cyan',
	'blue',
	'purple',
];

/** A stable color from the rotation for a name. */
export const hashColor = (value: string) =>
	COLORS[
		[...value].reduce((sum, c) => sum + c.charCodeAt(0), 0) % COLORS.length
	];

export const normalizeName = (input: string) => {
	return (
		input
			.normalize('NFD')
			.toLowerCase()
			// leave only digits and lowercase ascii
			.replaceAll(/[^\x30-\x39\x61-\x7A]+/g, '-')
			// trim dashes
			.replaceAll(/^-+|-+$/g, '')
	);
};
