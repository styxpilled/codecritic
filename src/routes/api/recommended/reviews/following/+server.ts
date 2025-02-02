import { reviewSalt } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	locals.sql`
    SELECT 
      reviews.*,
      extensions.id_encode(reviews.id, ${reviewSalt}, 4) id,
    FROM reviews
      INNER JOIN users_follows 
        ON reviews.author = users_follows.following
    WHERE user_id = 'r2ryp9glqp7g7ym'
;`;

	return new Response();
};
