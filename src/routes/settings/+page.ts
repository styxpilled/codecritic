import type { Profile } from '$lib/types';
import type { PageLoad } from './$types';
import { fetchOr } from '$lib';

export const load: PageLoad = async ({ fetch, parent }) => {
	const data = await parent();
	const profile = await fetchOr<Profile>(
		`/api/users/id/${data.auth.user.id}/profile`,
		undefined,
		fetch
	);
	return { profile };
};
