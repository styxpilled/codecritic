import type { PageLoad } from './$types';
import type { Package, Review, User } from '$lib/types';
import { fetchOr } from '$lib';

export const load: PageLoad = async ({ fetch }) => {
	const [packages, reviews, reviewers] = await Promise.all([
		fetchOr<Package[]>(`/api/packages?limit=9`, [], fetch),
		fetchOr<Review[]>(`/api/reviews`, [], fetch),
		fetchOr<(User & { likes: number; reviews: number })[]>(`/api/users`, [], fetch)
	]);

	return { packages, reviews, reviewers };
};
