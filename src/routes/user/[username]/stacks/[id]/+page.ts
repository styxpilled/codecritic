import { fetchOr } from '$lib';
import type { Package, Stack } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const stack = await fetchOr<Stack & { packages: Package[] }>(
		`/api/stacks/${params.id}`,
		undefined,
		fetch
	);

	return { stack };
};
