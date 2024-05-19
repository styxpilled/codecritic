import { fetchOr } from '$lib';
import type { User } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, fetch, params }) => {
	const data = await parent();
	const offset = params?.page ? `?offset=${params.page}` : '';
	const followers = await fetchOr<User[]>(
		`/api/users/${data.user.id}/followers${offset}`,
		[],
		fetch
	);

	return { ...data, followers };
};
