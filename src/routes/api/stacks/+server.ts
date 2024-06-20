import type { RequestHandler } from './$types';
import { ok, unauthorized } from '$lib/server';
import { sql } from '$lib/server/database';

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) throw unauthorized();
	const userID = locals.user.id;
	const body = await request.json();

	const [stack] = await sql`
    INSERT INTO stacks
      (author, name,
      created_at, updated_at,
      description)
    VALUES
      (${userID}, ${body.name},
      ${new Date().toLocaleString('en-US')},
      ${new Date().toLocaleString('en-US')},
      ${body.description})
    ON CONFLICT DO NOTHING
    RETURNING *
  `;

	return ok(stack);
};
