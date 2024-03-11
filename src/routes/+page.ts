import type { Package, Review } from '$lib/types';
import type { PageLoad } from './$types';
import { fetchOr } from '$lib';

export const load: PageLoad = async ({ data, fetch }) => {
	const packages = await fetchOr<Package[]>(`/api/packages?limit=9`, [], fetch);
	const reviews = await fetchOr<Review[]>(`/api/reviews`, [], fetch);

	return { packages, reviews, ...data };
};
