import type { Package } from '$lib/types';
import { fetchOr } from '$lib';

export const load = async ({ fetch }) => {
	const packages = await fetchOr<Package[]>(`/api/packages`, [], fetch);

	return { packages };
};
