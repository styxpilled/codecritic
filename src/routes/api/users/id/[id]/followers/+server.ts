import { badRequest, ok, unauthorized } from '$lib/server';
import { sql } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const followers = await sql`
    SELECT users.* FROM
      users
    LEFT JOIN users_follows
      ON users_follows.following = users.id
    WHERE
      users_follows.following = ${params.id}
  `;

	console.log(followers);

	return ok(followers);
};

export const POST: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (user === null) throw unauthorized();
	if (user.id === params.id) throw badRequest();
	await sql`
    INSERT INTO users_follows
      (user_id, following)
    VALUES
      (${user.id}, ${params.id})
  `;

	return ok();
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (user === null) throw unauthorized();
	if (user.id === params.id) throw badRequest();
	await sql`
    DELETE FROM
      users_follows
    WHERE 
      user_id = ${user.id}
      AND following = ${params.id}
  `;

	return ok();
};
