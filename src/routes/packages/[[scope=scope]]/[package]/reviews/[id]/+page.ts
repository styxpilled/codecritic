import { fetchOr, getPackage } from '$lib';
import type { Package, Review } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const packageName = getPackage(params);
	const [pkg, review] = await Promise.all([
		fetchOr<Package>(`/api/package/${packageName}`, undefined, fetch),
		fetchOr<Review>(`/api/reviews/${params.id}`, undefined, fetch)
	]);

	return { review, pkg };
};
