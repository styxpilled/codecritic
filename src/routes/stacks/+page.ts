import { fetchOr } from '$lib';
import type { Stack } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const [stacks] = await Promise.all([
		fetchOr<Stack[]>(`/api/stacks?limit=9`, [], fetch)
		// fetchOr<Stack[]>(`/api/recommended/reviews/mutuals?limit=6`, [], fetch)
	]);

	return { stacks };
};
