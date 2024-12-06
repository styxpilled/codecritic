import type { Package, Review } from '$lib/types';
import type { PageLoad } from './$types';
import { fetchOr } from '$lib';

export const load: PageLoad = async ({ data, fetch }) => {
	const [packages, reviews, mutualReviews] = await Promise.all([
		fetchOr<Package[]>(`/api/packages?limit=9`, [], fetch),
		fetchOr<Review[]>(`/api/reviews`, [], fetch),
		fetchOr<Review[]>(`/api/recommended/reviews/mutuals?limit=6`, [], fetch)
	]);

	// const [packages, reviews, mutualReviews] = [[], [], []];

	return { packages, reviews, mutualReviews, ...data };
};
