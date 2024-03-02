import { ok } from '$lib/server';
import { sql } from '$lib/server/database';
import type { Review } from '$lib/types';

export const GET = async ({ params }) => {
	const reviews: Review[] = await sql`
    SELECT * FROM reviews
      LEFT JOIN users
        ON reviews.author = users.id
      WHERE users.username = ${params.username}
  `;

	return ok(reviews);
};
