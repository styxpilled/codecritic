import { ok, serverError, unauthorized } from '$lib/server';
import { $s, sql } from '$lib/server/database';
import type { Review } from '$lib/types';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const review: Review[] = await sql()`
    SELECT * FROM reviews
      WHERE package = ${params.package}
  `;

	return ok(review);
};

export const POST: RequestHandler = async ({ request, locals, params }) => {
	if (!locals.user) throw unauthorized();
	try {
		const body: Review = await request.json();
		body.id = crypto.randomUUID();
		body.author = locals.user.id;
		body.package = params.package;
		body.created_at = new Date().toLocaleString('en-US');
		const [review]: [Review] = await sql()`
      INSERT INTO reviews
        ${$s(body)}
      RETURNING *
    `;
		return ok(review);
	} catch (e) {
		console.log(e);
		throw serverError();
	}
};
