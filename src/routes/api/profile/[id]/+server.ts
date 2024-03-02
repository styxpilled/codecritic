import { notFound, ok } from '$lib/server';
import { sql } from '$lib/server/database.ts';
import type { User } from '$lib/types.ts';

export const GET = async ({ params }) => {
	const [user]: [User?] = await sql`
    SELECT * FROM users
      WHERE username = ${params.id}
  `;

	if (!user) throw notFound();

	return ok(user);
};
