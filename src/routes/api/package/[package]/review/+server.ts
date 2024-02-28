import { ok, serverError, unauthorized } from '$lib/server';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase }, params }) => {
	const res = await supabase.from('reviews').select('*').eq('package', params.package);
	if (res.error) throw serverError();

	return ok(res.data);
};

export const POST: RequestHandler = async ({ request, locals: { supabase, getUser }, params }) => {
	const body = await request.json();
	const user = await getUser();
	if (user === null) throw unauthorized();

	const res = await supabase.from('reviews').insert({
		package: params.package,
		review: body.review,
		author: user.id,
		version: body.version,
		created_at: new Date().toLocaleString('en-US')
	});

	console.log(res);

	return ok(res.data);
};
