import { getPackage } from '$lib';
import { ok, serverError, unauthorized } from '$lib/server';
import { reviewSalt, sql } from '$lib/server/database';
import type { Review } from '$lib/types';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params }) => {
	const packageName = params.scope ? `${params.scope}/${params.package}` : params.package;
	const userID = locals.user?.id || '';
	const reviews = (await sql`
  SELECT
      reviews.*,
      extensions.id_encode(reviews.id, ${reviewSalt}, 4) id,
      ${userID} = ANY(ARRAY_AGG(likes_reviews.user_id)) liked,
      row_to_json (users.*) author,
      COUNT(DISTINCT likes_reviews.user_id)::integer likes
    FROM reviews
      LEFT JOIN users
        ON users.id = reviews.author
      LEFT JOIN likes_reviews
        ON reviews.id = review_id
      WHERE package = ${packageName}
    GROUP BY reviews.id, users.*
  `) as Review[];

	return ok(reviews);
};

export const POST: RequestHandler = async ({ request, locals, params }) => {
	if (!locals.user) throw unauthorized();
	try {
		const r: Review = await request.json();
		const author = locals.user.id;
		r.package = getPackage(params);
		r.created_at = new Date().toLocaleString('en-US');
		r.rating = Number.isInteger(r.rating) ? r.rating : 0;
		r.rating = Math.min(Math.max(r.rating, 1), 10);
		await sql`
      INSERT INTO reviews
        (author, package, created_at, version, review, rating)
      VALUES
        (${author}, ${r.package}, ${r.created_at}, ${r.version}, ${r.review}, ${r.rating})
    `;
		return ok();
	} catch (e) {
		console.log(e);
		throw serverError();
	}
};
