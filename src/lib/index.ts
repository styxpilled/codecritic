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

export const getPackage = (params: { scope?: string; package: string }) => {
	return params.scope ? `${params.scope}/${params.package}` : params.package;
};

export const parseIntSafe = (
	input: string | undefined | null,
	fallback: number,
	radix?: number
): number => {
	if (input === undefined || input === null) return fallback;
	const maybeNumber = parseInt(input, radix);
	if (isNaN(maybeNumber)) return fallback;
	else return maybeNumber;
};
