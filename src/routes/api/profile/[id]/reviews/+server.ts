import { ok } from '$lib/server/index.ts';

export const GET = async ({ locals: { supabase }, params }) => {
	const { data: reviews } = await supabase.from('reviews').select('*').eq('author', params.id);

	return ok(reviews);
};
