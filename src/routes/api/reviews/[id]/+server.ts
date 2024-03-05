import { ok } from '$lib/server';
import { sql } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params }) => {
	const userID = locals.user?.id || '';

	const [review] = await sql`
    SELECT
      reviews.*,
      (user_id = ${userID} AND user_id IS NOT NULL) liked,
      row_to_json (users.*) author,
      COUNT(review_id)::integer likes
    FROM reviews
      LEFT JOIN users
        ON users.id = reviews.author
      LEFT JOIN likes_reviews
        ON reviews.id = review_id
      WHERE reviews.id = ${params.id}
    GROUP BY reviews.id, users.*, user_id, review_id
  `;

	return ok(review);
};
