import type { Review } from '$lib/types';
import type { PageLoad } from './$types';
import { fetchOr } from '$lib';

export const load: PageLoad = async ({ fetch, parent }) => {
	const data = await parent();
	const reviews = await fetchOr<Review[]>(`/api/users/${data.user.id}/reviews`, [], fetch);

	return { ...data, reviews };
};
