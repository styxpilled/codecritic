import { fetchOr } from '$lib';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const pkg = await fetchOr(`https://registry.npmjs.org/${params.package}`, undefined, fetch);

	return { package: pkg };
};
