import type { LayoutLoad } from './$types';
import type { Profile, User } from '$lib/types';
import { fetchOr } from '$lib';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params, fetch }) => {
	const _user = await fetchOr<User>(`/api/username/${params.username}`, undefined, fetch);
	if (!_user) throw error(404);
	const user = await fetchOr<
		User & {
			following: number;
			followers: number;
			follows_user: boolean;
			user_follows: boolean;
			reviews: number;
		}
	>(`/api/users/${_user.id}`, undefined, fetch);
	const profile = await fetchOr<Profile>(`/api/users/${_user.id}/profile`, undefined, fetch);

	return { user, profile };
};
