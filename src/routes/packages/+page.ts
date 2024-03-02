import { fetchOr } from '$lib';

export const load = async ({ fetch }) => {
	const packages = await fetchOr(`/api/packages`, [], fetch);

	return { packages };
};
