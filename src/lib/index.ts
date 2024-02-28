export const fetchOr = async <T>(
	url: URL | RequestInfo,
	fallback?: T,
	fetchFn = fetch,
	init?: RequestInit
): Promise<T> => {
	try {
		return await fetchFn(url, init).then((v) => (v.ok ? v.json() : fallback));
	} catch (e) {
		if (fallback === undefined) throw e;
		return fallback;
	}
};
