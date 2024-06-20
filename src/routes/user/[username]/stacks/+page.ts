import { fetchOr } from '$lib';
import type { Stack } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
	const data = await parent();

	const stacks = await fetchOr<Stack[]>(`/api/users/${data.user.id}/stacks`, [], fetch);

	return { stacks, ...data };
};
