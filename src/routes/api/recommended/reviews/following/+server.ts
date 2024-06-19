import { sql } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	sql`
    SELECT 
      reviews.*
    FROM reviews
      INNER JOIN users_follows 
        ON reviews.author = users_follows.following
    WHERE user_id = 'r2ryp9glqp7g7ym'
;`;

	return new Response();
};
