import { parseIntSafe } from '$lib';
import { ok } from '$lib/server';
import type { Review } from '$lib/types';

export const GET = async ({ locals, url }) => {
	const limit = Math.min(parseIntSafe(url.searchParams.get('limit'), 5), 25);
	const offset = parseIntSafe(url.searchParams.get('offset'), 0);

	const reviews = (await locals.sql`
    SELECT
      users.*,
      COUNT(likes_reviews.user_id)::integer likes,
  	  COUNT(DISTINCT reviews.id) reviews
    FROM reviews
      LEFT JOIN users
        ON users.id = reviews.author
      LEFT JOIN likes_reviews
        ON reviews.id = review_id
	  GROUP BY users.id
	  ORDER BY likes DESC
    LIMIT ${limit} OFFSET ${offset}
  `) as Review[];

	return ok(reviews);
};
