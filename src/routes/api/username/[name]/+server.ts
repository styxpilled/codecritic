import type { RequestHandler } from './$types';
import { notFound, ok } from '$lib/server';

export const GET: RequestHandler = async ({ locals, params }) => {
	const [user] = await locals.sql`
    SELECT * FROM users
      WHERE username = ${params.name}
  `;
	if (!user) throw notFound();

	return ok(user);
};
