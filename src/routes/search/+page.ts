import { fetchOr } from '$lib';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch }) => {
	const searchResult = await fetchOr(`/api/search${url.search}`, [], fetch);
	return { searchResult, query: url.searchParams.get('text') };
};
