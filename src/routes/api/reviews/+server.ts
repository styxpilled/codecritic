import { parseIntSafe } from '$lib';
import { ok } from '$lib/server';
import { sql } from '$lib/server/database';
import type { Review } from '$lib/types';

export const GET = async ({ locals, url }) => {
	const limit = Math.min(parseIntSafe(url.searchParams.get('limit'), 5), 25);
	const offset = parseIntSafe(url.searchParams.get('offset'), 0);

	const userID = locals.user?.id || '';

	const reviews = (await sql`
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
	  GROUP BY reviews.id, users.*, user_id, review_id
	  ORDER BY COUNT(review_id) DESC
    LIMIT ${limit} OFFSET ${offset}
  `) as Review[];

	return ok(reviews);
};
