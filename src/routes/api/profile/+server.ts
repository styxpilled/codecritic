import { ok, serverError, unauthorized } from '$lib/server/index.js';

export const POST = async ({ locals: { supabase, getSession } }) => {
	const session = await getSession();
	if (session === null) throw unauthorized();

	const res = await supabase.from('profiles').insert({
		username: '',
		id: session.user.id,
		nickname: 'TODO',
		bio: ''
	});

	if (res.error === null) return ok();
	else throw serverError();
};
