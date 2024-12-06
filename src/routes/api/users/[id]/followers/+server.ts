import { badRequest, ok, unauthorized } from '$lib/server';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params, url }) => {
	// const cursor = url.searchParams.get('cursor');
	const offset = JSON.parse(url.searchParams.get('offset') || '0');
	const limit = JSON.parse(url.searchParams.get('limit') || '25');
	const followers = await locals.sql`
    SELECT users.* FROM
      users
    LEFT JOIN users_follows
      ON users_follows.user_id = users.id
    WHERE
      users_follows.following = ${params.id}
      -- Use this if we switch to cursor-based pagination
      -- AND CASE
      --   WHEN {cursor}::text IS NULL THEN true
      --   ELSE users.id > {cursor}::text
      -- END
    ORDER BY users.username
    OFFSET ${offset}
    LIMIT ${limit}
  `;

	return ok(followers);
};

export const POST: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (user === null) throw unauthorized();
	if (user.id.toString() === params.id) throw badRequest();
	await locals.sql`
    INSERT INTO users_follows
      (user_id, following)
    VALUES
      (${user.id}, ${params.id})
    ON CONFLICT DO NOTHING
  `;

	return ok();
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (user === null) throw unauthorized();
	if (user.id.toString() === params.id) throw badRequest();
	await locals.sql`
    DELETE FROM
      users_follows
    WHERE 
      user_id = ${user.id}
      AND following = ${params.id}
  `;

	return ok();
};
