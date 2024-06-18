import type { PageLoad } from './$types';
import type { Package, Review, User } from '$lib/types';
import { fetchOr } from '$lib';

export const load: PageLoad = async ({ fetch }) => {
	const packages = await fetchOr<Package[]>(`/api/packages`, [], fetch);
	const reviews = await fetchOr<Review[]>(`/api/reviews`, [], fetch);
	const reviewers = await fetchOr<(User & { likes: number; reviews: number })[]>(
		`/api/users`,
		[],
		fetch
	);

	return { packages, reviews, reviewers };
};
