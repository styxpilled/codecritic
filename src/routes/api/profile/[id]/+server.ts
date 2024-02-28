import { ok } from '$lib/server';

export const GET = async ({ locals: { supabase }, params }) => {
	const profile = await supabase.from('profiles').select('*').eq('id', params.id).single();
	return ok(profile.data);
};
