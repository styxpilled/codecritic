import { fetchOr } from '$lib';
import type { User } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const users = await fetchOr<User[]>(`/api/users`, [], fetch);

	return { users };
};
