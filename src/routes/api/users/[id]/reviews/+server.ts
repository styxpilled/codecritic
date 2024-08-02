import type { Review } from '$lib/types';
import type { RequestHandler } from './$types';
import { ok } from '$lib/server';
import { reviewSalt } from '$lib/server/database';

export const GET: RequestHandler = async ({ locals, params, url }) => {
	const userID = locals.user?.id || '';
	const order = url.searchParams.get('order') || 'date';
	const reviews = (await locals.sql`
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
      WHERE users.id = ${params.id}
    GROUP BY reviews.id, users.*
    ORDER BY
      CASE WHEN ${order} = 'date'
        THEN created_at END DESC,
      CASE WHEN ${order} = 'likes'
        THEN COUNT(review_id)::integer END DESC,
      COUNT(review_id)::integer DESC 
  `) as Review[];

	return ok(reviews);
};
