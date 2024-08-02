import { ok } from '$lib/server';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params, url }) => {
	// const cursor = url.searchParams.get('cursor');
	const offset = JSON.parse(url.searchParams.get('offset') || '0');
	const limit = JSON.parse(url.searchParams.get('limit') || '25');
	const following = await locals.sql`
    SELECT users.* FROM
      users
    LEFT JOIN users_follows
      ON users_follows.following = users.id
    WHERE
      users_follows.user_id = ${params.id}
      -- Use this if we switch to cursor-based pagination
      -- AND CASE
      --   WHEN {cursor}::text IS NULL THEN true
      --   ELSE users.id > {cursor}::text
      -- END
    ORDER BY users.username
    OFFSET ${offset}
    LIMIT ${limit}
  `;

	return ok(following);
};
