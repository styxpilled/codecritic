import { fetchOr } from '$lib';
import type { Review } from '$lib/types.js';
import type { User } from 'lucia';

export const load = async ({ params, fetch }) => {
	const user = await fetchOr<User>(`/api/user/username/${params.username}`, undefined, fetch);
	const reviews = await fetchOr<Review[]>(
		`/api/user/username/${params.username}/reviews`,
		[],
		fetch
	);

	return { user, reviews };
};
