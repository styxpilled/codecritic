import { parseIntSafe } from '$lib';
import { ok } from '$lib/server';
import { reviewSalt, sql } from '$lib/server/database';
import type { Review } from '$lib/types';

export const GET = async ({ locals, url }) => {
	const limit = Math.min(parseIntSafe(url.searchParams.get('limit'), 5), 25);
	const offset = parseIntSafe(url.searchParams.get('offset'), 0);

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
	  GROUP BY reviews.id, users.*
	  ORDER BY COUNT(review_id) DESC
    LIMIT ${limit} OFFSET ${offset}
  `) as Review[];

	return ok(reviews);
};
