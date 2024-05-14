import type { PageLoad } from './$types';
import type { Package, Review } from '$lib/types';
import { fetchOr } from '$lib';

export const load: PageLoad = async ({ fetch }) => {
	const packages = await fetchOr<Package[]>(`/api/packages`, [], fetch);
	const reviews = await fetchOr<Review[]>(`/api/reviews`, [], fetch);

	return { packages, reviews };
};
