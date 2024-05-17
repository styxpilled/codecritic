import type { RequestHandler } from './$types';
import { notFound, ok } from '$lib/server';
import { sql } from '$lib/server/database';

export const GET: RequestHandler = async ({ params }) => {
	const [user] = await sql`
    SELECT * FROM users
      WHERE username = ${params.name}
  `;
	if (!user) throw notFound();

	return ok(user);
};
