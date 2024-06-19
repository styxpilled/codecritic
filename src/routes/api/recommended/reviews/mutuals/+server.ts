import { parseIntSafe } from '$lib';
import { ok, unauthorized } from '$lib/server';
import { sql } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) throw unauthorized();

	const userID = locals.user.id;
	const limit = Math.min(parseIntSafe(url.searchParams.get('limit'), 5), 25);
	const offset = parseIntSafe(url.searchParams.get('offset'), 0);

	const reviews = await sql`
    SELECT 
      reviews.*,
      ${userID} = ANY(ARRAY_AGG(likes_reviews.user_id)) liked,
      COUNT(DISTINCT likes_reviews.user_id)::integer likes,
      row_to_json(users.*) author
    FROM users
      INNER JOIN reviews
        ON users.id = reviews.author
      INNER JOIN users_follows 
        ON reviews.author = users_follows.following
      INNER JOIN users_follows AS following
        ON users.id = following.user_id
      LEFT JOIN likes_reviews
        ON reviews.id = review_id
    WHERE users_follows.user_id = ${userID}
      AND following.following = ${userID}
    GROUP BY reviews.id, users.id
    ORDER BY reviews.created_at
    LIMIT ${limit} OFFSET ${offset}
  `;

	return ok(reviews);
};
