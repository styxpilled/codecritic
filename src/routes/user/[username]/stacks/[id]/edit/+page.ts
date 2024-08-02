import { fetchOr } from '$lib';
import type { Stack } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const stack = await fetchOr<Stack>(`/api/stacks/${params.id}/`, undefined, fetch);

	return { stack };
};
