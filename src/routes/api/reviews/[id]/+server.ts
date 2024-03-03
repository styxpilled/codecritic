import { ok } from '$lib/server';
import { sql } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const [review] = await sql`
    SELECT * FROM reviews
      WHERE id = ${params.id}
  `;

	return ok(review);
};
