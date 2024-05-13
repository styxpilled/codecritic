import type { Review, User } from '$lib/types';
import { fetchOr } from '$lib';

export const load = async ({ params, fetch }) => {
	const user = await fetchOr<
		User & {
			following: string;
			followers: string;
			follows_user: boolean;
			user_follows: boolean;
			reviews: number;
		}
	>(`/api/users/username/${params.username}`, undefined, fetch);
	const reviews = await fetchOr<Review[]>(
		`/api/users/username/${params.username}/reviews`,
		[],
		fetch
	);

	return { user, reviews };
};
