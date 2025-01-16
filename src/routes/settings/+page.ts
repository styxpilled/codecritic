import type { Profile } from '$lib/types';
import type { PageLoad } from './$types';
import { fetchOr } from '$lib';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ fetch, parent }) => {
	const data = await parent();
	if (!data.auth.user) {
		throw redirect(303, '/login/github');
	}
	const profile = await fetchOr<Profile>(
		`/api/users/${data.auth.user.id}/profile`,
		undefined,
		fetch
	);
	return { profile };
};
