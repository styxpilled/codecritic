export const $fetch = async <T>(
	url: URL | RequestInfo,
	fallback?: T | null,
	fetchFn = fetch,
	init?: RequestInit
): Promise<T | null> => {
	try {
		const r = await fetchFn(url, init);
		if (!r.ok) {
			console.error(r.status, r.statusText);
			if (fallback === undefined) {
				throw new Error(`Bad request to ${url}: ${r.status}, ${r.statusText}`);
			}
			return fallback;
		}
		return r.json();
	} catch (e) {
		console.log(e);

		if (fallback === undefined) throw e;
		return fallback;
	}
};

export const toPackageName = (params: { scope?: string; package: string }) => {
	return params.scope ? `${params.scope}/${params.package}` : params.package;
};

export const stripGit = (url: string) => {
	if (url === null) return '';
	const plusGit = url.startsWith('git+');
	const dotGit = url.endsWith('.git');
	return url.substring(plusGit ? 4 : 0, dotGit ? url.length - 4 : url.length);
};
