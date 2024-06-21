import { parseIntSafe } from '$lib';
import { ok } from '$lib/server';
import { stackSalt, sql } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
	const limit = Math.min(parseIntSafe(url.searchParams.get('limit'), 5), 25);
	const offset = parseIntSafe(url.searchParams.get('offset'), 0);

	const stacks = await sql`
    SELECT 
      stacks.*,
      extensions.id_encode(id, ${stackSalt}, 4) id
    FROM stacks
      WHERE author = ${params.id}
    ORDER BY stacks.name
    LIMIT ${limit} OFFSET ${offset}
  `;

	return ok(stacks || []);
};
