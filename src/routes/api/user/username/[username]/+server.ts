import { notFound, ok } from '$lib/server';
import { sql } from '$lib/server/database';
import type { User } from 'lucia';

export const GET = async ({ params }) => {
	const [user] = (await sql`SELECT * FROM users
      WHERE username = ${params.username}
  `) as [User?];
	if (!user) throw notFound();

	return ok(user);
};
