import { fetchOr } from '$lib';
import type { Review } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const pkg: any = await fetchOr(`https://registry.npmjs.org/${params.package}`, undefined, fetch);
	const reviews = await fetchOr<Review[]>(`/api/package/${params.package}/review`, [], fetch);
	return { package: pkg, reviews };
};
