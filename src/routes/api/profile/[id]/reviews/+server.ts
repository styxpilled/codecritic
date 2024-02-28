import { ok } from '$lib/server/index.js';

export const GET = async ({ locals: { supabase }, params }) => {
	const { data: reviews } = await supabase.from('reviews').select('*').eq('author', params.id);

	return ok(reviews);
};
