import { fetchOr } from '$lib';
import type { Review } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const review = await fetchOr<Review>(`/api/reviews/${params.id}`, undefined, fetch);

	return { review };
};
