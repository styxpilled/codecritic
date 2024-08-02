import type { RequestHandler } from './$types';
import { ok, unauthorized } from '$lib/server';
import { stackSalt } from '$lib/server/database';
import { parseIntSafe } from '$lib';

export const GET: RequestHandler = async ({ locals, url }) => {
	const limit = Math.min(parseIntSafe(url.searchParams.get('limit'), 5), 25);
	const offset = parseIntSafe(url.searchParams.get('offset'), 0);

	const stacks = await locals.sql`
    SELECT 
      stacks.*,
      extensions.id_encode(stacks.id, ${stackSalt}, 4) id,
      COUNT(stacks_packages) packages,
      row_to_json(users.*) author
    FROM stacks
      LEFT JOIN users
        ON stacks.author = users.id
      LEFT JOIN stacks_packages
        ON stacks.id = stacks_packages.stack_id
    GROUP BY stacks.id, users.id
    ORDER BY stacks.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

	return ok(stacks);
};

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) throw unauthorized();
	const userID = locals.user.id;
	const body = await request.json();

	const [stack] = await locals.sql`
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
