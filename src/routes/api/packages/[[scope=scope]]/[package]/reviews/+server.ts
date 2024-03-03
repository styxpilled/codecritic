import { ok, serverError, unauthorized } from '$lib/server';
import { sql } from '$lib/server/database';
import type { Review } from '$lib/types';
import type { RequestHandler } from './$types';

// TODO: code duplication
export const GET: RequestHandler = async ({ params }) => {
	const packageName = params.scope ? `${params.scope}/${params.package}` : params.package;
	const review = (await sql`
    SELECT * FROM reviews
      WHERE package = ${packageName}
  `) as Review[];

	return ok(review);
};

export const POST: RequestHandler = async ({ request, locals, params }) => {
	if (!locals.user) throw unauthorized();
	const packageName = params.scope ? `${params.scope}/${params.package}` : params.package;
	try {
		const r: Review = await request.json();
		r.id = crypto.randomUUID();
		r.author = locals.user.id;
		r.package = packageName;
		r.created_at = new Date().toLocaleString('en-US');
		const [review] = (await sql`
      INSERT INTO reviews
        (id, author, package, created_at, version, review, rating)
      VALUES
        (${r.id}, ${r.author}, ${r.package}, ${r.created_at}, ${r.version}, ${r.review}, ${r.rating})
      RETURNING *
    `) as [Review];
		return ok(review);
	} catch (e) {
		console.log(e);
		throw serverError();
	}
};
