import { fetchOr } from '$lib';
import type { Database } from '$lib/server/database.types.js';

export const load = async ({ params, fetch }) => {
	const reviews = await fetchOr<Database['public']['Tables']['reviews']['Row'][]>(
		`/api/profile/${params.id}/reviews`,
		[],
		fetch
	);

	return { reviews };
};
