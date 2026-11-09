/** Short-lived JSON values in the Workers Cache API (one copy per data center). */
const store = () =>
	(globalThis.caches as (CacheStorage & { default?: Cache }) | undefined)
		?.default;

/** The cached value for `key`, or the result of `load`, cached for `ttl` seconds. */
export const cached = async <T>(
	key: string,
	ttl: number,
	load: () => Promise<T>
): Promise<T> => {
	const cache = store();
	const req = new Request(
		`https://cache.codecritic/${encodeURIComponent(key)}`
	);
	const hit = await cache?.match(req);
	if (hit) return hit.json<T>();
	const value = await load();
	await cache?.put(
		req,
		new Response(JSON.stringify(value), {
			headers: { 'Cache-Control': `max-age=${ttl}` },
		})
	);
	return value;
};
